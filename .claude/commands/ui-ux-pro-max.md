---
description: Guided workflow for UI/UX design tasks with design system enforcement.
---

# /ui-ux-pro-max - UI/UX Design Workflow

$ARGUMENTS

---

## When to Use

- New UI or redesign
- Interface review before implementation
- Choosing style, palette, typography, layout, or motion
- Turning product requirements into a design brief

---

## Required Reading (before any visual work)

1. `prototipo-visual/design-system/README.md` — absolute source of truth
2. `prototipo-visual/app/globals.css` — tokens, typography, colors
3. `.agent/agents/frontend-specialist.md` — design rules and Purple Ban

---

## Steps

1. Classify the request: new design, implementation, or audit
2. Capture product type, audience, stack, and constraints
3. Check `prototipo-visual/design-system/` for existing components before creating new ones
4. Verify against design system tokens — never hardcode values
5. Synthesize into implementation notes with risks and anti-patterns

---

## Rules

- **Purple Ban**: no violet/purple colors — check frontend-specialist agent for full color rules
- **No template layouts** — follow prototype visual hierarchy
- **Tokens only** — all spacing, color, radius from design system
- **Source of truth**: `prototipo-visual/` overrides any other visual reference
