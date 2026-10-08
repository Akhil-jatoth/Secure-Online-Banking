import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Receipt, CheckCircle, Clock, XCircle, FileText, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { StatusBadge } from './Badge.jsx';
import { Modal } from './Modal.jsx';

export const TransactionTable = ({ transactions = [], isLoading = false, showViewAll = false }) => {
  const [selectedTx, setSelectedTx] = useState(null);

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">No transactions found</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Recent fund transfers, bill payments, and deposits will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Transaction</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Reference</th>
              <th className="py-3.5 px-4 hidden md:table-cell">Date & Time</th>
              <th className="py-3.5 px-4 hidden lg:table-cell">Type</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {transactions.map((tx) => {
              const isDebit = tx.direction === 'DEBIT';
              const sign = isDebit ? '-' : '+';
              const amountColor = isDebit
                ? 'text-slate-900 dark:text-white font-bold'
                : 'text-emerald-600 dark:text-emerald-400 font-bold';

              return (
                <tr
                  key={tx._id || tx.transactionId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  {/* Transaction Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isDebit
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {isDebit ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                          {tx.description || tx.category || 'Bank Transfer'}
                        </p>
                        <p className="text-[11px] text-slate-400 sm:hidden">
                          {formatDate(tx.createdAt, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Reference */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                    {tx.referenceNumber || tx.transactionId?.slice(0, 14)}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                      {tx.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className={`py-3.5 px-4 text-right text-sm ${amountColor}`}>
                    {sign}
                    {formatCurrency(tx.amount, tx.currency)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={tx.status} />
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-bank-600 hover:bg-bank-50 dark:hover:bg-slate-800 transition-colors"
                      title="View Receipt"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Transaction Receipt"
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center text-center pb-2">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                selectedTx.direction === 'DEBIT'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
              }`}
            >
              {selectedTx.direction === 'DEBIT' ? (
                <ArrowUpRight className="w-7 h-7" />
              ) : (
                <ArrowDownLeft className="w-7 h-7" />
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {selectedTx.type} • {selectedTx.direction}
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {selectedTx.direction === 'DEBIT' ? '-' : '+'}
              {formatCurrency(selectedTx.amount, selectedTx.currency)}
            </h2>
            <div className="mt-2">
              <StatusBadge status={selectedTx.status} />
            </div>
          </div>

          <div className="mt-6 border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Reference Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {selectedTx.referenceNumber || selectedTx.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Timestamp</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatDate(selectedTx.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Description</span>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-[200px]">
                {selectedTx.description || 'N/A'}
              </span>
            </div>
            {selectedTx.category && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Category</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {selectedTx.category}
                </span>
              </div>
            )}
            {selectedTx.balanceAfterSender !== undefined && selectedTx.direction === 'DEBIT' && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Balance After Transaction</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedTx.balanceAfterSender)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 text-center">
            Certified Electronic Receipt • Aegis Secure Banking Simulation
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};
