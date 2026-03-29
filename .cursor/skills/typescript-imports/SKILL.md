---
name: typescript-imports
description: Enforces TypeScript import type convention for type-only imports. Use when creating or editing TypeScript files, reviewing imports, or when linter shows "only used as types" warning.
---

# TypeScript Import Type Convention

## Rule

When an import is used **only as a type** (type annotation, interface, generic), use `import type` instead of regular `import`.

## Why

1. **Clarity**: Makes intent explicit - this import is for types only
2. **Bundle size**: Allows bundlers to remove type-only imports (tree-shaking)
3. **Compile time**: TypeScript can skip runtime code generation for type imports
4. **Linter compliance**: Avoids "only used as types" warnings

## Syntax

```typescript
// Type-only import
import type { SomeType } from "module";

// Mixed import (value + type)
import SomeClass, { type SomeType } from "module";

// Regular import (used at runtime)
import { SomeClass } from "module";
```

## Decision Flow

```
1. Is this import used at runtime?
   ├─ YES → Use regular import
   └─ NO (only type annotations) → Use import type
```

## Examples

### Type-Only Imports

```typescript
// Express types for function parameters
import type { Request, Response, NextFunction } from "express";

// Interface for type annotations
import type { IUser } from "./user";

// Type for variable declaration
import type { Express } from "express";
let app: Express;
```

### Runtime Imports

```typescript
// Creating instances
import express from "express";
const app = express();

// Using Router constructor
import { Router } from "express";
const router = Router();

// Using class methods
import BillingCycle from "./billingCycle";
await BillingCycle.find({});
```

### Mixed Imports

```typescript
// Model (runtime) + Interface (type)
import User from "./user";
import type { IUser } from "./user";

// OR using inline type modifier
import User, { type IUser } from "./user";
```

## Common Patterns

| Import | Usage | Type |
|--------|-------|------|
| `Express` | `let app: Express` | `import type` |
| `express` | `express()` | `import` |
| `Router` | `Router()` | `import` |
| `Request, Response` | `(req: Request)` | `import type` |
| `Model` | `Model.find()` | `import` |
| `IModel` | `: IModel` | `import type` |

## Checklist

When writing TypeScript imports:

- [ ] Is the import used to create instances? → regular import
- [ ] Is the import used to call methods? → regular import
- [ ] Is the import only in type positions (`: Type`, `<Type>`)? → `import type`
- [ ] Remove unused imports entirely

## Anti-Patterns

```typescript
// BAD: Type used only for annotation
import { Express } from "express";
let app: Express;

// GOOD
import type { Express } from "express";
let app: Express;

// BAD: Importing unused types
import User, { IUserDocument } from "./user";
// IUserDocument never used

// GOOD: Only import what you use
import User from "./user";
```
