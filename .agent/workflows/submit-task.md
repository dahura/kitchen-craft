---
description: Submit current work (Push, Move to In Review)
---

1. Identify the current branch name.
   ```bash
   git branch --show-current
   ```
2. Extract the Issue Key from the branch name (assuming format `<ISSUE_KEY>-...`).
3. Push the branch to origin.
   ```bash
   git push -u origin <branch_name>
   ```
4. Update the Linear issue status to "In Review" using `mcp1_update_issue`.
   - You may need to find the correct state ID for "In Review" first.
5. (Optional) If `gh` CLI is available, create a PR:
   ```bash
   gh pr create --fill
   ```
   Otherwise, provide a link to create the PR manually.
