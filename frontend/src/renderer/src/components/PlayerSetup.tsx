import { useState } from 'react';
import { useCreatePlayer } from '@/hooks/useAPI';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PlayerSetup() {
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [username, setUsername] = useState('');
  const [startingCapital, setStartingCapital] = useState('10000');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setCurrentPlayer = useGameStore(state => state.setCurrentPlayer);
  const createPlayerMutation = useCreatePlayer();
  const [loginUsername, setLoginUsername] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (username.length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }

    const capital = parseFloat(startingCapital);
    if (isNaN(capital) || capital < 1000) {
      newErrors.startingCapital = 'Starting capital must be at least $1,000';
    } else if (capital > 100000) {
      newErrors.startingCapital = 'Starting capital cannot exceed $100,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!loginUsername.trim()) {
      setErrors({ login: 'Username is required' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/players/username/${loginUsername.trim()}`);
      if (response.ok) {
        const player = await response.json();
        setCurrentPlayer(player);
      } else {
        setErrors({ login: 'Player not found. Please check your username or create a new account.' });
      }
    } catch (error) {
      setErrors({ login: 'Failed to login. Please check your connection.' });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await createPlayerMutation.mutateAsync({
        username: username.trim(),
        starting_capital: startingCapital,
      });
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create player' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Candlz</h1>
          <p className="text-gray-600 text-lg">
            Your incremental trading adventure starts here
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8 slide-in-right">
          <div className="glass-effect rounded-xl p-1">
            <button
              onClick={() => setMode('login')}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                mode === 'login' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Welcome Back
            </button>
            <button
              onClick={() => setMode('create')}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                mode === 'create' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              Start Trading
            </button>
          </div>
        </div>

        {/* Login/Create Form */}
        <div className="glass-effect rounded-2xl p-8 space-y-6 fade-in"
             style={{ animationDelay: '0.2s' }}>
          <div className="card-header">
            <h2 className="card-title">
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Trader Profile'}
            </h2>
            <p className="card-description">
              {mode === 'login' 
                ? 'Enter your username to continue your trading journey'
                : 'Choose your username and starting capital to begin trading'
              }
            </p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="card-content space-y-4">
              <div>
                <label htmlFor="loginUsername" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="loginUsername"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={`input ${errors.login ? 'input-error' : ''}`}
                  disabled={false}
                />
                {errors.login && (
                  <p className="text-sm text-red-600 mt-1">{errors.login}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={false}
                className="w-full btn btn-primary btn-lg"
              >
                Continue Trading
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="card-content space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your trading name"
                className={`input ${errors.username ? 'input-error' : ''}`}
                disabled={createPlayerMutation.isPending}
              />
              {errors.username && (
                <p className="text-sm text-red-600 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Starting Capital */}
            <div>
              <label htmlFor="capital" className="block text-sm font-medium text-gray-700 mb-1">
                Starting Capital
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="capital"
                  type="number"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={startingCapital}
                  onChange={(e) => setStartingCapital(e.target.value)}
                  className={`input pl-8 ${errors.startingCapital ? 'input-error' : ''}`}
                  disabled={createPlayerMutation.isPending}
                />
              </div>
              {errors.startingCapital && (
                <p className="text-sm text-red-600 mt-1">{errors.startingCapital}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                You'll start with {formatCurrency(startingCapital)} to trade with
              </p>
            </div>

            {/* Wealth Tier Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Starting Tier</h4>
              <p className="text-sm text-blue-700">
                You'll begin as a <strong>Retail Trader</strong>. Trade your way up through 8 wealth tiers, 
                from Retail Trader to Market God!
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="alert alert-error">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createPlayerMutation.isPending}
              className="w-full btn btn-primary btn-lg"
            >
              {createPlayerMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating Player...
                </>
              ) : (
                'Start Trading Journey'
              )}
            </button>
          </form>
          )}

          <div className="card-footer">
            <p className="text-xs text-gray-500 text-center">
              {mode === 'login' 
                ? "Don't have an account? Switch to Create Account above." 
                : "By starting, you agree to make profitable trades and achieve financial glory! 🚀"
              }
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          <div className="bg-white/70 backdrop-blur rounded-lg p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900">Real Trading</h3>
            <p className="text-sm text-gray-600">Stocks, crypto, forex & more</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-lg p-4">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-medium text-gray-900">Algorithms</h3>
            <p className="text-sm text-gray-600">Build automated strategies</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-lg p-4">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-medium text-gray-900">Achievements</h3>
            <p className="text-sm text-gray-600">Unlock rewards & tiers</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-lg p-4">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-900">Portfolio</h3>
            <p className="text-sm text-gray-600">Track performance & growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}