# Decision Rules

This file condenses the imported UI/UX reasoning into workspace-local guidance.

## Product To Pattern

- SaaS and admin tools: favor data clarity, spacing, and dense but readable layouts.
- Landing pages: use a single dominant narrative, one primary action, and strong information hierarchy.
- Dashboards: optimize for scannability, charts, and drill-down paths.
- E-commerce: emphasize trust, product clarity, and frictionless conversion.
- Portfolio and creative sites: allow stronger personality, but keep hierarchy legible.

## Style Selection

- Match style to product category first.
- Use one clear visual direction instead of mixing unrelated styles.
- Avoid defaulting to a generic dark neon or blue fintech look.
- Avoid emoji icons and random decorative elements.
- Prefer purposeful contrast, not decoration for decoration's sake.

## Color Selection

- Define semantic tokens first: primary, surface, text, muted, accent, danger.
- Choose the palette from the product mood, not from the latest trend.
- Check light and dark variants together.
- Keep contrast readable in both themes.
- Avoid color-only meaning for status and feedback.

## Typography

- Keep body text readable at 16px or above on web.
- Use a consistent scale with clear hierarchy.
- Limit line length so scanning stays easy.
- Use font pairings that create contrast without fighting each other.
- Prefer stable, available fonts over novelty unless the brand requires it.

## Layout

- Start mobile-first, then scale up.
- Use a spacing system instead of ad hoc values.
- Keep touch targets comfortable.
- Avoid horizontal scrolling on mobile.
- Reserve space for fixed elements and async content.

## Motion

- Animate transform and opacity first.
- Keep micro-interactions short and intentional.
- Respect reduced-motion preferences.
- Use motion to clarify cause and effect, not as decoration.
- Keep animations interruptible.

## Stack Mapping

- `html-tailwind`: use this for simple, fast implementation on web.
- `react`: use this when component architecture matters.
- `nextjs`: use this when routing, data loading, or SSR matters.
- `shadcn`: use this when the project already relies on shadcn/ui.
- `react-native`: use this only for explicitly mobile work.

