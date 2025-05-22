#!/usr/bin/env python3
"""
Simple test script to validate Candlz backend functionality.
Run this to test the core models, database, and basic functionality.
"""

import sys
import os
from pathlib import Path

# Add the current directory to Python path so we can import our modules
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all core modules can be imported."""
    print("🧪 Testing module imports...")
    
    try:
        # Test basic dependencies
        from decimal import Decimal
        from datetime import datetime
        from enum import Enum
        print("  ✅ Basic Python modules")
        
        # Test our core modules
        from core.config import settings, constants
        print("  ✅ Core config")
        
        from core.models import (
            AssetType, OrderType, OrderSide, OrderStatus, WealthTier,
            Player, Asset, Portfolio, Order, PriceHistory
        )
        print("  ✅ Core models")
        
        from core.schemas import (
            PlayerCreate, AssetCreate, OrderCreate, PortfolioSummary
        )
        print("  ✅ Core schemas")
        
        print("🎉 All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_database_setup():
    """Test database connection and table creation."""
    print("🗄️ Testing database setup...")
    
    try:
        from core.database import create_tables, db_manager
        
        # Create tables
        create_tables()
        print("  ✅ Database tables created")
        
        # Test database health
        if db_manager.health_check():
            print("  ✅ Database connection healthy")
        else:
            print("  ❌ Database connection failed")
            return False
            
        # Get table info
        table_info = db_manager.get_table_info()
        print(f"  ✅ Found {len(table_info)} tables")
        
        return True
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def test_data_initialization():
    """Test game data initialization."""
    print("🎮 Testing game data initialization...")
    
    try:
        from core.database import get_db
        from services.initialization_service import InitializationService
        
        # Get database session
        db = next(get_db())
        
        # Initialize game data
        init_service = InitializationService(db)
        results = init_service.initialize_game_data(reset_existing=True)
        
        print(f"  ✅ Created {results['assets']} assets")
        print(f"  ✅ Created {results['achievements']} achievements")
        
        # Create sample price history
        price_points = init_service.create_sample_price_history(days=7)
        print(f"  ✅ Created {price_points} price history points")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        return False

def test_basic_operations():
    """Test basic game operations."""
    print("⚙️ Testing basic operations...")
    
    try:
        from core.database import get_db
        from services.database_service import DatabaseService
        from core.schemas import PlayerCreate, OrderCreate
        from core.models import OrderType, OrderSide
        from decimal import Decimal
        
        # Get database session
        db = next(get_db())
        db_service = DatabaseService(db)
        
        # Create a test player
        player_data = PlayerCreate(
            username="test_player",
            starting_capital=Decimal("10000.00")
        )
        player = db_service.create_player(player_data)
        print(f"  ✅ Created player: {player.username}")
        
        # Get an asset to trade
        assets = db_service.get_assets_by_type("stock")
        if not assets:
            print("  ❌ No assets found")
            return False
        
        asset = assets[0]
        print(f"  ✅ Found asset: {asset.symbol}")
        
        # Create a buy order
        order_data = OrderCreate(
            asset_id=asset.id,
            order_type=OrderType.MARKET,
            side=OrderSide.BUY,
            quantity=Decimal("10.0")
        )
        order = db_service.create_order(player.id, order_data)
        print(f"  ✅ Created order: {order.id}")
        
        # Execute the order
        executed_order = db_service.execute_order(order.id, asset.current_price)
        print(f"  ✅ Executed order: {executed_order.status}")
        
        # Check portfolio
        portfolio = db_service.get_player_portfolio(player.id)
        print(f"  ✅ Portfolio has {len(portfolio)} positions")
        
        # Get player stats
        stats = db_service.get_player_stats(player.id)
        print(f"  ✅ Player stats: {stats.total_trades} trades")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Operations error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("🚀 Candlz Backend Test Suite")
    print("=" * 50)
    
    tests = [
        ("Module Imports", test_imports),
        ("Database Setup", test_database_setup),
        ("Data Initialization", test_data_initialization),
        ("Basic Operations", test_basic_operations)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready.")
        print("\nYou can now:")
        print("  • Start the server with: uv run main.py")
        print("  • Access the API docs at: http://localhost:8000/docs")
        print("  • Use the API endpoints to build your frontend")
    else:
        print("❌ Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)