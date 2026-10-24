---
description: Set up the whole environment (venv, packages, .env files, database tables, full test run) by following the runbook
---
Read `docs/ANTIGRAVITY_SETUP.md` and follow "Part 2. The runbook" step by step, exactly as written, including its Rules and its Troubleshooting table. Where it says "agent" that is you; where it says "ask me", stop and ask.

Differences for Claude Code:
- You may run the commands directly; Claude Code will ask me to approve them as configured.
- Call the virtual environment's Python directly (never activate it).
- Do not start servers.
- Never read or print `.env` files.
- Finish with the report table from Step 10.
