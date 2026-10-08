import React, { useState, useEffect } from 'react';
import { beneficiaryService } from '../../services/beneficiaryService.js';
import { authService } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { OtpModal } from '../../components/OtpModal.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';
import { maskAccountNumber, formatDate } from '../../utils/formatters.js';
import {
  Users,
  UserPlus,
  Building2,
  Trash2,
  Edit2,
  ShieldCheck,
  Search,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Beneficiary State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newBen, setNewBen] = useState({
    name: '',
    nickname: '',
    accountNumber: '',
    bankName: 'Aegis Bank',
    routingNumber: 'AEGIS0018',
  });

  // Edit Beneficiary State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBen, setEditingBen] = useState(null);

  // Delete Beneficiary State
  const [deletingId, setDeletingId] = useState(null);

  // OTP flow for Add/Delete
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState('ADD_BENEFICIARY');
  const [demoOtp, setDemoOtp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const fetchBeneficiaries = async () => {
    try {
      setIsLoading(true);
      const res = await beneficiaryService.getBeneficiaries();
      if (res.success) {
        setBeneficiaries(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load beneficiaries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleStartAdd = (e) => {
    e.preventDefault();
    if (!newBen.name.trim() || !newBen.accountNumber.trim()) {
      toast.warning('Please provide the recipient name and account number.');
      return;
    }
    setOtpPurpose('ADD_BENEFICIARY');
    requestOtpForAction('ADD_BENEFICIARY');
  };

  const handleStartDelete = (id) => {
    setDeletingId(id);
    setOtpPurpose('DELETE_BENEFICIARY');
    requestOtpForAction('DELETE_BENEFICIARY');
  };

  const requestOtpForAction = async (purpose) => {
    try {
      setIsSubmitting(true);
      const res = await authService.requestOTP({ purpose });
      if (res.success) {
        setDemoOtp(res.data?.demoCode || null);
        setIsAddOpen(false);
        setIsOtpOpen(true);
        toast.info(res.message || 'Verification code dispatched.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAction = async (otpCode) => {
    try {
      setIsSubmitting(true);
      if (otpPurpose === 'ADD_BENEFICIARY') {
        const res = await beneficiaryService.addBeneficiary({ ...newBen, otp: otpCode });
        if (res.success) {
          toast.success(`Beneficiary "${res.data.name}" added successfully!`);
          setIsOtpOpen(false);
          setNewBen({
            name: '',
            nickname: '',
            accountNumber: '',
            bankName: 'Aegis Bank',
            routingNumber: 'AEGIS0018',
          });
          fetchBeneficiaries();
        }
      } else if (otpPurpose === 'DELETE_BENEFICIARY') {
        const res = await beneficiaryService.deleteBeneficiary(deletingId, otpCode);
        if (res.success) {
          toast.success(res.message || 'Beneficiary deleted.');
          setIsOtpOpen(false);
          setDeletingId(null);
          fetchBeneficiaries();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Check OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBen) return;
    try {
      setIsSubmitting(true);
      const res = await beneficiaryService.updateBeneficiary(editingBen._id, {
        name: editingBen.name,
        nickname: editingBen.nickname,
        bankName: editingBen.bankName,
        routingNumber: editingBen.routingNumber,
      });
      if (res.success) {
        toast.success('Beneficiary updated successfully.');
        setIsEditOpen(false);
        fetchBeneficiaries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = beneficiaries.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.accountNumber.includes(search) ||
      (b.nickname && b.nickname.toLowerCase().includes(search.toLowerCase())) ||
      b.bankName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Saved Beneficiaries</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage trusted payees for quick and secure fund transfers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white text-xs font-bold shadow-md shadow-bank-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Beneficiary</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, nickname, or account number..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
        />
      </div>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-3xl">
            <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Beneficiaries Found</h3>
            <p className="text-xs text-slate-500 mt-1">Add a recipient to start making direct wire transfers.</p>
          </div>
        ) : (
          filtered.map((b) => (
            <div
              key={b._id}
              className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-bank-500/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-bank-600 to-bank-400 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {b.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {b.name}
                      </h4>
                      {b.nickname && (
                        <p className="text-[11px] text-bank-600 dark:text-bank-400 font-medium">
                          "{b.nickname}"
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>Account No:</span>
                    <strong className="font-mono text-slate-900 dark:text-white">
                      {maskAccountNumber(b.accountNumber)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{b.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Routing (IFSC):</span>
                    <strong className="font-mono text-slate-900 dark:text-white">{b.routingNumber}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link
                  to="/transfer"
                  className="flex items-center space-x-1 text-xs font-bold text-bank-600 hover:text-bank-700 dark:text-bank-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Funds</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBen({ ...b });
                      setIsEditOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Nickname / Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartDelete(b._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete Beneficiary (Requires OTP)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register New Beneficiary"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStartAdd} className="space-y-4">
          <p className="text-xs text-slate-500">
            Adding a new beneficiary requires 2FA authorization code verification.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Recipient Name
            </label>
            <input
              type="text"
              required
              value={newBen.name}
              onChange={(e) => setNewBen({ ...newBen, name: e.target.value })}
              placeholder="e.g. Elena Rostova"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Beneficiary Account Number
            </label>
            <input
              type="text"
              required
              value={newBen.accountNumber}
              onChange={(e) => setNewBen({ ...newBen, accountNumber: e.target.value })}
              placeholder="e.g. 100871928301"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                required
                value={newBen.bankName}
                onChange={(e) => setNewBen({ ...newBen, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Routing / IFSC Code
              </label>
              <input
                type="text"
                required
                value={newBen.routingNumber}
                onChange={(e) => setNewBen({ ...newBen, routingNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nickname / Reference (Optional)
            </label>
            <input
              type="text"
              value={newBen.nickname}
              onChange={(e) => setNewBen({ ...newBen, nickname: e.target.value })}
              placeholder="e.g. Landlord or Sister"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
            />
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md"
            >
              Continue to OTP
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Beneficiary Modal */}
      {editingBen && (
        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Edit Beneficiary Details"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={editingBen.name}
                onChange={(e) => setEditingBen({ ...editingBen, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nickname
              </label>
              <input
                type="text"
                value={editingBen.nickname || ''}
                onChange={(e) => setEditingBen({ ...editingBen, nickname: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => {
          setIsOtpOpen(false);
          setDeletingId(null);
        }}
        onVerify={handleVerifyOtpAction}
        purpose={otpPurpose}
        demoCode={demoOtp}
        isLoading={isSubmitting}
        title={otpPurpose === 'ADD_BENEFICIARY' ? 'Authorize Adding Beneficiary' : 'Authorize Removing Beneficiary'}
        description="Please confirm this sensitive beneficiary action by entering your 6-digit OTP code."
      />
    </div>
  );
};
