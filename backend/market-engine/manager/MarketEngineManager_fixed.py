"""
Market Engine Manager

This module contains the robust manager for the market calculations leveraging SQLAlchemy and SQLite.
All predictive models call functions to set the values of the market.
This includes the market simulations, AI traders, and other functionalities.

Features:
- Singleton pattern for unified market state management
- SQLAlchemy integration for persistent market data
- Real-time price calculations and updates
- Market event scheduling and processing
- Portfolio valuation and rebalancing
- Performance monitoring and analytics
"""

import asyncio
import logging
import threading
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Any, Tuple
from contextlib import contextmanager

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func, text
from sqlalchemy.exc import SQLAlchemyError

from core.database import get_db, DatabaseManager
from core.models import (
    Asset, PriceHistory, MarketEvent, GameState, Player, Portfolio, Order,
    AssetType, WealthTier, EventType, OrderStatus, OrderType
)
from core.schemas import (
    MarketData, PriceHistoryBase, AssetUpdate, MarketEventCreate,
    PortfolioSummary, PlayerStats
)
from core.config import settings
from services.database_service import DatabaseService

# Import the market engine service if it exists
try:
    from .market_engine_service import MarketEngineService
except ImportError:
    MarketEngineService = None

logger = logging.getLogger(__name__)


class MarketEngineManager:
    """
    Market Engine Manager
    
    This class manages the market calculations and state using SQLAlchemy and SQLite.
    It is a singleton class, meaning there should only ever be one instance per game instance.
    
    Key responsibilities:
    - Market state management and persistence
    - Price calculation and history tracking
    - Event scheduling and processing
    - Portfolio valuation and updates
    - Market analytics and reporting
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                if not cls._instance:
                    cls._instance = super(MarketEngineManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def _init(self):
        """Initialize the Market Engine Manager with database connections and services."""
        if self._initialized:
            return
            
        logger.info("Initializing Market Engine Manager")
        
        # Database manager for direct database operations
        self.db_manager = DatabaseManager()
        
        # Market engine service for price simulation
        self.market_service = MarketEngineService() if MarketEngineService else None
        
        # Market state tracking
        self.is_running = False
        self.current_market_phase = "normal"
        self.volatility_multiplier = Decimal('1.0')
        self.economic_cycle = "expansion"
        
        # Performance tracking
        self.total_calculations = 0
        self.last_update = datetime.utcnow()
        self.update_frequency = settings.MARKET_UPDATE_INTERVAL_SECONDS
        
        # Cache for frequently accessed data
        self._asset_cache = {}
        self._portfolio_cache = {}
        self._price_cache = {}
        
        # Threading for asynchronous operations
        self.async_loop = None
        self.market_thread = None
        
        self._initialized = True
        logger.info("Market Engine Manager initialized successfully")

    @contextmanager
    def get_db_session(self):
        """Context manager for database sessions with automatic cleanup."""
        session = self.db_manager.get_session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            session.close()

    def start_market_engine(self) -> bool:
        """Start the market engine and all related services."""
        try:
            if self.is_running:
                logger.warning("Market engine already running")
                return True
                
            logger.info("Starting Market Engine Manager")
            
            # Initialize database tables if needed
            self._ensure_database_setup()
            
            # Start market simulation if service is available
            if self.market_service:
                self.market_thread = threading.Thread(
                    target=self._run_market_simulation,
                    daemon=True
                )
                self.market_thread.start()
                
            self.is_running = True
            logger.info("Market Engine Manager started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Market Engine Manager: {e}")
            return False

    def stop_market_engine(self) -> bool:
        """Stop the market engine and cleanup resources."""
        try:
            if not self.is_running:
                logger.warning("Market engine not running")
                return True
                
            logger.info("Stopping Market Engine Manager")
            self.is_running = False
            
            # Stop market simulation
            if self.market_service and self.async_loop:
                asyncio.run_coroutine_threadsafe(
                    self.market_service.stop_market_simulation(),
                    self.async_loop
                )
                
            # Wait for market thread to finish
            if self.market_thread and self.market_thread.is_alive():
                self.market_thread.join(timeout=5.0)
                
            logger.info("Market Engine Manager stopped successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop Market Engine Manager: {e}")
            return False

    def _run_market_simulation(self):
        """Run the market simulation in a separate thread."""
        try:
            self.async_loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.async_loop)
            
            if self.market_service:
                self.async_loop.run_until_complete(
                    self.market_service.start_market_simulation()
                )
        except Exception as e:
            logger.error(f"Market simulation error: {e}")
        finally:
            if self.async_loop:
                self.async_loop.close()

    def _ensure_database_setup(self):
        """Ensure database tables exist and are properly configured."""
        try:
            from core.database import create_tables
            create_tables()
            logger.info("Database tables verified/created")
        except Exception as e:
            logger.error(f"Database setup error: {e}")
            raise

    def get_market_status(self) -> Dict[str, Any]:
        """Get comprehensive market status information."""
        with self.get_db_session() as db:
            db_service = DatabaseService(db)
            
            # Get asset count by type
            asset_counts = db.query(
                Asset.asset_type,
                func.count(Asset.id).label('count')
            ).filter(Asset.is_active == True).group_by(Asset.asset_type).all()
            
            # Get active events
            active_events = db_service.get_active_market_events()
            
            # Get total portfolio values
            total_portfolio_value = db.query(
                func.sum(Player.current_portfolio_value)
            ).scalar() or Decimal('0')
            
            # Get price update statistics
            latest_prices = db.query(
                func.count(PriceHistory.id),
                func.max(PriceHistory.timestamp)
            ).first()
            
            price_count = latest_prices[0] if latest_prices else 0
            latest_timestamp = latest_prices[1] if latest_prices else None
            
            return {
                "is_running": self.is_running,
                "market_phase": self.current_market_phase,
                "volatility_multiplier": float(self.volatility_multiplier),
                "economic_cycle": self.economic_cycle,
                "asset_counts": {str(row.asset_type): row.count for row in asset_counts},
                "active_events_count": len(active_events),
                "total_market_cap": float(total_portfolio_value),
                "total_calculations": self.total_calculations,
                "last_update": self.last_update.isoformat(),
                "price_history_count": price_count or 0,
                "latest_price_update": latest_timestamp.isoformat() if latest_timestamp else None
            }

    def update_asset_price(self, asset_id: int, new_price: Decimal, 
                          volume: Optional[Decimal] = None) -> bool:
        """Update asset price and create price history record."""
        try:
            with self.get_db_session() as db:
                db_service = DatabaseService(db)
                
                # Get asset
                asset = db_service.get_asset(asset_id)
                if not asset:
                    logger.error(f"Asset {asset_id} not found")
                    return False
                
                # Validate price
                if new_price <= 0:
                    logger.error(f"Invalid price for asset {asset_id}: {new_price}")
                    return False
                
                # Get old price value
                old_price_value = asset.current_price
                price_change = (new_price - old_price_value) / old_price_value
                
                # Update asset price using query update
                db.query(Asset).filter(Asset.id == asset_id).update({
                    'current_price': new_price,
                    'updated_at': datetime.utcnow()
                })
                
                # Create price history record
                price_history = PriceHistory(
                    asset_id=asset_id,
                    timestamp=datetime.utcnow(),
                    open_price=old_price_value,
                    high_price=max(old_price_value, new_price),
                    low_price=min(old_price_value, new_price),
                    close_price=new_price,
                    volume=volume or Decimal('0')
                )
                
                db.add(price_history)
                db.commit()
                
                # Update cache
                self._price_cache[asset_id] = {
                    'price': new_price,
                    'timestamp': datetime.utcnow(),
                    'change': price_change
                }
                
                # Update affected portfolios
                self._update_portfolios_for_asset(asset_id, new_price, db)
                
                self.total_calculations += 1
                logger.debug(f"Updated price for {asset.symbol}: {old_price_value} -> {new_price}")
                return True
                
        except Exception as e:
            logger.error(f"Failed to update asset price: {e}")
            return False

    def _update_portfolios_for_asset(self, asset_id: int, new_price: Decimal, db: Session):
        """Update portfolio values for all players holding this asset."""
        try:
            # Get all portfolios holding this asset
            portfolios = db.query(Portfolio).filter(
                Portfolio.asset_id == asset_id,
                Portfolio.quantity > 0
            ).all()
            
            for portfolio in portfolios:
                # Calculate new values
                new_value = portfolio.quantity * new_price
                new_pnl = new_value - portfolio.total_invested
                
                # Update portfolio values
                db.query(Portfolio).filter(Portfolio.id == portfolio.id).update({
                    'current_value': new_value,
                    'unrealized_pnl': new_pnl,
                    'last_updated': datetime.utcnow()
                })
                
                # Update player's total portfolio value
                player_portfolios = db.query(Portfolio).filter(
                    Portfolio.player_id == portfolio.player_id
                ).all()
                
                total_value = sum(p.current_value or Decimal('0') for p in player_portfolios)
                
                # Update player total value
                db.query(Player).filter(Player.id == portfolio.player_id).update({
                    'current_portfolio_value': total_value
                })
                
        except Exception as e:
            logger.error(f"Failed to update portfolios for asset {asset_id}: {e}")

    def create_market_event(self, event_data: MarketEventCreate) -> Optional[MarketEvent]:
        """Create a new market event."""
        try:
            with self.get_db_session() as db:
                db_service = DatabaseService(db)
                
                event = db_service.create_market_event(event_data.model_dump())
                
                logger.info(f"Created market event: {event.title}")
                return event
                
        except Exception as e:
            logger.error(f"Failed to create market event: {e}")
            return None

    def get_asset_price_history(self, asset_id: int, 
                               days: int = 30) -> List[PriceHistory]:
        """Get price history for an asset."""
        try:
            with self.get_db_session() as db:
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                
                history = db.query(PriceHistory).filter(
                    PriceHistory.asset_id == asset_id,
                    PriceHistory.timestamp >= cutoff_date
                ).order_by(desc(PriceHistory.timestamp)).all()
                
                return history
                
        except Exception as e:
            logger.error(f"Failed to get price history for asset {asset_id}: {e}")
            return []

    def calculate_portfolio_summary(self, player_id: int) -> Optional[PortfolioSummary]:
        """Calculate comprehensive portfolio summary for a player."""
        try:
            with self.get_db_session() as db:
                db_service = DatabaseService(db)
                return db_service.calculate_portfolio_summary(player_id)
                
        except Exception as e:
            logger.error(f"Failed to calculate portfolio summary for player {player_id}: {e}")
            return None

    def execute_pending_orders(self) -> int:
        """Execute all pending orders that can be filled."""
        executed_count = 0
        
        try:
            with self.get_db_session() as db:
                db_service = DatabaseService(db)
                
                # Get all pending orders
                pending_orders = db_service.get_pending_orders()
                
                for order in pending_orders:
                    try:
                        if self._should_execute_order(order, db_service):
                            executed_order = db_service.execute_order(
                                order.id, 
                                order.asset.current_price
                            )
                            if executed_order:
                                executed_count += 1
                                logger.debug(f"Executed order {order.id}")
                                
                    except Exception as e:
                        logger.error(f"Failed to execute order {order.id}: {e}")
                        continue
                        
                if executed_count > 0:
                    logger.info(f"Executed {executed_count} pending orders")
                    
        except Exception as e:
            logger.error(f"Failed to execute pending orders: {e}")
            
        return executed_count

    def _should_execute_order(self, order: Order, db_service: DatabaseService) -> bool:
        """Determine if an order should be executed based on current market conditions."""
        try:
            asset = db_service.get_asset(order.asset_id)
            if not asset:
                return False
                
            current_price = asset.current_price
            
            # Convert SQLAlchemy column values to Python values for comparison
            order_type = str(order.order_type)
            order_side = str(order.side).lower()
            order_price = order.price
            order_stop_price = order.stop_price
            
            # Market orders execute immediately
            if order_type == OrderType.MARKET.value:
                return True
                
            # Limit orders
            if order_type == OrderType.LIMIT.value:
                if order_side == "buy" and current_price <= order_price:
                    return True
                elif order_side == "sell" and current_price >= order_price:
                    return True
                    
            # Stop orders
            if order_type == OrderType.STOP.value:
                if order_side == "buy" and current_price >= order_stop_price:
                    return True
                elif order_side == "sell" and current_price <= order_stop_price:
                    return True
                    
            # Stop-limit orders
            if order_type == OrderType.STOP_LIMIT.value:
                if order_side == "buy" and current_price >= order_stop_price:
                    return current_price <= order_price
                elif order_side == "sell" and current_price <= order_stop_price:
                    return current_price >= order_price
                    
            return False
            
        except Exception as e:
            logger.error(f"Error checking order execution conditions: {e}")
            return False

    def get_analytics_data(self) -> Dict[str, Any]:
        """Get market analytics and performance data."""
        try:
            with self.get_db_session() as db:
                # Total market statistics
                total_assets = db.query(func.count(Asset.id)).scalar() or 0
                active_assets = db.query(func.count(Asset.id)).filter(Asset.is_active == True).scalar() or 0
                total_players = db.query(func.count(Player.id)).scalar() or 0
                
                # Portfolio statistics with null checks
                portfolio_stats = db.query(
                    func.sum(Player.current_portfolio_value).label('total_value'),
                    func.avg(Player.current_portfolio_value).label('avg_value'),
                    func.max(Player.current_portfolio_value).label('max_value'),
                    func.min(Player.current_portfolio_value).label('min_value')
                ).first()
                
                # Trading statistics with null checks
                trading_stats = db.query(
                    func.count(Order.id).label('total_orders'),
                    func.count(Order.id).filter(Order.status == OrderStatus.FILLED.value).label('filled_orders'),
                    func.count(Order.id).filter(Order.status == OrderStatus.PENDING.value).label('pending_orders')
                ).first()
                
                # Safe access to query results
                total_value = portfolio_stats.total_value if portfolio_stats else 0
                avg_value = portfolio_stats.avg_value if portfolio_stats else 0
                max_value = portfolio_stats.max_value if portfolio_stats else 0
                min_value = portfolio_stats.min_value if portfolio_stats else 0
                
                total_orders = trading_stats.total_orders if trading_stats else 0
                filled_orders = trading_stats.filled_orders if trading_stats else 0
                pending_orders = trading_stats.pending_orders if trading_stats else 0
                
                fill_rate = round(filled_orders / max(total_orders, 1) * 100, 2)
                
                return {
                    "market_overview": {
                        "total_assets": total_assets,
                        "active_assets": active_assets,
                        "total_players": total_players,
                        "market_phase": self.current_market_phase,
                        "volatility_multiplier": float(self.volatility_multiplier)
                    },
                    "portfolio_statistics": {
                        "total_market_value": float(total_value or 0),
                        "average_portfolio_value": float(avg_value or 0),
                        "largest_portfolio": float(max_value or 0),
                        "smallest_portfolio": float(min_value or 0)
                    },
                    "trading_statistics": {
                        "total_orders": total_orders,
                        "filled_orders": filled_orders,
                        "pending_orders": pending_orders,
                        "fill_rate": fill_rate
                    },
                    "performance": {
                        "total_calculations": self.total_calculations,
                        "last_update": self.last_update.isoformat(),
                        "uptime_seconds": (datetime.utcnow() - self.last_update).total_seconds()
                    }
                }
                
        except Exception as e:
            logger.error(f"Failed to get analytics data: {e}")
            return {}

    def health_check(self) -> Dict[str, Any]:
        """Perform health check on the market engine."""
        health_status = {
            "status": "healthy",
            "issues": [],
            "database_connection": False,
            "market_service_running": False,
            "initialization_complete": self._initialized
        }
        
        try:
            # Check database connection
            if self.db_manager.health_check():
                health_status["database_connection"] = True
            else:
                health_status["status"] = "unhealthy"
                health_status["issues"].append("Database connection failed")
                
            # Check market service
            if self.market_service and self.is_running:
                health_status["market_service_running"] = True
            elif not self.market_service:
                health_status["issues"].append("Market service not available")
            elif not self.is_running:
                health_status["issues"].append("Market service not running")
                
            # Check for stale data
            time_since_update = datetime.utcnow() - self.last_update
            if time_since_update.total_seconds() > 300:  # 5 minutes
                health_status["status"] = "degraded"
                health_status["issues"].append("Stale market data")
                
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["issues"].append(f"Health check error: {e}")
            
        return health_status

    def cleanup_old_data(self, days_to_keep: int = 30) -> Dict[str, int]:
        """Clean up old market data to optimize database performance."""
        cleanup_results = {
            "price_history_deleted": 0,
            "market_events_deleted": 0,
            "orders_archived": 0
        }
        
        try:
            with self.get_db_session() as db:
                cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
                
                # Clean up old price history
                old_prices = db.query(PriceHistory).filter(
                    PriceHistory.timestamp < cutoff_date
                ).delete()
                cleanup_results["price_history_deleted"] = old_prices
                
                # Clean up processed market events
                old_events = db.query(MarketEvent).filter(
                    MarketEvent.scheduled_time < cutoff_date,
                    MarketEvent.is_processed == True
                ).delete()
                cleanup_results["market_events_deleted"] = old_events
                
                # Archive old filled orders (keep for longer period)
                archive_cutoff = datetime.utcnow() - timedelta(days=days_to_keep * 3)
                old_orders = db.query(Order).filter(
                    Order.created_at < archive_cutoff,
                    Order.status.in_([OrderStatus.FILLED.value, OrderStatus.CANCELLED.value])
                ).count()
                cleanup_results["orders_archived"] = old_orders
                
                db.commit()
                logger.info(f"Cleanup completed: {cleanup_results}")
                
        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")
            
        return cleanup_results

    def reset_market_state(self) -> bool:
        """Reset market state to initial conditions (use with caution)."""
        try:
            logger.warning("Resetting market state - this will affect all players")
            
            # Stop market engine if running
            was_running = self.is_running
            if was_running:
                self.stop_market_engine()
                
            # Reset market conditions
            self.current_market_phase = "normal"
            self.volatility_multiplier = Decimal('1.0')
            self.economic_cycle = "expansion"
            self.total_calculations = 0
            self.last_update = datetime.utcnow()
            
            # Clear caches
            self._asset_cache.clear()
            self._portfolio_cache.clear()
            self._price_cache.clear()
            
            # Restart if it was running
            if was_running:
                self.start_market_engine()
                
            logger.info("Market state reset completed")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset market state: {e}")
            return False


# Global singleton instance
market_engine_manager = MarketEngineManager()
