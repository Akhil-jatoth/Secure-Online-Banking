import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock, ShieldCheck, CheckCircle, Building2 } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-sky-50 via-white to-sky-100/60 dark:from-slate-900 dark:via-navy-950 dark:to-slate-950 text-slate-800 dark:text-slate-100 selection:bg-bank-500 selection:text-white">
      {/* Header */}
      <header className="px-6 py-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link to="/login" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">SURAKSHA</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-extrabold uppercase tracking-wider border border-sky-200 dark:border-sky-800">
                BANK
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              सुरक्षा आपकी, विश्वास हमारा
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-sky-200/80 dark:border-slate-700/60 shadow-sm">
          <Lock className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">RBI Simulation Guidelines & 256-Bit SSL</span>
          <span className="sm:hidden">256-Bit SSL</span>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-sky-100 dark:border-slate-800/80 bg-white/40 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Suraksha Bank of India. Academic Banking & Financial Security Simulation.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 1.3 / IMPS / UPI Enabled</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
