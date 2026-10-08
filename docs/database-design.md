# Database Design & Data Modeling Specification

## 1. Entity-Relationship Overview

The database uses MongoDB with Mongoose ODM. Below is the Entity-Relationship Diagram (ERD):

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : "owns"
    USER ||--o{ BENEFICIARY : "manages"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ OTP : "requests"
    ACCOUNT ||--o{ TRANSACTION : "sends/receives"
    ACCOUNT ||--o{ BILL_PAYMENT : "funds"
    TRANSACTION ||--o| BILL_PAYMENT : "records"

    USER {
        ObjectId _id PK
        string customerId UK "Indexed"
        string fullName
        string email UK "Indexed"
        string password "bcrypt hashed"
        string phoneNumber
        date dateOfBirth
        object address
        string role "CUSTOMER | ADMIN"
        number failedLoginAttempts
        date lockUntil
        date lastLoginAt
        string lastLoginIp
        date createdAt
        date updatedAt
    }

    ACCOUNT {
        ObjectId _id PK
        string accountNumber UK "Indexed"
        ObjectId user FK "Indexed"
        string accountType "Savings | Current"
        number balance
        number availableBalance
        string currency "USD"
        string status "ACTIVE | FROZEN | CLOSED"
        number dailyTransferLimit
        date createdAt
        date updatedAt
    }

    TRANSACTION {
        ObjectId _id PK
        string transactionId UK "Indexed"
        string referenceNumber UK "Indexed"
        string type "TRANSFER | BILL_PAYMENT | DEPOSIT | WITHDRAWAL"
        ObjectId senderAccount FK "Indexed"
        ObjectId receiverAccount FK "Indexed"
        ObjectId senderUser FK "Indexed"
        ObjectId receiverUser FK "Indexed"
        number amount
        string currency
        string description
        string category
        string status "PENDING | SUCCESS | FAILED | REVERSED"
        number balanceAfterSender
        number balanceAfterReceiver
        date completedAt
        date createdAt
    }

    BENEFICIARY {
        ObjectId _id PK
        ObjectId user FK "Indexed"
        string name
        string nickname
        string accountNumber "Compound UK (user+acc)"
        string bankName
        string routingNumber
        string status "ACTIVE | INACTIVE"
        date createdAt
    }

    BILL_PAYMENT {
        ObjectId _id PK
        ObjectId user FK "Indexed"
        ObjectId account FK
        ObjectId transaction FK
        string category "Electricity | Water | Internet | Mobile | Credit Card | Insurance"
        string billerName
        string consumerNumber
        number amount
        string paymentReference UK "Indexed"
        string status "SUCCESS | FAILED | PENDING"
        date createdAt
    }

    OTP {
        ObjectId _id PK
        ObjectId userId FK "Indexed"
        string email "Indexed"
        string otpHash "bcrypt hashed"
        string purpose "TRANSFER | ADD_BENEFICIARY | DELETE_BENEFICIARY | CHANGE_PASSWORD | RESET_PASSWORD"
        number attempts "Max 3"
        boolean isUsed "Indexed"
        date expiresAt "TTL Index (expires: 0)"
        date createdAt
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK "Indexed"
        string userEmail
        string userRole
        string action "Indexed"
        string resource
        string resourceId
        string ipAddress
        string userAgent
        string status "SUCCESS | FAILURE | WARNING"
        object metadata
        date createdAt "Indexed (Append-only)"
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK "Indexed"
        string title
        string message
        string type "SECURITY | TRANSACTION | BILL | ACCOUNT | GENERAL"
        boolean isRead "Indexed"
        object metadata
        date createdAt "Indexed"
    }
```

---

## 2. Key Indexes & Performance Optimization

| Collection | Index Fields | Type | Purpose |
|---|---|---|---|
| **User** | `{ email: 1 }` | Unique | Fast login lookup and prevention of duplicate registrations. |
| **User** | `{ customerId: 1 }` | Unique | Quick customer ID indexing. |
| **Account** | `{ accountNumber: 1 }` | Unique | Direct account destination resolution during fund transfers. |
| **Account** | `{ user: 1, status: 1 }` | Compound | Fast retrieval of a customer's active deposit accounts. |
| **Transaction** | `{ senderAccount: 1, createdAt: -1 }` | Compound | Rapid sorting of sender history. |
| **Transaction** | `{ receiverAccount: 1, createdAt: -1 }` | Compound | Rapid sorting of receiver history. |
| **Transaction** | `{ referenceNumber: 1 }` | Unique | Receipt lookup and duplicate prevention. |
| **Beneficiary** | `{ user: 1, accountNumber: 1 }` | Compound Unique | Prevents customer from adding the exact same account number twice. |
| **OTP** | `{ expiresAt: 1 }` | TTL Index (`expires: 0`) | Automatic MongoDB physical deletion upon token expiry. |
| **AuditLog** | `{ createdAt: -1 }` | Standard | High-throughput admin audit log chronological stream. |
| **Notification** | `{ user: 1, isRead: 1, createdAt: -1 }` | Compound | Instant notification count and badge polling. |
