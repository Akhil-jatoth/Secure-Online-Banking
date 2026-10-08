import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { StatCard } from '../../components/StatCard.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import {
  Users,
  Wallet,
  ArrowLeftRight,
  ShieldAlert,
  TrendingUp,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getDashboard();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const overview = stats?.overview || {};
  const chartData = stats?.charts?.dailyTransactions || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-navy-950 border border-purple-800/40 text-white shadow-2xl">
        <div>
          <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Operations & Health
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit telemetry, customer lifecycle management, and global ledger metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs bg-slate-800/60 px-4 py-2 rounded-2xl border border-slate-700/60">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Core Engine: <strong>Operational</strong></span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={overview.totalCustomers || 0}
          subtitle="Enrolled Banking Users"
          icon={Users}
          variant="dark"
        />

        <StatCard
          title="Active Accounts"
          value={overview.activeAccounts || 0}
          subtitle={`${overview.frozenAccounts || 0} Frozen Accounts`}
          icon={Wallet}
          variant="emerald"
        />

        <StatCard
          title="Total Transactions"
          value={overview.totalTransactions || 0}
          subtitle={`${overview.successfulTransactions || 0} Success / ${overview.failedTransactions || 0} Failed`}
          icon={ArrowLeftRight}
          variant="default"
        />

        <StatCard
          title="Total System Volume"
          value={formatCurrency(overview.totalVolume || 0)}
          subtitle="Processed Transfers"
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Activity Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Transaction Flow</h3>
            <p className="text-xs text-slate-500">System throughput over the past 7 calendar days</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-xs">
            Live Stream
          </span>
        </div>

        <div className="h-72 w-full">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No transaction history recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminVolumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val, name) => [name === 'volume' ? formatCurrency(val) : val, name === 'volume' ? 'Volume' : 'Count']}
                />
                <Area type="monotone" dataKey="volume" stroke="#8b5cf6" strokeWidth={3} fill="url(#adminVolumeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
