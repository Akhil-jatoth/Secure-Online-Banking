import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { KeyRound, Mail, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email address.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.forgotPassword({ email });
      if (res.success) {
        toast.success(res.message);
        if (res.demoCode) {
          setDemoOtp(res.demoCode);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset OTP.');
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Enter your registered email address and we'll dispatch a 6-digit MFA reset authorization code.
          </p>
        </div>

        {demoOtp && (
          <div className="mb-6 p-4 rounded-xl bg-amber-950/50 border border-amber-800/80 text-amber-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-4 h-4" /> Academic Simulation Demo OTP
              </span>
            </div>
            <p className="text-[11px] mb-3">Your generated one-time code is: <strong className="font-mono text-sm tracking-widest text-amber-100">{demoOtp}</strong></p>
            <button
              type="button"
              onClick={() => navigate('/reset-password', { state: { email, otp: demoOtp } })}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <span>Proceed to Reset Password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleRequest} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 hover:from-bank-500 hover:to-bank-600 text-white font-bold text-sm shadow-lg shadow-bank-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Request Verification Code</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between text-xs">
          <Link to="/login" className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>

          <Link
            to="/reset-password"
            state={{ email }}
            className="font-semibold text-bank-400 hover:text-bank-300 transition-colors"
          >
            Already have code? Reset →
          </Link>
        </div>
      </div>
    </div>
  );
};
