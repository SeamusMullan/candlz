import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGameStore } from '@/store/gameStore';
import { useSystemHealth } from '@/hooks/useAPI';
import GameDashboard from '@/components/GameDashboard';
import PlayerSetup from '@/components/PlayerSetup';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
    },
  },
});

function AppContent() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setConnected = useGameStore(state => state.setConnected);
  const setError = useGameStore(state => state.setError);

  // Check system health
  const { data: healthData, isError: healthError, isLoading: healthLoading } = useSystemHealth();

  useEffect(() => {
    if (healthData) {
      setConnected(true);
      setError(null);
    } else if (healthError) {
      setConnected(false);
      setError('Unable to connect to game server. Please check if the backend is running.');
    }
  }, [healthData, healthError, setConnected, setError]);

  // Show loading spinner while checking connection
  if (healthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto">
            <LoadingSpinner size="lg" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Connecting to Candlz</h2>
            <p className="text-gray-600">Establishing connection to trading servers...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show connection error
  if (healthError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="glass-effect rounded-2xl p-8 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Connection Failed</h1>
              <p className="text-gray-600">
                Unable to connect to the Candlz backend server.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 text-left">
              <code className="text-sm text-green-400 font-mono">
                cd backend && uv run fastapi dev main.py
              </code>
            </div>
            
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show player setup if no current player
  if (!currentPlayer) {
    return <PlayerSetup />;
  }

  // Show main game dashboard
  return <GameDashboard />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <AppContent />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;