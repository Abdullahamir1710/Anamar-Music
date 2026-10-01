import React from 'react';
import { Album, Track } from '../../types/music';
import { X, Play, Disc } from 'lucide-react';
import { INITIAL_TRACKS } from '../../services/musicCatalog';
import { usePlayer } from '../../context/PlayerContext';

interface AlbumDetailModalProps {
  album: Album | null;
  onClose: () => void;
}

export const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ album, onClose }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  if (!album) return null;

  const albumTracks = INITIAL_TRACKS.filter(
    (t) => t.album === album.title || t.albumId === album.id || album.trackIds?.includes(t.id) || t.artist.toLowerCase() === album.artist.toLowerCase()
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

        {/* Album Header - Pinned */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left shrink-0 pr-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-white/15 shadow-[0_0_20px_rgba(0,210,255,0.25)]">
            <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Studio Album
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">{album.title}</h2>
            <p className="text-xs sm:text-sm font-semibold text-cyan-300 truncate">{album.artist}</p>
            <p className="text-xs text-slate-400">
              Released in {album.year} • {album.genre}
            </p>

            {albumTracks.length > 0 && (
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => playTrack(albumTracks[0], albumTracks, 0)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Full Album</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Album Tracklist - Scrollable */}
        <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-3 border-t border-white/5 overflow-hidden">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 px-1">
            Tracklist ({albumTracks.length})
          </h3>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1.5 pr-1">
            {albumTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, albumTracks, i)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4 text-center">{i + 1}</span>
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
                      <p className="text-[10px] text-slate-400">{track.artist}</p>
                    </div>
                  </div>
                  <Play className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110 transition" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
