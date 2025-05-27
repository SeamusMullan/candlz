type DashboardView = 'overview' | 'market' | 'trading' | 'orders' | 'stats';

interface SidebarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: '🏠',
    description: 'Portfolio overview'
  },
  {
    id: 'market',
    label: 'Markets',
    icon: '📊',
    description: 'Live market data'
  },
  {
    id: 'trading',
    label: 'Trading',
    icon: '💱',
    description: 'Place orders'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: '📋',
    description: 'Trading history'
  },
  {
    id: 'stats',
    label: 'Analytics',
    icon: '📈',
    description: 'Performance metrics'
  }
];

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-effect border-r border-gray-200/50 pt-20 z-40 hidden lg:block">
      <nav className="px-4 py-6 space-y-8">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`sidebar-item ${activeView === item.id ? 'active' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              {activeView === item.id && (
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Quick Stats */}
        <div className="pt-8 border-t border-gray-200/50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Markets</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-600 font-medium">Online</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active Orders</span>
              <span className="text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded-md">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Assets Owned</span>
              <span className="text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded-md">-</span>
            </div>
          </div>
        </div>

        {/* Market Status */}
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <h4 className="text-sm font-semibold text-emerald-900">Market Status</h4>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            All markets are operational. Real-time trading available.
          </p>
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <div className="text-xs text-emerald-600">
              <div className="flex justify-between mb-1">
                <span>Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span>Latency</span>
                <span className="font-medium">&lt;10ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Candlz v0.1.0
          </p>
        </div>
      </nav>
    </aside>
  );
}