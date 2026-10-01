import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, Clock, Play, Sparkles, Globe, Loader2, Music2, FileText, ArrowRight, ListMusic } from 'lucide-react';
import { INITIAL_TRACKS, ARTISTS_CATALOG, ALBUMS_CATALOG, FEATURED_PLAYLISTS, GENRES } from '../services/musicCatalog';
import { ALL_UNIQUE_ARTISTS, ALL_UNIQUE_ALBUMS } from '../services/expandedCatalog';
import { Track, Artist, Album, Playlist } from '../types/music';
import { TrackRow } from '../components/common/TrackRow';
import { CardItem } from '../components/common/CardItem';
import { ArtistDetailModal } from '../components/home/ArtistDetailModal';
import { AlbumDetailModal } from '../components/home/AlbumDetailModal';
import { PlaylistDetailModal } from '../components/home/PlaylistDetailModal';
import { usePlayer } from '../context/PlayerContext';
import { echoMusicService } from '../services/echoMusicService';

export const SearchView: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const { playTrack, setLyricsOpen } = usePlayer();
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  const [onlineTracks, setOnlineTracks] = useState<Track[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [fetchInput, setFetchInput] = useState('');
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('anamar_recent_searches');
      return stored ? JSON.parse(stored) : ['Atif Aslam', 'Kesariya', 'Pasoori', 'Believer', 'Aura Pulse'];
    } catch {
      return ['Atif Aslam', 'Kesariya', 'Pasoori', 'Believer', 'Aura Pulse'];
    }
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Online Search Trigger with Debounce
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setOnlineTracks([]);
      setIsSearchingOnline(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsSearchingOnline(true);
    debounceTimer.current = setTimeout(() => {
      echoMusicService
        .searchOnline(q, 300)
        .then((tracks) => {
          setOnlineTracks(tracks);
          setIsSearchingOnline(false);
        })
        .catch(() => {
          setIsSearchingOnline(false);
        });
    }, 350);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem('anamar_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('anamar_recent_searches');
  };

  // Direct Fetch via Real-Time Cloud Audio
  const handleDirectFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = fetchInput.trim();
    if (!target) return;

    setIsFetchingDirect(true);
    try {
      const track = await echoMusicService.importTrack(target);
      if (track) {
        playTrack(track);
        saveRecentSearch(track.title);
        setFetchInput('');
      }
    } catch (err) {
      console.warn('Direct fetch failed:', err);
    } finally {
      setIsFetchingDirect(false);
    }
  };

  // Local Catalog Filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: [],
      };
    }

    const tracks = INITIAL_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        (t.album && t.album.toLowerCase().includes(q)) ||
        t.genre.toLowerCase().includes(q) ||
        (t.mood && t.mood.toLowerCase().includes(q))
    );

    const artists = ALL_UNIQUE_ARTISTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q))
    );

    const albums = ALL_UNIQUE_ALBUMS.filter(
      (alb) =>
        alb.title.toLowerCase().includes(q) ||
        alb.artist.toLowerCase().includes(q) ||
        alb.genre.toLowerCase().includes(q)
    );

    const playlists = FEATURED_PLAYLISTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );

    return { tracks, artists, albums, playlists };
  }, [query]);

  const totalResults =
    filtered.tracks.length +
    filtered.artists.length +
    filtered.albums.length +
    filtered.playlists.length +
    onlineTracks.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6 select-none">
      {/* Search Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 border border-cyan-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Global Master Audio Search</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Search & Fetch Any Song Online
          </h1>
          <p className="text-xs text-slate-300">
            Search our curated library or stream any global track with real-time synchronized lyrics.
          </p>
        </div>

        {/* Quick Instant Fetch Input */}
        <form onSubmit={handleDirectFetch} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={fetchInput}
            onChange={(e) => setFetchInput(e.target.value)}
            placeholder="Type any song name (e.g. Pehli Nazar Mein)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-cyan-500/30 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            type="submit"
            disabled={isFetchingDirect || !fetchInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition active:scale-95 shrink-0"
          >
            {isFetchingDirect ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Fetch & Play</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Main Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRecentSearch(query);
          }}
          placeholder="Search tracks, artists, albums, or lyrics across the globe..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#0E131F] border border-cyan-500/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm shadow-xl transition"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      {query.trim() && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'online', 'songs', 'artists', 'albums', 'playlists'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-600 text-slate-950 shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {tab === 'online' && <Globe className="w-3.5 h-3.5" />}
              <span>{tab === 'online' ? 'Online Hits' : tab}</span>
              {tab === 'online' && onlineTracks.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/30">
                  {onlineTracks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty State: Recent Searches & Browse Categories */}
      {!query.trim() ? (
        <div className="space-y-8">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Searches
                </h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      saveRecentSearch(term);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Browse Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {GENRES.filter((g) => g !== 'All').map((g) => (
                <div
                  key={g}
                  onClick={() => {
                    setQuery(g);
                    saveRecentSearch(g);
                  }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-cyan-500/10 border border-white/5 hover:border-cyan-500/30 transition cursor-pointer shadow-md"
                >
                  <p className="text-sm font-bold text-white mb-1">{g}</p>
                  <span className="text-[10px] text-cyan-400 font-semibold">Explore Tracks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : totalResults === 0 && !isSearchingOnline ? (
        <div className="text-center py-20 text-slate-400 space-y-3">
          <p className="text-base font-bold text-slate-200">No results found for "{query}"</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for another artist like Atif Aslam, Arijit Singh, The Weeknd, or use the Online Song Fetcher above.
          </p>
          <button
            onClick={() => {
              setFetchInput(query);
              handleDirectFetch({ preventDefault: () => {} } as any);
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Search Globally Online</span>
          </button>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          {/* Online Fetched Songs */}
          {(activeTab === 'all' || activeTab === 'online') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Online Stream Results {onlineTracks.length > 0 && `(${onlineTracks.length})`}
                  </h3>
                  {isSearchingOnline && (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Master Audio • Synced Lyrics
                </span>
              </div>

              {onlineTracks.length > 0 ? (
                <div className="space-y-1">
                  {onlineTracks.map((track, i) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={i}
                      queueContext={onlineTracks}
                    />
                  ))}
                </div>
              ) : isSearchingOnline ? (
                <div className="p-8 text-center text-xs text-cyan-400 animate-pulse">
                  Searching global master audio database...
                </div>
              ) : null}
            </section>
          )}

          {/* Local Curated Songs */}
          {(activeTab === 'all' || activeTab === 'songs') && filtered.tracks.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3">
                Curated Songs ({filtered.tracks.length})
              </h3>
              <div className="space-y-1">
                {filtered.tracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} index={i} queueContext={filtered.tracks} />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(activeTab === 'all' || activeTab === 'artists') && filtered.artists.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                Artists ({filtered.artists.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {filtered.artists.map((artist) => (
                  <CardItem
                    key={artist.id}
                    title={artist.name}
                    subtitle={artist.genres.join(', ')}
                    image={artist.image}
                    isCircle={true}
                    onClick={() => setSelectedArtist(artist)}
                    onPlay={() => {
                      const track = INITIAL_TRACKS.find(
                        (t) => t.artist === artist.name || artist.topTrackIds?.includes(t.id)
                      );
                      if (track) playTrack(track);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums & Playlists Section ("in albums show playlists") */}
          {(activeTab === 'all' || activeTab === 'albums') && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 mb-3">
                Albums & Playlists ({filtered.playlists.length + filtered.albums.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Show Playlists in Albums */}
                {filtered.playlists.map((pl) => (
                  <CardItem
                    key={`alb-pl-${pl.id}`}
                    title={pl.title}
                    subtitle={`${pl.tracks?.length || 0} songs • Playlist`}
                    image={pl.cover || INITIAL_TRACKS[0].thumbnail}
                    onClick={() => setSelectedPlaylist(pl)}
                    onPlay={() => {
                      if (pl.tracks && pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 0);
                    }}
                  />
                ))}
                {filtered.albums.map((album) => (
                  <CardItem
                    key={album.id}
                    title={album.title}
                    subtitle={album.artist}
                    image={album.cover}
                    onClick={() => setSelectedAlbum(album)}
                    onPlay={() => {
                      const firstTrack = INITIAL_TRACKS.find(
                        (t) => t.album === album.title || album.trackIds.includes(t.id)
                      );
                      if (firstTrack) playTrack(firstTrack);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {(activeTab === 'all' || activeTab === 'playlists') && filtered.playlists.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
                Playlists ({filtered.playlists.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.playlists.map((pl) => (
                  <CardItem
                    key={pl.id}
                    title={pl.title}
                    subtitle={`${pl.tracks?.length || 0} songs • ${pl.createdBy}`}
                    image={pl.cover || INITIAL_TRACKS[0].thumbnail}
                    onClick={() => setSelectedPlaylist(pl)}
                    onPlay={() => {
                      if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 0);
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modals for Drilldown */}
      <ArtistDetailModal
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
      <AlbumDetailModal
        album={selectedAlbum}
        onClose={() => setSelectedAlbum(null)}
      />
      <PlaylistDetailModal
        playlist={selectedPlaylist}
        onClose={() => setSelectedPlaylist(null)}
      />
    </div>
  );
};
