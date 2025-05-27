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
  const totalPnL = portfolio?.total_pnl || '0';
  const totalPnLPct = portfolio?.total_pnl_pct || '0';
  const cashBalance = portfolio?.cash_balance || currentPlayer.cash_balance;
  const positions = portfolio?.positions || [];

  const pnlChange = formatPriceChange(totalPnLPct);

  return (
    <div className="trading-card">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Portfolio Overview
            </h3>
            <p className="text-gray-600 mt-1">
              Current portfolio value and performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-emerald-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-4'} gap-4 mb-6`}>
          <div className="metric-card text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-100">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </p>
          </div>
          
          <div className="metric-card text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-100">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Cash Balance</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(cashBalance)}
            </p>
          </div>

          {!compact && (
            <>
              <div className="metric-card text-center">
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl ${
                  pnlChange.isPositive ? 'bg-emerald-100' : 
                  pnlChange.isNegative ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    pnlChange.isPositive ? 'text-emerald-600' : 
                    pnlChange.isNegative ? 'text-red-600' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Total P&L</p>
                <p className={`text-2xl font-bold ${
                  pnlChange.isPositive ? 'text-emerald-600' : 
                  pnlChange.isNegative ? 'text-red-600' : 
                  'text-gray-900'
                }`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>

              <div className="metric-card text-center">
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-xl ${
                  pnlChange.isPositive ? 'bg-emerald-100' : 
                  pnlChange.isNegative ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${
                    pnlChange.isPositive ? 'text-emerald-600' : 
                    pnlChange.isNegative ? 'text-red-600' : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-1">Return %</p>
                <p className={`text-2xl font-bold ${
                  pnlChange.isPositive ? 'text-emerald-600' : 
                  pnlChange.isNegative ? 'text-red-600' : 
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