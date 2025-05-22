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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Trading Panel</h3>
        <p className="card-description">
          {selectedAsset ? `Trade ${selectedAsset.symbol}` : 'Select an asset to trade'}
        </p>
      </div>

      <div className="card-content">
        {!selectedAsset ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💱</div>
            <p>No asset selected</p>
            <p className="text-sm">Choose an asset from Market Watch to start trading</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{selectedAsset.symbol}</h4>
                <span className="text-sm text-gray-600">{selectedAsset.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Price</span>
                <span className="font-medium">{formatCurrency(selectedAsset.current_price)}</span>
              </div>
              {orderSide === OrderSide.SELL && position && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Your Position</span>
                  <span className="font-medium">{availableQuantity} shares</span>
                </div>
              )}
            </div>

            {/* Order Type */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderSide(OrderSide.BUY)}
                className={`btn ${orderSide === OrderSide.BUY ? 'btn-success' : 'btn-secondary'}`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setOrderSide(OrderSide.SELL)}
                className={`btn ${orderSide === OrderSide.SELL ? 'btn-danger' : 'btn-secondary'}`}
              >
                Sell
              </button>
            </div>

            {/* Order Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="input"
              >
                <option value={OrderType.MARKET}>Market Order</option>
                <option value={OrderType.LIMIT}>Limit Order</option>
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className={`input ${errors.quantity ? 'input-error' : ''}`}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Price (for limit orders) */}
            {orderType === OrderType.LIMIT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limit Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter limit price"
                  className="input"
                />
              </div>
            )}

            {/* Order Summary */}
            {quantity && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="text-sm font-medium text-blue-900 mb-2">Order Summary</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Side:</span>
                    <span className="text-blue-900 font-medium">{orderSide.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Quantity:</span>
                    <span className="text-blue-900 font-medium">{quantity} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Est. Value:</span>
                    <span className="text-blue-900 font-medium">
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
              <div className="alert alert-error">
                {errors.submit}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulate}
                disabled={!quantity || simulateOrderMutation.isPending}
                className="btn btn-secondary"
              >
                {simulateOrderMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Simulate'
                )}
              </button>
              
              <button
                type="submit"
                disabled={!quantity || createOrderMutation.isPending}
                className={`btn ${orderSide === OrderSide.BUY ? 'btn-success' : 'btn-danger'}`}
              >
                {createOrderMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  `${orderSide === OrderSide.BUY ? 'Buy' : 'Sell'} ${selectedAsset.symbol}`
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {expanded && (
        <div className="card-footer">
          <div className="text-sm text-gray-600">
            <p>💡 Tip: Use market orders for immediate execution or limit orders to set your price</p>
          </div>
        </div>
      )}
    </div>
  );
}