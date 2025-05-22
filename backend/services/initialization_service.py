import random
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Dict
from sqlalchemy.orm import Session
from core.models import Asset, Achievement, AssetType, WealthTier
from core.config import settings, constants
from services.database_service import DatabaseService

class InitializationService:
    """
    Service for initializing the game database with default data.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.db_service = DatabaseService(db)
    
    def initialize_game_data(self, reset_existing: bool = False) -> Dict[str, int]:
        """
        Initialize the game with default assets, achievements, and other data.
        Returns counts of created items.
        """
        results = {
            "assets": 0,
            "achievements": 0,
            "market_events": 0
        }
        
        if reset_existing:
            self._clear_existing_data()
        
        results["assets"] = self._create_default_assets()
        results["achievements"] = self._create_default_achievements()
        
        return results
    
    def _clear_existing_data(self):
        """Clear existing game data (use with caution!)."""
        # Clear in reverse dependency order
        self.db.query(Achievement).delete()
        self.db.query(Asset).delete()
        self.db.commit()
    
    def _create_default_assets(self) -> int:
        """Create default tradeable assets."""
        assets_created = 0
        
        # Create stocks
        stock_data = [
            {"symbol": "AAPL", "name": "Apple Inc.", "price": Decimal("180.00"), "sector": "Technology"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": Decimal("140.00"), "sector": "Technology"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "price": Decimal("380.00"), "sector": "Technology"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "price": Decimal("150.00"), "sector": "Consumer Discretionary"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "price": Decimal("250.00"), "sector": "Automotive"},
            {"symbol": "META", "name": "Meta Platforms Inc.", "price": Decimal("350.00"), "sector": "Technology"},
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "price": Decimal("900.00"), "sector": "Technology"},
            {"symbol": "NFLX", "name": "Netflix Inc.", "price": Decimal("450.00"), "sector": "Entertainment"},
            {"symbol": "JPM", "name": "JPMorgan Chase & Co.", "price": Decimal("170.00"), "sector": "Financials"},
            {"symbol": "JNJ", "name": "Johnson & Johnson", "price": Decimal("160.00"), "sector": "Healthcare"}
        ]
        
        for stock in stock_data:
            if not self.db_service.get_asset_by_symbol(stock["symbol"]):
                asset = self.db_service.create_asset({
                    "symbol": stock["symbol"],
                    "name": stock["name"],
                    "asset_type": AssetType.STOCK,
                    "current_price": stock["price"],
                    "market_cap": stock["price"] * Decimal(str(random.randint(1000000000, 3000000000))),
                    "volume_24h": Decimal(str(random.randint(10000000, 100000000))),
                    "volatility": Decimal("0.02"),
                    "beta": Decimal(str(round(random.uniform(0.5, 2.0), 2))),
                    "unlocked_at_tier": WealthTier.RETAIL_TRADER,
                    "sector": stock["sector"],
                    "country": "USA"
                })
                assets_created += 1
        
        # Create cryptocurrencies
        crypto_data = [
            {"symbol": "BTC", "name": "Bitcoin", "price": Decimal("65000.00")},
            {"symbol": "ETH", "name": "Ethereum", "price": Decimal("3500.00")},
            {"symbol": "BNB", "name": "Binance Coin", "price": Decimal("350.00")},
            {"symbol": "ADA", "name": "Cardano", "price": Decimal("0.45")},
            {"symbol": "SOL", "name": "Solana", "price": Decimal("100.00")},
            {"symbol": "DOT", "name": "Polkadot", "price": Decimal("7.50")},
            {"symbol": "AVAX", "name": "Avalanche", "price": Decimal("35.00")},
            {"symbol": "MATIC", "name": "Polygon", "price": Decimal("0.80")}
        ]
        
        for crypto in crypto_data:
            if not self.db_service.get_asset_by_symbol(crypto["symbol"]):
                asset = self.db_service.create_asset({
                    "symbol": crypto["symbol"],
                    "name": crypto["name"],
                    "asset_type": AssetType.CRYPTO,
                    "current_price": crypto["price"],
                    "market_cap": crypto["price"] * Decimal(str(random.randint(1000000, 1000000000))),
                    "volume_24h": Decimal(str(random.randint(1000000, 50000000))),
                    "volatility": Decimal("0.05"),
                    "beta": Decimal("1.5"),
                    "unlocked_at_tier": WealthTier.ACTIVE_TRADER,
                    "country": "Global"
                })
                assets_created += 1
        
        # Create forex pairs
        forex_data = [
            {"symbol": "EURUSD", "name": "Euro/US Dollar", "price": Decimal("1.0800")},
            {"symbol": "GBPUSD", "name": "British Pound/US Dollar", "price": Decimal("1.2650")},
            {"symbol": "USDJPY", "name": "US Dollar/Japanese Yen", "price": Decimal("150.00")},
            {"symbol": "AUDUSD", "name": "Australian Dollar/US Dollar", "price": Decimal("0.6500")},
            {"symbol": "USDCAD", "name": "US Dollar/Canadian Dollar", "price": Decimal("1.3500")},
            {"symbol": "USDCHF", "name": "US Dollar/Swiss Franc", "price": Decimal("0.9100")},
            {"symbol": "NZDUSD", "name": "New Zealand Dollar/US Dollar", "price": Decimal("0.6000")}
        ]
        
        for forex in forex_data:
            if not self.db_service.get_asset_by_symbol(forex["symbol"]):
                asset = self.db_service.create_asset({
                    "symbol": forex["symbol"],
                    "name": forex["name"],
                    "asset_type": AssetType.FOREX,
                    "current_price": forex["price"],
                    "volume_24h": Decimal(str(random.randint(100000000, 1000000000))),
                    "volatility": Decimal("0.01"),
                    "beta": Decimal("0.8"),
                    "unlocked_at_tier": WealthTier.SMALL_FUND,
                    "country": "Global"
                })
                assets_created += 1
        
        # Create commodities
        commodity_data = [
            {"symbol": "GOLD", "name": "Gold", "price": Decimal("2000.00")},
            {"symbol": "SILVER", "name": "Silver", "price": Decimal("25.00")},
            {"symbol": "OIL", "name": "Crude Oil", "price": Decimal("80.00")},
            {"symbol": "NATGAS", "name": "Natural Gas", "price": Decimal("3.50")},
            {"symbol": "WHEAT", "name": "Wheat", "price": Decimal("650.00")},
            {"symbol": "CORN", "name": "Corn", "price": Decimal("450.00")},
            {"symbol": "COFFEE", "name": "Coffee", "price": Decimal("180.00")},
            {"symbol": "SUGAR", "name": "Sugar", "price": Decimal("25.00")}
        ]
        
        for commodity in commodity_data:
            if not self.db_service.get_asset_by_symbol(commodity["symbol"]):
                asset = self.db_service.create_asset({
                    "symbol": commodity["symbol"],
                    "name": commodity["name"],
                    "asset_type": AssetType.COMMODITY,
                    "current_price": commodity["price"],
                    "volume_24h": Decimal(str(random.randint(1000000, 50000000))),
                    "volatility": Decimal("0.025"),
                    "beta": Decimal("0.6"),
                    "unlocked_at_tier": WealthTier.HEDGE_FUND,
                    "country": "Global"
                })
                assets_created += 1
        
        return assets_created
    
    def _create_default_achievements(self) -> int:
        """Create default achievements."""
        achievements_created = 0
        
        achievements_data = [
            # Trading achievements
            {
                "name": "First Trade",
                "description": "Execute your first trade",
                "category": "trading",
                "unlock_criteria": {"trades_count": 1},
                "xp_reward": 50,
                "cash_reward": Decimal("100.00"),
                "rarity": "common"
            },
            {
                "name": "Day Trader",
                "description": "Execute 10 trades in a single day",
                "category": "trading",
                "unlock_criteria": {"daily_trades": 10},
                "xp_reward": 200,
                "cash_reward": Decimal("500.00"),
                "rarity": "rare"
            },
            {
                "name": "High Frequency",
                "description": "Execute 100 trades",
                "category": "trading",
                "unlock_criteria": {"total_trades": 100},
                "xp_reward": 300,
                "cash_reward": Decimal("1000.00"),
                "rarity": "rare"
            },
            
            # Wealth achievements
            {
                "name": "Getting Started",
                "description": "Reach $25,000 portfolio value",
                "category": "wealth",
                "unlock_criteria": {"portfolio_value": 25000},
                "xp_reward": 150,
                "cash_reward": Decimal("1000.00"),
                "rarity": "common"
            },
            {
                "name": "Six Figures",
                "description": "Reach $100,000 portfolio value",
                "category": "wealth",
                "unlock_criteria": {"portfolio_value": 100000},
                "xp_reward": 500,
                "cash_reward": Decimal("5000.00"),
                "rarity": "rare"
            },
            {
                "name": "Millionaire",
                "description": "Reach $1,000,000 portfolio value",
                "category": "wealth",
                "unlock_criteria": {"portfolio_value": 1000000},
                "xp_reward": 1000,
                "cash_reward": Decimal("25000.00"),
                "rarity": "epic"
            },
            {
                "name": "Billionaire Club",
                "description": "Reach $1,000,000,000 portfolio value",
                "category": "wealth",
                "unlock_criteria": {"portfolio_value": 1000000000},
                "xp_reward": 5000,
                "cash_reward": Decimal("100000000.00"),
                "rarity": "legendary"
            },
            
            # Portfolio achievements
            {
                "name": "Diversified",
                "description": "Hold positions in 5 different assets simultaneously",
                "category": "portfolio",
                "unlock_criteria": {"unique_positions": 5},
                "xp_reward": 200,
                "cash_reward": Decimal("500.00"),
                "rarity": "common"
            },
            {
                "name": "Asset Collector",
                "description": "Hold positions in 20 different assets simultaneously",
                "category": "portfolio",
                "unlock_criteria": {"unique_positions": 20},
                "xp_reward": 500,
                "cash_reward": Decimal("2000.00"),
                "rarity": "rare"
            },
            
            # Risk management achievements
            {
                "name": "Profit Taker",
                "description": "Make a single trade with 50% profit",
                "category": "risk_management",
                "unlock_criteria": {"single_trade_profit_pct": 50},
                "xp_reward": 300,
                "cash_reward": Decimal("1000.00"),
                "rarity": "rare"
            },
            {
                "name": "Diamond Hands",
                "description": "Hold a position for 30 days",
                "category": "risk_management",
                "unlock_criteria": {"position_hold_days": 30},
                "xp_reward": 250,
                "cash_reward": Decimal("750.00"),
                "rarity": "rare"
            },
            {
                "name": "Consistent Winner",
                "description": "Achieve 80% win rate over 50 trades",
                "category": "risk_management",
                "unlock_criteria": {"win_rate": 80, "min_trades": 50},
                "xp_reward": 750,
                "cash_reward": Decimal("5000.00"),
                "rarity": "epic"
            },
            
            # Algorithm achievements
            {
                "name": "Programmer",
                "description": "Create your first trading algorithm",
                "category": "algorithm",
                "unlock_criteria": {"algorithms_created": 1},
                "xp_reward": 300,
                "cash_reward": Decimal("1000.00"),
                "rarity": "common"
            },
            {
                "name": "Algo Trader",
                "description": "Execute 100 trades using algorithms",
                "category": "algorithm",
                "unlock_criteria": {"algo_trades": 100},
                "xp_reward": 500,
                "cash_reward": Decimal("2500.00"),
                "rarity": "rare"
            },
            
            # Market timing achievements
            {
                "name": "Market Timer",
                "description": "Buy an asset within 24 hours before a 10% price increase",
                "category": "market_timing",
                "unlock_criteria": {"timing_success": True},
                "xp_reward": 400,
                "cash_reward": Decimal("2000.00"),
                "rarity": "rare"
            },
            {
                "name": "Crash Survivor",
                "description": "Maintain positive returns during a market crash event",
                "category": "market_timing",
                "unlock_criteria": {"crash_survival": True},
                "xp_reward": 750,
                "cash_reward": Decimal("5000.00"),
                "rarity": "epic"
            },
            
            # Endurance achievements
            {
                "name": "Dedicated Trader",
                "description": "Play for 7 consecutive days",
                "category": "endurance",
                "unlock_criteria": {"consecutive_days": 7},
                "xp_reward": 200,
                "cash_reward": Decimal("500.00"),
                "rarity": "common"
            },
            {
                "name": "Marathon Trader",
                "description": "Play for 30 consecutive days",
                "category": "endurance",
                "unlock_criteria": {"consecutive_days": 30},
                "xp_reward": 1000,
                "cash_reward": Decimal("10000.00"),
                "rarity": "epic"
            },
            
            # Special achievements
            {
                "name": "Lucky Break",
                "description": "Win a trade by pure luck (random event bonus)",
                "category": "special",
                "unlock_criteria": {"lucky_trade": True},
                "xp_reward": 100,
                "cash_reward": Decimal("777.00"),
                "rarity": "rare",
                "is_hidden": True
            },
            {
                "name": "Perfectionist",
                "description": "Complete your first 10 trades with 100% win rate",
                "category": "special",
                "unlock_criteria": {"perfect_start": True},
                "xp_reward": 1000,
                "cash_reward": Decimal("5000.00"),
                "rarity": "epic",
                "is_hidden": True
            }
        ]
        
        for achievement_data in achievements_data:
            # Check if achievement already exists
            existing = self.db.query(Achievement).filter(
                Achievement.name == achievement_data["name"]
            ).first()
            
            if not existing:
                achievement = Achievement(
                    name=achievement_data["name"],
                    description=achievement_data["description"],
                    category=achievement_data["category"],
                    unlock_criteria=achievement_data["unlock_criteria"],
                    xp_reward=achievement_data["xp_reward"],
                    cash_reward=achievement_data["cash_reward"],
                    rarity=achievement_data["rarity"],
                    is_hidden=achievement_data.get("is_hidden", False)
                )
                self.db.add(achievement)
                achievements_created += 1
        
        self.db.commit()
        return achievements_created
    
    def create_sample_price_history(self, days: int = 30) -> int:
        """
        Create sample price history for all assets.
        Useful for testing and demonstration.
        """
        assets = self.db.query(Asset).all()
        price_points_created = 0
        
        for asset in assets:
            current_price = asset.current_price
            base_volatility = asset.volatility
            
            # Generate price history going backwards
            for day in range(days, 0, -1):
                timestamp = datetime.utcnow() - timedelta(days=day)
                
                # Generate realistic OHLCV data
                daily_change = random.gauss(0, float(base_volatility))
                price_mult = Decimal(str(1 + daily_change))
                
                open_price = current_price * price_mult
                close_change = random.gauss(0, float(base_volatility) * 0.5)
                close_price = open_price * Decimal(str(1 + close_change))
                
                high_change = abs(random.gauss(0, float(base_volatility) * 0.3))
                low_change = abs(random.gauss(0, float(base_volatility) * 0.3))
                
                high_price = max(open_price, close_price) * Decimal(str(1 + high_change))
                low_price = min(open_price, close_price) * Decimal(str(1 - low_change))
                
                volume = Decimal(str(random.randint(1000000, 10000000)))
                
                price_data = {
                    "timestamp": timestamp,
                    "open_price": open_price,
                    "high_price": high_price,
                    "low_price": low_price,
                    "close_price": close_price,
                    "volume": volume
                }
                
                self.db_service.add_price_data(asset.id, price_data)
                price_points_created += 1
                
                # Update current_price for next iteration
                current_price = close_price
            
            # Update asset's current price to the most recent close
            asset.current_price = current_price
            self.db.commit()
        
        return price_points_created