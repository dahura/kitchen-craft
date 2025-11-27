---
description: Verify the task (Install, Test, Lint)
---

1. **Install Dependencies**:
   ```bash
   bun install
   ```
2. **Run Tests**:
   ```bash
   bun run test
   ```
   - If tests fail, stop and fix them.
3. **Linting**:
   - Check for lint errors (if configured).
   ```bash
   # bun run lint (uncomment if script exists)
   ```
4. Notify user of the result.
