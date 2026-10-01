import React from 'react';
import { Artist, Track } from '../../types/music';
import { X, Play, Heart, Users, Sparkles, ExternalLink, Disc, ListMusic } from 'lucide-react';
import { INITIAL_TRACKS, FEATURED_PLAYLISTS, cleanSongTitle } from '../../services/musicCatalog';
import { ALL_UNIQUE_ALBUMS } from '../../services/expandedCatalog';
import { usePlayer } from '../../context/PlayerContext';

interface ArtistDetailModalProps {
  artist: Artist | null;
  onClose: () => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, onClose }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  if (!artist) return null;

  const artistTracks = INITIAL_TRACKS.filter(
    (t) => t.artist.toLowerCase().includes(artist.name.toLowerCase()) || 
           artist.name.toLowerCase().includes(t.artist.toLowerCase()) || 
           t.artistId === artist.id || 
           artist.topTrackIds?.includes(t.id)
  );

  const artistAlbums = ALL_UNIQUE_ALBUMS.filter(
    (alb) => alb.artist.toLowerCase().includes(artist.name.toLowerCase()) ||
             artist.name.toLowerCase().includes(alb.artist.toLowerCase()) ||
             alb.artistId === artist.id
  );

  const artistPlaylists = FEATURED_PLAYLISTS.filter(
    (pl) => pl.title.toLowerCase().includes(artist.name.toLowerCase()) ||
            pl.tracks.some(t => t.artist.toLowerCase().includes(artist.name.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] flex flex-col rounded-3xl bg-[#0D121F] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,210,255,0.2)] p-4 sm:p-6 overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Artist Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shrink-0 border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,210,255,0.3)]">
            <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Verified Artist
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{artist.name}</h2>
            {artist.monthlyListeners && (
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{artist.monthlyListeners.toLocaleString()} monthly listeners</span>
              </p>
            )}
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">{artist.bio}</p>

            {artistTracks.length > 0 && (
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => playTrack(artistTracks[0], artistTracks, 0)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Top Tracks</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Tracks & Content - Fits inside visible screen */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-4 pr-1">
          {/* Top Tracks */}
          {artistTracks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Top Songs
            </h3>
            <div className="space-y-2">
              {artistTracks.map((track, i) => {
                const isCurrent = currentTrack?.id === track.id && isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, artistTracks, i)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-4 text-center">
                        {i + 1}
                      </span>
                      <img
                        src={track.thumbnail}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'
                          }`}
                        >
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-slate-400">{track.album || 'Single'}</p>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Albums & Playlists by this Artist */}
        {(artistPlaylists.length > 0 || artistAlbums.length > 0) && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Albums & Curated Playlists
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {artistPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    if (pl.tracks.length > 0) playTrack(pl.tracks[0], pl.tracks, 0);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 cursor-pointer transition group"
                >
                  <img
                    src={pl.cover}
                    alt={pl.title}
                    className="w-full aspect-square rounded-xl object-cover mb-2"
                  />
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 truncate whitespace-nowrap">
                    {pl.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate whitespace-nowrap">
                    {pl.tracks.length} songs • Playlist
                  </p>
                </div>
              ))}
              {artistAlbums.map((alb) => (
                <div
                  key={alb.id}
                  onClick={() => {
                    const tracks = INITIAL_TRACKS.filter((t) => t.album === alb.title || alb.trackIds.includes(t.id));
                    if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
                  }}
                  className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 cursor-pointer transition group"
                >
                  <img
                    src={alb.cover}
                    alt={alb.title}
                    className="w-full aspect-square rounded-xl object-cover mb-2"
                  />
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 truncate whitespace-nowrap">
                    {alb.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate whitespace-nowrap">
                    Album • {alb.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
