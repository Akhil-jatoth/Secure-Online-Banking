import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { Transaction } from '../models/Transaction.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuditService } from './auditService.js';
import { NotificationService } from './notificationService.js';
import { ROLES, ACCOUNT_STATUS, AUDIT_ACTIONS } from '../utils/constants.js';

export class AdminService {
  static async getDashboardStats() {
    const [
      totalCustomers,
      activeAccounts,
      frozenAccounts,
      totalAccounts,
      totalTransactions,
      successfulTransactions,
      failedTransactions,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.CUSTOMER }),
      Account.countDocuments({ status: ACCOUNT_STATUS.ACTIVE }),
      Account.countDocuments({ status: ACCOUNT_STATUS.FROZEN }),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'SUCCESS' }),
      Transaction.countDocuments({ status: 'FAILED' }),
    ]);

    // Aggregate total transaction volume
    const volumeAgg = await Transaction.aggregate([
      { $match: { status: 'SUCCESS' } },
      { $group: { _id: null, totalVolume: { $sum: '$amount' } } },
    ]);
    const totalVolume = volumeAgg[0]?.totalVolume || 0;

    // Aggregate last 7 days transaction trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTransactionsAgg = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, '$amount', 0] } },
          success: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      overview: {
        totalCustomers,
        totalAccounts,
        activeAccounts,
        frozenAccounts,
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        totalVolume,
      },
      charts: {
        dailyTransactions: dailyTransactionsAgg,
      },
    };
  }

  static async getUsers({ page = 1, limit = 10, search, role }) {
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Attach account summaries
    const userIds = users.map((u) => u._id);
    const accounts = await Account.find({ user: { $in: userIds } });

    const usersWithAccounts = users.map((u) => {
      const userObj = u.toObject();
      userObj.accounts = accounts.filter((a) => a.user.equals(u._id));
      return userObj;
    });

    return {
      users: usersWithAccounts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getUserDetails(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    const accounts = await Account.find({ user: userId });
    const recentTransactions = await Transaction.find({
      $or: [{ senderUser: userId }, { receiverUser: userId }],
    })
      .populate('senderAccount', 'accountNumber')
      .populate('receiverAccount', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(10);

    const auditLogs = await AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(15);

    return {
      user,
      accounts,
      recentTransactions,
      auditLogs,
    };
  }

  static async freezeAccount(accountId, adminId, reason = 'Administrative security lock', ipAddress, userAgent) {
    const account = await Account.findById(accountId).populate('user');
    if (!account) {
      throw new Error('Account not found.');
    }

    account.status = ACCOUNT_STATUS.FROZEN;
    await account.save();

    await AuditService.log({
      userId: adminId,
      userRole: ROLES.ADMIN,
      action: AUDIT_ACTIONS.ACCOUNT_FREEZE,
      resource: 'Account',
      resourceId: account._id,
      ipAddress,
      userAgent,
      status: 'WARNING',
      metadata: { accountNumber: account.accountNumber, ownerId: account.user._id, reason },
    });

    await NotificationService.create({
      userId: account.user._id,
      title: 'Security Alert: Account Frozen',
      message: `Your account #${account.accountNumber} has been temporarily frozen by bank administration. Reason: ${reason}. Please contact customer support.`,
      type: 'SECURITY',
    });

    return account;
  }

  static async unfreezeAccount(accountId, adminId, ipAddress, userAgent) {
    const account = await Account.findById(accountId).populate('user');
    if (!account) {
      throw new Error('Account not found.');
    }

    account.status = ACCOUNT_STATUS.ACTIVE;
    await account.save();

    await AuditService.log({
      userId: adminId,
      userRole: ROLES.ADMIN,
      action: AUDIT_ACTIONS.ACCOUNT_UNFREEZE,
      resource: 'Account',
      resourceId: account._id,
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      metadata: { accountNumber: account.accountNumber, ownerId: account.user._id },
    });

    await NotificationService.create({
      userId: account.user._id,
      title: 'Account Reactivated',
      message: `Your account #${account.accountNumber} has been reactivated and is now ACTIVE.`,
      type: 'ACCOUNT',
    });

    return account;
  }

  static async getAllTransactions({ page = 1, limit = 20, status, type, search, startDate, endDate }) {
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
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

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('senderAccount', 'accountNumber accountType')
        .populate('receiverAccount', 'accountNumber accountType')
        .populate('senderUser', 'fullName email customerId')
        .populate('receiverUser', 'fullName email customerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
