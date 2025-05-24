import React from 'react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';
import { OrderStatus } from '@/types/api';
import { getWealthTierInfo, getWealthTierProgress, formatCurrency } from '@/lib/utils';

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
  const orders = useGameStore(state => state.orders);
  const portfolio = useGameStore(state => state.portfolio);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  // Calculate active orders (pending and partially filled)
  const activeOrdersCount = orders.filter(order => 
    order.status === OrderStatus.PENDING || 
    order.status === OrderStatus.PARTIALLY_FILLED
  ).length;
  
  // Calculate assets owned (positions with quantity > 0)
  const assetsOwnedCount = portfolio?.positions?.filter(position => 
    parseFloat(position.quantity) > 0
  ).length || 0;

  // Wealth tier progression
  const portfolioValue = parseFloat(portfolio?.total_value || currentPlayer?.current_portfolio_value || '0');
  const currentTier = currentPlayer?.wealth_tier || 'retail_trader';
  const tierInfo = getWealthTierInfo(currentTier);
  const tierProgress = getWealthTierProgress(portfolioValue, currentTier);

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
            <div 
              className="flex justify-between text-sm cursor-help" 
              title="Game markets operate 24/7 for continuous trading"
            >
              <span className="text-gray-600">Markets Open</span>
              <span className="text-green-600 font-medium">24/7</span>
            </div>
            <div 
              className="flex justify-between text-sm cursor-help" 
              title={`You have ${activeOrdersCount} active orders (pending or partially filled)`}
            >
              <span className="text-gray-600">Active Orders</span>
              <span className={`font-medium ${activeOrdersCount > 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                {activeOrdersCount}
              </span>
            </div>
            <div 
              className="flex justify-between text-sm cursor-help" 
              title={`You own ${assetsOwnedCount} different assets with positions > 0`}
            >
              <span className="text-gray-600">Assets Owned</span>
              <span className={`font-medium ${assetsOwnedCount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {assetsOwnedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Wealth Tier Progress */}
        {currentPlayer && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-lg">{tierInfo.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{tierInfo.name}</h4>
                <p className="text-xs text-gray-600">{tierInfo.description}</p>
              </div>
            </div>
            
            {tierProgress.nextTier && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Progress to next tier</span>
                  <span className="text-gray-900 font-medium">{tierProgress.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${tierProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {formatCurrency(tierProgress.amountNeeded)} needed for {getWealthTierInfo(tierProgress.nextTier).name}
                </p>
              </div>
            )}
            
            {!tierProgress.nextTier && (
              <div className="text-center">
                <span className="text-xs font-medium text-purple-600">👑 MAX TIER ACHIEVED</span>
              </div>
            )}
          </div>
        )}

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