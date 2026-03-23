# Architecture - Backend (API)

## Technologies Used

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Node.js | - |
| Language | TypeScript | 5.6.2 |
| Framework | Express | 4.21.0 |
| Database | MongoDB | - |
| ODM | Mongoose | 8.6.0 |
| Authentication | JWT (jsonwebtoken) | 9.0.2 |
| Encryption | bcrypt | 5.1.1 |
| Dev Server | tsx | 4.19.0 |
| Utilities | Lodash | 4.17.21 |

## Folder Structure

```
src/
├── loader.ts                # Entry point (loads DB + server)
├── config/                  # Server configuration
│   ├── server.ts            # Express + middlewares
│   ├── database.ts          # MongoDB connection
│   ├── routes.ts            # Route definitions
│   ├── cors.ts              # CORS configuration
│   └── auth.ts              # JWT authentication middleware
└── api/                     # API modules
    ├── billingCycle/
    │   ├── billingCycle.ts       # Model + TypeScript interfaces
    │   └── billingCycleService.ts # Service (routes + logic)
    └── user/
        ├── user.ts          # Model + TypeScript interfaces
        └── authService.ts   # Service (login, signup, validateToken)
```

---

## Where are business rules located?

| Location | Rule Type |
|----------|-----------|
| `api/*Service.ts` | Business logic, validations, transformations |
| `api/*/*.ts` (Models) | Schema validations, data constraints, interfaces |
| `config/auth.ts` | Authentication and authorization rules |

**Main files:**

### `api/user/authService.ts`
- Email validation (regex)
- Password validation (min 8 chars, uppercase, number)
- Password hashing with bcrypt
- JWT generation and validation
- Duplicate user verification

### `api/billingCycle/billingCycleService.ts`
- Billing cycle CRUD
- Aggregation for summary calculation (credits/debts)
- Result pagination

### `api/billingCycle/billingCycle.ts` (Model)
- TypeScript interfaces: `ICredit`, `IDebt`, `IBillingCycle`, `IBillingCycleDocument`
- Required field validation
- Month (1-12) and year (1970-2100) constraints
- Debt status: PAGO, PENDENTE, AGENDADO

---

## What cannot depend on what?

```
┌─────────────────────────────────────────────────────────┐
│                    CONFIG (server, routes)              │
│         (orchestrates, depends on services and models)  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     SERVICES                            │
│   (business logic, depends on models and .env)          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                      MODELS                             │
│       (schemas, does NOT depend on services/config)     │
└─────────────────────────────────────────────────────────┘
```

**Dependency rules:**

| Layer | Can depend on | Cannot depend on |
|-------|---------------|------------------|
| `config/*` | Services, Models, .env | - |
| `api/*Service.ts` | Models, .env | Config |
| `api/*/*.ts` (Models) | Mongoose | Services, Config |

---

## What changes most frequently?

| Frequency | Location | Reason |
|-----------|----------|--------|
| **High** | `api/billingCycle/*` | New features, fields, validations |
| **Medium** | `api/user/authService.ts` | Security improvements, new flows |
| **Medium** | `config/routes.ts` | New endpoints |
| **Low** | `api/*/*.ts` (Models) | Schema is stable after definition |
| **Low** | `config/server.ts` | Base infrastructure |
| **Low** | `config/auth.ts` | Auth middleware is stable |
| **Rare** | `config/database.ts`, `config/cors.ts` | Initial configuration |

---

## What needs protection?

### 1. Sensitive Data

| Item | Location | Required Protection |
|------|----------|---------------------|
| `AUTH_SECRET` | `.env` | NEVER commit, use environment variables |
| `MONGODB_URI` | `.env` | NEVER commit |
| User passwords | `user.ts` model | Hash with bcrypt before saving |
| JWT Token | Headers/Body | 1 day expiration, validate on protected routes |

### 2. Models (Domain)

| Model | Critical Fields | Validations |
|-------|-----------------|-------------|
| `User` | password | Hash required, min 6 chars |
| `User` | email | Unique, valid format |
| `BillingCycle` | credits, debts | Values >= 0 |
| `BillingCycle` | month, year | Valid ranges |

**BillingCycle Interface:**
```typescript
interface IBillingCycle {
  name: string;
  month: number;      // 1-12
  year: number;       // 1970-2100
  credits: ICredit[]; // { name: string, value: number }
  debts: IDebt[];     // { name: string, value: number, status?: enum }
}
```

**User Interface:**
```typescript
interface IUser {
  name: string;
  email: string;
  password: string;   // hashed
}
```

### 3. Contracts (Routes)

**Protected Routes** (`/api/*` - require JWT):
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/billingCycles` | List cycles |
| GET | `/api/billingCycles/summary` | Consolidated summary |
| GET | `/api/billingCycles/count` | Total count |
| GET | `/api/billingCycles/:id` | Get cycle by ID |
| POST | `/api/billingCycles` | Create cycle |
| PUT | `/api/billingCycles/:id` | Update cycle |
| DELETE | `/api/billingCycles/:id` | Delete cycle |

**Public Routes** (`/oapi/*` - no authentication):
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/oapi/login` | Authenticate user |
| POST | `/oapi/signup` | Register user |
| POST | `/oapi/validarToken` | Validate JWT |

### 4. Authentication Middleware

The `config/auth.ts` file protects all `/api/*` routes:
- Checks for token presence (header, body, or query)
- Validates JWT signature with `AUTH_SECRET`
- Returns 403 if token is invalid or missing

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         SIGNUP                               │
├──────────────────────────────────────────────────────────────┤
│  1. Validate email (regex)                                   │
│  2. Validate password (8+ chars, uppercase, number)          │
│  3. Check if email already exists                            │
│  4. Hash password with bcrypt                                │
│  5. Save to MongoDB                                          │
│  6. Auto login (returns JWT)                                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                          LOGIN                               │
├──────────────────────────────────────────────────────────────┤
│  1. Find user by email                                       │
│  2. Compare password with hash (bcrypt)                      │
│  3. Generate JWT with user data (expires in 1 day)           │
│  4. Return { name, email, token }                            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    PROTECTED ROUTES                          │
├──────────────────────────────────────────────────────────────┤
│  1. auth.ts middleware intercepts request                    │
│  2. Extract token (Authorization header)                     │
│  3. jwt.verify() with AUTH_SECRET                            │
│  4. If valid: next() → access resource                       │
│  5. If invalid: 403 Forbidden                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Patterns Used

- **Model-Service**: Separation between schema (Model) and logic (Service)
- **TypeScript Interfaces**: Strong typing for models and requests
- **Async/Await**: Asynchronous operations with Promises
- **Middleware Pattern**: Authentication via Express middleware
- **Aggregation Pipeline**: MongoDB aggregation for summary calculations

---

## Environment Variables (.env)

```bash
PORT=3003
MONGODB_URI=mongodb://localhost/mymoney
AUTH_SECRET=your_secret_here
```

> **IMPORTANT**: The `.env` file contains sensitive data and should NOT be committed.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev | `npm run dev` | Start server with hot reload (tsx watch) |
| Build | `npm run build` | Compile TypeScript to JavaScript |
| Start | `npm run start` | Run compiled code (production) |
| Production | `npm run production` | Start with PM2 |
