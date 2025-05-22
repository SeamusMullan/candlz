from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.database_service import DatabaseService

router = APIRouter()

@router.get("/")
def data_root():
    """Data management API root endpoint."""
    return {
        "message": "Data management endpoint",
        "endpoints": {
            "export": "/export",
            "import": "/import",
            "backup": "/backup",
            "restore": "/restore"
        }
    }

@router.get("/export/{player_id}")
def export_player_data(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Export all player data for backup or transfer."""
    try:
        db_service = DatabaseService(db)
        player = db_service.get_player(player_id)
        
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Get comprehensive player data
        portfolio = db_service.get_player_portfolio(player_id)
        orders = db_service.get_player_orders(player_id, limit=10000)
        stats = db_service.get_player_stats(player_id)
        
        # Get achievements
        from core.models import PlayerAchievement
        achievements = db.query(PlayerAchievement).filter(
            PlayerAchievement.player_id == player_id
        ).all()
        
        # Get algorithms
        from core.models import TradingAlgorithm
        algorithms = db.query(TradingAlgorithm).filter(
            TradingAlgorithm.player_id == player_id
        ).all()
        
        return {
            "player": player,
            "portfolio": portfolio,
            "orders": orders,
            "stats": stats,
            "achievements": achievements,
            "algorithms": algorithms,
            "export_timestamp": "2025-01-22T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")

@router.get("/stats/database")
def get_database_stats(db: Session = Depends(get_db)):
    """Get comprehensive database statistics."""
    try:
        from core.models import Player, Asset, Order, Portfolio, Achievement, PlayerAchievement
        
        stats = {
            "players": {
                "total": db.query(Player).count(),
                "by_wealth_tier": {}
            },
            "assets": {
                "total": db.query(Asset).count(),
                "by_type": {}
            },
            "trading": {
                "total_orders": db.query(Order).count(),
                "pending_orders": db.query(Order).filter(Order.status == "pending").count(),
                "filled_orders": db.query(Order).filter(Order.status == "filled").count(),
                "total_positions": db.query(Portfolio).count()
            },
            "achievements": {
                "total": db.query(Achievement).count(),
                "unlocked": db.query(PlayerAchievement).count()
            }
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
