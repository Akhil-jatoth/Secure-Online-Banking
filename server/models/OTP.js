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
      default: 3,
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
  if (this.isUsed) {
    return { valid: false, reason: 'OTP has already been used' };
  }
  if (this.expiresAt < new Date()) {
    return { valid: false, reason: 'OTP has expired' };
  }
  if (this.attempts >= this.maxAttempts) {
    return { valid: false, reason: 'Maximum OTP verification attempts exceeded' };
  }

  const isMatch = await bcrypt.compare(candidateCode, this.otpHash);
  if (!isMatch) {
    this.attempts += 1;
    await this.save();
    return { valid: false, reason: 'Invalid OTP code', attemptsRemaining: this.maxAttempts - this.attempts };
  }

  this.isUsed = true;
  await this.save();
  return { valid: true };
};

export const OTP = mongoose.model('OTP', otpSchema);
