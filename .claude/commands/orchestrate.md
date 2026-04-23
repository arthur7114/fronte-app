---
description: Coordinate multiple agents for complex tasks requiring different domain expertise.
---

# /orchestrate - Multi-Agent Orchestration

$ARGUMENTS

---

## Critical: Minimum 3 Agents

Orchestration requires minimum 3 different agents. Fewer = delegation, not orchestration.

### Agent Selection by Task Type

| Task Type | Required Agents |
|-----------|----------------|
| Web App | frontend-specialist, backend-specialist, test-engineer |
| API | backend-specialist, security-auditor, test-engineer |
| Database | database-architect, backend-specialist, security-auditor |
| Full Stack | project-planner, frontend-specialist, backend-specialist, devops-engineer |
| Debug | debugger, test-engineer + domain specialist |

Agents are at `.agent/agents/`.

---

## Strict 2-Phase Workflow

### Phase 1: Planning (Sequential)

1. Read `.agent/agents/project-planner.md`
2. Create `docs/PLAN-{slug}.md`
3. **STOP — ask user for approval before Phase 2**

### Phase 2: Implementation (Parallel, after approval)

- Read each specialist agent file before applying their domain
- Run verification after completion:
  ```bash
  npx tsc -p apps/web/tsconfig.json --noEmit
  npm --workspace @super/web run lint
  ```

---

## Output

```markdown
## 🎼 Orchestration Report
### Agents Invoked (min 3)
### Key Findings
### Deliverables
### Summary
```
