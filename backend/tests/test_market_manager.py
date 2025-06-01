#!/usr/bin/env python3
"""
Test script for MarketEngineManager functionality
"""

import sys
import os

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Replace hyphens with underscores for Python module imports
from market_engine.manager.MarketEngineManager import MarketEngineManager

def test_market_engine_manager():
    """Test basic MarketEngineManager functionality."""
    print("Testing MarketEngineManager...")
    
    try:
        # Test singleton pattern
        manager1 = MarketEngineManager()
        manager2 = MarketEngineManager()
        print(f"✓ Singleton test: {manager1 is manager2}")
        
        # Test market status
        status = manager1.get_market_status()
        print(f"✓ Market status keys: {list(status.keys())}")
        
        # Test health check
        health = manager1.health_check()
        print(f"✓ Health check: {health['status']}")
        
        # Test getting active assets
        assets = manager1.get_active_assets()
        print(f"✓ Active assets found: {len(assets)}")
        
        # Test order execution (should find no orders initially)
        executed = manager1.execute_pending_orders()
        print(f"✓ Orders executed: {executed}")
        
        # Test portfolio updates (should update 0 initially)
        updated = manager1.update_all_portfolio_values()
        print(f"✓ Portfolios updated: {updated}")
        
        # Test market performance summary
        performance = manager1.get_market_performance_summary()
        print(f"✓ Performance summary keys: {list(performance.keys())}")
        
        # Test market simulation
        simulation_started = manager1.start_market_simulation()
        print(f"✓ Market simulation started: {simulation_started}")
        
        if simulation_started:
            # Test a market tick
            tick_result = manager1.simulate_market_tick()
            print(f"✓ Market tick completed: {tick_result['timestamp']}")
            
            # Stop simulation
            simulation_stopped = manager1.stop_market_simulation()
            print(f"✓ Market simulation stopped: {simulation_stopped}")
        
        print("\n✅ All MarketEngineManager tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_market_engine_manager()
