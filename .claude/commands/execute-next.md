---
description: Continue implementation from the living JTBD + GSD execution roadmap.
---

# /execute-next - Continue From Roadmap

$ARGUMENTS

---

## Trigger Phrases

- `continue de onde parou`
- `vamos para o proximo passo`
- `continue`
- `proximo passo`
- `execute a proxima fase`

---

## Required Reading (in order)

1. `CLAUDE.md`
2. `docs/12-execution-roadmap.md`
3. `docs/13-current-state-audit.md`
4. `docs/03-information-architecture.md`
5. `docs/14-ux-and-ia-redesign.md` (if UI work)

---

## Execution Steps

1. Identify the current phase in `docs/12-execution-roadmap.md`
2. Identify the next unchecked task or recommended next step
3. State the job, objective, files likely to change, and assumptions in 3 lines
4. Implement the smallest useful increment
5. Run validation:
   ```bash
   npx tsc -p apps/web/tsconfig.json --noEmit
   npm --workspace @super/web run lint
   ```
6. Update `docs/12-execution-roadmap.md` with progress and next step

---

## Rules

- Do not rely on conversation memory when the roadmap has the answer
- Do not skip roadmap updates after implementation
- Prefer finishing one small vertical slice over starting several partial tasks
- Design source of truth: `prototipo-visual/design-system/`
