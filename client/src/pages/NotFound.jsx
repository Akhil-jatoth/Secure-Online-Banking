import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 p-4 text-center">
      <div className="max-w-md w-full glass-panel p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full bg-bank-50 dark:bg-bank-950 text-bank-600 dark:text-bank-400 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          The banking resource or page you requested could not be located in our secure network.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
