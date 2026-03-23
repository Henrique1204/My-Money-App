---
name: semantic-commits
description: Creates git commits following semantic commit convention. Use when committing changes, creating commits, or when user asks to commit code. Enforces English messages starting with verbs, 8-word limit, and proper type prefixes.
---

# Semantic Commits

## Commit Format

```
<type>(<scope>): <message>
```

## Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons (no code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, configs |
| `ci` | CI/CD configuration changes |
| `revert` | Reverting a previous commit |

## Message Rules

### 1. Language
All commit messages MUST be in **English**.

### 2. Start with a Verb
Think: "This commit serves to..." then write the verb.

| Mental Check | Message |
|--------------|---------|
| "This commit serves to **add** user authentication" | `add user authentication` |
| "This commit serves to **fix** login validation error" | `fix login validation error` |
| "This commit serves to **update** dependencies to latest versions" | `update dependencies to latest versions` |

### 3. Maximum 8 Words
Keep messages concise. If you need more words:

1. **Stop and evaluate**: Can this commit be split?
2. **If splittable**: Create multiple smaller commits
3. **If not splittable**: Extend only if absolutely necessary

### 4. Lowercase After Type
Message starts with lowercase verb (type prefix handles capitalization).

## Examples

```bash
# Good - concise and clear
feat(auth): add JWT token validation middleware
fix(billing): correct month range validation
chore(deps): update mongoose to version 8
refactor(api): migrate services to TypeScript
docs(readme): add installation instructions
test(auth): add login endpoint unit tests
perf(db): optimize billing cycle aggregation query

# Bad - too long
feat(auth): add a new authentication system using JWT tokens with refresh capability
# Split into:
feat(auth): add JWT token generation
feat(auth): add token refresh mechanism

# Bad - not starting with verb
feat(auth): new authentication system
# Correct:
feat(auth): implement authentication system

# Bad - in Portuguese
feat(auth): adicionar autenticação
# Correct:
feat(auth): add authentication
```

## Scope (Optional)

Use scope to specify the module affected:

| Scope | Module |
|-------|--------|
| `auth` | Authentication (login, signup, token) |
| `billing` | Billing cycles |
| `api` | General API changes |
| `db` | Database configuration |
| `deps` | Dependencies |
| `config` | Configuration files |

## Decision Flow

```
1. What changed?
   ↓
2. Select type (feat, fix, chore, etc.)
   ↓
3. Identify scope (optional)
   ↓
4. Write message starting with verb
   ↓
5. Count words (max 8)
   ↓
   ├─ ≤ 8 words → Commit
   └─ > 8 words → Can split? 
                   ├─ Yes → Create multiple commits
                   └─ No → Extend if necessary
```

## Common Verbs

| Action | Verbs |
|--------|-------|
| Creating | add, create, implement, introduce |
| Modifying | update, change, modify, adjust, improve |
| Removing | remove, delete, drop, deprecate |
| Fixing | fix, correct, resolve, patch |
| Refactoring | refactor, restructure, reorganize, simplify |
| Moving | move, rename, relocate, migrate |
