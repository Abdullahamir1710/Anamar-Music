import { Track } from '../types/music';

class AnamarCloudMusicService {
  private cache: Map<string, Track[]> = new Map();

  /**
   * Search songs online using real-time audio search
   * queries JioSaavn, Deezer, and LRCLIB in real-time
   */
  public async searchOnline(query: string, limit = 200): Promise<Track[]> {
    const q = query.trim();
    if (!q) return [];

    const cacheKey = `${q.toLowerCase()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(q)}&limit=${limit}`);
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      if (data.success && Array.isArray(data.tracks)) {
        this.cache.set(cacheKey, data.tracks);
        return data.tracks;
      }
      return [];
    } catch (err) {
      console.warn('Online search error, falling back:', err);
      return [];
    }
  }

  /**
   * Fetch trending / popular songs online
   */
  public async getTrendingOnline(): Promise<Track[]> {
    const popularQueries = ['Top Hits 2026', 'Trending Pakistani Songs', 'Arijit Singh', 'The Weeknd'];
    const randomQuery = popularQueries[Math.floor(Math.random() * popularQueries.length)];
    return this.searchOnline(randomQuery, 10);
  }

  /**
   * Quick import or fetch a song by title or query string
   */
  public async importTrack(query: string): Promise<Track | null> {
    const results = await this.searchOnline(query, 1);
    return results.length > 0 ? results[0] : null;
  }
}

export const echoMusicService = new AnamarCloudMusicService();
export const cloudMusicService = echoMusicService;
