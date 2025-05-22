import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(value: string | number, currency = 'USD'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Format large numbers with suffixes
export function formatNumber(value: string | number, compact = false): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  if (compact && Math.abs(numValue) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(numValue);
  }
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(numValue);
}

// Format percentage values
export function formatPercentage(value: string | number, decimals = 2): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0.00%';
  
  return `${numValue.toFixed(decimals)}%`;
}

// Format price changes with colors
export function formatPriceChange(value: string | number): {
  formatted: string;
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
} {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return {
      formatted: '0.00%',
      isPositive: false,
      isNegative: false,
      isNeutral: true,
    };
  }
  
  const formatted = formatPercentage(numValue);
  
  return {
    formatted: numValue > 0 ? `+${formatted}` : formatted,
    isPositive: numValue > 0,
    isNegative: numValue < 0,
    isNeutral: numValue === 0,
  };
}

// Get wealth tier display name
export function getWealthTierDisplay(tier: string): string {
  const tierMap: Record<string, string> = {
    retail_trader: 'Retail Trader',
    active_trader: 'Active Trader',
    small_fund: 'Small Fund',
    hedge_fund: 'Hedge Fund',
    institution: 'Institution',
    billionaire: 'Billionaire',
    market_maker: 'Market Maker',
    market_god: 'Market God',
  };
  
  return tierMap[tier] || tier.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get asset type display name and color
export function getAssetTypeInfo(type: string): { display: string; color: string; icon: string } {
  const typeMap: Record<string, { display: string; color: string; icon: string }> = {
    stock: { display: 'Stock', color: 'text-blue-600', icon: '📈' },
    crypto: { display: 'Crypto', color: 'text-orange-600', icon: '₿' },
    forex: { display: 'Forex', color: 'text-green-600', icon: '💱' },
    commodity: { display: 'Commodity', color: 'text-yellow-600', icon: '🏗️' },
    index: { display: 'Index', color: 'text-purple-600', icon: '📊' },
    bond: { display: 'Bond', color: 'text-gray-600', icon: '📋' },
    derivative: { display: 'Derivative', color: 'text-red-600', icon: '🔄' },
  };
  
  return typeMap[type] || { display: type, color: 'text-gray-600', icon: '❓' };
}

// Get order status color
export function getOrderStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'text-yellow-600 bg-yellow-100',
    filled: 'text-green-600 bg-green-100',
    partially_filled: 'text-blue-600 bg-blue-100',
    cancelled: 'text-gray-600 bg-gray-100',
    rejected: 'text-red-600 bg-red-100',
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
}

// Calculate time ago
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

// Validate trading inputs
export function validateTradeInput(
  quantity: string,
  price: string | undefined,
  availableCash: string,
  orderSide: 'buy' | 'sell',
  availableQuantity?: string
): { isValid: boolean; error?: string } {
  const qty = parseFloat(quantity);
  
  if (isNaN(qty) || qty <= 0) {
    return { isValid: false, error: 'Quantity must be a positive number' };
  }
  
  if (orderSide === 'buy') {
    const prc = price ? parseFloat(price) : 0;
    if (price && (isNaN(prc) || prc <= 0)) {
      return { isValid: false, error: 'Price must be a positive number' };
    }
    
    const totalCost = qty * prc;
    const cash = parseFloat(availableCash);
    
    if (totalCost > cash) {
      return { isValid: false, error: 'Insufficient cash balance' };
    }
  }
  
  if (orderSide === 'sell') {
    const available = parseFloat(availableQuantity || '0');
    if (qty > available) {
      return { isValid: false, error: 'Insufficient position size' };
    }
  }
  
  return { isValid: true };
}

// Generate chart colors
export function getChartColors(count: number): string[] {
  const baseColors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];
  
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}