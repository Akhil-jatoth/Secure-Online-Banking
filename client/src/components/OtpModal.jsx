import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal.jsx';
import { ShieldCheck, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { authService } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export const OtpModal = ({
  isOpen,
  onClose,
  onVerify,
  purpose,
  title = 'Two-Factor Authentication Required',
  description = 'For your security, please enter the 6-digit verification code sent to your registered email.',
  demoCode = null,
  isLoading = false,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isResending, setIsResending] = useState(false);
  const [activeDemoCode, setActiveDemoCode] = useState(demoCode);
  const inputRefs = useRef([]);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimeLeft(300);
      setActiveDemoCode(demoCode);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen, demoCode]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d{1,6}$/.test(pasteData)) {
      const newDigits = pasteData.split('');
      while (newDigits.length < 6) newDigits.push('');
      setDigits(newDigits);
      const focusIndex = Math.min(pasteData.length, 5);
      if (inputRefs.current[focusIndex]) inputRefs.current[focusIndex].focus();
    }
  };

  const fillDemoCode = () => {
    if (activeDemoCode && activeDemoCode.length === 6) {
      setDigits(activeDemoCode.split(''));
      toast.info('Simulated OTP code autofilled for evaluation.');
    }
  };

  const handleResend = async () => {
    try {
      setIsResending(true);
      const res = await authService.requestOTP({ purpose, email: user?.email });
      if (res.success) {
        setTimeLeft(300);
        if (res.data?.demoCode) {
          setActiveDemoCode(res.data.demoCode);
        }
        toast.success(res.message || 'A new verification code has been dispatched.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      toast.warning('Please enter all 6 digits of the OTP code.');
      return;
    }
    onVerify(code);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="w-14 h-14 bg-bank-50 dark:bg-bank-950/60 text-bank-600 dark:text-bank-400 rounded-2xl flex items-center justify-center mb-4 ring-8 ring-bank-50 dark:ring-bank-950/30">
          <KeyRound className="w-7 h-7" />
        </div>

        <p className="text-sm text-center text-slate-600 dark:text-slate-300 mb-5 leading-relaxed">
          {description}
        </p>

        {/* 6-Digit Inputs */}
        <div className="flex justify-center space-x-2.5 mb-6" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-bank-500 focus:border-bank-500 outline-none transition-all shadow-sm"
            />
          ))}
        </div>

        {/* Timer & Resend */}
        <div className="flex items-center justify-between w-full text-xs text-slate-500 dark:text-slate-400 mb-6 px-1">
          <span>
            Code expires in: <strong className="font-mono text-slate-700 dark:text-slate-300">{formatTimer(timeLeft)}</strong>
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || timeLeft > 240}
            className="flex items-center space-x-1 font-semibold text-bank-600 hover:text-bank-700 dark:text-bank-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>Resend Code</span>
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || digits.join('').length !== 6}
            className="flex-1 px-4 py-2.5 rounded-xl bg-bank-600 hover:bg-bank-700 text-white text-sm font-semibold shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Proceed</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
