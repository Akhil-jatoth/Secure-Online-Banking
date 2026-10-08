import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService.js';
import { beneficiaryService } from '../../services/beneficiaryService.js';
import { transactionService } from '../../services/transactionService.js';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { OtpModal } from '../../components/OtpModal.jsx';
import { Modal } from '../../components/Modal.jsx';
import { formatCurrency, maskAccountNumber, formatDate } from '../../utils/formatters.js';
import {
  ArrowLeftRight,
  ShieldCheck,
  CreditCard,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transferMode, setTransferMode] = useState('beneficiary'); // 'beneficiary' | 'custom'
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [customAccountNumber, setCustomAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Transfer flow states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [accRes, benRes] = await Promise.all([
          accountService.getAccounts(),
          beneficiaryService.getBeneficiaries(),
        ]);

        if (accRes.success && accRes.data?.length > 0) {
          setAccounts(accRes.data);
          setSelectedAccount(accRes.data[0]._id);
        }
        if (benRes.success) {
          setBeneficiaries(benRes.data || []);
          if (benRes.data?.length > 0) {
            setSelectedBeneficiary(benRes.data[0]._id);
          } else {
            setTransferMode('custom');
          }
        }
      } catch (err) {
        toast.error('Failed to load transfer options.');
      }
    };

    loadInitialData();
  }, []);

  const currentSourceAccount = accounts.find((a) => a._id === selectedAccount);
  const currentBeneficiaryObj = beneficiaries.find((b) => b._id === selectedBeneficiary);

  const handleInitiateReview = (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.warning('Please enter a valid transfer amount greater than $0.00');
      return;
    }

    if (!currentSourceAccount) {
      toast.warning('Please select a source account.');
      return;
    }

    if (currentSourceAccount.availableBalance < numAmount) {
      toast.error(
        `Insufficient funds. Your available balance is ${formatCurrency(currentSourceAccount.availableBalance)}.`
      );
      return;
    }

    if (transferMode === 'custom' && !customAccountNumber.trim()) {
      toast.warning('Please provide a destination account number.');
      return;
    }

    if (transferMode === 'beneficiary' && !selectedBeneficiary) {
      toast.warning('Please select a beneficiary.');
      return;
    }

    setIsReviewOpen(true);
  };

  const handleProceedToOtp = async () => {
    try {
      setIsSubmitting(true);
      const res = await authService.requestOTP({ purpose: 'TRANSFER', email: user?.email });
      if (res.success) {
        setIsReviewOpen(false);
        setIsOtpOpen(true);
        toast.success(`Security OTP sent to your registered email (${user?.email || 'your email'}). Please check your inbox.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate transfer OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteTransfer = async (otpCode) => {
    try {
      setIsSubmitting(true);
      const payload = {
        fromAccountId: selectedAccount,
        amount: parseFloat(amount),
        description: description.trim() || 'Electronic Fund Transfer',
        otp: otpCode,
      };

      if (transferMode === 'beneficiary') {
        payload.beneficiaryId = selectedBeneficiary;
      } else {
        payload.toAccountNumber = customAccountNumber.trim();
      }

      const res = await transactionService.transfer(payload);
      if (res.success) {
        setIsOtpOpen(false);
        setSuccessReceipt(res.data);
        toast.success('Funds transferred successfully!');

        // Refresh source account balances
        const updatedAccs = await accountService.getAccounts();
        if (updatedAccs.success) setAccounts(updatedAccs.data);

        // Reset form
        setAmount('');
        setDescription('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer execution failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Transfer Funds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform instantaneous internal or domestic wire transfers backed by multi-factor authentication.
        </p>
      </div>

      {/* Main Transfer Wizard Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800">
        <form onSubmit={handleInitiateReview} className="space-y-6">
          {/* Step 1: Select Source Account */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Select Source Account
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => {
                const isSelected = selectedAccount === acc._id;
                return (
                  <button
                    key={acc._id}
                    type="button"
                    onClick={() => setSelectedAccount(acc._id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-bank-500 bg-bank-50 dark:bg-bank-950/50 ring-2 ring-bank-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {acc.accountType} Account
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-bank-600" />}
                    </div>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {maskAccountNumber(acc.accountNumber)}
                    </p>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-2">
                      {formatCurrency(acc.availableBalance, acc.currency)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Destination Mode & Account */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Recipient Destination
              </label>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setTransferMode('beneficiary')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    transferMode === 'beneficiary'
                      ? 'bg-white dark:bg-slate-900 text-bank-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Saved Beneficiaries
                </button>
                <button
                  type="button"
                  onClick={() => setTransferMode('custom')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    transferMode === 'custom'
                      ? 'bg-white dark:bg-slate-900 text-bank-600 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Enter Account #
                </button>
              </div>
            </div>

            {transferMode === 'beneficiary' ? (
              beneficiaries.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-500 mb-2">You have no saved beneficiaries.</p>
                  <button
                    type="button"
                    onClick={() => setTransferMode('custom')}
                    className="text-xs font-bold text-bank-600 hover:underline"
                  >
                    Enter Account Number Manually →
                  </button>
                </div>
              ) : (
                <select
                  value={selectedBeneficiary}
                  onChange={(e) => setSelectedBeneficiary(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                >
                  {beneficiaries.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({maskAccountNumber(b.accountNumber)}) - {b.bankName}
                    </option>
                  ))}
                </select>
              )
            ) : (
              <div>
                <input
                  type="text"
                  required
                  value={customAccountNumber}
                  onChange={(e) => setCustomAccountNumber(e.target.value)}
                  placeholder="Enter 10-12 digit destination account number (e.g. 100871928301)"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: Demo Customer 2's account is <strong className="font-mono text-slate-600 dark:text-slate-300">100871928301</strong>
                </p>
              </div>
            )}
          </div>

          {/* Step 3: Amount & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                3. Transfer Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="text-base font-bold text-slate-400 absolute left-3.5 top-3 pointer-events-none">₹</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
                />
              </div>
              {currentSourceAccount && (
                <div className="flex justify-between text-[11px] text-slate-500 mt-1 px-1">
                  <span>Available: {formatCurrency(currentSourceAccount.availableBalance)}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(currentSourceAccount.availableBalance.toString())}
                    className="font-bold text-bank-600 hover:underline"
                  >
                    Transfer Max
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                4. Transfer Remarks / Narration
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Rent, Consultancy, Family Support"
                maxLength={100}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-sm shadow-lg shadow-bank-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Review IMPS / NEFT Transfer Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Review Dialog Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Review IMPS / NEFT Summary"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-bank-50 dark:bg-bank-950/60 border border-bank-200 dark:border-bank-800 text-center">
            <span className="text-[11px] text-bank-700 dark:text-bank-300 font-bold uppercase tracking-wider">
              Total Remittance Amount
            </span>
            <h2 className="text-3xl font-black text-bank-900 dark:text-white mt-1">
              {formatCurrency(amount)}
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-b border-slate-100 dark:border-slate-800 py-2">
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">From Account:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {currentSourceAccount?.accountType} ({maskAccountNumber(currentSourceAccount?.accountNumber)})
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Beneficiary:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {transferMode === 'beneficiary'
                  ? `${currentBeneficiaryObj?.name} (${maskAccountNumber(currentBeneficiaryObj?.accountNumber)}) - ${currentBeneficiaryObj?.bankName}`
                  : customAccountNumber}
              </span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Transfer Channel:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">IMPS 24x7 Instant Remittance</span>
            </div>
            <div className="py-2 flex justify-between">
              <span className="text-slate-500">Bank Service Charges:</span>
              <span className="font-bold text-emerald-600">₹0.00 (Zero Fee)</span>
            </div>
            {description && (
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Narration / Remark:</span>
                <span className="font-medium text-slate-900 dark:text-white max-w-[180px] text-right">
                  {description}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>This transfer requires Two-Factor OTP authorization.</span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReviewOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={handleProceedToOtp}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold shadow-md flex items-center justify-center space-x-1.5"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Request OTP & Authorize</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleExecuteTransfer}
        purpose="TRANSFER"
        isLoading={isSubmitting}
        title="Fund Transfer Authorization"
        description={`A 6-digit IMPS transfer authorization code has been dispatched to your registered email (${user?.email || 'registered email'}). Enter the code below to authorize transferring ${formatCurrency(amount)}.`}
      />

      {/* Success Receipt Modal */}
      {successReceipt && (
        <Modal
          isOpen={!!successReceipt}
          onClose={() => setSuccessReceipt(null)}
          title="Transfer Successful"
          maxWidth="max-w-md"
        >
          <div className="flex flex-col items-center text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Transaction Settled</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(successReceipt.amount, successReceipt.currency)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sent to Account #{successReceipt.receiverAccountNumber}
            </p>
          </div>

          <div className="mt-6 border-t border-b border-slate-100 dark:border-slate-800 py-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successReceipt.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Reference Number:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successReceipt.referenceNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(successReceipt.balanceAfter)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Completed At:</span>
              <span className="text-slate-900 dark:text-white">
                {formatDate(successReceipt.createdAt)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setSuccessReceipt(null)}
              className="w-full py-3 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done & Return
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
