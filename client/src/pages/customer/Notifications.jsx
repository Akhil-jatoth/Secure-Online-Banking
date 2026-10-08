import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { formatDate } from '../../utils/formatters.js';
import {
  Bell,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCheck,
  Filter,
} from 'lucide-react';

export const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Security & Alerts Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System notices, authentication activities, and transaction confirmations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-bank-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-bank-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
            filter === 'unread'
              ? 'bg-bank-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl">
            <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1">You are completely caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => {
            let icon = <Clock className="w-5 h-5 text-blue-500" />;
            if (notif.type === 'SECURITY') icon = <ShieldCheck className="w-5 h-5 text-amber-500" />;
            if (notif.type === 'TRANSACTION') icon = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;

            return (
              <div
                key={notif._id}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif._id);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 ${
                  !notif.isRead
                    ? 'bg-bank-50/60 dark:bg-bank-950/30 border-bank-200 dark:border-bank-800 shadow-sm'
                    : 'glass-panel border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex-shrink-0">
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-bank-500 flex-shrink-0 mt-2"></span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
