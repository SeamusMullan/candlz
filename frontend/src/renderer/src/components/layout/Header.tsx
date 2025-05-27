import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatCurrency, getWealthTierDisplay } from '@/lib/utils';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const portfolio = useGameStore(state => state.portfolio);
  const isConnected = useGameStore(state => state.isConnected);
  const reset = useGameStore(state => state.reset);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentPlayer) return null;

  const portfolioValue = portfolio?.total_value || currentPlayer.current_portfolio_value;
  const cashBalance = portfolio?.cash_balance || currentPlayer.cash_balance;
  const pnl = portfolio?.total_pnl || '0';
  const pnlPct = portfolio?.total_pnl_pct || '0';
  
  const pnlValue = parseFloat(pnl);
  const pnlIsPositive = pnlValue > 0;
  const pnlIsNegative = pnlValue < 0;

  return (
    <header className="glass-effect border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Player Info */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gradient">Candlz</h1>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6 border-l border-gray-200 pl-6">
            <div className="metric-card min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Trader</p>
              <p className="font-semibold text-gray-900 truncate">{currentPlayer.username}</p>
            </div>
            <div className="metric-card min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Tier</p>
              <p className="font-semibold text-blue-600">
                {getWealthTierDisplay(currentPlayer.wealth_tier)}
              </p>
            </div>
            <div className="metric-card min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Level</p>
              <p className="font-semibold text-purple-600">
                {currentPlayer.level} <span className="text-gray-500 text-sm">({currentPlayer.experience_points} XP)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Portfolio Stats */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Portfolio</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(portfolioValue)}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cash</p>
              <p className="text-lg font-semibold text-gray-700">
                {formatCurrency(cashBalance)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">P&L</p>
              <div className="flex items-center space-x-2">
                <p className={`text-lg font-bold ${
                  pnlIsPositive ? 'text-emerald-600' : 
                  pnlIsNegative ? 'text-red-600' : 
                  'text-gray-900'
                }`}>
                  {pnlIsPositive ? '+' : ''}{formatCurrency(pnl)}
                </p>
                <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                  pnlIsPositive ? 'bg-emerald-100 text-emerald-800' : 
                  pnlIsNegative ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pnlIsPositive ? '+' : ''}{parseFloat(pnlPct).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {currentPlayer.username.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{currentPlayer.username}</p>
                <p className="text-xs text-gray-500">{getWealthTierDisplay(currentPlayer.wealth_tier)}</p>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 glass-effect rounded-xl shadow-lg py-2 z-50 fade-in">
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <p className="text-sm font-semibold text-gray-900">{currentPlayer.username}</p>
                  <p className="text-xs text-blue-600 font-medium">{getWealthTierDisplay(currentPlayer.wealth_tier)} • Level {currentPlayer.level}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    // TODO: Add settings modal
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    // TODO: Add export data functionality
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-white/50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export Data</span>
                </button>
                
                <div className="border-t border-gray-200/50 my-1"></div>
                
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    if (confirm('Are you sure you want to logout? You can log back in with your username.')) {
                      reset();
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}