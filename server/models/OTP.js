import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { OTP_PURPOSES } from '../utils/constants.js';

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSES),
      required: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL deletion
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Verify OTP method
otpSchema.methods.verifyCode = async function (candidateCode) {
  const codeStr = String(candidateCode || '').trim();
  if (!codeStr || codeStr.length !== 6) {
    return { valid: false, reason: 'Please enter the complete 6-digit OTP code.' };
  }

  if (this.isUsed) {
    return { valid: false, reason: 'This OTP code has already been used. Please request a new code.' };
  }

  if (this.expiresAt < new Date()) {
    return { valid: false, reason: 'OTP code has expired. Please click Resend OTP to receive a new code.' };
  }

  if (this.attempts >= this.maxAttempts) {
    return { valid: false, reason: 'Maximum attempts exceeded for this code. Please click Resend OTP to receive a fresh code.' };
  }

  const isMatch = await bcrypt.compare(codeStr, this.otpHash);
  if (!isMatch) {
    this.attempts += 1;
    await this.save();
    const remaining = Math.max(0, this.maxAttempts - this.attempts);
    return {
      valid: false,
      reason: remaining > 0 ? `Incorrect OTP code entered. ${remaining} attempt(s) remaining.` : 'Maximum attempts exceeded. Please request a new OTP.',
      attemptsRemaining: remaining,
    };
  }

  this.isUsed = true;
  await this.save();
  return { valid: true };
};

export const OTP = mongoose.model('OTP', otpSchema);
