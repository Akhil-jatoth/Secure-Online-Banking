import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { Pagination } from '../../components/Pagination.jsx';
import { StatusBadge } from '../../components/Badge.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatters.js';
import { Search, ArrowLeftRight, CheckCircle2, XCircle } from 'lucide-react';

export const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const fetchTransactions = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        type: type || undefined,
        status: status || undefined,
      };

      const res = await adminService.getTransactions(params);
      if (res.success) {
        setTransactions(res.data.transactions || []);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error('Failed to load global transaction log.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [type, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Global Transaction Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Supervisory monitor for all electronic fund transfers, bill payments, and settlements.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference # or description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none font-semibold"
          >
            <option value="">All Types</option>
            <option value="TRANSFER">Transfer</option>
            <option value="BILL_PAYMENT">Bill Payment</option>
            <option value="DEPOSIT">Deposit</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left border-collapse text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Txn ID / Ref</th>
              <th className="py-3.5 px-4">Sender User & Acct</th>
              <th className="py-3.5 px-4">Receiver User & Acct</th>
              <th className="py-3.5 px-4">Type</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No system transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-purple-300 font-bold block">{t.referenceNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.transactionId}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">
                      {t.senderUser?.fullName || 'External / System'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {t.senderAccount ? `#${t.senderAccount.accountNumber}` : 'N/A'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-white block">
                      {t.receiverUser?.fullName || t.category || 'Third-Party'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {t.receiverAccount ? `#${t.receiverAccount.accountNumber}` : 'N/A'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                      {t.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-white text-sm">
                    {formatCurrency(t.amount, t.currency)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={t.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                    {formatDate(t.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(p) => fetchTransactions(p)}
      />
    </div>
  );
};
