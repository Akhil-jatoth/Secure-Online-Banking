import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../utils/formatters.js';

export const IncomeExpenseChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', income: 3500, expense: 2100 },
    { month: 'Feb', income: 4200, expense: 2800 },
    { month: 'Mar', income: 3900, expense: 1950 },
    { month: 'Apr', income: 4800, expense: 3200 },
    { month: 'May', income: 5200, expense: 2700 },
    { month: 'Jun', income: 6100, expense: 3400 },
  ];

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#cbd5e1', opacity: 0.3 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #334155',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value, name) => [
              formatCurrency(value),
              name === 'income' ? 'Income (Credits)' : 'Expenses (Debits)',
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            formatter={(val) => (val === 'income' ? 'Income' : 'Expenses')}
          />
          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
