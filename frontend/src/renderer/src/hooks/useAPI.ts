import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/store/gameStore';
import api from '@/lib/api';
import type { PlayerCreate, OrderCreate, AssetType, WealthTier, OrderStatus } from '@/types/api';

// Player hooks
export function usePlayer(playerId: number) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: () => api.player.getPlayer(playerId),
    enabled: !!playerId,
    staleTime: 30000, // 30 seconds
  });
}

export function usePlayerByUsername(username: string) {
  return useQuery({
    queryKey: ['player', 'username', username],
    queryFn: () => api.player.getPlayerByUsername(username),
    enabled: !!username,
  });
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const setCurrentPlayer = useGameStore(state => state.setCurrentPlayer);
  
  return useMutation({
    mutationFn: (playerData: PlayerCreate) => api.player.createPlayer(playerData),
    onSuccess: (player) => {
      setCurrentPlayer(player);
      queryClient.setQueryData(['player', player.id], player);
    },
  });
}

export function usePortfolio(playerId: number) {
  const setPortfolio = useGameStore(state => state.setPortfolio);
  
  return useQuery({
    queryKey: ['portfolio', playerId],
    queryFn: () => api.player.getPortfolio(playerId),
    enabled: !!playerId,
    staleTime: 10000, // 10 seconds
    onSuccess: (data) => {
      setPortfolio(data);
    },
  });
}

export function usePlayerStats(playerId: number) {
  const setPlayerStats = useGameStore(state => state.setPlayerStats);
  
  return useQuery({
    queryKey: ['playerStats', playerId],
    queryFn: () => api.player.getStats(playerId),
    enabled: !!playerId,
    staleTime: 30000, // 30 seconds
    onSuccess: (data) => {
      setPlayerStats(data);
    },
  });
}

export function useLeaderboard(limit = 100) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => api.player.getLeaderboard(limit),
    staleTime: 60000, // 1 minute
  });
}

// Asset hooks
export function useAssets(filters?: {
  asset_type?: AssetType;
  wealth_tier?: WealthTier;
  active_only?: boolean;
}) {
  const setAssets = useGameStore(state => state.setAssets);
  
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => api.asset.getAssets(filters),
    staleTime: 30000, // 30 seconds
    onSuccess: (data) => {
      setAssets(data);
    },
  });
}

export function useAsset(assetId: number) {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => api.asset.getAsset(assetId),
    enabled: !!assetId,
    staleTime: 30000, // 30 seconds
  });
}

export function useAssetBySymbol(symbol: string) {
  return useQuery({
    queryKey: ['asset', 'symbol', symbol],
    queryFn: () => api.asset.getAssetBySymbol(symbol),
    enabled: !!symbol,
    staleTime: 30000, // 30 seconds
  });
}

export function usePriceHistory(assetId: number, days = 30, limit = 1000) {
  return useQuery({
    queryKey: ['priceHistory', assetId, days, limit],
    queryFn: () => api.asset.getPriceHistory(assetId, days, limit),
    enabled: !!assetId,
    staleTime: 60000, // 1 minute
  });
}

export function useMarketData(assetType?: AssetType, limit = 50) {
  return useQuery({
    queryKey: ['marketData', assetType, limit],
    queryFn: () => api.asset.getMarketData(assetType, limit),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

// Trading hooks
export function usePlayerOrders(playerId: number, status?: OrderStatus, limit = 100) {
  const setOrders = useGameStore(state => state.setOrders);
  
  return useQuery({
    queryKey: ['orders', playerId, status, limit],
    queryFn: () => api.trading.getPlayerOrders(playerId, status, limit),
    enabled: !!playerId,
    staleTime: 10000, // 10 seconds
    onSuccess: (data) => {
      if (!status) { // Only update store if fetching all orders
        setOrders(data);
      }
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const addOrder = useGameStore(state => state.addOrder);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  return useMutation({
    mutationFn: ({ playerId, orderData }: { playerId: number; orderData: OrderCreate }) =>
      api.trading.createOrder(playerId, orderData),
    onSuccess: (order) => {
      addOrder(order);
      
      // Invalidate related queries
      if (currentPlayer) {
        queryClient.invalidateQueries({ queryKey: ['orders', currentPlayer.id] });
        queryClient.invalidateQueries({ queryKey: ['portfolio', currentPlayer.id] });
        queryClient.invalidateQueries({ queryKey: ['player', currentPlayer.id] });
      }
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const updateOrder = useGameStore(state => state.updateOrder);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  
  return useMutation({
    mutationFn: ({ orderId, playerId }: { orderId: number; playerId: number }) =>
      api.trading.cancelOrder(orderId, playerId),
    onSuccess: (_, variables) => {
      updateOrder(variables.orderId, { status: 'cancelled' as any });
      
      // Invalidate related queries
      if (currentPlayer) {
        queryClient.invalidateQueries({ queryKey: ['orders', currentPlayer.id] });
      }
    },
  });
}

export function useSimulateOrder() {
  return useMutation({
    mutationFn: ({ playerId, orderData }: { playerId: number; orderData: OrderCreate }) =>
      api.trading.simulateOrder(playerId, orderData),
  });
}

// System hooks
export function useSystemHealth() {
  const setConnected = useGameStore(state => state.setConnected);
  
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => api.system.getHealth(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Check every minute
    retry: 3,
    onSuccess: () => {
      setConnected(true);
    },
    onError: () => {
      setConnected(false);
    },
  });
}

export function useSystemStatus() {
  return useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => api.system.getStatus(),
    staleTime: 60000, // 1 minute
  });
}

// Custom hook for real-time price updates
export function useRealtimePrices(assetIds: number[], interval = 30000) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['realtimePrices', assetIds],
    queryFn: async () => {
      // Fetch current prices for all assets
      const promises = assetIds.map(id => api.asset.getAsset(id));
      const assets = await Promise.all(promises);
      return assets;
    },
    enabled: assetIds.length > 0,
    refetchInterval: interval,
    staleTime: interval / 2,
    onSuccess: (assets) => {
      // Update individual asset queries
      assets.forEach(asset => {
        queryClient.setQueryData(['asset', asset.id], asset);
      });
    },
  });
}