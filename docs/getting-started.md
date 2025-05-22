# Getting Started with candlz

This guide will walk you through the process of installing candlz, setting up your first trading account, and beginning your journey to financial domination.

## System Requirements

- **Operating Systems**: Windows 10+ / macOS 10.15+ / Ubuntu 18.04+
- **RAM**: 4GB minimum (8GB recommended for algorithmic trading)
- **Storage**: 500MB for application + storage for market data and algorithms
- **Internet**: Connection required for leaderboards and updates (offline play available)

## Installation

### macOS

1. Download the latest candlz.dmg from our [releases page](https://github.com/seamusmullan/candlz/releases)
2. Open the .dmg file and drag candlz to your Applications folder
3. Launch candlz from your Applications folder

### Windows

1. Download the latest candlz-Setup.exe from our [releases page](https://github.com/seamusmullan/candlz/releases)
2. Run the installer and follow the on-screen instructions
3. Launch candlz from the Start menu

### Linux

```bash
# Add our PPA
sudo add-apt-repository ppa:candlz/stable
sudo apt update

# Install candlz
sudo apt install candlz-desktop
```

## Creating Your First Trading Account

When you first launch candlz, you'll be guided through a setup wizard:

1. **Create Account**: Choose a username for the leaderboards
2. **Select Difficulty**:
   - **Casual**: Start with $100,000 and reduced market volatility
   - **Standard**: Start with $50,000 and normal market conditions
   - **Hardcore**: Start with $10,000 and increased volatility
3. **Tutorial Option**: Choose whether to complete the guided tutorial

## The Trading Interface

The main trading interface consists of:

1. **Portfolio Overview**: Your total assets, cash balance, and recent performance
2. **Market View**: Live charts and market data for all available assets
3. **Order Panel**: Place buy/sell orders for your selected assets
4. **News Feed**: Market news and events that affect asset prices
5. **Algorithm Lab**: Create and manage your trading bots

## Making Your First Trade

1. In the Market View, browse through available stocks and cryptocurrencies
2. Select an asset to view its chart and statistics
3. Click "Buy" to open the order form
4. Select order type (Market or Limit)
5. Enter the amount you want to invest or the number of shares/tokens
6. Confirm your order and watch it execute in real-time

## Creating Your First Trading Bot

1. Navigate to the "Algorithm Lab" section
2. Click "New Algorithm" to open the code editor
3. Choose a template or start from scratch
4. Use our Python API to define your trading strategy
5. Test your algorithm in the sandbox with historical data
6. Once satisfied, deploy it to trade with virtual funds

Look at some sample python code for our API

```python
from candlz.api import Market, Portfolio, Order

# Simple moving average crossover strategy
def run(market, portfolio):
    asset = "BTC"
    
    # Get historical prices
    prices = market.get_price_history(asset, days=30)
    
    # Calculate moving averages
    sma_short = calculate_sma(prices, 5)
    sma_long = calculate_sma(prices, 20)
    
    # Generate trading signal
    if sma_short > sma_long and not portfolio.has_position(asset):
        # Buy signal
        cash = portfolio.get_cash() * 0.1  # Use 10% of available cash
        Order.market_buy(asset, cash_amount=cash)
        
    elif sma_short < sma_long and portfolio.has_position(asset):
        # Sell signal
        position = portfolio.get_position(asset)
        Order.market_sell(asset, quantity=position.quantity)
        
def calculate_sma(prices, window):
    return sum(prices[-window:]) / window
```

## Next Steps

- Learn about [Trading Basics](game-mechanics/trading-basics.md) to understand market mechanics
- Explore different [Asset Types](game-mechanics/asset-types.md) to diversify your portfolio
- Dive into [Algorithm Basics](programming/algorithm-basics.md) to automate your trading
- Check the [Leaderboards](features/leaderboards.md) to see how you stack up against other players

Remember: The goal is to make your money go up! Happy trading!
