import React from 'react';
import { cn } from '@/lib/utils';

type DashboardView = 'overview' | 'market' | 'trading' | 'orders' | 'stats';

interface MobileNavProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

const navItems = [
  { id: 'overview', label: 'Home', icon: '🏠' },
  { id: 'market', label: 'Market', icon: '📊' },
  { id: 'trading', label: 'Trade', icon: '💱' },
  { id: 'orders', label: 'Orders', icon: '📋' },
  { id: 'stats', label: 'Stats', icon: '📈' },
];

export default function MobileNav({ activeView, onViewChange }: MobileNavProps) {
  return (
    <nav className="mobile-nav hidden lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as DashboardView)}
            className={cn(
              'flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors',
              activeView === item.id
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}