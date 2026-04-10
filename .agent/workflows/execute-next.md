---
description: Continue implementation from the living JTBD + GSD execution roadmap.
---

# /execute-next - Continue From Roadmap

$ARGUMENTS

---

## Trigger Phrases

Use this workflow when the user says:

- `continue de onde parou`
- `vamos para o proximo passo`
- `continue`
- `proximo passo`
- `execute a proxima fase`

---

## Required Reading

1. `AGENTS.md`
2. `.agent/rules/GEMINI.md`
3. `.agent/ARCHITECTURE.md`
4. `docs/README.md`
5. `docs/11-jtbd-gsd-methodology.md`
6. `docs/12-execution-roadmap.md`
7. `docs/13-current-state-audit.md`, when present

Then load only the numbered docs needed for the current phase.

---

## Execution Steps

1. Identify the current phase in `docs/12-execution-roadmap.md`
2. Identify the next unchecked task or recommended next step
3. State the job, objective, files likely to change, and assumptions in 3 lines
4. Implement the smallest useful increment
5. Run validation appropriate to the changed area
6. Update affected docs
7. Update `docs/12-execution-roadmap.md` with progress, validation, decisions, and next step

---

## Rules

- Do not rely on conversation memory when the roadmap has the answer
- Do not skip roadmap updates after implementation
- Prefer finishing one small vertical slice over starting several partial tasks
- If the current phase is too broad, split it into the smallest valuable task before coding

---

## Output

End with:

- what was completed
- what was validated
- what the next prompt can be
