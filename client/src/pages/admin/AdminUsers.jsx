import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Modal } from '../../components/Modal.jsx';
import { ConfirmDialog } from '../../components/ConfirmDialog.jsx';
import { StatusBadge } from '../../components/Badge.jsx';
import { formatCurrency, maskAccountNumber, formatDate } from '../../utils/formatters.js';
import {
  Users,
  Search,
  Lock,
  Unlock,
  Eye,
  ShieldAlert,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // User detail state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Freeze/Unfreeze state
  const [freezingAccount, setFreezingAccount] = useState(null);
  const [unfreezingAccount, setUnfreezingAccount] = useState(null);
  const [freezeReason, setFreezeReason] = useState('Suspicious activity / Administrative security hold');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: search.trim() || undefined,
        role: 'CUSTOMER',
      });
      if (res.success) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load customers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleViewDetails = async (userId) => {
    try {
      const res = await adminService.getUserById(userId);
      if (res.success) {
        setSelectedUser(res.data);
        setIsDetailOpen(true);
      }
    } catch {
      toast.error('Failed to load user details.');
    }
  };

  const handleFreezeConfirm = async () => {
    if (!freezingAccount) return;
    try {
      setIsSubmitting(true);
      const res = await adminService.freezeAccount(freezingAccount._id, freezeReason);
      if (res.success) {
        toast.success(`Account #${res.data.accountNumber} has been FROZEN.`);
        setFreezingAccount(null);
        fetchUsers(pagination.page);
        if (selectedUser) handleViewDetails(selectedUser.user._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Freeze action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnfreezeConfirm = async () => {
    if (!unfreezingAccount) return;
    try {
      setIsSubmitting(true);
      const res = await adminService.unfreezeAccount(unfreezingAccount._id);
      if (res.success) {
        toast.success(`Account #${res.data.accountNumber} has been REACTIVATED.`);
        setUnfreezingAccount(null);
        fetchUsers(pagination.page);
        if (selectedUser) handleViewDetails(selectedUser.user._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unfreeze action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Customer Account Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Inspect customer profiles, monitor deposit accounts, and enforce administrative account freezing controls.
        </p>
      </div>

      {/* Search Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer ID, name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Customer ID</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Contact Phone</th>
              <th className="py-3.5 px-4">Accounts & Balances</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  Loading customer records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No customer records matched your query.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div>
                      <span className="font-bold text-white block">{u.fullName}</span>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-purple-300">
                    {u.customerId}
                  </td>

                  <td className="py-3.5 px-4 hidden sm:table-cell text-slate-400">
                    {u.phoneNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {u.accounts?.map((acc) => (
                        <div key={acc._id} className="flex items-center space-x-2 text-[11px]">
                          <span className="font-mono text-slate-400">#{acc.accountNumber}</span>
                          <span className="font-bold text-white">{formatCurrency(acc.balance)}</span>
                          <StatusBadge status={acc.status} />
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(u._id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white font-semibold text-xs transition-colors flex items-center space-x-1 mx-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
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
        onPageChange={(p) => fetchUsers(p)}
      />

      {/* User Details & Account Freeze Control Modal */}
      {selectedUser && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Customer File: ${selectedUser.user.fullName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs text-slate-300">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-white">{selectedUser.user.fullName}</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Customer ID: <strong className="text-purple-300 font-mono">{selectedUser.user.customerId}</strong>
                </p>
                <p className="text-slate-400 text-[11px]">Email: {selectedUser.user.email} • Phone: {selectedUser.user.phoneNumber}</p>
              </div>

              <div className="text-left sm:text-right text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  Verified Customer
                </span>
                <p className="text-slate-400 mt-1">
                  Enrolled: {new Date(selectedUser.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Account List & Freeze Toggles */}
            <div>
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">
                Deposit Accounts & Security Controls
              </h4>

              <div className="space-y-3">
                {selectedUser.accounts?.map((acc) => (
                  <div
                    key={acc._id}
                    className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">
                          {acc.accountType} Account (#{acc.accountNumber})
                        </span>
                        <StatusBadge status={acc.status} />
                      </div>
                      <p className="text-sm font-extrabold text-emerald-400 mt-1">
                        {formatCurrency(acc.balance, acc.currency)}{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          (Available: {formatCurrency(acc.availableBalance, acc.currency)})
                        </span>
                      </p>
                    </div>

                    <div>
                      {acc.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() => setFreezingAccount(acc)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Freeze Account</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setUnfreezingAccount(acc)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unfreeze Account</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Audit Logs for User */}
            <div>
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
                Recent Security Audit Logs
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-800 font-mono text-[11px]">
                {selectedUser.auditLogs?.map((log) => (
                  <div key={log._id} className="pt-1.5 flex justify-between">
                    <span className="text-slate-400">[{log.action}]</span>
                    <span className="text-slate-300">{log.resource}</span>
                    <span className="text-slate-500">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Freeze Account Dialog */}
      {freezingAccount && (
        <Modal
          isOpen={!!freezingAccount}
          onClose={() => setFreezingAccount(null)}
          title="Freeze Customer Bank Account"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="w-12 h-12 bg-rose-950/80 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <p className="text-center text-slate-300">
              Freezing account <strong className="text-white font-mono">#{freezingAccount.accountNumber}</strong> will immediately disable all fund transfers and bill payments.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Reason for Freeze (Audit Logged)
              </label>
              <textarea
                rows={3}
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-rose-500 text-xs"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setFreezingAccount(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreezeConfirm}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Confirm Freeze
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Unfreeze Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!unfreezingAccount}
        onClose={() => setUnfreezingAccount(null)}
        onConfirm={handleUnfreezeConfirm}
        title="Reactivate Bank Account"
        message={`Are you sure you want to unfreeze account #${unfreezingAccount?.accountNumber}? This will restore all transaction privileges.`}
        confirmText="Reactivate Account"
        isLoading={isSubmitting}
      />
    </div>
  );
};
