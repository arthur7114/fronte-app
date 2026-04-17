---
name: ui-ux-pro-max
description: Codex-first UI/UX design system synthesis for this workspace. Use when choosing a visual direction, generating a design system, or reviewing interface quality for web-first products.
allowed-tools: Read, Bash
---

# UI UX Pro Max

Codex-first design intelligence for this monorepo. It turns product intent into a practical UI direction without depending on Claude-specific install flows or cloud scaffolding.

## Objective

Convert vague product goals into a concrete design system, a review checklist, and implementation-ready UI decisions.

## When to Use

- Designing a new screen, landing page, dashboard, or component set
- Choosing palette, typography, layout, motion, or chart direction
- Reviewing a UI that feels generic, inconsistent, or visually weak
- Translating product requirements into a reusable design brief

## When Not to Use

- Backend-only work
- Database-only work
- Purely technical refactors with no UI impact
- Tasks where the visual direction is already locked and no design decision is needed

## Inputs Expected

- Product type
- Audience
- Stack
- Brand constraints
- Scope: new UI, redesign, or audit
- Any must-keep elements or existing design tokens

## Local Sources To Load

1. `frontend-design` for design thinking and UX principles.
2. `web-design-guidelines` for post-implementation audit checks.
3. `tailwind-patterns` for Tailwind implementation choices.
4. `nextjs-react-expert` for React and Next.js performance constraints.
5. `mobile-design` only when the task explicitly targets mobile or React Native.

## Execution

- Use the `/ui-ux-pro-max` workflow for the step-by-step command flow.
- Read `references/decision-rules.md` for the condensed heuristics.
- Read `references/review-checklist.md` before final delivery.

## Output Expected

- Recommended pattern
- Style direction
- Color strategy
- Typography direction
- Motion and effects guidance
- Key anti-patterns
- Stack-specific implementation notes

## Limits

- Do not copy Claude-first installation instructions.
- Do not keep cloud/demo/marketplace guidance that does not apply here.
- Do not import every style; select the smallest set that fits the product.
- Prefer workspace-local paths and conventions over external paths.
- Do not duplicate the workflow's command sequence here.

## Relation To The Stack

- Default to web-first delivery for this monorepo.
- Use `html-tailwind` for simple pages.
- Use `react` or `nextjs` for app code.
- Use `shadcn` when the component system already uses it.
- Use `react-native` only if the task explicitly targets mobile.

## Success Criteria

- Clear objective
- Clear use / no-use boundaries
- Inputs captured
- Workflow executed
- Local references loaded
- Output translated into implementation steps
