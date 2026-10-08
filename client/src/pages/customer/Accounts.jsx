import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatCurrency, maskAccountNumber, formatDate } from '../../utils/formatters.js';
import { StatusBadge } from '../../components/Badge.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Wallet,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState('Current');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const toast = useToast();

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const res = await accountService.getAccounts();
      if (res.success) {
        setAccounts(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenAccount = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await accountService.openAccount(newAccountType);
      if (res.success) {
        toast.success(`New ${newAccountType} account #${res.data.accountNumber} opened successfully!`);
        setIsModalOpen(false);
        fetchAccounts();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAccountNumber = (accNo, id) => {
    navigator.clipboard.writeText(accNo);
    setCopiedId(id);
    toast.info(`Account number copied to clipboard: ${accNo}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Bank Accounts</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your deposit accounts, limits, and view instant account routing details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white text-xs font-bold shadow-md shadow-bank-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Open New Account</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2].map((n) => (
            <div key={n} className="h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
          ))
        ) : accounts.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-3xl">
            <Wallet className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Accounts Found</h3>
            <p className="text-xs text-slate-500 mt-1">Open your first account to get started.</p>
          </div>
        ) : (
          accounts.map((acc, idx) => {
            const isSavings = acc.accountType === 'Savings';
            return (
              <div
                key={acc._id}
                className={`relative rounded-3xl p-6 shadow-xl flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.01] ${
                  isSavings
                    ? 'bank-gradient-card text-white'
                    : 'bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white border border-slate-700/60'
                }`}
              >
                {/* Top Row: Type & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider block">
                        {acc.accountType} Account
                      </span>
                      <span className="text-[10px] text-white/80">Suraksha Core Banking</span>
                    </div>
                  </div>

                  <StatusBadge status={acc.status} />
                </div>

                {/* Account Balance */}
                <div className="my-4">
                  <p className="text-xs text-white/80 font-medium">Available Balance</p>
                  <h2 className="text-3xl font-black tracking-tight mt-1">
                    {formatCurrency(acc.availableBalance, acc.currency)}
                  </h2>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Ledger Balance: {formatCurrency(acc.balance, acc.currency)}
                  </p>
                </div>

                {/* Card Number & Copy */}
                <div className="pt-4 border-t border-white/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/70 uppercase">Account Number</p>
                      <p className="font-mono text-sm font-bold tracking-wider">
                        {maskAccountNumber(acc.accountNumber)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyAccountNumber(acc.accountNumber, acc._id)}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
                      title="Copy Full Account Number"
                    >
                      {copiedId === acc._id ? (
                        <Check className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/90">
                    <span>IFSC Code: <strong>SURB0001008</strong></span>
                    <span>Daily Limit: <strong>₹2,00,000 / day</strong></span>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <Link
                      to="/transfer"
                      className="flex-1 py-2 text-center rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-colors"
                    >
                      IMPS Transfer
                    </Link>
                    <Link
                      to="/statements"
                      className="flex-1 py-2 text-center rounded-xl bg-black/20 hover:bg-black/30 text-white font-bold text-xs backdrop-blur-sm transition-colors"
                    >
                      Statement
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Security & Account Protection Info */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              DICGC (Reserve Bank of India) Guaranteed
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deposits insured up to ₹5,00,000 under DICGC Act with multi-layered bank-grade 256-bit encryption.
            </p>
          </div>
        </div>

        <Link
          to="/security"
          className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex-shrink-0"
        >
          View Security Settings →
        </Link>
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Open Additional Bank Account"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleOpenAccount} className="space-y-5">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Expand your financial operations with instant account opening. All new accounts come with an initial ₹10,000.00 opening bonus.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNewAccountType('Savings')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  newAccountType === 'Savings'
                    ? 'border-bank-500 bg-bank-50 dark:bg-bank-950/40 text-bank-900 dark:text-bank-200 ring-2 ring-bank-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Savings Account</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  High interest & IMPS/UPI liquidity
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewAccountType('Current')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  newAccountType === 'Current'
                    ? 'border-bank-500 bg-bank-50 dark:bg-bank-950/40 text-bank-900 dark:text-bank-200 ring-2 ring-bank-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm">Current (Vyapar)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  High volume trade & commercial
                </div>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Opening Balance Bonus:</span>
              <strong className="text-emerald-600 font-mono">+₹10,000.00 INR</strong>
            </div>
            <div className="flex justify-between">
              <span>Branch / IFSC:</span>
              <strong className="text-slate-900 dark:text-white font-mono">SURB0001008</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Confirm & Open</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
