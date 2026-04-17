---
name: web-design-guidelines
description: Review web UI code for accessibility, interaction, responsive behavior, motion, and performance. Use after implementation or before release.
metadata:
  author: codex-local
  source: vercel-labs/agent-skills
  version: "2.0"
---

# Web Interface Guidelines

Audit web UI code against the workspace's local interface standards. This skill is the Codex-first, workspace-local adaptation of Vercel's web interface guidance.

## When to Use

- Review UI code
- Check accessibility
- Audit design quality
- Review UX and interaction behavior
- Validate a page before release

## When Not to Use

- Backend-only changes
- Database-only changes
- Non-visual refactors with no UI surface
- Pure copy changes with no layout or interaction impact

## How It Works

1. Read the target files or ask for the file set.
2. Read `frontend-design` for design intent and `ui-ux-pro-max` for the design-system context.
3. Apply the checklist below.
4. Report only concrete findings in `file:line` format.

## Audit Checklist

### Accessibility

- Semantic landmarks are present.
- Headings are in order.
- Images have meaningful alt text.
- Icon-only controls have labels.
- Keyboard navigation works.
- Focus states are visible.
- Color is not the only signal.

### Interaction

- Clickable elements look interactive.
- Hover and press states are distinct.
- Loading and error states exist for async actions.
- Form fields have visible labels and useful errors.
- Destructive actions are separated from primary actions.

### Responsive

- Layout scales from mobile to desktop.
- No horizontal scrolling on mobile.
- Text remains readable at all breakpoints.
- Fixed headers, footers, and drawers do not hide content.

### Motion

- Motion stays on transform and opacity where possible.
- Reduced-motion is respected.
- Animations communicate state change instead of decoration.

### Performance

- Heavy media is sized and optimized.
- Layout shifts are minimized.
- Third-party scripts are justified.
- Long lists are virtualized when needed.

## Output

- Use terse `file:line` findings.
- Prefer concrete issues over broad style opinions.
- If nothing is wrong, say so explicitly.

## Related Skills

| Skill | When To Use |
|-------|-------------|
| `frontend-design` | Before coding, to choose the visual direction |
| `ui-ux-pro-max` | When generating or refining the design system |
| `nextjs-react-expert` | When the audit points to React or performance issues |

