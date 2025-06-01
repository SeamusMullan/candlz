#!/usr/bin/env python3
"""
Integration test for MarketEngineManager with actual database operations
"""

import sys
import os
from decimal import Decimal
from datetime import datetime

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Import required modules
from market_engine.manager.MarketEngineManager import MarketEngineManager
from services.database_service import DatabaseService
from core.database import get_db
from core.models import Asset, Player, Order, AssetType, OrderStatus, OrderType, OrderSide, WealthTier
from core.schemas import PlayerCreate, AssetCreate, OrderCreate

def test_market_integration():
    """Test MarketEngineManager with real database operations."""
    print("Testing MarketEngineManager with database integration...")
    
    try:
        # Get market manager instance
        manager = MarketEngineManager()
        
        # Test 1: Create test data and extract IDs within session context
        print("\n📊 Creating test data...")
        player_id = None
        asset_id = None
        
        with manager.get_db_session() as db:
            db_service = DatabaseService(db)
            
            # Get or create a test player
            player = db_service.get_player_by_username("test_trader")
            if not player:
                player_data = PlayerCreate(
                    username="test_trader",
                    starting_capital=Decimal('10000.00')
                )
                player = db_service.create_player(player_data)
                print(f"✓ Created test player: {player.username}")
            else:
                print(f"✓ Using existing test player: {player.username}")
            
            # Extract player ID within the session
            player_id = player.id
            
            # Get or create a test asset
            asset = db_service.get_asset_by_symbol("TESTCOIN")
            if not asset:
                asset_data = AssetCreate(
                    symbol="TESTCOIN",
                    name="Test Cryptocurrency",
                    asset_type=AssetType.CRYPTO,
                    current_price=Decimal('100.00'),
                    unlocked_at_tier=WealthTier.RETAIL_TRADER,
                    market_cap=Decimal('1000000.00'),
                    volume_24h= Decimal('50000.00'),
                )
                asset = db_service.create_asset(asset_data)
                print(f"✓ Created test asset: {asset.symbol}")
            else:
                print(f"✓ Using existing test asset: {asset.symbol}")
            
            # Extract asset ID within the session
            asset_id = asset.id
        
        # Validate extracted IDs
        if not isinstance(player_id, int) or not isinstance(asset_id, int):
            print("⚠ Could not extract valid player or asset IDs")
            return False
        
        # Test 2: Create and execute orders
        print("\n💼 Testing order execution...")
        with manager.get_db_session() as db:
            db_service = DatabaseService(db)
            
            # Create a market buy order using the extracted asset_id
            order_data = OrderCreate(
                asset_id=asset_id,
                order_type=OrderType.MARKET,
                side=OrderSide.BUY,
                quantity=Decimal('10.0'),
                price=None,
                stop_price=None
            )
            
            order = db_service.create_order(player_id, order_data)
            print(f"✓ Created market buy order: {order.id}")
            
            # Execute pending orders
            executed_count = manager.execute_pending_orders()
            print(f"✓ Executed {executed_count} orders")
            
            # Check if order was executed
            updated_orders = db_service.get_player_orders(player_id, OrderStatus.FILLED)
            if updated_orders:
                print(f"✓ Found {len(updated_orders)} filled orders")
            else:
                print("⚠ No filled orders found (may be due to no current price)")
        
        # Test 3: Update asset prices and test portfolio valuation
        print("\n📈 Testing price updates and portfolio valuation...")
        
        # Update asset price
        new_price = Decimal('120.00')
        price_updated = manager.update_asset_price(asset_id, new_price, Decimal('1000'))
        print(f"✓ Price update result: {price_updated}")
        
        # Update portfolio values
        portfolios_updated = manager.update_all_portfolio_values()
        print(f"✓ Updated {portfolios_updated} portfolios")
        
        # Test 4: Market simulation
        print("\n🎯 Testing market simulation...")
        
        # Start market simulation
        sim_started = manager.start_market_simulation()
        print(f"✓ Market simulation started: {sim_started}")
        
        if sim_started:
            # Run a few market ticks
            for i in range(3):
                tick_result = manager.simulate_market_tick()
                print(f"✓ Market tick {i+1}: {tick_result['prices_updated']} prices updated, "
                      f"{tick_result['orders_executed']} orders executed")
            
            # Stop simulation
            sim_stopped = manager.stop_market_simulation()
            print(f"✓ Market simulation stopped: {sim_stopped}")
        
        # Test 5: Analytics and reporting
        print("\n📊 Testing analytics and reporting...")
        
        # Get market analytics
        analytics = manager.get_analytics_data()
        print(f"✓ Market analytics - Total assets: {analytics.get('market_overview', {}).get('total_assets', 0)}")
        
        # Get performance summary
        performance = manager.get_market_performance_summary()
        print(f"✓ Performance summary - Market cap: ${performance.get('market_metrics', {}).get('total_market_cap', 0):.2f}")
        
        # Health check
        health = manager.health_check()
        print(f"✓ Health check status: {health['status']}")
        
        print("\n✅ All integration tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Integration test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_test_data():
    """Clean up test data after tests."""
    try:
        manager = MarketEngineManager()
        with manager.get_db_session() as db:
            # Remove test orders
            db.query(Order).filter(Order.player_id.in_(
                db.query(Player.id).filter(Player.username == "test_trader")
            )).delete(synchronize_session=False)
            
            # Remove test player (optional - comment out to keep for future tests)
            # db.query(Player).filter(Player.username == "test_trader").delete()
            
            # Remove test asset (optional - comment out to keep for future tests)  
            # db.query(Asset).filter(Asset.symbol == "TESTCOIN").delete()
            
            db.commit()
            print("✓ Test data cleanup completed")
    except Exception as e:
        print(f"⚠ Cleanup warning: {e}")

if __name__ == "__main__":
    success = test_market_integration()
    # cleanup_test_data()  # Uncomment to clean up test data
    exit(0 if success else 1)
