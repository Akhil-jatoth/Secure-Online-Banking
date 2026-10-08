# System Requirements Specification (SRS)

## 1. Problem Statement
Traditional academic web applications often fail to incorporate enterprise security paradigms such as Multi-Factor Authentication (MFA), strict Role-Based Access Control (RBAC), defense against injection and brute-force attacks, atomic database transactions, and immutable audit trails. The **Aegis Secure Online Banking System** addresses this educational gap by providing a full-stack, enterprise-grade online banking simulation built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

> **Academic Notice**: This project is an academic simulation designed for Software Engineering and Cybersecurity courses. It operates within a sandboxed environment and does not connect to real financial clearing houses, card networks, or payment gateways.

---

## 2. User Roles & Personas

### 2.1 Customer Role (`CUSTOMER`)
The authenticated retail banking client capable of conducting day-to-day financial operations:
- Secure registration and login with rate-limiting and lockout protection.
- Viewing account balances, available credit, and multi-account portfolios.
- Executing atomic fund transfers with OTP-based Two-Factor Authentication.
- Managing beneficiaries (add, update, delete with OTP verification).
- Paying utility bills across various service categories.
- Generating on-screen and downloadable certified PDF statements.
- Updating KYC profile details and changing passwords.
- Receiving transaction and security notifications.

### 2.2 Administrator Role (`ADMIN`)
The privileged banking security officer responsible for system oversight and risk management:
- Viewing global transaction metrics and system liquidity overview.
- Searching and inspecting customer files and KYC status.
- Freezing and unfreezing deposit accounts with mandatory audit reasoning.
- Monitoring global transaction throughput.
- Inspecting immutable append-only audit logs.

---

## 3. Functional Requirements (FR)

| ID | Module | Description | Priority |
|---|---|---|---|
| **FR-01** | Authentication | User registration with input validation, strong password enforcement, and automatic savings account generation. | High |
| **FR-02** | Authentication | Email/password login with JWT token issuance, failed attempt tracking, and 15-minute lockout after 5 failures. | High |
| **FR-03** | MFA / OTP | 6-digit cryptographic OTP generation, bcrypt hashing, 5-minute TTL, and attempt limits for sensitive operations. | High |
| **FR-04** | Account Management | Support for multiple deposit accounts (Savings, Current) per customer with live balance tracking. | High |
| **FR-05** | Fund Transfer | Atomic fund transfers between internal accounts or beneficiaries with OTP verification and rollback on error. | High |
| **FR-06** | Beneficiary Management | CRUD operations for saved payees with unique constraint enforcement and OTP verification for creation/deletion. | High |
| **FR-07** | Bill Payments | Instant utility bill payments (Electricity, Water, Internet, Mobile, Insurance) with atomic deduction. | High |
| **FR-08** | Statements | Dynamic calculation of opening/closing balance, total debits/credits, and PDF statement generation via PDFKit. | Medium |
| **FR-09** | Notifications | Real-time security and transaction notification feed with unread badges and mark-as-read status. | Medium |
| **FR-10** | Admin Dashboard | Real-time monitoring of customer counts, account statuses, transaction volumes, and daily trends. | High |
| **FR-11** | Account Freezing | Administrative capability to freeze customer accounts, instantly blocking all outgoing financial activities. | High |
| **FR-12** | Audit Trail | Immutable append-only audit logging recording timestamp, IP address, user agent, action, and metadata. | High |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Security
- **Password Hashing**: Stored using bcrypt with cost factor 12.
- **Session Management**: Stateless JWT with HMAC SHA-256 signatures and 1-hour expiration.
- **Input Sanitization**: Express middleware sanitizing MongoDB operators (`$`, `.`) to prevent NoSQL injection.
- **HTTP Headers**: Helmet security headers configured (CSP, HSTS, X-Content-Type-Options).
- **Rate Limiting**: Tiered rate limits protecting authentication and transaction endpoints.

### 4.2 Reliability & Data Integrity
- **Transaction Atomicity**: Financial operations ensure all balance mutations, transaction records, and audit logs succeed together or revert completely.
- **Data Precision**: Floating point currency values rounded and formatted to 2 decimal places.

### 4.3 Usability & Aesthetics
- Responsive desktop, tablet, and mobile interface with dark mode support.
- Interactive data visualizations powered by Recharts.
- Clear error alerts, skeleton loaders, and demo auto-fill aids for academic evaluation.

---

## 5. Assumptions & Constraints
- The system runs in standard Node.js (v18+) and modern web browsers.
- In environments without active MongoDB replica sets, a fallback transaction handler guarantees sequential atomic consistency.
