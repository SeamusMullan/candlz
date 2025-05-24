import { Asset, Order, MarketEvent, Achievement } from '@/types/api';
import { AssetType, OrderType, OrderSide, OrderStatus, EventType, WealthTier } from '@/types/api';

export const mockAssets: Asset[] = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    asset_type: AssetType.STOCK,
    current_price: '182.50',
    market_cap: '2800000000000',
    volume_24h: '56789123',
    volatility: '0.25',
    beta: '1.2',
    unlocked_at_tier: WealthTier.RETAIL_TRADER,
    is_active: true,
    sector: 'Technology',
    country: 'US',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    symbol: 'BTC',
    name: 'Bitcoin',
    asset_type: AssetType.CRYPTO,
    current_price: '42350.75',
    market_cap: '830000000000',
    volume_24h: '15234567890',
    volatility: '0.65',
    beta: '1.8',
    unlocked_at_tier: WealthTier.RETAIL_TRADER,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    asset_type: AssetType.FOREX,
    current_price: '1.0865',
    volume_24h: '89456123000',
    volatility: '0.15',
    beta: '0.3',
    unlocked_at_tier: WealthTier.ACTIVE_TRADER,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    symbol: 'GOLD',
    name: 'Gold Futures',
    asset_type: AssetType.COMMODITY,
    current_price: '2045.80',
    volume_24h: '234567890',
    volatility: '0.22',
    beta: '0.8',
    unlocked_at_tier: WealthTier.SMALL_FUND,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF',
    asset_type: AssetType.INDEX,
    current_price: '485.25',
    market_cap: '445000000000',
    volume_24h: '78912345',
    volatility: '0.18',
    beta: '1.0',
    unlocked_at_tier: WealthTier.RETAIL_TRADER,
    is_active: true,
    sector: 'Financial',
    country: 'US',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const mockOrders: Order[] = [
  {
    id: 1,
    player_id: 1,
    asset_id: 1,
    order_type: OrderType.MARKET,
    side: OrderSide.BUY,
    quantity: '10',
    status: OrderStatus.FILLED,
    filled_quantity: '10',
    avg_fill_price: '182.50',
    commission: '1.00',
    slippage: '0.05',
    created_at: '2024-01-15T10:30:00Z',
    executed_at: '2024-01-15T10:30:05Z',
    asset: mockAssets[0]
  },
  {
    id: 2,
    player_id: 1,
    asset_id: 2,
    order_type: OrderType.LIMIT,
    side: OrderSide.BUY,
    quantity: '0.5',
    price: '42000.00',
    status: OrderStatus.PENDING,
    filled_quantity: '0',
    commission: '5.00',
    slippage: '0.00',
    created_at: '2024-01-16T14:22:00Z',
    asset: mockAssets[1]
  }
];

export const mockMarketEvents: MarketEvent[] = [
  {
    id: 1,
    event_type: EventType.EARNINGS,
    title: 'Apple Q4 Earnings Report',
    description: 'Apple Inc. reports quarterly earnings results',
    scheduled_time: '2024-01-25T16:30:00Z',
    duration_hours: 2,
    volatility_multiplier: '1.3',
    affected_assets: ['AAPL'],
    price_impact: '0.15',
    is_processed: false,
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: 2,
    event_type: EventType.CENTRAL_BANK,
    title: 'Fed Interest Rate Decision',
    description: 'Federal Reserve announces interest rate decision',
    scheduled_time: '2024-01-31T14:00:00Z',
    duration_hours: 4,
    volatility_multiplier: '1.5',
    price_impact: '0.25',
    is_processed: false,
    created_at: '2024-01-25T00:00:00Z'
  },
  {
    id: 3,
    event_type: EventType.REGULATORY,
    title: 'Crypto Regulation Update',
    description: 'SEC provides update on cryptocurrency regulations',
    scheduled_time: '2024-02-05T10:00:00Z',
    duration_hours: 6,
    volatility_multiplier: '1.8',
    affected_assets: ['BTC'],
    price_impact: '0.35',
    is_processed: false,
    created_at: '2024-01-28T00:00:00Z'
  }
];

export const mockAchievements: Achievement[] = [
  {
    id: 1,
    name: 'First Trade',
    description: 'Complete your first successful trade',
    category: 'Trading',
    unlock_criteria: { trades_count: 1 },
    xp_reward: 100,
    cash_reward: '50.00',
    is_hidden: false,
    rarity: 'Common',
    icon_url: '🎯',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Portfolio Builder',
    description: 'Reach $100,000 in portfolio value',
    category: 'Wealth',
    unlock_criteria: { portfolio_value: 100000 },
    xp_reward: 500,
    cash_reward: '1000.00',
    is_hidden: false,
    rarity: 'Rare',
    icon_url: '💰',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Crypto Pioneer',
    description: 'Trade your first cryptocurrency',
    category: 'Trading',
    unlock_criteria: { crypto_trades: 1 },
    xp_reward: 200,
    cash_reward: '100.00',
    is_hidden: false,
    rarity: 'Uncommon',
    icon_url: '₿',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Market Master',
    description: 'Achieve 90% win rate over 100 trades',
    category: 'Performance',
    unlock_criteria: { win_rate: 0.9, min_trades: 100 },
    xp_reward: 2000,
    cash_reward: '10000.00',
    is_hidden: true,
    rarity: 'Legendary',
    icon_url: '👑',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Day Trader',
    description: 'Complete 10 trades in a single day',
    category: 'Activity',
    unlock_criteria: { daily_trades: 10 },
    xp_reward: 300,
    cash_reward: '250.00',
    is_hidden: false,
    rarity: 'Uncommon',
    icon_url: '⚡',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Generate additional mock assets for variety
export const generateMockAssets = (count: number = 50): Asset[] => {
  const symbols = [
    'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 
    'ETH', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI',
    'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP',
    'OIL', 'SILVER', 'COPPER', 'PLATINUM', 'WHEAT', 'CORN',
    'QQQ', 'IWM', 'VIX', 'DIA', 'EEM', 'TLT'
  ];
  
  const names = [
    'Microsoft Corporation', 'Alphabet Inc.', 'Amazon.com Inc.', 'Tesla Inc.', 
    'Meta Platforms Inc.', 'NVIDIA Corporation', 'Netflix Inc.', 'Advanced Micro Devices',
    'Ethereum', 'Cardano', 'Solana', 'Polkadot', 'Avalanche', 'Polygon', 'Chainlink', 'Uniswap',
    'British Pound / US Dollar', 'US Dollar / Japanese Yen', 'Australian Dollar / US Dollar',
    'US Dollar / Canadian Dollar', 'New Zealand Dollar / US Dollar', 'Euro / British Pound',
    'Crude Oil Futures', 'Silver Futures', 'Copper Futures', 'Platinum Futures', 
    'Wheat Futures', 'Corn Futures',
    'Invesco QQQ Trust', 'iShares Russell 2000 ETF', 'CBOE Volatility Index',
    'SPDR Dow Jones Industrial Average ETF', 'iShares MSCI Emerging Markets ETF', 'iShares 20+ Year Treasury Bond ETF'
  ];
  
  const types = [
    AssetType.STOCK, AssetType.STOCK, AssetType.STOCK, AssetType.STOCK,
    AssetType.CRYPTO, AssetType.CRYPTO, AssetType.FOREX,
    AssetType.COMMODITY, AssetType.INDEX
  ];
  
  return Array.from({ length: Math.min(count, symbols.length) }, (_, i) => ({
    id: i + 100,
    symbol: symbols[i],
    name: names[i],
    asset_type: types[i % types.length],
    current_price: (Math.random() * 1000 + 10).toFixed(2),
    market_cap: (Math.random() * 1000000000000).toString(),
    volume_24h: (Math.random() * 1000000000).toString(),
    volatility: (Math.random() * 0.8 + 0.1).toFixed(2),
    beta: (Math.random() * 2).toFixed(1),
    unlocked_at_tier: Object.values(WealthTier)[Math.floor(Math.random() * 3)] as WealthTier,
    is_active: Math.random() > 0.1,
    sector: ['Technology', 'Financial', 'Healthcare', 'Energy', 'Consumer'][Math.floor(Math.random() * 5)],
    country: ['US', 'EU', 'JP', 'UK'][Math.floor(Math.random() * 4)],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }));
};