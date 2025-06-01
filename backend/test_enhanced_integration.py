#!/usr/bin/env python3
"""
Test script to verify enhanced random walk integration with MarketEngineManager.
This script demonstrates the new realistic price simulation in action.
"""

import logging
from decimal import Decimal
from core.database import DatabaseManager
from market_engine.manager.MarketEngineManager import MarketEngineManager
from services.database_service import DatabaseService
from core.models import Asset, AssetType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_enhanced_random_walk_integration():
    """Test the enhanced random walk integration with realistic price movements."""
    
    print("🚀 Testing Enhanced Random Walk Integration")
    print("=" * 50)
    
    # Initialize the market engine manager
    manager = MarketEngineManager()
    
    # Get market status
    status = manager.get_market_status()
    print(f"Market Engine Running: {status['is_running']}")
    print(f"Market Phase: {status['market_phase']}")
    print(f"Volatility Multiplier: {status['volatility_multiplier']}")
    
    # Start market simulation
    if not status['is_running']:
        success = manager.start_market_simulation()
        print(f"Started market simulation: {success}")
    
    # Get active assets for testing
    with manager.get_db_session() as db:
        assets = db.query(Asset).filter(Asset.is_active == True).all()
        print(f"\nFound {len(assets)} active assets")
        
        if not assets:
            print("No assets found - creating test assets...")
            # Create test assets of different types
            test_assets = [
                {
                    'symbol': 'BTC-TEST',
                    'name': 'Bitcoin Test',
                    'asset_type': AssetType.CRYPTO,
                    'current_price': Decimal('50000.00'),
                    'is_active': True
                },
                {
                    'symbol': 'AAPL-TEST',
                    'name': 'Apple Test',
                    'asset_type': AssetType.STOCK,
                    'current_price': Decimal('150.00'),
                    'is_active': True
                },
                {
                    'symbol': 'EUR-USD-TEST',
                    'name': 'Euro USD Test',
                    'asset_type': AssetType.FOREX,
                    'current_price': Decimal('1.1000'),
                    'is_active': True
                }
            ]
            
            for asset_data in test_assets:
                asset = Asset(**asset_data)
                db.add(asset)
            
            db.commit()
            print("Created test assets")
            
            # Get assets again
            assets = db.query(Asset).filter(Asset.is_active == True).all()
        
        # Convert assets to simple data structures to avoid session issues
        asset_data = []
        for asset in assets[:3]:  # Test first 3 assets
            asset_data.append({
                'id': asset.id,
                'symbol': asset.symbol,
                'current_price': asset.current_price,
                'asset_type': asset.asset_type,
                'volume_24h': getattr(asset, 'volume_24h', None)
            })
    
    # Test price simulation with enhanced random walk
    print(f"\n📊 Testing Enhanced Price Simulation")
    print("-" * 40)
    
    for i, asset_info in enumerate(asset_data):
        asset_id = asset_info['id']
        symbol = asset_info['symbol']
        current_price = asset_info['current_price']
        asset_type = asset_info['asset_type']
        
        print(f"\nAsset: {symbol} (ID: {asset_id})")
        print(f"Type: {asset_type}")
        print(f"Current Price: ${current_price}")
        
        # Simulate multiple market ticks to show price movement
        print("Simulating 5 market ticks...")
        for tick in range(5):
            tick_result = manager.simulate_market_tick()
            
            # Get updated price
            with manager.get_db_session() as db:
                updated_asset = db.query(Asset).filter(Asset.id == asset_id).first()
                
                if updated_asset:
                    new_price = updated_asset.current_price
                    change = ((new_price - current_price) / current_price) * 100
                    print(f"  Tick {tick + 1}: ${new_price:.2f} ({change:+.2f}%)")
                    current_price = new_price
                else:
                    print(f"  Tick {tick + 1}: Asset not found")
        
        # Test market event impact
        print(f"\n⚡ Testing Market Event Impact for {symbol}")
        success = manager.simulate_market_event_impact(
            asset_id=asset_id,
            event_type='earnings_beat',
            severity=1.5
        )
        
        if success:
            # Get price after event
            with manager.get_db_session() as db:
                post_event_asset = db.query(Asset).filter(Asset.id == asset_id).first()
                
                if post_event_asset:
                    post_event_price = post_event_asset.current_price
                    event_change = ((post_event_price - current_price) / current_price) * 100
                    print(f"  After earnings_beat event: ${post_event_price:.2f} ({event_change:+.2f}%)")
        else:
            print("  Market event simulation failed")
    
    # Test batch price updates
    print(f"\n🔄 Testing Batch Price Updates")
    print("-" * 40)
    
    # Prepare batch update data
    asset_updates = []
    for asset_info in asset_data:
        asset_updates.append({
            'asset_id': asset_info['id'],
            'current_price': asset_info['current_price'],
            'asset_type': str(asset_info['asset_type'].value) if hasattr(asset_info['asset_type'], 'value') else str(asset_info['asset_type']),
            'volume': asset_info['volume_24h']
        })
    
    updated_count = manager.update_asset_prices_batch(asset_updates)
    print(f"Batch updated {updated_count} asset prices")
    
    # Test volatility summary
    print(f"\n📈 Market Volatility Summary")
    print("-" * 40)
    
    volatility_summary = manager.get_market_volatility_summary()
    
    if volatility_summary:
        print(f"Timestamp: {volatility_summary.get('timestamp', 'Unknown')}")
        print(f"Market Stress: {volatility_summary.get('market_stress_indicator', 'Unknown')}")
        
        volatility_by_type = volatility_summary.get('volatility_by_type', {})
        for asset_type, metrics in volatility_by_type.items():
            print(f"\n{asset_type.upper()}:")
            print(f"  Average Volatility: {metrics.get('average_volatility', 0):.4f}")
            print(f"  Asset Count: {metrics.get('asset_count', 0)}")
            print(f"  Theoretical Volatility: {metrics.get('theoretical_volatility', 0):.4f}")
    
    # Final market performance summary
    print(f"\n📊 Final Market Performance Summary")
    print("-" * 40)
    
    performance = manager.get_market_performance_summary()
    
    if performance and 'market_metrics' in performance:
        metrics = performance['market_metrics']
        print(f"Total Market Cap: ${metrics.get('total_market_cap', 0):,.2f}")
        print(f"Total Assets: {metrics.get('total_assets', 0)}")
        print(f"Active Assets: {metrics.get('active_assets', 0)}")
    
    if performance and 'activity_metrics' in performance:
        activity = performance['activity_metrics']
        print(f"Total Calculations: {activity.get('total_calculations', 0)}")
        print(f"Price Updates (24h): {activity.get('price_updates_24h', 0)}")
    
    print(f"\n✅ Enhanced Random Walk Integration Test Complete!")
    print("=" * 50)
    
    return True

if __name__ == "__main__":
    try:
        test_enhanced_random_walk_integration()
    except Exception as e:
        logger.error(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
