import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerOrders, useCancelOrder } from '@/hooks/useAPI';
import { formatCurrency, formatNumber, getOrderStatusColor, timeAgo } from '@/lib/utils';
import { OrderStatus } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OrderHistoryProps {
  expanded?: boolean;
}

export default function OrderHistory({ expanded = false }: OrderHistoryProps) {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  const { data: orders, isLoading } = usePlayerOrders(currentPlayer?.id || 0);
  const cancelOrderMutation = useCancelOrder();

  if (!currentPlayer) return null;

  const displayLimit = expanded ? 50 : 5;
  const displayOrders = orders?.slice(0, displayLimit) || [];

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      await cancelOrderMutation.mutateAsync({
        orderId,
        playerId: currentPlayer.id,
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Order History</h3>
        <p className="card-description">
          Recent trading orders and their status
        </p>
      </div>

      <div className="card-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {displayOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No orders yet</p>
                <p className="text-sm">Your trading orders will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayOrders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`badge ${getOrderStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`font-medium ${
                          order.side === 'buy' ? 'text-success-600' : 'text-danger-600'
                        }`}>
                          {order.side.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900">
                          {order.asset?.symbol || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.status === OrderStatus.PENDING && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelOrderMutation.isPending}
                            className="btn btn-danger btn-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          {timeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quantity</p>
                        <p className="font-medium">
                          {formatNumber(order.quantity)} shares
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Price</p>
                        <p className="font-medium">
                          {order.order_type === 'market' 
                            ? 'Market' 
                            : formatCurrency(order.price || '0')
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Filled</p>
                        <p className="font-medium">
                          {formatNumber(order.filled_quantity)} / {formatNumber(order.quantity)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-600">Total Value</p>
                        <p className="font-medium">
                          {formatCurrency(
                            (parseFloat(order.filled_quantity) || parseFloat(order.quantity)) * 
                            (parseFloat(order.avg_fill_price || order.price || '0'))
                          )}
                        </p>
                      </div>
                    </div>

                    {(order.commission && parseFloat(order.commission) > 0) && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Commission:</span>
                          <span className="text-gray-900">{formatCurrency(order.commission)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {orders && orders.length > displayLimit && !expanded && (
              <div className="text-center pt-4">
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  View all {orders.length} orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {expanded && orders && (
        <div className="card-footer">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {displayOrders.length} of {orders.length} orders</span>
            <span>
              Pending: {orders.filter(o => o.status === OrderStatus.PENDING).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}