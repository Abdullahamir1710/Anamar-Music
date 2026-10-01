import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Download,
  FileText,
  ListMusic,
  Volume2,
  VolumeX,
  Check,
  Share2,
  Disc3,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { downloadManager } from '../../services/downloadManager';
import { cleanSongTitle } from '../../services/musicCatalog';
import { Logo } from '../common/Logo';

export const FullPlayerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
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
    isFullPlayerOpen,
    setFullPlayerOpen,
    setLyricsOpen,
    setQueueOpen,
    setAmbientOpen,
  } = usePlayer();

  const [downloading, setDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const downloaded = downloadManager.isDownloaded(currentTrack.id);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleDownload = async () => {
    if (downloaded) return;
    setDownloading(true);
    await downloadManager.startDownload(currentTrack);
    setDownloading(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${currentTrack.title} - Anamar Music`,
        text: `Listen to ${currentTrack.title} by ${currentTrack.artist} on Anamar Music`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07090E] text-white overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Background Ambient Glow derived from Logo & Artwork */}
      <div
        className="absolute inset-0 opacity-25 filter blur-3xl pointer-events-none scale-125"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 35%, #00D2FF 0%, #7A5CFF 40%, #07090E 80%)`,
        }}
      />

      {/* Top Bar: Close / Header with Official Logo / Share */}
      <header className="relative z-10 flex items-center justify-between p-3 sm:p-5 shrink-0 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <button
          onClick={() => setFullPlayerOpen(false)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-slate-300 hover:text-white cursor-pointer"
          aria-label="Close Full Player"
        >
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-2">
          <Logo size={28} showText={true} />
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition text-slate-300 hover:text-white cursor-pointer"
          aria-label="Share Song"
        >
          {copiedShare ? (
            <Check className="w-5 h-5 text-cyan-400" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Center Content: Artwork & Complete Controls (ALWAYS visible within visible screen) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-4 sm:px-6 py-2 sm:py-3 max-w-lg mx-auto w-full min-h-0 overflow-hidden">
        {/* Album Artwork / Disc Preview - Responsively Clamped so it NEVER pushes controls offscreen */}
        <div className="relative w-full aspect-square max-h-[34vh] max-w-[34vh] sm:max-h-[38vh] sm:max-w-[38vh] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 group shrink-1 my-auto">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
          />
          {/* Subtle official logo watermark */}
          <div className="absolute top-3 left-3 p-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10">
            <img src="/anamar-logo.svg" alt="Anamar Logo" className="w-5 h-5 object-contain" />
          </div>
        </div>

        {/* Track Meta & Like */}
        <div className="flex items-center justify-between w-full my-1.5 shrink-0">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-base sm:text-xl font-black truncate text-slate-100 anamar-gradient-text">
              {cleanSongTitle(currentTrack.title)}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">
              {currentTrack.artist}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full transition cursor-pointer ${
                liked
                  ? 'text-pink-500 fill-pink-500 bg-pink-500/10'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>

            {currentTrack.canDownload && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`p-2 rounded-full transition cursor-pointer ${
                  downloaded
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                {downloaded ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Seek Slider */}
        <div className="w-full my-1 shrink-0">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => seek(parseFloat(e.target.value))}
            className="w-full h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #00D2FF 0%, #7A5CFF ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between w-full max-w-sm my-1.5 shrink-0">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition cursor-pointer ${
              shuffle ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={prev}
            className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white active:scale-95 transition cursor-pointer"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500 text-black shadow-[0_0_25px_rgba(0,210,255,0.7)] hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white active:scale-95 transition cursor-pointer"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition cursor-pointer ${
              repeat !== 'off' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Volume & Extras (Lyrics, Ambient CD, Boost) - ALWAYS visible in visible screen */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-white/10 flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFullPlayerOpen(false);
                setLyricsOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={() => {
                setFullPlayerOpen(false);
                setAmbientOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(0,210,255,0.2)]"
              title="Ambient CD Mode"
            >
              <Disc3 className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <span>Ambient CD</span>
            </button>
          </div>

          {/* Enhanced Volume slider (0% to 150%) */}
          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-2xl border border-white/10">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white cursor-pointer">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-pink-400" />
              ) : (
                <Volume2 className={`w-3.5 h-3.5 ${volume > 1.0 ? 'text-cyan-400' : ''}`} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <button
              onClick={() => setVolume(volume >= 1.45 ? 1.0 : 1.5)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap shrink-0 transition cursor-pointer ${
                volume > 1.0
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                  : 'bg-white/10 text-slate-400 hover:text-cyan-300'
              }`}
              title="Enhance volume up to 150%"
            >
              {volume > 1.0 ? `${Math.round(volume * 100)}%` : 'Boost'}
            </button>
          </div>

          <button
            onClick={() => {
              setFullPlayerOpen(false);
              setQueueOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold transition cursor-pointer"
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
