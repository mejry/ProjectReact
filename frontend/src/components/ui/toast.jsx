import React from 'react';
import { X } from 'lucide-react';

export const Toast = React.forwardRef(({ className, type = 'default', children, onClose, ...props }, ref) => {
  const typeStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <div
      ref={ref}
      className={`group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all ${typeStyles[type]} ${className}`}
      {...props}
    >
      {children}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});

export const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] ${className}`}
    {...props}
  />
));

export const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm font-semibold ${className}`} {...props} />
));

export const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={`text-sm opacity-90 ${className}`} {...props} />
));