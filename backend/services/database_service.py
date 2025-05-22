from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_, or_, func
from core.models import (
    Player, Asset, Portfolio, Order, PriceHistory, MarketEvent,
    Achievement, PlayerAchievement, TradingAlgorithm, GameState,
    OrderStatus, WealthTier
)
from core.schemas import (
    PlayerCreate, AssetCreate, OrderCreate, PortfolioSummary,
    PlayerStats, LeaderboardEntry
)
from core.config import settings

class DatabaseService:
    """
    Service layer for database operations.
    Provides high-level methods for common database tasks.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    # Player operations
    def create_player(self, player_data: PlayerCreate) -> Player:
        """Create a new player with initial game state."""
        player = Player(
            username=player_data.username,
            starting_capital=player_data.starting_capital,
            cash_balance=player_data.starting_capital,
            current_portfolio_value=player_data.starting_capital
        )
        
        self.db.add(player)
        self.db.commit()
        self.db.refresh(player)
        
        # Create initial game state
        game_state = GameState(
            player_id=player.id,
            game_time=datetime.utcnow(),
            settings={},
            statistics={}
        )
        self.db.add(game_state)
        self.db.commit()
        
        return player
    
    def get_player(self, player_id: int) -> Optional[Player]:
        """Get player by ID."""
        return self.db.query(Player).filter(Player.id == player_id).first()
    
    def get_player_by_username(self, username: str) -> Optional[Player]:
        """Get player by username."""
        return self.db.query(Player).filter(Player.username == username).first()
    
    def update_player_wealth_tier(self, player_id: int) -> Player:
        """Update player's wealth tier based on current portfolio value."""
        player = self.get_player(player_id)
        if not player:
            raise ValueError(f"Player {player_id} not found")
        
        portfolio_value = player.current_portfolio_value
        
        # Determine new wealth tier
        new_tier = WealthTier.RETAIL_TRADER
        for tier, threshold in settings.WEALTH_TIER_THRESHOLDS.items():
            if portfolio_value >= threshold:
                new_tier = WealthTier(tier)
        
        if player.wealth_tier != new_tier.value:
            player.wealth_tier = new_tier.value
            self.db.commit()
            self.db.refresh(player)
        
        return player
    
    # Asset operations
    def create_asset(self, asset_data: AssetCreate) -> Asset:
        """Create a new tradeable asset."""
        asset = Asset(**asset_data.model_dump())
        self.db.add(asset)
        self.db.commit()
        self.db.refresh(asset)
        return asset
    
    def get_asset(self, asset_id: int) -> Optional[Asset]:
        """Get asset by ID."""
        return self.db.query(Asset).filter(Asset.id == asset_id).first()
    
    def get_asset_by_symbol(self, symbol: str) -> Optional[Asset]:
        """Get asset by symbol."""
        return self.db.query(Asset).filter(Asset.symbol == symbol).first()
    
    def get_assets_by_type(self, asset_type: str) -> List[Asset]:
        """Get all assets of a specific type."""
        return self.db.query(Asset).filter(Asset.asset_type == asset_type).all()
    
    def get_available_assets(self, wealth_tier: WealthTier) -> List[Asset]:
        """Get assets available for a specific wealth tier."""
        tier_order = list(settings.WEALTH_TIER_THRESHOLDS.keys())
        available_tiers = tier_order[:tier_order.index(wealth_tier.value) + 1]
        
        return self.db.query(Asset).filter(
            and_(
                Asset.is_active == True,
                Asset.unlocked_at_tier.in_(available_tiers)
            )
        ).all()
    
    def update_asset_price(self, asset_id: int, new_price: Decimal) -> Asset:
        """Update asset's current price."""
        asset = self.get_asset(asset_id)
        if asset:
            asset.current_price = new_price
            asset.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(asset)
        return asset
    
    # Portfolio operations
    def get_player_portfolio(self, player_id: int) -> List[Portfolio]:
        """Get all portfolio positions for a player."""
        return self.db.query(Portfolio).filter(
            Portfolio.player_id == player_id
        ).all()
    
    def get_portfolio_position(self, player_id: int, asset_id: int) -> Optional[Portfolio]:
        """Get specific portfolio position."""
        return self.db.query(Portfolio).filter(
            and_(
                Portfolio.player_id == player_id,
                Portfolio.asset_id == asset_id
            )
        ).first()
    
    def update_portfolio_position(
        self, 
        player_id: int, 
        asset_id: int, 
        quantity_change: Decimal, 
        price: Decimal,
        is_buy: bool
    ) -> Portfolio:
        """Update or create portfolio position after a trade."""
        position = self.get_portfolio_position(player_id, asset_id)
        
        if not position:
            # Create new position
            if quantity_change <= 0:
                raise ValueError("Cannot create position with zero or negative quantity")
            
            position = Portfolio(
                player_id=player_id,
                asset_id=asset_id,
                quantity=quantity_change,
                avg_purchase_price=price,
                total_invested=quantity_change * price
            )
            self.db.add(position)
        else:
            # Update existing position
            if is_buy:
                # Add to position
                new_total_invested = position.total_invested + (quantity_change * price)
                new_quantity = position.quantity + quantity_change
                position.avg_purchase_price = new_total_invested / new_quantity
                position.quantity = new_quantity
                position.total_invested = new_total_invested
            else:
                # Sell from position
                if quantity_change > position.quantity:
                    raise ValueError("Cannot sell more than current position")
                
                # Calculate realized P&L
                realized_pnl = quantity_change * (price - position.avg_purchase_price)
                position.realized_pnl += realized_pnl
                position.quantity -= quantity_change
                position.total_invested -= quantity_change * position.avg_purchase_price
                
                # Remove position if quantity becomes zero
                if position.quantity == 0:
                    self.db.delete(position)
                    self.db.commit()
                    return None
        
        position.last_updated = datetime.utcnow()
        self.db.commit()
        self.db.refresh(position)
        return position
    
    def calculate_portfolio_summary(self, player_id: int) -> PortfolioSummary:
        """Calculate comprehensive portfolio summary."""
        positions = self.get_player_portfolio(player_id)
        player = self.get_player(player_id)
        
        total_value = Decimal('0')
        total_invested = Decimal('0')
        total_pnl = Decimal('0')
        
        for position in positions:
            asset = self.get_asset(position.asset_id)
            if asset:
                current_value = position.quantity * asset.current_price
                position.current_value = current_value
                position.unrealized_pnl = current_value - position.total_invested
                
                total_value += current_value
                total_invested += position.total_invested
                total_pnl += position.unrealized_pnl + position.realized_pnl
        
        # Include cash balance
        total_value += player.cash_balance
        
        # Calculate percentage return
        total_pnl_pct = (total_pnl / total_invested * 100) if total_invested > 0 else Decimal('0')
        
        return PortfolioSummary(
            total_value=total_value,
            total_invested=total_invested,
            total_pnl=total_pnl,
            total_pnl_pct=total_pnl_pct,
            cash_balance=player.cash_balance,
            positions=positions
        )
    
    # Order operations
    def create_order(self, player_id: int, order_data: OrderCreate) -> Order:
        """Create a new trading order."""
        order = Order(
            player_id=player_id,
            **order_data.model_dump()
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order
    
    def get_player_orders(
        self, 
        player_id: int, 
        status: Optional[OrderStatus] = None,
        limit: int = 100
    ) -> List[Order]:
        """Get player's orders, optionally filtered by status."""
        query = self.db.query(Order).filter(Order.player_id == player_id)
        
        if status:
            query = query.filter(Order.status == status.value)
        
        return query.order_by(desc(Order.created_at)).limit(limit).all()
    
    def get_pending_orders(self) -> List[Order]:
        """Get all pending orders across all players."""
        return self.db.query(Order).filter(
            Order.status == OrderStatus.PENDING.value
        ).all()
    
    def execute_order(
        self, 
        order_id: int, 
        fill_price: Decimal, 
        fill_quantity: Optional[Decimal] = None
    ) -> Order:
        """Execute an order (fully or partially)."""
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order {order_id} not found")
        
        if order.status != OrderStatus.PENDING.value:
            raise ValueError(f"Order {order_id} is not pending")
        
        fill_qty = fill_quantity or order.quantity
        
        # Update order
        order.filled_quantity += fill_qty
        order.avg_fill_price = fill_price
        order.executed_at = datetime.utcnow()
        
        # Calculate commission
        commission = fill_qty * fill_price * settings.DEFAULT_COMMISSION_RATE
        order.commission += commission
        
        # Update status
        if order.filled_quantity >= order.quantity:
            order.status = OrderStatus.FILLED.value
        else:
            order.status = OrderStatus.PARTIALLY_FILLED.value
        
        # Update player cash and portfolio
        player = self.get_player(order.player_id)
        is_buy = order.side == "buy"
        
        if is_buy:
            total_cost = fill_qty * fill_price + commission
            if player.cash_balance < total_cost:
                raise ValueError("Insufficient cash balance")
            player.cash_balance -= total_cost
        else:
            total_proceeds = fill_qty * fill_price - commission
            player.cash_balance += total_proceeds
        
        # Update portfolio position
        self.update_portfolio_position(
            order.player_id, 
            order.asset_id, 
            fill_qty, 
            fill_price, 
            is_buy
        )
        
        self.db.commit()
        self.db.refresh(order)
        return order
    
    # Statistics and analytics
    def get_player_stats(self, player_id: int) -> PlayerStats:
        """Calculate comprehensive player statistics."""
        orders = self.db.query(Order).filter(
            and_(
                Order.player_id == player_id,
                Order.status == OrderStatus.FILLED.value
            )
        ).all()
        
        total_trades = len(orders)
        winning_trades = 0
        total_pnl = Decimal('0')
        best_trade = Decimal('0')
        worst_trade = Decimal('0')
        
        # Calculate trade statistics
        for order in orders:
            if order.side == "sell":  # Only count sell orders for P&L
                position = self.get_portfolio_position(player_id, order.asset_id)
                if position:
                    trade_pnl = order.filled_quantity * (
                        order.avg_fill_price - position.avg_purchase_price
                    )
                    total_pnl += trade_pnl
                    
                    if trade_pnl > 0:
                        winning_trades += 1
                    
                    best_trade = max(best_trade, trade_pnl)
                    worst_trade = min(worst_trade, trade_pnl)
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else Decimal('0')
        
        # Get player info
        player = self.get_player(player_id)
        days_played = (datetime.utcnow() - player.created_at).days + 1
        
        # Count achievements
        achievements_count = self.db.query(PlayerAchievement).filter(
            PlayerAchievement.player_id == player_id
        ).count()
        
        return PlayerStats(
            total_trades=total_trades,
            winning_trades=winning_trades,
            win_rate=win_rate,
            total_pnl=total_pnl,
            best_trade=best_trade,
            worst_trade=worst_trade,
            sharpe_ratio=None,  # TODO: Calculate Sharpe ratio
            max_drawdown=Decimal('0'),  # TODO: Calculate max drawdown
            days_played=days_played,
            achievements_unlocked=achievements_count
        )
    
    def get_leaderboard(self, limit: int = 100) -> List[LeaderboardEntry]:
        """Get player leaderboard by portfolio value."""
        results = self.db.query(Player).order_by(
            desc(Player.current_portfolio_value)
        ).limit(limit).all()
        
        leaderboard = []
        for rank, player in enumerate(results, 1):
            pnl_pct = ((player.current_portfolio_value - player.starting_capital) / 
                      player.starting_capital * 100)
            
            leaderboard.append(LeaderboardEntry(
                player_id=player.id,
                username=player.username,
                portfolio_value=player.current_portfolio_value,
                pnl_pct=pnl_pct,
                wealth_tier=WealthTier(player.wealth_tier),
                rank=rank
            ))
        
        return leaderboard
    
    # Price history operations
    def add_price_data(self, asset_id: int, price_data: dict) -> PriceHistory:
        """Add new price history data point."""
        price_history = PriceHistory(
            asset_id=asset_id,
            **price_data
        )
        self.db.add(price_history)
        self.db.commit()
        self.db.refresh(price_history)
        return price_history
    
    def get_price_history(
        self, 
        asset_id: int, 
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 1000
    ) -> List[PriceHistory]:
        """Get price history for an asset."""
        query = self.db.query(PriceHistory).filter(PriceHistory.asset_id == asset_id)
        
        if start_time:
            query = query.filter(PriceHistory.timestamp >= start_time)
        if end_time:
            query = query.filter(PriceHistory.timestamp <= end_time)
        
        return query.order_by(desc(PriceHistory.timestamp)).limit(limit).all()
    
    # Market events
    def create_market_event(self, event_data: dict) -> MarketEvent:
        """Create a new market event."""
        event = MarketEvent(**event_data)
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
    
    def get_active_market_events(self) -> List[MarketEvent]:
        """Get currently active market events."""
        now = datetime.utcnow()
        return self.db.query(MarketEvent).filter(
            and_(
                MarketEvent.scheduled_time <= now,
                MarketEvent.is_processed == False
            )
        ).all()
    
    # Utility methods
    def update_player_portfolio_value(self, player_id: int) -> Player:
        """Recalculate and update player's total portfolio value."""
        summary = self.calculate_portfolio_summary(player_id)
        player = self.get_player(player_id)
        
        player.current_portfolio_value = summary.total_value
        self.db.commit()
        self.db.refresh(player)
        
        return player