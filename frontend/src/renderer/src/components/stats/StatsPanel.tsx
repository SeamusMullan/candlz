import { useGameStore } from '@/store/gameStore';
import { usePlayerStats } from '@/hooks/useAPI';
import { formatCurrency, formatNumber, formatPercentage, getWealthTierDisplay } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface StatsPanelProps {
  expanded?: boolean;
}

export default function StatsPanel({ expanded = false }: StatsPanelProps) {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  const { data: stats, isLoading } = usePlayerStats(currentPlayer?.id || 0);

  // Safe accessor for stats properties
  const safeStats = {
    total_trades: (stats as any)?.total_trades || 0,
    winning_trades: (stats as any)?.winning_trades || 0,
    total_pnl: (stats as any)?.total_pnl || '0',
    best_trade: (stats as any)?.best_trade || '0',
    worst_trade: (stats as any)?.worst_trade || '0',
    max_drawdown: (stats as any)?.max_drawdown || '0',
    sharpe_ratio: (stats as any)?.sharpe_ratio || '0',
    days_played: (stats as any)?.days_played || 0,
    achievements_unlocked: (stats as any)?.achievements_unlocked || 0,
  };

  const winRate = safeStats.total_trades > 0 ? (safeStats.winning_trades / safeStats.total_trades) * 100 : 0;

  if (!currentPlayer) return null;

  if (isLoading) {
    return (
      <div className="glass-card animate-fade-in">
        <div className="card-content flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="glass-card animate-fade-in">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Statistics</h3>
            </div>
          </div>
        </div>
        <div className="card-content text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Statistics Available</h4>
          <p className="text-gray-600">Start trading to build your statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Performance Statistics</h3>
            <p className="text-sm text-gray-600">Your trading performance and achievements</p>
          </div>
        </div>
      </div>

      <div className="card-content">
        {/* Key Metrics */}
        <div className={`grid ${expanded ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-6`}>
          <div className="glass-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-sm font-semibold text-blue-700">Total Trades</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(safeStats.total_trades)}
            </p>
          </div>
          
          <div className="glass-card bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-green-700">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatPercentage(winRate)}
            </p>
          </div>

          {expanded && (
            <div className="glass-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <p className="text-sm font-semibold text-purple-700">Total P&L</p>
              </div>
              <p className={`text-2xl font-bold ${
                parseFloat(safeStats.total_pnl) >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {formatCurrency(safeStats.total_pnl)}
              </p>
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="space-y-6">
          {/* Trading Performance */}
          <div className="glass-card bg-gradient-to-br from-gray-50 to-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trading Performance
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Winning Trades:</span>
                  <span className="font-bold text-green-600">
                    {formatNumber(safeStats.winning_trades)}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Losing Trades:</span>
                  <span className="font-bold text-red-600">
                    {formatNumber(safeStats.total_trades - safeStats.winning_trades)}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Best Trade:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(safeStats.best_trade)}
                  </span>
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Worst Trade:</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(safeStats.worst_trade)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {expanded && (
            <>
              {/* Risk Metrics */}
              <div className="glass-card bg-gradient-to-br from-orange-50 to-red-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Risk Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Max Drawdown:</span>
                      <span className="font-bold text-red-600">
                        {formatPercentage(parseFloat(safeStats.max_drawdown) * 100)}
                      </span>
                    </div>
                  </div>
                  {safeStats.sharpe_ratio !== '0' && (
                    <div className="bg-white/80 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm font-medium">Sharpe Ratio:</span>
                        <span className="font-bold text-gray-900">
                          {parseFloat(safeStats.sharpe_ratio).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Progress */}
              <div className="glass-card bg-gradient-to-br from-violet-50 to-purple-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Progress
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Days Played:</span>
                      <span className="font-bold text-gray-900">
                        {formatNumber(safeStats.days_played)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Achievements:</span>
                      <span className="font-bold text-yellow-600">
                        {formatNumber(safeStats.achievements_unlocked)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Current Tier:</span>
                      <span className="font-bold text-purple-600">
                        {getWealthTierDisplay(currentPlayer.wealth_tier)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm font-medium">Level:</span>
                      <span className="font-bold text-blue-600">
                        {currentPlayer.level} ({formatNumber(currentPlayer.experience_points)} XP)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress Bar for Experience */}
          {!expanded && (
            <div className="glass-card bg-gradient-to-r from-blue-50 to-indigo-100">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-700 font-medium">Level {currentPlayer.level}</span>
                <span className="text-gray-600">{formatNumber(currentPlayer.experience_points)} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ 
                    width: `${Math.min(100, (currentPlayer.experience_points % 1000) / 10)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Progress to next level</span>
                <span>{Math.min(100, (currentPlayer.experience_points % 1000) / 10).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="card-footer bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p><strong>Tip:</strong> Keep trading to improve your statistics and unlock new achievements!</p>
          </div>
        </div>
      )}
    </div>
  );
}