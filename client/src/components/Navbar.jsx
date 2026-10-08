import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Shield,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Key,
  ShieldCheck,
  ChevronDown,
  CheckCircle,
  Clock,
  Menu,
} from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

export const Navbar = ({ onToggleMobileMenu }) => {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                  SURAKSHA
                </span>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 uppercase tracking-widest border border-sky-200 dark:border-sky-800">
                  {isAdmin ? 'OFFICER' : 'BANK'}
                </span>
              </div>
              <p className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold tracking-wide -mt-0.5">
                DIGITAL BANKING PORTAL
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Security Badge, Theme, Notifications & User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Security Status Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>256-Bit SSL Encrypted • IMPS Ready</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((prev) => !prev)}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-bank-100 dark:bg-bank-950 text-bank-700 dark:text-bank-300 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-bank-600 hover:text-bank-700 dark:text-bank-400 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => {
                          if (!notif.isRead) markAsRead(notif._id);
                        }}
                        className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          !notif.isRead ? 'bg-bank-50/40 dark:bg-bank-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {notif.type === 'SECURITY' ? (
                              <ShieldCheck className="w-4 h-4 text-amber-500" />
                            ) : notif.type === 'TRANSACTION' ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-bank-500 flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-bank-600 hover:text-bank-700 dark:text-bank-400"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-bank-600 to-bank-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {user?.customerId || 'CUST'}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>

                {!isAdmin ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Profile & KYC</span>
                    </Link>
                    <Link
                      to="/security"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Key className="w-4 h-4 text-slate-400" />
                      <span>Security & Password</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/admin/audit-logs"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>Audit Logs</span>
                  </Link>
                )}

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Secure Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
