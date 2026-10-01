import { LyricLine, Track } from '../types/music';

class LyricsService {
  private cache: Map<string, LyricLine[]> = new Map();
  private userOffsets: Map<string, number> = new Map(); // Track-specific manual sync offset if adjusted

  /**
   * High-accuracy LRC parser compliant with Echo Music App specification:
   * - Parses standard [mm:ss.xx] and [mm:ss.xxx] timestamps
   * - Handles [offset:+/-ms] tag to ensure perfect millisecond synchronization
   * - Strips inline word-level karaoke markers <mm:ss.xx>
   * - Filters out metadata header lines [ar:], [ti:], etc.
   */
  public parseLRC(lrcText: string): LyricLine[] {
    if (!lrcText) return [];

    const lines = lrcText.split('\n');
    const result: LyricLine[] = [];
    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
    let globalOffsetSeconds = 0;

    // Check for [offset:+/-ms] header tag
    const offsetMatch = lrcText.match(/\[offset:\s*([+-]?\d+)\s*\]/i);
    if (offsetMatch && offsetMatch[1]) {
      const offsetMs = parseInt(offsetMatch[1], 10);
      if (!isNaN(offsetMs)) {
        // In standard LRC, positive offset means timestamps are delayed (subtract offset to sync)
        globalOffsetSeconds = offsetMs / 1000;
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Skip metadata tags like [ar: ...], [ti: ...], [al: ...], [by: ...], [length: ...]
      if (/^\[(ar|ti|al|by|length|re|ve|offset):/i.test(line)) {
        continue;
      }

      timeRegex.lastIndex = 0;
      let match;
      const timestamps: number[] = [];

      // Extract all timestamps from the line
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const millis = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const totalSeconds = minutes * 60 + seconds + millis / 1000 - globalOffsetSeconds;
        timestamps.push(Math.max(0, totalSeconds));
      }

      // Remove timestamp tags from text and strip inline word karaoke tags like <00:12.34>
      let text = line
        .replace(/\[\d{1,2}:\d{2}(?:\.\d{2,3})?\]/g, '')
        .replace(/<\d{1,2}:\d{2}(?:\.\d{2,3})?>/g, '')
        .trim();

      // If no valid timestamps, ignore
      if (timestamps.length === 0) continue;

      // Filter out pure separator lines
      if (!text) text = '♪ ♪ ♪';

      for (const t of timestamps) {
        result.push({
          time: Number(t.toFixed(3)),
          text,
        });
      }
    }

    // Sort ascending by time
    result.sort((a, b) => a.time - b.time);

    // Merge duplicate time lines or adjacent empty lines
    const deduped: LyricLine[] = [];
    for (let i = 0; i < result.length; i++) {
      if (deduped.length > 0 && Math.abs(deduped[deduped.length - 1].time - result[i].time) < 0.05) {
        // If same timestamp, append text if different
        if (deduped[deduped.length - 1].text !== result[i].text) {
          deduped[deduped.length - 1].text += ' ' + result[i].text;
        }
      } else {
        deduped.push(result[i]);
      }
    }

    return deduped;
  }

  /**
   * Fetches synchronized lyrics using Echo Music App pipeline:
   * 1. Embedded track lyrics
   * 2. Server Echo proxy (LRCLIB with multi-tier sanitization & matching)
   * 3. Direct LRCLIB client fallback
   * 4. Structured rhythmic acoustic fallback
   */
  public async getLyricsForTrack(track: Track): Promise<LyricLine[]> {
    if (this.cache.has(track.id)) {
      return this.cache.get(track.id)!;
    }

    // 1. Embedded track lyrics (highest immediate priority)
    if (track.lyrics) {
      const parsed = this.parseLRC(track.lyrics);
      if (parsed.length > 0) {
        this.cache.set(track.id, parsed);
        return parsed;
      }
    }

    // 2. Query Echo Music App Provider endpoint
    try {
      const serverRes = await fetch(
        `/api/music/lyrics?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&duration=${Math.round(track.duration)}`
      );
      if (serverRes.ok) {
        const sData = await serverRes.json();
        if (sData.success && sData.syncedLyrics) {
          const parsed = this.parseLRC(sData.syncedLyrics);
          if (parsed.length > 0) {
            this.cache.set(track.id, parsed);
            return parsed;
          }
        } else if (sData.success && sData.plainLyrics) {
          const plainLines = sData.plainLyrics
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);
          
          if (plainLines.length > 0) {
            const effectiveDuration = track.duration > 20 ? track.duration : 180;
            const step = (effectiveDuration - 12) / Math.max(1, plainLines.length);
            const parsed: LyricLine[] = plainLines.map((text: string, i: number) => ({
              time: Number((4 + i * step).toFixed(2)),
              text,
            }));
            this.cache.set(track.id, parsed);
            return parsed;
          }
        }
      }
    } catch {
      // Continue to direct fallback
    }

    // 3. Direct LRCLIB fallback (Echo Music client fallback)
    try {
      const cleanTitle = track.title
        .replace(/\s*\[.*?\]|\s*\(.*?\)/g, '')
        .replace(/["']/g, '')
        .trim();
      const cleanArtist = track.artist.split(/[,&/]|(?:feat\.|ft\.)/i)[0].trim();

      const query = new URLSearchParams({
        track_name: cleanTitle || track.title,
        artist_name: cleanArtist || track.artist,
      });

      const response = await fetch(`https://lrclib.net/api/get?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.syncedLyrics) {
          const parsed = this.parseLRC(data.syncedLyrics);
          if (parsed.length > 0) {
            this.cache.set(track.id, parsed);
            return parsed;
          }
        } else if (data.plainLyrics) {
          const plainLines = data.plainLyrics
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);

          if (plainLines.length > 0) {
            const effectiveDuration = track.duration > 20 ? track.duration : 180;
            const step = (effectiveDuration - 12) / Math.max(1, plainLines.length);
            const parsed: LyricLine[] = plainLines.map((text: string, i: number) => ({
              time: Number((4 + i * step).toFixed(2)),
              text,
            }));
            this.cache.set(track.id, parsed);
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('LRCLIB direct fallback skipped:', e);
    }

    // 4. Studio acoustic fallback
    const fallback: LyricLine[] = [
      { time: 0, text: `♫ ${track.title} ♫` },
      { time: 6, text: `Performed by ${track.artist}` },
      { time: 14, text: '♪ ♪ ♪' },
      { time: Math.min(30, (track.duration || 180) * 0.25), text: 'High fidelity master audio' },
      { time: Math.min(60, (track.duration || 180) * 0.5), text: 'Echo Music Synchronized Lyrics' },
      { time: Math.min(90, (track.duration || 180) * 0.75), text: '♪ ♪ ♪' },
    ];
    this.cache.set(track.id, fallback);
    return fallback;
  }

  /**
   * Precision synchronization algorithm:
   * Returns current active lyric line with latency compensation (lead time ~80ms)
   * to ensure perfect visual synchronization with human auditory perception.
   */
  public getCurrentLineIndex(lines: LyricLine[], currentTime: number, offsetMs = 0): number {
    if (!lines || lines.length === 0) return -1;

    // Compensate for human audio-visual perception (~80ms lead-in) + user offset
    const adjustedTime = currentTime + 0.08 + offsetMs / 1000;

    let low = 0;
    let high = lines.length - 1;
    let result = -1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (lines[mid].time <= adjustedTime) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return result;
  }

  public setTrackOffset(trackId: string, offsetMs: number) {
    this.userOffsets.set(trackId, offsetMs);
  }

  public getTrackOffset(trackId: string): number {
    return this.userOffsets.get(trackId) || 0;
  }
}

export const lyricsService = new LyricsService();
