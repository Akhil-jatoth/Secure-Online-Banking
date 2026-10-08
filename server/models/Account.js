import mongoose from 'mongoose';
import { ACCOUNT_TYPES, ACCOUNT_STATUS } from '../utils/constants.js';

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: Object.values(ACCOUNT_TYPES),
      default: ACCOUNT_TYPES.SAVINGS,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Available balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
      index: true,
    },
    dailyTransferLimit: {
      type: Number,
      default: 10000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and status
accountSchema.index({ user: 1, status: 1 });

export const Account = mongoose.model('Account', accountSchema);
