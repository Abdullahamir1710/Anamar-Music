import React, { useState, useEffect } from 'react';
import { X, Sparkles, Zap, RefreshCw, Play, Check, Heart, Disc3 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { recommendationService, BrainTrackResult } from '../../services/recommendationService';
import { MOODS } from '../../services/musicCatalog';
import { Track } from '../../types/music';
import { Logo } from '../common/Logo';

export const AnamarBrainView: React.FC = () => {
  const { isBrainOpen, setBrainOpen, playTrack, addToQueue } = usePlayer();
  const [selectedMood, setSelectedMood] = useState<string>('All');
  const [generatedResults, setGeneratedResults] = useState<BrainTrackResult[]>(() =>
    recommendationService.getBrainMix('All', 8)
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [cuedMessage, setCuedMessage] = useState(false);

  // Sync taste profile whenever modal opens
  useEffect(() => {
    if (isBrainOpen) {
      recommendationService.syncTasteFromStorage();
      setGeneratedResults(recommendationService.getBrainMix(selectedMood, 8));
    }
  }, [isBrainOpen, selectedMood]);

  if (!isBrainOpen) return null;

  const profile = recommendationService.getTasteProfile();
  const topGenre = recommendationService.getTopGenre() || 'Pakistani Pop';
  const topArtist = recommendationService.getTopArtist() || 'Atif Aslam';
  const totalSignals =
    (profile.likedTrackIds?.length || 0) +
    Object.keys(profile.topGenres || {}).length * 3 +
    Object.keys(profile.repeatedSongs || {}).length * 2;

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const results = recommendationService.getBrainMix(selectedMood, 8);
      setGeneratedResults(results);
      setIsGenerating(false);
    }, 450);
  };

  const handleCueAll = () => {
    generatedResults.forEach((r) => addToQueue(r.track));
    setCuedMessage(true);
    setTimeout(() => setCuedMessage(false), 2000);
  };

  const trackList = generatedResults.map((r) => r.track);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[calc(100vh-2rem)] rounded-3xl bg-[#0B0F19] border border-purple-500/30 p-4 sm:p-6 text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header - Pinned at top */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Logo size={36} showText={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-wide uppercase anamar-gradient-text">
                  Anamar Brain
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase border border-purple-500/30">
                  Taste Engine 3.2
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Personalized acoustic intelligence tailored to your listening habits
              </p>
            </div>
          </div>

          <button
            onClick={() => setBrainOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            title="Close Brain"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-Time Taste Profile Stats */}
        <div className="grid grid-cols-3 gap-2 my-3 shrink-0">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Top Taste Affinity
            </span>
            <span className="text-xs sm:text-sm font-black text-cyan-400 truncate block">{topGenre}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Favorite Artist
            </span>
            <span className="text-xs sm:text-sm font-black text-purple-400 truncate block">{topArtist}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Profile Strength
            </span>
            <span className="text-xs sm:text-sm font-black text-pink-400 truncate block">
              {totalSignals > 5 ? `${totalSignals} Signals` : 'Active'}
            </span>
          </div>
        </div>

        {/* Mood Selector Filter */}
        <div className="mb-3 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Filter By Mood Frequency
            </label>
            <span className="text-[10px] text-cyan-400 font-semibold">Adaptive Mix</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...MOODS.filter((m) => m !== 'All')].map((mood) => {
              const active = selectedMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setSelectedMood(mood)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {mood === 'All' ? '🌟 Pure Taste Mix' : mood}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-2.5 pt-2 border-t border-white/5 shrink-0">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate Mix</span>
          </button>

          <button
            onClick={handleCueAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg cursor-pointer"
          >
            {cuedMessage ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Queue!</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Play & Queue Mix</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Station Tracks - Scrollable so entire modal fits visible screen */}
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto no-scrollbar pr-1">
          {generatedResults.map((result, idx) => {
            const t = result.track;
            return (
              <div
                key={t.id}
                onClick={() => playTrack(t, trackList, idx)}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.07] border border-white/5 hover:border-purple-500/30 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                  <div className="relative shrink-0">
                    <img
                      src={t.thumbnail}
                      alt={t.title}
                      className="w-11 h-11 rounded-xl object-cover shadow"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 truncate">
                        {t.title}
                      </p>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-black text-[10px] border border-cyan-500/30">
                        {result.matchPercentage}% Taste
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">{t.artist}</p>
                    <p className="text-[10px] text-purple-300/80 truncate font-medium">
                      {result.matchReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-white/5 text-[10px] text-slate-400 font-mono">
                    {t.mood}
                  </span>
                  <button className="p-2 rounded-full bg-cyan-500/20 text-cyan-300 opacity-0 group-hover:opacity-100 transition shadow">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
