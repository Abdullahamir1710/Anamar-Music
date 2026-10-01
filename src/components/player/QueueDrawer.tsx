import React from 'react';
import { X, Trash2, Sparkles, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { recommendationService } from '../../services/recommendationService';

export const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    playTrack,
    removeFromQueue,
    clearQueue,
    isQueueOpen,
    setQueueOpen,
    addToQueue,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const handleAddSmartRecommendations = () => {
    if (!currentTrack) return;
    const similar = recommendationService.getSimilarSongs(currentTrack.id, 4);
    similar.forEach((t) => {
      if (!queue.some((q) => q.id === t.id)) {
        addToQueue(t);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-[#0E131F] border-l border-cyan-500/20 flex flex-col text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-slate-100">Play Queue</h3>
            <p className="text-xs text-slate-400">{queue.length} songs in queue</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearQueue}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-xl transition text-xs flex items-center gap-1.5"
              title="Clear Queue"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
            <button
              onClick={() => setQueueOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Now Playing */}
          {currentTrack && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Now Playing
              </p>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-cyan-300 truncate">
                    {currentTrack.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                </div>
                {isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
                )}
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Next In Queue
              </p>
              <button
                onClick={handleAddSmartRecommendations}
                className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Auto-Fill</span>
              </button>
            </div>

            {queue.length <= 1 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                Queue is empty. Use Smart Auto-Fill or add tracks from search!
              </div>
            ) : (
              <div className="space-y-1">
                {queue.map((track, idx) => {
                  if (idx === currentIndex) return null;
                  return (
                    <div
                      key={`${track.id}-${idx}`}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition"
                    >
                      <div
                        onClick={() => playTrack(track, queue, idx)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 truncate">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromQueue(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
