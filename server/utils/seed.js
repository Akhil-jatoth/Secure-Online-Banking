import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { Transaction } from '../models/Transaction.js';
import { BillPayment } from '../models/BillPayment.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { ROLES, ACCOUNT_TYPES, ACCOUNT_STATUS, TRANSACTION_TYPES, TRANSACTION_STATUS, AUDIT_ACTIONS, BILL_CATEGORIES } from './constants.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    logger.info('Starting Secure Online Banking database seed...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Beneficiary.deleteMany({}),
      Transaction.deleteMany({}),
      BillPayment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    // 1. Create Admin
    const admin = new User({
      customerId: 'CUST-ADM-001',
      fullName: 'System Security Administrator',
      email: 'admin@securebank.test',
      password: 'Admin@12345!', // hashed by pre-save hook
      phoneNumber: '+1-800-555-0199',
      dateOfBirth: new Date('1985-05-15'),
      address: {
        street: '100 Cyber Defense Blvd',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      },
      role: ROLES.ADMIN,
    });
    await admin.save();

    // 2. Create Customer 1 (Alexander Wright)
    const customer1 = new User({
      customerId: 'CUST-882910',
      fullName: 'Alexander Wright',
      email: 'customer1@securebank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-212-555-0142',
      dateOfBirth: new Date('1992-08-24'),
      address: {
        street: '450 Lexington Ave, Apt 12B',
        city: 'New York',
        state: 'NY',
        postalCode: '10017',
        country: 'USA',
      },
      role: ROLES.CUSTOMER,
    });
    await customer1.save();

    // 3. Create Customer 2 (Elena Rostova)
    const customer2 = new User({
      customerId: 'CUST-773412',
      fullName: 'Elena Rostova',
      email: 'customer2@securebank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-415-555-0188',
      dateOfBirth: new Date('1994-11-03'),
      address: {
        street: '88 Montgomery St, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94104',
        country: 'USA',
      },
      role: ROLES.CUSTOMER,
    });
    await customer2.save();

    // 4. Create Accounts
    const cust1Savings = await Account.create({
      accountNumber: '100982347101',
      user: customer1._id,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: 14850.50,
      availableBalance: 14850.50,
      currency: 'USD',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    const cust1Current = await Account.create({
      accountNumber: '100982347102',
      user: customer1._id,
      accountType: ACCOUNT_TYPES.CURRENT,
      balance: 3200.00,
      availableBalance: 3200.00,
      currency: 'USD',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    const cust2Savings = await Account.create({
      accountNumber: '100871928301',
      user: customer2._id,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: 8900.00,
      availableBalance: 8900.00,
      currency: 'USD',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    // 5. Create Beneficiaries for Customer 1
    const ben1 = await Beneficiary.create({
      user: customer1._id,
      name: 'Elena Rostova',
      nickname: 'Elena (Colleague)',
      accountNumber: cust2Savings.accountNumber,
      bankName: 'Aegis Bank',
      routingNumber: 'AEGIS0018',
      status: 'ACTIVE',
    });

    const ben2 = await Beneficiary.create({
      user: customer1._id,
      name: 'Marcus Vance',
      nickname: 'Marcus Landlord',
      accountNumber: '100554433221',
      bankName: 'Apex Trust Bank',
      routingNumber: 'APEX9901',
      status: 'ACTIVE',
    });

    // Beneficiary for Customer 2
    await Beneficiary.create({
      user: customer2._id,
      name: 'Alexander Wright',
      nickname: 'Alex Wright',
      accountNumber: cust1Savings.accountNumber,
      bankName: 'Aegis Bank',
      routingNumber: 'AEGIS0018',
      status: 'ACTIVE',
    });

    // 6. Create Realistic Transactions
    const tx1 = await Transaction.create({
      transactionId: 'TXN-SEED-001',
      referenceNumber: 'REF-9812401',
      type: TRANSACTION_TYPES.DEPOSIT,
      receiverAccount: cust1Savings._id,
      receiverUser: customer1._id,
      amount: 10000.00,
      currency: 'USD',
      description: 'Payroll Direct Deposit - Tech Corp Inc',
      category: 'Salary',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterReceiver: 16500.50,
      completedAt: new Date(Date.now() - 15 * 86400000),
      createdAt: new Date(Date.now() - 15 * 86400000),
    });

    const tx2 = await Transaction.create({
      transactionId: 'TXN-SEED-002',
      referenceNumber: 'REF-9812402',
      type: TRANSACTION_TYPES.TRANSFER,
      senderAccount: cust1Savings._id,
      receiverAccount: cust2Savings._id,
      senderUser: customer1._id,
      receiverUser: customer2._id,
      amount: 650.00,
      currency: 'USD',
      description: 'Project consultation fee payment',
      category: 'Transfer',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 15850.50,
      balanceAfterReceiver: 8900.00,
      completedAt: new Date(Date.now() - 5 * 86400000),
      createdAt: new Date(Date.now() - 5 * 86400000),
    });

    const tx3 = await Transaction.create({
      transactionId: 'TXN-SEED-003',
      referenceNumber: 'REF-9812403',
      type: TRANSACTION_TYPES.BILL_PAYMENT,
      senderAccount: cust1Savings._id,
      senderUser: customer1._id,
      amount: 145.20,
      currency: 'USD',
      description: 'Internet Bill: Gigabit Fiber Net',
      category: 'Internet',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 15705.30,
      completedAt: new Date(Date.now() - 2 * 86400000),
      createdAt: new Date(Date.now() - 2 * 86400000),
    });

    const tx4 = await Transaction.create({
      transactionId: 'TXN-SEED-004',
      referenceNumber: 'REF-9812404',
      type: TRANSACTION_TYPES.BILL_PAYMENT,
      senderAccount: cust1Savings._id,
      senderUser: customer1._id,
      amount: 854.80,
      currency: 'USD',
      description: 'Electricity & Utilities: Metropolis Power',
      category: 'Electricity',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 14850.50,
      completedAt: new Date(Date.now() - 1 * 86400000),
      createdAt: new Date(Date.now() - 1 * 86400000),
    });

    // 7. Create Bill Payments
    await BillPayment.create({
      user: customer1._id,
      account: cust1Savings._id,
      transaction: tx3._id,
      category: BILL_CATEGORIES.INTERNET,
      billerName: 'Gigabit Fiber Net',
      consumerNumber: 'INET-992014',
      amount: 145.20,
      paymentReference: 'PAYREF-982141',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 2 * 86400000),
    });

    await BillPayment.create({
      user: customer1._id,
      account: cust1Savings._id,
      transaction: tx4._id,
      category: BILL_CATEGORIES.ELECTRICITY,
      billerName: 'Metropolis Power & Light',
      consumerNumber: 'ELEC-440192',
      amount: 854.80,
      paymentReference: 'PAYREF-982142',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 1 * 86400000),
    });

    // 8. Notifications
    await Notification.create([
      {
        user: customer1._id,
        title: 'Welcome to Aegis Secure Bank',
        message: 'Your account #100982347101 is configured and protected by multi-factor authentication.',
        type: 'ACCOUNT',
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 86400000),
      },
      {
        user: customer1._id,
        title: 'Security Notice: New Beneficiary Added',
        message: 'Beneficiary "Elena Rostova" (#100871928301) was successfully authorized via MFA.',
        type: 'SECURITY',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        user: customer1._id,
        title: 'Transfer Completed',
        message: 'Your transfer of $650.00 to Elena Rostova was completed successfully.',
        type: 'TRANSACTION',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        user: customer2._id,
        title: 'Funds Received',
        message: 'Received $650.00 from Alexander Wright into account #100871928301.',
        type: 'TRANSACTION',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
    ]);

    // 9. Initial Audit Logs
    await AuditLog.create([
      {
        userId: admin._id,
        userEmail: admin.email,
        userRole: ROLES.ADMIN,
        action: AUDIT_ACTIONS.REGISTRATION,
        resource: 'User',
        resourceId: admin._id.toString(),
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
        metadata: { role: 'ADMIN' },
        createdAt: new Date(Date.now() - 30 * 86400000),
      },
      {
        userId: customer1._id,
        userEmail: customer1.email,
        userRole: ROLES.CUSTOMER,
        action: AUDIT_ACTIONS.REGISTRATION,
        resource: 'User',
        resourceId: customer1._id.toString(),
        ipAddress: '192.168.1.45',
        status: 'SUCCESS',
        metadata: { customerId: customer1.customerId },
        createdAt: new Date(Date.now() - 20 * 86400000),
      },
      {
        userId: customer1._id,
        userEmail: customer1.email,
        userRole: ROLES.CUSTOMER,
        action: AUDIT_ACTIONS.LOGIN,
        resource: 'Auth',
        ipAddress: '192.168.1.45',
        status: 'SUCCESS',
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        userId: customer1._id,
        userEmail: customer1.email,
        userRole: ROLES.CUSTOMER,
        action: AUDIT_ACTIONS.FUND_TRANSFER_SUCCESS,
        resource: 'Transaction',
        resourceId: tx2._id.toString(),
        ipAddress: '192.168.1.45',
        status: 'SUCCESS',
        metadata: { amount: 650.00, referenceNumber: 'REF-9812402' },
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
    ]);

    logger.info('Database seeded successfully with demo and admin accounts!');
    logger.info('----------------------------------------------------');
    logger.info('DEMO ACCOUNTS FOR ACADEMIC EVALUATION:');
    logger.info('Admin:     admin@securebank.test     | Password: Admin@12345!');
    logger.info('Customer1: customer1@securebank.test | Password: Password@12345!');
    logger.info('Customer2: customer2@securebank.test | Password: Password@12345!');
    logger.info('----------------------------------------------------');
  } catch (error) {
    logger.error(`Seed database failed: ${error.message}`);
    throw error;
  }
};

// Standalone execution if run directly via npm run seed
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}
