import React from 'react';

export function Loading({ className = '', size = 'default' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-t-transparent border-blue-600 ${sizeClasses[size]} ${className}`}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loading size="lg" />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
      <Loading size="lg" />
    </div>
  );
}