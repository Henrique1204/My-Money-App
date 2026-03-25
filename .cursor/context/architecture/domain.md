# Domain Model

## Overview

This document describes the domain model for the My Money App, a personal finance management system that allows users to track their billing cycles and transactions.

---

## Entities

### User

The root entity representing an authenticated user in the system.

```typescript
interface User {
  id: UUID;
  name: string;
  email: string;
  password: string; // hashed
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `name` | string | User's display name |
| `email` | string | Unique email for authentication |
| `password` | string | Hashed password (bcrypt) |

**Business Rules:**
- Email must be unique across all users
- Password must have minimum 8 characters, 1 uppercase, 1 number
- Password is always stored hashed, never plain text

---

### BillingCycle

Represents a billing period (typically monthly) for organizing transactions.

```typescript
interface BillingCycle {
  id: UUID;
  userId: UUID;
  name: string;
  date: Date;
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `userId` | UUID | Reference to owner User |
| `name` | string | Descriptive name (e.g., "January 2026") |
| `date` | Date | Reference date for the billing period |

**Business Rules:**
- Must belong to exactly one User
- Name should be descriptive of the period
- Date defines the billing period reference

---

## Aggregates

### Transaction

A financial transaction within a billing cycle. This is an **aggregate** of BillingCycle.

```typescript
interface Transaction {
  id: UUID;
  billingCycleId: UUID;
  name: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'paid' | 'scheduled' | 'received';
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `billingCycleId` | UUID | Reference to parent BillingCycle |
| `name` | string | Transaction description |
| `amount` | number | Transaction value (always positive) |
| `type` | enum | `credit` (income) or `debit` (expense) |
| `status` | enum | Current transaction status |

**Transaction Types:**
| Type | Description |
|------|-------------|
| `credit` | Money coming in (salary, freelance, etc.) |
| `debit` | Money going out (bills, purchases, etc.) |

**Transaction Statuses:**
| Status | Description |
|--------|-------------|
| `pending` | Not yet processed |
| `paid` | Debit has been paid |
| `scheduled` | Scheduled for future date |
| `received` | Credit has been received |

**Business Rules:**
- Amount must be >= 0
- Must belong to exactly one BillingCycle
- Status transitions should follow logical flow
- Cannot exist without a parent BillingCycle (aggregate root dependency)

---

## Derived Values

### Summary

A **computed value object** derived from all BillingCycles of a User. Not persisted, calculated on demand.

```typescript
interface Summary {
  totalOfDebits: number;
  totalOfCredits: number;
  totalOfDerived: number;
}
```

| Field | Type | Calculation |
|-------|------|-------------|
| `totalOfDebits` | number | Sum of all `debit` transactions |
| `totalOfCredits` | number | Sum of all `credit` transactions |
| `totalOfDerived` | number | `totalOfCredits - totalOfDebits` |

**Calculation Logic:**
```
totalOfDebits  = Σ (transaction.amount) where type = 'debit'
totalOfCredits = Σ (transaction.amount) where type = 'credit'
totalOfDerived = totalOfCredits - totalOfDebits
```

**Business Rules:**
- Calculated across ALL BillingCycles of a User
- Positive `totalOfDerived` indicates surplus
- Negative `totalOfDerived` indicates deficit
- Should be recalculated when transactions change

---

## Relationships

```
┌──────────────────────────────────────────────────────────────────┐
│                            USER                                  │
│                         (Aggregate Root)                         │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       BILLING CYCLE                              │
│                      (Aggregate Root)                            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        TRANSACTION                               │
│                    (Aggregate of BillingCycle)                   │
└──────────────────────────────────────────────────────────────────┘

                              │
                              │ derives
                              ▼
                    ┌─────────────────┐
                    │     SUMMARY     │
                    │ (Derived Value) │
                    └─────────────────┘
```

### Relationship Matrix

| From | To | Cardinality | Description |
|------|----|-------------|-------------|
| User | BillingCycle | 1:N | One user has many billing cycles |
| BillingCycle | User | N:1 | Each billing cycle belongs to one user |
| BillingCycle | Transaction | 1:N | One billing cycle has many transactions |
| Transaction | BillingCycle | N:1 | Each transaction belongs to one billing cycle |
| User | Summary | 1:1 | One user has one derived summary |

---

## Aggregate Boundaries

### User Aggregate
- **Root**: User
- **Boundary**: User data only (authentication concerns)
- **Invariants**: Unique email, valid password

### BillingCycle Aggregate
- **Root**: BillingCycle
- **Children**: Transaction (aggregate member)
- **Boundary**: BillingCycle + all its Transactions
- **Invariants**: 
  - Transactions cannot exist without BillingCycle
  - Deleting BillingCycle cascades to Transactions

---

## Domain Events (Future)

| Event | Trigger | Data |
|-------|---------|------|
| `UserCreated` | New user signup | userId, email |
| `BillingCycleCreated` | New billing cycle | billingCycleId, userId |
| `TransactionAdded` | New transaction | transactionId, billingCycleId, amount, type |
| `TransactionUpdated` | Transaction modified | transactionId, changes |
| `TransactionDeleted` | Transaction removed | transactionId |

---

## Query Patterns

### Common Queries

| Query | Input | Output |
|-------|-------|--------|
| Get user billing cycles | userId | BillingCycle[] |
| Get billing cycle transactions | billingCycleId | Transaction[] |
| Get user summary | userId | Summary |
| Get billing cycle summary | billingCycleId | Summary (scoped) |

### Summary Aggregation

```
GET /api/summary
├── Fetch all BillingCycles for userId
├── For each BillingCycle:
│   └── Sum transactions by type
├── Aggregate totals
└── Return Summary
```
