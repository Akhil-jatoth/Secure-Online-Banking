import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/formatters.js';

export const SpendingChart = ({ data = [] }) => {
  // Default fallback mock visualization if transactions are sparse
  const chartData = data.length > 0 ? data : [
    { name: 'Mon', amount: 120 },
    { name: 'Tue', amount: 280 },
    { name: 'Wed', amount: 150 },
    { name: 'Thu', amount: 450 },
    { name: 'Fri', amount: 320 },
    { name: 'Sat', amount: 600 },
    { name: 'Sun', amount: 210 },
  ];

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0c87eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0c87eb" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#cbd5e1', opacity: 0.3 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #334155',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value) => [formatCurrency(value), 'Spending']}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#0c87eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
