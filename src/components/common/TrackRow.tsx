import React, { useState } from 'react';
import { Play, Pause, Heart, Download, Check, MoreVertical, ListPlus, FileText } from 'lucide-react';
import { Track } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { downloadManager } from '../../services/downloadManager';
import { cleanSongTitle } from '../../services/musicCatalog';

interface TrackRowProps {
  track: Track;
  index: number;
  queueContext?: Track[];
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index, queueContext }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike, addToQueue, setLyricsOpen } = usePlayer();
  const [downloading, setDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const liked = isLiked(track.id);
  const downloaded = downloadManager.isDownloaded(track.id);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext, index);
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloaded) return;
    setDownloading(true);
    await downloadManager.startDownload(track);
    setDownloading(false);
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'bg-cyan-500/10 border border-cyan-500/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {/* Left: Index / Play Icon & Track Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 mr-2">
        <div className="w-6 text-center shrink-0 flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-cyan-400 rounded-full animate-wave-1"></span>
              <span className="w-1 bg-purple-500 rounded-full animate-wave-2"></span>
              <span className="w-1 bg-pink-500 rounded-full animate-wave-3"></span>
            </div>
          ) : (
            <>
              <span className="text-xs text-slate-400 font-mono group-hover:hidden">
                {index + 1}
              </span>
              <Play className="w-4 h-4 text-cyan-400 hidden group-hover:block fill-cyan-400" />
            </>
          )}
        </div>

        <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-slate-800 shadow">
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-[1px]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <p
              className={`text-xs sm:text-sm font-semibold truncate ${
                isCurrent ? 'text-cyan-400' : 'text-slate-100 group-hover:text-white'
              }`}
            >
              {cleanSongTitle(track.title)}
            </p>
          </div>
          <p className="text-xs text-slate-400 truncate">
            {track.artist}
            {track.album && <span className="opacity-60"> • {track.album}</span>}
          </p>
        </div>
      </div>

      {/* Middle: Genre pill (desktop) */}
      <div className="hidden md:block text-xs text-slate-400 px-3 w-28 truncate">
        {track.genre}
      </div>

      {/* Right: Actions & Duration */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          aria-label={liked ? 'Unlike' : 'Like'}
          className={`p-1.5 rounded-lg transition ${
            liked ? 'text-pink-500 fill-pink-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>

        {track.canDownload && (
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            aria-label="Download track"
            className={`p-1.5 rounded-lg transition ${
              downloaded
                ? 'text-cyan-400'
                : downloading
                ? 'text-cyan-400 animate-spin'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {downloaded ? (
              <Check className="w-4 h-4 text-cyan-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentTrack?.id !== track.id) {
              playTrack(track, queueContext, index);
            }
            setLyricsOpen(true);
          }}
          aria-label="View Lyrics"
          title="View Synchronized Lyrics"
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition"
        >
          <FileText className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(track);
          }}
          aria-label="Add to Queue"
          title="Add to Queue"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition hidden sm:block"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        <span className="text-xs text-slate-400 font-mono w-10 text-right">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
};
