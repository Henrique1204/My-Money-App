# Architecture - Frontend (Web)

## Technologies Used

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 17.0.1 |
| Bundler | Create React App | 4.0.1 |
| Global State | Redux Toolkit | 1.5.0 |
| Routing | React Router DOM | 6.0.0-beta |
| Styles | CSS Modules | - |
| Icons | Font Awesome | 4.7.0 |
| Tests | Jest + React Testing Library | - |

## Folder Structure

```
src/
├── main/                    # Entry point and main configuration
│   ├── App.js               # Root component
│   └── Rotas.js             # Route definitions
├── store/                   # State management (Redux)
│   ├── configureStore.js    # Store configuration
│   ├── auth.js              # Authentication slice
│   ├── billingCyclesList.js # Billing cycles slice
│   ├── form.js              # Forms slice
│   ├── summary.js           # Summary/dashboard slice
│   ├── tabs.js              # Tab navigation slice
│   └── ui.js                # UI slice (feedbacks, loading)
├── Componente/              # React components
│   ├── Auth/                # Login/signup screen
│   ├── BillingCycles/       # Billing cycles CRUD
│   ├── Dashboard/           # Dashboard with financial summary
│   ├── Header/              # Header
│   ├── SideBar/             # Side menu
│   ├── Footer/              # Footer
│   └── Util/                # Reusable components
├── Hooks/                   # Custom hooks
│   ├── useFetch.js          # HTTP requests hook
│   ├── useForm.js           # Forms hook
│   └── useMedia.js          # Media queries hook
└── api.js                   # API endpoint configuration
```

---

## Where are business rules located?

Business rules are distributed across:

| Location | Rule Type |
|----------|-----------|
| `store/*.js` (Redux slices) | State logic, flow validations, data transformations |
| `Hooks/useForm.js` | Form validations |
| `api.js` | Backend communication contracts |
| `Componente/*/` | Presentation and interaction logic |

**Main files:**
- `store/auth.js` - Authentication logic, token validation, login/logout
- `store/billingCyclesList.js` - Billing cycles CRUD
- `store/summary.js` - Financial summary calculation and display

---

## What cannot depend on what?

```
┌─────────────────────────────────────────────────────────┐
│                      COMPONENTS                         │
│  (can depend on store, hooks, api, other components)    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    STORE (Redux)                        │
│     (can depend on api.js, NOT on components)           │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                      API.JS                             │
│     (configuration only, depends on NOTHING)            │
└─────────────────────────────────────────────────────────┘
```

**Dependency rules:**

| Layer | Can depend on | Cannot depend on |
|-------|---------------|------------------|
| `Componente/*` | Store, Hooks, api.js, other components | - |
| `store/*` | api.js | Components |
| `Hooks/*` | api.js | Store, Components |
| `api.js` | Nothing (base layer) | Store, Components, Hooks |

---

## What changes most frequently?

| Frequency | Location | Reason |
|-----------|----------|--------|
| **High** | `Componente/BillingCycles/*` | CRUD features, UI/UX |
| **High** | `Componente/Dashboard/*` | New visualizations, cards |
| **Medium** | `store/*.js` | New features, state adjustments |
| **Medium** | `Componente/Util/*` | Reusable components |
| **Low** | `api.js` | New endpoints (changes with backend) |
| **Low** | `main/App.js`, `main/Rotas.js` | Stable base structure |
| **Low** | `Hooks/*` | Generic and stable hooks |

---

## What needs protection?

### 1. Sensitive Data
| Item | Location | Required Protection |
|------|----------|---------------------|
| JWT Token | `localStorage` via `store/auth.js` | Don't expose in logs, clear on logout |
| User data | `store/auth.js` (state.user) | Don't persist password |
| Login credentials | Auth form | Don't log to console |

### 2. Contracts (API)
| File | Description | Caution |
|------|-------------|---------|
| `api.js` | All endpoint definitions | Keep synchronized with backend |

**Protected endpoints (require token):**
- `GET /api/billingCycles` - List cycles
- `GET /api/billingCycles/summary` - Financial summary
- `POST /api/billingCycles` - Create cycle
- `PUT /api/billingCycles/:id` - Update cycle
- `DELETE /api/billingCycles/:id` - Delete cycle

**Public endpoints:**
- `POST /oapi/login` - Login
- `POST /oapi/signup` - Signup
- `POST /oapi/validarToken` - Validate token

### 3. Global State (Redux)
| Slice | Critical Data |
|-------|---------------|
| `auth` | user, token, validToken |
| `billingCyclesList` | cycles list (financial data) |
| `summary` | credit, debt (consolidated values) |

### 4. Protected Routes
The `App.js` component protects all routes by verifying `user && validToken` before rendering authenticated content.

---

## Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───▶│  API     │───▶│  Token   │───▶│  Store   │
│  Form    │    │  /login  │    │  JWT     │    │  auth.js │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ localStorage │
                               └──────────────┘
```

---

## Patterns Used

- **Container/Presentational**: Components separated by responsibility
- **CSS Modules**: Scoped styles per component
- **Redux Toolkit Slices**: Modular state with actions and reducers
- **Custom Hooks**: Reusable logic extracted into hooks
