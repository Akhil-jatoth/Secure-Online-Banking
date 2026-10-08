import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import { Pagination } from '../../components/Pagination.jsx';
import { Modal } from '../../components/Modal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { formatDate } from '../../utils/formatters.js';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Info,
} from 'lucide-react';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [inspectLog, setInspectLog] = useState(null);

  const toast = useToast();

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: 20,
        search: search.trim() || undefined,
        action: action || undefined,
        status: status || undefined,
      };

      const res = await adminService.getAuditLogs(params);
      if (res.success) {
        setLogs(res.data.logs || []);
        setPagination(res.data.pagination);
      }
    } catch {
      toast.error('Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [action, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Immutable Security Audit Trail</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete, tamper-evident chronological event log of authentication attempts, account state transitions, and administrative operations.
        </p>
      </div>

      {/* Filter Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-3 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user email, resource, or IP address..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
          >
            Filter
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none font-semibold"
          >
            <option value="">All Security Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="FAILED_LOGIN">FAILED_LOGIN</option>
            <option value="ACCOUNT_LOCKOUT">ACCOUNT_LOCKOUT</option>
            <option value="REGISTRATION">REGISTRATION</option>
            <option value="FUND_TRANSFER_SUCCESS">FUND_TRANSFER_SUCCESS</option>
            <option value="ACCOUNT_FREEZE">ACCOUNT_FREEZE</option>
            <option value="ACCOUNT_UNFREEZE">ACCOUNT_UNFREEZE</option>
            <option value="BENEFICIARY_CREATE">BENEFICIARY_CREATE</option>
            <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 outline-none font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILURE">FAILURE</option>
            <option value="WARNING">WARNING</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <table className="w-full text-left border-collapse text-xs text-slate-300">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-800/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Security Action</th>
              <th className="py-3.5 px-4">User / Subject</th>
              <th className="py-3.5 px-4">Target Resource</th>
              <th className="py-3.5 px-4">Origin IP</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  Loading security audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  No audit logs recorded for this criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                let statusBadge = (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 text-[10px]">
                    SUCCESS
                  </span>
                );
                if (log.status === 'FAILURE') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 font-bold border border-rose-800 text-[10px]">
                      FAILURE
                    </span>
                  );
                } else if (log.status === 'WARNING') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-800 text-[10px]">
                      WARNING
                    </span>
                  );
                }

                return (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">
                      {formatDate(log.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-purple-300">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {log.userEmail || 'Anonymous / Pre-Auth'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {log.resource} {log.resourceId ? `(#${log.resourceId.slice(-6)})` : ''}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {log.ipAddress}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {statusBadge}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setInspectLog(log)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                        title="Inspect Payload"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(p) => fetchLogs(p)}
      />

      {/* Metadata Inspector Modal */}
      {inspectLog && (
        <Modal
          isOpen={!!inspectLog}
          onClose={() => setInspectLog(null)}
          title={`Audit Log Record: ${inspectLog.action}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Event Action</span>
                <strong className="text-purple-300 font-mono text-sm">{inspectLog.action}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <strong className="text-white">{inspectLog.status}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Origin IP</span>
                <span className="font-mono text-white">{inspectLog.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                <span className="text-white">{formatDate(inspectLog.createdAt)}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">User Agent</span>
              <p className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-slate-400 break-all border border-slate-800">
                {inspectLog.userAgent || 'Unknown'}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">Metadata & Security Payload</span>
              <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                {JSON.stringify(inspectLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
