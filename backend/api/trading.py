from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.schemas import Order, OrderCreate, APIResponse
from core.models import OrderStatus, OrderType, OrderSide
from services.database_service import DatabaseService

router = APIRouter()

@router.post("/orders", response_model=Order, summary="Create Order")
def create_order(
    order_data: OrderCreate,
    player_id: int,
    db: Session = Depends(get_db)
):
    """Create a new trading order."""
    try:
        db_service = DatabaseService(db)
        
        # Validate player exists
        player = db_service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        # Validate asset exists
        asset = db_service.get_asset(order_data.asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Validate order data
        if order_data.order_type in [OrderType.LIMIT, OrderType.STOP_LIMIT] and not order_data.price:
            raise HTTPException(status_code=400, detail="Price required for limit orders")
        
        if order_data.order_type in [OrderType.STOP, OrderType.STOP_LIMIT] and not order_data.stop_price:
            raise HTTPException(status_code=400, detail="Stop price required for stop orders")
        
        # Check cash balance for buy orders
        if order_data.side == OrderSide.BUY:
            order_value = order_data.quantity * (order_data.price or asset.current_price)
            if player.cash_balance < order_value:
                raise HTTPException(status_code=400, detail="Insufficient cash balance")
        
        # Check position size for sell orders
        if order_data.side == OrderSide.SELL:
            position = db_service.get_portfolio_position(player_id, order_data.asset_id)
            if not position or position.quantity < order_data.quantity:
                raise HTTPException(status_code=400, detail="Insufficient position size")
        
        # Create order
        order = db_service.create_order(player_id, order_data)
        
        # For market orders, execute immediately
        if order_data.order_type == OrderType.MARKET:
            try:
                executed_order = db_service.execute_order(order.id, asset.current_price)
                return executed_order
            except Exception as e:
                # If execution fails, cancel the order
                order.status = OrderStatus.REJECTED.value
                db.commit()
                raise HTTPException(status_code=400, detail=f"Order execution failed: {str(e)}")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@router.get("/orders/{player_id}", response_model=List[Order], summary="Get Player Orders")
def get_player_orders(
    player_id: int,
    status: Optional[OrderStatus] = None,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get orders for a specific player."""
    try:
        db_service = DatabaseService(db)
        
        # Validate player exists
        player = db_service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        orders = db_service.get_player_orders(player_id, status, limit)
        return orders
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get orders: {str(e)}")

@router.get("/orders/order/{order_id}", response_model=Order, summary="Get Order")
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Get specific order details."""
    try:
        from core.models import Order as OrderModel
        order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return order
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order: {str(e)}")

@router.post("/orders/{order_id}/cancel", response_model=APIResponse, summary="Cancel Order")
def cancel_order(
    order_id: int,
    player_id: int,
    db: Session = Depends(get_db)
):
    """Cancel a pending order."""
    try:
        from core.models import Order as OrderModel
        
        order = db.query(OrderModel).filter(
            OrderModel.id == order_id,
            OrderModel.player_id == player_id
        ).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        if order.status != OrderStatus.PENDING.value:
            raise HTTPException(status_code=400, detail="Can only cancel pending orders")
        
        order.status = OrderStatus.CANCELLED.value
        db.commit()
        
        return APIResponse(
            success=True,
            message="Order cancelled successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to cancel order: {str(e)}")

@router.post("/orders/{order_id}/execute", response_model=Order, summary="Execute Order")
def execute_order(
    order_id: int,
    fill_price: Decimal,
    fill_quantity: Optional[Decimal] = None,
    db: Session = Depends(get_db)
):
    """Execute a pending order (admin/system use)."""
    try:
        db_service = DatabaseService(db)
        
        executed_order = db_service.execute_order(order_id, fill_price, fill_quantity)
        return executed_order
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute order: {str(e)}")

@router.get("/orders/pending", response_model=List[Order], summary="Get All Pending Orders")
def get_pending_orders(
    limit: int = Query(default=1000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """Get all pending orders across all players (admin/system use)."""
    try:
        db_service = DatabaseService(db)
        orders = db_service.get_pending_orders()
        return orders[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pending orders: {str(e)}")

@router.get("/order-types", summary="Get Order Types")
def get_order_types():
    """Get available order types and their descriptions."""
    return {
        "order_types": {
            "market": "Execute immediately at current market price",
            "limit": "Execute only at specified price or better",
            "stop": "Execute as market order when stop price is reached",
            "stop_limit": "Execute as limit order when stop price is reached"
        },
        "order_sides": {
            "buy": "Purchase an asset",
            "sell": "Sell an asset from portfolio"
        },
        "order_statuses": {
            "pending": "Order created but not yet executed",
            "filled": "Order completely executed",
            "partially_filled": "Order partially executed",
            "cancelled": "Order cancelled by user",
            "rejected": "Order rejected by system"
        }
    }

@router.post("/simulate-order", summary="Simulate Order")
def simulate_order(
    order_data: OrderCreate,
    player_id: int,
    db: Session = Depends(get_db)
):
    """Simulate an order without actually placing it."""
    try:
        db_service = DatabaseService(db)
        
        # Validate player and asset
        player = db_service.get_player(player_id)
        if not player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        asset = db_service.get_asset(order_data.asset_id)
        if not asset:
            raise HTTPException(status_code=404, detail="Asset not found")
        
        # Calculate order value
        execution_price = order_data.price or asset.current_price
        order_value = order_data.quantity * execution_price
        commission = order_value * Decimal("0.001")  # Use default commission rate
        
        # Check feasibility
        feasible = True
        errors = []
        
        if order_data.side == OrderSide.BUY:
            total_cost = order_value + commission
            if player.cash_balance < total_cost:
                feasible = False
                errors.append("Insufficient cash balance")
        else:
            position = db_service.get_portfolio_position(player_id, order_data.asset_id)
            if not position or position.quantity < order_data.quantity:
                feasible = False
                errors.append("Insufficient position size")
        
        return {
            "feasible": feasible,
            "errors": errors,
            "simulation": {
                "execution_price": execution_price,
                "order_value": order_value,
                "commission": commission,
                "total_cost": order_value + commission if order_data.side == OrderSide.BUY else order_value - commission,
                "remaining_cash": player.cash_balance - (order_value + commission) if order_data.side == OrderSide.BUY else player.cash_balance + (order_value - commission)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to simulate order: {str(e)}")

@router.get("/market-hours", summary="Get Market Hours")
def get_market_hours():
    """Get market trading hours and status."""
    # Simplified - in a real implementation, this would check actual market hours
    return {
        "market_open": True,  # Game markets are always open
        "next_close": None,
        "next_open": None,
        "timezone": "UTC",
        "note": "Game markets operate 24/7"
    }