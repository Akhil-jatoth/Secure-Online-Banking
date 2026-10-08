# Automated Testing Strategy & Test Plan

## 1. Test Strategy Overview

The testing suite utilizes **Jest**, **Supertest**, and **mongodb-memory-server** to execute fast, deterministic, isolated integration tests without requiring an external database daemon.

### Running Automated Tests
```bash
# In the /server directory
npm test

# In watch mode
npm run test:watch
```

---

## 2. Test Suite Matrix

### 2.1 Authentication Test Suite (`/server/tests/auth.test.js`)
- `POST /api/auth/register` - Successfully registers new customer and auto-creates primary savings account with opening balance.
- `POST /api/auth/register` - Rejects duplicate email address registration with 400 Bad Request.
- `POST /api/auth/register` - Rejects weak passwords that do not meet complexity criteria (8+ chars, uppercase, lowercase, numbers, special characters).
- `POST /api/auth/login` - Successfully authenticates valid credentials and returns JWT payload.
- `POST /api/auth/login` - Rejects incorrect password credentials with 401 Unauthorized.
- `POST /api/auth/login` - Locks out account after 5 consecutive failed login attempts (returns 403 Forbidden).

### 2.2 Fund Transfer & Atomicity Test Suite (`/server/tests/transfer.test.js`)
- `POST /api/transactions/transfer` - Successfully transfers funds with valid OTP and updates sender/receiver balances atomically.
- `POST /api/transactions/transfer` - Rejects transfer attempt when amount exceeds available balance.
- `POST /api/transactions/transfer` - Rejects transfer with invalid or ungenerated OTP code.

### 2.3 Beneficiary Management Test Suite (`/server/tests/beneficiary.test.js`)
- `POST /api/beneficiaries` - Adds a new beneficiary when supplied with a valid 6-digit OTP code.
- `POST /api/beneficiaries` - Rejects adding a duplicate beneficiary for the same user and account number.

### 2.4 Security & RBAC Enforcement Test Suite (`/server/tests/security.test.js`)
- `GET /api/admin/dashboard` - Normal customer token is forbidden (403 Forbidden) from accessing admin endpoints.
- `GET /api/admin/dashboard` - Administrative token successfully accesses admin endpoints (200 OK).
- `GET /api/accounts` - Unauthenticated request is rejected with 401 Unauthorized (`AUTH_TOKEN_MISSING`).
- `GET /api/accounts` - Tampered or invalid JWT signature is rejected with 401 Unauthorized (`INVALID_TOKEN`).
