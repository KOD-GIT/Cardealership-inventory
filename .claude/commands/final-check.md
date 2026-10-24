---
description: Stage 9 final verification. Runs every check and reports a pass/fail table
---
Run these checks and report ONE table (check, PASS/FAIL, evidence). Do not fix anything; only report. Ask before running anything not listed here.

Backend (in `backend/`): `python -m pytest -q` (all pass, coverage at least 90%); `python -m ruff check .`.
Frontend (in `frontend/`): `npm test`; `npm run typecheck`; `npm run build`; `npm audit --omit=dev` (no vulnerabilities).
Git: `git status -sb` is clean and not ahead of origin; every commit has the AI trailer (list any that lack it).
Secrets: `git grep -n "SECRET_KEY=" -- . ':!*.example'` prints nothing; `git log --all --oneline -- .env backend/.env frontend/.env` prints nothing; no `.env` in `git ls-files`.
README: has Tech stack, Run locally, Screenshots, Tests (a real test report, not the "paste the final summary" placeholder), My AI Usage (filled in, no italic placeholder text), Credits.
`PROMPTS.md`: is more than the placeholder (raw logs or links).
Screenshots: every image referenced in README exists under `docs/screenshots/`.
Links: every relative link in README and docs/*.md points to an existing file.
Test report: `backend/reports/test-report.html` exists and is tracked by git.

Then list what only I can check: repository is public (open it in a private window), CI is green on the latest commit (Actions tab), the clean-clone test (clone into a new folder and follow the README).
