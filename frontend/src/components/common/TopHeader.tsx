import React from 'react';
import { Menu } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';
import { VIEW_TITLES } from './navConfig';
import { Badge } from '../ui/kit';

interface TopHeaderProps {
  store: ReturnType<typeof useERPStore>;
  onOpenMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ store, onOpenMobileMenu }) => {
  const { state } = store;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden flex-shrink-0 transition"
            aria-label="Open navigation menu"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
            {VIEW_TITLES[state.currentView] || 'Dashboard'}
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block truncate">{today}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Badge tone="indigo">{state.currentUser?.role}</Badge>
      </div>
    </header>
  );
};
