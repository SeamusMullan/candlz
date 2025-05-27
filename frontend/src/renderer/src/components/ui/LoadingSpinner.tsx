import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'danger';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const variantClasses = {
  default: 'border-gray-300 border-t-gray-600',
  primary: 'border-blue-200 border-t-blue-600',
  success: 'border-green-200 border-t-green-600',
  danger: 'border-red-200 border-t-red-600',
};

export default function LoadingSpinner({ 
  size = 'md', 
  className, 
  variant = 'primary' 
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}