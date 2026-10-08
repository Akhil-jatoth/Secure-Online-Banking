import request from 'supertest';
import app from '../app.js';
import { OTPService } from '../services/otpService.js';
import { OTP_PURPOSES } from '../utils/constants.js';
import './setup.js';

describe('Beneficiary Management API Tests', () => {
  let userToken, userId;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Ben Tester',
      email: 'bentest@bank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-555-4444',
      dateOfBirth: '1993-04-04',
    });
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  test('POST /api/beneficiaries - Adds beneficiary with valid OTP', async () => {
    const otpGen = await OTPService.generateOTP({
      userId,
      purpose: OTP_PURPOSES.ADD_BENEFICIARY,
    });

    const res = await request(app)
      .post('/api/beneficiaries')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Jane Doe',
        nickname: 'Jane Sister',
        accountNumber: '100998877665',
        bankName: 'Aegis Bank',
        routingNumber: 'AEGIS0018',
        otp: otpGen.demoCode,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Doe');
    expect(res.body.data.accountNumber).toBe('100998877665');
  });

  test('POST /api/beneficiaries - Prevents duplicate beneficiary addition for same account number', async () => {
    const otpGen1 = await OTPService.generateOTP({
      userId,
      purpose: OTP_PURPOSES.ADD_BENEFICIARY,
    });

    await request(app)
      .post('/api/beneficiaries')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Jane Doe',
        accountNumber: '100998877665',
        bankName: 'Aegis Bank',
        routingNumber: 'AEGIS0018',
        otp: otpGen1.demoCode,
      });

    const otpGen2 = await OTPService.generateOTP({
      userId,
      purpose: OTP_PURPOSES.ADD_BENEFICIARY,
    });

    const res = await request(app)
      .post('/api/beneficiaries')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Jane Doe Duplicate',
        accountNumber: '100998877665',
        bankName: 'Aegis Bank',
        routingNumber: 'AEGIS0018',
        otp: otpGen2.demoCode,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already added/i);
  });
});
