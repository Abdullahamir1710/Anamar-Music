import React from 'react';
import {
  Home,
  Compass,
  Search,
  Heart,
  Clock,
  Download,
  Disc,
  Users,
  ListMusic,
  Mic,
  Sparkles,
  Radio,
  Settings,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { usePlayer } from '../../context/PlayerContext';
import { APK_DOWNLOAD_URL } from '../apk/ApkDownloadModal';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { setFindOpen, setBrainOpen } = usePlayer();

  const handleNav = (route: string) => {
    onNavigate(route);
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = (route: string) => {
    const isActive = currentRoute === route || (route !== '/' && currentRoute.startsWith(route));
    return `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
    }`;
  };

  const content = (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      {/* Brand Header with Logo */}
      <div className="px-2 py-3 mb-4">
        <Logo size={42} showText={true} />
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 mb-6">
        <div onClick={() => handleNav('/home')} className={navItemClass('/home')}>
          <Home className="w-4 h-4" />
          <span>Home</span>
        </div>
        <div onClick={() => handleNav('/explore')} className={navItemClass('/explore')}>
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </div>
        <div onClick={() => handleNav('/search')} className={navItemClass('/search')}>
          <Search className="w-4 h-4" />
          <span>Search</span>
        </div>
      </div>

      {/* YOUR LIBRARY */}
      <div className="mb-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Your Library
        </p>
        <div className="space-y-1">
          <div onClick={() => handleNav('/liked')} className={navItemClass('/liked')}>
            <Heart className="w-4 h-4 text-pink-400" />
            <span>Liked Songs</span>
          </div>
          <div onClick={() => handleNav('/history')} className={navItemClass('/history')}>
            <Clock className="w-4 h-4" />
            <span>Recently Played</span>
          </div>
          <div onClick={() => handleNav('/downloads')} className={navItemClass('/downloads')}>
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Downloads</span>
          </div>
          <div onClick={() => handleNav('/albums')} className={navItemClass('/albums')}>
            <Disc className="w-4 h-4" />
            <span>Albums</span>
          </div>
          <div onClick={() => handleNav('/artists')} className={navItemClass('/artists')}>
            <Users className="w-4 h-4" />
            <span>Artists</span>
          </div>
          <div onClick={() => handleNav('/playlists')} className={navItemClass('/playlists')}>
            <ListMusic className="w-4 h-4" />
            <span>Playlists</span>
          </div>
        </div>
      </div>

      {/* SPECIAL FEATURES */}
      <div className="mb-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Special
        </p>
        <div className="space-y-1">
          <div
            onClick={() => {
              setFindOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 cursor-pointer transition border border-transparent hover:border-cyan-500/20"
          >
            <Mic className="w-4 h-4 text-cyan-400" />
            <span>Anamar Find</span>
          </div>

          <div
            onClick={() => {
              setBrainOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-500/10 cursor-pointer transition border border-transparent hover:border-purple-500/20"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Anamar Brain</span>
          </div>
        </div>
      </div>

      {/* Footer Nav & APK Download */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
        {/* Prominent APK Download Button in Menu */}
        <a
          href={APK_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-cyan-300 hover:text-white border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.15)] transition cursor-pointer group"
          title="Download official Anamar Music APK for Android"
        >
          <span className="text-sm">📱</span>
          <span className="font-extrabold tracking-wide">Download APK</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70 group-hover:opacity-100 transition" />
        </a>

        <div onClick={() => handleNav('/settings')} className={navItemClass('/settings')}>
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </div>
        <div onClick={() => handleNav('/about')} className={navItemClass('/about')}>
          <Info className="w-4 h-4" />
          <span>About & Credits</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 bg-[#07090E]/95 border-r border-cyan-500/10 h-screen sticky top-0 z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[#07090E] border-r border-cyan-500/20 z-10">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
