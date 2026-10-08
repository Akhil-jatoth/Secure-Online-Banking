import mongoose from 'mongoose';
import crypto from 'crypto';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { User } from '../models/User.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { OTPService } from './otpService.js';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  ACCOUNT_STATUS,
  AUDIT_ACTIONS,
  OTP_PURPOSES,
} from '../utils/constants.js';

export class TransactionService {
  /**
   * Generates a unique transaction identifier
   */
  static generateTransactionId() {
    return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  static generateReferenceNumber() {
    return `REF-${Date.now().toString().slice(-8)}-${crypto.randomInt(1000, 9999)}`;
  }

  /**
   * Atomic fund transfer execution
   */
  static async executeTransfer({
    userId,
    fromAccountId,
    toAccountNumber,
    beneficiaryId,
    amount,
    description = 'Fund Transfer',
    otp,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
  }) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Transfer amount must be a positive number greater than zero.');
    }

    // 1. Verify OTP first
    const otpResult = await OTPService.verifyOTP({
      userId,
      purpose: OTP_PURPOSES.TRANSFER,
      otp,
    });

    if (!otpResult.isValid) {
      await AuditService.log({
        userId,
        action: AUDIT_ACTIONS.FUND_TRANSFER_FAILED,
        resource: 'Transaction',
        ipAddress,
        userAgent,
        status: 'FAILURE',
        metadata: { reason: otpResult.message, amount: numAmount },
      });
      throw new Error(otpResult.message || 'Invalid or expired OTP for transfer verification.');
    }

    // 2. Resolve destination account number
    let destAccountNumber = toAccountNumber;
    if (beneficiaryId) {
      const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, user: userId });
      if (!beneficiary) {
        throw new Error('Selected beneficiary does not exist or does not belong to you.');
      }
      destAccountNumber = beneficiary.accountNumber;
    }

    if (!destAccountNumber) {
      throw new Error('Destination account number or beneficiary is required.');
    }

    // Determine replica set capability for sessions
    let session = null;
    let useSession = false;
    try {
      const topologyType = mongoose.connection.client?.topology?.description?.type;
      if (topologyType === 'ReplicaSetWithPrimary' || topologyType === 'Sharded') {
        session = await mongoose.startSession();
        session.startTransaction();
        useSession = true;
      }
    } catch {
      useSession = false;
    }

    try {
      // 3. Find and validate source account
      const senderAccountQuery = Account.findOne({ _id: fromAccountId, user: userId });
      if (useSession) senderAccountQuery.session(session);
      const senderAccount = await senderAccountQuery;

      if (!senderAccount) {
        throw new Error('Source account not found or you do not have permission to access it.');
      }

      if (senderAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new Error(`Source account is currently ${senderAccount.status}. Transfers are not allowed.`);
      }

      if (senderAccount.availableBalance < numAmount) {
        throw new Error(
          `Insufficient funds. Your available balance is $${senderAccount.availableBalance.toFixed(2)}, but the transfer amount is $${numAmount.toFixed(2)}.`
        );
      }

      // 4. Find and validate destination account
      const receiverAccountQuery = Account.findOne({ accountNumber: destAccountNumber.trim() });
      if (useSession) receiverAccountQuery.session(session);
      const receiverAccount = await receiverAccountQuery;

      if (!receiverAccount) {
        throw new Error(`Destination account #${destAccountNumber} was not found in our banking network.`);
      }

      if (senderAccount._id.equals(receiverAccount._id)) {
        throw new Error('Source and destination accounts cannot be the same account.');
      }

      if (receiverAccount.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new Error(`Destination account is currently ${receiverAccount.status}. Transfer cannot proceed.`);
      }

      // 5. Debit sender & Credit receiver
      senderAccount.balance = Math.round((senderAccount.balance - numAmount) * 100) / 100;
      senderAccount.availableBalance = Math.round((senderAccount.availableBalance - numAmount) * 100) / 100;

      receiverAccount.balance = Math.round((receiverAccount.balance + numAmount) * 100) / 100;
      receiverAccount.availableBalance = Math.round((receiverAccount.availableBalance + numAmount) * 100) / 100;

      if (useSession) {
        await senderAccount.save({ session });
        await receiverAccount.save({ session });
      } else {
        await senderAccount.save();
        await receiverAccount.save();
      }

      // 6. Record transaction
      const transactionId = this.generateTransactionId();
      const referenceNumber = this.generateReferenceNumber();

      const transactionData = {
        transactionId,
        referenceNumber,
        type: TRANSACTION_TYPES.TRANSFER,
        senderAccount: senderAccount._id,
        receiverAccount: receiverAccount._id,
        senderUser: senderAccount.user,
        receiverUser: receiverAccount.user,
        amount: numAmount,
        currency: senderAccount.currency,
        description: description || `Transfer to ${receiverAccount.accountNumber}`,
        category: 'Transfer',
        status: TRANSACTION_STATUS.SUCCESS,
        balanceAfterSender: senderAccount.availableBalance,
        balanceAfterReceiver: receiverAccount.availableBalance,
        completedAt: new Date(),
      };

      let transaction;
      if (useSession) {
        const created = await Transaction.create([transactionData], { session });
        transaction = created[0];
        await session.commitTransaction();
      } else {
        transaction = await Transaction.create(transactionData);
      }

      // 7. Post-transaction audit and notifications
      await AuditService.log({
        userId,
        userEmail: (await User.findById(userId))?.email,
        action: AUDIT_ACTIONS.FUND_TRANSFER_SUCCESS,
        resource: 'Transaction',
        resourceId: transaction._id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        metadata: {
          transactionId,
          referenceNumber,
          amount: numAmount,
          fromAccount: senderAccount.accountNumber,
          toAccount: receiverAccount.accountNumber,
        },
      });

      // Sender Notification
      await NotificationService.create({
        userId: senderAccount.user,
        title: 'Debit: Transfer Successful',
        message: `Transferred $${numAmount.toFixed(2)} to account #${receiverAccount.accountNumber}. New balance: $${senderAccount.availableBalance.toFixed(2)}.`,
        type: 'TRANSACTION',
        metadata: { transactionId, referenceNumber },
      });

      // Receiver Notification (if internal customer)
      if (receiverAccount.user && !receiverAccount.user.equals(senderAccount.user)) {
        await NotificationService.create({
          userId: receiverAccount.user,
          title: 'Credit: Funds Received',
          message: `Received $${numAmount.toFixed(2)} into account #${receiverAccount.accountNumber}. New balance: $${receiverAccount.availableBalance.toFixed(2)}.`,
          type: 'TRANSACTION',
          metadata: { transactionId, referenceNumber },
        });
      }

      return {
        transactionId: transaction.transactionId,
        referenceNumber: transaction.referenceNumber,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        senderAccountNumber: senderAccount.accountNumber,
        receiverAccountNumber: receiverAccount.accountNumber,
        balanceAfter: senderAccount.availableBalance,
        description: transaction.description,
        createdAt: transaction.createdAt,
      };
    } catch (err) {
      if (useSession && session) {
        await session.abortTransaction();
      }
      throw err;
    } finally {
      if (useSession && session) {
        session.endSession();
      }
    }
  }

  /**
   * Get user transaction history with rich filtering and pagination
   */
  static async getUserTransactions(userId, {
    page = 1,
    limit = 10,
    accountId,
    type,
    status,
    startDate,
    endDate,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }) {
    const userAccounts = await Account.find({ user: userId }).select('_id');
    const userAccountIds = userAccounts.map((a) => a._id);

    const query = {
      $or: [
        { senderAccount: { $in: userAccountIds } },
        { receiverAccount: { $in: userAccountIds } },
        { senderUser: userId },
        { receiverUser: userId },
      ],
    };

    if (accountId) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ senderAccount: accountId }, { receiverAccount: accountId }],
      });
    }

    if (type) query.type = type;
    if (status) query.status = status;

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { transactionId: { $regex: search, $options: 'i' } },
          { referenceNumber: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('senderAccount', 'accountNumber accountType')
        .populate('receiverAccount', 'accountNumber accountType')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    const formatted = transactions.map((t) => {
      const isDebit = userAccountIds.some(
        (id) => t.senderAccount && t.senderAccount._id.equals(id)
      );
      return {
        ...t.toObject(),
        direction: isDebit ? 'DEBIT' : 'CREDIT',
      };
    });

    return {
      transactions: formatted,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getTransactionById(transactionId, userId) {
    const userAccounts = await Account.find({ user: userId }).select('_id');
    const userAccountIds = userAccounts.map((a) => a._id);

    const txn = await Transaction.findOne({
      _id: transactionId,
      $or: [
        { senderAccount: { $in: userAccountIds } },
        { receiverAccount: { $in: userAccountIds } },
        { senderUser: userId },
        { receiverUser: userId },
      ],
    })
      .populate('senderAccount', 'accountNumber accountType')
      .populate('receiverAccount', 'accountNumber accountType')
      .populate('senderUser', 'fullName email')
      .populate('receiverUser', 'fullName email');

    if (!txn) {
      throw new Error('Transaction not found or you are not authorized to view it.');
    }

    return txn;
  }
}
