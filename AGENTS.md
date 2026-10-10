# Working in this repository

A small browser clicker game with an Arch Linux theme: one HTML file, a
persistence module, Node tests.

## Checks

```bash
node --test tests/*.test.cjs
```

Open `index.html` at desktop and 390 px width after a change: no console
errors, a save survives a reload, a corrupted save loads without an error.

## Rules

- Saves are versioned and migrated, never silently discarded.
- The economy and prestige formula stay as they are unless Frank asks.

## Working alongside other agents

Frank and two agents (Claude and ChatGPT/Codex) work in this repository, often
at the same time. The repository itself is the only channel between them.

- Work on your own branch (`codex/…`, `claude/…`). Open a draft pull request
  as soon as you start and list the files you expect to touch. Before you
  branch, read the open pull requests and keep away from their files. Never
  push to another agent's branch, and never to `main` directly.
- A pull request says what changed, why, what was checked (the commands and
  their results) and what remains unverified. Fix a failing check; do not
  weaken or skip it.
- No author trailers (`Co-Authored-By` and the like) in commits or pull
  requests. The commit author is enough.
- No status files, task lists or progress notes in the repository. The pull
  requests and the history are the record.
- Frozen material (below) is not edited in place. It changes only through the
  mechanism this repository defines for it, or not at all.
