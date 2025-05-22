# Algorithmic Trading System

One of candlz's most exciting features is the ability to program your own trading algorithms using Python. This document outlines how the algorithmic trading system works in the game.

## Core Concepts

Algorithmic trading in candlz allows players to:

1. **Automate Trading**: Create code that makes trading decisions without manual intervention
2. **Backtest Strategies**: Test algorithms against historical market data
3. **Deploy 24/7**: Keep algorithms running even when not actively playing
4. **Scale Efficiently**: Manage multiple assets and strategies simultaneously
5. **Compete Algorithmically**: Pit your code against other players' algorithms

## Development Environment

The game provides an integrated development environment (IDE) for creating and testing algorithms:

### Key Components

- **Code Editor**: Python editor with syntax highlighting and auto-completion
- **Backtesting Engine**: Test your algorithm against historical data
- **Performance Metrics**: Analyze your algorithm's trading performance
- **Debug Console**: View errors and output from your running algorithm
- **API Documentation**: Built-in reference for all available functions
- **Template Library**: Pre-built strategy templates for beginners

## Algorithm Structure

A basic trading algorithm in candlz consists of two main functions:

```python
def initialize(context):
    """Set up your algorithm and define parameters."""
    # Define which assets to trade
    context.assets = ["AAPL", "MSFT", "BTC", "ETH"]
    
    # Define strategy parameters
    context.sma_short = 20  # 20-day simple moving average
    context.sma_long = 50   # 50-day simple moving average
    
    # Set allocation per trade
    context.allocation = 0.1  # 10% of portfolio per position

def handle_data(context, data):
    """This function runs on each market update."""
    for asset in context.assets:
        # Get price history
        price_history = data.history(asset, "price", context.sma_long, "1d")
        
        # Calculate moving averages
        sma_short = price_history[-context.sma_short:].mean()
        sma_long = price_history.mean()
        
        current_position = context.portfolio.positions.get(asset, 0)
        
        # Trading logic - simple moving average crossover
        if sma_short > sma_long and current_position == 0:
            # Buy signal
            order_target_percent(asset, context.allocation)
            log.info(f"Buying {asset}, Short SMA: {sma_short}, Long SMA: {sma_long}")
            
        elif sma_short < sma_long and current_position > 0:
            # Sell signal
            order_target_percent(asset, 0)
            log.info(f"Selling {asset}, Short SMA: {sma_short}, Long SMA: {sma_long}")
```

## Available APIs

The game provides a comprehensive API for interacting with market data and executing trades:

### Data API

```python
# Get historical prices
data.history(asset, field, bar_count, frequency)

# Get current price
data.current(asset, field)

# Check if data is available
data.can_trade(asset)

# Check if enough historical data is available
data.history_available(asset, bar_count)

# Get asset fundamentals (for stocks)
data.fundamentals(asset, metric)

# Get market sentiment
data.sentiment(asset)
```

### Order API

```python
# Place market order for specific number of shares/units
order(asset, amount)

# Place order to target specific position size
order_target(asset, amount)

# Place order to target position as % of portfolio
order_target_percent(asset, percentage)

# Place order to target specific portfolio value
order_target_value(asset, value)

# Place order for a specific dollar value of an asset
order_value(asset, value)

# Place a limit order
limit_order(asset, amount, price)

# Place a stop order
stop_order(asset, amount, stop_price)
```

### Portfolio API

```python
# Get current portfolio value
context.portfolio.portfolio_value

# Get current cash balance
context.portfolio.cash

# Get current positions
context.portfolio.positions

# Get current position for specific asset
context.portfolio.positions[asset]
```

### Technical Indicators

The game provides built-in technical indicators:

```python
# Moving averages
data.SMA(asset, window)
data.EMA(asset, window)

# Oscillators
data.RSI(asset, window)
data.MACD(asset, fast_window, slow_window, signal_window)

# Volatility indicators
data.Bollinger_Bands(asset, window, num_std_dev)
data.ATR(asset, window)

# Volume indicators
data.OBV(asset, window)
data.Volume_SMA(asset, window)
```

### Logging API

```python
# Log an informational message
log.info(message)
```

## Backtesting System

Before deploying an algorithm, you can test it against historical data:

### Backtesting Features

- **Date Range Selection**: Choose specific historical periods to test
- **Portfolio Settings**: Define starting capital and constraints
- **Performance Metrics**: Analyze returns, drawdowns, Sharpe ratio, etc.
- **Transaction Log**: Review all trades executed by your algorithm
- **Visualization**: Charts of algorithm performance vs. benchmarks
- **Risk Analysis**: Understand the risk profile of your strategy

### Sample Backtest Results

```
Backtest Results: 2023-01-01 to 2023-12-31
--------------------------------------------
Starting Capital: $100,000
Ending Capital: $143,520
Total Return: 43.52%
Annualized Return: 43.52%
Sharpe Ratio: 1.87
Maximum Drawdown: 12.4%
Benchmark Return: 24.8%
Alpha: 18.72%
Beta: 0.82
Number of Trades: 37
Win Rate: 62.2%
```

## Deployment System

Once satisfied with backtesting results, you can deploy your algorithm:

### Deployment Options

- **Paper Trading**: Run your algorithm with simulated money
- **Live Trading**: Connect your algorithm to your actual portfolio
- **Scheduled Running**: Set specific times for your algorithm to trade
- **Continuous Mode**: Run algorithm continuously in the background
- **Alert System**: Receive notifications about algorithm activity

### Resource Management

Algorithms consume in-game computing resources:

- **Basic Tier**: Run 1-2 simple algorithms
- **Standard Tier**: Run 3-5 moderately complex algorithms
- **Premium Tier**: Run 10+ advanced algorithms simultaneously
- **Dedicated Server**: Unlock with higher wealth, run unlimited algorithms

## Algorithm Competitions

Compete with other players in algorithmic trading challenges:

### Competition Types

- **Weekly Challenges**: Fixed starting capital, specific asset set
- **Specialized Competitions**: Focus on specific sectors or strategies
- **Bull/Bear Challenges**: Optimize for specific market conditions
- **Marathon/Sprint**: Long-term or rapid trading competitions

## Learning Progression

The game helps players learn algorithmic trading gradually:

1. **Beginner Templates**: Simple strategies that can be used with minimal changes
2. **Guided Tutorials**: Step-by-step creation of common strategies
3. **Strategy Library**: Collection of classic trading algorithms to study
4. **Community Sharing**: Learn from other players' published strategies
5. **Advanced Challenges**: Puzzle-like scenarios to test algorithm skills

## Real-World Skills Transfer

The skills developed while creating algorithms in candlz can transfer to real-world trading:

- **Python Programming**: Industry-standard language used in actual finance
- **Data Analysis**: Working with time series financial data
- **Strategy Development**: Thinking systematically about market patterns
- **Risk Management**: Understanding leverage, position sizing, and risk metrics
- **Backtesting Methodology**: Learning to evaluate strategies objectively

## Future Expansion

The algorithmic trading system will expand with:

- **Machine Learning Tools**: Implement ML-based trading strategies
- **Natural Language Processing**: Analyze news and social media sentiment
- **Alternative Data**: Incorporate non-traditional data sources
- **Multi-Strategy Frameworks**: Combine multiple algorithms into meta-strategies
- **Inter-Algorithm Communication**: Create systems of algorithms that work together

---

The algorithmic trading system exemplifies candlz's core philosophy: "Money go up" through skill, creativity, and automation rather than just clicking. By developing and deploying successful algorithms, players can watch their virtual wealth grow exponentially while learning valuable real-world skills.
