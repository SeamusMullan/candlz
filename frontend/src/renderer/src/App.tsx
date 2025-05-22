import React, { useEffect } from 'react';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Connecting to Candlz...</p>
        </div>
      </div>
    );
  }

  // Show connection error
  if (healthError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h1>
          <p className="text-gray-600 mb-4">
            Unable to connect to the Candlz backend. Make sure the server is running:
          </p>
          <div className="bg-gray-100 rounded-lg p-3 text-left">
            <code className="text-sm">cd backend && uv run fastapi dev main.py</code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn btn-primary btn-sm"
          >
            Retry Connection
          </button>
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