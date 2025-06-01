"""
Enhanced Random Walk Market Simulation

Implements realistic random walk simulation for asset prices with:
- Geometric Brownian Motion for more realistic price movements
- Volatility adjustment based on asset types
- Market trend influences
- Time-of-day and volume considerations

This integrates with the MarketEngineManager to provide realistic
market simulation for the candlz trading game.
"""

import random
import math
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class MarketParameters:
    """Parameters for market simulation."""
    base_volatility: float = 0.02  # 2% base daily volatility
    trend_strength: float = 0.001  # Trend influence
    volume_impact: float = 0.1     # Volume's impact on volatility
    time_decay: float = 0.95       # How trend strength decays over time
    
class EnhancedRandomWalk:
    """Enhanced random walk simulation with realistic market behavior."""
    
    def __init__(self):
        self.market_params = MarketParameters()
        self.asset_volatilities = {
            'CRYPTO': 0.05,    # 5% daily volatility
            'STOCK': 0.02,     # 2% daily volatility  
            'FOREX': 0.01,     # 1% daily volatility
            'COMMODITY': 0.03, # 3% daily volatility
            'BOND': 0.005,     # 0.5% daily volatility
            'INDEX': 0.015,    # 1.5% daily volatility
            'DERIVATIVE': 0.08 # 8% daily volatility
        }
        self.market_trends = {}  # Track market trends per asset
        
    def get_asset_volatility(self, asset_type: str) -> float:
        """Get volatility for specific asset type."""
        return self.asset_volatilities.get(asset_type.upper(), self.market_params.base_volatility)
    
    def geometric_brownian_motion(
        self, 
        current_price: Decimal, 
        volatility: float, 
        drift: float = 0.0, 
        time_step: float = 1.0/365
    ) -> Decimal:
        """
        Generate next price using Geometric Brownian Motion.
        
        Args:
            current_price: Current asset price
            volatility: Asset volatility (annualized)
            drift: Expected return (annualized)
            time_step: Time step (default 1 day = 1/365 years)
        """
        # Generate random normal variable
        z = random.gauss(0, 1)
        
        # Calculate price change using GBM formula
        price_change = float(current_price) * (
            drift * time_step + volatility * math.sqrt(time_step) * z
        )
        
        new_price = float(current_price) + price_change
        
        # Ensure price doesn't go negative or become unrealistic
        min_price = float(current_price) * 0.5  # Max 50% drop in one step
        max_price = float(current_price) * 2.0  # Max 100% gain in one step
        
        new_price = max(min_price, min(max_price, new_price))
        
        return Decimal(str(round(new_price, 8)))
    
    def calculate_market_drift(self, asset_id: int, asset_type: str) -> float:
        """Calculate current market drift/trend for an asset."""
        # Get or initialize trend for this asset
        if asset_id not in self.market_trends:
            self.market_trends[asset_id] = {
                'direction': random.choice([-1, 0, 1]),  # Bear, sideways, bull
                'strength': random.uniform(0.001, 0.01),
                'duration': random.randint(50, 200),  # Steps remaining
                'started': datetime.utcnow()
            }
        
        trend = self.market_trends[asset_id]
        
        # Decay trend over time
        if trend['duration'] <= 0:
            # Start new trend
            trend['direction'] = random.choice([-1, 0, 1])
            trend['strength'] = random.uniform(0.001, 0.01)
            trend['duration'] = random.randint(50, 200)
            trend['started'] = datetime.utcnow()
        else:
            trend['duration'] -= 1
            
        # Apply trend with some randomness
        base_drift = trend['direction'] * trend['strength']
        noise = random.gauss(0, 0.002)  # Add some noise
        
        return base_drift + noise
    
    def simulate_single_step(
        self, 
        current_price: Decimal, 
        asset_id: int,
        asset_type: str,
        volume: Optional[Decimal] = None
    ) -> Dict[str, any]:
        """
        Simulate a single price step for an asset.
        
        Returns:
            Dict with new_price, change_percent, volume_generated
        """
        try:
            # Get asset-specific volatility
            base_volatility = self.get_asset_volatility(asset_type)
            
            # Adjust volatility based on volume if provided
            if volume and volume > 0:
                volume_factor = min(float(volume) / 1000000, 2.0)  # Cap at 2x
                adjusted_volatility = base_volatility * (1 + volume_factor * self.market_params.volume_impact)
            else:
                adjusted_volatility = base_volatility
            
            # Calculate market drift/trend
            drift = self.calculate_market_drift(asset_id, asset_type)
            
            # Generate new price
            new_price = self.geometric_brownian_motion(
                current_price, 
                adjusted_volatility, 
                drift
            )
            
            # Calculate change percentage
            change_percent = float((new_price - current_price) / current_price * 100)
            
            # Generate realistic volume
            base_volume = random.uniform(10000, 100000)
            volatility_impact = abs(change_percent) * 50000  # Higher volume with big moves
            generated_volume = Decimal(str(int(base_volume + volatility_impact)))
            
            return {
                'new_price': new_price,
                'change_percent': change_percent,
                'volume_generated': generated_volume,
                'volatility_used': adjusted_volatility,
                'drift_applied': drift
            }
            
        except Exception as e:
            logger.error(f"Error in simulate_single_step: {e}")
            # Return safe fallback
            return {
                'new_price': current_price,
                'change_percent': 0.0,
                'volume_generated': Decimal('50000'),
                'volatility_used': base_volatility,
                'drift_applied': 0.0
            }
    
    def simulate_multiple_steps(
        self, 
        current_price: Decimal, 
        asset_id: int,
        asset_type: str,
        steps: int = 1
    ) -> List[Dict[str, any]]:
        """Simulate multiple price steps."""
        results = []
        price = current_price
        
        for _ in range(steps):
            step_result = self.simulate_single_step(price, asset_id, asset_type)
            price = step_result['new_price']
            results.append(step_result)
            
        return results
    
    def create_market_event_impact(
        self, 
        base_price: Decimal, 
        event_type: str, 
        severity: float = 1.0
    ) -> Decimal:
        """
        Simulate price impact from market events.
        
        Args:
            base_price: Current price before event
            event_type: Type of event (crash, rally, earnings, etc.)
            severity: Event severity multiplier (0.1 to 3.0)
        """
        event_impacts = {
            'market_crash': -0.15,     # -15% average
            'flash_crash': -0.08,      # -8% average
            'earnings_beat': 0.05,     # +5% average
            'earnings_miss': -0.03,    # -3% average
            'rally': 0.10,             # +10% average
            'bubble_burst': -0.25,     # -25% average
            'news_positive': 0.02,     # +2% average
            'news_negative': -0.02,    # -2% average
        }
        
        base_impact = event_impacts.get(event_type, 0.0)
        
        # Add randomness and apply severity
        actual_impact = base_impact * severity * random.uniform(0.5, 1.5)
        
        # Apply impact to price
        new_price = base_price * (1 + Decimal(str(actual_impact)))
        
        # Ensure reasonable bounds
        min_price = base_price * Decimal('0.1')  # No more than 90% crash
        max_price = base_price * Decimal('5.0')  # No more than 500% gain
        
        return max(min_price, min(max_price, new_price))

# Global instance for the market engine
enhanced_random_walk = EnhancedRandomWalk()

def random_walk(start_price: float, steps: int) -> List[float]:
    """Legacy function for backward compatibility."""
    price = start_price
    prices = [price]
    for _ in range(steps):
        if random.random() > 0.5:
            price += random.uniform(-price * 0.02, price * 0.02)  # 2% max change
        else:
            price -= random.uniform(-price * 0.02, price * 0.02)
        prices.append(max(0.01, price))  # Prevent negative prices
    return prices

def simulate_asset_price_update(
    asset_id: int,
    current_price: Decimal,
    asset_type: str,
    volume: Optional[Decimal] = None
) -> Dict[str, any]:
    """
    Main function to simulate a single price update for an asset.
    
    This is the primary interface used by MarketEngineManager.
    """
    return enhanced_random_walk.simulate_single_step(
        current_price, asset_id, asset_type, volume
    )

def simulate_market_event(
    asset_id: int,
    current_price: Decimal,
    event_type: str,
    severity: float = 1.0
) -> Decimal:
    """Simulate price impact from a market event."""
    return enhanced_random_walk.create_market_event_impact(
        current_price, event_type, severity
    )