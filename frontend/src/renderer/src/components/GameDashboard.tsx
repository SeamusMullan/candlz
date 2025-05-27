import { useState } from 'react';
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
  usePortfolio(currentPlayer?.id || 0);
  usePlayerStats(currentPlayer?.id || 0);
  useAssets();
  usePlayerOrders(currentPlayer?.id || 0);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-6">
            <div className="space-y-6 fade-in">
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
                  <StatsPanel expanded />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}