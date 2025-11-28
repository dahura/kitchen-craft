---
description: Start working on a Linear issue (Move to In Progress, Create Branch)
---

1. Identify the Linear issue ID. If not provided, ask the user or check for "Todo" issues assigned to the user.
2. Retrieve issue details (title) using `mcp1_get_issue`.
3. Generate a branch name format: `<ISSUE_KEY>-<kebab-case-title>`.
4. Update the Linear issue status to "In Progress" using `mcp1_update_issue`.
   - You may need to find the correct state ID for "In Progress" first using `mcp1_list_issue_statuses`.
5. Create and checkout the new branch:
   ```bash
   git checkout -b <branch_name>
   ```
6. Notify the user that the task is started and the branch is ready.
