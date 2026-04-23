---
description: Maintain documentation structure, keep the index current, and prevent AI workflow drift.
---

# /docs-maintenance - Documentation Maintenance Mode

$ARGUMENTS

---

## When to Use

- Add a new doc
- Rename or move a doc
- Revise the canonical product narrative
- Keep AI-facing documentation in sync

---

## Steps

1. Read `CLAUDE.md`
2. Read `.agent/rules/GEMINI.md`
3. Read `.agent/ARCHITECTURE.md`
4. Read `docs/README.md`
5. Identify the exact docs affected by the request
6. Update the canonical doc first
7. Update `docs/README.md` if ordering, names, or usage guidance changed
8. Check for stale references to old doc names
9. Confirm that the final doc order still guides the next agent cleanly

---

## Rules

- Keep the numbered doc set as the primary reading path
- Prefer one source of truth per topic
- Avoid duplicating the same product decision in multiple places

---

## Output

Return a short status note with:
- what changed
- which docs were touched
- whether the index needs another pass
