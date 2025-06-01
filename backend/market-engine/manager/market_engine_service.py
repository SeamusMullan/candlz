"""
Market Engine Service

This module provides the core market simulation engine service that integrates with 
SQLAlchemy and SQLite database patterns used throughout the candlz backend.

Features:
- Real-time price updates with volatility modeling
- Market event processing and simulation
- Economic cycle management (bull/bear markets)
- Player-driven market dynamics
- Technical indicator calculation
- Market depth and liquidity simulation
"""

import asyncio
import random
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func

from core.database import get_db, DatabaseManager
from core.models import (
    Asset, PriceHistory, MarketEvent, GameState, Player, Portfolio,
    AssetType, WealthTier, EventType
)
from core.schemas import MarketData, PriceHistoryBase
from core.config import settings
from services.database_service import DatabaseService

logger = logging.getLogger(__name__)


class MarketEngineService:
    """
    Robust market engine service leveraging SQLAlchemy patterns.
    Handles price generation, market events, and economic cycles.
    """
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.is_running = False
        self.current_market_phase = "normal"  # normal, bull, bear, crash, recovery
        self.volatility_multiplier = Decimal('1.0')
        self.economic_cycle = "expansion"  # expansion, peak, contraction, trough
        self.active_events: List[MarketEvent] = []
        
        # Market simulation parameters
        self.base_volatilities = settings.DEFAULT_ASSET_VOLATILITIES
        self.correlation_matrix = self._build_correlation_matrix()
        
        logger.info("Market Engine Service initialized")
    
    def _build_correlation_matrix(self) -> Dict[str, Dict[str, Decimal]]:
        """Build asset correlation matrix for realistic price movements."""
        correlations = {
            "stock": {
                "stock": Decimal('0.7'),
                "crypto": Decimal('0.3'),
                "forex": Decimal('0.1'),
                "commodity": Decimal('0.2'),
                "index": Decimal('0.8'),
                "bond": Decimal('-0.3'),
                "derivative": Decimal('0.5')
            },
            "crypto": {
                "stock": Decimal('0.3'),
                "crypto": Decimal('0.8'),
                "forex": Decimal('0.2'),
                "commodity": Decimal('0.1'),
                "index": Decimal('0.2'),
                "bond": Decimal('-0.1'),
                "derivative": Decimal('0.4')
            },
            "forex": {
                "stock": Decimal('0.1'),
                "crypto": Decimal('0.2'),
                "forex": Decimal('0.6'),
                "commodity": Decimal('0.3'),
                "index": Decimal('0.1'),
                "bond": Decimal('0.4'),
                "derivative": Decimal('0.3')
            }
        }
        
        # Fill symmetric correlations for other asset types
        for asset_type in ["commodity", "index", "bond", "derivative"]:
            if asset_type not in correlations:
                correlations[asset_type] = {}
            for other_type in correlations.keys():
                if other_type not in correlations[asset_type]:
                    correlations[asset_type][other_type] = correlations.get(other_type, {}).get(asset_type, Decimal('0.1'))
        
        return correlations
    
    async def start_market_simulation(self) -> None:
        """Start the market simulation engine."""
        if self.is_running:
            logger.warning("Market simulation already running")
            return
        
        self.is_running = True
        logger.info("Starting market simulation engine")
        
        try:
            while self.is_running:
                await self._simulation_tick()
                await asyncio.sleep(settings.MARKET_UPDATE_INTERVAL_SECONDS)
        except Exception as e:
            logger.error(f"Market simulation error: {e}")
            raise
        finally:
            self.is_running = False
    
    async def stop_market_simulation(self) -> None:
        """Stop the market simulation engine."""
        self.is_running = False
        logger.info("Market simulation engine stopped")
    
    async def _simulation_tick(self) -> None:
        """Execute one simulation tick - update prices, process events, etc."""
        try:
            with self.db_manager.get_session() as db:
                db_service = DatabaseService(db)
                
                # Update market phase and economic cycle
                await self._update_market_conditions(db_service)
                
                # Process active market events
                await self._process_market_events(db_service)
                
                # Generate new random events
                await self._generate_random_events(db_service)
                
                # Update asset prices
                await self._update_asset_prices(db_service)
                
                # Update player portfolio values
                await self._update_portfolio_values(db_service)
                
                # Check for market manipulation
                await self._detect_market_manipulation(db_service)
                
        except Exception as e:
            logger.error(f"Simulation tick error: {e}")
    
    async def _update_market_conditions(self, db_service: DatabaseService) -> None:
        """Update overall market phase and economic cycle."""
        # Simple state machine for market phases
        phase_transitions = {
            "normal": ["bull", "bear", "normal"],
            "bull": ["normal", "crash", "bull"],
            "bear": ["normal", "recovery", "bear"],
            "crash": ["recovery", "bear"],
            "recovery": ["normal", "bull"]
        }
        
        # Random chance to change phase (influenced by events)
        change_probability = 0.01 * float(self.volatility_multiplier)
        if random.random() < change_probability:
            possible_phases = phase_transitions.get(self.current_market_phase, ["normal"])
            self.current_market_phase = random.choice(possible_phases)
            logger.info(f"Market phase changed to: {self.current_market_phase}")
        
        # Update volatility based on market phase
        phase_volatility = {
            "normal": Decimal('1.0'),
            "bull": Decimal('1.2'),
            "bear": Decimal('1.5'),
            "crash": Decimal('3.0'),
            "recovery": Decimal('2.0')
        }
        self.volatility_multiplier = phase_volatility.get(self.current_market_phase, Decimal('1.0'))
    
    async def _process_market_events(self, db_service: DatabaseService) -> None:
        """Process active market events and their impacts."""
        current_time = datetime.utcnow()
        
        # Get active events
        self.active_events = db_service.get_active_market_events()
        
        for event in self.active_events:
            if not event.is_processed:
                await self._apply_event_impact(event, db_service)
                event.is_processed = True
                
            # Remove expired events
            event_end_time = event.scheduled_time + timedelta(hours=event.duration_hours)
            if current_time > event_end_time:
                self.active_events.remove(event)
    
    async def _apply_event_impact(self, event: MarketEvent, db_service: DatabaseService) -> None:
        """Apply the impact of a market event to affected assets."""
        if not event.affected_assets:
            return
        
        for asset_symbol in event.affected_assets:
            asset = db_service.get_asset_by_symbol(asset_symbol)
            if asset:
                # Apply price impact
                if event.price_impact:
                    price_change = asset.current_price * event.price_impact
                    new_price = asset.current_price + price_change
                    asset.current_price = max(new_price, Decimal('0.01'))  # Prevent negative prices
                
                # Update volatility
                asset.volatility *= event.volatility_multiplier
                
                logger.info(f"Applied event '{event.title}' impact to {asset_symbol}")
    
    async def _generate_random_events(self, db_service: DatabaseService) -> None:
        """Generate random market events based on probability settings."""
        if random.random() < float(settings.EVENT_PROBABILITY_PER_DAY):
            if len(self.active_events) < settings.MAX_CONCURRENT_EVENTS:
                event = await self._create_random_event(db_service)
                if event:
                    self.active_events.append(event)
    
    async def _create_random_event(self, db_service: DatabaseService) -> Optional[MarketEvent]:
        """Create a random market event."""
        event_types = [
            ("earnings_report", "Earnings Surprise", 0.3),
            ("economic_data", "Economic Data Release", 0.2),
            ("geopolitical", "Geopolitical Tension", 0.15),
            ("technology", "Tech Breakthrough", 0.1),
            ("regulatory", "Regulatory Change", 0.1),
            ("natural_disaster", "Natural Disaster", 0.05),
            ("market_crash", "Market Flash Crash", 0.02),
            ("black_swan", "Black Swan Event", 0.01)
        ]
        
        # Select random event type based on weights
        total_weight = sum(weight for _, _, weight in event_types)
        r = random.random() * total_weight
        cumulative = 0
        
        for event_type, title_base, weight in event_types:
            cumulative += weight
            if r <= cumulative:
                # Create the event
                assets = self._get_random_assets_for_event(event_type, db_service)
                
                event_data = {
                    "event_type": event_type,
                    "title": f"{title_base} - {random.choice(['Major', 'Significant', 'Unexpected'])}",
                    "description": f"A {event_type.replace('_', ' ')} event affecting market conditions",
                    "scheduled_time": datetime.utcnow(),
                    "duration_hours": random.randint(1, 24),
                    "volatility_multiplier": Decimal(str(random.uniform(0.8, 2.5))),
                    "affected_assets": [asset.symbol for asset in assets],
                    "price_impact": Decimal(str(random.uniform(-0.1, 0.1))),  # -10% to +10%
                    "is_processed": False
                }
                
                return db_service.create_market_event(event_data)
        
        return None
    
    def _get_random_assets_for_event(self, event_type: str, db_service: DatabaseService) -> List[Asset]:
        """Get random assets affected by an event type."""
        # Get assets based on event type preferences
        if event_type in ["earnings_report", "technology"]:
            assets = db_service.get_assets_by_type("stock")
        elif event_type in ["regulatory", "black_swan"]:
            assets = db_service.get_assets_by_type("crypto")
        elif event_type == "economic_data":
            # Mix of stocks and forex
            stocks = db_service.get_assets_by_type("stock")[:3]
            forex = db_service.get_assets_by_type("forex")[:2]
            assets = stocks + forex
        else:
            # General market event - affect multiple asset types
            all_assets = []
            for asset_type in ["stock", "crypto", "forex"]:
                all_assets.extend(db_service.get_assets_by_type(asset_type)[:2])
            assets = all_assets
        
        # Return random subset
        num_assets = min(random.randint(1, 5), len(assets))
        return random.sample(assets, num_assets)
    
    async def _update_asset_prices(self, db_service: DatabaseService) -> None:
        """Update prices for all active assets."""
        # Get all active assets
        all_assets = []
        for asset_type in AssetType:
            all_assets.extend(db_service.get_assets_by_type(asset_type.value))
        
        # Calculate correlated price movements
        asset_returns = self._calculate_correlated_returns(all_assets)
        
        # Apply price updates and create price history
        for asset in all_assets:
            if asset.symbol in asset_returns:
                return_pct = asset_returns[asset.symbol]
                old_price = asset.current_price
                new_price = old_price * (1 + return_pct)
                
                # Ensure price doesn't go negative or too extreme
                new_price = max(new_price, old_price * Decimal('0.1'))  # Max 90% drop
                new_price = min(new_price, old_price * Decimal('10.0'))  # Max 900% gain
                
                # Update asset price
                asset.current_price = new_price
                asset.updated_at = datetime.utcnow()
                
                # Create price history entry
                await self._create_price_history_entry(asset, old_price, new_price, db_service)
    
    def _calculate_correlated_returns(self, assets: List[Asset]) -> Dict[str, Decimal]:
        """Calculate correlated returns for assets based on market conditions."""
        returns = {}
        base_market_return = Decimal(str(random.gauss(0, 0.02)))  # 2% daily volatility
        
        # Apply market phase bias
        phase_bias = {
            "normal": Decimal('0.0001'),    # Slight positive bias
            "bull": Decimal('0.005'),       # 0.5% positive bias
            "bear": Decimal('-0.005'),      # 0.5% negative bias
            "crash": Decimal('-0.02'),      # 2% negative bias
            "recovery": Decimal('0.01')     # 1% positive bias
        }
        
        market_bias = phase_bias.get(self.current_market_phase, Decimal('0'))
        
        for asset in assets:
            # Base return from market
            asset_return = base_market_return + market_bias
            
            # Add asset-specific volatility
            asset_volatility = asset.volatility * self.volatility_multiplier
            specific_return = Decimal(str(random.gauss(0, float(asset_volatility))))
            
            # Apply correlation to market
            correlation = self.correlation_matrix.get(asset.asset_type, {}).get("stock", Decimal('0.3'))
            final_return = asset_return * correlation + specific_return * (1 - correlation)
            
            returns[asset.symbol] = final_return
        
        return returns
    
    async def _create_price_history_entry(
        self, 
        asset: Asset, 
        old_price: Decimal, 
        new_price: Decimal,
        db_service: DatabaseService
    ) -> None:
        """Create a price history entry with technical indicators."""
        # Get recent price history for indicator calculation
        recent_history = db_service.get_price_history(asset.id, limit=50)
        
        # Calculate OHLCV data (simplified for simulation)
        # In a real implementation, this would be based on actual tick data
        price_change = abs(new_price - old_price)
        high_price = max(old_price, new_price) + (price_change * Decimal('0.1'))
        low_price = min(old_price, new_price) - (price_change * Decimal('0.1'))
        volume = Decimal(str(random.uniform(1000, 100000)))  # Simulated volume
        
        # Calculate technical indicators
        indicators = self._calculate_technical_indicators(recent_history, new_price)
        
        price_data = {
            "timestamp": datetime.utcnow(),
            "open_price": old_price,
            "high_price": high_price,
            "low_price": low_price,
            "close_price": new_price,
            "volume": volume,
            **indicators
        }
        
        db_service.add_price_data(asset.id, price_data)
    
    def _calculate_technical_indicators(
        self, 
        recent_history: List[PriceHistory], 
        current_price: Decimal
    ) -> Dict[str, Optional[Decimal]]:
        """Calculate technical indicators for price history."""
        if not recent_history:
            return {
                "sma_20": None,
                "sma_50": None,
                "ema_12": None,
                "ema_26": None,
                "rsi": None
            }
        
        # Extract closing prices
        prices = [entry.close_price for entry in reversed(recent_history)] + [current_price]
        
        indicators = {}
        
        # Simple Moving Averages
        if len(prices) >= 20:
            indicators["sma_20"] = sum(prices[-20:]) / 20
        else:
            indicators["sma_20"] = None
            
        if len(prices) >= 50:
            indicators["sma_50"] = sum(prices[-50:]) / 50
        else:
            indicators["sma_50"] = None
        
        # Exponential Moving Averages (simplified calculation)
        if len(prices) >= 12:
            ema_12 = prices[0]
            alpha = Decimal('2') / Decimal('13')  # 2/(12+1)
            for price in prices[1:]:
                ema_12 = alpha * price + (1 - alpha) * ema_12
            indicators["ema_12"] = ema_12
        else:
            indicators["ema_12"] = None
            
        if len(prices) >= 26:
            ema_26 = prices[0]
            alpha = Decimal('2') / Decimal('27')  # 2/(26+1)
            for price in prices[1:]:
                ema_26 = alpha * price + (1 - alpha) * ema_26
            indicators["ema_26"] = ema_26
        else:
            indicators["ema_26"] = None
        
        # RSI (simplified calculation)
        if len(prices) >= 15:
            gains = []
            losses = []
            for i in range(1, len(prices)):
                change = prices[i] - prices[i-1]
                if change > 0:
                    gains.append(change)
                    losses.append(Decimal('0'))
                else:
                    gains.append(Decimal('0'))
                    losses.append(abs(change))
            
            if len(gains) >= 14:
                avg_gain = sum(gains[-14:]) / 14
                avg_loss = sum(losses[-14:]) / 14
                
                if avg_loss != 0:
                    rs = avg_gain / avg_loss
                    rsi = 100 - (100 / (1 + rs))
                    indicators["rsi"] = Decimal(str(rsi))
                else:
                    indicators["rsi"] = Decimal('100')
            else:
                indicators["rsi"] = None
        else:
            indicators["rsi"] = None
        
        return indicators
    
    async def _update_portfolio_values(self, db_service: DatabaseService) -> None:
        """Update portfolio values for all players."""
        # This could be optimized to only update when needed
        # For now, update all players periodically
        players = db_service.db.query(Player).all()
        
        for player in players:
            try:
                db_service.update_player_portfolio_value(player.id)
                db_service.update_player_wealth_tier(player.id)
            except Exception as e:
                logger.error(f"Error updating portfolio for player {player.id}: {e}")
    
    async def _detect_market_manipulation(self, db_service: DatabaseService) -> None:
        """Detect potential market manipulation patterns."""
        # This is a placeholder for future implementation
        # Could include detection of:
        # - Pump and dump schemes
        # - Wash trading
        # - Coordinated buying/selling
        # - Unusual volume patterns
        pass
    
    def get_market_data(self, db_session: Session) -> MarketData:
        """Get current market data snapshot."""
        db_service = DatabaseService(db_session)
        
        # Get available assets (limit for performance)
        assets = []
        for asset_type in AssetType:
            type_assets = db_service.get_assets_by_type(asset_type.value)[:10]  # Limit per type
            assets.extend(type_assets)
        
        return MarketData(
            assets=assets,
            market_phase=self.current_market_phase,
            market_volatility=self.volatility_multiplier,
            active_events=self.active_events
        )
    
    async def simulate_player_impact(
        self, 
        asset_id: int, 
        order_size: Decimal, 
        order_side: str,
        player_wealth: Decimal,
        db_service: DatabaseService
    ) -> Decimal:
        """
        Simulate the market impact of a large player order.
        Returns the estimated price impact as a percentage.
        """
        asset = db_service.get_asset(asset_id)
        if not asset:
            return Decimal('0')
        
        # Calculate market cap or use volume as proxy for liquidity
        market_cap = asset.market_cap or (asset.current_price * Decimal('1000000'))  # Default estimate
        
        # Calculate order value
        order_value = order_size * asset.current_price
        
        # Impact calculation based on order size relative to market
        impact_factor = order_value / market_cap
        
        # Apply wealth tier multiplier (larger players have more impact)
        wealth_multiplier = min(float(player_wealth) / 1000000, 10.0)  # Cap at 10x
        
        # Calculate final impact
        base_impact = float(impact_factor) * wealth_multiplier * 0.1  # 10% of proportional impact
        
        # Apply direction (negative for sell orders)
        direction = 1 if order_side == "buy" else -1
        final_impact = Decimal(str(base_impact * direction))
        
        # Cap maximum impact
        max_impact = Decimal('0.05')  # 5% maximum impact
        return max(min(final_impact, max_impact), -max_impact)
    
    async def apply_player_order_impact(
        self,
        asset_id: int,
        order_size: Decimal,
        order_side: str,
        player_wealth: Decimal,
        db_service: DatabaseService
    ) -> None:
        """Apply the market impact of a player's order to asset price."""
        impact = await self.simulate_player_impact(
            asset_id, order_size, order_side, player_wealth, db_service
        )
        
        if abs(impact) > Decimal('0.001'):  # Only apply if impact > 0.1%
            asset = db_service.get_asset(asset_id)
            if asset:
                new_price = asset.current_price * (1 + impact)
                asset.current_price = max(new_price, Decimal('0.01'))  # Prevent negative prices
                asset.updated_at = datetime.utcnow()
                
                logger.info(f"Applied order impact to {asset.symbol}: {impact:.3%}")


# Global instance for the market engine service
market_engine_service = MarketEngineService()
