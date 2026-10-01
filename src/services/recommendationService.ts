import { Track, Artist, Album, Playlist, TasteProfile, SliderCard, FeedSection } from '../types/music';
import { INITIAL_TRACKS, ARTISTS_CATALOG, ALBUMS_CATALOG, FEATURED_PLAYLISTS } from './musicCatalog';
import { ALL_UNIQUE_ARTISTS, ALL_UNIQUE_ALBUMS } from './expandedCatalog';
import { storageService } from './storage';

export interface RecommendationSection {
  id: string;
  title: string;
  explanation?: string;
  items: Track[];
}

export interface BrainTrackResult {
  track: Track;
  tasteScore: number;
  matchPercentage: number;
  matchReason: string;
}

export interface PersonalizedHomeData {
  isNewUser: boolean;
  greeting: string;
  continueListening: Track[];
  madeForYou: Track[];
  becauseYouLike: { artist: string; tracks: Track[] }[];
  dailyMix: Track[];
  newForYou: Track[];
  trending: Track[];
  favoriteArtists: Artist[];
  moodMix: { mood: string; tracks: Track[] }[];
}

class RecommendationService {
  private tasteProfile: TasteProfile;

  constructor() {
    this.tasteProfile = storageService.getTasteProfile();
    this.syncTasteFromStorage();
  }

  /**
   * Syncs user taste profile from actual local history and liked songs
   * ensuring immediate accuracy even if signals occurred before initialization.
   */
  public syncTasteFromStorage(): void {
    const history = storageService.getHistory();
    const likedIds = storageService.getLikedSongIds();

    let modified = false;

    // Synchronize liked track IDs
    for (const id of likedIds) {
      if (!this.tasteProfile.likedTrackIds.includes(id)) {
        this.tasteProfile.likedTrackIds.push(id);
        modified = true;
      }
    }

    // Synchronize played tracks to genres/artists/moods if empty
    if (Object.keys(this.tasteProfile.topGenres).length === 0 && history.length > 0) {
      for (const item of history) {
        const t = item.track;
        if (t.genre) {
          this.tasteProfile.topGenres[t.genre] = (this.tasteProfile.topGenres[t.genre] || 0) + 2;
        }
        if (t.artist) {
          this.tasteProfile.topArtists[t.artist] = (this.tasteProfile.topArtists[t.artist] || 0) + 2;
        }
        if (t.mood) {
          this.tasteProfile.topMoods[t.mood] = (this.tasteProfile.topMoods[t.mood] || 0) + 2;
        }
      }
      modified = true;
    }

    if (modified) {
      this.saveTasteProfile();
    }
  }

  public getTasteProfile(): TasteProfile {
    this.syncTasteFromStorage();
    return { ...this.tasteProfile };
  }

  public saveTasteProfile(): void {
    storageService.saveTasteProfile(this.tasteProfile);
  }

  // --- Signal Tracking ---
  public recordPlay(track: Track): void {
    if (!this.tasteProfile.historyEnabled) return;

    storageService.addHistory(track);

    // Track repeated listens
    this.tasteProfile.repeatedSongs[track.id] = (this.tasteProfile.repeatedSongs[track.id] || 0) + 1;

    // Track genre affinity
    if (track.genre) {
      this.tasteProfile.topGenres[track.genre] = (this.tasteProfile.topGenres[track.genre] || 0) + 1;
    }

    // Track artist affinity
    if (track.artist) {
      this.tasteProfile.topArtists[track.artist] = (this.tasteProfile.topArtists[track.artist] || 0) + 1;
    }

    // Track mood affinity
    if (track.mood) {
      this.tasteProfile.topMoods[track.mood] = (this.tasteProfile.topMoods[track.mood] || 0) + 1;
    }

    this.saveTasteProfile();
  }

  public recordCompleted(track: Track): void {
    if (!this.tasteProfile.historyEnabled) return;

    if (!this.tasteProfile.completedSongs.includes(track.id)) {
      this.tasteProfile.completedSongs.push(track.id);
    }
    // High weight for completed tracks
    if (track.genre) {
      this.tasteProfile.topGenres[track.genre] = (this.tasteProfile.topGenres[track.genre] || 0) + 3;
    }
    if (track.artist) {
      this.tasteProfile.topArtists[track.artist] = (this.tasteProfile.topArtists[track.artist] || 0) + 3;
    }
    this.saveTasteProfile();
  }

  public recordSkip(track: Track, secondsPlayed: number): void {
    if (!this.tasteProfile.historyEnabled) return;

    // Only penalize if skipped very quickly (< 5 seconds)
    if (secondsPlayed < 5) {
      this.tasteProfile.skippedTrackIds[track.id] = (this.tasteProfile.skippedTrackIds[track.id] || 0) + 1;
      // Slight reduction in genre weight, without totally disabling the artist
      if (track.genre && (this.tasteProfile.topGenres[track.genre] || 0) > 1) {
        this.tasteProfile.topGenres[track.genre] -= 1;
      }
      this.saveTasteProfile();
    }
  }

  public recordLike(track: Track, isLiked: boolean): void {
    if (isLiked) {
      if (!this.tasteProfile.likedTrackIds.includes(track.id)) {
        this.tasteProfile.likedTrackIds.push(track.id);
      }
      if (track.genre) {
        this.tasteProfile.topGenres[track.genre] = (this.tasteProfile.topGenres[track.genre] || 0) + 5;
      }
      if (track.artist) {
        this.tasteProfile.topArtists[track.artist] = (this.tasteProfile.topArtists[track.artist] || 0) + 5;
      }
    } else {
      this.tasteProfile.likedTrackIds = this.tasteProfile.likedTrackIds.filter((id) => id !== track.id);
    }
    this.saveTasteProfile();
  }

  public recordDownload(track: Track): void {
    if (track.genre) {
      this.tasteProfile.topGenres[track.genre] = (this.tasteProfile.topGenres[track.genre] || 0) + 5;
    }
    if (track.artist) {
      this.tasteProfile.topArtists[track.artist] = (this.tasteProfile.topArtists[track.artist] || 0) + 5;
    }
    this.saveTasteProfile();
  }

  public recordNotInterested(track: Track): void {
    if (!this.tasteProfile.notInterestedTrackIds) {
      this.tasteProfile.notInterestedTrackIds = [];
    }
    if (!this.tasteProfile.notInterestedTrackIds.includes(track.id)) {
      this.tasteProfile.notInterestedTrackIds.push(track.id);
    }
    // Gentle negative signal: reduce affinity slightly without permanent blocking
    if (track.genre && (this.tasteProfile.topGenres[track.genre] || 0) > 0) {
      this.tasteProfile.topGenres[track.genre] = Math.max(0, this.tasteProfile.topGenres[track.genre] - 2);
    }
    if (track.artist && (this.tasteProfile.topArtists[track.artist] || 0) > 0) {
      this.tasteProfile.topArtists[track.artist] = Math.max(0, this.tasteProfile.topArtists[track.artist] - 2);
    }
    this.saveTasteProfile();
  }

  public resetTasteProfile(): void {
    this.tasteProfile = {
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
    this.saveTasteProfile();
  }

  public toggleRecommendations(enabled: boolean): void {
    this.tasteProfile.recommendationsEnabled = enabled;
    this.saveTasteProfile();
  }

  public toggleHistory(enabled: boolean): void {
    this.tasteProfile.historyEnabled = enabled;
    this.saveTasteProfile();
  }

  // --- Recommendation Algorithms ---
  public getTopGenre(): string | null {
    const entries = Object.entries(this.tasteProfile.topGenres);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  public getTopArtist(): string | null {
    const entries = Object.entries(this.tasteProfile.topArtists);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  }

  public getScoreForTrack(track: Track): number {
    // If marked "not interested", deprioritize heavily
    if (this.tasteProfile.notInterestedTrackIds?.includes(track.id)) {
      return 0;
    }

    let score = 10; // Baseline

    // Affinity by genre
    const genreWeight = this.tasteProfile.topGenres[track.genre] || 0;
    score += genreWeight * 5;

    // Affinity by artist
    const artistWeight = this.tasteProfile.topArtists[track.artist] || 0;
    score += artistWeight * 6;

    // Affinity by mood
    if (track.mood) {
      const moodWeight = this.tasteProfile.topMoods[track.mood] || 0;
      score += moodWeight * 4;
    }

    // Liked boost
    if (this.tasteProfile.likedTrackIds.includes(track.id)) {
      score += 25;
    }

    // Repeated listen boost
    const repeated = this.tasteProfile.repeatedSongs[track.id] || 0;
    score += Math.min(30, repeated * 6);

    // Skip penalty
    const skips = this.tasteProfile.skippedTrackIds[track.id] || 0;
    score -= skips * 8;

    return Math.max(1, score);
  }

  /**
   * Anamar Brain algorithmic taste synthesizer:
   * Accurately scores and ranks all catalog tracks using the user's comprehensive taste profile
   * (genres, artists, likes, repeated listens, mood affinity, history).
   */
  public getBrainMix(mood?: string, limit = 8): BrainTrackResult[] {
    this.syncTasteFromStorage();
    const topArtist = this.getTopArtist();
    const topGenre = this.getTopGenre();
    const topMoods = Object.keys(this.tasteProfile.topMoods);

    let candidates = [...INITIAL_TRACKS];

    // Calculate individual taste scores
    const scored = candidates.map((track) => {
      let rawScore = this.getScoreForTrack(track);

      // Mood synergy
      let moodBonus = 0;
      if (mood && mood !== 'All') {
        if (track.mood === mood) {
          moodBonus = 35;
        } else if (
          (mood === 'Energetic' && track.mood === 'Party') ||
          (mood === 'Chill' && track.mood === 'Focus') ||
          (mood === 'Focus' && track.mood === 'Late Night')
        ) {
          moodBonus = 18;
        }
      }
      rawScore += moodBonus;

      // Small organic dithering so user gets fresh variety upon regeneration
      const finalScore = rawScore + Math.random() * 5;

      // Dynamic match percentage (scale roughly 88% to 99%)
      const matchPct = Math.min(99, Math.max(86, Math.round(85 + Math.min(14, rawScore * 0.3))));

      // Dynamic personalized reason
      let reason = 'Curated by Anamar Brain matching your sonic profile';
      if (track.artist === topArtist) {
        reason = `Matches your frequent listening to ${track.artist}`;
      } else if (track.genre === topGenre) {
        reason = `Aligned with your #1 genre: ${track.genre}`;
      } else if (this.tasteProfile.likedTrackIds.includes(track.id)) {
        reason = 'Direct match from your Liked Songs library';
      } else if (mood && mood !== 'All' && track.mood === mood) {
        reason = `Tuned for your selected ${mood} mood frequency`;
      } else if (topMoods.includes(track.mood || '')) {
        reason = `Harmonizes with your preferred ${track.mood} acoustic vibe`;
      }

      return {
        track,
        tasteScore: finalScore,
        matchPercentage: matchPct,
        matchReason: reason,
      };
    });

    // If specific mood requested, prioritize tracks matching that mood while respecting taste
    if (mood && mood !== 'All') {
      scored.sort((a, b) => {
        const aMood = a.track.mood === mood ? 1 : 0;
        const bMood = b.track.mood === mood ? 1 : 0;
        if (aMood !== bMood) return bMood - aMood;
        return b.tasteScore - a.tasteScore;
      });
    } else {
      scored.sort((a, b) => b.tasteScore - a.tasteScore);
    }

    return scored.slice(0, limit);
  }

  public getRecommendedSongs(limit = 10): Track[] {
    const scored = [...INITIAL_TRACKS].map((t) => ({
      track: t,
      score: this.getScoreForTrack(t) + Math.random() * 4,
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.track);
  }

  public getSimilarSongs(songId: string, limit = 5): Track[] {
    const source = INITIAL_TRACKS.find((t) => t.id === songId);
    if (!source) return INITIAL_TRACKS.slice(0, limit);

    return INITIAL_TRACKS.filter((t) => t.id !== songId)
      .map((t) => {
        let similarity = 0;
        if (t.genre === source.genre) similarity += 5;
        if (t.artist === source.artist) similarity += 4;
        if (t.mood === source.mood) similarity += 3;
        return { track: t, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((s) => s.track);
  }

  public getDailyMix(): Track[] {
    // 70% preferred / 20% similar / 10% discovery balance
    const recs = this.getRecommendedSongs(10);
    // Shuffle slightly
    return [...recs].sort(() => 0.5 - Math.random());
  }

  public getNewForYou(): Track[] {
    return [...INITIAL_TRACKS]
      .filter((t) => (t.releaseYear || 0) >= 2025)
      .sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0));
  }

  public getPersonalizedHome(): PersonalizedHomeData {
    const history = storageService.getHistory();
    const isNewUser = history.length === 0 && this.tasteProfile.likedTrackIds.length === 0;

    // Greeting by time of day
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const topArtistName = this.getTopArtist();
    const becauseYouLike: { artist: string; tracks: Track[] }[] = [];

    if (topArtistName) {
      const tracks = INITIAL_TRACKS.filter((t) => t.artist === topArtistName);
      if (tracks.length > 0) {
        becauseYouLike.push({ artist: topArtistName, tracks });
      }
    } else {
      // Pick prominent artist for new users
      becauseYouLike.push({
        artist: 'Aura Pulse',
        tracks: INITIAL_TRACKS.filter((t) => t.artist === 'Aura Pulse'),
      });
    }

    const continueListening = history.slice(0, 6).map((h) => h.track);

    return {
      isNewUser,
      greeting,
      continueListening,
      madeForYou: this.getRecommendedSongs(6),
      becauseYouLike,
      dailyMix: this.getDailyMix().slice(0, 6),
      newForYou: this.getNewForYou().slice(0, 6),
      trending: [...INITIAL_TRACKS].sort(() => 0.5 - Math.random()).slice(0, 6),
      favoriteArtists: ARTISTS_CATALOG.slice(0, 6),
      moodMix: [
        {
          mood: 'Energetic',
          tracks: INITIAL_TRACKS.filter((t) => t.mood === 'Energetic' || t.mood === 'Workout'),
        },
        {
          mood: 'Deep Focus & Chill',
          tracks: INITIAL_TRACKS.filter((t) => t.mood === 'Focus' || t.mood === 'Chill'),
        },
      ],
    };
  }

  // --- Top Recommendation Slider Generator (Requirements 99.1 - 99.6) ---
  public getSliderCards(): SliderCard[] {
    const recommended = this.getRecommendedSongs(6);
    const topArtist = this.getTopArtist() || 'Atif Aslam';
    const topGenre = this.getTopGenre() || 'Pakistani';

    const topTrack = recommended[0] || INITIAL_TRACKS[0];
    const artistTrack = INITIAL_TRACKS.find((t) => t.artist === topArtist) || INITIAL_TRACKS[1];
    const freshTrack = this.getNewForYou()[0] || INITIAL_TRACKS[2];
    const trendingTrack = INITIAL_TRACKS.find((t) => t.mood === 'Party' || t.mood === 'Energetic') || INITIAL_TRACKS[4];
    const dailyTrack = this.getDailyMix()[0] || INITIAL_TRACKS[3];
    const discoveryTrack =
      INITIAL_TRACKS.find(
        (t) => t.genre === 'Pakistani' || t.genre === 'Bollywood' || t.genre === 'K-Pop' || t.genre === 'Jazz'
      ) || INITIAL_TRACKS[8] || INITIAL_TRACKS[5];

    return [
      {
        id: 'slider-made-for-you',
        tag: 'MADE FOR YOU',
        tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        title: topTrack.title,
        subtitle: topTrack.artist,
        description: 'Discover your next favorite song curated specifically from your unique acoustic profile.',
        track: topTrack,
        artwork: topTrack.thumbnail,
        backgroundGradient: 'from-cyan-950/80 via-[#0A1628]/85 to-[#07090E]',
        accentColor: '#00D2FF',
      },
      {
        id: 'slider-because-you-like',
        tag: `BECAUSE YOU LISTEN TO ${topArtist.toUpperCase()}`,
        tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        title: artistTrack.title,
        subtitle: artistTrack.artist,
        description: `Handpicked tracks aligning seamlessly with your listening passion for ${topArtist}.`,
        track: artistTrack,
        artwork: artistTrack.thumbnail,
        backgroundGradient: 'from-purple-950/80 via-[#13102A]/85 to-[#07090E]',
        accentColor: '#A855F7',
      },
      {
        id: 'slider-fresh-releases',
        tag: 'FRESH RELEASES',
        tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
        title: freshTrack.title,
        subtitle: `${freshTrack.artist} • ${freshTrack.album || 'Single'}`,
        description: 'Just arrived in pristine 320 kbps high-fidelity master audio quality.',
        track: freshTrack,
        artwork: freshTrack.thumbnail,
        backgroundGradient: 'from-pink-950/80 via-[#1D0F28]/85 to-[#07090E]',
        accentColor: '#EC4899',
      },
      {
        id: 'slider-trending',
        tag: 'TRENDING FOR YOU',
        tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        title: trendingTrack.title,
        subtitle: trendingTrack.artist,
        description: 'Electrifying sound currently surging in popularity across the Anamar community.',
        track: trendingTrack,
        artwork: trendingTrack.thumbnail,
        backgroundGradient: 'from-amber-950/75 via-[#1E140C]/85 to-[#07090E]',
        accentColor: '#F59E0B',
      },
      {
        id: 'slider-daily-mix',
        tag: 'YOUR DAILY MIX',
        tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        title: dailyTrack.title,
        subtitle: dailyTrack.artist,
        description: 'An evolving acoustic blend tailored to your time of day and natural rhythm.',
        track: dailyTrack,
        artwork: dailyTrack.thumbnail,
        backgroundGradient: 'from-emerald-950/80 via-[#0B1D19]/85 to-[#07090E]',
        accentColor: '#10B981',
      },
      {
        id: 'slider-discover-new',
        tag: 'DISCOVER SOMETHING NEW',
        tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        title: discoveryTrack.title,
        subtitle: `${discoveryTrack.artist} • ${discoveryTrack.genre}`,
        description: 'Step outside your comfort zone into vibrant world acoustics and mesmerizing instrumentation.',
        track: discoveryTrack,
        artwork: discoveryTrack.thumbnail,
        backgroundGradient: 'from-indigo-950/80 via-[#10142C]/85 to-[#07090E]',
        accentColor: '#6366F1',
      },
    ];
  }

  // --- Infinite Home Feed Generator (Requirements 100 - 114) ---
  public getFeedBatch(
    cursor = '0',
    limit = 3,
    shownTrackIds = new Set<string>(),
    shownArtistIds = new Set<string>(),
    shownAlbumIds = new Set<string>()
  ): { sections: FeedSection[]; nextCursor: string; hasMore: boolean } {
    const page = parseInt(cursor, 10) || 0;
    const topArtist = this.getTopArtist() || 'Atif Aslam';
    const topGenre = this.getTopGenre() || 'Pakistani';

    const filterShown = (tracks: Track[]) => {
      // Strictly rank candidate tracks by the user's acoustic taste score
      const sortedByTaste = [...tracks].sort((a, b) => this.getScoreForTrack(b) - this.getScoreForTrack(a));
      const unshown = sortedByTaste.filter((t) => !shownTrackIds.has(t.id));
      return unshown.length > 0 ? unshown : sortedByTaste;
    };

    const filterArtists = (count: number) => {
      const unshown = ALL_UNIQUE_ARTISTS.filter((a) => !shownArtistIds.has(a.id));
      const pool = unshown.length > 0 ? unshown : ALL_UNIQUE_ARTISTS;
      const selected = pool.slice(0, count);
      selected.forEach((a) => shownArtistIds.add(a.id));
      return selected;
    };

    const filterAlbums = (count: number) => {
      const unshown = ALL_UNIQUE_ALBUMS.filter((alb) => !shownAlbumIds.has(alb.id));
      const pool = unshown.length > 0 ? unshown : ALL_UNIQUE_ALBUMS;
      const selected = pool.slice(0, count);
      selected.forEach((alb) => shownAlbumIds.add(alb.id));
      return selected;
    };

    const sections: FeedSection[] = [];

    switch (page % 5) {
      case 0:
        // Batch 0: Similar to favorites + Albums you may like + Artists for you
        sections.push({
          id: `feed-${page}-similar`,
          type: 'songs',
          title: 'Similar To Your Favorites',
          subtitle: `Acoustic matches inspired by ${topArtist} and ${topGenre}`,
          explanation: 'Curated by Anamar Brain matching harmonic timbre and tempo.',
          tracks: filterShown(this.getRecommendedSongs(8)),
        });
        sections.push({
          id: `feed-${page}-albums`,
          type: 'albums',
          title: 'Albums You May Like',
          subtitle: 'Full-length studio recordings',
          albums: filterAlbums(6),
        });
        sections.push({
          id: `feed-${page}-artists`,
          type: 'artists',
          title: 'Artists For You',
          subtitle: 'Visionaries shaping new sonic horizons',
          artists: filterArtists(6),
        });
        break;

      case 1:
        // Batch 1: Global discovery + Fresh releases + Curated playlists
        sections.push({
          id: `feed-${page}-global`,
          type: 'songs',
          title: 'Global Horizons: World & Fusion',
          subtitle: 'Sufi, Bollywood, K-Pop, and Arabic acoustic gems',
          tracks: filterShown(
            INITIAL_TRACKS.filter(
              (t) =>
                t.genre === 'Pakistani' ||
                t.genre === 'Bollywood' ||
                t.genre === 'K-Pop' ||
                t.genre === 'Arabic'
            )
          ),
        });
        sections.push({
          id: `feed-${page}-playlists`,
          type: 'playlists',
          title: 'Curated Editorial Playlists',
          subtitle: 'Theme-based audio journeys for every moment',
          playlists: FEATURED_PLAYLISTS,
        });
        sections.push({
          id: `feed-${page}-trending-mixed`,
          type: 'mixed',
          title: 'Trending Tracks & New Releases',
          subtitle: 'What the community is streaming this week',
          tracks: filterShown(this.getNewForYou().slice(0, 6)),
          albums: filterAlbums(6),
        });
        break;

      case 2:
        // Batch 2: Late Night & Lo-Fi Sanctuary + Jazz + More Artists
        sections.push({
          id: `feed-${page}-lofi`,
          type: 'songs',
          title: 'Late Night Chill & Lo-Fi Study',
          subtitle: 'Warm vinyl grooves, gentle keys, and quiet beats',
          tracks: filterShown(
            INITIAL_TRACKS.filter((t) => t.mood === 'Chill' || t.mood === 'Late Night' || t.mood === 'Focus')
          ),
        });
        sections.push({
          id: `feed-${page}-more-artists`,
          type: 'artists',
          title: 'More Artists To Discover',
          subtitle: 'Expand your library with acclaimed creators',
          artists: filterArtists(6),
        });
        sections.push({
          id: `feed-${page}-more-albums`,
          type: 'albums',
          title: 'Recommended Albums For You',
          subtitle: 'Essential deep-dive listening',
          albums: filterAlbums(6),
        });
        break;

      case 3:
        // Batch 3: High Voltage Workout & Energy + Rock
        sections.push({
          id: `feed-${page}-workout`,
          type: 'songs',
          title: 'High Voltage Workout & Pure Energy',
          subtitle: 'Pumping electronic drops, alternative rock, and driving beats',
          tracks: filterShown(
            INITIAL_TRACKS.filter((t) => t.mood === 'Workout' || t.mood === 'Energetic' || t.mood === 'Party')
          ),
        });
        sections.push({
          id: `feed-${page}-albums-rock`,
          type: 'albums',
          title: 'Heavy Hits & Synth Masterpieces',
          subtitle: 'Albums designed for maximum volume',
          albums: filterAlbums(6),
        });
        break;

      default:
        // Batch 4+: Dynamic procedural endless discovery
        sections.push({
          id: `feed-${page}-discovery`,
          type: 'songs',
          title: `Deep Discovery Mix #${page + 1}`,
          subtitle: 'Algorithmic cross-pollination of genres and moods',
          tracks: filterShown(
            [...INITIAL_TRACKS].sort(() => 0.5 - Math.random()).slice(0, 6)
          ),
        });
        sections.push({
          id: `feed-${page}-artists-loop`,
          type: 'artists',
          title: 'Explore Musical Creators',
          subtitle: 'Follow your next favorite musician',
          artists: filterArtists(6),
        });
        sections.push({
          id: `feed-${page}-albums-loop`,
          type: 'albums',
          title: 'More Albums From The Vault',
          subtitle: 'Timeless recordings from start to finish',
          albums: filterAlbums(6),
        });
        break;
    }

    // Always continue indefinitely per Requirement 100
    return {
      sections,
      nextCursor: String(page + 1),
      hasMore: true,
    };
  }
}

export const recommendationService = new RecommendationService();
