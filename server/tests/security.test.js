import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { ROLES } from '../utils/constants.js';
import { AuthService } from '../services/authService.js';
import './setup.js';

describe('Security & RBAC Enforcement Tests', () => {
  let customerToken, adminToken;

  beforeEach(async () => {
    // 1. Create Normal Customer
    const custRes = await request(app).post('/api/auth/register').send({
      fullName: 'Regular Customer',
      email: 'regular@bank.test',
      password: 'Password@12345!',
      phoneNumber: '+1-555-3333',
      dateOfBirth: '1991-03-03',
    });
    customerToken = custRes.body.data.token;

    // 2. Create Admin User
    const adminUser = new User({
      customerId: 'CUST-ADM-TEST',
      fullName: 'Security Officer',
      email: 'admin@bank.test',
      password: 'Admin@12345!',
      phoneNumber: '+1-555-9999',
      dateOfBirth: new Date('1980-01-01'),
      role: ROLES.ADMIN,
    });
    await adminUser.save();
    adminToken = AuthService.generateToken(adminUser);
  });

  test('RBAC: Customer is forbidden (403) from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('ROLE_UNAUTHORIZED');
  });

  test('RBAC: Admin successfully accesses admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overview).toBeDefined();
  });

  test('Security: Unauthenticated request to protected route is rejected with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/accounts');

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('AUTH_TOKEN_MISSING');
  });

  test('Security: Invalid or tampered JWT token is rejected with 401', async () => {
    const res = await request(app)
      .get('/api/accounts')
      .set('Authorization', 'Bearer forged_tampered_token_string_here');

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('INVALID_TOKEN');
  });
});
