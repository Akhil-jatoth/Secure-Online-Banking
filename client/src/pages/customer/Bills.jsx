import React, { useState, useEffect } from 'react';
import { billService } from '../../services/billService.js';
import { accountService } from '../../services/accountService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { BILL_CATEGORIES, POPULAR_BILLERS } from '../../utils/constants.js';
import { formatCurrency, maskAccountNumber, formatDate } from '../../utils/formatters.js';
import { Modal } from '../../components/Modal.jsx';
import {
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  CreditCard,
  Shield,
  Receipt,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  History,
} from 'lucide-react';

export const Bills = () => {
  const [accounts, setAccounts] = useState([]);
  const [billHistory, setBillHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Electricity');
  const [selectedBiller, setSelectedBiller] = useState(POPULAR_BILLERS['Electricity'][0]);
  const [consumerNumber, setConsumerNumber] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const toast = useToast();

  const iconMap = {
    Electricity: Zap,
    Water: Droplets,
    Internet: Wifi,
    Mobile: Smartphone,
    'Credit Card': CreditCard,
    Insurance: Shield,
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accRes, billRes] = await Promise.all([
        accountService.getAccounts(),
        billService.getBills(),
      ]);

      if (accRes.success && accRes.data?.length > 0) {
        setAccounts(accRes.data);
        setSelectedAccount(accRes.data[0]._id);
      }
      if (billRes.success) {
        setBillHistory(billRes.data || []);
      }
    } catch (err) {
      toast.error('Failed to load bill payment resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCategoryChange = (catName) => {
    setSelectedCategory(catName);
    if (POPULAR_BILLERS[catName] && POPULAR_BILLERS[catName].length > 0) {
      setSelectedBiller(POPULAR_BILLERS[catName][0]);
    }
  };

  const handlePayBill = async (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.warning('Please enter a valid amount.');
      return;
    }

    const currentAcc = accounts.find((a) => a._id === selectedAccount);
    if (currentAcc && currentAcc.availableBalance < numAmount) {
      toast.error(
        `Insufficient funds in selected account (${formatCurrency(currentAcc.availableBalance)} available).`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        accountId: selectedAccount,
        category: selectedCategory,
        billerName: selectedBiller,
        consumerNumber: consumerNumber.trim(),
        amount: numAmount,
      };

      const res = await billService.payBill(payload);
      if (res.success) {
        toast.success(`Bill paid successfully! Reference: ${res.data.paymentReference}`);
        setSuccessReceipt(res.data);
        setAmount('');
        setConsumerNumber('');
        loadData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bill payment execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pay Utility Bills</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Simulate instant recurring payments for power, internet, water, and insurance providers.
        </p>
      </div>

      {/* Main Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Category Selector & Form */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          {/* Categories Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              1. Choose Bill Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BILL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                const Icon = iconMap[cat.name] || Receipt;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                      isSelected
                        ? 'border-bank-500 bg-bank-50 dark:bg-bank-950/60 text-bank-900 dark:text-white ring-2 ring-bank-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? 'bg-bank-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handlePayBill} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Biller Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Biller / Provider
                </label>
                <select
                  value={selectedBiller}
                  onChange={(e) => setSelectedBiller(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                >
                  {(POPULAR_BILLERS[selectedCategory] || []).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumer / Reference No */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Consumer / Account Number
                </label>
                <input
                  type="text"
                  required
                  value={consumerNumber}
                  onChange={(e) => setConsumerNumber(e.target.value)}
                  placeholder="e.g. ELEC-98214"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Debit Source Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pay From Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.accountType} ({maskAccountNumber(acc.accountNumber)}) - {formatCurrency(acc.availableBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bill Amount (₹ INR)
                </label>
                <div className="relative">
                  <span className="text-sm font-bold text-slate-400 absolute left-3 top-2.5 pointer-events-none">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Pay Indian Utility Bill Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Payment Tips & Summary Card */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">BBPS Bharat Bill Payment</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant bill validation & direct debit integration with Indian State Electricity Boards, Municipalities and Telcos.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">BBPS Convenience Fee:</span>
                <strong className="text-emerald-600">₹0.00 (Free)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Time:</span>
                <strong className="text-slate-900 dark:text-white">Real-Time (Instant)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Type:</span>
                <strong className="text-slate-900 dark:text-white">Certified GST Compliant</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Payment History */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bill Payment History</h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Biller & Category</th>
                <th className="py-3.5 px-4">Reference #</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Account Debited</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Date</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {billHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No bill payments recorded yet.
                  </td>
                </tr>
              ) : (
                billHistory.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {bill.billerName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {bill.category} • Consumer #{bill.consumerNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {bill.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 hidden sm:table-cell text-slate-500">
                      {bill.account?.accountNumber ? maskAccountNumber(bill.account.accountNumber) : 'Default'}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-slate-500">
                      {formatDate(bill.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                        ● Paid
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Receipt Modal */}
      {successReceipt && (
        <Modal
          isOpen={!!successReceipt}
          onClose={() => setSuccessReceipt(null)}
          title="Bill Payment Receipt"
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Payment Authorized</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(successReceipt.amount)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Paid to {successReceipt.billerName} ({successReceipt.category})
            </p>
          </div>

          <div className="mt-6 border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Reference:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successReceipt.paymentReference}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">From Account:</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                #{successReceipt.accountNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">New Available Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(successReceipt.balanceAfter)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setSuccessReceipt(null)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
