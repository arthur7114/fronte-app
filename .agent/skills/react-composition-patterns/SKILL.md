---
name: react-composition-patterns
description: React composition patterns for scalable component APIs. Use when refactoring boolean-prop-heavy components, building reusable libraries, or designing flexible React APIs.
allowed-tools: Read
---

# React Composition Patterns

Use this skill when component APIs start to feel rigid, repetitive, or difficult to extend without adding more props.

## Objective

Prefer composition over prop explosion so React components stay flexible, maintainable, and easy to reason about.

## When to Use

- A component has too many boolean props
- You need a compound component or provider pattern
- You are designing a reusable component library
- You want to replace render-prop complexity with clearer composition
- You are reviewing a React API that feels overconfigured

## When Not to Use

- Simple one-off components
- Pure styling changes with no API design impact
- Server-only work with no React component surface

## Inputs Expected

- Existing component API
- Current state ownership
- Whether the component is shared or local
- Target React version

## Core Rules

1. Use explicit variants instead of boolean mode flags.
2. Lift state when siblings need shared behavior.
3. Keep the provider as the only layer that knows how state is managed.
4. Prefer `children` for composition when the API needs flexibility.
5. Avoid `forwardRef` unless the target React version and codebase still require it.

## React 19 Note

- Only use React 19-specific patterns when the workspace is actually on React 19.
- Treat `useEffectEvent` and related APIs as advanced tools, not defaults.

## Output Expected

- A clearer component API
- Fewer boolean props
- Better state ownership boundaries
- A smaller surface area for future changes

## Limits

- Do not use composition to hide a simple direct implementation.
- Do not create abstraction layers unless the component is shared or likely to grow.
- Do not introduce advanced patterns when a plain prop or child is enough.

## Relation To The Stack

- Use with `frontend-design` when the component also needs visual direction.
- Use with `nextjs-react-expert` when the API change may affect rendering or performance.
- Use with `clean-code` when you need to keep the public API minimal.

