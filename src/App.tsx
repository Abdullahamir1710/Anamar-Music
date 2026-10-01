import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullPlayerModal } from './components/player/FullPlayerModal';
import { AmbientPlayerModal } from './components/player/AmbientPlayerModal';
import { QueueDrawer } from './components/player/QueueDrawer';
import { LyricsModal } from './components/lyrics/LyricsModal';
import { AnamarFindModal } from './components/find/AnamarFindModal';
import { AnamarBrainView } from './components/brain/AnamarBrainView';
import { SpotifyImportModal } from './components/spotify/SpotifyImportModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ApkDownloadModal } from './components/apk/ApkDownloadModal';

import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { ExploreView } from './views/ExploreView';
import { LibraryView } from './views/LibraryView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path === '/' ? '/home' : path;
    }
    return '/home';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with browser URL & history
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentRoute(p === '/' ? '/home' : p);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', route);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Parse search query parameter if on /search?q=...
  let searchQuery = '';
  if (currentRoute.startsWith('/search')) {
    const searchParams = new URLSearchParams(window.location.search);
    searchQuery = searchParams.get('q') || '';
  }

  // Render view corresponding to current route
  const renderView = () => {
    const route = currentRoute.split('?')[0];

    switch (route) {
      case '/':
      case '/home':
        return <HomeView onNavigate={navigate} />;
      case '/search':
        return <SearchView initialQuery={searchQuery} />;
      case '/explore':
        return <ExploreView />;
      case '/library':
        return <LibraryView initialSubTab="liked" />;
      case '/liked':
        return <LibraryView initialSubTab="liked" />;
      case '/history':
        return <LibraryView initialSubTab="history" />;
      case '/downloads':
        return <LibraryView initialSubTab="downloads" />;
      case '/playlists':
        return <LibraryView initialSubTab="playlists" />;
      case '/albums':
        return <LibraryView initialSubTab="albums" />;
      case '/artists':
        return <LibraryView initialSubTab="artists" />;
      case '/settings':
        return <SettingsView onNavigate={navigate} />;
      case '/about':
        return <AboutView />;
      default:
        return <HomeView onNavigate={navigate} />;
    }
  };

  return (
    <ThemeProvider>
      <PlayerProvider>
        <div className="flex h-screen w-full bg-[#07090E] text-slate-100 overflow-hidden font-sans">
          {/* Desktop Left Sidebar */}
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={navigate}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
            {/* Top Navbar */}
            <Navbar
              currentRoute={currentRoute}
              onNavigate={navigate}
              onToggleMobileMenu={() => setMobileMenuOpen(true)}
            />

            {/* Scrollable Page Body */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {renderView()}
            </main>
          </div>

          {/* Persistent Mini Player at bottom */}
          <MiniPlayer />

          {/* Mobile Bottom Navigation */}
          <MobileNav currentRoute={currentRoute} onNavigate={navigate} />

          {/* Overlays and Modals */}
          <FullPlayerModal />
          <AmbientPlayerModal />
          <QueueDrawer />
          <LyricsModal />
          <AnamarFindModal />
          <AnamarBrainView />
          <SpotifyImportModal />
          <OfflineIndicator />
          <ApkDownloadModal />
        </div>
      </PlayerProvider>
    </ThemeProvider>
  );
}
