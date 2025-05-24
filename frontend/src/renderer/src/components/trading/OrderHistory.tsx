import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePlayerOrders, useCancelOrder } from '@/hooks/useAPI';
import { formatCurrency, formatNumber, getOrderStatusColor, timeAgo } from '@/lib/utils';
import { OrderStatus, OrderType } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface OrderHistoryProps {
  expanded?: boolean;
}

export default function OrderHistory({ expanded = false }: OrderHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [cancelingOrders, setCancelingOrders] = useState<Set<number>>(new Set());
  
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  const { data: allOrders, isLoading, error } = usePlayerOrders(currentPlayer?.id || 0);
  const cancelOrderMutation = useCancelOrder();

  if (!currentPlayer) return null;

  // Filter orders by status
  const filteredOrders = allOrders?.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) || [];
  
  const displayLimit = expanded ? 50 : 5;
  const displayOrders = filteredOrders.slice(0, displayLimit);

  // Count orders by status
  const orderCounts = allOrders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancelingOrders(prev => new Set(prev).add(orderId));

    try {
      await cancelOrderMutation.mutateAsync({
        orderId,
        playerId: currentPlayer.id,
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setCancelingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Bulk cancel function for pending orders
  const handleCancelAllPending = async () => {
    const pendingOrders = filteredOrders.filter(order => order.status === OrderStatus.PENDING);
    
    if (pendingOrders.length === 0) {
      alert('No pending orders to cancel');
      return;
    }

    if (!confirm(`Are you sure you want to cancel ${pendingOrders.length} pending orders?`)) return;

    for (const order of pendingOrders) {
      try {
        await handleCancelOrder(order.id);
      } catch (error) {
        console.error(`Failed to cancel order ${order.id}:`, error);
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Order History</h3>
            <p className="card-description">
              Recent trading orders and their status
            </p>
          </div>
          
          {expanded && (
            <div className="flex items-center space-x-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                className="input w-auto"
              >
                <option value="all">All Orders ({allOrders?.length || 0})</option>
                <option value={OrderStatus.PENDING}>
                  Pending ({orderCounts[OrderStatus.PENDING] || 0})
                </option>
                <option value={OrderStatus.FILLED}>
                  Filled ({orderCounts[OrderStatus.FILLED] || 0})
                </option>
                <option value={OrderStatus.CANCELLED}>
                  Cancelled ({orderCounts[OrderStatus.CANCELLED] || 0})
                </option>
                <option value={OrderStatus.REJECTED}>
                  Rejected ({orderCounts[OrderStatus.REJECTED] || 0})
                </option>
              </select>

              {/* Bulk Cancel Button */}
              {filteredOrders.some(order => order.status === OrderStatus.PENDING) && (
                <button
                  onClick={handleCancelAllPending}
                  className="btn btn-danger btn-sm"
                  disabled={cancelOrderMutation.isPending}
                >
                  Cancel All Pending
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card-content">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Failed to Load Orders</h4>
            <p className="text-sm text-gray-600 mb-4">
              Unable to fetch your order history. Please try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary btn-sm"
            >
              Retry
            </button>
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
                            disabled={cancelingOrders.has(order.id) || cancelOrderMutation.isPending}
                            className="btn btn-danger btn-sm"
                          >
                            {cancelingOrders.has(order.id) ? (
                              <div className="flex items-center space-x-1">
                                <LoadingSpinner size="sm" />
                                <span>Canceling...</span>
                              </div>
                            ) : (
                              'Cancel'
                            )}
                          </button>
                        )}
                        {order.status === OrderStatus.PARTIALLY_FILLED && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelingOrders.has(order.id) || cancelOrderMutation.isPending}
                            className="btn btn-secondary btn-sm"
                            title="Cancel remaining quantity"
                          >
                            {cancelingOrders.has(order.id) ? (
                              <div className="flex items-center space-x-1">
                                <LoadingSpinner size="sm" />
                                <span>Canceling...</span>
                              </div>
                            ) : (
                              'Cancel Remaining'
                            )}
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

            {filteredOrders.length > displayLimit && !expanded && (
              <div className="text-center pt-4">
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  View all {filteredOrders.length} orders
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {expanded && allOrders && (
        <div className="card-footer">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {displayOrders.length} of {filteredOrders.length} 
              {statusFilter !== 'all' ? ` ${statusFilter}` : ''} orders
            </span>
            <span>
              Total: {allOrders.length} | Pending: {orderCounts[OrderStatus.PENDING] || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}