import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Maximize,
  Minimize,
  Sparkles,
  Disc3,
  Sliders,
  Radio,
  Check,
  Music2,
  Volume1,
} from 'lucide-react';
import { usePlayer, AudioStreamingQuality } from '../../context/PlayerContext';
import { lyricsService } from '../../services/lyricsService';
import { cleanSongTitle } from '../../services/musicCatalog';
import { LyricLine } from '../../types/music';

export const AmbientPlayerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    isLiked,
    toggleLike,
    isAmbientOpen,
    setAmbientOpen,
    audioQuality,
    setAudioQuality,
  } = usePlayer();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [qualityNotice, setQualityNotice] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'cd' | 'lyrics'>('cd');
  const [lyricOffsetMs, setLyricOffsetMs] = useState(0);

  // Auto-scrolling lyrics container ref
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLButtonElement | null>(null);

  // Keyboard shortcut: ESC to exit Ambient Mode
  useEffect(() => {
    if (!isAmbientOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAmbientOpen]);

  // Fullscreen management
  useEffect(() => {
    if (!isAmbientOpen) return;

    const requestFS = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch {
        // Fullscreen might be restricted in some iframe contexts, fallback to viewport overlay
      }
    };

    requestFS();

    const onFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', onFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFSChange);
    };
  }, [isAmbientOpen]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setAmbientOpen(false);
  };

  // Fetch real synchronized lyrics for current track
  useEffect(() => {
    if (!currentTrack) return;
    let isCancelled = false;
    setLoadingLyrics(true);
    setLyricOffsetMs(lyricsService.getTrackOffset(currentTrack.id));

    lyricsService
      .getLyricsForTrack(currentTrack)
      .then((lines) => {
        if (!isCancelled) {
          setLyrics(lines);
          setLoadingLyrics(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyrics([]);
          setLoadingLyrics(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack]);

  // Current lyric index using Echo music app precision sync
  const activeLineIndex = lyricsService.getCurrentLineIndex(lyrics, currentTime, lyricOffsetMs);

  // Smoothly center the active lyric line in real-time
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  const handleQualityChange = (q: AudioStreamingQuality) => {
    setAudioQuality(q);
    setShowQualityMenu(false);
    const label =
      q === 'lossless'
        ? 'Hi-Res Lossless Master (320 kbps / 24-bit 96kHz)'
        : q === 'high'
        ? 'High Quality (256 kbps AAC)'
        : 'Standard Stream (128 kbps)';
    setQualityNotice(`Streaming: ${label}`);
    setTimeout(() => setQualityNotice(null), 3000);
  };

  if (!isAmbientOpen || !currentTrack) return null;

  const liked = isLiked(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05070B] text-white overflow-hidden select-none animate-in fade-in duration-500">
      {/* ======================================================== */}
      {/* ALWAYS-VISIBLE PERMANENT FLOATING CROSS / CLOSE BUTTON */}
      {/* (Requirement: "always show cross button on ambient mode") */}
      {/* ======================================================== */}
      <button
        onClick={handleClose}
        aria-label="Exit Ambient Mode"
        className="fixed top-3 right-3 sm:top-4 sm:right-6 z-[70] p-2.5 sm:p-3 rounded-full bg-black/75 hover:bg-red-500/25 text-white hover:text-red-400 border border-white/20 hover:border-red-500/50 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-200 active:scale-90 cursor-pointer flex items-center justify-center group"
        title="Exit Ambient Mode (Esc)"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:rotate-90 duration-200" />
      </button>

      {/* Dynamic Ambient Glow Backdrops (Subtle pulsing colors matching album) */}
      <div
        className="absolute inset-0 opacity-35 pointer-events-none filter blur-[120px] scale-150 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 25% 40%, #00D2FF 0%, #7A5CFF 35%, #05070B 75%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-25 pointer-events-none filter blur-[100px] scale-125 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 75% 60%, #FF007A 0%, #00D2FF 35%, transparent 70%)`,
        }}
      />

      {/* Top Ambient Bar */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/5 backdrop-blur-md bg-black/40 pr-14 sm:pr-18 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Official Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <img
              src="/anamar-logo.svg"
              alt="Anamar Music"
              className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(0,210,255,0.7)]"
            />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider hidden sm:inline anamar-gradient-text">
              Anamar
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] sm:text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden xs:inline">Ambient Mode</span>
          </div>

          {/* High Quality Stream Badge & Selector */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="uppercase text-[10px] sm:text-[11px] text-cyan-300">
                {audioQuality === 'lossless'
                  ? 'Hi-Res 320k'
                  : audioQuality === 'high'
                  ? 'High 256k'
                  : 'Standard 128k'}
              </span>
              <Sliders className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Quality Menu Dropdown */}
            {showQualityMenu && (
              <div className="absolute left-0 top-full mt-2 w-72 p-2 rounded-2xl bg-[#0D121F] border border-cyan-500/30 shadow-2xl z-30 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5">
                  Select Streaming Fidelity
                </div>
                {[
                  {
                    id: 'lossless' as const,
                    name: 'Hi-Res Lossless Master',
                    bitrate: '320 kbps • 24-bit / 96kHz FLAC',
                    badge: 'Studio Master',
                  },
                  {
                    id: 'high' as const,
                    name: 'High Quality',
                    bitrate: '256 kbps • Crystal Clear AAC',
                    badge: 'Crisp',
                  },
                  {
                    id: 'standard' as const,
                    name: 'Standard Quality',
                    bitrate: '128 kbps • Efficient Data Saver',
                    badge: 'Economy',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleQualityChange(item.id)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                      audioQuality === item.id
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.bitrate}</p>
                    </div>
                    {audioQuality === item.id && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {qualityNotice && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-in fade-in">
            ✓ {qualityNotice}
          </div>
        )}

        {/* Center Mobile View Selector */}
        <div className="flex lg:hidden items-center p-0.5 rounded-full bg-white/5 border border-white/10 text-xs shrink-0">
          <button
            onClick={() => setMobileTab('cd')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
              mobileTab === 'cd' ? 'bg-cyan-500 text-black shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            CD Player
          </button>
          <button
            onClick={() => setMobileTab('lyrics')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
              mobileTab === 'lyrics' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lyrics
          </button>
        </div>

        {/* Right Header Buttons: Fullscreen & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* Main Ambient View: Two-Side Split Layout */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8 overflow-hidden min-h-0">
        {/* ======================================================== */}
        {/* SIDE 1: HIGH-FIDELITY COMPACT DISC (CD) & PLAYER CONTROLS */}
        {/* (Requirement: CD Area NEVER scrolls down, player controls */}
        {/* ALWAYS remain visible within the visible screen) */}
        {/* ======================================================== */}
        <section
          className={`flex flex-col items-center justify-between text-center lg:border-r lg:border-white/5 lg:pr-6 h-full min-h-0 overflow-hidden py-1 sm:py-2 select-none ${
            mobileTab === 'cd' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Top of CD column: Jewel Cradle with Iridescent Holographic Disc */}
          <div className="flex flex-col items-center justify-center shrink-0 w-full">
            <div className="relative flex items-center justify-center my-1">
              {/* Ambient Neon Back-Disc Halo Aura */}
              <div
                className={`absolute -inset-3 sm:-inset-5 rounded-full opacity-60 filter blur-xl transition-all duration-700 pointer-events-none ${
                  isPlaying ? 'scale-105 opacity-80' : 'scale-95 opacity-40'
                }`}
                style={{
                  background: 'radial-gradient(circle, rgba(0, 210, 255, 0.45) 0%, rgba(168, 85, 247, 0.3) 50%, transparent 75%)',
                }}
              />

              {/* Glowing Compact Disc Turntable Base Ring */}
              <div className="absolute -inset-1.5 sm:-inset-2.5 rounded-full border border-cyan-400/20 bg-gradient-to-b from-white/[0.04] to-black/60 shadow-[0_15px_40px_rgba(0,0,0,0.95)] pointer-events-none" />

              {/* HIGH-CONTRAST REALISTIC COMPACT DISC (CD) */}
              <div
                className={`relative rounded-full border-[4px] sm:border-[5px] border-slate-300/40 transition-all select-none ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{
                  width: 'clamp(140px, 22vh, 250px)',
                  height: 'clamp(140px, 22vh, 250px)',
                  aspectRatio: '1 / 1',
                  animationDuration: '16s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite',
                  background: `radial-gradient(circle at 50% 50%, #252e3d 0%, #171d27 25%, #2a3344 45%, #181d28 65%, #343d50 82%, #141720 100%)`,
                  boxShadow:
                    '0 0 40px rgba(0, 210, 255, 0.4), inset 0 0 25px rgba(255, 255, 255, 0.25), inset 0 0 50px rgba(0, 0, 0, 0.9), 0 15px 40px rgba(0, 0, 0, 0.95)',
                }}
              >
                {/* Outer Polycarbonate Transparent Bevel Rim */}
                <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />

                {/* Concentric Digital Audio Data Tracks (Delicate silver groove tracks) */}
                <div className="absolute inset-2 sm:inset-3 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-4 sm:inset-6 rounded-full border border-white/15 pointer-events-none" />
                <div className="absolute inset-7 sm:inset-9 rounded-full border border-white/10 pointer-events-none" />
                <div className="absolute inset-10 sm:inset-13 rounded-full border border-white/15 pointer-events-none" />

                {/* Spectacular Iridescent Holographic Rainbow Prism Diffraction Sheen */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none mix-blend-screen opacity-55"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 50%, rgba(255, 0, 128, 0.45) 0deg, rgba(0, 210, 255, 0.5) 45deg, rgba(255, 230, 0, 0.45) 90deg, rgba(0, 255, 128, 0.45) 135deg, rgba(0, 210, 255, 0.5) 180deg, rgba(255, 0, 200, 0.45) 225deg, rgba(255, 230, 0, 0.45) 270deg, rgba(0, 210, 255, 0.5) 315deg, rgba(255, 0, 128, 0.45) 360deg)',
                  }}
                />

                {/* Counter-Angle Secondary Optical Prism Glint */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none mix-blend-overlay opacity-40"
                  style={{
                    background:
                      'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.7) 45deg, transparent 90deg, rgba(0,210,255,0.6) 180deg, transparent 270deg, rgba(255,255,255,0.7) 315deg, transparent 360deg)',
                  }}
                />

                {/* Clear Mirrored Polycarbonate Clamping Transition Ring */}
                <div
                  className="absolute inset-0 m-auto rounded-full border border-slate-300/40 pointer-events-none"
                  style={{
                    width: 'clamp(65px, 10vh, 115px)',
                    height: 'clamp(65px, 10vh, 115px)',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                  }}
                />

                {/* Center Circular Song Label Artwork with Spindle Hole & Logo */}
                <div
                  className="absolute inset-0 m-auto rounded-full overflow-hidden border-2 sm:border-3 border-slate-900 shadow-2xl flex items-center justify-center"
                  style={{
                    width: 'clamp(55px, 8.5vh, 100px)',
                    height: 'clamp(55px, 8.5vh, 100px)',
                  }}
                >
                  <img
                    src={currentTrack.thumbnail}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Chrome Inner Spindle Ring */}
                  <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none" />

                  {/* Spindle Center Hole with Official User-Provided Logo */}
                  <div className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#05070B] border-2 border-slate-200/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
                    <img
                      src="/anamar-logo.svg"
                      alt="Anamar Logo"
                      className="w-3.5 h-3.5 object-contain drop-shadow-[0_0_4px_rgba(0,210,255,0.9)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optical CD Laser Pickup Status Badge */}
            <div className="flex items-center gap-2 px-2.5 py-0.5 mt-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-slate-300">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span className="font-mono font-bold text-cyan-300 uppercase tracking-wider text-[10px]">
                {isPlaying ? 'CD Spinning' : 'CD Paused'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-400 text-[10px]">
                {audioQuality === 'lossless' ? 'PCM 24-bit / 96kHz' : '320 kbps Master'}
              </span>
            </div>
          </div>

          {/* Song Metadata - Compact & Crisp within visible screen */}
          <div className="max-w-sm w-full space-y-0.5 px-3 my-1 shrink-0">
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate anamar-gradient-text">
              {cleanSongTitle(currentTrack.title)}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-cyan-300 truncate">
              {currentTrack.artist}
            </p>
            {currentTrack.album && (
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                {currentTrack.album} • {currentTrack.releaseYear || 2024}
              </p>
            )}
          </div>

          {/* Ambient Player Controls: ALWAYS VISIBLE in Visible Screen */}
          <div className="max-w-md w-full px-2 sm:px-4 space-y-2.5 shrink-0">
            {/* Progress Slider */}
            <div className="space-y-1">
              <div className="relative flex items-center h-3 group cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #00D2FF 0%, #7A5CFF ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                  {audioQuality === 'lossless' ? '320kbps Master' : '256kbps High'}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Button Controls */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              <button
                onClick={() => toggleLike(currentTrack)}
                className={`p-2 rounded-full transition cursor-pointer ${
                  liked ? 'text-pink-500 fill-pink-500' : 'text-slate-400 hover:text-white'
                }`}
                title={liked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={prev}
                className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </button>

              {/* Central Glowing Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-black shadow-[0_0_25px_rgba(0,210,255,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Next"
              >
                <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              </button>

              {/* Enhanced Volume Slider in Ambient Mode (0% - 150%) */}
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-2xl border border-white/10">
                <button
                  onClick={toggleMute}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
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
                  className="w-14 sm:w-18 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
                <button
                  onClick={() => setVolume(volume >= 1.45 ? 1.0 : 1.5)}
                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold whitespace-nowrap shrink-0 transition cursor-pointer ${
                    volume > 1.0
                      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                      : 'bg-white/10 text-slate-400 hover:text-cyan-300'
                  }`}
                  title="Enhance volume up to 150%"
                >
                  {volume > 1.0 ? `${Math.round(volume * 100)}%` : 'Boost'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SIDE 2: REAL SYNCHRONIZED LYRICS (Apple Music / Spotify Style) */}
        {/* (Requirement: ONLY lyrics scroll down, player stays visible) */}
        {/* ======================================================== */}
        <section
          className={`flex flex-col h-full min-h-0 overflow-hidden relative ${
            mobileTab === 'lyrics' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5 shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Synchronized Lyrics
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-bold">
                Echo Engine
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-[10px] text-slate-400 hidden xs:inline">Sync Offset:</span>
              <button
                onClick={() => {
                  const newOffset = lyricOffsetMs - 200;
                  setLyricOffsetMs(newOffset);
                  lyricsService.setTrackOffset(currentTrack.id, newOffset);
                }}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono hover:text-white transition cursor-pointer"
                title="Delay lyrics by 0.2s"
              >
                -0.2s
              </button>
              <button
                onClick={() => {
                  setLyricOffsetMs(0);
                  lyricsService.setTrackOffset(currentTrack.id, 0);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                  lyricOffsetMs === 0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
                title="Reset to 0ms Echo Auto-Sync"
              >
                {lyricOffsetMs === 0 ? 'Auto' : `${lyricOffsetMs > 0 ? '+' : ''}${lyricOffsetMs / 1000}s`}
              </button>
              <button
                onClick={() => {
                  const newOffset = lyricOffsetMs + 200;
                  setLyricOffsetMs(newOffset);
                  lyricsService.setTrackOffset(currentTrack.id, newOffset);
                }}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono hover:text-white transition cursor-pointer"
                title="Advance lyrics by 0.2s"
              >
                +0.2s
              </button>
            </div>
          </div>

          {/* Auto-scrolling lyrics list (ONLY this scrolls down) */}
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto space-y-5 pr-3 no-scrollbar scroll-smooth py-12 text-center sm:text-left min-h-0"
          >
            {loadingLyrics ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-3">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-spin" />
                <span>Loading studio synchronized lyrics...</span>
              </div>
            ) : lyrics.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-3">
                <Disc3 className="w-8 h-8 text-cyan-400 animate-pulse" />
                <p className="text-sm font-bold text-white">Lossless Studio Recording</p>
                <p className="text-xs text-slate-400 max-w-xs text-center">
                  Enjoy high-fidelity master acoustics on Anamar Music.
                </p>
              </div>
            ) : (
              lyrics.map((line, idx) => {
                const isActive = idx === activeLineIndex;
                const isPast = idx < activeLineIndex;

                return (
                  <button
                    key={`${line.time}-${idx}`}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seek(line.time)}
                    className={`w-full text-left transition-all duration-300 cursor-pointer block rounded-2xl p-2 ${
                      isActive
                        ? 'scale-[1.03] opacity-100 font-black'
                        : isPast
                        ? 'opacity-35 hover:opacity-75 font-semibold'
                        : 'opacity-50 hover:opacity-85 font-semibold'
                    }`}
                  >
                    <p
                      className={`transition-all duration-300 ${
                        isActive
                          ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-white bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,210,255,0.7)]'
                          : 'text-base sm:text-lg md:text-xl text-slate-300 hover:text-white'
                      }`}
                      style={{
                        fontSize: isActive ? 'clamp(1.25rem, 2.8vw, 2.25rem)' : 'clamp(1rem, 2vw, 1.35rem)',
                      }}
                    >
                      {line.text}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Mobile Persistent Player Bar: Player controls ALWAYS visible within visible screen */}
          <div className="lg:hidden shrink-0 mt-2 p-2.5 rounded-2xl bg-black/80 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-3 shadow-2xl z-20">
            <div 
              onClick={() => setMobileTab('cd')}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-400/40 shrink-0">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin' : ''}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{cleanSongTitle(currentTrack.title)}</p>
                <p className="text-[10px] text-cyan-300 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={prev}
                className="p-1.5 rounded-full text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Previous"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 text-black shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={next}
                className="p-1.5 rounded-full text-slate-300 hover:text-white transition active:scale-95 cursor-pointer"
                title="Next"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              <button
                onClick={() => setMobileTab('cd')}
                className="px-2 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 cursor-pointer"
                title="Switch to CD Turntable View"
              >
                CD View
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
