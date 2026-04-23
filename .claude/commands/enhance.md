---
description: Add or update features in existing application. Used for iterative development.
---

# /enhance - Update Application

$ARGUMENTS

---

## Task

Adds features or makes updates to existing application.

### Steps:

1. **Understand Current State**
   - Read `docs/13-current-state-audit.md`
   - Read `docs/12-execution-roadmap.md`
   - Understand existing features, tech stack

2. **Plan Changes**
   - Determine what will be added/changed
   - Detect affected files
   - Check dependencies

3. **Present Plan to User** (for major changes)

4. **Apply**
   - Select the appropriate agent from `.agent/agents/`
   - Make changes
   - Validate

---

## Caution

- Get approval for major changes
- Warn on conflicting requests
- Run validation after changes:
  ```bash
  npx tsc -p apps/web/tsconfig.json --noEmit
  npm --workspace @super/web run lint
  ```
