---
description: Debugging command. Activates DEBUG mode for systematic problem investigation.
---

# /debug - Systematic Problem Investigation

$ARGUMENTS

---

## Purpose

Activates DEBUG mode for systematic investigation of issues, errors, or unexpected behavior.

Before starting, read `.agent/agents/debugger.md`.

---

## Behavior

1. **Gather information**
   - Error message
   - Reproduction steps
   - Expected vs actual behavior
   - Recent changes

2. **Form hypotheses**
   - List possible causes
   - Order by likelihood

3. **Investigate systematically**
   - Test each hypothesis
   - Check logs, data flow
   - Use elimination method

4. **Fix and prevent**
   - Apply fix
   - Explain root cause
   - Add prevention measures

---

## Output Format

```markdown
## 🔍 Debug: [Issue]

### 1. Symptom
### 2. Information Gathered
### 3. Hypotheses
### 4. Investigation
### 5. Root Cause
### 6. Fix
### 7. Prevention
```

---

## Key Principles

- Ask before assuming - get full error context
- Test hypotheses - don't guess randomly
- Explain why - not just what to fix
- Prevent recurrence - add tests, validation
