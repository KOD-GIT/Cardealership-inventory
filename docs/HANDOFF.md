# Handoff to Claude Code

Written 24 Oct 2026, when the project moved from a chat assistant and an IDE agent to Claude Code. Read `CLAUDE.md` first (the standing rules); this file is the snapshot and the plan.

## 1. How the project got here
- Planned in a chat with Claude: stack, design decisions D1 to D18, the PostgreSQL schema, the API contract, the TDD roadmap.
- Built with AI help: the backend skeleton (models, Alembic migration, schemas, routes, services and repositories as stubs), the whole React frontend with 72 tests, the guides in `docs/`, the `doctor` and `setup_env` helpers, a Stitch design exploration (reference only), and an Antigravity setup runbook.
- AI tools used so far (for "My AI Usage" in the README): Claude (chat; planning, skeleton, frontend, docs), Google Stitch (UI exploration), the Antigravity agent (merging files into the repo and pushing), and now Claude Code.
- The frontend and the skeleton were generated in bulk, so their history has no Red-Green trail. **Real TDD history starts at backend Phase 1.**

## 2. State at handoff

| Area | State |
|---|---|
| Frontend | Complete. 72 tests, type-check and build pass |
| Database | Schema, native enums, constraints, Alembic migration (verified up and down) |
| Backend structure | Routes declared, schemas validate, error mapping, config, safety guard for the test database |
| Backend logic | **Not written.** Stubs in `core/money.py`, `core/security.py`, `repositories/*`, `services/*`, `api/deps.py`, `scripts/seed.py`; the vehicle and auth routes answer 501 |
| Backend tests | 40 pass (schemas, doctor, setup_env, DB constraints, health, API contract). None cover the logic yet |
| Docs | `BUILD_GUIDE.md`, `NEXT_STEPS.md`, `SETUP_GUIDE.md`, `API_CONTRACT.md`, `ER_DIAGRAM.md`, `DESIGN_REVIEW.md`, `ANTIGRAVITY_SETUP.md` |
| README | Skeleton: "My AI Usage", the test report and real screenshots still to do |
| `PROMPTS.md` | Placeholder only |

## 3. The GitHub repository (checked 24 Oct 2026)
`https://github.com/KOD-GIT/Cardealership-inventory` was public, with these problems, all fixed by the fix pack in `1_repo_fix/` (see `FIX_STEPS.md` there):
- CI red: a stale `frontend/src/App.test.tsx` fails (`useRoutes() may be used only in the context of a <Router>`).
- 4 of 5 commits lacked the AI co-author trailer.
- `setup_env.py`, its test and `docs/ANTIGRAVITY_SETUP.md` were not merged; three guides were one version behind.
- `.gitignore` deliberately ignores `*PROJECT_PLAN.md`, so six links in the docs are dead unless the plan is published.

**Do the fix pack before anything else**, so CI is green and the history is honest.

## 4. Open decisions (yours)
1. Publish `docs/PROJECT_PLAN.md` (recommended) or keep it private and remove the six links.
2. Rewrite history to add the missing trailers (`FIX_STEPS.md` step 5, content-safe, needs a force-push) or leave it and disclose it in the README.
3. Which small frontend feature to build test-first (sort by price is fully specified in `BUILD_GUIDE.md` Stage 6).
4. Optional extras: deployment, real `.glb` car models.

## 5. Working in Claude Code
The loop, one behaviour at a time:
1. `/status` to see where things stand.
2. `/phase 1` for the brief of the next phase.
3. `/red <behaviour>`: Claude writes ONE failing test, runs it, and stops. Read it, check the failure message, say "commit".
4. `/commit-ai test: ...`
5. `/green`: the least code to pass, then the whole suite. Review it, then `/commit-ai feat: ...`
6. `/refactor` only when everything is green, then `/commit-ai refactor: ...`
Repeat for the next behaviour. Do 2 to 4 cycles per phase, and do not push while a test is red.

Keep ownership: ask Claude to explain any line you cannot explain back in your own words. The kata interview asks for exactly that.

## 6. First message to paste into Claude Code
```
Read CLAUDE.md and docs/HANDOFF.md. Then run /status and tell me, in under 15 lines: where the repo stands, what is red, and the single next step. Do not change any files yet.
```

## 7. Capture the logs (the kata needs raw, unedited chat logs in `PROMPTS.md`)
- **This chat** (planning, skeleton, frontend, docs): copy the whole transcript into `PROMPTS.md` under a dated heading, or paste a public share link if your chat app has one (check what it exposes).
- **The Antigravity session** and any **Stitch** chats: same.
- **Claude Code sessions:** run `/export prompts-<date>.txt` inside Claude Code to save the conversation as plain text, then append it: `cat prompts-<date>.txt >> PROMPTS.md`. Claude Code keeps transcripts for 30 days by default, so export regularly (see `CLAUDE_CODE_SETUP.md`).
- Never edit or summarise a log.

## 8. What I could not verify
I cannot run Claude Code, Docker, Windows or macOS from where I work. The permission rules, the slash-command format and the install commands were checked against Anthropic's current documentation, and the shell snippets inside the commands were run for real, but the commands themselves have never been run inside Claude Code. If a command misbehaves, open it in `.claude/commands/` and adjust it (they are plain Markdown), or tell Claude to fix it. The state of the GitHub repository and its CI may have changed since 24 Oct 2026: run `/status` and look at the Actions tab.
