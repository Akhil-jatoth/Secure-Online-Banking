import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  ShieldAlert,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

export const AdminSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const navItems = [
    { name: 'System Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Customer Accounts', path: '/admin/customers', icon: Users },
    { name: 'System Transactions', path: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'Security Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="mb-6 px-3.5 py-3 rounded-xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-800/40 text-left">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span className="text-xs font-extrabold text-purple-200 tracking-wider uppercase">
            Admin Console
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-tight">
          Privileged System Oversight
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-900/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center">
          <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
            Immutable Audit Trail
          </p>
          <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
            All actions logged permanently
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 min-h-[calc(100vh-4rem)] flex-shrink-0">
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
