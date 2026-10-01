import { Track, DownloadedItem } from '../types/music';
import { storageService } from './storage';

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

  public async startDownload(track: Track): Promise<boolean> {
    if (!track.canDownload || !track.downloadUrl) {
      console.warn('Track does not allow downloading');
      return false;
    }

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
      // 1. Fetch real audio file with progress tracking
      const response = await fetch(track.downloadUrl);
      if (!response.ok) {
        throw new Error(`Download HTTP error ${response.status}`);
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
      }

      const blob = new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' });
      item.fileSize = blob.size;
      item.progress = 100;
      item.status = 'completed';

      // 2. Save into browser/OS Downloads folder via File System Access API where supported
      let savedToDevice = false;
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
          const picker = (window as unknown as {
            showSaveFilePicker: (options: {
              suggestedName: string;
              types: { description: string; accept: Record<string, string[]> }[];
            }) => Promise<FileSystemFileHandle>;
          }).showSaveFilePicker;

          const handle = await picker({
            suggestedName: fileName,
            types: [
              {
                description: 'MP3 Audio File',
                accept: { 'audio/mpeg': ['.mp3'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          savedToDevice = true;
        } catch (pickerErr) {
          if ((pickerErr as Error).name !== 'AbortError') {
            console.warn('File System Access API failed, using standard download fallback:', pickerErr);
          }
        }
      }

      // 3. Fallback: Native browser download trigger (places file into default browser Downloads folder)
      if (!savedToDevice && typeof document !== 'undefined') {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }

      // 4. Save to IndexedDB for seamless in-app offline playback
      await storageService.saveDownload(item, blob);
      this.activeDownloads.set(downloadId, item);
      this.notifyListeners();

      // Dispatch custom download completed event
      window.dispatchEvent(
        new CustomEvent('anamar:download-complete', {
          detail: { track, fileName },
        })
      );

      return true;
    } catch (err) {
      console.error('Download failed:', err);
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
