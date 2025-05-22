# API Reference

This section will document the available APIs for algorithmic trading in candlz.

## Overview

- How to interact with the game backend from your Python algorithms
- Available functions and data structures
- Example usage

## Core API Methods

### Data API

```python
# Get historical prices
data.history(asset, field, bar_count, frequency)

# Get current price
data.current(asset, field)

# Check if data is available
data.can_trade(asset)

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

## Example Usage

```python
def initialize(context):
    context.asset = "BTC"
    context.allocation = 0.1

def handle_data(context, data):
    asset = context.asset
    if not data.history_available(asset, 20):
        return
    prices = data.history(asset, "price", 20, "1d")
    sma_short = prices[-5:].mean()
    sma_long = prices.mean()
    current_position = context.portfolio.positions.get(asset, 0)
    if sma_short > sma_long and current_position == 0:
        order_target_percent(asset, context.allocation)
    elif sma_short < sma_long and current_position > 0:
        order_target_percent(asset, 0)
```
