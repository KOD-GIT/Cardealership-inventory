# Claude Code setup

How to install Claude Code, open this project in it, and check that it picked up the project's rules. Install commands and settings were checked against Anthropic's documentation (https://code.claude.com/docs).

## 1. Install
Use the native installer (Node.js is not needed):

| Where | Command |
|---|---|
| macOS, Linux, WSL | `curl -fsSL https://claude.ai/install.sh \| bash` |
| Windows PowerShell | `irm https://claude.ai/install.ps1 \| iex` |
| Windows CMD | `curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd` |
| Homebrew | `brew install --cask claude-code` |
| WinGet | `winget install Anthropic.ClaudeCode` |

Open a **new terminal**, then check:
```bash
claude --version
claude doctor
```
Requirements from the docs: macOS 13+, Ubuntu 20.04+ / Debian 10+, or Windows 10+ with WSL or Git for Windows; 4 GB RAM or more. The older `npm install -g @anthropic-ai/claude-code` still works but is deprecated. Never use `sudo` with npm.

## 2. Open the project
```bash
git clone https://github.com/KOD-GIT/Cardealership-inventory.git
cd Cardealership-inventory
claude
```
The first run asks you to log in (a Claude.ai account) and to trust the folder. Always start `claude` from the **repository root**.

## 3. Check it loaded the project's setup
Inside Claude Code:
- `/memory` should list the project's `CLAUDE.md`.
- `/help` should list the project commands: `/setup`, `/status`, `/phase`, `/red`, `/green`, `/refactor`, `/commit-ai`, `/final-check`.
- `/permissions` shows the rules from `.claude/settings.json`: git reads and the test and lint commands are allowed; `git commit`, `git push` and `git filter-branch` always ask; force-pushes, `git reset --hard`, `git clean`, `rm -rf`, `sudo`, `docker compose down -v` and reading `.env` files are blocked.

If something is missing, you are probably not in the repository root, or the files from `2_claude_code_files` were not committed and pulled.

## 4. First steps
1. Run `/setup` (it follows `docs/ANTIGRAVITY_SETUP.md`) if your environment is not set up yet, or run `python -m app.scripts.doctor` from `backend/` to check it.
2. Paste the first message from `docs/HANDOFF.md`, section 6.
3. Then follow the loop in `docs/HANDOFF.md`, section 5.

## 5. Keep your logs (kata requirement)
- `/export <file>` (inside Claude Code) saves the current conversation as plain text, or copies it to the clipboard. Append it to `PROMPTS.md`: `cat <file> >> PROMPTS.md`.
- Transcripts are also stored as JSONL under `~/.claude/projects/<project>/<session-id>.jsonl`.
- **They are deleted after 30 days by default.** To keep them longer, add this to your personal settings file `~/.claude/settings.json` (not the project one):
  ```json
  { "cleanupPeriodDays": 365 }
  ```
- `claude --resume` (or `/resume`) reopens a previous session.

## 6. Commit attribution
Claude Code adds its own `Co-Authored-By: Claude <noreply@anthropic.com>` line to commits it creates, which already matches what the kata asks for. The setting that controls this has been renamed across versions, so this project does **not** change it. Instead `CLAUDE.md` and `/commit-ai` tell Claude to check, after every commit, that there is exactly one such trailer:
```bash
git log -1 --format=%B | git interpret-trailers --parse
```
If you ever see two, amend the message so only one remains. Commits you write entirely yourself need no trailer.

## 7. Tips
- If a command asks for permission each time, choose "don't ask again" for safe ones; Claude Code saves the rule to `.claude/settings.local.json`, which is git-ignored.
- Rules are checked per command. `cd backend && python -m pytest -q` is allowed only if both `cd` and the pytest command are allowed. If your Python is the venv one (`backend/.venv/bin/python`), approve that spelling once.
- Use `/clear` between unrelated tasks and `/compact` when a long session slows down.
- You can say "explain this line" at any time. Do that for every line you could not explain in an interview.
