---
description: Display project status, current phase, and pending work from the roadmap.
---

# /status - Project Status

$ARGUMENTS

---

## Task

Show current project state by reading:

1. `CLAUDE.md` — stack and current state summary
2. `docs/12-execution-roadmap.md` — current phase and next steps
3. `docs/13-current-state-audit.md` — what's connected vs mocked

---

## Output Format

```
=== Fronte App Status ===

📦 Stack: Next.js + Supabase + OpenAI
🌿 Branch: [current branch]
📍 Phase: [current phase from roadmap]

✅ Connected to backend:
   • [list from audit]

⏳ Mock/adapters:
   • [list from audit]

🎯 Next recommended step:
   • [from roadmap]
```
