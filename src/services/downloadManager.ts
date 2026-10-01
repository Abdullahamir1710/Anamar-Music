import { Track, DownloadedItem } from '../types/music';
import { storageService } from './storage';
import { resolveClientFullAudioStream, CLIENT_FULL_AUDIO_MAP } from './fullAudioStreams';

export type DownloadListener = (downloads: DownloadedItem[]) => void;

class DownloadManager {
  private activeDownloads: Map<string, DownloadedItem> = new Map();
  private listeners: Set<DownloadListener> = new Set();

  constructor() {
    this.loadPersistedDownloads();
  }

  private async loadPersistedDownloads() {
    const list = await storageService.getDownloads();
    list.forEach((item) => {
      this.activeDownloads.set(item.id, item);
    });
    this.notifyListeners();
  }

  public getDownloads(): DownloadedItem[] {
    return Array.from(this.activeDownloads.values()).sort(
      (a, b) => b.downloadedAt - a.downloadedAt
    );
  }

  public sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*]/g, '').trim();
  }

  public getFormattedFileName(track: Track): string {
    const safeArtist = this.sanitizeFilename(track.artist || 'Unknown Artist');
    const safeTitle = this.sanitizeFilename(track.title || 'Untitled');
    return `${safeArtist} - ${safeTitle}.mp3`;
  }

  /**
   * Resolves the real, full-length audio media URL for download.
   * Decodes proxy wrappers and replaces 30-sec previews with authentic full recordings.
   */
  public async resolveAudioDownloadUrl(track: Track): Promise<string> {
    let candidate = track.downloadUrl || track.streamUrl || '';

    // 1. Decode proxy parameters if present
    if (candidate.includes('url=')) {
      try {
        const decoded = decodeURIComponent(candidate.split('url=')[1].split('&')[0]);
        if (decoded && (decoded.startsWith('http://') || decoded.startsWith('https://'))) {
          candidate = decoded;
        }
      } catch {
        // ignore
      }
    }

    // 2. Check curated master catalog for full recording
    const normTitle = (track.title || '').toLowerCase().trim();
    const matched = CLIENT_FULL_AUDIO_MAP[normTitle] ||
      Object.entries(CLIENT_FULL_AUDIO_MAP).find(([key]) =>
        `${normTitle} ${(track.artist || '').toLowerCase()}`.includes(key)
      )?.[1];

    if (matched) {
      return matched;
    }

    // 3. If candidate is empty or points to unavailable backend api route or is an Apple preview
    const isPreview = candidate.includes('apple.com') || candidate.includes('preview');
    if (!candidate || candidate.startsWith('/api/') || isPreview) {
      const fullUrl = await resolveClientFullAudioStream(track.title, track.artist, candidate);
      if (fullUrl && fullUrl.startsWith('http')) {
        return fullUrl;
      }
    }

    return candidate;
  }

  public async startDownload(track: Track): Promise<boolean> {
    const downloadId = track.id;
    const fileName = this.getFormattedFileName(track);

    const item: DownloadedItem = {
      id: downloadId,
      track,
      downloadedAt: Date.now(),
      fileSize: track.fileSize || 0,
      status: 'downloading',
      progress: 0,
    };

    this.activeDownloads.set(downloadId, item);
    this.notifyListeners();

    try {
      const directUrl = await this.resolveAudioDownloadUrl(track);
      if (!directUrl || !directUrl.startsWith('http')) {
        throw new Error('Could not resolve valid audio source URL');
      }

      // Try fetching real audio file with progress tracking
      let response: Response | null = null;
      try {
        response = await fetch(directUrl);
      } catch (networkErr) {
        console.warn('Direct fetch failed, trying full master fallback:', networkErr);
        // Fallback to open CORS master stream
        const fallbackUrl = await resolveClientFullAudioStream(track.title, track.artist);
        if (fallbackUrl && fallbackUrl !== directUrl) {
          response = await fetch(fallbackUrl);
        } else {
          throw networkErr;
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Download HTTP error ${response?.status || 500}`);
      }

      // Validate Content-Type: ensure it is not HTML text
      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
        throw new Error('Server returned HTML webpage instead of audio media file');
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : track.fileSize || 8000000;

      let receivedBytes = 0;
      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            if (totalBytes > 0) {
              item.progress = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
              this.notifyListeners();
            }
          }
        }
      } else {
        const arrayBuf = await response.arrayBuffer();
        chunks.push(new Uint8Array(arrayBuf));
        receivedBytes = arrayBuf.byteLength;
      }

      // Verify that content is not HTML text disguised as mp3
      if (chunks.length > 0) {
        const firstChunk = chunks[0];
        const previewText = new TextDecoder().decode(firstChunk.slice(0, 80));
        if (
          previewText.includes('<!DOCTYPE') ||
          previewText.includes('<html') ||
          previewText.includes('<head')
        ) {
          throw new Error('Invalid audio data: received HTML document');
        }
      }

      const blob = new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' });
      item.fileSize = blob.size;
      item.progress = 100;
      item.status = 'completed';

      // Trigger native browser download to save directly into device Downloads folder
      if (typeof document !== 'undefined') {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = fileName;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();

        // Keep blob URL active for 60 seconds so mobile browsers have ample time to write to disk
        setTimeout(() => {
          if (document.body.contains(a)) {
            document.body.removeChild(a);
          }
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      }

      // Save to IndexedDB for instant in-app offline playback
      await storageService.saveDownload(item, blob);
      this.activeDownloads.set(downloadId, item);
      this.notifyListeners();

      // Dispatch custom download completed event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('anamar:download-complete', {
            detail: { track, fileName },
          })
        );
      }

      return true;
    } catch (err) {
      console.warn('Stream fetch download encountered an issue, falling back to direct browser link download:', err);

      // Robust Fallback: If fetch or CORS failed, trigger direct browser download of the audio URL
      try {
        const directUrl = await this.resolveAudioDownloadUrl(track);
        if (directUrl && typeof document !== 'undefined') {
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = directUrl;
          a.download = fileName;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
          }, 5000);

          item.status = 'completed';
          item.progress = 100;
          this.activeDownloads.set(downloadId, item);
          this.notifyListeners();
          return true;
        }
      } catch (fallbackErr) {
        console.error('Direct download fallback failed:', fallbackErr);
      }

      item.status = 'failed';
      item.error = (err as Error).message || 'Download failed';
      this.activeDownloads.set(downloadId, item);
      this.notifyListeners();
      return false;
    }
  }

  public async retryDownload(id: string): Promise<boolean> {
    const item = this.activeDownloads.get(id);
    if (!item) return false;
    return this.startDownload(item.track);
  }

  public async deleteDownload(id: string): Promise<void> {
    this.activeDownloads.delete(id);
    await storageService.deleteDownload(id);
    this.notifyListeners();
  }

  public async clearAllDownloads(): Promise<void> {
    this.activeDownloads.clear();
    await storageService.clearAllDownloads();
    this.notifyListeners();
  }

  public isDownloaded(id: string): boolean {
    const item = this.activeDownloads.get(id);
    return item?.status === 'completed';
  }

  public subscribe(listener: DownloadListener): () => void {
    this.listeners.add(listener);
    listener(this.getDownloads());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const list = this.getDownloads();
    this.listeners.forEach((listener) => listener(list));
  }
}

export const downloadManager = new DownloadManager();
