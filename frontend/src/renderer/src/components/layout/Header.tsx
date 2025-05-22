import React, { useState, useEffect, useRef } from 'react';
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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo and Player Info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gradient">📈 Candlz</h1>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          
          <div className="border-l border-gray-300 pl-6">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-gray-600">Trader</p>
                <p className="font-semibold text-gray-900">{currentPlayer.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tier</p>
                <p className="font-semibold text-gray-900">
                  {getWealthTierDisplay(currentPlayer.wealth_tier)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-semibold text-gray-900">
                  {currentPlayer.level} ({currentPlayer.experience_points} XP)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Portfolio Stats */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">Portfolio Value</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(portfolioValue)}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">Cash Balance</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(cashBalance)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-600">Total P&L</p>
            <div className="flex items-center space-x-2">
              <p className={`text-lg font-semibold ${
                pnlIsPositive ? 'text-success-600' : 
                pnlIsNegative ? 'text-danger-600' : 
                'text-gray-900'
              }`}>
                {pnlIsPositive ? '+' : ''}{formatCurrency(pnl)}
              </p>
              <span className={`text-sm px-2 py-1 rounded-full ${
                pnlIsPositive ? 'bg-success-100 text-success-800' : 
                pnlIsNegative ? 'bg-danger-100 text-danger-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {pnlIsPositive ? '+' : ''}{parseFloat(pnlPct).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="border-l border-gray-300 pl-6 relative">
            <div className="flex items-center space-x-2">
              <button className="btn btn-ghost btn-sm">
                ⚙️
              </button>
              <button className="btn btn-ghost btn-sm">
                🔔
              </button>
              
              {/* User Profile Button */}
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="btn btn-ghost btn-sm flex items-center space-x-2"
                >
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {currentPlayer.username.charAt(0).toUpperCase()}
                  </div>
                  <span>{currentPlayer.username}</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentPlayer.username}</p>
                      <p className="text-xs text-gray-600">{getWealthTierDisplay(currentPlayer.wealth_tier)}</p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Add settings modal
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ⚙️ Settings
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Add export data functionality
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      📊 Export Data
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        if (confirm('Are you sure you want to logout? You can log back in with your username.')) {
                          reset();
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}