import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        {children}
      </div>
    </>
  );
}

export function DialogContent({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg w-full max-w-lg mx-auto min-w-[400px] p-6 ${className}`}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className = '', ...props }) {
  return (
    <div
      className={`px-6 py-4 border-b border-gray-200 ${className}`}
      {...props}
    />
  );
}

export function DialogTitle({ className = '', ...props }) {
  return (
    <h2
      className={`text-lg font-semibold text-gray-900 ${className}`}
      {...props}
    />
  );
}