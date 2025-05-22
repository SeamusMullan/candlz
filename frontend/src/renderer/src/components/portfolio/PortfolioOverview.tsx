import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency, formatNumber, formatPriceChange } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PortfolioOverviewProps {
  compact?: boolean;
}

export default function PortfolioOverview({ compact = false }: PortfolioOverviewProps) {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const portfolio = useGameStore(state => state.portfolio);

  if (!currentPlayer) {
    return (
      <div className="card">
        <div className="card-content flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const totalValue = portfolio?.total_value || currentPlayer.current_portfolio_value;
  const totalInvested = portfolio?.total_invested || currentPlayer.starting_capital;
  const totalPnL = portfolio?.total_pnl || '0';
  const totalPnLPct = portfolio?.total_pnl_pct || '0';
  const cashBalance = portfolio?.cash_balance || currentPlayer.cash_balance;
  const positions = portfolio?.positions || [];

  const pnlChange = formatPriceChange(totalPnLPct);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Portfolio Overview</h3>
        <p className="card-description">
          Current portfolio value and performance
        </p>
      </div>

      <div className="card-content">
        {/* Summary Stats */}
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Cash Balance</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(cashBalance)}
            </p>
          </div>

          {!compact && (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total P&L</p>
                <p className={`text-xl font-bold ${
                  pnlChange.isPositive ? 'text-success-600' : 
                  pnlChange.isNegative ? 'text-danger-600' : 
                  'text-gray-900'
                }`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Return %</p>
                <p className={`text-xl font-bold ${
                  pnlChange.isPositive ? 'text-success-600' : 
                  pnlChange.isNegative ? 'text-danger-600' : 
                  'text-gray-900'
                }`}>
                  {pnlChange.formatted}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Positions */}
        {!compact && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Current Positions</h4>
            
            {positions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>No positions yet</p>
                <p className="text-sm">Start trading to build your portfolio</p>
              </div>
            ) : (
              <div className="space-y-2">
                {positions.slice(0, 5).map((position) => {
                  const currentValue = parseFloat(position.current_value || '0');
                  const totalInvested = parseFloat(position.total_invested);
                  const pnl = currentValue - totalInvested;
                  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
                  
                  return (
                    <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {position.asset?.symbol || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(position.quantity)} shares
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(position.current_value || '0')}
                        </p>
                        <p className={`text-sm ${
                          pnl > 0 ? 'text-success-600' : 
                          pnl < 0 ? 'text-danger-600' : 
                          'text-gray-600'
                        }`}>
                          {pnl > 0 ? '+' : ''}{formatCurrency(pnl)} ({pnlPct.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {positions.length > 5 && (
                  <div className="text-center pt-2">
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      View all {positions.length} positions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}