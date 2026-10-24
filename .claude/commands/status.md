---
description: Where does the project stand? Git state, AI trailers, remaining stubs, and the single next step
allowed-tools: Bash(git status:*), Bash(git log:*), Bash(grep:*), Bash(wc:*), Bash(ls:*), Bash(true:*)
---
## Facts (collected for you)

Branch and uncommitted changes:
!`git status --short --branch`

Last 8 commits with their Co-authored-by trailer (an empty second line means the trailer is MISSING):
!`git log -8 --format='%h %s%n   %(trailers:key=Co-authored-by,valueonly)'`

Backend files that still contain stubs (`raise NotImplementedError`):
!`grep -rl "raise NotImplementedError" backend/app --include=*.py || true`

Route handlers that still answer 501:
!`grep -rn "_NOT_IMPLEMENTED\|HTTP_501_NOT_IMPLEMENTED" backend/app/api/routes --include=*.py | grep -c raise || true`

Test files present:
!`ls backend/tests/unit backend/tests/integration`

## Task
Using only the facts above (do not run the tests unless I ask), answer in under 15 lines:
1. Where the repo stands (uncommitted work, last commits).
2. Which commits lack the AI trailer.
3. Which backend phase (1 to 11, see CLAUDE.md) is the next one, judging by which stubs remain and which test files exist.
4. The single next step, as one `/red ...` command I could run.
Do not change any files.
