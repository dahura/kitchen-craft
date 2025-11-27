# 🚀 Antigravity Project Bootstrap Rules (Starter)

These rules help you bootstrap a **brand-new** repo with *Cursor ⇄ Linear*, *Kilocode ⇄ Linear*, and *Antigravity ⇄ Linear* automation. Copy **this single file** into `agent/rules/`, and the assistant will execute every step below.

> 🔄 **Multi-Agent Support:** Whenever rules are generated, you get three variants: Cursor (`.mdc` under `.cursor/rules/`), Kilocode (`.md` under `kilocode/`), and Antigravity (`.md` under `agent/rules/` and workflows under `.agent/workflows/`). Content stays in sync; only the formats differ.

---

## 1. Automatic Linear project creation

1. On the assistant’s first interaction with the repo, it checks Linear for a project whose name matches the repo directory.
2. If no project exists, the assistant calls:
   ```typescript
   create_project {
     name: <directory_name>,
     team: "engineering",
     summary: "Auto-bootstrapped by Antigravity",
   }
   ```
3. The resulting project ID is stored in the memory bank under `linear.projectId` for future requests.

> 🔒 Security: make sure `LINEAR_API_KEY` is configured before opening the project.

---

## 2. Standard task workflow

### 2.1 Issue creation
* Any user message containing *bug*, *feature*, or *task* automatically creates a Linear issue (unless the user opts out) and sets status to *Todo*.
* The issue title comes from the request text; the description summarizes the conversation.
* The issue links to the project referenced by `linear.projectId`.

### 2.2 Local development flow
Use the provided workflows to manage your development cycle:

1. **Start a task**:
   ```
   /start-task
   ```
   * Moves the issue to *In Progress*.
   * Creates a branch named `<ISSUE_KEY>-<kebab-title>`.

2. **Commit changes**:
   * Commit messages must begin with `[<ISSUE_KEY>]`.

3. **Submit work**:
   ```
   /submit-task
   ```
   * Pushes the branch.
   * Moves the issue to *In Review*.
   * Opens a draft PR (if configured).

4. **Merge**:
   * Merging the PR sets the issue to *Done* and removes the branch.

---

## 3. Memory and commentary
* Follow the guidance in `memory-bank-guidelines.md` when you need to persist architectural decisions or context.

---

## 4. Project invariants

* **Package manager:** `bun`. Always convert `npm|yarn|pnpm` commands to `bun`.
* **Branch naming:** `<ISSUE_KEY>-<slug>`.
* **CI path:** `bun install && bun run test`.

---

## 5. “Bootstrap the project” command

After copying this file, simply tell the assistant:

```
/bootstrap-project
```

The assistant will:
1. Create the Linear project (if missing).
2. Generate supporting rule files for **Cursor** (in `.mdc` format).
3. Generate equivalent rules for **Kilocode** (in `.md` format).
4. Generate equivalent rules for **Antigravity** (in `.md` format).
5. Generate **Antigravity Workflows** in `.agent/workflows/`:
   - `bootstrap-project.md`
   - `start-task.md`
   - `submit-task.md`
6. Initialize a baseline `README.md`.

---

### Generated files at a glance

#### Cursor (`.cursor/rules/*.mdc`)

| File | Purpose |
|------|---------|
| `.cursor/rules/development-workflow.mdc` | Git-flow, code review, PR templates |
| `.cursor/rules/auto-linear-issue.mdc` | Auto-create issues from user prompts |
| `.cursor/rules/linear-status-management.mdc` | Map actions to Linear status updates |
| `.cursor/rules/local-task-workflow.mdc` | Testing, linting, and incremental commits |

#### Kilocode (`kilocode/*.md`)

| File | Purpose |
|------|---------|
| `kilocode/development-workflow.md` | Git-flow, code review, PR templates (Kilocode format) |
| `kilocode/auto-linear-issue.md` | Auto-create issues from user prompts (Kilocode format) |
| `kilocode/linear-status-management.md` | Map actions to Linear status updates (Kilocode format) |
| `kilocode/local-task-workflow.md` | Testing, linting, and incremental commits (Kilocode format) |

#### Antigravity (`agent/rules/*.md` & `.agent/workflows/*.md`)

| File | Purpose |
|------|---------|
| `agent/rules/development-workflow.md` | Git-flow, code review, PR templates |
| `agent/rules/auto-linear-issue.md` | Auto-create issues from user prompts |
| `.agent/workflows/bootstrap-project.md` | **Workflow**: Bootstrap the project |
| `.agent/workflows/start-task.md` | **Workflow**: Start a task (Branch + Linear Status) |
| `.agent/workflows/submit-task.md` | **Workflow**: Submit a task (Push + PR + Linear Status) |

> 📝 **Note:** Antigravity uses `.md` files in `agent/rules/` for general policies and `.agent/workflows/` for executable workflows.

---

🎉 You can now manage issues conversationally and let the automation handle everything from Linear status updates to branch hygiene.
