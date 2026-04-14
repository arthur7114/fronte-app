---
description: Deployment workflow using automated webhooks and versioning.
---

# /deploy - Automated Deployment

This workflow handles versioning (root + apps), Git tagging, and triggers webhooks for `app-web` and `app-worker`.

## 📜 Workflow Summary

1. **Pre-flight**: Check git status and build.
2. **Versioning**: `npm version patch` (Root) + Sync `apps/web` and `apps/worker`.
3. **Commit & Tag**: Automatic `chore: bump version` commit and Git tag creation.
4. **Triggers**: POST requests to the deployment webhooks.

---

## 🚀 Execution

To trigger a deployment, run:

```powershell
node scripts/deploy.js
```

### Options
- `--force`: Ignore dirty git state.

---

## 📋 Pre-Deployment Checklist

Before running the command, ensure:
- [ ] All features for this release are merged into the main branch.
- [ ] You have the latest changes from remote.
- [ ] `.env` contains `DEPLOY_WEBHOOK_WEB` and `DEPLOY_WEBHOOK_WORKER`.

---

## 🛠️ Post-Deployment Verification

1. **Versioning**: Check `package.json` and `git tag`.
2. **Webhooks**: Verify logs for `✅ webhook triggered successfully`.
3. **Environment**: Ensure the target server received the trigger.

---

## 🔧 Troubleshooting

- **Webhook Fail**: Check connectivity and URL validity in `.env`.
- **Git Error**: Ensure no uncommitted changes (or use `--force`).
- **Permission**: Ensure you have rights to push tags if auto-push is enabled.
