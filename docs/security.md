# Security Architecture & Threat Modeling

## 1. Security Architecture Principles

Aegis Secure Online Banking implements defense-in-depth principles:

### 1.1 Zero-Trust Client Model
The frontend client is treated as completely untrusted:
- The server **never** trusts `userId`, `balance`, `role`, or `ownership` parameters sent in request bodies.
- Authenticated identity is strictly derived from the verified JWT payload on the server.
- Object-level authorization checks guarantee that customers can only query or debit accounts they legally own.

### 1.2 Authentication & Password Security
- **Hashing**: All user passwords are encrypted using `bcryptjs` with 12 salt rounds before persisting to disk. Plaintext passwords never touch database storage or log output.
- **Complexity Enforcement**: Minimum 8 characters, with mandatory uppercase, lowercase, numerical, and special characters (`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_\-+=<>.,/|\\])[A-Za-z\d@$!%*?&#^~_\-+=<>.,/|\\]{8,}$/`).
- **Brute-Force & Lockout Guard**: 5 consecutive failed login attempts trigger an automatic 15-minute account lockout, logging a warning event to the immutable audit trail.

### 1.3 Two-Factor Authentication (OTP / MFA)
- All high-risk financial and administrative actions (Fund Transfer, Add Beneficiary, Delete Beneficiary, Change Password, Reset Password) mandate verification of a 6-digit cryptographic OTP.
- OTPs are hashed in storage, subject to a strict 5-minute Time-to-Live (TTL), limited to 3 attempts, and immediately invalidated upon verification.

### 1.4 Role-Based Access Control (RBAC)
- Endpoints are shielded by middleware: `authenticate`, `requireCustomer`, `requireAdmin`.
- Accessing any `/api/admin/*` route without an active `ADMIN` token returns `403 Forbidden` with a security audit log event.

### 1.5 Web Vulnerability Defenses

| Vulnerability | Attack Vector | Aegis Defense Mechanism |
|---|---|---|
| **NoSQL Injection** | Attacker injects MongoDB query operators (e.g. `{"$gt": ""}`) in JSON payloads | Custom `sanitizeInput` recursive middleware strips any keys containing `$` or `.`. |
| **Cross-Site Scripting (XSS)** | Injected malicious HTML/JS payloads executed in user browser | React auto-escaping, Helmet Content Security Policy (CSP), and input validation schemas. |
| **Cross-Site Request Forgery (CSRF)** | Unauthorized commands transmitted from a trusted user | Stateless JWT Bearer authorization in HTTP headers (not susceptible to standard cross-origin form posting). |
| **Denial of Service (DoS)** | Excessive brute-force API requests | `express-rate-limit` throttles IP requests (general API limit: 200/15m; auth limit: 10/15m; transfer limit: 15/1m). |
| **Information Leakage** | Stack traces or DB credentials leaked in error responses | Centralized `errorHandler` hides internal traces in production and outputs standardized error codes. |

---

## 2. Immutable Audit Logging

Every critical event generates an append-only `AuditLog` entry storing:
- `userId` & `userEmail`
- `action` (e.g. `LOGIN`, `FAILED_LOGIN`, `FUND_TRANSFER_SUCCESS`, `ACCOUNT_FREEZE`)
- `resource` & `resourceId`
- `ipAddress` & `userAgent`
- `status` (`SUCCESS`, `FAILURE`, `WARNING`)
- `metadata` snapshot

Normal application operations have no access to delete or modify existing audit records.
