# Algorithm Basics

One of the most exciting features of candlz is the ability to create your own trading algorithms. This guide will introduce you to the basics of algorithmic trading in the game.

## Getting Started with Algorithms

### What is Algorithmic Trading?

Algorithmic trading uses computer programs to automatically execute trades based on predefined rules. In candlz, you can write algorithms that analyze market data and execute trades without your direct intervention, allowing your virtual portfolio to grow even while you're away from the game.

### Why Use Algorithms?

- **24/7 Trading**: Algorithms can trade around the clock
- **Emotion-Free Decisions**: Remove fear and greed from trading
- **Complex Strategies**: Implement strategies too complex for manual execution
- **Backtesting**: Test strategies against historical data
- **Scalability**: Manage multiple assets simultaneously

## The Algorithm Lab

Access the Algorithm Lab from the main menu to begin creating your trading bots:

### Interface Components

- **Code Editor**: Where you write your algorithm code
- **Backtesting Panel**: Test your algorithm against historical data
- **Performance Metrics**: View statistics about your algorithm's performance
- **Deployment Manager**: Activate algorithms with your actual portfolio

## Programming Fundamentals

### Language and Environment

candlz uses Python for algorithm development, providing a powerful yet accessible language with extensive libraries:

```python
# Basic algorithm structure
def initialize(context):
    # Set up your algorithm parameters
    context.asset = "BTC"
    context.sma_short_period = 5
    context.sma_long_period = 20
    context.allocation = 0.1  # 10% of portfolio

def handle_data(context, data):
    # This function runs on each market update
    asset = context.asset
    
    # Skip if we don't have enough data yet
    if not data.history_available(asset, context.sma_long_period):
        return
    
    # Get price history
    prices = data.history(asset, "price", context.sma_long_period, "1d")
    
    # Calculate moving averages
    sma_short = prices[-context.sma_short_period:].mean()
    sma_long = prices.mean()
    
    current_position = context.portfolio.positions.get(asset, 0)
    
    # Trading logic
    if sma_short > sma_long and current_position == 0:
        # Bullish crossover - buy signal
        cash_to_spend = context.portfolio.cash * context.allocation
        context.order_value(asset, cash_to_spend)
        log.info(f"Buying {asset} with ${cash_to_spend}")
    
    elif sma_short < sma_long and current_position > 0:
        # Bearish crossover - sell signal
        context.order_target(asset, 0)
        log.info(f"Selling all {asset}")
```

### Key API Modules

Your algorithms will use the candlz API, which includes:

- **data**: Access to market data, prices, and indicators
- **context**: Store your algorithm's state and configuration
- **portfolio**: Information about your current holdings
- **order**: Functions to place different types of orders
- **log**: Logging functions for debugging

## Common Trading Strategies

Here are some simple strategies to get you started:

### Moving Average Crossover

Buy when a short-term moving average crosses above a long-term moving average, and sell when it crosses below.

### Mean Reversion

Buy when an asset's price is significantly below its historical average, assuming it will return to the mean.

### Momentum

Buy assets that have been trending upward and sell those trending downward, assuming the trend will continue.

### Dollar-Cost Averaging

Automatically buy a fixed dollar amount of an asset at regular intervals, regardless of price.

## Testing Your Algorithm

Before risking your virtual capital, always test your algorithm:

### Backtesting

Run your algorithm against historical data to see how it would have performed:

1. Select the assets your algorithm will trade
2. Choose a historical time period
3. Set initial capital amount
4. Run the backtest and analyze results

### Performance Metrics

Evaluate your algorithm using these key metrics:

- **Total Return**: Overall percentage gain/loss
- **Sharpe Ratio**: Return relative to risk
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades

## Deploying Your Algorithm

When you're satisfied with your algorithm's performance:

1. From the Algorithm Lab, select your algorithm
2. Click "Deploy"
3. Set parameters:
   - Trading frequency
   - Portfolio allocation limit
   - Risk limits
4. Confirm deployment

Your algorithm will now trade automatically according to your strategy!

## Algorithm Limitations by Level

As you progress in the game, you'll gain access to more powerful algorithm features:

| Level | Capabilities |
|-------|--------------|
| 1     | Basic buy/sell orders, 5 assets maximum, daily trading |
| 5     | Limit orders, 10 assets, hourly trading |
| 10    | All order types, 20 assets, custom indicators |
| 20    | Advanced risk management, unlimited assets, minute-by-minute trading |
| 30+   | Machine learning capabilities, custom assets, predictive analytics |

## Next Steps

To advance your algorithmic trading skills:

- Explore the complete [API Reference](api-reference.md)
- Study [Strategy Examples](strategy-examples.md) for inspiration
- Learn [Advanced Techniques](advanced-techniques.md) for optimization
- Use the [Testing Framework](testing-framework.md) for robust algorithm validation
