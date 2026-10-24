---
description: Commit with the AI co-author trailer, verified. Never pushes
argument-hint: "[commit subject, e.g. feat: register a new user]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git log:*), Bash(git interpret-trailers:*)
---
Commit message subject: $ARGUMENTS

1. Show `git status --short` and one line per changed file. Point out anything that should not be committed (`.env`, reports, coverage, `node_modules`, build output). Ask me to confirm the file list.
2. Stage only the confirmed files with `git add <paths>`. Never `git add -A` or `git add .`.
3. Commit with three paragraphs, each its own `-m`: the subject; one honest sentence on how AI helped (ask me if unsure); the trailer line `Co-authored-by: Claude <noreply@anthropic.com>`.
4. Verify with `git log -1 --format=%B | git interpret-trailers --parse`. There must be exactly ONE Co-authored-by line for Claude. If Claude Code added its own and there are two, amend the message so only one remains.
5. Do not push.
