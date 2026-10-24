# Antigravity setup runbook

A guide you hand to the Antigravity agent so it sets up the whole project for you: Python environment, packages, `.env` files, database tables, and a full test run. It is written for an AI agent to follow step by step, with an exact command and a success check for every step, and clear rules for when to stop and ask you.

> **What was tested.** The commands in Part 2 were run in order on a clean copy of the project (Linux, with PostgreSQL already running, no Docker): they produce the results shown. I could not run Docker, Windows, macOS or Antigravity itself here. The Docker step and the Windows/macOS variants are standard but untested, and Antigravity's folder and mode names differ between sources (see 1.4), so the **paste method always works**.

## Part 1. For you (about 5 minutes)

### 1.1 Install what an agent cannot click through
- **Docker Desktop**: install it, start it, and wait until it says "running" (https://www.docker.com/products/docker-desktop).
- **Git, Python 3.12, Node 20 or newer**: install them if you do not have them. If you skip some, the agent will stop and tell you, and can suggest install commands for you to approve.

Full install steps for every tool: [`SETUP_GUIDE.md`](SETUP_GUIDE.md).

### 1.2 Open the project
In Antigravity: **File > Open Folder**, and choose the folder that contains `docker-compose.yml`, `backend/` and `frontend/`.

### 1.3 Choose how much the agent may do on its own
Antigravity has a *terminal execution policy*. For the first run choose **Request review** (the agent asks before every command). Read each command before you approve it. Once you trust it, **Agent decides** is less tedious. Avoid "always proceed" for this project: the runbook includes commands that touch a database.

### 1.4 Give the agent the runbook (pick one)
- **A. Paste it (recommended, works in every version).** Open the agent panel (Ctrl+L, or Cmd+L on macOS), start a new task, and paste everything under **"Part 2"** below as your first message. Choose *Planning* mode if offered.
- **B. As a saved workflow.** Save Part 2 as `.agent/workflows/setup.md` in the project (some versions use `.agents/`), start a fresh task, and type `/setup`. If `/setup` does not appear, use method A.
- **Do not put it in `AGENTS.md`.** That file is read at the start of *every* task, so the agent would try to re-run setup each time.

### 1.5 What the agent will and will not do
It **will** create a virtual environment, install packages, create `.env` files, start the database container, create the tables, run the checks and the tests, and write you a report.
It **will not** commit or push to git, delete data, edit your code or tests, show you secrets, or install system software without asking you first.

---

## Part 2. The runbook (paste everything below this line)

You are setting up the development environment for this project on the user's computer. Follow the steps below **in order**. For every step: run the command, check the success condition, and only then continue.

### Rules (these override anything else)
1. Work only inside this workspace folder (the project root, the folder that contains `docker-compose.yml`).
2. Do **not** run `git commit`, `git push`, `git config`, `git reset`, `git clean` or anything else that changes git history or settings.
3. Do **not** run destructive commands without asking me first: `docker compose down -v`, `DROP DATABASE`, `rm -rf` / `rmdir /s`, anything using `sudo` or Administrator.
4. Never print, log or paste secrets (SECRET_KEY, passwords, tokens). Do not show the contents of any `.env` file.
5. Do **not** edit source code, tests, migrations or config. The only files you may create or change are `backend/.env` and `frontend/.env`, and only through the helper in Step 4. If a test fails, report it. Never change a test or the code to make it pass.
6. Do **not** install system software (Python, Node, Git, Docker, PostgreSQL) yourself. If something is missing, stop and ask me (Step 1).
7. Do not start long-running servers (no `uvicorn`, no `npm run dev`).
8. If a step fails: look it up in the **Troubleshooting** table, apply the fix **once**, and retry. If it still fails, **stop** and report the exact error text. Do not improvise other fixes.
9. Use non-interactive commands only. Do not activate the virtual environment; call its Python directly (see Step 3).

### About the project
- `backend/`: a Python FastAPI API. `frontend/`: a React app. `docker-compose.yml` defines a PostgreSQL 16 container named `db`.
- PostgreSQL listens on `localhost:5432`. Local-development login: user `dealership`, password `dealership`. Databases: `dealership` (the app) and `dealership_test` (wiped by the tests, which is expected and safe).
- Expected results at the end: **backend 40 tests pass**, **frontend 72 tests pass**, type-check and build succeed.
- In the commands below, `VENV_PY` means the virtual environment's Python: `.venv/bin/python` on macOS and Linux, `.venv\Scripts\python.exe` on Windows. "In backend" means: set the working directory to `backend/` for that command (do not rely on `cd ... &&`, which Windows PowerShell 5 does not support).

### Step 0. Detect the environment
Find out the operating system and run these (each on its own):
`python --version` (if not found try `python3 --version`, or `py -3.12 --version` on Windows), `node --version`, `npm --version`, `git --version`, `docker --version`, `docker compose version`.
Remember which Python command worked; call it `PY_CMD`.
**Success:** Python is 3.11 or newer (3.12 preferred), Node is 20 or newer, npm and git exist. Docker may be missing (see Step 2).
**If Python, Node, npm or git is missing or too old:** go to Step 1.

### Step 1. Missing tools (only if Step 0 found a problem)
Stop and tell me exactly what is missing. Offer these install commands **for me to approve**; do not run them unless I say yes. (These package names are standard but not verified here: if one is not found, search for the right name or point me to the download page.)

| Tool | Windows (PowerShell) | macOS (Homebrew) | Ubuntu / Debian |
|---|---|---|---|
| Git | `winget install Git.Git` | `brew install git` | `sudo apt install git` |
| Python 3.12 | `winget install Python.Python.3.12` | `brew install python@3.12` | `sudo apt install python3 python3-venv python3-pip` |
| Node 20+ | `winget install OpenJS.NodeJS.LTS` | `brew install node` | download from https://nodejs.org |
| Docker | install Docker Desktop manually, then start it | install Docker Desktop manually, then start it | https://docs.docker.com/engine/install/ |

After I install something, tell me to **open a new terminal** (so the PATH updates), then repeat Step 0.

### Step 2. Start the database
1. If `docker --version` worked, check the daemon is running: `docker info`. If it fails with "cannot connect" or "daemon is not running", ask me to start Docker Desktop and wait, then retry.
2. Run (in the project root): `docker compose up -d --wait db`
   (`--wait` blocks until the container's healthcheck passes. If your Docker Compose does not know `--wait`, run `docker compose up -d db` and then run `docker compose ps` every few seconds, for up to 60 seconds, until `db` shows `healthy`.)
**Success:** `docker compose ps` lists `db` as healthy (or running).
**If Docker is not installed:** do not install it. Check whether PostgreSQL is already reachable by continuing to Step 3 to 7; Step 7 (the doctor) will tell us. If the doctor reports the database is unreachable, **stop** and ask me to set up PostgreSQL using section 4.3 of `docs/SETUP_GUIDE.md`.

### Step 3. Backend virtual environment and packages
Run, in backend:
1. `PY_CMD -m venv .venv`
2. `VENV_PY -m pip install --upgrade pip`
3. `VENV_PY -m pip install -r requirements-dev.txt`

**Success:** the last command ends without an error (a final line like "Successfully installed ..." or "Requirement already satisfied").

### Step 4. Create the `.env` files
Run, in backend: `VENV_PY -m app.scripts.setup_env`
**Success:** it prints lines starting with `[ ok ]` (backend `.env` created or kept, `SECRET_KEY` generated or kept, frontend `.env` created or kept). It never prints the secret. Do not open or display the `.env` files.

### Step 5. Frontend packages
Run, in the project root: `npm ci --prefix frontend`
**Success:** the exit code is 0 and the folder `frontend/node_modules` now exists. Messages such as "added NNN packages", deprecation warnings and "a new version of npm is available" are normal; ignore them. Do **not** run `npm audit fix`.

### Step 6. Create the database tables
Run, in backend:
1. `VENV_PY -m alembic upgrade head`
2. `VENV_PY -m alembic current`

**Success:** the second command prints `0001 (head)`. The first prints "Running upgrade -> 0001" the first time, and nothing alarming on a re-run.

### Step 7. Health check ("the doctor")
Run, in backend: `VENV_PY -m app.scripts.doctor`
**Success:** the exit code is 0 and the last line says "Everything needed is working". Lines starting `[warn]` are fine (for example `docker not found` or `psql not found`). Any line starting `[FAIL]` is a problem: use the Troubleshooting table.

### Step 8. Backend tests and lint
Run, in backend:
1. `VENV_PY -m pytest -q`
2. `VENV_PY -m ruff check .`

**Success:** `40 passed` and `All checks passed!`. (If the number differs, report the real number and any failures. Do not edit tests. These tests delete and recreate the tables in `dealership_test` only, which is safe.)

### Step 9. Frontend tests, type-check and build
Run, in the project root, one at a time:
1. `npm --prefix frontend run test`
2. `npm --prefix frontend run typecheck`
3. `npm --prefix frontend run build`

**Success:** `72 passed`; the type-check exits 0; the build prints "built in ...". (Leave the generated `dist` folder alone; it is git-ignored.)

### Step 10. Report
Do not start servers. Do not commit anything. Reply with this report, filled in:

```
## Setup report
| Step | Result (done / skipped / failed) | Notes |
|---|---|---|
| 0 Detect | | versions: python, node, npm, git, docker |
| 1 Missing tools | | |
| 2 Database | | |
| 3 Backend env | | |
| 4 .env files | | |
| 5 Frontend packages | | |
| 6 Tables | | alembic current: |
| 7 Doctor | | ok / warn / fail counts |
| 8 Backend tests + lint | | N passed |
| 9 Frontend tests + typecheck + build | | N passed |

Needs me: (list anything you could not do, and the exact command or action you need me to take)
```
Finish by telling me the two commands to start the app myself:
- API (in backend): `VENV_PY -m uvicorn app.main:app --reload`, then open http://localhost:8000/docs
- Website (in the project root): `npm --prefix frontend run dev`, then open http://localhost:5173
(Login will not work yet: the API's business logic is still to be written test-first. Pages load, and the API answers `501` for most endpoints. That is expected.)

### Troubleshooting (apply once, then stop and report)
| Symptom | Action |
|---|---|
| `python` not found | Try `python3`, or `py -3.12` on Windows. Otherwise Step 1 |
| `[FAIL] ... PostgreSQL is not running` / connection refused | Docker: make sure Docker Desktop is running, then `docker compose up -d --wait db`. No Docker: stop and ask me |
| `password authentication failed` | Do **not** change any password. Check that you did not edit the database URLs; the expected login is `dealership` / `dealership`. If PostgreSQL is not the Docker one, stop and ask me |
| `database "dealership_test" does not exist` | This is safe to fix: `docker compose exec -T db psql -U dealership -d dealership -c "CREATE DATABASE dealership_test;"` and rerun the doctor. If there is no Docker, stop and ask me |
| `port is already allocated` / port 5432 in use | Report it. Do not kill other programs; ask me |
| `type "role" already exists` / `relation ... already exists` during `alembic upgrade head` | Stop and ask me (fixing it needs a database reset, which is destructive) |
| `Refusing to run: TEST_DATABASE_URL points at ...` | Do not touch the setting. Report it |
| `pip` fails while building a package | Run `VENV_PY -m pip install --upgrade pip` and retry the install once |
| `npm ci` fails with `EBADENGINE` or similar | Node is too old: report the version and ask me to upgrade |
| Test count is not 40 (backend) or 72 (frontend) | Report the real count and every failure. Do not edit anything |

---

## Part 3. After the agent finishes (you, not the agent)

1. **Read the report.** Anything under "Needs me" is yours to do. Rerun the agent if you fixed something.
2. **Git is yours.** Set your identity and make the commits yourself, following `BUILD_GUIDE.md` Stage 3. If you would rather have the agent run those exact commands, tell it to run the Stage 3.2 commands **verbatim**, and add a second trailer line naming the AI tool that actually helped (for example the Antigravity model you used), because the kata requires the AI that assisted each commit to be credited.
3. **Log this session.** The kata requires your raw AI chat logs in `PROMPTS.md`. This agent conversation is one of them: copy the full transcript there, unedited. Also list Antigravity under "My AI Usage" in the README.
4. **Start building.** Setup is done. Continue with Stage 2 of `BUILD_GUIDE.md`.
