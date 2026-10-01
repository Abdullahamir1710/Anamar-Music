import React, { useState, useEffect } from 'react';
import {
  Library,
  Heart,
  Clock,
  Download,
  ListPlus,
  Plus,
  Trash2,
  Play,
  Shuffle,
  Disc,
  Users,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { storageService } from '../services/storage';
import { INITIAL_TRACKS, ARTISTS_CATALOG, ALBUMS_CATALOG, FEATURED_PLAYLISTS } from '../services/musicCatalog';
import { ALL_UNIQUE_ARTISTS, ALL_UNIQUE_ALBUMS } from '../services/expandedCatalog';
import { Track, Playlist, Artist, Album } from '../types/music';
import { TrackRow } from '../components/common/TrackRow';
import { CardItem } from '../components/common/CardItem';
import { ArtistDetailModal } from '../components/home/ArtistDetailModal';
import { AlbumDetailModal } from '../components/home/AlbumDetailModal';
import { PlaylistDetailModal } from '../components/home/PlaylistDetailModal';
import { DownloadsView } from '../components/downloads/DownloadsView';

interface LibraryViewProps {
  initialSubTab?: 'liked' | 'history' | 'downloads' | 'playlists' | 'albums' | 'artists';
}

export const LibraryView: React.FC<LibraryViewProps> = ({ initialSubTab = 'liked' }) => {
  const { playTrack, likedTrackIds } = usePlayer();
  const [subTab, setSubTab] = useState<'liked' | 'history' | 'downloads' | 'playlists' | 'albums' | 'artists'>(
    initialSubTab
  );

  const [playlists, setPlaylists] = useState<Playlist[]>(() => storageService.getPlaylists());
  const [history, setHistory] = useState<{ track: Track; playedAt: number }[]>(() =>
    storageService.getHistory()
  );
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // 50 Items per batch without repetition (Requirement: load 50 artists / albums after every load more)
  const [visibleArtistCount, setVisibleArtistCount] = useState<number>(50);
  const [isLoadingMoreArtists, setIsLoadingMoreArtists] = useState<boolean>(false);

  const [visibleAlbumCount, setVisibleAlbumCount] = useState<number>(50);
  const [isLoadingMoreAlbums, setIsLoadingMoreAlbums] = useState<boolean>(false);

  // Combine featured playlists and saved playlists
  const allPlaylists = [...FEATURED_PLAYLISTS, ...playlists.filter(p => !FEATURED_PLAYLISTS.some(fp => fp.id === p.id))];

  // Unique artists: never repeat, load 50 at a time
  const displayedArtists = ALL_UNIQUE_ARTISTS.slice(0, visibleArtistCount);
  const hasMoreArtists = visibleArtistCount < ALL_UNIQUE_ARTISTS.length;

  const loadMoreArtists = () => {
    if (isLoadingMoreArtists || !hasMoreArtists) return;
    setIsLoadingMoreArtists(true);
    setTimeout(() => {
      setVisibleArtistCount((prev) => prev + 50);
      setIsLoadingMoreArtists(false);
    }, 300);
  };

  // Unique albums: never repeat, load 50 at a time
  const displayedAlbums = ALL_UNIQUE_ALBUMS.slice(0, visibleAlbumCount);
  const hasMoreAlbums = visibleAlbumCount < ALL_UNIQUE_ALBUMS.length;

  const loadMoreAlbums = () => {
    if (isLoadingMoreAlbums || !hasMoreAlbums) return;
    setIsLoadingMoreAlbums(true);
    setTimeout(() => {
      setVisibleAlbumCount((prev) => prev + 50);
      setIsLoadingMoreAlbums(false);
    }, 300);
  };

  useEffect(() => {
    setHistory(storageService.getHistory());
    setPlaylists(storageService.getPlaylists());
  }, [subTab]);

  const likedTracks = INITIAL_TRACKS.filter((t) => likedTrackIds.includes(t.id));

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPl: Playlist = {
      id: 'pl-custom-' + Date.now(),
      title: newPlaylistName.trim(),
      description: 'Custom Anamar Music Playlist',
      cover: INITIAL_TRACKS[0].thumbnail,
      createdBy: 'You',
      createdAt: Date.now(),
      tracks: [INITIAL_TRACKS[0]],
      isCustom: true,
    };

    storageService.savePlaylist(newPl);
    setPlaylists(storageService.getPlaylists());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.deletePlaylist(id);
    setPlaylists(storageService.getPlaylists());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider anamar-gradient-text">
              Your Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Personal collection, liked songs, history, and offline music.
          </p>
        </div>

        {subTab === 'playlists' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'liked', label: 'Liked Songs', icon: Heart },
          { id: 'history', label: 'Recently Played', icon: Clock },
          { id: 'downloads', label: 'Downloads', icon: Download },
          { id: 'playlists', label: 'Playlists', icon: ListPlus },
          { id: 'albums', label: 'Albums', icon: Disc },
          { id: 'artists', label: 'Artists', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. LIKED SONGS */}
      {subTab === 'liked' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">
              {likedTracks.length} Liked Songs
            </h2>
            {likedTracks.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => playTrack(likedTracks[0], likedTracks, 0)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => {
                    const shuffled = [...likedTracks].sort(() => 0.5 - Math.random());
                    playTrack(shuffled[0], shuffled, 0);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>

          {likedTracks.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#0E131F] border border-white/5">
              <Heart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-bold text-white mb-1">No liked songs yet</p>
              <p className="text-xs text-slate-400">
                Click the heart icon on any track to save it to your favorites.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {likedTracks.map((track, i) => (
                <TrackRow key={track.id} track={track} index={i} queueContext={likedTracks} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. RECENTLY PLAYED */}
      {subTab === 'history' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200">Listening History</h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  storageService.clearHistory();
                  setHistory([]);
                }}
                className="text-xs text-slate-500 hover:text-red-400 font-semibold"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#0E131F] border border-white/5">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-base font-bold text-white mb-1">No history yet</p>
              <p className="text-xs text-slate-400">Songs you listen to will appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((h, i) => (
                <TrackRow
                  key={`${h.track.id}-${i}`}
                  track={h.track}
                  index={i}
                  queueContext={history.map((item) => item.track)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. DOWNLOADS */}
      {subTab === 'downloads' && <DownloadsView />}

      {/* 4. PLAYLISTS */}
      {subTab === 'playlists' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => {
                  if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 0);
                }}
                className="p-4 rounded-2xl bg-[#0E131F] hover:bg-white/[0.04] border border-white/5 hover:border-cyan-500/30 transition cursor-pointer flex items-center justify-between group shadow-lg"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={pl.cover || INITIAL_TRACKS[0].thumbnail}
                    alt={pl.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 truncate">
                      {pl.title}
                    </h4>
                    <p className="text-xs text-slate-400">{pl.tracks.length} tracks</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-full bg-cyan-400 text-black opacity-0 group-hover:opacity-100 transition shadow">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                  {pl.isCustom && (
                    <button
                      onClick={(e) => handleDeletePlaylist(pl.id, e)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. ALBUMS: ZERO DUPLICATES, LOAD 50 AT A TIME */}
      {subTab === 'albums' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-200">
                Studio Albums & Collections ({ALL_UNIQUE_ALBUMS.length})
              </h2>
              <p className="text-xs text-slate-400">
                Showing {displayedAlbums.length} unique studio albums • 50 per batch
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-semibold">Strict Zero-Duplicate Catalog</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedAlbums.map((album) => (
              <CardItem
                key={`alb-${album.id}`}
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

          {/* Albums Load More: loads exactly 50 more unique albums */}
          <div className="flex justify-center pt-4">
            {hasMoreAlbums ? (
              <button
                onClick={loadMoreAlbums}
                disabled={isLoadingMoreAlbums}
                className="px-8 py-3 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,210,255,0.15)] active:scale-95"
              >
                {isLoadingMoreAlbums ? 'Loading 50 More Albums...' : 'Load More Albums (+50)'}
              </button>
            ) : (
              <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
                All {ALL_UNIQUE_ALBUMS.length} Unique Albums Loaded
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. ARTISTS: ZERO DUPLICATES, LOAD 50 AT A TIME */}
      {subTab === 'artists' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-200">
                Explore All Artists ({ALL_UNIQUE_ARTISTS.length})
              </h2>
              <p className="text-xs text-slate-400">
                Showing {displayedArtists.length} unique artists • 50 per batch
              </p>
            </div>
            <span className="text-xs text-cyan-400 font-semibold">Strict Zero-Duplicate Catalog</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {displayedArtists.map((a) => (
              <CardItem
                key={`art-${a.id}`}
                title={a.name}
                subtitle={a.genres[0] || 'Artist'}
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

          {/* Artists Load More: loads exactly 50 more unique artists */}
          <div className="flex justify-center pt-4">
            {hasMoreArtists ? (
              <button
                onClick={loadMoreArtists}
                disabled={isLoadingMoreArtists}
                className="px-8 py-3 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(0,210,255,0.15)] active:scale-95"
              >
                {isLoadingMoreArtists ? 'Loading 50 More Artists...' : 'Load More Artists (+50)'}
              </button>
            ) : (
              <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-medium">
                All {ALL_UNIQUE_ARTISTS.length} Unique Artists Loaded
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for Artists, Albums, and Playlists */}
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

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#0E131F] border border-cyan-500/30 p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold mb-3">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:brightness-110 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
