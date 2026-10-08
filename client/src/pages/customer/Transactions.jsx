import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/transactionService.js';
import { TransactionTable } from '../../components/TransactionTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Search, Filter, Calendar, History, ArrowUpDown } from 'lucide-react';

export const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const fetchTransactions = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        type: type || undefined,
        status: status || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
      };

      const res = await transactionService.getTransactions(params);
      if (res.success) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [type, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const resetFilters = () => {
    setSearch('');
    setType('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setTimeout(() => fetchTransactions(1), 50);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Transaction History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete ledger of all account deposits, electronic wires, bill settlements, and withdrawals.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, description, or memo..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Type Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Type:</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold outline-none"
            >
              <option value="">All Types</option>
              <option value="TRANSFER">Transfers</option>
              <option value="BILL_PAYMENT">Bill Payments</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
            />
            <span className="text-slate-500 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
            />
            <button
              type="button"
              onClick={() => fetchTransactions(1)}
              className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold hover:bg-slate-300"
            >
              Filter
            </button>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-bank-600 dark:text-bank-400 font-semibold hover:underline ml-auto"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Transactions Table & Pagination */}
      <div className="space-y-4">
        <TransactionTable transactions={transactions} isLoading={isLoading} />
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(p) => fetchTransactions(p)}
        />
      </div>
    </div>
  );
};
