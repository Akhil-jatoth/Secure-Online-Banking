import React, { useState } from 'react';
import { authService } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { OtpModal } from '../../components/OtpModal.jsx';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  History,
  Smartphone,
  Shield,
} from 'lucide-react';

export const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [demoOtp, setDemoOtp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const passwordCriteria = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(newPassword) },
    { label: 'One number (0-9)', met: /\d/.test(newPassword) },
    { label: 'One special character (!@#$%)', met: /[@$!%*?&#^~_\-+=<>.,/|\\]/.test(newPassword) },
  ];

  const allCriteriaMet = passwordCriteria.every((c) => c.met);

  const handleStartPasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.warning('Please enter your current password.');
      return;
    }

    if (!allCriteriaMet) {
      toast.warning('Please meet all new password complexity criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning('New passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.requestOTP({ purpose: 'CHANGE_PASSWORD' });
      if (res.success) {
        setDemoOtp(res.data?.demoCode || null);
        setIsOtpOpen(true);
        toast.info('Verification code sent for password modification.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndChange = async (otpCode) => {
    try {
      setIsSubmitting(true);
      const res = await authService.changePassword({
        currentPassword,
        newPassword,
        otp: otpCode,
      });

      if (res.success) {
        toast.success('Password changed successfully!');
        setIsOtpOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Security & 2FA Center</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure authentication credentials, manage multi-factor verification, and review lockout rules.
        </p>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">MFA Active</h4>
              <span className="text-[11px] text-emerald-600 font-semibold">Enforced on all transfers</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            6-digit OTP verification is mandatory for wire transfers, beneficiary edits, and password resets.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Brute-Force Shield</h4>
              <span className="text-[11px] text-amber-600 font-semibold">5 Attempts Threshold</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Accounts are automatically locked for 15 minutes after 5 consecutive incorrect login attempts.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-bank-50 dark:bg-bank-950/60 text-bank-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">JWT Encryption</h4>
              <span className="text-[11px] text-bank-600 font-semibold">HMAC SHA-256</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Session tokens expire automatically after 1 hour of inactivity for client isolation.
          </p>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-bank-600" />
          <span>Update Security Password</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Changing your password requires current password confirmation and 6-digit OTP verification.
        </p>

        <form onSubmit={handleStartPasswordChange} className="space-y-4 max-w-xl">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-bank-500"
              />
            </div>
          </div>

          {/* Criteria */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
            {passwordCriteria.map((c, i) => (
              <div
                key={i}
                className={`flex items-center space-x-1.5 ${
                  c.met ? 'text-emerald-600 font-medium' : 'text-slate-400'
                }`}
              >
                {c.met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{c.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !allCriteriaMet || !currentPassword}
              className="px-6 py-3 rounded-xl bg-bank-600 hover:bg-bank-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              Verify OTP & Update Password
            </button>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        onVerify={handleVerifyAndChange}
        purpose="CHANGE_PASSWORD"
        demoCode={demoOtp}
        isLoading={isSubmitting}
        title="Authorize Password Change"
        description="Enter the 6-digit OTP code to confirm changing your account password."
      />
    </div>
  );
};
