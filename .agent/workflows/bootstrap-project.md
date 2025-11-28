---
description: Bootstrap the project with Linear integration and generate rule files for Cursor, Kilocode, and Antigravity.
---

1. Check if a Linear project exists for this repository name.
2. If no project exists, create one using the `mcp1_create_project` tool:
   - name: (directory name)
   - team: "engineering" (or ask user if unsure)
   - summary: "Auto-bootstrapped by Antigravity"
   - Save the project ID to memory bank `linear.projectId`.
3. Create/Update rule files for **Cursor** in `.cursor/rules/`:
   - `.cursor/rules/development-workflow.mdc`
   - `.cursor/rules/auto-linear-issue.mdc`
   - `.cursor/rules/local-task-workflow.mdc`
   - `.cursor/rules/linear-status-management.mdc`
   (Use standard content for these files)
4. Create/Update rule files for **Kilocode** in `kilocode/`:
   - `kilocode/development-workflow.md`
   - `kilocode/auto-linear-issue.md`
   - `kilocode/local-task-workflow.md`
   - `kilocode/linear-status-management.md`
5. Create/Update rule files for **Antigravity** in `.agent/rules/`:
   - `.agent/rules/development-workflow.md` (Policy)
   - `.agent/rules/auto-linear-issue.md`
   - `.agent/rules/linear-status-management.md`
6. Create/Update workflow files for **Antigravity** in `.agent/workflows/`:
   - `.agent/workflows/bootstrap-project.md` (Self-replication)
   - `.agent/workflows/start-task.md`
   - `.agent/workflows/submit-task.md`
   - `.agent/workflows/verify-task.md`
7. Initialize a baseline `README.md` if it doesn't exist.
8. Notify the user that bootstrapping is complete.
