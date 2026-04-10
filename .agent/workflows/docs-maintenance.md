---
description: Maintain documentation structure, keep the index current, and prevent AI workflow drift.
---

# /docs-maintenance - Documentation Maintenance Mode

$ARGUMENTS

---

## When to Use

Use this workflow whenever you:

- add a new doc
- rename or move a doc
- revise the canonical product narrative
- need to keep AI-facing documentation in sync

---

## Steps

1. Read `AGENTS.md`
2. Read `.agent/rules/GEMINI.md`
3. Read `.agent/ARCHITECTURE.md`
4. Read `docs/README.md`
5. Identify the exact docs affected by the request
6. Update the canonical doc first
7. Update `docs/README.md` if ordering, names, or usage guidance changed
8. Update `AGENTS.md` or this workflow only if the execution process itself changed
9. Check for stale references to old doc names
10. Confirm that the final doc order still guides the next agent cleanly

---

## Rules

- Keep the numbered doc set as the primary reading path
- Prefer one source of truth per topic
- Avoid duplicating the same product decision in multiple places
- If a new numbered doc is added, update the index immediately
- If a legacy doc is still useful, keep it clearly secondary

---

## Validation Checklist

- `docs/README.md` points to the correct numbered files
- `AGENTS.md` references only paths that exist
- No stale links or old doc names remain in the primary path
- The reader can start at `AGENTS.md`, then `docs/README.md`, then the relevant numbered docs without getting lost

---

## Output

Return a short status note with:

- what changed
- which docs were touched
- whether the index or workflow needs another pass
