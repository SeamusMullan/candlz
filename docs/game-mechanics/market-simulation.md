# Market Simulation

The candlz market simulation engine is the heart of the game, creating a dynamic, realistic trading environment that responds to both player actions and simulated market forces.

## Simulation Architecture

### Real-World Patterns with a Twist

The candlz market simulator uses real-world market data patterns as a baseline but introduces unique elements to create an engaging game experience:

1. **Historical Pattern Mapping**: Assets follow patterns similar to real-world counterparts
2. **Dynamic Volatility**: Market volatility changes based on game events and player progression
3. **Accelerated Timeframes**: Experience years of market movements in hours or days
4. **Player Impact**: Large trades can influence market prices, especially in smaller markets

### Time Progression

The game allows you to control time progression:

- **Real-time**: 1 minute in real life = 1 minute in the game
- **Accelerated**: 1 minute in real life = 1 hour in the game
- **Hyper-speed**: 1 minute in real life = 1 day in the game

As your wealth grows, you'll unlock even faster time progression options.

## Market Cycles

### Bull and Bear Markets

Just like real markets, candlz experiences extended periods of growth (bull markets) and decline (bear markets):

- **Bull Markets**: Assets tend to increase in value, investor sentiment is positive
- **Bear Markets**: Assets tend to decrease in value, investor sentiment is negative

These cycles can last for in-game weeks, months, or even years, requiring different strategies.

### Economic Indicators

The game generates economic indicators that influence market behaviors:

- **GDP Growth**: Affects overall market confidence
- **Unemployment Rate**: Impacts consumer stocks
- **Interest Rates**: Affects borrowing costs and bond yields
- **Inflation**: Reduces the value of cash and impacts different assets

These indicators are displayed in the "Economy" panel and updated regularly based on game events.

## Market Events

### Scheduled Events

Certain events occur on a regular schedule:

- **Earnings Reports**: Companies release quarterly earnings
- **Economic Data Releases**: Monthly or quarterly economic statistics
- **Dividend Payments**: Regular payments to shareholders
- **Stock Splits**: Division of existing shares into multiple shares

### Random Events

The game also generates unexpected events:

- **Market Crashes**: Sudden, significant drops across multiple assets
- **Bubbles**: Rapid price increases followed by dramatic collapses
- **Technological Breakthroughs**: Create new investment opportunities
- **Regulatory Changes**: Alter the rules for certain markets
- **Natural Disasters**: Impact specific industries or regions

Events become more frequent and impactful as you accumulate more wealth, creating new challenges as you progress.

## Market Depth and Liquidity

### Order Book Simulation

Each market has a simulated order book representing all buy and sell orders:

- **Bid-Ask Spread**: The difference between the highest buy price and lowest sell price
- **Market Depth**: The volume of orders at different price levels
- **Slippage**: Large orders may execute at progressively worse prices

### Liquidity Differences

Different assets have varying levels of liquidity:

- **Blue-chip Stocks**: Highly liquid, minimal slippage
- **Small-cap Stocks**: Lower liquidity, higher spread, more slippage
- **Major Cryptocurrencies**: Generally liquid but volatile
- **Minor Cryptocurrencies**: Much lower liquidity, high volatility

Trading large volumes in less liquid assets will significantly impact their price, creating both risks and opportunities.

## Market Manipulation Detection

### Anti-Cheating Measures

The simulation actively detects and penalizes attempts to manipulate markets:

- **Pump and Dump Detection**: Monitors for coordinated buying and selling
- **Wash Trading**: Identifies simultaneous buying and selling to generate fake volume
- **Artificial Price Movements**: Detects unnatural price patterns

Violating these rules can result in penalties, including fines, trading restrictions, or even account bans from the leaderboards.

## Advanced Simulation Features

### Unlock Progressive Complexity

As your portfolio grows, new simulation features unlock:

| Portfolio Value | Features Unlocked |
|-----------------|-------------------|
| $100,000        | Options Trading   |
| $1,000,000      | Futures Contracts |
| $10,000,000     | Dark Pools        |
| $100,000,000    | Market Making     |
| $1,000,000,000  | Custom Asset Creation |

Each new feature introduces new mechanics and opportunities for profit.

## Next Steps

To deepen your understanding of the simulation:

- Learn about the different [Asset Types](asset-types.md)
- Explore how [Economic Events](economic-events.md) impact markets
- Understand the [Progression System](progression-system.md) to unlock more features
