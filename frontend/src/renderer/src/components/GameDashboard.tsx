import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePortfolio, usePlayerStats, useAssets, usePlayerOrders } from '@/hooks/useAPI';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
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
  const { data: portfolio, isLoading: portfolioLoading, error: portfolioError } = usePortfolio(currentPlayer?.id || 0);
  const { data: playerStats, isLoading: statsLoading, error: statsError } = usePlayerStats(currentPlayer?.id || 0);
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useAssets();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = usePlayerOrders(currentPlayer?.id || 0);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isInitialLoading = portfolioLoading || statsLoading || assetsLoading;
  const hasError = portfolioError || statsError || assetsError || ordersError;

  // Show error state if any critical data fails to load
  if (hasError && !isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="flex-1 lg:ml-64">
            <div className="p-6">
              <div className="flex items-center justify-center h-96">
                <div className="text-center max-w-md mx-auto">
                  <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 text-2xl">⚠️</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
                  <p className="text-gray-600 mb-4">
                    There was an error loading your trading data. Please try refreshing the page.
                  </p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="btn btn-primary btn-sm"
                  >
                    Refresh Dashboard
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                  <div className="space-y-6">
                    <PortfolioOverview detailed />
                    <StatsPanel expanded />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        <MobileNav activeView={activeView} onViewChange={setActiveView} />
      </div>
    </div>
  );
}