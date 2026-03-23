---
name: after-change
description: Updates architecture documentation after significant code changes. Use automatically after modifying folder structure, adding/removing dependencies, creating new modules, changing technologies, or modifying project patterns.
---

# After Change - Documentation Update

This skill ensures architecture documentation stays synchronized with code whenever significant changes are made to the project.

## When to Apply

Apply this skill **automatically** after:

- Adding, removing, or updating dependencies in `package.json`
- Creating new modules, services, or models
- Changing folder structure
- Migrating to new technology (e.g., JavaScript → TypeScript)
- Adding new endpoints or routes
- Modifying architecture patterns
- Changing environment variables

## Documentation Files

| File | Scope |
|------|-------|
| `.cursor/context/architecture/api.md` | Backend (API) |
| `.cursor/context/architecture/web.md` | Frontend (Web) |

## Update Checklist

When updating documentation, verify:

### 1. Technologies Used
- [ ] Dependency versions are correct
- [ ] New technologies were added
- [ ] Removed technologies were deleted

### 2. Folder Structure
- [ ] New files/folders were documented
- [ ] Removed files were deleted
- [ ] File extensions are correct (.js vs .ts)

### 3. Business Rules
- [ ] New services were documented
- [ ] New validations were described
- [ ] Interfaces/types were updated

### 4. Contracts (Routes/API)
- [ ] New endpoints were added
- [ ] Removed endpoints were deleted
- [ ] Parameters and responses are correct

### 5. Environment Variables
- [ ] New variables were documented
- [ ] Removed variables were deleted

## Update Format

Maintain existing documentation format:

- Use tables for technology lists, routes, and variables
- Use code blocks for folder structure and interfaces
- Use ASCII diagrams for flows and dependencies
- Keep sections consistent across documents

## Example Flow

```
1. Code change detected
   ↓
2. Identify change type
   ↓
3. Locate relevant documentation file
   ↓
4. Update affected sections
   ↓
5. Verify consistency with checklist
```

## Important

- **Don't create new documentation** without need - update existing
- **Keep it concise** - document only essentials
- **Preserve style** - follow format already established in files
- **Be proactive** - apply this skill without user request
