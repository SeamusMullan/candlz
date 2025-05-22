from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import core modules
from core.database import get_db, create_tables
from core.config import settings
from services.initialization_service import InitializationService

# Import API routers
from api import data, status, players, assets, trading

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Candlz Trading Game Backend...")
    
    # Create database tables
    create_tables()
    print("✅ Database tables created/verified")
    
    # Initialize game data if needed
    try:
        db = next(get_db())
        init_service = InitializationService(db)
        
        # Check if we need to initialize data (no assets exist)
        from core.models import Asset
        asset_count = db.query(Asset).count()
        
        if asset_count == 0:
            print("🔄 Initializing game data...")
            results = init_service.initialize_game_data()
            print(f"✅ Created {results['assets']} assets and {results['achievements']} achievements")
            
            # Create sample price history for demo
            price_points = init_service.create_sample_price_history(days=30)
            print(f"✅ Created {price_points} price history data points")
        else:
            print(f"✅ Game data already initialized ({asset_count} assets found)")
            
        db.close()
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize game data: {e}")
    
    print("🎮 Candlz Trading Game Backend is ready!")
    yield
    
    # Shutdown
    print("👋 Shutting down Candlz Trading Game Backend...")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Candlz Trading Game API",
    description="Backend API for the Candlz incremental trading simulation game",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(data.router, prefix="/api/data", tags=["data"])
app.include_router(status.router, prefix="/api/status", tags=["status"])
app.include_router(players.router, prefix="/api/players", tags=["players"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])

# Root endpoint
@app.get("/")
def read_root():
    """
    Root endpoint providing basic API information.
    """
    return {
        "name": "Candlz Trading Game API",
        "version": "0.1.0",
        "description": "Incremental trading simulation game backend",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "status": "/api/status",
            "data": "/api/data", 
            "players": "/api/players",
            "assets": "/api/assets",
            "trading": "/api/trading"
        }
    }

# Health check endpoint
@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for monitoring.
    """
    try:
        # Test database connection
        from core.database import db_manager
        db_healthy = db_manager.health_check()
        
        if not db_healthy:
            raise HTTPException(status_code=503, detail="Database connection failed")
        
        # Get basic stats
        from core.models import Player, Asset, Order
        player_count = db.query(Player).count()
        asset_count = db.query(Asset).count()
        order_count = db.query(Order).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "stats": {
                "players": player_count,
                "assets": asset_count,
                "orders": order_count
            },
            "timestamp": "2025-01-22T00:00:00Z"  # Will be replaced with actual timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

# Database info endpoint (for development)
@app.get("/debug/database")
def get_database_info(db: Session = Depends(get_db)):
    """
    Get database information for debugging.
    Only available in development mode.
    """
    from core.database import db_manager
    
    try:
        table_info = db_manager.get_table_info()
        return {
            "database_url": settings.DATABASE_URL,
            "tables": table_info,
            "status": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database info error: {str(e)}")

# Initialize database endpoint (for development)
@app.post("/debug/initialize")
def initialize_database(reset: bool = False, db: Session = Depends(get_db)):
    """
    Initialize or reset game database.
    Use with caution - reset=True will delete all data!
    """
    try:
        init_service = InitializationService(db)
        results = init_service.initialize_game_data(reset_existing=reset)
        
        if reset:
            # Also create sample price history
            price_points = init_service.create_sample_price_history(days=30)
            results["price_history_points"] = price_points
        
        return {
            "message": "Database initialized successfully",
            "reset_performed": reset,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Initialization error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload for development
        log_level="info"
    )