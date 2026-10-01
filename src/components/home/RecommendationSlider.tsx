import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Heart, ChevronLeft, ChevronRight, Sparkles, Download, Music2 } from 'lucide-react';
import { SliderCard } from '../../types/music';
import { usePlayer } from '../../context/PlayerContext';
import { recommendationService } from '../../services/recommendationService';
import { cleanSongTitle } from '../../services/musicCatalog';

interface RecommendationSliderProps {
  cards?: SliderCard[];
}

export const RecommendationSlider: React.FC<RecommendationSliderProps> = ({ cards: propCards }) => {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike } = usePlayer();
  const [cards, setCards] = useState<SliderCard[]>(() => propCards || recommendationService.getSliderCards());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch gesture tracking for mobile swipe
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!propCards) {
      setCards(recommendationService.getSliderCards());
    }
  }, [propCards]);

  // Automatic slide advancement (Requirement 99.6)
  useEffect(() => {
    if (cards.length <= 1 || isPaused) return;

    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      // Pause when page is hidden
      if (typeof document !== 'undefined' && document.hidden) return;

      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [cards.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  // Touch event handlers for mobile swipe (Requirement 99.4)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    }
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 45) {
      if (touchDeltaX.current > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  if (!cards || cards.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Personalized Music Recommendation Carousel"
    >
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full transition-transform duration-500 ease-out"
      >
        {/* Active Hero Card Display */}
        {cards.map((card, idx) => {
          const isActive = idx === currentIndex;
          const isCurrentPlaying = currentTrack?.id === card.track.id && isPlaying;
          const liked = isLiked(card.track.id);

          return (
            <div
              key={card.id}
              className={`transition-all duration-700 ${
                isActive ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-98 pointer-events-none absolute inset-0'
              }`}
              aria-hidden={!isActive}
            >
              <div
                className={`relative w-full rounded-3xl p-6 sm:p-8 md:p-10 overflow-hidden bg-gradient-to-br ${card.backgroundGradient} border border-cyan-500/25 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-xl`}
              >
                {/* Background Ambient Glow & Artwork Shimmer */}
                <div
                  className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
                  style={{ backgroundColor: card.accentColor }}
                />
                <div
                  className="absolute right-0 bottom-0 w-96 h-96 opacity-10 bg-no-repeat bg-cover pointer-events-none blur-sm mix-blend-screen hidden md:block"
                  style={{ backgroundImage: `url(${card.artwork})` }}
                />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
                  {/* Left Column: Metadata & Hero Copy */}
                  <div className="flex-1 min-w-0 max-w-2xl space-y-3 sm:space-y-4">
                    {/* Tag badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm transition-all"
                      style={{
                        borderColor: `${card.accentColor}50`,
                        backgroundColor: `${card.accentColor}15`,
                        color: card.accentColor,
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>{card.tag}</span>
                    </div>

                    {/* Song Title & Artist Heading */}
                    <div>
                      <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                        {cleanSongTitle(card.title)}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base font-semibold text-cyan-300/90 mt-1 flex items-center gap-2">
                        <span>{card.subtitle}</span>
                        {card.track.genre && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-normal">
                            {card.track.genre}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Explanatory description */}
                    {card.description && (
                      <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed line-clamp-2 max-w-lg">
                        {card.description}
                      </p>
                    )}

                    {/* Interactive Action Controls: Play & Like */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          if (currentTrack?.id === card.track.id) {
                            togglePlay();
                          } else {
                            playTrack(card.track);
                          }
                        }}
                        className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap shrink-0 shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:shadow-[0_0_35px_rgba(0,210,255,0.6)] transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer group"
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                            <span>Play Now</span>
                          </>
                        )}
                      </button>

                      {/* Favorite / Like Button */}
                      <button
                        onClick={() => toggleLike(card.track)}
                        aria-label={liked ? 'Unlike song' : 'Like song'}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          liked
                            ? 'bg-pink-500/20 border-pink-500/40 text-pink-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      </button>

                      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 px-3 py-1 rounded-xl bg-white/[0.04]">
                        <Music2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>320 kbps Studio</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Prominent Album Artwork */}
                  <div className="relative shrink-0 self-center group">
                    <div
                      className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-75 transition-opacity"
                      style={{ backgroundColor: card.accentColor }}
                    />
                    <img
                      src={card.artwork}
                      alt={card.title}
                      loading="eager"
                      className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl object-cover shadow-2xl border border-white/15 group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Floating play badge over art */}
                    <button
                      onClick={() => {
                        if (currentTrack?.id === card.track.id) {
                          togglePlay();
                        } else {
                          playTrack(card.track);
                        }
                      }}
                      aria-label="Play song"
                      className="absolute bottom-3 right-3 p-3 rounded-full bg-cyan-400 text-black shadow-xl opacity-90 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows for Desktop (Requirement 99.5) */}
      <button
        onClick={handlePrev}
        aria-label="Previous recommendation"
        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next recommendation"
        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white shadow-xl backdrop-blur-md transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots for Mobile & Desktop (Requirement 99.4) */}
      <div className="flex items-center justify-center gap-1.5 mt-3.5">
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Jump to slide ${i + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              i === currentIndex
                ? 'w-7 h-2 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(0,210,255,0.6)]'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
