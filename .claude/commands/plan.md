---
description: Create project plan using project-planner agent. No code writing - only plan file generation.
---

# /plan - Project Planning Mode

$ARGUMENTS

---

## Critical Rules

1. **NO CODE WRITING** — creates plan file only
2. Read `.agent/agents/project-planner.md` before starting
3. Apply Socratic Gate — ask clarifying questions before planning
4. Name plan file dynamically based on task

---

## Task

1. Read `.agent/agents/project-planner.md`
2. Ask clarifying questions (minimum 3 for complex requests)
3. Create `docs/PLAN-{task-slug}.md`

**Naming rules:**
- Extract 2-3 key words from request
- Lowercase, hyphen-separated, max 30 chars
- Example: "e-commerce cart" → `PLAN-ecommerce-cart.md`

---

## After Planning

Tell user:
```
✅ Plan created: docs/PLAN-{slug}.md

Next steps:
- Review the plan
- Run /execute-next to start implementation
```

---

## Examples

| Request | Plan File |
|---------|-----------|
| `/plan motor de estratégias` | `docs/PLAN-motor-estrategias.md` |
| `/plan add dark mode` | `docs/PLAN-dark-mode.md` |
| `/plan fix auth bug` | `docs/PLAN-auth-fix.md` |
