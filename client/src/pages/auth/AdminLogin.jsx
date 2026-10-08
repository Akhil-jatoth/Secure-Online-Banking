import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building2,
  KeyRound,
  Fingerprint,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';

export const AdminLogin = () => {
  const [step, setStep] = useState('CREDENTIALS'); // 'CREDENTIALS' | 'OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [officerCode, setOfficerCode] = useState('OFFICER-MAIN-01');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let timer;
    if (step === 'OTP' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter administrator email and password.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await login({ email, password });

      if (res.data?.requiresOtp) {
        if (res.data.role !== 'ADMIN') {
          toast.error('Access Denied: This portal is strictly restricted to Bank Staff & Security Administrators.');
          setErrorMessage('Access Denied: Your account does not possess Bank Officer clearance.');
          return;
        }

        setStep('OTP');
        setTimeLeft(300);
        toast.success(`Security clearance OTP sent to ${res.data.email}`);
      } else if (res.data?.token) {
        if (res.data.user?.role !== 'ADMIN') {
          toast.error('Access Denied: This portal is strictly restricted to Bank Staff & Security Administrators.');
          setErrorMessage('Access Denied: Your account does not possess Bank Officer clearance.');
          return;
        }

        toast.success(`Admin clearance verified! Welcome, ${res.data.user?.fullName}.`);
        navigate(location.state?.from?.pathname || '/admin', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please verify administrative credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      toast.warning('Please enter the 6-digit staff authorization OTP.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await login({ email, password, otp: otpCode });

      if (res.data?.token) {
        if (res.data.user?.role !== 'ADMIN') {
          toast.error('Access Denied: This portal is strictly restricted to Bank Staff & Security Administrators.');
          setErrorMessage('Access Denied: Your account does not possess Bank Officer clearance.');
          return;
        }

        toast.success(`Officer Clearance Approved! Welcome, ${res.data.user?.fullName}.`);
        navigate(location.state?.from?.pathname || '/admin', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      await login({ email, password });
      setTimeLeft(300);
      toast.success(`New clearance OTP dispatched to ${email}`);
    } catch (err) {
      toast.error('Failed to resend clearance OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@securebank.test');
    setPassword('Admin@12345!');
    setOfficerCode('OFFICER-MUMBAI-01');
    setErrorMessage('');
    toast.info('Filled Administrator Officer credentials.');
  };

  return (
    <div className="w-full max-w-md">
      {/* Quick Demo Fill Box (Step 1 only) */}
      {step === 'CREDENTIALS' && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-800/60 backdrop-blur-md shadow-xl text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Bank Officer Fast-Access</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
              Staff Only
            </span>
          </div>

          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-xs font-bold text-white shadow-md shadow-sky-600/30 transition-all flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Fill Admin / Security Officer Credentials</span>
          </button>
        </div>
      )}

      {/* Main Admin Login Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 border border-sky-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {step === 'CREDENTIALS' ? (
          <>
            <div className="text-center mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30 mb-3.5">
                <Building2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Suraksha Bank • Officer Portal
              </span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5">
                Staff & Admin Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Privileged clearance portal for branch managers, auditors & security officers
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Officer ID / Branch Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Staff / Branch Officer ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Fingerprint className="w-4 h-4 text-sky-500" />
                  </div>
                  <input
                    type="text"
                    value={officerCode}
                    onChange={(e) => setOfficerCode(e.target.value)}
                    placeholder="e.g. OFFICER-MUMBAI-01"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Officer Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@securebank.test"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Security Password
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">FIPS-140-2</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Proceed to Officer 2FA Challenge</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Customer Portal Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              Personal NetBanking Customer?{' '}
              <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors">
                Go to Customer Login →
              </Link>
            </div>
          </>
        ) : (
          /* STEP 2: ADMIN OTP VERIFICATION */
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-blue-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-sky-500/30 mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                Staff 2-Factor Clearance
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-2.5">
                Admin Officer Authorization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Security clearance OTP sent to registered staff email:
              </p>
              <div className="mt-1 font-mono font-bold text-xs text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 py-1.5 px-3 rounded-lg inline-block border border-sky-200 dark:border-sky-800">
                {email}
              </div>
            </div>



            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Staff Authorization Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center tracking-[1em] font-mono text-xl font-bold bg-slate-50 dark:bg-slate-800/80 border-2 border-sky-300 dark:border-sky-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Timer and Resend */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Clearance expires in: <strong className="font-mono text-sky-600 dark:text-sky-400">{formatTimer(timeLeft)}</strong>
                </span>
                <button
                  type="button"
                  disabled={timeLeft > 0 || isResending}
                  onClick={handleResendOtp}
                  className="font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 group"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize Officer Access</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('CREDENTIALS');
                  setOtpCode('');
                  setErrorMessage('');
                }}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Re-enter Officer Credentials</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

