# Game Design Document

## Game Concept

**candlz** is a trading simulation game that combines real-world market dynamics with incremental game mechanics to create a compelling "number go up" experience. Players start with a small amount of capital and grow their wealth through strategic trading of stocks and cryptocurrencies, with the ultimate goal of reaching astronomical wealth levels and climbing to the top of global leaderboards.

## Core Gameplay Loop

### Primary Loop
1. **Trade assets** using market analysis and timing
2. **Earn profits** from successful trades
3. **Unlock new features** with increasing wealth
4. **Scale up** trading operations and capital
5. **Optimize strategies** to maximize returns

### Secondary Loops
1. **Algorithm Development**: Create, test and deploy trading bots
2. **Market Event Response**: React to simulated news and market shifts
3. **Achievement Hunting**: Complete challenges and milestones
4. **Leaderboard Competition**: Compete against other players globally

## Progression System

### Wealth Tiers

| Tier | Wealth Range | Title | Unlocks |
|------|--------------|-------|---------|
| 1 | $1,000 - $10,000 | Retail Trader | Basic market access, simple orders |
| 2 | $10,000 - $100,000 | Active Trader | Advanced order types, basic algorithms |
| 3 | $100,000 - $1M | Professional | Margin trading, faster data feeds |
| 4 | $1M - $10M | Fund Manager | Lower fees, exclusive markets |
| 5 | $10M - $100M | Financial Magnate | Custom UI themes, VIP features |
| 6 | $100M - $1B | Market Mover | Market manipulation abilities, insider tips |
| 7 | $1B - $1T | Financial Titan | Create your own assets, influence market trends |
| 8 | $1T+ | Market God | Unlimited possibilities, game-breaking powers |

### Progression Accelerators

As players advance through wealth tiers, they gain access to tools and features that accelerate their wealth generation:

- **Trading Bots**: Automate basic trading strategies 
- **Advanced Algorithms**: Create complex trading systems
- **Market Analysis Tools**: Better prediction capabilities
- **Insider Information**: Occasional tips about market movements
- **Fee Reduction**: Lower transaction costs with higher wealth
- **Network Effects**: Influence over market participants
- **Infrastructure Upgrades**: Faster execution and better fills
- **Dark Pool Access**: Trade large quantities without affecting market price

## Market Simulation

The game simulates market behavior using a blend of:

1. **Real-world historical patterns**: Assets follow general patterns from real markets
2. **Player-influenced price action**: Heavy trading by players affects asset prices
3. **Random events**: News, crashes, bubbles, and other market phenomena
4. **Periodic cycles**: Day/night, weekly, monthly, and yearly market patterns

## Algorithmic Trading

A key differentiator for candlz is the ability for players to create their own trading algorithms:

- **Python-based API**: Accessible yet powerful programming interface
- **Strategy Library**: Pre-built strategies for novice programmers
- **Backtesting System**: Test strategies against historical data
- **Performance Metrics**: Detailed analytics on algorithm performance
- **Deployment System**: Run algorithms 24/7 even when not playing
- **Competition**: Pit your algorithms against other players

## Visual Design

- **Modern UI**: Clean, professional trading interface
- **Satisfying Numbers**: Big, bold displays of profits and portfolio value
- **Visual Feedback**: Animations and effects for successful trades
- **Customizable Themes**: Unlock new UI themes as you progress
- **Candlestick Charts**: Beautiful, responsive market visualizations

## Audio Design

- **Ambient Market Sounds**: Background chatter, typing, trading floor ambience
- **Transaction Sounds**: Satisfying sounds for buys, sells, and profit taking
- **Achievement Jingles**: Custom sounds for milestones and achievements
- **Market Bells**: Opening and closing bell sounds for trading sessions
- **Alert System**: Custom notification sounds for price alerts and events

## Game Modes

### Standard Mode
Start with $10,000 and build your fortune through smart trading.

### Challenge Mode
Start with $1,000 and overcome specific market challenges to progress.

### Hardcore Mode
Starting capital of $1,000 with higher fees, no save-scumming, and more volatile markets.

### Creative Mode
Unlimited funds to experiment with trading strategies and algorithms without risk.

## Social Features

- **Global Leaderboards**: Compare wealth with players worldwide
- **Strategy Sharing**: Share algorithm templates with the community
- **Trading Competitions**: Limited-time events with special rules
- **Portfolio Showcases**: Display your trading success to others
- **Achievements & Badges**: Unlock and display special accomplishments

## Monetization Design (Optional)

The game is designed as a premium experience with optional cosmetic enhancements:

- **Base Game**: Complete experience with all gameplay features
- **UI Themes**: Additional visual themes for the trading interface
- **Custom Sounds**: Alternative sound packs for game events
- **Cosmetic Portfolio Effects**: Visual enhancements for profit displays
- **Strategy Templates**: Pre-built algorithm templates for inspiration

## Technical Integration

The combination of Electron frontend with FastAPI backend enables:

1. **Responsive UI**: Smooth, desktop-class trading interface
2. **Algorithm Integration**: Python-based algorithms run efficiently in the backend
3. **Data Persistence**: Local saving of progress and algorithms
4. **Cross-platform**: Works on Windows, macOS, and Linux
5. **Offline Play**: Core gameplay available without internet connection
6. **Cloud Features**: Online leaderboards and competitions when connected

## Future Expansion

Potential updates and expansions:

1. **New Asset Classes**: Add commodities, bonds, futures, options
2. **Market Campaigns**: Story-driven trading challenges
3. **Multiplayer Trading**: Direct trading between players
4. **Exchange Creation**: Build and manage your own exchange
5. **Economy Simulation**: Deeper simulation of economic factors
