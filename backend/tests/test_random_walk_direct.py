#!/usr/bin/env python3
"""
Focused test to demonstrate enhanced random walk price simulation.
"""

import logging
from decimal import Decimal
from market_engine.random_walk import simulate_asset_price_update, simulate_market_event

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_enhanced_random_walk_direct():
    """Test the enhanced random walk functions directly."""
    
    print("🔬 Direct Enhanced Random Walk Test")
    print("=" * 40)
    
    # Test different asset types
    test_assets = [
        {
            'id': 1,
            'name': 'Bitcoin',
            'type': 'CRYPTO',
            'price': Decimal('50000.00'),
            'volume': Decimal('1000000')
        },
        {
            'id': 2,
            'name': 'Apple Stock',
            'type': 'STOCK',
            'price': Decimal('150.00'),
            'volume': Decimal('500000')
        },
        {
            'id': 3,
            'name': 'EUR/USD',
            'type': 'FOREX',
            'price': Decimal('1.1000'),
            'volume': Decimal('10000000')
        }
    ]
    
    for asset in test_assets:
        print(f"\n📊 Testing {asset['name']} ({asset['type']})")
        print(f"Starting Price: ${asset['price']}")
        print(f"Volume: {asset['volume']}")
        
        # Test 10 price updates
        current_price = asset['price']
        print("\nPrice Simulation (10 steps):")
        
        for i in range(10):
            try:
                result = simulate_asset_price_update(
                    asset_id=asset['id'],
                    current_price=current_price,
                    asset_type=asset['type'],
                    volume=asset['volume']
                )
                
                new_price = result['new_price']
                change_percent = result['change_percent']
                volume_generated = result['volume_generated']
                
                print(f"  Step {i+1}: ${new_price:.6f} ({change_percent:+.2f}%) Vol: {volume_generated}")
                current_price = new_price
                
            except Exception as e:
                print(f"  Step {i+1}: Error - {e}")
                break
        
        # Test market event
        print(f"\n⚡ Testing Market Event Impact")
        try:
            event_price = simulate_market_event(
                asset_id=asset['id'],
                current_price=current_price,
                event_type='market_crash',
                severity=2.0
            )
            
            event_change = ((event_price - current_price) / current_price) * 100
            print(f"  Market Crash Event: ${event_price:.6f} ({event_change:+.2f}%)")
            
        except Exception as e:
            print(f"  Market Event Error: {e}")
    
    print(f"\n✅ Enhanced Random Walk Direct Test Complete!")
    
    return True

if __name__ == "__main__":
    try:
        test_enhanced_random_walk_direct()
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
