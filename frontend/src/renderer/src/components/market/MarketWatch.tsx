import { useState } from 'react';
import { useAssets } from '@/hooks/useAPI';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency, formatNumber, getAssetTypeInfo } from '@/lib/utils';
import { AssetType } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MarketWatchProps {
  expanded?: boolean;
}

export default function MarketWatch({ expanded = false }: MarketWatchProps) {
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | 'all'>('all');
  const setSelectedAsset = useGameStore(state => state.setSelectedAsset);
  
  const { data: assets, isLoading } = useAssets({
    asset_type: selectedAssetType === 'all' ? undefined : selectedAssetType,
    active_only: true,
  });

  const assetTypes = [
    { value: 'all', label: 'All Assets', icon: '📊' },
    { value: AssetType.STOCK, label: 'Stocks', icon: '📈' },
    { value: AssetType.CRYPTO, label: 'Crypto', icon: '₿' },
    { value: AssetType.FOREX, label: 'Forex', icon: '💱' },
    { value: AssetType.COMMODITY, label: 'Commodities', icon: '🏗️' },
  ];

  const displayLimit = expanded ? 50 : 8;
  const assetsArray = Array.isArray(assets) ? assets : [];
  const displayAssets = assetsArray.slice(0, displayLimit);

  return (
    <div className="trading-card">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Market Watch
            </h3>
            <p className="text-gray-600 mt-1">
              Live market data and asset prices
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value as AssetType | 'all')}
              className="input-field w-auto bg-white border-gray-200 text-sm"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-600 font-medium">Live</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center space-y-3">
              <LoadingSpinner />
              <p className="text-sm text-gray-500">Loading market data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Asset List */}
            <div className="space-y-2 custom-scrollbar max-h-96 overflow-y-auto">
              {displayAssets.map((asset: any) => {
                const typeInfo = getAssetTypeInfo(asset.asset_type);
                // Mock price change for demo (in real app, this would come from price history)
                const priceChange = (Math.random() - 0.5) * 10; // Random -5% to +5%
                const isPositive = priceChange > 0;
                const isNegative = priceChange < 0;
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-200 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br ${typeInfo.gradient}`}>
                        {asset.symbol.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {asset.symbol}
                        </p>
                        <p className="text-sm text-gray-500">{asset.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.badge}`}>
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Volume */}
                      {!expanded && asset.volume_24h && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-600">Volume</p>
                          <p className="text-sm font-medium">
                            {formatNumber(asset.volume_24h, true)}
                          </p>
                        </div>
                      )}
                      
                      {/* Price and Change */}
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(asset.current_price)}
                        </p>
                        <p className={`text-sm ${
                          isPositive ? 'text-success-600' : 
                          isNegative ? 'text-danger-600' : 
                          'text-gray-600'
                        }`}>
                          {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                        </p>
                      </div>
                      
                      {/* Trade Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        Trade
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show More */}
            {assetsArray.length > displayLimit && !expanded && (
              <div className="text-center pt-4">
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  View all {assetsArray.length} assets
                </button>
              </div>
            )}

            {assetsArray.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>No assets found</p>
                <p className="text-sm">Try selecting a different asset type</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {expanded && (
        <div className="card-footer">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {displayAssets.length} of {assetsArray.length} assets</span>
            <span>Prices update every 30 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}