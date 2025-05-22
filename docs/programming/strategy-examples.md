# Strategy Examples

This page provides example trading algorithms and strategies you can use or modify in candlz.

## Example 1: Simple Moving Average Crossover

This classic strategy buys when a short-term moving average crosses above a long-term moving average, and sells when it crosses below.

```python
def initialize(context):
    context.asset = "BTC"
    context.sma_short = 5
    context.sma_long = 20
    context.allocation = 0.2

def handle_data(context, data):
    asset = context.asset
    if not data.history_available(asset, context.sma_long):
        return
    prices = data.history(asset, "price", context.sma_long, "1d")
    sma_short = prices[-context.sma_short:].mean()
    sma_long = prices.mean()
    current_position = context.portfolio.positions.get(asset, 0)
    if sma_short > sma_long and current_position == 0:
        order_target_percent(asset, context.allocation)
    elif sma_short < sma_long and current_position > 0:
        order_target_percent(asset, 0)
```

This strategy works best in trending markets and may underperform in sideways markets.

## Example 2: Momentum Trading

This strategy buys assets that have shown strong recent performance, betting that the trend will continue.

```python
def initialize(context):
    context.asset = "ETH"
    context.lookback = 10
    context.allocation = 0.15

def handle_data(context, data):
    asset = context.asset
    if not data.history_available(asset, context.lookback):
        return
    prices = data.history(asset, "price", context.lookback, "1d")
    returns = prices.pct_change().dropna()
    momentum = returns.sum()
    current_position = context.portfolio.positions.get(asset, 0)
    if momentum > 0.05 and current_position == 0:
        order_target_percent(asset, context.allocation)
    elif momentum < 0 and current_position > 0:
        order_target_percent(asset, 0)
```

Momentum strategies can be effective in strong markets but may be whipsawed during reversals.

## Example 3: Mean Reversion

This strategy buys when an asset's price is significantly below its recent average, expecting it to revert to the mean.

```python
def initialize(context):
    context.asset = "AAPL"
    context.window = 15
    context.threshold = -0.04  # 4% below mean
    context.allocation = 0.1

def handle_data(context, data):
    asset = context.asset
    if not data.history_available(asset, context.window):
        return
    prices = data.history(asset, "price", context.window, "1d")
    mean = prices.mean()
    deviation = (prices[-1] - mean) / mean
    current_position = context.portfolio.positions.get(asset, 0)
    if deviation < context.threshold and current_position == 0:
        order_target_percent(asset, context.allocation)
    elif deviation > 0 and current_position > 0:
        order_target_percent(asset, 0)
```

Mean reversion works best in range-bound markets and may underperform during strong trends.
