from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.schemas import (
    Player, PlayerCreate, PlayerUpdate, PortfolioSummary, 
    PlayerStats, LeaderboardEntry, APIResponse
)
from services.database_service import DatabaseService

router = APIRouter()

@router.post("/", response_model=Player, summary="Create Player")
def create_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db)
):
    """Create a new player account."""
    try:
        db_service = DatabaseService(db)
        
        # Check if username already exists
        existing_player = db_service.get_player_by_username(player_data.username)
        if existing_player:
            raise HTTPException(status_code=400, detail="Username already taken")
        
        player = db_service.create_player(player_data)
        return player
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create player: {str(e)}")

@router.get("/{player_id}", response_model=Player, summary="Get Player")
def get_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Get player information by ID."""
    db_service = DatabaseService(db)
    player = db_service.get_player(player_id)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return player

@router.get("/username/{username}", response_model=Player, summary="Get Player by Username")
def get_player_by_username(
    username: str,
    db: Session = Depends(get_db)
):
    """Get player information by username."""
    db_service = DatabaseService(db)
    player = db_service.get_player_by_username(username)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    return player

@router.put("/{player_id}", response_model=Player, summary="Update Player")
def update_player(
    player_id: int,
    player_update: PlayerUpdate,
    db: Session = Depends(get_db)
):
    """Update player settings."""
    db_service = DatabaseService(db)
    player = db_service.get_player(player_id)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Update fields
    update_data = player_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(player, field, value)
    
    db.commit()
    db.refresh(player)
    
    return player

@router.get("/{player_id}/portfolio", response_model=PortfolioSummary, summary="Get Portfolio")
def get_player_portfolio(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive portfolio summary for a player."""
    db_service = DatabaseService(db)
    player = db_service.get_player(player_id)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        # Update portfolio values first
        db_service.update_player_portfolio_value(player_id)
        
        # Get portfolio summary
        portfolio_summary = db_service.calculate_portfolio_summary(player_id)
        return portfolio_summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get portfolio: {str(e)}")

@router.get("/{player_id}/stats", response_model=PlayerStats, summary="Get Player Statistics")
def get_player_stats(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Get comprehensive player statistics."""
    db_service = DatabaseService(db)
    player = db_service.get_player(player_id)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        stats = db_service.get_player_stats(player_id)
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.post("/{player_id}/update-wealth-tier", response_model=Player, summary="Update Wealth Tier")
def update_wealth_tier(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Update player's wealth tier based on current portfolio value."""
    db_service = DatabaseService(db)
    
    try:
        player = db_service.update_player_wealth_tier(player_id)
        return player
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update wealth tier: {str(e)}")

@router.get("/", response_model=List[LeaderboardEntry], summary="Get Leaderboard")
def get_leaderboard(
    limit: int = Query(default=100, le=1000, ge=1),
    db: Session = Depends(get_db)
):
    """Get player leaderboard ranked by portfolio value."""
    try:
        db_service = DatabaseService(db)
        leaderboard = db_service.get_leaderboard(limit=limit)
        return leaderboard
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get leaderboard: {str(e)}")

@router.delete("/{player_id}", response_model=APIResponse, summary="Delete Player")
def delete_player(
    player_id: int,
    db: Session = Depends(get_db)
):
    """Delete a player account (use with caution!)."""
    db_service = DatabaseService(db)
    player = db_service.get_player(player_id)
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    try:
        # Delete related data first (orders, portfolios, etc.)
        from core.models import Order, Portfolio, PlayerAchievement, TradingAlgorithm, GameState
        
        db.query(Order).filter(Order.player_id == player_id).delete()
        db.query(Portfolio).filter(Portfolio.player_id == player_id).delete()
        db.query(PlayerAchievement).filter(PlayerAchievement.player_id == player_id).delete()
        db.query(TradingAlgorithm).filter(TradingAlgorithm.player_id == player_id).delete()
        db.query(GameState).filter(GameState.player_id == player_id).delete()
        
        # Delete player
        db.delete(player)
        db.commit()
        
        return APIResponse(
            success=True,
            message=f"Player {player.username} deleted successfully"
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete player: {str(e)}")