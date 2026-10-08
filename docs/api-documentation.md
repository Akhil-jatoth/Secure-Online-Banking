# API Specification & Endpoints Reference

Base URL: `http://localhost:5000/api`

All protected routes require an HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Registers a new customer and auto-creates an active deposit account.

**Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password@12345!",
  "phoneNumber": "+1-555-0199",
  "dateOfBirth": "1994-06-15",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "OR",
    "postalCode": "97477"
  }
}
```

### `POST /auth/login`
Authenticates a user and returns a signed JWT.

**Request Body**:
```json
{
  "email": "customer1@securebank.test",
  "password": "Password@12345!"
}
```

### `POST /auth/request-otp`
Dispatches a 6-digit MFA OTP code for sensitive operations.

**Request Body**:
```json
{
  "purpose": "TRANSFER"
}
```

---

## 2. Account Endpoints

### `GET /accounts`
Retrieves all deposit accounts belonging to the authenticated customer.

### `GET /accounts/:id/balance`
Retrieves real-time ledger and available balance for a specific account.

### `POST /accounts/open`
Opens an additional Savings or Current account for the customer.

---

## 3. Transaction Endpoints

### `POST /transactions/transfer`
Executes an atomic fund transfer.

**Request Body**:
```json
{
  "fromAccountId": "60d0fe4f5311236168a109ca",
  "toAccountNumber": "100871928301",
  "amount": 250.00,
  "description": "Consultation Fee",
  "otp": "123456"
}
```

### `GET /transactions`
Queries transaction history with filtering parameters:
- `page`, `limit`
- `type` (`TRANSFER`, `BILL_PAYMENT`, `DEPOSIT`)
- `status` (`SUCCESS`, `PENDING`, `FAILED`)
- `startDate`, `endDate`, `search`

---

## 4. Beneficiary Endpoints

### `GET /beneficiaries`
List all saved payees.

### `POST /beneficiaries`
Add a new beneficiary (requires `otp`).

### `DELETE /beneficiaries/:id`
Delete a beneficiary (requires `{ otp: "123456" }` in request body).

---

## 5. Bill Payment Endpoints

### `POST /bills/pay`
Executes an atomic utility bill payment.

**Request Body**:
```json
{
  "accountId": "60d0fe4f5311236168a109ca",
  "category": "Electricity",
  "billerName": "Metropolis Power & Light",
  "consumerNumber": "ELEC-99201",
  "amount": 145.50
}
```

---

## 6. Statement Endpoints

### `GET /statements`
Calculates opening balance, total debits, total credits, and itemized ledger.

### `GET /statements/download`
Streams a dynamically generated certified PDF statement file.

---

## 7. Administrative Endpoints (`ADMIN` Role Required)

### `GET /admin/dashboard`
Returns total customers, accounts, transaction metrics, and daily trends.

### `GET /admin/users`
Paginated search across all registered customers and their accounts.

### `PATCH /admin/accounts/:id/freeze`
Freezes a customer account and prevents outgoing transfers.

### `PATCH /admin/accounts/:id/unfreeze`
Reactivates a frozen account.

### `GET /admin/audit-logs`
Queries the immutable audit log trail with filter criteria.
