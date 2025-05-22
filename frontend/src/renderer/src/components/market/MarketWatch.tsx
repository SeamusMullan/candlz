import React, { useState } from 'react';
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
  const displayAssets = assets?.slice(0, displayLimit) || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Market Watch</h3>
            <p className="card-description">
              Live market data and asset prices
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value as AssetType | 'all')}
              className="input w-auto"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Asset List */}
            <div className="space-y-2">
              {displayAssets.map((asset) => {
                const typeInfo = getAssetTypeInfo(asset.asset_type);
                // Mock price change for demo (in real app, this would come from price history)
                const priceChange = (Math.random() - 0.5) * 10; // Random -5% to +5%
                const isPositive = priceChange > 0;
                const isNegative = priceChange < 0;
                
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <span className="text-lg">{typeInfo.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asset.symbol}</p>
                        <p className="text-sm text-gray-600 truncate max-w-32">
                          {asset.name}
                        </p>
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
            {assets && assets.length > displayLimit && !expanded && (
              <div className="text-center pt-4">
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  View all {assets.length} assets
                </button>
              </div>
            )}

            {assets && assets.length === 0 && (
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
            <span>Showing {displayAssets.length} of {assets?.length || 0} assets</span>
            <span>Prices update every 30 seconds</span>
          </div>
        </div>
      )}
    </div>
  );
}