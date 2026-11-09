import React from 'react';
import { useERPStore } from '../../store/erpStore';
import { VIEW_TITLES } from './navConfig';
import { Badge } from '../ui/kit';

interface TopHeaderProps {
  store: ReturnType<typeof useERPStore>;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ store }) => {
  const { state } = store;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-gray-900 truncate">{VIEW_TITLES[state.currentView] || 'Dashboard'}</h1>
        <p className="text-xs text-gray-500">{today}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone="indigo">{state.currentUser?.role}</Badge>
      </div>
    </header>
  );
};
