import React, { useState, useEffect } from 'react';
import { statementService } from '../../services/statementService.js';
import { accountService } from '../../services/accountService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, maskAccountNumber, formatDate } from '../../utils/formatters.js';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
} from 'lucide-react';

export const Statements = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statementData, setStatementData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchInitialAccounts = async () => {
      try {
        const res = await accountService.getAccounts();
        if (res.success && res.data?.length > 0) {
          setAccounts(res.data);
          setSelectedAccountId(res.data[0]._id);
        }
      } catch {
        toast.error('Failed to load accounts for statement.');
      }
    };
    fetchInitialAccounts();
  }, []);

  const fetchStatement = async () => {
    if (!selectedAccountId) return;
    try {
      setIsLoading(true);
      const params = {
        accountId: selectedAccountId,
        timeframe,
      };
      if (timeframe === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await statementService.getStatementSummary(params);
      if (res.success) {
        setStatementData(res.data);
      }
    } catch (err) {
      toast.error('Failed to generate statement summary.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccountId) {
      fetchStatement();
    }
  }, [selectedAccountId, timeframe]);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const params = {
        accountId: selectedAccountId,
        timeframe,
      };
      if (timeframe === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      await statementService.downloadStatementPDF(params);
      toast.success('Official PDF Statement downloaded successfully.');
    } catch (err) {
      toast.error('Failed to generate downloadable PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account Statements</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate, preview, and download official certified electronic bank statements in PDF format.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isDownloading || !statementData}
          className="px-4 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white text-xs font-bold shadow-md shadow-bank-600/20 transition-all flex items-center space-x-2 disabled:opacity-50 self-start sm:self-auto"
        >
          {isDownloading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>Download PDF Statement</span>
        </button>
      </div>

      {/* Control Bar: Account & Period Selectors */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Account Selector */}
        <div className="flex-1 max-w-xs">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Select Account
          </label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none"
          >
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountType} ({maskAccountNumber(acc.accountNumber)}) - {formatCurrency(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Timeframe Buttons */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Statement Period
          </label>
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 3 Months' },
              { id: 'custom', label: 'Custom Range' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeframe(t.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  timeframe === t.id
                    ? 'bg-white dark:bg-slate-900 text-bank-600 dark:text-bank-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Inputs */}
        {timeframe === 'custom' && (
          <div className="flex items-center space-x-2 pt-2 md:pt-0">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
            />
            <button
              type="button"
              onClick={fetchStatement}
              className="px-3 py-1.5 rounded-xl bg-bank-600 text-white font-bold text-xs"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Statement Preview Document Card */}
      {isLoading ? (
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ) : statementData ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-sky-700 dark:text-sky-400">SURAKSHA BANK</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 font-bold uppercase">
                  Official Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Branch: <strong className="text-slate-800 dark:text-slate-200">Nariman Point Mumbai (IFSC: SURB0001008)</strong>
              </p>
              <p className="text-xs text-slate-500">
                Period: <strong className="text-slate-900 dark:text-white">{statementData.period}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{statementData.customerName}</p>
              <p className="font-mono text-slate-500">A/C No: {statementData.maskedAccountNumber}</p>
              <p className="text-slate-400 text-[11px]">Type: {statementData.accountType} Deposit (INR ₹)</p>
            </div>
          </div>

          {/* Balance Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Opening Balance</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(statementData.openingBalance)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Total Credits (+)</span>
              <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{formatCurrency(statementData.totalCredits)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Total Debits (-)</span>
              <p className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                -{formatCurrency(statementData.totalDebits)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-bank-600 dark:text-bank-400 uppercase">Closing Balance</span>
              <p className="text-base sm:text-lg font-extrabold text-bank-600 dark:text-bank-400 mt-1">
                {formatCurrency(statementData.closingBalance)}
              </p>
            </div>
          </div>

          {/* Statement Transaction Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Itemized Transactions ({statementData.transactionCount})
            </h4>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference #</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {statementData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No transactions recorded in this statement timeframe.
                      </td>
                    </tr>
                  ) : (
                    statementData.transactions.map((tx) => {
                      const isDebit = tx.direction === 'DEBIT';
                      return (
                        <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {formatDate(tx.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {tx.referenceNumber || tx.transactionId?.slice(0, 14)}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                            {tx.description}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                              {tx.type}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              isDebit ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {isDebit ? '-' : '+'}
                            {formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statement Footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Official Electronic Statement • Generated on {new Date().toLocaleDateString()}</span>
            <span className="flex items-center space-x-1 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Integrity</span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
