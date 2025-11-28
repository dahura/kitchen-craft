# Auto Linear Issue Creation

## Trigger
- When the user message contains keywords **bug**, **feature**, or **task**.
- UNLESS the user explicitly opts out (e.g., "don't create an issue").

## Action
1. **Create Issue**: Use `mcp1_create_issue`.
   - **Title**: Derived from the user's request.
   - **Description**: Summary of the conversation context.
   - **Team**: Use the default team ID (see `agent/memory/linear.md`).
   - **Project**: Use the project ID from `agent/memory/linear.md` (`c53e4533-839b-4a76-8956-9390024c0b86`).
   - **Status**: "Todo" (or default backlog status).

2. **Notify**: Inform the user that the issue was created and provide the link/ID.
