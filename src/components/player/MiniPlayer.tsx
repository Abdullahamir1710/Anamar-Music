import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Download,
  ListMusic,
  FileText,
  Maximize2,
  Check,
  Disc3,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { downloadManager } from '../../services/downloadManager';
import { cleanSongTitle } from '../../services/musicCatalog';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    bufferedTime,
    volume,
    isMuted,
    shuffle,
    repeat,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    isLiked,
    toggleLike,
    setFullPlayerOpen,
    setLyricsOpen,
    setQueueOpen,
    setAmbientOpen,
  } = usePlayer();

  const [downloading, setDownloading] = useState(false);

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const downloaded = downloadManager.isDownloaded(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloaded) return;
    setDownloading(true);
    await downloadManager.startDownload(currentTrack);
    setDownloading(false);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-14 md:bottom-0 left-0 right-0 z-30 anamar-player-glass px-3 sm:px-6 py-2.5 transition-all shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      {/* Mobile progress indicator line on top of player */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 md:hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Track Info & Artwork */}
        <div
          onClick={() => setFullPlayerOpen(true)}
          className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial md:w-64 cursor-pointer group"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800 shadow-md">
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-400 transition">
              {cleanSongTitle(currentTrack.title)}
            </p>
            <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
              className={`p-1.5 rounded-lg transition ${
                liked ? 'text-pink-500 fill-pink-500' : 'text-slate-400 hover:text-white'
              }`}
              title={liked ? 'Unlike' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>

            {currentTrack.canDownload && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`p-1.5 rounded-lg transition ${
                  downloaded ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Download Track"
              >
                {downloaded ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Download className={`w-4 h-4 ${downloading ? 'animate-bounce text-cyan-400' : ''}`} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Center: Playback Controls & Desktop Seek Bar */}
        <div className="flex flex-col items-center flex-1 max-w-xl px-2">
          <div className="flex items-center gap-3 sm:gap-5 mb-1">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-lg transition hidden sm:block ${
                shuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={prev}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition active:scale-95"
              title="Previous"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* Glowing Main Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black shadow-[0_0_20px_rgba(0,210,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white transition active:scale-95"
              title="Next"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition hidden sm:block ${
                repeat !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Desktop Progress Bar with accurate timing */}
          <div className="hidden md:flex items-center gap-2.5 w-full">
            <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-4 group cursor-pointer">
              {/* Buffered background */}
              <div
                className="absolute h-1 bg-white/20 rounded-full pointer-events-none"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Range input */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                className="w-full h-1 relative z-10 appearance-none bg-transparent"
                style={{
                  background: `linear-gradient(to right, #00D2FF 0%, #7A5CFF ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
                }}
              />
            </div>

            <span className="text-[11px] font-mono text-slate-400 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Lyrics, Queue, Volume, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 justify-end md:w-64">
          <button
            onClick={() => setLyricsOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
            title="Lyrics"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => setQueueOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 transition"
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Enhanced Volume control on desktop (0% to 150%) */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-pink-400" />
              ) : (
                <Volume2 className={`w-4 h-4 ${volume > 1.0 ? 'text-cyan-400' : ''}`} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            {/* 150% Volume Boost Indicator / Toggle */}
            <button
              onClick={() => setVolume(volume >= 1.45 ? 1.0 : 1.5)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap shrink-0 transition cursor-pointer ${
                volume > 1.0
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                  : 'bg-white/10 text-slate-400 hover:text-cyan-300'
              }`}
              title="Enhance volume to 150%"
            >
              {volume > 1.0 ? `${Math.round(volume * 100)}%` : 'Boost'}
            </button>
          </div>

          {/* Ambient CD Mode Button */}
          <button
            onClick={() => setAmbientOpen(true)}
            className="p-2 rounded-xl text-cyan-400 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition group cursor-pointer flex items-center gap-1.5"
            title="Ambient Mode (CD & Synced Lyrics)"
          >
            <Disc3 className="w-4 h-4 text-cyan-400 group-hover:rotate-180 transition-transform duration-700" />
            <span className="hidden xl:inline text-[11px] font-bold">Ambient</span>
          </button>

          <button
            onClick={() => setFullPlayerOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
