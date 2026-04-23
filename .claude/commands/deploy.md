---
description: Deployment workflow using automated webhooks and versioning.
---

# /deploy - Automated Deployment

Handles versioning (root + apps), Git tagging, and triggers webhooks for `app-web` and `app-worker`.

## Workflow Summary

1. **Pre-flight**: Check git status and build.
2. **Versioning**: `npm version patch` (Root) + Sync `apps/web` and `apps/worker`.
3. **Commit & Tag**: Automatic `chore: bump version` commit and Git tag creation.
4. **Triggers**: POST requests to the deployment webhooks.

---

## Execution

```powershell
node scripts/deploy.js
```

Options: `--force` to ignore dirty git state.

---

## Pre-Deployment Checklist

- [ ] All features for this release are merged into main.
- [ ] You have the latest changes from remote.
- [ ] `.env` contains `DEPLOY_WEBHOOK_WEB` and `DEPLOY_WEBHOOK_WORKER`.

---

## Validation Commands

```bash
npx tsc -p apps/web/tsconfig.json --noEmit
npm --workspace @super/web run build
npm --workspace @super/web run lint
```
