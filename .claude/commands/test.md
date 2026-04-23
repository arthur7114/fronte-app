---
description: Test generation and test running command. Creates and executes tests for code.
---

# /test - Test Generation and Execution

$ARGUMENTS

---

## Sub-commands

```
/test                - Run all tests
/test [file/feature] - Generate tests for specific target
/test coverage       - Show test coverage report
/test watch          - Run tests in watch mode
```

---

## Behavior

Before generating tests, read `.agent/agents/test-engineer.md`.

1. **Analyze the code** — functions, edge cases, dependencies to mock
2. **Generate test cases** — happy path, error cases, edge cases
3. **Write tests** — use project's test framework, follow existing patterns

---

## Run Tests

```bash
npm --workspace @super/web run test
```

---

## Test Structure (AAA Pattern)

```typescript
describe('Feature', () => {
  it('should [expected behavior]', async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## Key Principles

- Test behavior, not implementation
- Mock external dependencies (Supabase, OpenAI)
- Descriptive test names
