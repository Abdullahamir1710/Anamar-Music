import React, { useState } from 'react';
import { Search, Mic, Sparkles, Music, Menu, Download } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Logo } from '../common/Logo';
import { APK_DOWNLOAD_URL } from '../apk/ApkDownloadModal';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onToggleMobileMenu }) => {
  const { setFindOpen, setBrainOpen, setSpotifyOpen } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/search');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full max-w-full px-3 sm:px-6 h-14 sm:h-16 bg-[#07090E]/90 backdrop-blur-xl border-b border-cyan-500/10 shrink-0">
      {/* Left: Mobile hamburger & Logo on mobile */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 sm:p-2 -ml-1 rounded-xl text-slate-400 hover:text-white md:hidden shrink-0 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="md:hidden shrink-0 cursor-pointer" onClick={() => onNavigate('/home')}>
          <Logo size={24} showText={false} />
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 md:w-72 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 sm:py-2 rounded-full text-xs bg-white/5 border border-white/10 hover:border-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-slate-200 placeholder-slate-400 transition-all"
          />
        </form>
      </div>

      {/* Right: Feature Buttons (Compact, never wrap, fits mobile screens) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={() => onNavigate('/search')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition sm:hidden shrink-0 cursor-pointer"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Anamar Find Button */}
        <button
          onClick={() => setFindOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold whitespace-nowrap shrink-0 transition active:scale-95 shadow-[0_0_12px_rgba(0,210,255,0.15)] cursor-pointer"
          title="Identify music with Anamar Find"
        >
          <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span className="hidden xs:inline sm:inline">Find</span>
        </button>

        {/* Anamar Brain Button */}
        <button
          onClick={() => setBrainOpen(true)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-semibold whitespace-nowrap shrink-0 transition active:scale-95 shadow-[0_0_12px_rgba(168,85,247,0.15)] cursor-pointer"
          title="Smart recommendations with Anamar Brain"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden xs:inline sm:inline">Brain</span>
        </button>

        {/* Spotify Import */}
        <button
          onClick={() => setSpotifyOpen(true)}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition shrink-0 cursor-pointer"
          title="Import Spotify Playlist"
        >
          <Music className="w-4 h-4" />
        </button>

        {/* Download APK Button on larger screens */}
        <a
          href={APK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold whitespace-nowrap shrink-0 transition shadow-[0_0_12px_rgba(0,210,255,0.2)] active:scale-95 cursor-pointer"
          title="Download Anamar Music Android APK"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>APK</span>
        </a>
      </div>
    </header>
  );
};
