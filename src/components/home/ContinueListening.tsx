import React from 'react';
import { Track } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause } from 'lucide-react';

interface ContinueListeningProps {
  tracks: Track[];
}

export const ContinueListening: React.FC<ContinueListeningProps> = ({ tracks }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
            Continue Listening
          </h2>
          <p className="text-xs text-slate-400">Pick up right where you left off</p>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-center gap-3.5 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tracks.map((track, idx) => {
          const isCurrent = currentTrack?.id === track.id;
          const isPlayingCurrent = isCurrent && isPlaying;
          // Progress simulation (e.g. 35% - 75% for history items)
          const simulatedProgress = 35 + ((idx * 17) % 50);

          return (
            <div
              key={`${track.id}-${idx}`}
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                } else {
                  playTrack(track);
                }
              }}
              className="flex-shrink-0 w-44 sm:w-48 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group shadow-lg"
            >
              {/* Artwork with resume play button */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 shadow-md">
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <div className="p-3 rounded-full bg-cyan-400 text-black shadow-xl">
                    {isPlayingCurrent ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Progress Bar (Requirement 5) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(0,210,255,0.7)]"
                    style={{ width: `${simulatedProgress}%` }}
                  />
                </div>
              </div>

              {/* Title & Artist */}
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                {track.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {track.artist}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
