import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock, ShieldCheck, CheckCircle } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-slate-900 via-navy-950 to-slate-950 text-slate-100 selection:bg-bank-500 selection:text-white">
      {/* Header */}
      <header className="px-6 py-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link to="/login" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-bank-600 to-bank-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">AEGIS</span>
            <span className="text-xs ml-1.5 px-2 py-0.5 rounded-md bg-bank-500/20 text-bank-300 font-semibold uppercase tracking-wider border border-bank-500/30">
              BANK
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIPS 140-2 Compliant Security Simulation</span>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Aegis Secure Online Banking Simulation. Academic Software Engineering Project.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TLS 1.3 / AES-256</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
