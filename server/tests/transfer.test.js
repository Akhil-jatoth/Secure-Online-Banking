import request from 'supertest';
import app from '../app.js';
import { OTPService } from '../services/otpService.js';
import { OTP_PURPOSES } from '../utils/constants.js';
import './setup.js';

describe('Fund Transfer & Balance Atomic Verification Tests', () => {
  let senderToken, receiverToken;
  let senderAccountId, receiverAccountId, receiverAccountNumber;
  let senderUserId;

  beforeEach(async () => {
    // 1. Create Sender (Customer 1)
    const res1 = await request(app).post('/api/auth/register').send({
      fullName: 'Sender User',
      email: 'sender@bank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-555-1111',
      dateOfBirth: '1990-01-01',
    });
    senderToken = res1.body.data.token;
    senderUserId = res1.body.data.user.id;

    const senderAccounts = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${senderToken}`);
    senderAccountId = senderAccounts.body.data[0]._id;

    // 2. Create Receiver (Customer 2)
    const res2 = await request(app).post('/api/auth/register').send({
      fullName: 'Receiver User',
      email: 'receiver@bank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-555-2222',
      dateOfBirth: '1992-02-02',
    });
    receiverToken = res2.body.data.token;

    const receiverAccounts = await request(app)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${receiverToken}`);
    receiverAccountId = receiverAccounts.body.data[0]._id;
    receiverAccountNumber = receiverAccounts.body.data[0].accountNumber;
  });

  test('POST /api/transactions/transfer - Successfully transfers funds with valid OTP and updates balances atomically', async () => {
    // Generate valid OTP for transfer
    const otpGen = await OTPService.generateOTP({
      userId: senderUserId,
      purpose: OTP_PURPOSES.TRANSFER,
    });
    const otpCode = otpGen.demoCode;

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        fromAccountId: senderAccountId,
        toAccountNumber: receiverAccountNumber,
        amount: 500.00,
        description: 'Test Transfer $500',
        otp: otpCode,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.balanceAfter).toBe(2000.00); // 2500 - 500 = 2000

    // Verify Receiver Balance increased by 500
    const receiverCheck = await request(app)
      .get(`/api/accounts/${receiverAccountId}/balance`)
      .set('Authorization', `Bearer ${receiverToken}`);
    expect(receiverCheck.body.data.balance).toBe(3000.00); // 2500 + 500 = 3000
  });

  test('POST /api/transactions/transfer - Rejects transfer with insufficient balance', async () => {
    const otpGen = await OTPService.generateOTP({
      userId: senderUserId,
      purpose: OTP_PURPOSES.TRANSFER,
    });

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        fromAccountId: senderAccountId,
        toAccountNumber: receiverAccountNumber,
        amount: 99999.00,
        otp: otpGen.demoCode,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient funds/i);
  });

  test('POST /api/transactions/transfer - Rejects transfer with invalid OTP', async () => {
    // Generate an OTP first
    await OTPService.generateOTP({
      userId: senderUserId,
      purpose: OTP_PURPOSES.TRANSFER,
    });

    const res = await request(app)
      .post('/api/transactions/transfer')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        fromAccountId: senderAccountId,
        toAccountNumber: receiverAccountNumber,
        amount: 100.00,
        otp: '000000', // incorrect code
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid OTP/i);
  });
});
