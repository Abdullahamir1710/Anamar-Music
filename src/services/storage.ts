import { Track, Playlist, DownloadedItem, TasteProfile } from '../types/music';

const DB_NAME = 'anamar_music_db';
const DB_VERSION = 1;
const STORE_DOWNLOADS = 'downloads';
const STORE_BLOBS = 'audio_blobs';

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DOWNLOADS)) {
          db.createObjectStore(STORE_DOWNLOADS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Downloads & Offline Storage ---
  public async saveDownload(item: DownloadedItem, blob?: Blob): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_DOWNLOADS, STORE_BLOBS], 'readwrite');
      const downloadsStore = tx.objectStore(STORE_DOWNLOADS);
      const blobsStore = tx.objectStore(STORE_BLOBS);

      // Save metadata without blob reference in downloadsStore
      const itemToSave = { ...item, blob: undefined };
      downloadsStore.put(itemToSave);

      if (blob) {
        blobsStore.put({ id: item.id, blob });
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Failed to save to IndexedDB, fallback to localStorage metadata', err);
      const local = this.getLocalStorage<DownloadedItem[]>('anamar_downloads_meta', []);
      const updated = local.filter((d) => d.id !== item.id);
      updated.push(item);
      this.setLocalStorage('anamar_downloads_meta', updated);
    }
  }

  public async getDownloads(): Promise<DownloadedItem[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_DOWNLOADS, 'readonly');
      const store = tx.objectStore(STORE_DOWNLOADS);
      const request = store.getAll();

      return new Promise<DownloadedItem[]>((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve(this.getLocalStorage<DownloadedItem[]>('anamar_downloads_meta', []));
      });
    } catch {
      return this.getLocalStorage<DownloadedItem[]>('anamar_downloads_meta', []);
    }
  }

  public async getAudioBlob(id: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORE_BLOBS, 'readonly');
      const store = tx.objectStore(STORE_BLOBS);
      const request = store.get(id);

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result ? request.result.blob : null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async deleteDownload(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_DOWNLOADS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_DOWNLOADS).delete(id);
      tx.objectStore(STORE_BLOBS).delete(id);
    } catch {
      const local = this.getLocalStorage<DownloadedItem[]>('anamar_downloads_meta', []);
      this.setLocalStorage('anamar_downloads_meta', local.filter((d) => d.id !== id));
    }
  }

  public async clearAllDownloads(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction([STORE_DOWNLOADS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_DOWNLOADS).clear();
      tx.objectStore(STORE_BLOBS).clear();
    } catch {
      localStorage.removeItem('anamar_downloads_meta');
    }
  }

  // --- Liked Songs ---
  public getLikedSongIds(): string[] {
    return this.getLocalStorage<string[]>('anamar_liked_songs', []);
  }

  public toggleLikeSong(trackId: string): boolean {
    const list = this.getLikedSongIds();
    const index = list.indexOf(trackId);
    let isLiked = false;
    if (index >= 0) {
      list.splice(index, 1);
      isLiked = false;
    } else {
      list.unshift(trackId);
      isLiked = true;
    }
    this.setLocalStorage('anamar_liked_songs', list);
    return isLiked;
  }

  // --- Playlists ---
  public getPlaylists(): Playlist[] {
    return this.getLocalStorage<Playlist[]>('anamar_playlists', []);
  }

  public savePlaylist(playlist: Playlist): void {
    const playlists = this.getPlaylists();
    const idx = playlists.findIndex((p) => p.id === playlist.id);
    if (idx >= 0) {
      playlists[idx] = playlist;
    } else {
      playlists.unshift(playlist);
    }
    this.setLocalStorage('anamar_playlists', playlists);
  }

  public deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter((p) => p.id !== id);
    this.setLocalStorage('anamar_playlists', playlists);
  }

  // --- History ---
  public getHistory(): { track: Track; playedAt: number }[] {
    return this.getLocalStorage<{ track: Track; playedAt: number }[]>('anamar_history', []);
  }

  public addHistory(track: Track): void {
    const history = this.getHistory().filter((h) => h.track.id !== track.id);
    history.unshift({ track, playedAt: Date.now() });
    // Keep max 100 entries
    this.setLocalStorage('anamar_history', history.slice(0, 100));
  }

  public clearHistory(): void {
    this.setLocalStorage('anamar_history', []);
  }

  // --- Taste Profile ---
  public getTasteProfile(): TasteProfile {
    const defaultProfile: TasteProfile = {
      topGenres: {},
      topArtists: {},
      topMoods: {},
      completedSongs: [],
      repeatedSongs: {},
      likedTrackIds: [],
      skippedTrackIds: {},
      totalListeningTime: 0,
      recommendationsEnabled: true,
      historyEnabled: true,
    };
    return this.getLocalStorage<TasteProfile>('anamar_taste_profile', defaultProfile);
  }

  public saveTasteProfile(profile: TasteProfile): void {
    this.setLocalStorage('anamar_taste_profile', profile);
  }

  // Helpers
  private getLocalStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setLocalStorage<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // Storage full
    }
  }
}

export const storageService = new StorageService();
