import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    primary: 'bg-bank-50 text-bank-700 dark:bg-bank-950/60 dark:text-bank-300 border-bank-200 dark:border-bank-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
    case 'SUCCESS':
      return <Badge variant="success">● Active</Badge>;
    case 'FROZEN':
      return <Badge variant="warning">❄ Frozen</Badge>;
    case 'CLOSED':
      return <Badge variant="danger">✕ Closed</Badge>;
    case 'PENDING':
      return <Badge variant="warning">⏳ Pending</Badge>;
    case 'FAILED':
      return <Badge variant="danger">✕ Failed</Badge>;
    case 'REVERSED':
      return <Badge variant="purple">↺ Reversed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
