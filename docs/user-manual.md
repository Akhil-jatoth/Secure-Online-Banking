# Aegis Online Banking - User Manual & Walkthrough

## 1. Quick Start Credentials

For academic grading and demonstration purposes, the database is auto-seeded with test accounts:

| Role | Email | Password | Details |
|---|---|---|---|
| **Customer 1** | `customer1@securebank.test` | `Password@12345!` | Alexander Wright ($14,850.50 Savings, $3,200.00 Current) |
| **Customer 2** | `customer2@securebank.test` | `Password@12345!` | Elena Rostova ($8,900.00 Savings) |
| **Admin** | `admin@securebank.test` | `Admin@12345!` | Full system security officer permissions |

> **Convenience Feature**: The Login screen includes 1-click **"Demo Customer 1"**, **"Demo Customer 2"**, and **"Admin Officer"** buttons that autofill credentials.

---

## 2. Customer Operations Walkthrough

### 2.1 Registering a New Account
1. Navigate to `/register`.
2. Provide your legal name, email, phone number, date of birth, and residential address.
3. Choose a password that meets the 5 complexity criteria (length, uppercase, lowercase, numbers, special characters).
4. Click **"Complete Registration & Open Account"** to receive an instant welcome balance of **$2,500.00 USD**.

### 2.2 Executing a Fund Transfer
1. Navigate to **Transfer Funds** (`/transfer`).
2. Select your source account (balance displayed in real-time).
3. Choose a saved beneficiary (e.g. Elena Rostova) or type a 12-digit account number directly.
4. Enter the transfer amount and optional memo.
5. Click **"Review Transfer Details"**.
6. Review the summary dialog and click **"Request OTP & Authorize"**.
7. Enter the 6-digit OTP (or click **"Auto-Fill"** in the academic demo banner).
8. View the certified digital receipt with updated remaining balance.

### 2.3 Paying Utility Bills
1. Navigate to **Pay Bills** (`/bills`).
2. Select a utility category (e.g. Electricity, Water, Internet, Mobile, Credit Card, Insurance).
3. Select the biller provider and enter the consumer reference number.
4. Input the amount and click **"Confirm & Pay Bill Now"**.
5. The payment is processed atomically with an instant electronic receipt.

### 2.4 Generating Official PDF Statements
1. Navigate to **Account Statements** (`/statements`).
2. Choose your deposit account and timeframe preset (Last 7 Days, Last 30 Days, Last 3 Months, or Custom Range).
3. View the on-screen ledger breakdown (Opening Balance, Total Inflows, Total Outflows, Closing Balance).
4. Click **"Download PDF Statement"** to download the official formatted PDF document generated on the backend.

---

## 3. Administrative Operations Walkthrough

### 3.1 Inspecting Customers & Freezing Accounts
1. Sign in with `admin@securebank.test`.
2. Navigate to **Customer Accounts** (`/admin/customers`).
3. Search for any customer by name, email, or account number.
4. Click **"Inspect"** to review their KYC information and deposit accounts.
5. Click **"Freeze Account"** and provide an administrative reason to freeze the account. Any attempt by the customer to transfer funds will be blocked.
6. Click **"Unfreeze Account"** to restore account privileges.

### 3.2 Reviewing Immutable Audit Logs
1. Navigate to **Security Audit Logs** (`/admin/audit-logs`).
2. Filter logs by action (`LOGIN`, `FAILED_LOGIN`, `FUND_TRANSFER_SUCCESS`, `ACCOUNT_FREEZE`).
3. Click the code inspection button on any row to inspect IP addresses, user agents, and security payload metadata.
