import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { accountService } from '../../services/accountService.js';
import { transactionService } from '../../services/transactionService.js';
import { StatCard } from '../../components/StatCard.jsx';
import { TransactionTable } from '../../components/TransactionTable.jsx';
import { SpendingChart } from '../../components/SpendingChart.jsx';
import { IncomeExpenseChart } from '../../components/IncomeExpenseChart.jsx';
import { formatCurrency, maskAccountNumber } from '../../utils/formatters.js';
import {
  Wallet,
  ArrowLeftRight,
  Receipt,
  UserPlus,
  FileText,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  PlusCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [accRes, txnRes] = await Promise.all([
          accountService.getAccounts(),
          transactionService.getTransactions({ limit: 6 }),
        ]);

        if (accRes.success) setAccounts(accRes.data || []);
        if (txnRes.success) setRecentTxns(txnRes.data?.transactions || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const primaryAccount = accounts[0] || null;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-bank-900 via-navy-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-bank-700/30">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-bank-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Customer Portal • Active Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Valued Customer'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Customer ID: <span className="font-mono text-white font-semibold">{user?.customerId}</span> • Last Login: {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
          </p>
        </div>

        {/* Quick Actions Buttons in Header */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            to="/transfer"
            className="px-4 py-2.5 rounded-xl bg-bank-500 hover:bg-bank-400 text-white text-xs font-bold shadow-lg shadow-bank-500/30 transition-all flex items-center space-x-1.5"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Funds</span>
          </Link>
          <Link
            to="/bills"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-1.5"
          >
            <Receipt className="w-4 h-4" />
            <span>Pay Bills</span>
          </Link>
        </div>

        {/* Decorative Background Circles */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-bank-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Net Liquidity"
          value={formatCurrency(totalBalance)}
          subtitle={`${accounts.length} Active Accounts`}
          icon={Wallet}
          variant="primary"
          trend="+4.2% this month"
          trendPositive={true}
        />

        <StatCard
          title="Primary Savings Account"
          value={primaryAccount ? formatCurrency(primaryAccount.availableBalance) : '$0.00'}
          subtitle={primaryAccount ? maskAccountNumber(primaryAccount.accountNumber) : 'No account'}
          icon={CreditCard}
          variant="default"
          actionButton={
            <Link to="/accounts" className="text-xs font-semibold text-bank-600 dark:text-bank-400 hover:underline">
              View Details →
            </Link>
          }
        />

        <StatCard
          title="Security & 2FA Health"
          value="100% Protected"
          subtitle="OTP Enabled on Transfers"
          icon={ShieldCheck}
          variant="dark"
          trend="Secured"
          trendPositive={true}
        />
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/transfer"
          className="glass-panel p-5 rounded-2xl hover:border-bank-500/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-bank-50 dark:bg-bank-950/60 text-bank-600 dark:text-bank-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Transfer Funds</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Send money securely</span>
        </Link>

        <Link
          to="/bills"
          className="glass-panel p-5 rounded-2xl hover:border-bank-500/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Receipt className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Pay Utility Bills</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Electricity, Water & Net</span>
        </Link>

        <Link
          to="/beneficiaries"
          className="glass-panel p-5 rounded-2xl hover:border-bank-500/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">Manage Beneficiaries</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Add or remove payees</span>
        </Link>

        <Link
          to="/statements"
          className="glass-panel p-5 rounded-2xl hover:border-bank-500/50 hover:shadow-lg transition-all group flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">PDF Statements</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Download official logs</span>
        </Link>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-3xl shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spending Analytics</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Weekly cash outflow trend</p>
            </div>
            <span className="text-xs font-bold text-bank-600 dark:text-bank-400 bg-bank-50 dark:bg-bank-950 px-2.5 py-1 rounded-lg">
              Last 7 Days
            </span>
          </div>
          <SpendingChart />
        </div>

        <div className="glass-panel p-6 rounded-3xl shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cash Inflows vs Outflows</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly credit / debit breakdown</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
              2026 Fiscal
            </span>
          </div>
          <IncomeExpenseChart />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time ledger entries</p>
          </div>
          <Link
            to="/transactions"
            className="flex items-center space-x-1 text-xs font-bold text-bank-600 hover:text-bank-700 dark:text-bank-400 dark:hover:text-bank-300"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <TransactionTable transactions={recentTxns} isLoading={isLoading} />
      </div>
    </div>
  );
};
