---
description: Structured brainstorming for projects and features. Explores multiple options before implementation.
---

# /brainstorm - Structured Idea Exploration

$ARGUMENTS

---

## Purpose

This command activates BRAINSTORM mode for structured idea exploration. Use when you need to explore options before committing to an implementation.

---

## Behavior

When `/brainstorm` is triggered:

1. **Understand the goal**
   - What problem are we solving?
   - Who is the user?
   - What constraints exist?

2. **Generate options**
   - Provide at least 3 different approaches
   - Each with pros and cons
   - Consider unconventional solutions

3. **Compare and recommend**
   - Summarize tradeoffs
   - Give a recommendation with reasoning

---

## Output Format

```markdown
## 🧠 Brainstorm: [Topic]

### Context
[Brief problem statement]

---

### Option A: [Name]
[Description]

✅ **Pros:**
- [benefit 1]
- [benefit 2]

❌ **Cons:**
- [drawback 1]

📊 **Effort:** Low | Medium | High

---

### Option B: [Name]
...

### Option C: [Name]
...

---

## 💡 Recommendation

**Option [X]** because [reasoning].
```

---

## Key Principles

- **No code** - this is about ideas, not implementation
- **Honest tradeoffs** - don't hide complexity
- **Defer to user** - present options, let them decide
