import mongoose from 'mongoose';
import crypto from 'crypto';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { BillPayment } from '../models/BillPayment.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  ACCOUNT_STATUS,
  AUDIT_ACTIONS,
} from '../utils/constants.js';

export class BillService {
  static async getBillHistory(userId) {
    return BillPayment.find({ user: userId })
      .populate('account', 'accountNumber accountType')
      .populate('transaction', 'transactionId referenceNumber status')
      .sort({ createdAt: -1 });
  }

  static async payBill({
    userId,
    accountId,
    category,
    billerName,
    consumerNumber,
    amount,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
  }) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Bill payment amount must be a positive number greater than zero.');
    }

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
      // Find source account
      const accountQuery = Account.findOne({ _id: accountId, user: userId });
      if (useSession) accountQuery.session(session);
      const account = await accountQuery;

      if (!account) {
        throw new Error('Selected source account not found or unauthorized.');
      }

      if (account.status !== ACCOUNT_STATUS.ACTIVE) {
        throw new Error(`Source account is ${account.status}. Bill payment cannot proceed.`);
      }

      if (account.availableBalance < numAmount) {
        throw new Error(
          `Insufficient balance. Available: $${account.availableBalance.toFixed(2)}, Required: $${numAmount.toFixed(2)}.`
        );
      }

      // Deduct balance
      account.balance = Math.round((account.balance - numAmount) * 100) / 100;
      account.availableBalance = Math.round((account.availableBalance - numAmount) * 100) / 100;

      if (useSession) {
        await account.save({ session });
      } else {
        await account.save();
      }

      const transactionId = `TXN-BILL-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const referenceNumber = `BILL-${Date.now().toString().slice(-7)}-${crypto.randomInt(100, 999)}`;
      const paymentReference = `PAYREF-${Date.now().toString().slice(-8)}`;

      const transactionData = {
        transactionId,
        referenceNumber,
        type: TRANSACTION_TYPES.BILL_PAYMENT,
        senderAccount: account._id,
        senderUser: userId,
        amount: numAmount,
        currency: account.currency,
        description: `${category} Bill Payment: ${billerName} (Acct #${consumerNumber})`,
        category,
        status: TRANSACTION_STATUS.SUCCESS,
        balanceAfterSender: account.availableBalance,
        metadata: {
          category,
          billerName,
          consumerNumber,
          paymentReference,
        },
        completedAt: new Date(),
      };

      let transaction;
      if (useSession) {
        const created = await Transaction.create([transactionData], { session });
        transaction = created[0];
      } else {
        transaction = await Transaction.create(transactionData);
      }

      const billPaymentData = {
        user: userId,
        account: account._id,
        transaction: transaction._id,
        category,
        billerName,
        consumerNumber,
        amount: numAmount,
        paymentReference,
        status: 'SUCCESS',
      };

      let billPayment;
      if (useSession) {
        const created = await BillPayment.create([billPaymentData], { session });
        billPayment = created[0];
        await session.commitTransaction();
      } else {
        billPayment = await BillPayment.create(billPaymentData);
      }

      // Audit and Notification
      await AuditService.log({
        userId,
        action: AUDIT_ACTIONS.BILL_PAYMENT_SUCCESS,
        resource: 'BillPayment',
        resourceId: billPayment._id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        metadata: {
          category,
          billerName,
          amount: numAmount,
          paymentReference,
          fromAccount: account.accountNumber,
        },
      });

      await NotificationService.create({
        userId,
        title: 'Bill Payment Successful',
        message: `Paid $${numAmount.toFixed(2)} to ${billerName} (${category}). Reference: ${paymentReference}.`,
        type: 'BILL',
        metadata: { paymentReference, transactionId },
      });

      return {
        paymentReference: billPayment.paymentReference,
        billerName: billPayment.billerName,
        category: billPayment.category,
        amount: billPayment.amount,
        accountNumber: account.accountNumber,
        balanceAfter: account.availableBalance,
        status: billPayment.status,
        createdAt: billPayment.createdAt,
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
}
