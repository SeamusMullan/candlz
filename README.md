# candlz

candlz is a trading simulation game where players can trade stocks and cryptocurrencies with the goal of making as much money as possible and climbing global leaderboards.

## Features

- **Market Simulation**: Experience realistic market dynamics
- **Algorithmic Trading**: Program your own trading bots
- **Multi-Asset Trading**: Trade stocks, crypto, and more
- **Wealth Progression**: Grow your portfolio from thousands to billions
- **Cross-Platform**: Built on Electron and FastAPI

## Installation

Game aint finished....yet

## (Development) Getting Started

### Prerequisites

- Node.js 16+
- Python 3.11+
- npm or yarn

### Installation

```bash
# Install dependencies
npm run install:all

# Setup Python environment
cd backend
uv sync
uv pip install -r requirements.txt
```

### Development

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend
npm run dev:backend
```

## Documentation

The game's documentation is available in the `docs/` folder and can be viewed locally:

```bash
# Using the provided scripts
./serve-docs.sh  # Linux/macOS
serve-docs.bat   # Windows

# OR using docsify directly
npm install -g docsify-cli
docsify serve docs
```

Then open your browser to http://localhost:3000

## Project Structure

```
├── frontend/        # Electron/Vite frontend
├── backend/         # Python/FastAPI backend
├── docs/            # Game documentation
└── package.json     # Root package.json for scripts
```

## License

This project is licensed under the MIT License.
