import React, { useEffect, useState, useRef } from 'react';
import { X, Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { lyricsService } from '../../services/lyricsService';
import { LyricLine } from '../../types/music';
import { Logo } from '../common/Logo';

export const LyricsModal: React.FC = () => {
  const { currentTrack, currentTime, duration, isPlaying, togglePlay, next, prev, seek, isLyricsOpen, setLyricsOpen } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lyricOffsetMs, setLyricOffsetMs] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Load lyrics when track changes
  useEffect(() => {
    if (!currentTrack || !isLyricsOpen) return;

    let isMounted = true;
    setLoading(true);
    setLyricOffsetMs(lyricsService.getTrackOffset(currentTrack.id));

    lyricsService
      .getLyricsForTrack(currentTrack)
      .then((lines) => {
        if (isMounted) {
          setLyrics(lines);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack, isLyricsOpen]);

  // Update active line and auto-scroll using Echo precision sync
  useEffect(() => {
    if (!lyrics || lyrics.length === 0) return;

    const idx = lyricsService.getCurrentLineIndex(lyrics, currentTime, lyricOffsetMs);
    if (idx !== activeLineIndex) {
      setActiveLineIndex(idx);

      // Smooth auto-scroll
      if (idx >= 0 && lineRefs.current[idx]) {
        lineRefs.current[idx]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentTime, lyrics, activeLineIndex, lyricOffsetMs]);

  if (!isLyricsOpen || !currentTrack) return null;

  const fontClasses = {
    normal: 'text-base md:text-xl py-2',
    large: 'text-xl md:text-3xl py-3.5',
    huge: 'text-2xl md:text-4xl py-5',
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-[#07090E] text-white overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-6'
      }`}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute inset-0 opacity-20 filter blur-3xl pointer-events-none scale-150"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #00D2FF 0%, #7A5CFF 50%, #07090E 90%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full">
        {/* Top Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Logo size={32} showText={false} />
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                  {currentTrack.title}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                  Echo Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Sync Micro-Adjustment */}
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-mono hidden xs:inline">Sync:</span>
              <button
                onClick={() => {
                  const newOff = lyricOffsetMs - 200;
                  setLyricOffsetMs(newOff);
                  lyricsService.setTrackOffset(currentTrack.id, newOff);
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 hover:text-white hover:bg-white/10"
                title="Delay lyrics 0.2s"
              >
                -0.2s
              </button>
              <button
                onClick={() => {
                  setLyricOffsetMs(0);
                  lyricsService.setTrackOffset(currentTrack.id, 0);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  lyricOffsetMs === 0 ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'
                }`}
                title="Reset to 0ms Auto Sync"
              >
                {lyricOffsetMs === 0 ? 'Auto' : `${lyricOffsetMs > 0 ? '+' : ''}${lyricOffsetMs / 1000}s`}
              </button>
              <button
                onClick={() => {
                  const newOff = lyricOffsetMs + 200;
                  setLyricOffsetMs(newOff);
                  lyricsService.setTrackOffset(currentTrack.id, newOff);
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-300 hover:text-white hover:bg-white/10"
                title="Advance lyrics 0.2s"
              >
                +0.2s
              </button>
            </div>

            {/* Font size toggles */}
            <button
              onClick={() =>
                setFontSize((s) => (s === 'normal' ? 'large' : s === 'large' ? 'huge' : 'normal'))
              }
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition text-xs font-bold"
              title="Adjust Font Size"
            >
              A<span className="text-[10px]">A</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={() => setLyricsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Lyrics Scrollable Area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-6 py-16 space-y-2 scroll-smooth text-center select-none"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
              <span className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
              <span>Loading synchronized lyrics...</span>
            </div>
          ) : lyrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p className="text-lg font-semibold mb-1">No lyrics available</p>
              <p className="text-xs text-slate-500">Synced lyrics could not be found for this track.</p>
            </div>
          ) : (
            lyrics.map((line, idx) => {
              const isActive = idx === activeLineIndex;
              const isPast = idx < activeLineIndex;

              return (
                <p
                  key={`${line.time}-${idx}`}
                  ref={(el) => {
                    lineRefs.current[idx] = el;
                  }}
                  onClick={() => seek(line.time)}
                  className={`font-extrabold cursor-pointer transition-all duration-300 rounded-2xl px-4 ${
                    fontClasses[fontSize]
                  } ${
                    isActive
                      ? 'anamar-gradient-text scale-105 filter drop-shadow-[0_0_20px_rgba(0,210,255,0.7)]'
                      : isPast
                      ? 'text-slate-400 hover:text-slate-200 opacity-60 hover:opacity-100'
                      : 'text-slate-500 hover:text-slate-300 opacity-40 hover:opacity-90'
                  }`}
                >
                  {line.text}
                </p>
              );
            })
          )}
        </div>

        {/* Persistent Bottom Music Player Controls (Keeps player visible in screen) */}
        <footer className="p-3 sm:p-4 bg-black/60 border-t border-white/10 shrink-0 flex flex-col gap-2 backdrop-blur-md">
          {/* Progress Bar & Timers */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 w-10 text-right">
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 h-1.5 rounded-lg bg-white/10 cursor-pointer"
            />
            <span className="text-[10px] sm:text-xs font-mono text-slate-400 w-10">
              {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Playback action buttons */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">
              Click any lyric line to jump playback • Synced with Echo & Anamar Audio Engine
            </p>
            <div className="flex items-center gap-3 sm:gap-4 mx-auto sm:mx-0">
              <button
                onClick={prev}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black hover:scale-105 active:scale-95 transition shadow-[0_0_15px_rgba(0,210,255,0.4)] cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={next}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
