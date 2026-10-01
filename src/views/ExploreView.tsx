import React, { useState } from 'react';
import { Compass, Sparkles, Disc, Radio, TrendingUp, ListMusic } from 'lucide-react';
import { INITIAL_TRACKS, ARTISTS_CATALOG, FEATURED_PLAYLISTS, GENRES, MOODS } from '../services/musicCatalog';
import { ALL_UNIQUE_ARTISTS, ALL_UNIQUE_ALBUMS } from '../services/expandedCatalog';
import { TrackRow } from '../components/common/TrackRow';
import { CardItem } from '../components/common/CardItem';
import { ArtistDetailModal } from '../components/home/ArtistDetailModal';
import { AlbumDetailModal } from '../components/home/AlbumDetailModal';
import { PlaylistDetailModal } from '../components/home/PlaylistDetailModal';
import { usePlayer } from '../context/PlayerContext';
import { Artist, Album, Playlist } from '../types/music';

export const ExploreView: React.FC = () => {
  const { playTrack } = usePlayer();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Pagination for Spotlight Artists: 50 at a time, zero duplicates
  const [visibleArtistsCount, setVisibleArtistsCount] = useState<number>(50);
  const [isLoadingMoreArtists, setIsLoadingMoreArtists] = useState<boolean>(false);

  // Pagination for Spotlight Albums: 50 at a time, zero duplicates
  const [visibleAlbumsCount, setVisibleAlbumsCount] = useState<number>(50);
  const [isLoadingMoreAlbums, setIsLoadingMoreAlbums] = useState<boolean>(false);

  const displayedArtists = ALL_UNIQUE_ARTISTS.slice(0, visibleArtistsCount);
  const hasMoreArtists = visibleArtistsCount < ALL_UNIQUE_ARTISTS.length;

  const loadMoreArtists = () => {
    if (isLoadingMoreArtists || !hasMoreArtists) return;
    setIsLoadingMoreArtists(true);
    setTimeout(() => {
      setVisibleArtistsCount((prev) => prev + 50);
      setIsLoadingMoreArtists(false);
    }, 300);
  };

  const displayedAlbums = ALL_UNIQUE_ALBUMS.slice(0, visibleAlbumsCount);
  const hasMoreAlbums = visibleAlbumsCount < ALL_UNIQUE_ALBUMS.length;

  const loadMoreAlbums = () => {
    if (isLoadingMoreAlbums || !hasMoreAlbums) return;
    setIsLoadingMoreAlbums(true);
    setTimeout(() => {
      setVisibleAlbumsCount((prev) => prev + 50);
      setIsLoadingMoreAlbums(false);
    }, 300);
  };

  const filteredTracks = INITIAL_TRACKS.filter((t) => {
    const genreMatch = selectedGenre === 'All' || t.genre === selectedGenre;
    const moodMatch = selectedMood === 'All' || t.mood === selectedMood;
    return genreMatch && moodMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Compass className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider anamar-gradient-text">
            Explore
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          Discover trending releases, regional charts, and curated sonic vibes.
        </p>
      </div>

      {/* Genre Filter Pills */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Filter by Genre
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedGenre === g
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-600 text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Mood Filter Pills */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Filter by Mood
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedMood === m
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Filtered Track Results */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">
            {selectedGenre === 'All' && selectedMood === 'All'
              ? 'Trending Charts'
              : `${selectedGenre} • ${selectedMood}`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              queueContext={filteredTracks}
            />
          ))}
        </div>
      </section>

      {/* Spotlight Artists: Exactly 50 items per batch, Zero Duplicates */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Spotlight Artists ({ALL_UNIQUE_ARTISTS.length})
            </h2>
          </div>
          <span className="text-xs text-purple-400 font-semibold">
            Showing {displayedArtists.length} unique artists • 50 per batch
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {displayedArtists.map((a) => (
            <CardItem
              key={`explore-art-${a.id}`}
              title={a.name}
              subtitle={a.monthlyListeners ? `${(a.monthlyListeners / 1000000).toFixed(1)}M listeners` : (a.genres[0] || 'Artist')}
              image={a.image}
              isCircle={true}
              onClick={() => setSelectedArtist(a)}
              onPlay={() => {
                const track = INITIAL_TRACKS.find(
                  (t) => t.artist === a.name || a.topTrackIds?.includes(t.id)
                );
                if (track) playTrack(track);
              }}
            />
          ))}
        </div>

        <div className="flex justify-center pt-2">
          {hasMoreArtists ? (
            <button
              onClick={loadMoreArtists}
              disabled={isLoadingMoreArtists}
              className="px-8 py-2.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(168,85,247,0.15)] active:scale-95"
            >
              {isLoadingMoreArtists ? 'Loading 50 More Artists...' : 'Load More Artists (+50)'}
            </button>
          ) : (
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
              All {ALL_UNIQUE_ARTISTS.length} Unique Artists Loaded
            </div>
          )}
        </div>
      </section>

      {/* Spotlight Albums: Exactly 50 items per batch, Zero Duplicates */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Featured Studio Albums ({ALL_UNIQUE_ALBUMS.length})
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-semibold">
            Showing {displayedAlbums.length} unique albums • 50 per batch
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayedAlbums.map((album) => (
            <CardItem
              key={`explore-alb-${album.id}`}
              title={album.title}
              subtitle={`${album.artist} • ${album.year}`}
              image={album.cover}
              onClick={() => setSelectedAlbum(album)}
              onPlay={() => {
                const track = INITIAL_TRACKS.find(
                  (t) => t.album === album.title || album.trackIds?.includes(t.id) || t.artist === album.artist
                );
                if (track) playTrack(track);
              }}
            />
          ))}
        </div>

        <div className="flex justify-center pt-2">
          {hasMoreAlbums ? (
            <button
              onClick={loadMoreAlbums}
              disabled={isLoadingMoreAlbums}
              className="px-8 py-2.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,210,255,0.15)] active:scale-95"
            >
              {isLoadingMoreAlbums ? 'Loading 50 More Albums...' : 'Load More Albums (+50)'}
            </button>
          ) : (
            <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
              All {ALL_UNIQUE_ALBUMS.length} Unique Albums Loaded
            </div>
          )}
        </div>
      </section>

      {/* Curated Playlists (Playlists with multiple songs instead of single music folders) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Featured Playlists & Collections
            </h2>
          </div>
          <span className="text-xs text-cyan-400 font-semibold">Multiple tracks per playlist</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {FEATURED_PLAYLISTS.map((pl) => (
            <CardItem
              key={pl.id}
              title={pl.title}
              subtitle={`${pl.tracks?.length || 0} songs • ${pl.createdBy}`}
              image={pl.cover || INITIAL_TRACKS[0].thumbnail}
              onClick={() => setSelectedPlaylist(pl)}
              onPlay={() => {
                if (pl.tracks && pl.tracks.length > 0) {
                  playTrack(pl.tracks[0], pl.tracks, 0);
                }
              }}
            />
          ))}
        </div>
      </section>

      {/* Modals */}
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
