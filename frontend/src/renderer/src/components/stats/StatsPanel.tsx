import React from 'react';
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

  if (!currentPlayer) return null;

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-content flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Statistics</h3>
        </div>
        <div className="card-content text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No statistics available</p>
        </div>
      </div>
    );
  }

  const winRate = stats.total_trades > 0 ? (stats.winning_trades / stats.total_trades) * 100 : 0;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Performance Statistics</h3>
        <p className="card-description">
          Your trading performance and achievements
        </p>
      </div>

      <div className="card-content">
        {/* Key Metrics */}
        <div className={`grid ${expanded ? 'grid-cols-3' : 'grid-cols-2'} gap-4 mb-6`}>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatNumber(stats.total_trades)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Win Rate</p>
            <p className="text-2xl font-bold text-green-900">
              {formatPercentage(winRate)}
            </p>
          </div>

          {expanded && (
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Total P&L</p>
              <p className={`text-2xl font-bold ${
                parseFloat(stats.total_pnl) >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {formatCurrency(stats.total_pnl)}
              </p>
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3">
          {/* Trading Performance */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Trading Performance</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Winning Trades:</span>
                <span className="font-medium text-green-600">
                  {formatNumber(stats.winning_trades)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Losing Trades:</span>
                <span className="font-medium text-red-600">
                  {formatNumber(stats.total_trades - stats.winning_trades)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best Trade:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.best_trade)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Worst Trade:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(stats.worst_trade)}
                </span>
              </div>
            </div>
          </div>

          {expanded && (
            <>
              {/* Risk Metrics */}
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Risk Metrics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Drawdown:</span>
                    <span className="font-medium text-red-600">
                      {formatPercentage(parseFloat(stats.max_drawdown) * 100)}
                    </span>
                  </div>
                  {stats.sharpe_ratio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sharpe Ratio:</span>
                      <span className="font-medium text-gray-900">
                        {parseFloat(stats.sharpe_ratio).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Player Progress */}
              <div className="border-t border-gray-200 pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Played:</span>
                    <span className="font-medium text-gray-900">
                      {formatNumber(stats.days_played)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Achievements:</span>
                    <span className="font-medium text-yellow-600">
                      {formatNumber(stats.achievements_unlocked)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Tier:</span>
                    <span className="font-medium text-purple-600">
                      {getWealthTierDisplay(currentPlayer.wealth_tier)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-medium text-blue-600">
                      {currentPlayer.level} ({formatNumber(currentPlayer.experience_points)} XP)
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Progress Bar for Experience */}
          {!expanded && (
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Level {currentPlayer.level}</span>
                <span className="text-gray-600">{formatNumber(currentPlayer.experience_points)} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (currentPlayer.experience_points % 1000) / 10)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="card-footer">
          <div className="text-sm text-gray-600">
            <p>💡 Keep trading to improve your statistics and unlock new achievements!</p>
          </div>
        </div>
      )}
    </div>
  );
}