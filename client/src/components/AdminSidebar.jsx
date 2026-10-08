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
      <div className="mb-6 px-3.5 py-3 rounded-xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 text-left shadow-sm">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span className="text-xs font-extrabold text-sky-200 tracking-wider uppercase">
            Bank Officer Portal
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-tight">
          Suraksha Core Banking Oversight
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
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-900/30 font-semibold'
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
        <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 text-center">
          <p className="text-[11px] font-bold text-sky-900 dark:text-sky-300">
            Immutable Audit Trail
          </p>
          <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">
            RBI & ISO 27001 Certified
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
