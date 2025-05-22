from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field

Base = declarative_base()

# Enums
class AssetType(str, Enum):
    STOCK = "stock"
    CRYPTO = "crypto" 
    FOREX = "forex"
    COMMODITY = "commodity"
    INDEX = "index"
    BOND = "bond"
    DERIVATIVE = "derivative"

class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class OrderStatus(str, Enum):
    PENDING = "pending"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class WealthTier(str, Enum):
    RETAIL_TRADER = "retail_trader"        # $1K - $10K
    ACTIVE_TRADER = "active_trader"        # $10K - $100K
    SMALL_FUND = "small_fund"              # $100K - $1M
    HEDGE_FUND = "hedge_fund"              # $1M - $10M
    INSTITUTION = "institution"            # $10M - $100M
    BILLIONAIRE = "billionaire"            # $100M - $1B
    MARKET_MAKER = "market_maker"          # $1B - $100B
    MARKET_GOD = "market_god"              # $100B+

class EventType(str, Enum):
    EARNINGS = "earnings"
    ECONOMIC_DATA = "economic_data"
    CENTRAL_BANK = "central_bank"
    GEOPOLITICAL = "geopolitical"
    NATURAL_DISASTER = "natural_disaster"
    REGULATORY = "regulatory"
    MARKET_CRASH = "market_crash"
    BULL_RUN = "bull_run"

# SQLAlchemy Models
class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    
    # Game progression
    wealth_tier = Column(String(20), default=WealthTier.RETAIL_TRADER.value)
    experience_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    prestige_level = Column(Integer, default=0)
    
    # Starting capital and current portfolio value
    starting_capital = Column(Numeric(precision=15, scale=2), default=Decimal('10000.00'))
    current_portfolio_value = Column(Numeric(precision=15, scale=2), default=Decimal('10000.00'))
    cash_balance = Column(Numeric(precision=15, scale=2), default=Decimal('10000.00'))
    
    # Game settings
    game_speed_multiplier = Column(Numeric(precision=4, scale=2), default=Decimal('1.0'))
    auto_save_enabled = Column(Boolean, default=True)
    
    # Relationships
    portfolios = relationship("Portfolio", back_populates="player")
    orders = relationship("Order", back_populates="player")
    achievements = relationship("PlayerAchievement", back_populates="player")
    algorithms = relationship("TradingAlgorithm", back_populates="player")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    asset_type = Column(String(20), nullable=False)
    
    # Market data
    current_price = Column(Numeric(precision=15, scale=8), nullable=False)
    market_cap = Column(Numeric(precision=20, scale=2))
    volume_24h = Column(Numeric(precision=20, scale=2))
    
    # Volatility and risk metrics
    volatility = Column(Numeric(precision=5, scale=4), default=Decimal('0.02'))  # Daily volatility
    beta = Column(Numeric(precision=4, scale=3), default=Decimal('1.0'))
    
    # Availability and unlock requirements
    unlocked_at_tier = Column(String(20), default=WealthTier.RETAIL_TRADER.value)
    is_active = Column(Boolean, default=True)
    
    # Additional metadata
    description = Column(Text)
    sector = Column(String(100))
    country = Column(String(50))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    price_history = relationship("PriceHistory", back_populates="asset")
    portfolio_positions = relationship("Portfolio", back_populates="asset")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Position data
    quantity = Column(Numeric(precision=15, scale=8), nullable=False)
    avg_purchase_price = Column(Numeric(precision=15, scale=8), nullable=False)
    total_invested = Column(Numeric(precision=15, scale=2), nullable=False)
    
    # Calculated fields (updated periodically)
    current_value = Column(Numeric(precision=15, scale=2))
    unrealized_pnl = Column(Numeric(precision=15, scale=2))
    realized_pnl = Column(Numeric(precision=15, scale=2), default=Decimal('0.0'))
    
    # Timestamps
    first_purchase = Column(DateTime, default=datetime.utcnow)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    player = relationship("Player", back_populates="portfolios")
    asset = relationship("Asset", back_populates="portfolio_positions")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # Order details
    order_type = Column(String(20), nullable=False)
    side = Column(String(10), nullable=False)
    quantity = Column(Numeric(precision=15, scale=8), nullable=False)
    price = Column(Numeric(precision=15, scale=8))  # None for market orders
    stop_price = Column(Numeric(precision=15, scale=8))  # For stop orders
    
    # Order status and execution
    status = Column(String(20), default=OrderStatus.PENDING.value)
    filled_quantity = Column(Numeric(precision=15, scale=8), default=Decimal('0'))
    avg_fill_price = Column(Numeric(precision=15, scale=8))
    
    # Fees and costs
    commission = Column(Numeric(precision=10, scale=2), default=Decimal('0'))
    slippage = Column(Numeric(precision=10, scale=6), default=Decimal('0'))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime)
    expires_at = Column(DateTime)  # For GTD orders
    
    # Algorithm reference (if placed by algorithm)
    algorithm_id = Column(Integer, ForeignKey("trading_algorithms.id"))
    
    # Relationships
    player = relationship("Player", back_populates="orders")
    asset = relationship("Asset")
    algorithm = relationship("TradingAlgorithm", back_populates="orders")

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    
    # OHLCV data
    timestamp = Column(DateTime, nullable=False, index=True)
    open_price = Column(Numeric(precision=15, scale=8), nullable=False)
    high_price = Column(Numeric(precision=15, scale=8), nullable=False)
    low_price = Column(Numeric(precision=15, scale=8), nullable=False)
    close_price = Column(Numeric(precision=15, scale=8), nullable=False)
    volume = Column(Numeric(precision=20, scale=2), default=Decimal('0'))
    
    # Calculated indicators (cached for performance)
    sma_20 = Column(Numeric(precision=15, scale=8))
    sma_50 = Column(Numeric(precision=15, scale=8))
    ema_12 = Column(Numeric(precision=15, scale=8))
    ema_26 = Column(Numeric(precision=15, scale=8))
    rsi = Column(Numeric(precision=5, scale=2))
    
    # Relationship
    asset = relationship("Asset", back_populates="price_history")

class MarketEvent(Base):
    __tablename__ = "market_events"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(30), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # Event timing
    scheduled_time = Column(DateTime, nullable=False, index=True)
    duration_hours = Column(Integer, default=1)
    
    # Market impact
    volatility_multiplier = Column(Numeric(precision=4, scale=2), default=Decimal('1.0'))
    affected_assets = Column(JSON)  # List of asset symbols or sectors
    price_impact = Column(Numeric(precision=5, scale=4))  # Expected price change %
    
    # Event status
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    
    # Requirements and rewards
    unlock_criteria = Column(JSON, nullable=False)  # Flexible criteria storage
    xp_reward = Column(Integer, default=0)
    cash_reward = Column(Numeric(precision=15, scale=2), default=Decimal('0'))
    
    # Metadata
    is_hidden = Column(Boolean, default=False)
    rarity = Column(String(20), default="common")  # common, rare, epic, legendary
    icon_url = Column(String(200))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    player_achievements = relationship("PlayerAchievement", back_populates="achievement")

class PlayerAchievement(Base):
    __tablename__ = "player_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    progress_data = Column(JSON)  # For achievements with progress tracking
    
    # Relationships
    player = relationship("Player", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="player_achievements")

class TradingAlgorithm(Base):
    __tablename__ = "trading_algorithms"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    
    # Algorithm metadata
    name = Column(String(100), nullable=False)
    description = Column(Text)
    version = Column(String(20), default="1.0")
    
    # Code and execution
    source_code = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False)
    is_compiled = Column(Boolean, default=False)
    
    # Performance tracking
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    total_pnl = Column(Numeric(precision=15, scale=2), default=Decimal('0'))
    max_drawdown = Column(Numeric(precision=5, scale=4), default=Decimal('0'))
    sharpe_ratio = Column(Numeric(precision=6, scale=4))
    
    # Risk management
    max_position_size = Column(Numeric(precision=5, scale=4), default=Decimal('0.1'))  # 10% of portfolio
    stop_loss_pct = Column(Numeric(precision=5, scale=4))
    take_profit_pct = Column(Numeric(precision=5, scale=4))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_run = Column(DateTime)
    last_modified = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    player = relationship("Player", back_populates="algorithms")
    orders = relationship("Order", back_populates="algorithm")

class GameState(Base):
    __tablename__ = "game_state"
    
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    
    # Game timing
    game_time = Column(DateTime, nullable=False)  # Current game time
    real_time_last_update = Column(DateTime, default=datetime.utcnow)
    paused = Column(Boolean, default=False)
    
    # Market state
    market_phase = Column(String(20), default="normal")  # normal, bull, bear, crash, recovery
    market_volatility = Column(Numeric(precision=4, scale=3), default=Decimal('1.0'))
    economic_cycle = Column(String(20), default="expansion")  # expansion, peak, contraction, trough
    
    # Game settings and state
    settings = Column(JSON, default=dict)
    statistics = Column(JSON, default=dict)
    
    last_save = Column(DateTime, default=datetime.utcnow)