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
  const ordersArray = Array.isArray(orders) ? orders : [];
  const displayOrders = ordersArray.slice(0, displayLimit);

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
    <div className="glass-card animate-fade-in">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order History</h3>
            <p className="text-sm text-gray-600">Recent trading orders and their status</p>
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
            {displayOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h4>
                <p className="text-gray-600 mb-1">Your trading orders will appear here</p>
                <p className="text-sm text-gray-500">Start trading to see your order history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayOrders.map((order: any) => (
                  <div key={order.id} className="glass-card hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`font-bold px-2 py-1 rounded-lg text-sm ${
                          order.side === 'buy' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.side.toUpperCase()}
                        </span>
                        <span className="font-bold text-gray-900 text-lg">
                          {order.asset?.symbol || 'Unknown'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {order.status === OrderStatus.PENDING && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelOrderMutation.isPending}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {timeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Quantity</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatNumber(order.quantity)}
                        </p>
                        <p className="text-xs text-gray-500">shares</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Price</p>
                        <p className="text-lg font-bold text-gray-900">
                          {order.order_type === 'market' 
                            ? 'Market' 
                            : formatCurrency(order.price || '0')
                          }
                        </p>
                        <p className="text-xs text-gray-500">{order.order_type}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Filled</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatNumber(order.filled_quantity)}
                        </p>
                        <p className="text-xs text-gray-500">of {formatNumber(order.quantity)}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Total Value</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(
                            (parseFloat(order.filled_quantity) || parseFloat(order.quantity)) * 
                            (parseFloat(order.avg_fill_price || order.price || '0'))
                          )}
                        </p>
                        <p className="text-xs text-gray-500">estimated</p>
                      </div>
                    </div>

                    {(order.commission && parseFloat(order.commission) > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">Commission:</span>
                          <span className="text-gray-900 font-bold">{formatCurrency(order.commission)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {ordersArray.length > displayLimit && !expanded && (
              <div className="text-center pt-4">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all duration-200">
                  View all {ordersArray.length} orders →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {expanded && ordersArray.length > 0 && (
        <div className="card-footer bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              Showing {displayOrders.length} of {ordersArray.length} orders
            </span>
            <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
              Pending: {ordersArray.filter((o: any) => o.status === OrderStatus.PENDING).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}