import React from 'react';
import { Home, Compass, Search, Library, Radio } from 'lucide-react';

interface MobileNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentRoute, onNavigate }) => {
  const items = [
    { label: 'Home', icon: Home, route: '/home' },
    { label: 'Explore', icon: Compass, route: '/explore' },
    { label: 'Search', icon: Search, route: '/search' },
    { label: 'Library', icon: Library, route: '/library' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07090E]/95 backdrop-blur-xl border-t border-cyan-500/15 py-1.5 px-3 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          currentRoute === item.route ||
          (item.route === '/library' &&
            ['/liked', '/history', '/downloads', '/playlists', '/albums', '/artists'].includes(
              currentRoute
            ));

        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.route)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-150 cursor-pointer ${
              isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
