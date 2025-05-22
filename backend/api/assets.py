from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.schemas import (
    Asset, AssetCreate, AssetUpdate, PriceHistory, 
    MarketData, APIResponse
)
from core.models import AssetType, WealthTier
from services.database_service import DatabaseService

router = APIRouter()

@router.get("/", response_model=List[Asset], summary="Get All Assets")
def get_assets(
    asset_type: Optional[AssetType] = None,
    wealth_tier: Optional[WealthTier] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all tradeable assets, optionally filtered by type or wealth tier."""
    try:
        db_service = DatabaseService(db)
        
        if wealth_tier:
            # Get assets available for specific wealth tier
            assets = db_service.get_available_assets(wealth_tier)
        elif asset_type:
            # Get assets by type
            assets = db_service.get_assets_by_type(asset_type.value)
        else:
            # Get all assets
            from core.models import Asset as AssetModel
            query = db.query(AssetModel)
            if active_only:
                query = query.filter(AssetModel.is_active == True)
            assets = query.all()
        
        return assets
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get assets: {str(e)}")

@router.get("/{asset_id}", response_model=Asset, summary="Get Asset by ID")
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific asset."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset(asset_id)
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return asset

@router.get("/symbol/{symbol}", response_model=Asset, summary="Get Asset by Symbol")
def get_asset_by_symbol(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get asset information by trading symbol."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset_by_symbol(symbol.upper())
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return asset

@router.post("/", response_model=Asset, summary="Create Asset")
def create_asset(
    asset_data: AssetCreate,
    db: Session = Depends(get_db)
):
    """Create a new tradeable asset."""
    try:
        db_service = DatabaseService(db)
        
        # Check if symbol already exists
        existing_asset = db_service.get_asset_by_symbol(asset_data.symbol)
        if existing_asset:
            raise HTTPException(status_code=400, detail="Asset symbol already exists")
        
        asset = db_service.create_asset(asset_data)
        return asset
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create asset: {str(e)}")

@router.put("/{asset_id}", response_model=Asset, summary="Update Asset")
def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    db: Session = Depends(get_db)
):
    """Update asset information."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset(asset_id)
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    try:
        # Update fields
        update_data = asset_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(asset, field, value)
        
        asset.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(asset)
        
        return asset
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update asset: {str(e)}")

@router.get("/{asset_id}/price-history", response_model=List[PriceHistory], summary="Get Price History")
def get_price_history(
    asset_id: int,
    days: int = Query(default=30, ge=1, le=365),
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """Get historical price data for an asset."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset(asset_id)
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    try:
        start_time = datetime.utcnow() - timedelta(days=days)
        price_history = db_service.get_price_history(
            asset_id=asset_id,
            start_time=start_time,
            limit=limit
        )
        
        return price_history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get price history: {str(e)}")

@router.post("/{asset_id}/price-history", response_model=PriceHistory, summary="Add Price Data")
def add_price_data(
    asset_id: int,
    price_data: dict,
    db: Session = Depends(get_db)
):
    """Add new price history data point for an asset."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset(asset_id)
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    try:
        # Validate required fields
        required_fields = ["timestamp", "open_price", "high_price", "low_price", "close_price"]
        for field in required_fields:
            if field not in price_data:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Add price data
        price_history = db_service.add_price_data(asset_id, price_data)
        
        # Update asset's current price
        db_service.update_asset_price(asset_id, price_data["close_price"])
        
        return price_history
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add price data: {str(e)}")

@router.get("/types", summary="Get Asset Types")
def get_asset_types():
    """Get all available asset types."""
    return {
        "asset_types": [asset_type.value for asset_type in AssetType],
        "descriptions": {
            "stock": "Company stocks and equities",
            "crypto": "Cryptocurrencies and digital assets",
            "forex": "Foreign exchange currency pairs",
            "commodity": "Physical commodities like gold, oil, etc.",
            "index": "Market indices and ETFs",
            "bond": "Government and corporate bonds",
            "derivative": "Options, futures, and other derivatives"
        }
    }

@router.get("/wealth-tiers", summary="Get Wealth Tier Requirements")
def get_wealth_tiers():
    """Get wealth tier requirements and asset unlocks."""
    from core.config import settings
    
    return {
        "wealth_tiers": {
            tier: {
                "threshold": str(threshold),
                "name": tier.replace("_", " ").title()
            }
            for tier, threshold in settings.WEALTH_TIER_THRESHOLDS.items()
        }
    }

@router.get("/market-data", response_model=MarketData, summary="Get Market Overview")
def get_market_data(
    asset_type: Optional[AssetType] = None,
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get current market overview with top assets and events."""
    try:
        db_service = DatabaseService(db)
        
        # Get assets
        if asset_type:
            assets = db_service.get_assets_by_type(asset_type.value)
        else:
            from core.models import Asset as AssetModel
            assets = db.query(AssetModel).filter(
                AssetModel.is_active == True
            ).limit(limit).all()
        
        # Get active market events
        active_events = db_service.get_active_market_events()
        
        # Get market state (simplified for now)
        market_phase = "normal"  # TODO: Implement market phase detection
        market_volatility = 1.0  # TODO: Calculate current market volatility
        
        return MarketData(
            assets=assets,
            market_phase=market_phase,
            market_volatility=market_volatility,
            active_events=active_events
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market data: {str(e)}")

@router.delete("/{asset_id}", response_model=APIResponse, summary="Delete Asset")
def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db)
):
    """Delete an asset (use with caution!)."""
    db_service = DatabaseService(db)
    asset = db_service.get_asset(asset_id)
    
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    try:
        # Check if asset has active positions or orders
        from core.models import Portfolio, Order
        
        portfolio_count = db.query(Portfolio).filter(Portfolio.asset_id == asset_id).count()
        order_count = db.query(Order).filter(Order.asset_id == asset_id).count()
        
        if portfolio_count > 0 or order_count > 0:
            raise HTTPException(
                status_code=400, 
                detail="Cannot delete asset with active positions or orders"
            )
        
        # Delete price history first
        from core.models import PriceHistory
        db.query(PriceHistory).filter(PriceHistory.asset_id == asset_id).delete()
        
        # Delete asset
        db.delete(asset)
        db.commit()
        
        return APIResponse(
            success=True,
            message=f"Asset {asset.symbol} deleted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete asset: {str(e)}")