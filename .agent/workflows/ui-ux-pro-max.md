---
description: Guided workflow for Codex-first UI/UX design tasks
---

# /ui-ux-pro-max

Use this workflow when you need the executable path for UI/UX work. The `ui-ux-pro-max` skill holds the reusable rules; this workflow keeps the command flow short and workspace-local.

## When to Use

- New UI or redesign
- Interface review before implementation
- Choosing style, palette, typography, layout, or motion
- Turning product requirements into a design brief

## Steps

1. Classify the request: new design, implementation, or audit.
2. Load `ui-ux-pro-max`.
3. Load `frontend-design`; add `nextjs-react-expert` for React/Next.js work and `web-design-guidelines` for audits.
4. Capture product type, audience, stack, and constraints.
5. Run the shared search script:

```bash
python .agent/.shared/ui-ux-pro-max/scripts/search.py "<query>" --design-system
```

6. Use `--persist` only when the result should become the design source of truth.
7. Synthesize the result into the local project style and verify against `references/review-checklist.md`.

## Output

- Design direction
- Stack-specific implementation notes
- Risks and anti-patterns
- Files or components that need follow-up

## Keep in Mind

- Prefer the local skill and references over copied external examples.
- Do not keep cloud, Claude, or marketplace instructions in the workflow.
- Keep the workflow as the execution path; keep the skill as the knowledge base.

