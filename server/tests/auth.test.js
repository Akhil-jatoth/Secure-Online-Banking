import request from 'supertest';
import app from '../app.js';
import './setup.js';

describe('Authentication API Tests', () => {
  const validUserData = {
    fullName: 'Test Customer',
    email: 'tester@securebank.test',
    password: 'Password@12345!',
    phoneNumber: '+1-555-0100',
    dateOfBirth: '1995-06-15',
    address: { street: '123 Main St', city: 'Metropolis', state: 'NY', postalCode: '10001' },
  };

  test('POST /api/auth/register - Successfully registers user and opens initial bank account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUserData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('tester@securebank.test');
    expect(res.body.data.account.accountNumber).toBeDefined();
    expect(res.body.data.account.balance).toBe(2500.00);
    expect(res.body.data.token).toBeDefined();
  });

  test('POST /api/auth/register - Rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(validUserData);
    const res = await request(app).post('/api/auth/register').send(validUserData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/register - Rejects weak password without required character classes', async () => {
    const weakUserData = { ...validUserData, email: 'weak@securebank.test', password: 'password123' };
    const res = await request(app).post('/api/auth/register').send(weakUserData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  test('POST /api/auth/login - Successfully authenticates and returns JWT token', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@securebank.test', password: 'Password@12345!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('tester@securebank.test');
  });

  test('POST /api/auth/login - Rejects invalid password credentials', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@securebank.test', password: 'WrongPassword@123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Locks out account after 5 consecutive failed login attempts', async () => {
    await request(app).post('/api/auth/register').send(validUserData);

    // Attempt 5 incorrect logins
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'tester@securebank.test', password: `WrongAttempt_${i}` });
    }

    // 6th attempt should return 403 Account Locked
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tester@securebank.test', password: 'Password@12345!' });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Account is locked/i);
  });
});
