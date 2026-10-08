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
      phoneNumber: '+91 98001 00099',
      dateOfBirth: new Date('1985-05-15'),
      address: {
        street: '100 Cyber Tower, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400021',
        country: 'India',
      },
      role: ROLES.ADMIN,
    });
    await admin.save();

    // 2. Create Customer 1 (Aarav Sharma)
    const customer1 = new User({
      customerId: 'CUST-882910',
      fullName: 'Aarav Sharma',
      email: 'customer1@securebank.test',
      password: 'Password@12345!',
      phoneNumber: '+91 98765 43210',
      dateOfBirth: new Date('1992-08-24'),
      address: {
        street: 'Flat 402, Shanti Heights, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      role: ROLES.CUSTOMER,
    });
    await customer1.save();

    // 3. Create Customer 2 (Priya Patel)
    const customer2 = new User({
      customerId: 'CUST-773412',
      fullName: 'Priya Patel',
      email: 'customer2@securebank.test',
      password: 'Password@12345!',
      phoneNumber: '+91 98123 45678',
      dateOfBirth: new Date('1994-11-03'),
      address: {
        street: '12, Marine Drive, Churchgate',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400020',
        country: 'India',
      },
      role: ROLES.CUSTOMER,
    });
    await customer2.save();

    // 4. Create Accounts
    const cust1Savings = await Account.create({
      accountNumber: '100982347101',
      user: customer1._id,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: 148500.50,
      availableBalance: 148500.50,
      currency: 'INR',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    const cust1Current = await Account.create({
      accountNumber: '100982347102',
      user: customer1._id,
      accountType: ACCOUNT_TYPES.CURRENT,
      balance: 32000.00,
      availableBalance: 32000.00,
      currency: 'INR',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    const cust2Savings = await Account.create({
      accountNumber: '100871928301',
      user: customer2._id,
      accountType: ACCOUNT_TYPES.SAVINGS,
      balance: 89000.00,
      availableBalance: 89000.00,
      currency: 'INR',
      status: ACCOUNT_STATUS.ACTIVE,
    });

    // 5. Create Beneficiaries for Customer 1
    const ben1 = await Beneficiary.create({
      user: customer1._id,
      name: 'Priya Patel',
      nickname: 'Priya (ICICI)',
      accountNumber: cust2Savings.accountNumber,
      bankName: 'ICICI Bank',
      routingNumber: 'ICIC0000001',
      status: 'ACTIVE',
    });

    const ben2 = await Beneficiary.create({
      user: customer1._id,
      name: 'Vikram Rao',
      nickname: 'Vikram Landlord',
      accountNumber: '100554433221',
      bankName: 'State Bank of India (SBI)',
      routingNumber: 'SBIN0001008',
      status: 'ACTIVE',
    });

    // Beneficiary for Customer 2
    await Beneficiary.create({
      user: customer2._id,
      name: 'Aarav Sharma',
      nickname: 'Aarav (Suraksha)',
      accountNumber: cust1Savings.accountNumber,
      bankName: 'Suraksha Bank',
      routingNumber: 'SURB0001008',
      status: 'ACTIVE',
    });

    // 6. Create Realistic Transactions
    const tx1 = await Transaction.create({
      transactionId: 'TXN-SEED-001',
      referenceNumber: 'UTR-981240192',
      type: TRANSACTION_TYPES.DEPOSIT,
      receiverAccount: cust1Savings._id,
      receiverUser: customer1._id,
      amount: 100000.00,
      currency: 'INR',
      description: 'Monthly Salary Credit - Infosys Ltd',
      category: 'Salary',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterReceiver: 165000.50,
      completedAt: new Date(Date.now() - 15 * 86400000),
      createdAt: new Date(Date.now() - 15 * 86400000),
    });

    const tx2 = await Transaction.create({
      transactionId: 'TXN-SEED-002',
      referenceNumber: 'IMPS-981240283',
      type: TRANSACTION_TYPES.TRANSFER,
      senderAccount: cust1Savings._id,
      receiverAccount: cust2Savings._id,
      senderUser: customer1._id,
      receiverUser: customer2._id,
      amount: 6500.00,
      currency: 'INR',
      description: 'Consultation fee remittance',
      category: 'Transfer',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 158500.50,
      balanceAfterReceiver: 89000.00,
      completedAt: new Date(Date.now() - 5 * 86400000),
      createdAt: new Date(Date.now() - 5 * 86400000),
    });

    const tx3 = await Transaction.create({
      transactionId: 'TXN-SEED-003',
      referenceNumber: 'BBPS-981240312',
      type: TRANSACTION_TYPES.BILL_PAYMENT,
      senderAccount: cust1Savings._id,
      senderUser: customer1._id,
      amount: 1450.00,
      currency: 'INR',
      description: 'Fiber Bill: JioFiber Broadband',
      category: 'Internet',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 157050.50,
      completedAt: new Date(Date.now() - 2 * 86400000),
      createdAt: new Date(Date.now() - 2 * 86400000),
    });

    const tx4 = await Transaction.create({
      transactionId: 'TXN-SEED-004',
      referenceNumber: 'BBPS-981240455',
      type: TRANSACTION_TYPES.BILL_PAYMENT,
      senderAccount: cust1Savings._id,
      senderUser: customer1._id,
      amount: 8550.00,
      currency: 'INR',
      description: 'Electricity Bill: BESCOM Bengaluru',
      category: 'Electricity',
      status: TRANSACTION_STATUS.SUCCESS,
      balanceAfterSender: 148500.50,
      completedAt: new Date(Date.now() - 1 * 86400000),
      createdAt: new Date(Date.now() - 1 * 86400000),
    });

    // 7. Create Bill Payments
    await BillPayment.create({
      user: customer1._id,
      account: cust1Savings._id,
      transaction: tx3._id,
      category: BILL_CATEGORIES.INTERNET,
      billerName: 'JioFiber Broadband',
      consumerNumber: 'JIO-99201488',
      amount: 1450.00,
      paymentReference: 'BBPS-982141',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 2 * 86400000),
    });

    await BillPayment.create({
      user: customer1._id,
      account: cust1Savings._id,
      transaction: tx4._id,
      category: BILL_CATEGORIES.ELECTRICITY,
      billerName: 'BESCOM - Bengaluru Electricity',
      consumerNumber: 'BES-44019283',
      amount: 8550.00,
      paymentReference: 'BBPS-982142',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 1 * 86400000),
    });

    // 8. Notifications
    await Notification.create([
      {
        user: customer1._id,
        title: 'Welcome to Suraksha Digital Bank',
        message: 'Your savings account #100982347101 is activated. IFSC: SURB0001008, Nariman Point Mumbai Branch.',
        type: 'ACCOUNT',
        isRead: true,
        createdAt: new Date(Date.now() - 20 * 86400000),
      },
      {
        user: customer1._id,
        title: 'Security Notice: Beneficiary Added',
        message: 'Beneficiary "Priya Patel" (#100871928301 - ICICI Bank) was successfully verified via OTP.',
        type: 'SECURITY',
        isRead: false,
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        user: customer1._id,
        title: 'IMPS Transfer Completed',
        message: 'Your instant IMPS remittance of Rs. 6,500.00 to Priya Patel was successful. Ref: IMPS-981240283.',
        type: 'TRANSACTION',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        user: customer2._id,
        title: 'IMPS Funds Inward Credit',
        message: 'Received Rs. 6,500.00 from Aarav Sharma into account #100871928301.',
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

    logger.info('Database seeded successfully with Indian demo customers and admin officer!');
    logger.info('----------------------------------------------------');
    logger.info('SURAKSHA BANK DEMO ACCOUNTS FOR EVALUATION:');
    logger.info('Admin Officer: admin@securebank.test | Password: Admin@12345!');
    logger.info('Customer 1:    customer1@securebank.test | Password: Password@12345! (Aarav Sharma - Rs. 1,48,500.50)');
    logger.info('Customer 2:    customer2@securebank.test | Password: Password@12345! (Priya Patel - Rs. 89,000.00)');
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
