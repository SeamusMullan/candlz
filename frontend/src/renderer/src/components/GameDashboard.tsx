import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePortfolio, usePlayerStats, useAssets, usePlayerOrders } from '@/hooks/useAPI';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import MarketWatch from '@/components/market/MarketWatch';
import TradingPanel from '@/components/trading/TradingPanel';
import OrderHistory from '@/components/trading/OrderHistory';
import StatsPanel from '@/components/stats/StatsPanel';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type DashboardView = 'overview' | 'market' | 'trading' | 'orders' | 'stats';

export default function GameDashboard() {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const currentPlayer = useGameStore(state => state.currentPlayer);

  // Fetch initial data
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(currentPlayer?.id || 0);
  const { data: playerStats, isLoading: statsLoading } = usePlayerStats(currentPlayer?.id || 0);
  const { data: assets, isLoading: assetsLoading } = useAssets();
  const { data: orders, isLoading: ordersLoading } = usePlayerOrders(currentPlayer?.id || 0);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isInitialLoading = portfolioLoading || statsLoading || assetsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            {isInitialLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Loading your trading dashboard...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main Content */}
                {activeView === 'overview' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                      <PortfolioOverview />
                      <MarketWatch />
                    </div>
                    <div className="space-y-6">
                      <TradingPanel />
                      <StatsPanel />
                    </div>
                  </div>
                )}

                {activeView === 'market' && (
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3">
                      <MarketWatch expanded />
                    </div>
                    <div>
                      <TradingPanel />
                    </div>
                  </div>
                )}

                {activeView === 'trading' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TradingPanel expanded />
                    <OrderHistory />
                  </div>
                )}

                {activeView === 'orders' && (
                  <div className="space-y-6">
                    <OrderHistory expanded />
                  </div>
                )}

                {activeView === 'stats' && (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2">
                      <StatsPanel expanded />
                    </div>
                    <div className="space-y-6">
                      <PortfolioOverview compact />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}