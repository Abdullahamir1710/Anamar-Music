import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Compass,
  Radio,
  Heart,
  Download,
  Flame,
  Music,
  Users,
  Disc,
  Smile,
  AlertCircle,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { recommendationService, PersonalizedHomeData } from '../services/recommendationService';
import { usePlayer } from '../context/PlayerContext';
import { GENRES, MOODS, FEATURED_PLAYLISTS, ALBUMS_CATALOG, ARTISTS_CATALOG, INITIAL_TRACKS } from '../services/musicCatalog';
import { ALL_UNIQUE_ARTISTS, ALL_UNIQUE_ALBUMS } from '../services/expandedCatalog';
import { Track, Artist, Album, Playlist, FeedSection } from '../types/music';
import { RecommendationSlider } from '../components/home/RecommendationSlider';
import { CategoryFilters, CategoryFilterType } from '../components/home/CategoryFilters';
import { ContinueListening } from '../components/home/ContinueListening';
import { ArtistCircleCard } from '../components/home/ArtistCircleCard';
import { AlbumSquareCard } from '../components/home/AlbumSquareCard';
import { SongFeedCard } from '../components/home/SongFeedCard';
import { ArtistDetailModal } from '../components/home/ArtistDetailModal';
import { AlbumDetailModal } from '../components/home/AlbumDetailModal';
import { Footer } from '../components/layout/Footer';

// Scroll position cache across view switches (Requirement 113)
let cachedHomeScrollPosition = 0;

export const HomeView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { playTrack } = usePlayer();
  const [homeData, setHomeData] = useState<PersonalizedHomeData>(() =>
    recommendationService.getPersonalizedHome()
  );

  // Quick category selection (Home Screen 4)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('All');

  // Infinite feed state (Requirements 100 - 114)
  const [feedSections, setFeedSections] = useState<FeedSection[]>([]);
  const [feedCursor, setFeedCursor] = useState<string>('0');
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Modals for artist & album drilldown
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // Session-level tracking of displayed items to avoid repetition (Requirement 105)
  const shownTrackIds = useRef<Set<string>>(new Set<string>());
  const shownArtistIds = useRef<Set<string>>(new Set<string>());
  const shownAlbumIds = useRef<Set<string>>(new Set<string>());
  const feedSentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  // Restore & save scroll position (Requirement 113)
  useEffect(() => {
    // Find scrollable main container
    const mainEl = document.querySelector('main');
    if (mainEl && cachedHomeScrollPosition > 0) {
      mainEl.scrollTo({ top: cachedHomeScrollPosition, behavior: 'instant' as ScrollBehavior });
    }

    const handleScroll = () => {
      if (mainEl) {
        cachedHomeScrollPosition = mainEl.scrollTop;
      }
    };

    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (mainEl) {
        cachedHomeScrollPosition = mainEl.scrollTop;
        mainEl.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Track online/offline status (Requirement 112)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto resume loading on reconnect
      loadNextBatch();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Home Data and first Infinite Feed batch
  useEffect(() => {
    const data = recommendationService.getPersonalizedHome();
    setHomeData(data);

    // Seed shownTrackIds with initial hero & structured items
    data.madeForYou.forEach((t) => shownTrackIds.current.add(t.id));
    data.continueListening.forEach((t) => shownTrackIds.current.add(t.id));
    data.newForYou.forEach((t) => shownTrackIds.current.add(t.id));

    // Load initial feed batch
    const initialBatch = recommendationService.getFeedBatch('0', 3, shownTrackIds.current, shownArtistIds.current, shownAlbumIds.current);
    setFeedSections(initialBatch.sections);
    setFeedCursor(initialBatch.nextCursor);

    // Track items from initial batch to prevent duplicates
    initialBatch.sections.forEach((sec) => {
      sec.tracks?.forEach((t) => shownTrackIds.current.add(t.id));
      sec.artists?.forEach((a) => shownArtistIds.current.add(a.id));
      sec.albums?.forEach((alb) => shownAlbumIds.current.add(alb.id));
    });
  }, []);

  // Fetch next batch of infinite feed (Requirement 101 & 102)
  const loadNextBatch = useCallback(() => {
    if (isFetchingRef.current || !isOnline) return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);
    setFeedError(null);

    // Fetch batch from client recommendation engine & sync with backend endpoint
    setTimeout(() => {
      try {
        const nextBatch = recommendationService.getFeedBatch(feedCursor, 3, shownTrackIds.current, shownArtistIds.current, shownAlbumIds.current);

        // Track displayed items to prevent duplication
        nextBatch.sections.forEach((sec) => {
          sec.tracks?.forEach((t) => shownTrackIds.current.add(t.id));
          sec.artists?.forEach((a) => shownArtistIds.current.add(a.id));
          sec.albums?.forEach((alb) => shownAlbumIds.current.add(alb.id));
        });

        setFeedSections((prev) => [...prev, ...nextBatch.sections]);
        setFeedCursor(nextBatch.nextCursor);
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      } catch (err) {
        console.error('Error loading feed batch:', err);
        setFeedError("Couldn't load more music.");
        setIsLoadingMore(false);
        isFetchingRef.current = false;
      }
    }, 600);
  }, [feedCursor, isOnline]);

  // Setup Intersection Observer on Sentinel for smooth infinite loading (Requirement 102)
  useEffect(() => {
    const sentinel = feedSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingRef.current) {
          loadNextBatch();
        }
      },
      {
        rootMargin: '400px', // Pre-fetch 400px before user reaches bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextBatch]);

  // Handle "Not interested" removal (Requirement 109)
  const handleNotInterested = (removedTrack: Track) => {
    setHomeData((prev) => ({
      ...prev,
      madeForYou: prev.madeForYou.filter((t) => t.id !== removedTrack.id),
      dailyMix: prev.dailyMix.filter((t) => t.id !== removedTrack.id),
      newForYou: prev.newForYou.filter((t) => t.id !== removedTrack.id),
      trending: prev.trending.filter((t) => t.id !== removedTrack.id),
    }));

    setFeedSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        tracks: sec.tracks?.filter((t) => t.id !== removedTrack.id),
      }))
    );
  };

  // Quick navigation to artists & albums
  const handleSelectArtist = (artistName: string) => {
    const found = ARTISTS_CATALOG.find(
      (a) => a.name.toLowerCase() === artistName.toLowerCase()
    );
    if (found) {
      setSelectedArtist(found);
    } else {
      onNavigate(`/search?q=${encodeURIComponent(artistName)}`);
    }
  };

  const handleSelectAlbum = (albumName: string) => {
    const found = ALBUMS_CATALOG.find(
      (a) => a.title.toLowerCase() === albumName.toLowerCase()
    );
    if (found) {
      setSelectedAlbum(found);
    } else {
      onNavigate(`/search?q=${encodeURIComponent(albumName)}`);
    }
  };

  // Filter items based on selected category (Home Screen 4)
  const isAll = selectedCategory === 'All' || selectedCategory === 'For You';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-28 space-y-8 select-none">
      {/* Offline Status Notification (Requirement 112) */}
      {!isOnline && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>You're offline. Cached & downloaded music remain accessible.</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20">
            Offline Mode
          </span>
        </div>
      )}

      {/* 1. RECOMMENDATION SLIDER (Requirements 99.1 - 99.6 & Home Screen 2) */}
      {/* Placed immediately below header, visible near top without scrolling */}
      <RecommendationSlider />

      {/* 2. CATEGORY FILTERS (Requirement 99.1 & Home Screen 4) */}
      <CategoryFilters selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* 3. CONTINUE LISTENING (Home Screen 5) */}
      {(isAll || selectedCategory === 'Songs') && homeData.continueListening.length > 0 && (
        <ContinueListening tracks={homeData.continueListening} />
      )}

      {/* 4. RECOMMENDED SONGS / MADE FOR YOU (Home Screen 6) */}
      {(isAll || selectedCategory === 'Songs') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-400">
                Personalized selections based on your unique sound taste
              </p>
            </div>
            <button
              onClick={() => {
                if (homeData.madeForYou.length > 0) {
                  playTrack(homeData.madeForYou[0], homeData.madeForYou, 0);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {homeData.madeForYou.slice(0, 6).map((track) => (
              <SongFeedCard
                key={track.id}
                track={track}
                onNotInterested={handleNotInterested}
                onSelectArtist={handleSelectArtist}
                onSelectAlbum={handleSelectAlbum}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. POPULAR ARTISTS (Home Screen 7 & 17) */}
      {(isAll || selectedCategory === 'Artists') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Popular Artists
              </h2>
              <p className="text-xs text-slate-400">Visionaries currently shaping the sound</p>
            </div>
            <button
              onClick={() => onNavigate('/explore')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              Explore All
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {ALL_UNIQUE_ARTISTS.slice(0, 35).map((artist) => (
              <ArtistCircleCard
                key={artist.id}
                artist={artist}
                onClick={(art) => setSelectedArtist(art)}
                onPlayTop={(art) => {
                  const track = INITIAL_TRACKS.find(
                    (t) => t.artist === art.name || art.topTrackIds?.includes(t.id)
                  );
                  if (track) playTrack(track);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. RECOMMENDED ALBUMS (Home Screen 9 & 18) */}
      {(isAll || selectedCategory === 'Albums') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Recommended Albums
              </h2>
              <p className="text-xs text-slate-400">
                Full-length studio recordings in pristine 320 kbps fidelity
              </p>
            </div>
            <button
              onClick={() => onNavigate('/albums')}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {ALL_UNIQUE_ALBUMS.slice(0, selectedCategory === 'Albums' ? 50 : 10).map((album) => (
              <AlbumSquareCard
                key={album.id}
                album={album}
                onClick={(alb) => setSelectedAlbum(alb)}
                onPlayAlbum={(alb) => {
                  const firstTrack = INITIAL_TRACKS.find(
                    (t) => t.album === alb.title || alb.trackIds.includes(t.id) || t.artist === alb.artist
                  );
                  if (firstTrack) playTrack(firstTrack);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. NEW RELEASES (Home Screen 11) */}
      {(isAll || selectedCategory === 'New') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                Fresh New Releases
              </h2>
              <p className="text-xs text-slate-400">
                Newly dropped master tracks, singles, and records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {homeData.newForYou.slice(0, 6).map((track) => (
              <SongFeedCard
                key={track.id}
                track={track}
                onNotInterested={handleNotInterested}
                onSelectArtist={handleSelectArtist}
                onSelectAlbum={handleSelectAlbum}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. TRENDING NOW (Home Screen 12) */}
      {(isAll || selectedCategory === 'Trending') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <span>Trending Now</span>
                <Flame className="w-4 h-4 text-amber-400 fill-current" />
              </h2>
              <p className="text-xs text-slate-400">What everyone is listening to this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {homeData.trending.slice(0, 6).map((track) => (
              <SongFeedCard
                key={`trending-${track.id}`}
                track={track}
                onNotInterested={handleNotInterested}
                onSelectArtist={handleSelectArtist}
                onSelectAlbum={handleSelectAlbum}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. EXPLORE BY GENRE & BROWSE BY MOOD (Home Screen 13) */}
      {(isAll || selectedCategory === 'Genres' || selectedCategory === 'Moods') && (
        <section className="space-y-6 pt-2">
          {/* Explore By Genre */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-3">
              Explore by Genre
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {GENRES.filter((g) => g !== 'All').map((genre) => (
                <button
                  key={genre}
                  onClick={() => onNavigate(`/search?q=${encodeURIComponent(genre)}`)}
                  className="px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-cyan-500/15 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Browse By Mood */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mb-3">
              Browse by Mood
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {MOODS.filter((m) => m !== 'All').map((mood) => (
                <button
                  key={mood}
                  onClick={() => onNavigate(`/search?q=${encodeURIComponent(mood)}`)}
                  className="px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-purple-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. INFINITE HOME FEED (Requirements 100 - 114) */}
      {/* Continuously loads dynamic batches of Songs, Artists, Albums, and Playlists */}
      <section className="space-y-8 pt-6 border-t border-cyan-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Infinite Discovery Feed
          </h2>
        </div>

        {feedSections.map((sec) => (
          <div key={sec.id} className="space-y-4 animate-in fade-in duration-300">
            {/* Section Header */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {sec.title}
              </h3>
              {sec.subtitle && (
                <p className="text-xs text-slate-400">{sec.subtitle}</p>
              )}
            </div>

            {/* Content Rendering based on Section Type (Requirement 104: Mix Content Types) */}
            {sec.type === 'songs' && sec.tracks && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {sec.tracks.map((track) => (
                  <SongFeedCard
                    key={`${sec.id}-${track.id}`}
                    track={track}
                    onNotInterested={handleNotInterested}
                    onSelectArtist={handleSelectArtist}
                    onSelectAlbum={handleSelectAlbum}
                  />
                ))}
              </div>
            )}

            {sec.type === 'artists' && sec.artists && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {sec.artists.map((artist) => (
                  <ArtistCircleCard
                    key={`${sec.id}-${artist.id}`}
                    artist={artist}
                    onClick={(art) => setSelectedArtist(art)}
                    onPlayTop={(art) => {
                      const track = INITIAL_TRACKS.find(
                        (t) => t.artist === art.name || art.topTrackIds?.includes(t.id)
                      );
                      if (track) playTrack(track);
                    }}
                  />
                ))}
              </div>
            )}

            {sec.type === 'albums' && sec.albums && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sec.albums.map((album) => (
                  <AlbumSquareCard
                    key={`${sec.id}-${album.id}`}
                    album={album}
                    onClick={(alb) => setSelectedAlbum(alb)}
                    onPlayAlbum={(alb) => {
                      const firstTrack = INITIAL_TRACKS.find(
                        (t) => t.album === alb.title || alb.trackIds.includes(t.id)
                      );
                      if (firstTrack) playTrack(firstTrack);
                    }}
                  />
                ))}
              </div>
            )}

            {sec.type === 'mixed' && (
              <div className="space-y-4">
                {sec.tracks && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {sec.tracks.slice(0, 3).map((track) => (
                      <SongFeedCard
                        key={`${sec.id}-mixed-${track.id}`}
                        track={track}
                        onNotInterested={handleNotInterested}
                        onSelectArtist={handleSelectArtist}
                        onSelectAlbum={handleSelectAlbum}
                      />
                    ))}
                  </div>
                )}
                {sec.albums && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {sec.albums.slice(0, 4).map((album) => (
                      <AlbumSquareCard
                        key={`${sec.id}-mixed-alb-${album.id}`}
                        album={album}
                        onClick={(alb) => setSelectedAlbum(alb)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {sec.type === 'playlists' && sec.playlists && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sec.playlists.map((pl) => (
                  <div
                    key={`${sec.id}-${pl.id}`}
                    onClick={() => {
                      if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 0);
                    }}
                    className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition cursor-pointer flex gap-3.5 items-center group shadow-md"
                  >
                    <img
                      src={pl.cover}
                      alt={pl.title}
                      loading="lazy"
                      className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-md group-hover:scale-105 transition"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 truncate">
                        {pl.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {pl.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading Skeleton States (Requirement 111) */}
        {isLoadingMore && (
          <div className="space-y-4 py-4 animate-pulse">
            <div className="h-5 w-48 bg-white/10 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02]">
                  <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 bg-white/10 rounded" />
                    <div className="h-2.5 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-cyan-400 font-semibold pt-2">
              Loading more music...
            </p>
          </div>
        )}

        {/* Error State with Try Again (Requirement 111) */}
        {feedError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
            <p className="text-xs text-red-300 flex items-center justify-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>{feedError}</span>
            </p>
            <button
              onClick={loadNextBatch}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Sentinel element observed by IntersectionObserver (Requirement 102) */}
        <div ref={feedSentinelRef} className="h-10 w-full pointer-events-none" />
      </section>

      {/* 11. FOOTER (Requirements 115 - 118) */}
      <Footer onNavigate={onNavigate} />

      {/* 12. ARTIST & ALBUM DETAIL MODALS */}
      <ArtistDetailModal
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
      <AlbumDetailModal
        album={selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
      />
    </div>
  );
};
