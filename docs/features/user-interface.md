# User Interface

The candlz user interface is designed to be both visually appealing and highly functional, evolving as you progress through the game. This document outlines the UI components and how they enhance the "money go up" experience.

## UI Design Philosophy

The candlz interface follows these core principles:

1. **Clarity in Complexity**: Make complex market data intuitive and readable
2. **Progressive Disclosure**: Start simple, reveal more features as you advance
3. **Visual Rewards**: Provide satisfying visual feedback for success
4. **Customizability**: Allow players to tailor the experience to their preferences
5. **Big Number Energy**: Emphasize wealth growth with prominent displays

## Main Interface Components

### Trading Dashboard

The central hub for your trading activities:

![Trading Dashboard Concept](../assets/ui-concept-dashboard.png)

#### Key Elements

- **Portfolio Value Display**: Large, prominent counter showing your total wealth
- **Asset Overview**: Quick view of your current holdings
- **Market Watch**: Customizable list of assets you're monitoring
- **Recent Trades**: History of your latest transactions
- **Performance Metrics**: Key statistics about your trading performance
- **Time Controls**: Options to accelerate or pause game time

### Chart Interface

Professional-grade charting for technical analysis:

![Chart Interface Concept](../assets/ui-concept-charts.png)

#### Features

- **Multiple Chart Types**: Candlestick, line, bar, area, etc.
- **Timeframe Selection**: From 1-minute to monthly views
- **Technical Indicators**: Over 100 indicators and studies
- **Drawing Tools**: Trendlines, Fibonacci levels, pitchforks, etc.
- **Multi-Chart Layout**: View multiple assets simultaneously
- **Chart Templates**: Save and load custom chart setups

### Order Entry Panel

Place trades with precision and efficiency:

#### Order Types

- **Market Orders**: Execute immediately at current price
- **Limit Orders**: Set specific buy/sell prices
- **Stop Orders**: Trigger market orders at specified prices
- **Stop-Limit Orders**: Combined stop and limit functionality
- **Trailing Stops**: Dynamic stop orders that follow price
- **OCO (One-Cancels-Other)**: Linked order pairs for entry and exit

#### Order Parameters

- **Quantity**: Number of shares/units to trade
- **Price**: Target price for non-market orders
- **Time in Force**: How long orders remain active
- **Take Profit**: Automatic profit-taking level
- **Stop Loss**: Automatic loss-limiting level

### Portfolio Manager

Track and analyze your holdings:

#### Features

- **Position Details**: Entry price, current value, P&L for each holding
- **Allocation Visualization**: Pie charts and treemaps of your portfolio
- **Diversification Metrics**: Risk exposure by asset class and sector
- **Performance History**: Historical portfolio value graph
- **What-If Analysis**: Simulate adding/removing positions

### Algorithm Workshop

Design and deploy trading algorithms:

#### Components

- **Code Editor**: Python editor with syntax highlighting
- **Template Library**: Pre-built algorithm templates
- **Backtesting Panel**: Test algorithms against historical data
- **Performance Metrics**: Analyze algorithm trading results
- **Deployment Manager**: Active algorithm control center

### News Feed

Stay informed about market-moving events:

#### Features

- **Market News**: Latest headlines affecting your assets
- **Economic Calendar**: Upcoming events and data releases
- **Corporate Actions**: Dividends, splits, earnings dates
- **Market Sentiment**: Social media and sentiment analysis
- **Alerts**: Customizable notifications for important events

## UI Evolution Through Progression

The interface evolves as you progress through wealth tiers:

### Tier 1: Retail Trader ($1,000 - $10,000)
- Basic, streamlined interface with simplified charts
- Limited to essential functions and few customization options
- Tutorial overlays and guidance features
- Simple dashboard focused on basic portfolio metrics

### Tier 2: Active Trader ($10,000 - $100,000)
- Enhanced charting with more technical indicators
- Additional order types unlocked
- Basic algorithm creation interface
- More detailed portfolio analytics

### Tier 3: Professional ($100,000 - $1,000,000)
- Multi-chart layouts and advanced studies
- Full order type suite with custom order routing
- Comprehensive algorithm workshop
- Risk analysis tools and advanced portfolio management

### Tier 4: Fund Manager ($1,000,000 - $10,000,000)
- Institutional-grade analytics and data visualization
- Custom UI color schemes and layouts
- Advanced algorithm capabilities
- Multi-asset correlation views

### Tier 5: Financial Magnate ($10,000,000 - $100,000,000)
- Premium UI themes with animation effects
- Market impact visualization
- Proprietary indicator access
- Global economy view

### Tier 6+: Market Mover and Beyond ($100,000,000+)
- Luxury UI with special visual effects
- Market manipulation controls
- Economy influence panel
- Custom visualization tools

## Visual Feedback Systems

The UI provides satisfying feedback for your achievements:

### Money Counter Animations

- **Tick-Up Effect**: Numbers increment visually when gaining value
- **Milestone Animations**: Special effects when crossing wealth thresholds
- **Profit Highlighting**: Green flashes and animations for profitable trades
- **Streaks**: Visual enhancements for consecutive winning trades

### Achievement Notifications

- **Pop-up Celebrations**: Animated overlays for major achievements
- **Trophy Cabinet**: Visual collection of earned achievements
- **Milestone Markers**: Special indicators on wealth graph
- **Rank-Up Ceremonies**: Special sequences when advancing tiers

### Trading Success Feedback

- **Trade Success Indicators**: Visual and audio cues for completed trades
- **Profit Ripples**: Effects emanating from profitable positions
- **Wealth Acceleration**: Visual speedometer showing growth rate
- **Big Win Celebrations**: Special effects for exceptionally profitable trades

## Customization Options

Make the interface your own:

### Visual Customization

- **Color Themes**: Multiple color schemes from professional to playful
- **Layout Templates**: Different arrangements of interface components
- **Font Styles**: Typography options for readability and style
- **Opacity Settings**: Adjust transparency of interface elements
- **Animation Toggles**: Enable/disable various visual effects

### Functional Customization

- **Widget Selection**: Choose which components to display
- **Quick Access Tools**: Customize toolbar with favorite functions
- **Keyboard Shortcuts**: Define custom key combinations
- **Default Settings**: Set preferred order types and parameters
- **Chart Defaults**: Save default indicators and timeframes

## Mobile Companion Mode

Access key features on the go:

### Mobile Features

- **Portfolio Monitoring**: Check positions and performance
- **Basic Trading**: Execute simple trades from anywhere
- **Alerts Management**: Set and receive notifications
- **Algorithm Status**: Monitor and control running algorithms
- **Market News**: Stay informed with the latest developments

## Accessibility Features

Making the game accessible to all players:

- **Color Blind Modes**: Alternative color schemes for different types of color blindness
- **Text Scaling**: Adjustable text size for readability
- **Screen Reader Support**: Compatible with assistive technologies
- **Keyboard Navigation**: Full functionality without requiring mouse usage
- **Reduced Motion Mode**: Option to minimize animations for sensitivity

## UI Sound Design

Audio enhances the visual experience:

### Sound Elements

- **Trading Sounds**: Distinct audio for buys, sells, and different order types
- **Alert Notifications**: Customizable sounds for price alerts and events
- **Ambience**: Optional background sounds like trading floor bustle
- **Success Tones**: Satisfying audio feedback for profits and achievements
- **Wealth Tier Music**: Background music that evolves with your progression

## The "Money Go Up" Experience

The UI is specifically designed to make wealth accumulation viscerally satisfying:

### Wealth Visualization

- **Growing Numbers**: Large, prominent displays of your increasing wealth
- **Progress Bars**: Visual indicators of progress toward next tier
- **Historical Graph**: Long-term view of your wealth journey
- **Comparison Tools**: See your performance against benchmarks
- **Wealth Milestones**: Special markers for significant achievements

### Psychological Rewards

- **Dopamine Triggers**: Visual and audio elements timed to create satisfaction
- **Progression Pacing**: Carefully tuned to maintain engagement
- **Achievement Spacing**: Rewards distributed to maintain motivation
- **Surprise Elements**: Unexpected bonuses and visual treats
- **Status Indicators**: Clear signals of your advancing wealth status

## Technical Implementation

The UI is built on Electron, providing a responsive and customizable experience:

- **React Components**: Modular interface elements
- **Real-time Data Flow**: Live updates without page refreshes
- **Local Storage**: Remembers your preferences and layouts
- **Hardware Acceleration**: Smooth animations and transitions
- **Multi-Monitor Support**: Extend across multiple displays

---

The candlz user interface evolves from a simple trading platform to an immersive financial command center as you progress. With each advancement in wealth, the UI not only provides more powerful tools but also delivers increasingly satisfying visual and audio feedback to reinforce the core "money go up" experience.
