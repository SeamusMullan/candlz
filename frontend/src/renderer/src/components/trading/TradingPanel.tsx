import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useCreateOrder, useSimulateOrder } from '@/hooks/useAPI';
import { OrderType, OrderSide } from '@/types/api';
import { formatCurrency, validateTradeInput } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface TradingPanelProps {
  expanded?: boolean;
}

export default function TradingPanel({ expanded = false }: TradingPanelProps) {
  const selectedAsset = useGameStore(state => state.selectedAsset);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const portfolio = useGameStore(state => state.portfolio);
  
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET);
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createOrderMutation = useCreateOrder();
  const simulateOrderMutation = useSimulateOrder();

  if (!currentPlayer) return null;

  const cashBalance = portfolio?.cash_balance || currentPlayer.cash_balance;
  
  // Find position for selected asset
  const position = portfolio?.positions.find(p => p.asset_id === selectedAsset?.id);
  const availableQuantity = position?.quantity || '0';

  const handleSimulate = async () => {
    if (!selectedAsset) return;

    const validation = validateTradeInput(
      quantity,
      orderType === OrderType.MARKET ? undefined : price,
      cashBalance,
      orderSide,
      orderSide === OrderSide.SELL ? availableQuantity : undefined
    );

    if (!validation.isValid) {
      setErrors({ quantity: validation.error || 'Invalid input' });
      return;
    }

    try {
      const orderData = {
        asset_id: selectedAsset.id,
        order_type: orderType,
        side: orderSide,
        quantity,
        price: orderType === OrderType.MARKET ? undefined : price,
      };

      const simulation = await simulateOrderMutation.mutateAsync({
        playerId: currentPlayer.id,
        orderData,
      });

      console.log('Order simulation:', simulation);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Simulation failed' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!selectedAsset) {
      setErrors({ submit: 'Please select an asset to trade' });
      return;
    }

    const validation = validateTradeInput(
      quantity,
      orderType === OrderType.MARKET ? undefined : price,
      cashBalance,
      orderSide,
      orderSide === OrderSide.SELL ? availableQuantity : undefined
    );

    if (!validation.isValid) {
      setErrors({ quantity: validation.error || 'Invalid input' });
      return;
    }

    try {
      const orderData = {
        asset_id: selectedAsset.id,
        order_type: orderType,
        side: orderSide,
        quantity,
        price: orderType === OrderType.MARKET ? undefined : price,
      };

      await createOrderMutation.mutateAsync({
        playerId: currentPlayer.id,
        orderData,
      });

      // Reset form on success
      setQuantity('');
      setPrice('');
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Order failed' });
    }
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Trading Panel</h3>
            <p className="text-sm text-gray-600">
              {selectedAsset ? `Trade ${selectedAsset.symbol}` : 'Select an asset to trade'}
            </p>
          </div>
        </div>
      </div>

      <div className="card-content">
        {!selectedAsset ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Asset Selected</h4>
            <p className="text-gray-600 mb-1">Choose an asset from Market Watch to start trading</p>
            <p className="text-sm text-gray-500">Select stocks, crypto, or commodities to begin</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Asset Info */}
            <div className="glass-card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-gray-900">{selectedAsset.symbol}</h4>
                <span className="text-sm text-gray-600 bg-white/80 px-2 py-1 rounded-full">{selectedAsset.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Current Price</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedAsset.current_price)}</span>
              </div>
              {orderSide === OrderSide.SELL && position && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Your Position</span>
                  <span className="text-lg font-bold text-emerald-600">{availableQuantity} shares</span>
                </div>
              )}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderSide(OrderSide.BUY)}
                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  orderSide === OrderSide.BUY 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Buy
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOrderSide(OrderSide.SELL)}
                className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  orderSide === OrderSide.SELL 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25 scale-105' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                  Sell
                </span>
              </button>
            </div>

            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value={OrderType.MARKET}>Market Order (Execute immediately)</option>
                <option value={OrderType.LIMIT}>Limit Order (Set your price)</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter number of shares"
                className={`w-full px-4 py-3 rounded-xl border bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.quantity 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                    : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                }`}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Price (for limit orders) */}
            {orderType === OrderType.LIMIT && (
              <div className="animate-slide-in">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Limit Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter your desired price"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            )}

            {/* Order Summary */}
            {quantity && (
              <div className="glass-card bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 animate-slide-in">
                <h5 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Order Summary
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Side:</span>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                      orderSide === OrderSide.BUY 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {orderSide.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Quantity:</span>
                    <span className="text-sm font-bold text-blue-900">{quantity} shares</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-700">Est. Value:</span>
                    <span className="text-lg font-bold text-blue-900">
                      {formatCurrency(
                        (parseFloat(quantity) || 0) * 
                        (orderType === OrderType.MARKET 
                          ? parseFloat(selectedAsset.current_price)
                          : parseFloat(price) || 0
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-in">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{errors.submit}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSimulate}
                disabled={!quantity || simulateOrderMutation.isPending}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {simulateOrderMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Preview
                  </>
                )}
              </button>
              
              <button
                type="submit"
                disabled={!quantity || createOrderMutation.isPending}
                className={`py-3 px-4 font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  orderSide === OrderSide.BUY 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25' 
                    : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/25'
                }`}
              >
                {createOrderMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {orderSide === OrderSide.BUY ? 'Buy' : 'Sell'} {selectedAsset.symbol}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {expanded && (
        <div className="card-footer bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p><strong>Tip:</strong> Use market orders for immediate execution or limit orders to set your price</p>
          </div>
        </div>
      )}
    </div>
  );
}