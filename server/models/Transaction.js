import mongoose from 'mongoose';
import { TRANSACTION_TYPES, TRANSACTION_STATUS } from '../utils/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true,
    },
    senderAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      index: true,
    },
    receiverAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      index: true,
    },
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    receiverUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      default: TRANSACTION_STATUS.PENDING,
      index: true,
    },
    balanceAfterSender: {
      type: Number,
    },
    balanceAfterReceiver: {
      type: Number,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
transactionSchema.index({ senderAccount: 1, createdAt: -1 });
transactionSchema.index({ receiverAccount: 1, createdAt: -1 });
transactionSchema.index({ senderUser: 1, createdAt: -1 });
transactionSchema.index({ receiverUser: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
