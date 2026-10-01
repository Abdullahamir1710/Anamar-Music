import React from 'react';
import { Play } from 'lucide-react';

interface CardItemProps {
  title: string;
  subtitle?: string;
  image: string;
  isCircle?: boolean;
  onPlay?: () => void;
  onClick?: () => void;
}

export const CardItem: React.FC<CardItemProps> = ({
  title,
  subtitle,
  image,
  isCircle = false,
  onPlay,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col min-w-0 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-cyan-500/10"
    >
      <div
        className={`relative w-full aspect-square overflow-hidden mb-3 bg-slate-800 ${
          isCircle ? 'rounded-full' : 'rounded-xl'
        }`}
      >
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            aria-label={`Play ${title}`}
            className="absolute bottom-2 right-2 p-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-bold shadow-[0_0_15px_rgba(0,210,255,0.6)] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate whitespace-nowrap group-hover:text-cyan-400 transition-colors">
        {title}
      </h4>
      {subtitle && (
        <p className="text-[11px] sm:text-xs text-slate-400 truncate whitespace-nowrap mt-0.5">{subtitle}</p>
      )}
    </div>
  );
};
