# Candlz Trading Game Frontend

A modern React + TypeScript frontend for the Candlz incremental trading simulation game.

## 🚀 Features

- **Modern Stack**: React 19, TypeScript, Tailwind CSS, Electron
- **State Management**: Zustand for global state management
- **Data Fetching**: TanStack Query (React Query) for server state
- **Responsive Design**: Mobile-first responsive design with Tailwind
- **Real-time Updates**: Automatic data refreshing and live market updates
- **Type Safety**: Full TypeScript coverage for API and components

## 🏗️ Architecture

```
src/renderer/src/
├── components/           # React components
│   ├── layout/          # Header, Sidebar, Layout components
│   ├── market/          # Market watch, asset lists
│   ├── portfolio/       # Portfolio overview, positions
│   ├── trading/         # Trading panel, order forms
│   ├── stats/           # Statistics and analytics
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
│   └── useAPI.ts        # API hooks with React Query
├── lib/                 # Utility functions
│   ├── api.ts           # API client with Axios
│   └── utils.ts         # Helper functions
├── store/               # Zustand stores
│   └── gameStore.ts     # Global game state
├── types/               # TypeScript type definitions
│   └── api.ts           # API response types
└── assets/              # CSS, images, fonts
```

## 🎮 User Interface

### Dashboard Views
- **Overview**: Portfolio summary, market watch, quick trading
- **Market**: Detailed market data and asset information
- **Trading**: Advanced order placement and simulation
- **Orders**: Order history and management
- **Statistics**: Performance analytics and achievements

### Key Components
- **Header**: Player info, portfolio value, wealth tier, P&L
- **Sidebar**: Navigation between dashboard views
- **Market Watch**: Live asset prices with filtering
- **Trading Panel**: Order placement with validation
- **Portfolio Overview**: Current positions and performance
- **Order History**: Past trades with status tracking

## 🔧 Technical Details

### State Management
- **Zustand Store**: Global game state (player, portfolio, orders)
- **React Query**: Server state caching and synchronization
- **Local Storage**: Persistence for user preferences

### API Integration
- **Axios Client**: HTTP client with interceptors
- **Type-safe**: Full TypeScript coverage for API calls
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Real-time**: Automatic data refreshing every 30 seconds

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable button, card, input components
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Dark Mode**: System preference detection (ready)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API running on localhost:8000

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build Electron app
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux
```

### Environment Variables
Create a `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 Usage

1. **Start the Backend**: Make sure the Candlz backend is running
2. **Launch Frontend**: Run `npm run dev` 
3. **Create Player**: Enter username and starting capital
4. **Start Trading**: Select assets, place orders, build portfolio
5. **Track Progress**: Monitor performance, unlock achievements

## 🔄 Data Flow

1. **Player Creation**: Username → API → Player object → Global state
2. **Asset Selection**: Market Watch → Asset selection → Trading panel
3. **Order Placement**: Trading form → Validation → API → Order execution
4. **Portfolio Updates**: Order execution → Portfolio recalculation → UI update
5. **Real-time Data**: Polling → Market data → Price updates → UI refresh

## 🎨 Customization

### Adding New Components
```typescript
// Create component with proper types
interface MyComponentProps {
  data: SomeType;
  onAction: (id: number) => void;
}

export default function MyComponent({ data, onAction }: MyComponentProps) {
  // Component logic
}
```

### Adding API Endpoints
```typescript
// Add to lib/api.ts
export const newAPI = {
  async getData(): Promise<DataType> {
    const response = await api.get<DataType>('/new-endpoint');
    return response.data;
  }
};

// Create hook in hooks/useAPI.ts
export function useNewData() {
  return useQuery({
    queryKey: ['newData'],
    queryFn: () => newAPI.getData(),
  });
}
```

### Adding Store State
```typescript
// Update store/gameStore.ts
interface GameState {
  newProperty: SomeType;
  setNewProperty: (value: SomeType) => void;
}

// Add to store implementation
setNewProperty: (value) => set({ newProperty: value })
```

## 🔒 Security

- **Input Validation**: All user inputs validated client-side and server-side
- **XSS Protection**: React's built-in protection + content sanitization  
- **CORS Configuration**: Proper CORS setup for API communication
- **Type Safety**: TypeScript prevents runtime type errors

## 📱 Platform Support

- **Electron Desktop**: Windows, macOS, Linux
- **Web Browser**: Chrome, Firefox, Safari, Edge
- **Mobile**: Responsive design works on mobile browsers
- **PWA Ready**: Can be configured as Progressive Web App

---

**The frontend is now ready to connect to your Candlz backend!** 🎮📈

Start the backend (`uv run fastapi dev main.py`) and then the frontend (`npm run dev`) to begin trading!