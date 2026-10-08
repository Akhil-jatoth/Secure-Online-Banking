import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  variant = 'default',
  actionButton,
}) => {
  const variants = {
    default: 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800',
    primary: 'bank-gradient-card text-white border-transparent',
    dark: 'bank-dark-card text-white',
    emerald: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-transparent',
  };

  const isGradient = variant !== 'default';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 border shadow-card dark:shadow-card-dark transition-all hover:translate-y-[-2px] ${variants[variant] || variants.default}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-semibold tracking-wider uppercase ${
              isGradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight ${
              isGradient ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            {value}
          </h3>
        </div>

        {Icon && (
          <div
            className={`p-3 rounded-xl flex items-center justify-center ${
              isGradient
                ? 'bg-white/15 text-white backdrop-blur-sm'
                : 'bg-bank-50 dark:bg-bank-950/60 text-bank-600 dark:text-bank-400'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {subtitle && (
          <p
            className={`text-xs ${
              isGradient ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </p>
        )}

        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trendPositive
                ? isGradient
                  ? 'bg-emerald-400/20 text-emerald-200'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : isGradient
                ? 'bg-rose-400/20 text-rose-200'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {trend}
          </span>
        )}

        {actionButton && <div>{actionButton}</div>}
      </div>
    </div>
  );
};
