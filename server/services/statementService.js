import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { User } from '../models/User.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';

export class StatementService {
  static async calculateStatement(userId, { accountId, timeframe = '30d', startDate, endDate }) {
    // 1. Get user and account
    const user = await User.findById(userId);
    let account;
    if (accountId) {
      account = await Account.findOne({ _id: accountId, user: userId });
    } else {
      account = await Account.findOne({ user: userId });
    }

    if (!account) {
      throw new Error('Account not found.');
    }

    // 2. Determine date bounds
    let fromDate = new Date();
    let toDate = new Date();

    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
      toDate.setHours(23, 59, 59, 999);
    } else if (timeframe === '7d') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (timeframe === '90d' || timeframe === '3m') {
      fromDate.setDate(fromDate.getDate() - 90);
    } else {
      // Default 30 days
      fromDate.setDate(fromDate.getDate() - 30);
    }

    // 3. Find transactions in date range
    const transactions = await Transaction.find({
      $or: [{ senderAccount: account._id }, { receiverAccount: account._id }],
      createdAt: { $gte: fromDate, $lte: toDate },
      status: 'SUCCESS',
    }).sort({ createdAt: 1 });

    // Format transaction directions and totals
    let totalDebits = 0;
    let totalCredits = 0;

    const formattedTxns = transactions.map((tx) => {
      const isDebit = tx.senderAccount && tx.senderAccount.equals(account._id);
      if (isDebit) {
        totalDebits += tx.amount;
      } else {
        totalCredits += tx.amount;
      }
      return {
        ...tx.toObject(),
        direction: isDebit ? 'DEBIT' : 'CREDIT',
      };
    });

    const closingBalance = account.balance;
    // Approximate opening balance prior to transactions in this period
    const netChange = totalCredits - totalDebits;
    const openingBalance = Math.max(0, Math.round((closingBalance - netChange) * 100) / 100);

    const maskedAccountNumber = `•••• •••• ${account.accountNumber.slice(-4)}`;
    const periodString = `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;

    return {
      bankName: 'Suraksha Digital Bank',
      customerName: user.fullName,
      maskedAccountNumber,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency || 'INR',
      period: periodString,
      fromDate,
      toDate,
      openingBalance,
      closingBalance,
      totalDebits,
      totalCredits,
      transactionCount: formattedTxns.length,
      transactions: formattedTxns,
    };
  }

  static async generatePDFStream(userId, params) {
    const statementData = await this.calculateStatement(userId, params);
    const pdfDoc = PDFGenerator.generateBankStatementPDF(statementData);
    return {
      pdfDoc,
      filename: `Statement_${statementData.accountNumber}_${Date.now()}.pdf`,
    };
  }
}
