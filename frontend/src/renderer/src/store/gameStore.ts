import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Player, Asset, Portfolio, Order, PortfolioSummary, PlayerStats } from '@/types/api';

interface GameState {
  // Current player
  currentPlayer: Player | null;
  
  // Market data
  assets: Asset[];
  selectedAsset: Asset | null;
  
  // Portfolio
  portfolio: PortfolioSummary | null;
  
  // Orders
  orders: Order[];
  
  // Statistics
  playerStats: PlayerStats | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Connection status
  isConnected: boolean;
  
  // Actions
  setCurrentPlayer: (player: Player | null) => void;
  setAssets: (assets: Asset[]) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  setPortfolio: (portfolio: PortfolioSummary | null) => void;
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: number, updates: Partial<Order>) => void;
  setPlayerStats: (stats: PlayerStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentPlayer: null,
  assets: [],
  selectedAsset: null,
  portfolio: null,
  orders: [],
  playerStats: null,
  isLoading: false,
  error: null,
  isConnected: false,
};

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentPlayer: (player) => 
          set({ currentPlayer: player }, false, 'setCurrentPlayer'),

        setAssets: (assets) => 
          set({ assets }, false, 'setAssets'),

        setSelectedAsset: (asset) => 
          set({ selectedAsset: asset }, false, 'setSelectedAsset'),

        setPortfolio: (portfolio) => 
          set({ portfolio }, false, 'setPortfolio'),

        setOrders: (orders) => 
          set({ orders }, false, 'setOrders'),

        addOrder: (order) => 
          set((state) => ({ 
            orders: [order, ...state.orders] 
          }), false, 'addOrder'),

        updateOrder: (orderId, updates) => 
          set((state) => ({
            orders: state.orders.map(order => 
              order.id === orderId ? { ...order, ...updates } : order
            )
          }), false, 'updateOrder'),

        setPlayerStats: (playerStats) => 
          set({ playerStats }, false, 'setPlayerStats'),

        setLoading: (isLoading) => 
          set({ isLoading }, false, 'setLoading'),

        setError: (error) => 
          set({ error }, false, 'setError'),

        setConnected: (isConnected) => 
          set({ isConnected }, false, 'setConnected'),

        clearError: () => 
          set({ error: null }, false, 'clearError'),

        reset: () => 
          set(initialState, false, 'reset'),
      }),
      {
        name: 'candlz-game-store',
        partialize: (state) => ({
          currentPlayer: state.currentPlayer,
          selectedAsset: state.selectedAsset,
        }),
      }
    ),
    {
      name: 'candlz-game-store',
    }
  )
);

// Selectors for computed values
export const usePlayerWealthTier = () => useGameStore((state) => state.currentPlayer?.wealth_tier);
export const usePlayerCashBalance = () => useGameStore((state) => state.currentPlayer?.cash_balance);
export const usePortfolioValue = () => useGameStore((state) => state.portfolio?.total_value);
export const usePortfolioPnL = () => useGameStore((state) => state.portfolio?.total_pnl);
export const useIsLoading = () => useGameStore((state) => state.isLoading);
export const useError = () => useGameStore((state) => state.error);
export const useIsConnected = () => useGameStore((state) => state.isConnected);