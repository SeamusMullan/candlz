import axios from 'axios';
import type {
  Player,
  PlayerCreate,
  Asset,
  Portfolio,
  Order,
  OrderCreate,
  PriceHistory,
  Achievement,
  PlayerAchievement,
  PortfolioSummary,
  PlayerStats,
  LeaderboardEntry,
  MarketData,
  APIResponse,
  AssetType,
  WealthTier,
  OrderStatus
} from '@/types/api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error('Resource not found');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.detail || 'Bad request');
    } else if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw error;
  }
);

// Player API
export const playerAPI = {
  async createPlayer(playerData: PlayerCreate): Promise<Player> {
    const response = await api.post<Player>('/api/players/', playerData);
    return response.data;
  },

  async getPlayer(playerId: number): Promise<Player> {
    const response = await api.get<Player>(`/api/players/${playerId}`);
    return response.data;
  },

  async getPlayerByUsername(username: string): Promise<Player> {
    const response = await api.get<Player>(`/api/players/username/${username}`);
    return response.data;
  },

  async updatePlayer(playerId: number, updates: Partial<Player>): Promise<Player> {
    const response = await api.put<Player>(`/api/players/${playerId}`, updates);
    return response.data;
  },

  async getPortfolio(playerId: number): Promise<PortfolioSummary> {
    const response = await api.get<PortfolioSummary>(`/api/players/${playerId}/portfolio`);
    return response.data;
  },

  async getStats(playerId: number): Promise<PlayerStats> {
    const response = await api.get<PlayerStats>(`/api/players/${playerId}/stats`);
    return response.data;
  },

  async updateWealthTier(playerId: number): Promise<Player> {
    const response = await api.post<Player>(`/api/players/${playerId}/update-wealth-tier`);
    return response.data;
  },

  async getLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
    const response = await api.get<LeaderboardEntry[]>(`/api/players/?limit=${limit}`);
    return response.data;
  },

  async deletePlayer(playerId: number): Promise<APIResponse> {
    const response = await api.delete<APIResponse>(`/api/players/${playerId}`);
    return response.data;
  },
};

// Asset API
export const assetAPI = {
  async getAssets(filters?: {
    asset_type?: AssetType;
    wealth_tier?: WealthTier;
    active_only?: boolean;
  }): Promise<Asset[]> {
    const params = new URLSearchParams();
    if (filters?.asset_type) params.append('asset_type', filters.asset_type);
    if (filters?.wealth_tier) params.append('wealth_tier', filters.wealth_tier);
    if (filters?.active_only !== undefined) params.append('active_only', filters.active_only.toString());
    
    const response = await api.get<Asset[]>(`/api/assets/?${params.toString()}`);
    return response.data;
  },

  async getAsset(assetId: number): Promise<Asset> {
    const response = await api.get<Asset>(`/api/assets/${assetId}`);
    return response.data;
  },

  async getAssetBySymbol(symbol: string): Promise<Asset> {
    const response = await api.get<Asset>(`/api/assets/symbol/${symbol}`);
    return response.data;
  },

  async getPriceHistory(assetId: number, days = 30, limit = 1000): Promise<PriceHistory[]> {
    const response = await api.get<PriceHistory[]>(
      `/api/assets/${assetId}/price-history?days=${days}&limit=${limit}`
    );
    return response.data;
  },

  async getMarketData(assetType?: AssetType, limit = 50): Promise<MarketData> {
    const params = new URLSearchParams();
    if (assetType) params.append('asset_type', assetType);
    params.append('limit', limit.toString());
    
    const response = await api.get<MarketData>(`/api/assets/market-data?${params.toString()}`);
    return response.data;
  },

  async getAssetTypes(): Promise<Record<string, any>> {
    const response = await api.get('/api/assets/types');
    return response.data;
  },

  async getWealthTiers(): Promise<Record<string, any>> {
    const response = await api.get('/api/assets/wealth-tiers');
    return response.data;
  },
};

// Trading API
export const tradingAPI = {
  async createOrder(playerId: number, orderData: OrderCreate): Promise<Order> {
    const response = await api.post<Order>(`/api/trading/orders?player_id=${playerId}`, orderData);
    return response.data;
  },

  async getPlayerOrders(
    playerId: number,
    status?: OrderStatus,
    limit = 100
  ): Promise<Order[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    
    const response = await api.get<Order[]>(
      `/api/trading/orders/${playerId}?${params.toString()}`
    );
    return response.data;
  },

  async getOrder(orderId: number): Promise<Order> {
    const response = await api.get<Order>(`/api/trading/orders/order/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId: number, playerId: number): Promise<APIResponse> {
    const response = await api.post<APIResponse>(
      `/api/trading/orders/${orderId}/cancel?player_id=${playerId}`
    );
    return response.data;
  },

  async simulateOrder(playerId: number, orderData: OrderCreate): Promise<any> {
    const response = await api.post(
      `/api/trading/simulate-order?player_id=${playerId}`,
      orderData
    );
    return response.data;
  },

  async getOrderTypes(): Promise<Record<string, any>> {
    const response = await api.get('/api/trading/order-types');
    return response.data;
  },

  async getMarketHours(): Promise<Record<string, any>> {
    const response = await api.get('/api/trading/market-hours');
    return response.data;
  },
};

// System API
export const systemAPI = {
  async getHealth(): Promise<Record<string, any>> {
    const response = await api.get('/health');
    return response.data;
  },

  async getStatus(): Promise<Record<string, any>> {
    const response = await api.get('/api/status/');
    return response.data;
  },

  async getPerformance(): Promise<Record<string, any>> {
    const response = await api.get('/api/status/performance');
    return response.data;
  },

  async getInfo(): Promise<Record<string, any>> {
    const response = await api.get('/api/status/info');
    return response.data;
  },
};

// Export default API object
export default {
  player: playerAPI,
  asset: assetAPI,
  trading: tradingAPI,
  system: systemAPI,
};