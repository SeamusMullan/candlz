import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency, formatNumber, formatPriceChange, getAssetTypeInfo } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface PortfolioOverviewProps {
  compact?: boolean;
  detailed?: boolean;
}

export default function PortfolioOverview({ compact = false, detailed = false }: PortfolioOverviewProps) {
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

  // Calculate portfolio breakdown by asset type
  const assetTypeBreakdown = positions.reduce((acc, position) => {
    const value = parseFloat(position.current_value || '0');
    const assetType = position.asset?.asset_type || 'unknown';
    
    if (!acc[assetType]) {
      acc[assetType] = {
        name: getAssetTypeInfo(assetType).display,
        value: 0,
        color: getAssetTypeInfo(assetType).color,
        icon: getAssetTypeInfo(assetType).icon,
      };
    }
    acc[assetType].value += value;
    return acc;
  }, {} as Record<string, any>);

  const portfolioBreakdownData = Object.values(assetTypeBreakdown);
  
  // Add cash to breakdown
  const cashValue = parseFloat(cashBalance);
  if (cashValue > 0) {
    portfolioBreakdownData.push({
      name: 'Cash',
      value: cashValue,
      color: '#6b7280',
      icon: '💰',
    });
  }

  // Position performance data for chart
  const positionPerformanceData = positions.slice(0, 10).map((position, index) => {
    const currentValue = parseFloat(position.current_value || '0');
    const totalInvested = parseFloat(position.total_invested);
    const pnl = currentValue - totalInvested;
    const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    
    return {
      name: position.asset?.symbol || `Asset ${index + 1}`,
      pnl: pnlPct,
      value: currentValue,
      color: pnl >= 0 ? '#10b981' : '#ef4444',
    };
  });

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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

        {/* Detailed Analytics */}
        {detailed && portfolioBreakdownData.length > 0 && (
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Portfolio Breakdown */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Portfolio Breakdown</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {portfolioBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Breakdown Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {portfolioBreakdownData.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1">{item.icon} {item.name}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Position Performance */}
            {positionPerformanceData.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Position Performance</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positionPerformanceData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'P&L %']}
                        labelFormatter={(label) => `${label} Performance`}
                      />
                      <Bar dataKey="pnl" fill="#8884d8">
                        {positionPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Performers */}
        {detailed && positions.length > 0 && (
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 mb-4">Position Details</h4>
            <div className="space-y-3">
              {positions.map((position) => {
                const currentValue = parseFloat(position.current_value || '0');
                const totalInvested = parseFloat(position.total_invested);
                const pnl = currentValue - totalInvested;
                const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
                const avgPrice = parseFloat(position.avg_purchase_price);
                const currentPrice = position.asset?.current_price ? parseFloat(position.asset.current_price) : 0;
                
                return (
                  <div key={position.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">
                          {getAssetTypeInfo(position.asset?.asset_type || 'unknown').icon}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {position.asset?.symbol || 'Unknown'}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {position.asset?.name || 'Unknown Asset'}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pnl >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium">{formatNumber(position.quantity)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg. Price</p>
                        <p className="font-medium">{formatCurrency(avgPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Current Price</p>
                        <p className="font-medium">{formatCurrency(currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-medium">{formatCurrency(currentValue)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-600">P&L: </span>
                        <span className={`font-medium ${
                          pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Invested: </span>
                        <span className="font-medium">{formatCurrency(totalInvested)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}