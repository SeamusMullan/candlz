// API Types for Candlz Trading Game Frontend

export interface Player {
  id: number;
  username: string;
  created_at: string;
  last_login: string;
  wealth_tier: WealthTier;
  experience_points: number;
  level: number;
  prestige_level: number;
  starting_capital: string;
  current_portfolio_value: string;
  cash_balance: string;
  game_speed_multiplier: string;
  auto_save_enabled: boolean;
}

export interface PlayerCreate {
  username: string;
  starting_capital?: string;
}

export interface Asset {
  id: number;
  symbol: string;
  name: string;
  asset_type: AssetType;
  current_price: string;
  market_cap?: string;
  volume_24h?: string;
  volatility: string;
  beta: string;
  unlocked_at_tier: WealthTier;
  is_active: boolean;
  description?: string;
  sector?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: number;
  player_id: number;
  asset_id: number;
  quantity: string;
  avg_purchase_price: string;
  total_invested: string;
  current_value?: string;
  unrealized_pnl?: string;
  realized_pnl: string;
  first_purchase: string;
  last_updated: string;
  asset?: Asset;
}

export interface Order {
  id: number;
  player_id: number;
  asset_id: number;
  order_type: OrderType;
  side: OrderSide;
  quantity: string;
  price?: string;
  stop_price?: string;
  status: OrderStatus;
  filled_quantity: string;
  avg_fill_price?: string;
  commission: string;
  slippage: string;
  created_at: string;
  executed_at?: string;
  expires_at?: string;
  algorithm_id?: number;
  asset?: Asset;
}

export interface OrderCreate {
  asset_id: number;
  order_type: OrderType;
  side: OrderSide;
  quantity: string;
  price?: string;
  stop_price?: string;
  expires_at?: string;
}

export interface PriceHistory {
  id: number;
  asset_id: number;
  timestamp: string;
  open_price: string;
  high_price: string;
  low_price: string;
  close_price: string;
  volume?: string;
  sma_20?: string;
  sma_50?: string;
  ema_12?: string;
  ema_26?: string;
  rsi?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  unlock_criteria: Record<string, any>;
  xp_reward: number;
  cash_reward: string;
  is_hidden: boolean;
  rarity: string;
  icon_url?: string;
  created_at: string;
}

export interface PlayerAchievement {
  id: number;
  player_id: number;
  achievement_id: number;
  unlocked_at: string;
  progress_data?: Record<string, any>;
  achievement?: Achievement;
}

export interface PortfolioSummary {
  total_value: string;
  total_invested: string;
  total_pnl: string;
  total_pnl_pct: string;
  cash_balance: string;
  positions: Portfolio[];
}

export interface PlayerStats {
  total_trades: number;
  winning_trades: number;
  win_rate: string;
  total_pnl: string;
  best_trade: string;
  worst_trade: string;
  sharpe_ratio?: string;
  max_drawdown: string;
  days_played: number;
  achievements_unlocked: number;
}

export interface LeaderboardEntry {
  player_id: number;
  username: string;
  portfolio_value: string;
  pnl_pct: string;
  wealth_tier: WealthTier;
  rank: number;
}

export interface MarketData {
  assets: Asset[];
  market_phase: string;
  market_volatility: string;
  active_events: MarketEvent[];
}

export interface MarketEvent {
  id: number;
  event_type: EventType;
  title: string;
  description?: string;
  scheduled_time: string;
  duration_hours: number;
  volatility_multiplier: string;
  affected_assets?: string[];
  price_impact?: string;
  is_processed: boolean;
  created_at: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

// Enums
export enum AssetType {
  STOCK = 'stock',
  CRYPTO = 'crypto',
  FOREX = 'forex',
  COMMODITY = 'commodity',
  INDEX = 'index',
  BOND = 'bond',
  DERIVATIVE = 'derivative'
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum OrderStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum WealthTier {
  RETAIL_TRADER = 'retail_trader',
  ACTIVE_TRADER = 'active_trader',
  SMALL_FUND = 'small_fund',
  HEDGE_FUND = 'hedge_fund',
  INSTITUTION = 'institution',
  BILLIONAIRE = 'billionaire',
  MARKET_MAKER = 'market_maker',
  MARKET_GOD = 'market_god'
}

export enum EventType {
  EARNINGS = 'earnings',
  ECONOMIC_DATA = 'economic_data',
  CENTRAL_BANK = 'central_bank',
  GEOPOLITICAL = 'geopolitical',
  NATURAL_DISASTER = 'natural_disaster',
  REGULATORY = 'regulatory',
  MARKET_CRASH = 'market_crash',
  BULL_RUN = 'bull_run'
}