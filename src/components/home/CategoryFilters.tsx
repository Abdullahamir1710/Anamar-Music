import React from 'react';
import { Sparkles, Music, Users, Disc, Flame, Radio, Compass, Smile } from 'lucide-react';

export type CategoryFilterType =
  | 'All'
  | 'For You'
  | 'Songs'
  | 'Artists'
  | 'Albums'
  | 'New'
  | 'Trending'
  | 'Genres'
  | 'Moods';

interface CategoryFiltersProps {
  selected: CategoryFilterType;
  onSelect: (category: CategoryFilterType) => void;
}

const CATEGORIES: { id: CategoryFilterType; label: string; icon?: React.ElementType }[] = [
  { id: 'All', label: 'All', icon: Sparkles },
  { id: 'For You', label: 'For You', icon: Compass },
  { id: 'Songs', label: 'Songs', icon: Music },
  { id: 'Artists', label: 'Artists', icon: Users },
  { id: 'Albums', label: 'Albums', icon: Disc },
  { id: 'New', label: 'New', icon: Sparkles },
  { id: 'Trending', label: 'Trending', icon: Flame },
  { id: 'Genres', label: 'Genres', icon: Radio },
  { id: 'Moods', label: 'Moods', icon: Smile },
];

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({ selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 text-slate-950 font-black shadow-[0_0_15px_rgba(0,210,255,0.4)]'
                  : 'bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/25'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'stroke-[2.5] text-slate-950' : 'text-slate-400'
                  }`}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
