import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Shield,
  Trash2,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  Smartphone,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { recommendationService } from '../services/recommendationService';
import { storageService } from '../services/storage';
import { downloadManager } from '../services/downloadManager';
import { APK_DOWNLOAD_URL } from '../components/apk/ApkDownloadModal';

export const SettingsView: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState(() => recommendationService.getTasteProfile());
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleToggleRecs = () => {
    const newVal = !profile.recommendationsEnabled;
    recommendationService.toggleRecommendations(newVal);
    setProfile(recommendationService.getTasteProfile());
    showNotice(newVal ? 'Personalized recommendations enabled' : 'Personalized recommendations paused');
  };

  const handleToggleHistory = () => {
    const newVal = !profile.historyEnabled;
    recommendationService.toggleHistory(newVal);
    setProfile(recommendationService.getTasteProfile());
    showNotice(newVal ? 'Listening history enabled' : 'Listening history paused');
  };

  const handleClearHistory = () => {
    storageService.clearHistory();
    showNotice('Listening history cleared');
  };

  const handleResetTaste = () => {
    recommendationService.resetTasteProfile();
    setProfile(recommendationService.getTasteProfile());
    showNotice('Taste profile reset to baseline defaults');
  };

  const handleClearDownloads = async () => {
    await downloadManager.clearAllDownloads();
    showNotice('Downloaded offline storage cleared');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <SettingsIcon className="w-6 h-6 text-cyan-400" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider anamar-gradient-text">
            Settings
          </h1>
          <p className="text-xs text-slate-400">Manage appearance, playback preferences, and privacy</p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-in fade-in">
          ✓ {savedNotice}
        </div>
      )}

      {/* 1. Appearance & Audio Fidelity */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-white/5 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-cyan-400" />
          <span>Appearance & Dark Theme</span>
        </h2>
        <p className="text-xs text-slate-400">
          Anamar Music is permanently calibrated in deep midnight AMOLED dark mode with glowing neon accents for optimal visual contrast and battery preservation. Light mode is permanently disabled.
        </p>

        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#00D2FF]" />
            <span className="text-xs font-bold text-white">Midnight AMOLED Dark Mode</span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-400 text-black">
            Active
          </span>
        </div>
      </section>

      {/* 2. Privacy & Personalization */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-white/5 space-y-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Privacy & Taste Profile</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
            <div>
              <p className="font-bold text-white">Personalized Recommendations</p>
              <p className="text-slate-400 text-[11px]">
                Adapt homepage and radio based on your listening signals
              </p>
            </div>
            <button
              onClick={handleToggleRecs}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                profile.recommendationsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.recommendationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03]">
            <div>
              <p className="font-bold text-white">Listening History</p>
              <p className="text-slate-400 text-[11px]">
                Record played tracks in your Recently Played library
              </p>
            </div>
            <button
              onClick={handleToggleHistory}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer ${
                profile.historyEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  profile.historyEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/5 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Listening History</span>
          </button>

          <button
            onClick={handleResetTaste}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-semibold flex items-center gap-2 border border-purple-500/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Taste Profile</span>
          </button>
        </div>
      </section>

      {/* 3. Downloads & Storage */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-white/5 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Downloads & Offline Storage</h2>
        </div>
        <p className="text-xs text-slate-400">
          Saved offline audio files and IndexedDB cache.
        </p>

        <button
          onClick={handleClearDownloads}
          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Download Storage</span>
        </button>
      </section>

      {/* 4. Android App Download */}
      <section className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/20 via-indigo-950/20 to-purple-950/20 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Anamar Music for Android</h3>
            <p className="text-xs text-slate-400">Install the official APK on your mobile device</p>
          </div>
        </div>

        <a
          href={APK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:brightness-110 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,210,255,0.25)] transition flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Download APK</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </section>

      {/* 5. Support (Requirement 115) */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Support & Contact</h3>
            <p className="text-xs text-slate-400">Reach the Anamar team directly for inquiries</p>
          </div>
        </div>

        <a
          href="mailto:music@anamarapk.app"
          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center gap-2 transition hover:underline"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>music@anamarapk.app</span>
        </a>
      </section>

      {/* 6. About Link */}
      <section className="p-6 rounded-3xl bg-[#0E131F] border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="text-sm font-bold text-white">About Anamar Music</h3>
            <p className="text-xs text-slate-400">Version 3.0 • Open Source Credits & Licenses</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('/about')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 text-xs font-bold transition"
        >
          View Credits
        </button>
      </section>
    </div>
  );
};
