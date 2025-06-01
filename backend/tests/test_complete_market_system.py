#!/usr/bin/env python3
"""
Comprehensive test demonstrating the complete MarketEngineManager functionality
This test creates a realistic trading scenario with multiple orders, price updates,
and portfolio management to showcase the full system integration.
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
from core.models import Asset, Player, Order, AssetType, OrderStatus, OrderType, OrderSide, WealthTier
from core.schemas import PlayerCreate, AssetCreate, OrderCreate

def test_complete_market_system():
    """Test the complete market system with a realistic trading scenario."""
    print("🚀 Testing Complete Market System Integration")
    print("=" * 60)
    
    try:
        # Initialize market manager
        manager = MarketEngineManager()
        
        # Phase 1: System Health Check
        print("\n📊 Phase 1: System Health Check")
        health = manager.health_check()
        print(f"✓ System Status: {health['status']}")
        print(f"✓ Database Connected: {health['database_connection']}")
        print(f"✓ Market Service Running: {health['market_service_running']}")
        print(f"✓ Initialization Complete: {health['initialization_complete']}")
        
        # Get active assets for further setup
        active_assets = manager.get_active_assets()
        print(f"✓ Active Assets: {len(active_assets)}")
        
        # Phase 2: Create Market Participants and Assets
        print("\n👥 Phase 2: Setting up Market Participants")
        
        player_ids = []
        asset_ids = []
        
        # Create test participants and assets
        with manager.get_db_session() as db:
            db_service = DatabaseService(db)
            
            # Create multiple test players
            for i, username in enumerate(["trader_alice", "trader_bob", "trader_charlie"]):
                player = db_service.get_player_by_username(username)
                if not player:
                    player_data = PlayerCreate(
                        username=username,
                        starting_capital=Decimal(f'{10000 + i * 5000}.00')
                    )
                    player = db_service.create_player(player_data)
                    print(f"✓ Created player: {username} with ${player.starting_capital}")
                else:
                    print(f"✓ Using existing player: {username}")
                
                player_ids.append(player.id)
            
            # Create multiple test assets
            assets_data = [
                ("BTCTEST", "Bitcoin Test", Decimal('50000.00')),
                ("ETHTEST", "Ethereum Test", Decimal('3000.00')),
                ("ADATEST", "Cardano Test", Decimal('2.50'))
            ]
            
            for symbol, name, price in assets_data:
                asset = db_service.get_asset_by_symbol(symbol)
                if not asset:
                    asset_data = AssetCreate(
                        symbol=symbol,
                        name=name,
                        asset_type=AssetType.CRYPTO,
                        current_price=price,
                        unlocked_at_tier=WealthTier.RETAIL_TRADER,
                        market_cap=Decimal('1000000.00'),
                        volume_24h=Decimal('50000.00')
                    )
                    asset = db_service.create_asset(asset_data)
                    print(f"✓ Created asset: {symbol} at ${price}")
                else:
                    print(f"✓ Using existing asset: {symbol}")
                
                asset_ids.append(asset.id)
        
        # Phase 3: Generate Trading Activity
        print("\n💼 Phase 3: Generating Trading Activity")
        
        order_count = 0
        with manager.get_db_session() as db:
            db_service = DatabaseService(db)
            
            # Create diverse orders
            orders_to_create = [
                # Alice's orders
                (player_ids[0], asset_ids[0], OrderType.MARKET, OrderSide.BUY, Decimal('0.1')),
                (player_ids[0], asset_ids[1], OrderType.LIMIT, OrderSide.BUY, Decimal('5.0'), Decimal('2900.00')),
                
                # Bob's orders
                (player_ids[1], asset_ids[1], OrderType.MARKET, OrderSide.BUY, Decimal('2.0')),
                (player_ids[1], asset_ids[2], OrderType.LIMIT, OrderSide.BUY, Decimal('1000.0'), Decimal('2.40')),
                
                # Charlie's orders
                (player_ids[2], asset_ids[0], OrderType.LIMIT, OrderSide.BUY, Decimal('0.05'), Decimal('49000.00')),
                (player_ids[2], asset_ids[2], OrderType.MARKET, OrderSide.BUY, Decimal('500.0')),
            ]
            
            for order_data in orders_to_create:
                player_id, asset_id, order_type, side, quantity = order_data[:5]
                price = order_data[5] if len(order_data) > 5 else None
                
                order_create = OrderCreate(
                    asset_id=asset_id,
                    order_type=order_type,
                    side=side,
                    quantity=quantity,
                    price=price,
                    stop_price=None
                )
                
                order = db_service.create_order(player_id, order_create)
                order_count += 1
                order_type_str = f"{order_type.value} {side.value}"
                price_str = f" @ ${price}" if price else ""
                print(f"✓ Created {order_type_str} order: {quantity} units{price_str}")
        
        print(f"✓ Total orders created: {order_count}")
        
        # Phase 4: Execute Orders and Update Market
        print("\n⚡ Phase 4: Market Execution")
        
        # Execute pending orders
        executed_orders = manager.execute_pending_orders()
        print(f"✓ Executed {executed_orders} orders")
        
        # Update portfolio values
        updated_portfolios = manager.update_all_portfolio_values()
        print(f"✓ Updated {updated_portfolios} portfolios")
        
        # Phase 5: Market Simulation
        print("\n🎯 Phase 5: Market Simulation")
        
        # Start market simulation
        sim_started = manager.start_market_simulation()
        print(f"✓ Market simulation started: {sim_started}")
        
        if sim_started:
            # Run multiple market ticks to simulate price movements
            total_price_updates = 0
            total_order_executions = 0
            
            for tick in range(5):
                tick_result = manager.simulate_market_tick()
                prices_updated = tick_result.get('prices_updated', 0)
                orders_executed = tick_result.get('orders_executed', 0)
                
                total_price_updates += prices_updated
                total_order_executions += orders_executed
                
                print(f"✓ Tick {tick + 1}: {prices_updated} prices updated, {orders_executed} orders executed")
            
            print(f"✓ Simulation totals: {total_price_updates} price updates, {total_order_executions} order executions")
            
            # Stop simulation
            sim_stopped = manager.stop_market_simulation()
            print(f"✓ Market simulation stopped: {sim_stopped}")
        
        # Phase 6: Analytics and Reporting
        print("\n📊 Phase 6: Market Analytics")
        
        # Get comprehensive market status
        market_status = manager.get_market_status()
        print(f"✓ Market Phase: {market_status.get('market_phase', 'Unknown')}")
        print(f"✓ Economic Cycle: {market_status.get('economic_cycle', 'Unknown')}")
        print(f"✓ Total Market Cap: ${market_status.get('total_market_cap', 0):,.2f}")
        print(f"✓ Active Events: {market_status.get('active_events_count', 0)}")
        
        # Get performance summary
        performance = manager.get_market_performance_summary()
        market_metrics = performance.get('market_metrics', {})
        activity_metrics = performance.get('activity_metrics', {})
        
        print(f"✓ Total Trading Volume: ${market_metrics.get('total_volume', 0):,.2f}")
        print(f"✓ Active Orders: {activity_metrics.get('active_orders', 0)}")
        print(f"✓ Total Orders: {activity_metrics.get('total_orders', 0)}")
        
        # Get analytics data
        analytics = manager.get_analytics_data()
        market_overview = analytics.get('market_overview', {})
        print(f"✓ Total Assets in System: {market_overview.get('total_assets', 0)}")
        print(f"✓ Total Players: {market_overview.get('total_players', 0)}")
        
        # Phase 7: Individual Asset Analysis
        print("\n📈 Phase 7: Asset Performance Analysis")
        
        with manager.get_db_session() as db:
            db_service = DatabaseService(db)
            
            for asset_id in asset_ids:
                asset = db_service.get_asset_by_id(asset_id)
                if asset:
                    price_history = db_service.get_price_history(asset_id, limit=5)
                    print(f"✓ {asset.symbol}: Current ${asset.current_price}, "
                          f"Price history entries: {len(price_history)}")
        
        # Final system health check
        print("\n🏁 Final System Health Check")
        final_health = manager.health_check()
        print(f"✓ Final Status: {final_health['status']}")
        print(f"✓ Total Calculations Performed: {final_health.get('total_calculations', 0)}")
        
        print("\n" + "=" * 60)
        print("🎉 Complete Market System Test SUCCESSFUL!")
        print("✅ All phases completed successfully")
        return True
        
    except Exception as e:
        print(f"\n❌ Complete system test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def cleanup_comprehensive_test_data():
    """Clean up all test data created during comprehensive testing."""
    try:
        manager = MarketEngineManager()
        with manager.get_db_session() as db:
            # Get test player IDs
            test_usernames = ["trader_alice", "trader_bob", "trader_charlie"]
            test_player_ids = [
                player.id for player in db.query(Player).filter(
                    Player.username.in_(test_usernames)
                ).all()
            ]
            
            if test_player_ids:
                # Remove orders from test players
                deleted_orders = db.query(Order).filter(
                    Order.player_id.in_(test_player_ids)
                ).delete(synchronize_session=False)
                print(f"✓ Cleaned up {deleted_orders} test orders")
            
            # Optional: Remove test assets and players (uncomment if needed)
            # test_symbols = ["BTCTEST", "ETHTEST", "ADATEST"]
            # deleted_assets = db.query(Asset).filter(Asset.symbol.in_(test_symbols)).delete()
            # deleted_players = db.query(Player).filter(Player.username.in_(test_usernames)).delete()
            
            db.commit()
            print("✓ Comprehensive test data cleanup completed")
            
    except Exception as e:
        print(f"⚠ Cleanup warning: {e}")

if __name__ == "__main__":
    success = test_complete_market_system()
    
    # Uncomment the next line to clean up test data after running
    # cleanup_comprehensive_test_data()
    
    print(f"\nTest Result: {'PASSED' if success else 'FAILED'}")
    exit(0 if success else 1)
