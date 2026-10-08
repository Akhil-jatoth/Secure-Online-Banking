import mongoose from 'mongoose';
import { BILL_CATEGORIES } from '../utils/constants.js';

const billPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    category: {
      type: String,
      enum: Object.values(BILL_CATEGORIES),
      required: true,
      index: true,
    },
    billerName: {
      type: String,
      required: [true, 'Biller name is required'],
      trim: true,
    },
    consumerNumber: {
      type: String,
      required: [true, 'Consumer / Account reference number is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Amount must be greater than 0'],
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

billPaymentSchema.index({ user: 1, createdAt: -1 });

export const BillPayment = mongoose.model('BillPayment', billPaymentSchema);
