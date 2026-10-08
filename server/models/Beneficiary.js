import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Beneficiary name is required'],
      trim: true,
    },
    nickname: {
      type: String,
      default: '',
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      default: 'Aegis Bank',
    },
    routingNumber: {
      type: String,
      required: [true, 'Routing / IFSC number is required'],
      trim: true,
      default: 'AEGIS0018',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent adding duplicate beneficiaries for the same user with same account number
beneficiarySchema.index({ user: 1, accountNumber: 1 }, { unique: true });

export const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);
