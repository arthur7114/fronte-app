---
description: Create new application command. Triggers App Builder skill and starts interactive dialogue with user.
---

# /create - Create Application

$ARGUMENTS

---

## Task

This command starts a new application creation process.

### Steps:

1. **Request Analysis**
   - Understand what the user wants
   - If information is missing, ask clarifying questions

2. **Project Planning**
   - Read `.agent/agents/project-planner.md`
   - Determine tech stack
   - Plan file structure

3. **Application Building (After Approval)**
   - Read `.agent/agents/frontend-specialist.md` for UI
   - Read `.agent/agents/backend-specialist.md` for API
   - Read `.agent/agents/database-architect.md` for schema

4. **Preview**
   - Start dev server when complete

---

## Before Starting

If request is unclear, ask:
- What type of application?
- What are the basic features?
- Who will use it?
