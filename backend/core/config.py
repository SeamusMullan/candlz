import os
from decimal import Decimal
from typing import Dict, List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Configuration
    API_KEY: str = os.getenv("API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "candlz-secret-key-change-in-production")
    
    # Database Configuration
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./candlz_game.db")
    
    # Game Configuration
    DEFAULT_STARTING_CAPITAL: Decimal = Decimal("10000.00")
    MIN_STARTING_CAPITAL: Decimal = Decimal("1000.00")
    MAX_STARTING_CAPITAL: Decimal = Decimal("100000.00")
    
    # Trading Configuration
    DEFAULT_COMMISSION_RATE: Decimal = Decimal("0.001")  # 0.1%
    MIN_TRADE_AMOUNT: Decimal = Decimal("1.00")
    MAX_SLIPPAGE: Decimal = Decimal("0.05")  # 5%
    
    # Market Simulation
    MARKET_UPDATE_INTERVAL_SECONDS: int = int(os.getenv("MARKET_UPDATE_INTERVAL", "1"))
    PRICE_PRECISION: int = 8
    VOLUME_PRECISION: int = 2
    
    # Game Speed
    MIN_GAME_SPEED: Decimal = Decimal("0.1")
    MAX_GAME_SPEED: Decimal = Decimal("10.0")
    DEFAULT_GAME_SPEED: Decimal = Decimal("1.0")
    
    # Wealth Tiers and Thresholds
    WEALTH_TIER_THRESHOLDS: Dict[str, Decimal] = {
        "retail_trader": Decimal("1000"),       # $1K - $10K
        "active_trader": Decimal("10000"),      # $10K - $100K  
        "small_fund": Decimal("100000"),        # $100K - $1M
        "hedge_fund": Decimal("1000000"),       # $1M - $10M
        "institution": Decimal("10000000"),     # $10M - $100M
        "billionaire": Decimal("100000000"),    # $100M - $1B
        "market_maker": Decimal("1000000000"),  # $1B - $100B
        "market_god": Decimal("100000000000")   # $100B+
    }
    
    # Asset Types and Default Configurations
    ASSET_TYPES: List[str] = [
        "stock", "crypto", "forex", "commodity", "index", "bond", "derivative"
    ]
    
    DEFAULT_ASSET_VOLATILITIES: Dict[str, Decimal] = {
        "stock": Decimal("0.02"),      # 2% daily volatility
        "crypto": Decimal("0.05"),     # 5% daily volatility
        "forex": Decimal("0.01"),      # 1% daily volatility
        "commodity": Decimal("0.025"), # 2.5% daily volatility
        "index": Decimal("0.015"),     # 1.5% daily volatility
        "bond": Decimal("0.005"),      # 0.5% daily volatility
        "derivative": Decimal("0.08")  # 8% daily volatility
    }
    
    # Risk Management
    MAX_POSITION_SIZE: Decimal = Decimal("1.0")    # 100% of portfolio
    DEFAULT_MAX_POSITION_SIZE: Decimal = Decimal("0.1")  # 10% of portfolio
    MAX_LEVERAGE: Decimal = Decimal("10.0")
    
    # Experience and Leveling
    XP_PER_TRADE: int = 10
    XP_PER_PROFITABLE_TRADE: int = 25
    XP_PER_ACHIEVEMENT: int = 100
    XP_MULTIPLIER_PER_LEVEL: Decimal = Decimal("1.2")
    
    # Algorithm Configuration
    MAX_ALGORITHMS_PER_PLAYER: int = 10
    ALGORITHM_TIMEOUT_SECONDS: int = 30
    MAX_ALGORITHM_ORDERS_PER_MINUTE: int = 60
    
    # Market Events
    EVENT_PROBABILITY_PER_DAY: Decimal = Decimal("0.1")  # 10% chance per day
    MAX_CONCURRENT_EVENTS: int = 3
    
    # Performance Metrics
    RISK_FREE_RATE: Decimal = Decimal("0.02")  # 2% annual risk-free rate for Sharpe ratio
    
    # Cache and Performance
    PRICE_HISTORY_CACHE_SIZE: int = 1000
    INDICATOR_CALCULATION_WINDOW: int = 200
    
    # API Rate Limiting
    API_RATE_LIMIT_PER_MINUTE: int = 1000
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    MAX_FILE_SIZE_MB: int = 10
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "candlz.log")

class GameConstants:
    """
    Game-specific constants that don't change during runtime.
    """
    
    # Order Types
    ORDER_TYPES = ["market", "limit", "stop", "stop_limit"]
    ORDER_SIDES = ["buy", "sell"] 
    ORDER_STATUSES = ["pending", "filled", "partially_filled", "cancelled", "rejected"]
    
    # Market Phases
    MARKET_PHASES = ["normal", "bull", "bear", "crash", "recovery"]
    ECONOMIC_CYCLES = ["expansion", "peak", "contraction", "trough"]
    
    # Event Types
    EVENT_TYPES = [
        "earnings", "economic_data", "central_bank", "geopolitical",
        "natural_disaster", "regulatory", "market_crash", "bull_run"
    ]
    
    # Achievement Categories
    ACHIEVEMENT_CATEGORIES = [
        "trading", "portfolio", "wealth", "risk_management", "algorithm",
        "market_timing", "endurance", "special"
    ]
    
    # Achievement Rarities
    ACHIEVEMENT_RARITIES = ["common", "rare", "epic", "legendary"]
    
    # Technical Indicators
    SUPPORTED_INDICATORS = [
        "sma", "ema", "rsi", "macd", "bollinger_bands", "stochastic",
        "williams_r", "cci", "momentum", "rate_of_change"
    ]
    
    # Market Data Timeframes
    TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"]
    
    # Default Asset Symbols (for initial game setup)
    DEFAULT_STOCKS = [
        "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX"
    ]
    
    DEFAULT_CRYPTO = [
        "BTC", "ETH", "BNB", "ADA", "SOL", "DOT", "AVAX", "MATIC"
    ]
    
    DEFAULT_FOREX = [
        "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD"
    ]
    
    DEFAULT_COMMODITIES = [
        "GOLD", "SILVER", "OIL", "NATGAS", "WHEAT", "CORN", "COFFEE", "SUGAR"
    ]

settings = Settings()
constants = GameConstants()