import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await login({ email, password });

      if (res.success) {
        toast.success(`Welcome back, ${res.data.user.fullName}!`);
        const destination = res.data.user.role === 'ADMIN' ? '/admin' : '/dashboard';
        navigate(location.state?.from?.pathname || destination, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    toast.info(`Filled credentials for ${demoEmail}`);
  };

  return (
    <div className="w-full max-w-md">
      {/* Demo Credentials Helper Box */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5">
          <Sparkles className="w-4 h-4" />
          <span>Quick Demo Evaluation Logins</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount('customer1@securebank.test', 'Password@12345!')}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-600/50 hover:border-bank-500 transition-all text-center"
          >
            Customer 1
            <span className="block text-[9px] text-slate-400 font-normal">Alex ($14.8k)</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('customer2@securebank.test', 'Password@12345!')}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-600/50 hover:border-bank-500 transition-all text-center"
          >
            Customer 2
            <span className="block text-[9px] text-slate-400 font-normal">Elena ($8.9k)</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount('admin@securebank.test', 'Admin@12345!')}
            className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 text-[11px] font-bold text-purple-200 border border-purple-700/60 hover:border-purple-400 transition-all text-center"
          >
            Admin Officer
            <span className="block text-[9px] text-purple-300/80 font-normal">Full RBAC</span>
          </button>
        </div>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Aegis Bank</h1>
          <p className="text-xs text-slate-400 mt-2">
            Secure multi-tier banking portal protected by biometric & MFA safeguards
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 focus:border-bank-500 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-bank-400 hover:text-bank-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-bank-500 focus:border-bank-500 outline-none transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-bank-600 to-bank-500 hover:from-bank-500 hover:to-bank-600 text-white font-bold text-sm shadow-lg shadow-bank-600/30 hover:shadow-bank-600/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          New to Aegis Bank?{' '}
          <Link to="/register" className="font-bold text-bank-400 hover:text-bank-300 transition-colors">
            Open an Account →
          </Link>
        </div>
      </div>
    </div>
  );
};
