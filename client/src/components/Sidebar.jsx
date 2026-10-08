import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Users,
  Receipt,
  FileText,
  History,
  Bell,
  User,
  ShieldCheck,
  Shield,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transfer Funds', path: '/transfer', icon: ArrowLeftRight },
    { name: 'Beneficiaries', path: '/beneficiaries', icon: Users },
    { name: 'Pay Bills', path: '/bills', icon: Receipt },
    { name: 'Account Statements', path: '/statements', icon: FileText },
    { name: 'Transaction History', path: '/transactions', icon: History },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile & KYC', path: '/profile', icon: User },
    { name: 'Security & 2FA', path: '/security', icon: ShieldCheck },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Simulation Watermark Banner */}
      <div className="mb-6 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-sm">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
          <span className="text-[11px] font-extrabold text-sky-950 dark:text-sky-200 tracking-wide uppercase">
            Suraksha NetBanking
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
          Retail & Corporate Banking
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50/80 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Trust & Compliance Badge */}
      <div className="mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="p-3 rounded-xl bg-sky-50/60 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 text-center">
          <p className="text-[11px] font-bold text-sky-900 dark:text-sky-300">
            Protected by Suraksha 2FA
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            IMPS • NEFT • RTGS • UPI
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-slide-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
