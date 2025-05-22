import React from 'react';
import { cn } from '@/lib/utils';

type DashboardView = 'overview' | 'market' | 'trading' | 'orders' | 'stats';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '🏠',
    description: 'Dashboard home'
  },
  {
    id: 'market',
    label: 'Market',
    icon: '📊',
    description: 'Live market data'
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: '💱',
    description: 'Place orders'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '📋',
    description: 'Order history'
  },
  {
    id: 'stats',
    label: 'Statistics',
    icon: '📈',
    description: 'Performance analytics'
  }
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 pt-20 z-40 hidden lg:block">
      <nav className="px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors',
                activeView === item.id
                  ? 'bg-primary-100 text-primary-900 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              {activeView === item.id && (
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Markets Open</span>
              <span className="text-green-600 font-medium">24/7</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Orders</span>
              <span className="text-gray-900 font-medium">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Assets Owned</span>
              <span className="text-gray-900 font-medium">-</span>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-900">Markets Open</span>
          </div>
          <p className="text-xs text-green-700">
            Game markets are available 24/7 for continuous trading
          </p>
        </div>

        {/* Version Info */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Candlz v0.1.0
          </p>
        </div>
      </nav>
    </aside>
  );
}