import React from 'react';
import { Album } from '../../types/music';
import { Play } from 'lucide-react';

interface AlbumSquareCardProps {
  album: Album;
  onClick: (album: Album) => void;
  onPlayAlbum?: (album: Album) => void;
}

export const AlbumSquareCard: React.FC<AlbumSquareCardProps> = ({
  album,
  onClick,
  onPlayAlbum,
}) => {
  return (
    <div
      onClick={() => onClick(album)}
      className="flex flex-col p-3 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-cyan-500/20 transition-all duration-200 cursor-pointer group min-w-[140px] sm:min-w-[160px] max-w-[200px]"
    >
      {/* Square Album Cover with Play on Hover */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/10 group-hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] transition-all">
        <img
          src={album.cover}
          alt={album.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover play button */}
        {onPlayAlbum && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAlbum(album);
            }}
            aria-label={`Play album ${album.title}`}
            className="absolute bottom-2.5 right-2.5 p-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Album Title */}
      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate whitespace-nowrap">
        {album.title}
      </h4>

      {/* Artist & Year (Requirement 18: only display year if available) */}
      <p className="text-[11px] text-slate-400 truncate whitespace-nowrap mt-0.5">
        <span>{album.artist}</span>
        {album.year && <span> • {album.year}</span>}
      </p>
    </div>
  );
};
