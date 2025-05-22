from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from .models import AssetType, OrderType, OrderSide, OrderStatus, WealthTier, EventType

# Pydantic schemas for API serialization

class PlayerBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

class PlayerCreate(PlayerBase):
    starting_capital: Optional[Decimal] = Field(default=Decimal('10000.00'), ge=1000, le=100000)

class PlayerUpdate(BaseModel):
    game_speed_multiplier: Optional[Decimal] = Field(None, ge=0.1, le=10.0)
    auto_save_enabled: Optional[bool] = None

class Player(PlayerBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    last_login: datetime
    wealth_tier: WealthTier
    experience_points: int
    level: int
    prestige_level: int
    starting_capital: Decimal
    current_portfolio_value: Decimal
    cash_balance: Decimal
    game_speed_multiplier: Decimal
    auto_save_enabled: bool

class AssetBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=1, max_length=200)
    asset_type: AssetType

class AssetCreate(AssetBase):
    current_price: Decimal = Field(..., gt=0)
    market_cap: Optional[Decimal] = Field(None, ge=0)
    volume_24h: Optional[Decimal] = Field(None, ge=0)
    volatility: Optional[Decimal] = Field(default=Decimal('0.02'), ge=0, le=1)
    beta: Optional[Decimal] = Field(default=Decimal('1.0'), ge=0)
    unlocked_at_tier: Optional[WealthTier] = Field(default=WealthTier.RETAIL_TRADER)
    description: Optional[str] = None
    sector: Optional[str] = None
    country: Optional[str] = None

class AssetUpdate(BaseModel):
    current_price: Optional[Decimal] = Field(None, gt=0)
    market_cap: Optional[Decimal] = Field(None, ge=0)
    volume_24h: Optional[Decimal] = Field(None, ge=0)
    volatility: Optional[Decimal] = Field(None, ge=0, le=1)
    beta: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None

class Asset(AssetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    current_price: Decimal
    market_cap: Optional[Decimal]
    volume_24h: Optional[Decimal]
    volatility: Decimal
    beta: Decimal
    unlocked_at_tier: WealthTier
    is_active: bool
    description: Optional[str]
    sector: Optional[str]
    country: Optional[str]
    created_at: datetime
    updated_at: datetime

class PortfolioBase(BaseModel):
    quantity: Decimal = Field(..., gt=0)
    avg_purchase_price: Decimal = Field(..., gt=0)

class Portfolio(PortfolioBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    player_id: int
    asset_id: int
    total_invested: Decimal
    current_value: Optional[Decimal]
    unrealized_pnl: Optional[Decimal]
    realized_pnl: Decimal
    first_purchase: datetime
    last_updated: datetime
    
    # Related data
    asset: Optional[Asset] = None

class OrderBase(BaseModel):
    asset_id: int
    order_type: OrderType
    side: OrderSide
    quantity: Decimal = Field(..., gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    stop_price: Optional[Decimal] = Field(None, gt=0)

class OrderCreate(OrderBase):
    expires_at: Optional[datetime] = None

class Order(OrderBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    player_id: int
    status: OrderStatus
    filled_quantity: Decimal
    avg_fill_price: Optional[Decimal]
    commission: Decimal
    slippage: Decimal
    created_at: datetime
    executed_at: Optional[datetime]
    expires_at: Optional[datetime]
    algorithm_id: Optional[int]
    
    # Related data
    asset: Optional[Asset] = None

class PriceHistoryBase(BaseModel):
    timestamp: datetime
    open_price: Decimal = Field(..., gt=0)
    high_price: Decimal = Field(..., gt=0)
    low_price: Decimal = Field(..., gt=0)
    close_price: Decimal = Field(..., gt=0)
    volume: Optional[Decimal] = Field(default=Decimal('0'), ge=0)

class PriceHistory(PriceHistoryBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    asset_id: int
    sma_20: Optional[Decimal]
    sma_50: Optional[Decimal]
    ema_12: Optional[Decimal]
    ema_26: Optional[Decimal]
    rsi: Optional[Decimal]

class MarketEventBase(BaseModel):
    event_type: EventType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scheduled_time: datetime
    duration_hours: Optional[int] = Field(default=1, ge=1, le=168)  # Max 1 week

class MarketEventCreate(MarketEventBase):
    volatility_multiplier: Optional[Decimal] = Field(default=Decimal('1.0'), ge=0.1, le=10.0)
    affected_assets: Optional[List[str]] = None
    price_impact: Optional[Decimal] = Field(None, ge=-1, le=1)  # -100% to +100%

class MarketEvent(MarketEventBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    volatility_multiplier: Decimal
    affected_assets: Optional[List[str]]
    price_impact: Optional[Decimal]
    is_processed: bool
    created_at: datetime

class AchievementBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=50)

class AchievementCreate(AchievementBase):
    unlock_criteria: Dict[str, Any]
    xp_reward: Optional[int] = Field(default=0, ge=0)
    cash_reward: Optional[Decimal] = Field(default=Decimal('0'), ge=0)
    is_hidden: Optional[bool] = False
    rarity: Optional[str] = Field(default="common", pattern="^(common|rare|epic|legendary)$")
    icon_url: Optional[str] = None

class Achievement(AchievementBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    unlock_criteria: Dict[str, Any]
    xp_reward: int
    cash_reward: Decimal
    is_hidden: bool
    rarity: str
    icon_url: Optional[str]
    created_at: datetime

class PlayerAchievement(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    player_id: int
    achievement_id: int
    unlocked_at: datetime
    progress_data: Optional[Dict[str, Any]]
    
    # Related data
    achievement: Optional[Achievement] = None

class TradingAlgorithmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    source_code: str = Field(..., min_length=1)

class TradingAlgorithmCreate(TradingAlgorithmBase):
    max_position_size: Optional[Decimal] = Field(default=Decimal('0.1'), ge=0.01, le=1.0)
    stop_loss_pct: Optional[Decimal] = Field(None, ge=0, le=1)
    take_profit_pct: Optional[Decimal] = Field(None, ge=0, le=10)

class TradingAlgorithmUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    source_code: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None
    max_position_size: Optional[Decimal] = Field(None, ge=0.01, le=1.0)
    stop_loss_pct: Optional[Decimal] = Field(None, ge=0, le=1)
    take_profit_pct: Optional[Decimal] = Field(None, ge=0, le=10)

class TradingAlgorithm(TradingAlgorithmBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    player_id: int
    version: str
    is_active: bool
    is_compiled: bool
    total_trades: int
    winning_trades: int
    total_pnl: Decimal
    max_drawdown: Decimal
    sharpe_ratio: Optional[Decimal]
    max_position_size: Decimal
    stop_loss_pct: Optional[Decimal]
    take_profit_pct: Optional[Decimal]
    created_at: datetime
    last_run: Optional[datetime]
    last_modified: datetime

class GameStateBase(BaseModel):
    game_time: datetime
    paused: Optional[bool] = False

class GameStateUpdate(BaseModel):
    paused: Optional[bool] = None
    market_phase: Optional[str] = Field(None, pattern="^(normal|bull|bear|crash|recovery)$")
    market_volatility: Optional[Decimal] = Field(None, ge=0.1, le=10.0)
    economic_cycle: Optional[str] = Field(None, pattern="^(expansion|peak|contraction|trough)$")
    settings: Optional[Dict[str, Any]] = None

class GameState(GameStateBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    player_id: int
    real_time_last_update: datetime
    market_phase: str
    market_volatility: Decimal
    economic_cycle: str
    settings: Dict[str, Any]
    statistics: Dict[str, Any]
    last_save: datetime

# Response models for complex queries
class PortfolioSummary(BaseModel):
    total_value: Decimal
    total_invested: Decimal
    total_pnl: Decimal
    total_pnl_pct: Decimal
    cash_balance: Decimal
    positions: List[Portfolio]

class PlayerStats(BaseModel):
    total_trades: int
    winning_trades: int
    win_rate: Decimal
    total_pnl: Decimal
    best_trade: Decimal
    worst_trade: Decimal
    sharpe_ratio: Optional[Decimal]
    max_drawdown: Decimal
    days_played: int
    achievements_unlocked: int

class MarketData(BaseModel):
    assets: List[Asset]
    market_phase: str
    market_volatility: Decimal
    active_events: List[MarketEvent]
    
class LeaderboardEntry(BaseModel):
    player_id: int
    username: str
    portfolio_value: Decimal
    pnl_pct: Decimal
    wealth_tier: WealthTier
    rank: int

class APIResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None
    errors: Optional[List[str]] = None