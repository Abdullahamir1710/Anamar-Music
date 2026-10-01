import React from 'react';
import { Artist } from '../../types/music';
import { UserCheck, UserPlus, Play } from 'lucide-react';

interface ArtistCircleCardProps {
  artist: Artist;
  onClick: (artist: Artist) => void;
  onPlayTop?: (artist: Artist) => void;
}

export const ArtistCircleCard: React.FC<ArtistCircleCardProps> = ({
  artist,
  onClick,
  onPlayTop,
}) => {
  const formatListeners = (num?: number) => {
    if (!num) return '';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M listeners`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K listeners`;
    return `${num} listeners`;
  };

  return (
    <div
      onClick={() => onClick(artist)}
      className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group min-w-[120px] sm:min-w-[140px]"
    >
      {/* Circular Artist Image with Neon Glow Hover */}
      <div className="relative mb-3">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-cyan-500/20 group-hover:border-cyan-400 shadow-lg group-hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] transition-all duration-300">
          <img
            src={artist.image}
            alt={artist.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Hover quick play button */}
        {onPlayTop && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayTop(artist);
            }}
            aria-label={`Play top song by ${artist.name}`}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-cyan-400 text-slate-950 shadow-lg opacity-0 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Artist Name */}
      <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate whitespace-nowrap max-w-[130px]">
        {artist.name}
      </h3>

      {/* Listener count (Requirement 17: only if provided) */}
      {artist.monthlyListeners ? (
        <p className="text-[11px] text-slate-400 truncate whitespace-nowrap mt-0.5">
          {formatListeners(artist.monthlyListeners)}
        </p>
      ) : (
        <p className="text-[11px] text-slate-400 truncate whitespace-nowrap mt-0.5">Artist</p>
      )}
    </div>
  );
};
