import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { KeyRound, Mail, Lock, Key, ArrowRight, Check, X, Eye, EyeOff } from 'lucide-react';

export const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(location.state?.otp || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const passwordCriteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'One number (0-9)', met: /\d/.test(newPassword) },
    { label: 'One special char (!@#$%)', met: /[@$!%*?&#^~_\-+=<>.,/|\\]/.test(newPassword) },
  ];

  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!allCriteriaMet) {
      toast.warning('Please fulfill all password security requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('Passwords do not match.');
      return;
    }

    if (otp.length !== 6) {
      toast.warning('Please enter a 6-digit OTP code.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.resetPassword({ email, otp, newPassword });
      if (res.success) {
        toast.success('Password successfully reset! You may now sign in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed. Check your OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-bank-500/10 text-bank-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-bank-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400 mt-2">
            Verify your identity with your 6-digit OTP code and choose a new secure password.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">6-Digit OTP Code</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest placeholder-slate-500 focus:ring-2 focus:ring-bank-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 outline-none"
              />
            </div>
          </div>

          {/* Criteria Checklist */}
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1 text-[11px]">
            {passwordCriteria.map((c, i) => (
              <div
                key={i}
                className={`flex items-center space-x-1.5 ${
                  c.met ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {c.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{c.label}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !allCriteriaMet || otp.length !== 6}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 hover:from-bank-500 hover:to-bank-600 text-white font-bold text-sm shadow-lg shadow-bank-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Reset Password & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="font-semibold text-bank-400 hover:text-bank-300">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
