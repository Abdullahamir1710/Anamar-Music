import React from 'react';
import { Playlist, Track } from '../../types/music';
import { X, Play, ListMusic, Music, Heart, Check, Download } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { cleanSongTitle } from '../../services/musicCatalog';
import { downloadManager } from '../../services/downloadManager';

interface PlaylistDetailModalProps {
  playlist: Playlist | null;
  onClose: () => void;
}

export const PlaylistDetailModal: React.FC<PlaylistDetailModalProps> = ({ playlist, onClose }) => {
  const { playTrack, currentTrack, isPlaying, isLiked, toggleLike } = usePlayer();

  if (!playlist) return null;

  const tracks = playlist.tracks || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-3xl bg-[#0D121F] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,210,255,0.25)] p-4 sm:p-6 flex flex-col overflow-hidden space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Playlist Header - Pinned */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left shrink-0 pr-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 border border-cyan-500/25 shadow-[0_0_20px_rgba(0,210,255,0.2)]">
            <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-1.5 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Curated Playlist Collection
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white truncate">{playlist.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {playlist.description || 'Curated high-fidelity playlist featuring full studio masters.'}
            </p>
            <p className="text-xs text-slate-400">
              Created by <span className="text-cyan-300 font-semibold">{playlist.createdBy}</span> • {tracks.length} tracks
            </p>

            {tracks.length > 0 && (
              <div className="pt-1 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => playTrack(tracks[0], tracks, 0)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Full Playlist</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracklist (Multiple songs!) - Scrollable within visible screen */}
        <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-3 border-t border-white/5 overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider font-bold shrink-0 px-2">
            <span>Songs ({tracks.length})</span>
            <span>Duration</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            {tracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id && isPlaying;
              const formatTime = (secs: number) => {
                const m = Math.floor(secs / 60);
                const s = Math.floor(secs % 60);
                return `${m}:${s < 10 ? '0' : ''}${s}`;
              };

              return (
                <div
                  key={`${track.id}-${i}`}
                  onClick={() => playTrack(track, tracks, i)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition cursor-pointer group ${
                    isCurrent
                      ? 'bg-cyan-500/15 border border-cyan-500/30'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-bold text-slate-500 w-5 text-center shrink-0">
                      {i + 1}
                    </span>
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`text-xs font-bold truncate whitespace-nowrap ${
                          isCurrent ? 'text-cyan-400' : 'text-white group-hover:text-cyan-300'
                        }`}
                      >
                        {cleanSongTitle(track.title)}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate whitespace-nowrap">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track, tracks, i);
                      }}
                      className="p-2 rounded-full text-slate-400 group-hover:text-cyan-400 transition"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
