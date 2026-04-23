---
description: Preview server start, stop, and status check. Local development server management.
---

# /preview - Preview Management

$ARGUMENTS

---

## Commands

```
/preview           - Show current status
/preview start     - Start server
/preview stop      - Stop server
/preview restart   - Restart
/preview check     - Health check
```

---

## Starting the Dev Server

```bash
npm --workspace @super/web run dev
```

Default port: 3000

If port conflict:
1. Try port 3001: `npm --workspace @super/web run dev -- -p 3001`
2. Or kill the process on 3000
