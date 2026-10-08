import { Account } from '../models/Account.js';
import { ACCOUNT_STATUS } from '../utils/constants.js';

export class AccountService {
  static async getUserAccounts(userId) {
    return Account.find({ user: userId }).sort({ createdAt: 1 });
  }

  static async getAccountById(accountId, userId) {
    const account = await Account.findOne({ _id: accountId, user: userId });
    if (!account) {
      throw new Error('Account not found or you do not have permission to access it.');
    }
    return account;
  }

  static async getAccountBalance(accountId, userId) {
    const account = await this.getAccountById(accountId, userId);
    return {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency,
      status: account.status,
    };
  }

  static async createAdditionalAccount(userId, accountType = 'Savings') {
    const accountNumber = `100${Date.now().toString().slice(-7)}${Math.floor(10 + Math.random() * 90)}`;
    const newAccount = await Account.create({
      accountNumber,
      user: userId,
      accountType,
      balance: 10000.00,
      availableBalance: 10000.00,
      currency: 'INR',
      status: ACCOUNT_STATUS.ACTIVE,
    });
    return newAccount;
  }
}
