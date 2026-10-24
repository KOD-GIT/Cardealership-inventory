# Setup guide: every tool, step by step

This guide installs and configures everything the project needs: **Git and GitHub, Python, Node, PostgreSQL, Docker**, the project's config files and your editor. At the end a one-line command (`doctor`) checks all of it and tells you in plain English what is wrong.

> **What was tested.** The PostgreSQL SQL, the connection strings, the `doctor` command, the password and "database missing" errors, and the test-database safety guard were all run against a real PostgreSQL 16. I could not run Docker, Windows or macOS here, so those install steps are the standard, documented ways but are **not tested by me**. If one step behaves differently on your machine, the troubleshooting table (section 10) and `doctor` are your first stop.

## 0. What you are setting up

```
 Browser  --->  Frontend (Vite, port 5173)  --->  Backend API (FastAPI, port 8000)  --->  PostgreSQL (port 5432)
                                                                                           |-- dealership       (the app's data)
                                                                                           '-- dealership_test  (wiped by the tests)
```

| Tool | Why you need it | Version | Check it with |
|---|---|---|---|
| Git | Version control, the kata's history | any recent | `git --version` |
| GitHub account | Hosts the public repository | n/a | log in at github.com |
| Python | Runs the backend | 3.12 (3.11 should work) | `python --version` |
| Node.js + npm | Runs the frontend | 20 or newer | `node --version` and `npm --version` |
| PostgreSQL | The database | 14 or newer (the project uses 16) | see section 4 |
| Docker Desktop | **Easiest** way to run PostgreSQL | any recent | `docker --version` |
| Editor (VS Code) | Optional but recommended | any | n/a |

**Want an AI agent to do the setup for you?** Hand the Antigravity agent the runbook in [`ANTIGRAVITY_SETUP.md`](ANTIGRAVITY_SETUP.md).

**Fast path.** If you are comfortable with the tools above, install them, then:
```bash
docker compose up -d db
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements-dev.txt
cp .env.example .env && alembic upgrade head
python -m app.scripts.doctor          # everything green? you are done with setup
```
Otherwise follow sections 1 to 9 in order.

---

## 1. Git and GitHub

### 1.1 Install Git
- **Windows:** download from https://git-scm.com/downloads and run the installer (the defaults are fine). It includes **Git Bash**, a terminal where every command in these guides works.
- **macOS:** `xcode-select --install` (or `brew install git`).
- **Linux (Ubuntu/Debian):** `sudo apt install git`.

### 1.2 Tell Git who you are (once)
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```
Your commits carry that email and are public once pushed. To keep your real address private, GitHub offers a `...@users.noreply.github.com` address (GitHub > Settings > Emails); use that instead.

### 1.3 GitHub account and an empty public repository
1. Create an account at https://github.com.
2. **New repository**, set it to **Public**, and leave "Add a README", ".gitignore" and "licence" **unticked**. The project already has files, and a pre-filled repository would make your first push conflict.

### 1.4 Let your computer push to GitHub (pick one)
- **Easiest, GitHub CLI:** install `gh` (https://cli.github.com), then `gh auth login` and follow the prompts. After that `git push` just works over HTTPS.
- **HTTPS with a token:** GitHub > Settings > Developer settings > Personal access tokens, create a token with access to the repository (read and write "Contents"). When Git asks for a password on your first push, paste the token (your normal password no longer works).
- **SSH:** `ssh-keygen -t ed25519 -C "you@example.com"`, add the contents of `~/.ssh/id_ed25519.pub` under GitHub > Settings > SSH keys, check with `ssh -T git@github.com`, and use the `git@github.com:...` repository address.

---

## 2. Python

You need **Python 3.12** (3.11 should work but is untested).

- **Windows:** install from https://www.python.org/downloads/ and **tick "Add python.exe to PATH"** on the first screen. Afterwards `python --version` should work. If `python` opens the Microsoft Store instead, use `py -3.12` in its place.
- **macOS:** `brew install python@3.12` (then use `python3.12` if `python3` is older).
- **Ubuntu 24.04:** Python 3.12 is already `python3`. Add the extras: `sudo apt install python3-venv python3-pip`.

On macOS and Linux the command is often `python3`, not `python`. Use whichever prints a 3.12 version.

**Virtual environment.** This keeps the project's packages separate from the rest of your computer. You create it once and **activate it in every new terminal**:
```bash
cd backend
python -m venv .venv                  # Windows alternative: py -3.12 -m venv .venv
source .venv/bin/activate             # macOS/Linux/Git Bash
.venv\Scripts\Activate.ps1            # Windows PowerShell
.venv\Scripts\activate.bat            # Windows Command Prompt
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```
You know it is active when your prompt starts with `(.venv)`. To leave it, type `deactivate`.

---

## 3. Node.js

Install Node **20 or newer** (the LTS version is fine) from https://nodejs.org. It includes `npm`.
Check: `node --version` and `npm --version`.

If you juggle several Node versions, `nvm` (macOS/Linux) or `nvm-windows` lets you switch: `nvm install 20 && nvm use 20`.

Frontend packages are installed later with `npm ci` (section 7).

---

## 4. PostgreSQL (the main part)

### 4.1 What the project expects
| Setting | Value |
|---|---|
| Host and port | `localhost`, `5432` |
| User and password | `dealership` / `dealership` (**for local development only**) |
| App database | `dealership` |
| Test database | `dealership_test` (the tests **delete and recreate every table in it**) |
| Connection URL for the app | `postgresql+psycopg://dealership:dealership@localhost:5432/dealership` |

**URL anatomy:**
```
postgresql+psycopg://  dealership : dealership @ localhost : 5432 / dealership
 ^ type + driver        ^ user      ^ password    ^ host      ^port   ^ database name
```
- The app (SQLAlchemy) needs `postgresql+psycopg://`. The command-line tool `psql` wants plain `postgresql://`. Mixing them up is the most common mistake.
- If you choose a password with special characters, **URL-encode** them in the URL: `@` becomes `%40`, `#` becomes `%23`, `/` becomes `%2F`, `:` becomes `%3A`.

Choose **one** of the two ways below. **Option A (Docker) is recommended** because it needs no manual database setup and is identical on every machine.

### 4.2 Option A: PostgreSQL in Docker (recommended)

1. Install and start Docker Desktop (section 5).
2. From the project root:
   ```bash
   docker compose up -d db
   docker compose ps
   ```
   After a few seconds the `db` row should say **healthy**.
3. That is all. The first start creates the `dealership` database, the user, and (through `docker/postgres/init.sql`) the `dealership_test` database.

**Useful commands**
```bash
docker compose logs db                     # see the database's log output
docker compose exec db psql -U dealership -d dealership     # open a SQL prompt inside the container (no local psql needed)
docker compose stop db                     # stop it, keep the data
docker compose start db                    # start it again
docker compose down                        # remove the container, KEEP the data (stored in the "pgdata" volume)
docker compose down -v                     # remove the container AND ALL DATA (a clean slate)
```
**Gotcha:** the init script that creates `dealership_test` runs **only the first time**, when the data volume is empty. If `dealership_test` is missing (for example you started the database before the project had that script), either run `docker compose down -v` and start again, or create it by hand:
```bash
docker compose exec db psql -U dealership -d dealership -c "CREATE DATABASE dealership_test;"
```

### 4.3 Option B: PostgreSQL installed on your computer

**Install**
- **Windows:** download the installer from https://www.postgresql.org/download/windows/. Keep the defaults (port 5432), and **write down the password you set for the `postgres` superuser**. When the installer finishes you can skip "Stack Builder".
- **macOS:** `brew install postgresql@16` then `brew services start postgresql@16`. (If `psql` is not found, run `brew link postgresql@16 --force` or add its `bin` folder to your PATH.)
- **Ubuntu/Debian:** `sudo apt install postgresql` (the service starts automatically; check with `sudo systemctl status postgresql`).

**Open a SQL prompt as the administrator**
- **Windows:** Start menu > **SQL Shell (psql)**, press Enter through the prompts, then type the `postgres` password.
- **macOS (Homebrew):** `psql postgres`
- **Linux:** `sudo -u postgres psql`

**Create the user and the two databases** (these exact statements were run against PostgreSQL 16):
```sql
CREATE USER dealership WITH PASSWORD 'dealership' CREATEDB;
CREATE DATABASE dealership OWNER dealership;
CREATE DATABASE dealership_test OWNER dealership;
```
Leave with `\q`. If you chose a different password or port, put them in your `.env` URLs (section 6).

**Test the login the way the app will use it:**
```bash
psql "postgresql://dealership:dealership@localhost:5432/dealership" -c "select current_user;"
```
It should print `dealership`. (Note the plain `postgresql://` here, no `+psycopg`.)

### 4.4 Look inside the database
Inside any SQL prompt (`psql ...` or the Docker command above):
```
\l                      list databases
\c dealership           connect to the app database
\dt                     list tables  (users, vehicles, purchases, alembic_version)
\d vehicles             describe a table: columns, constraints, indexes
\dT                     list the custom types (role, vehiclecategory)
select * from vehicles; look at the data
\q                      quit
```
Prefer clicking? Any of **DBeaver**, **pgAdmin** or **TablePlus** works. Create a connection with host `localhost`, port `5432`, database `dealership`, user `dealership`, password `dealership`.

### 4.5 Create the tables (migrations)
The tables are not created by hand. Alembic builds them from the project's migration, from the `backend` folder with the virtual environment active:
```bash
alembic upgrade head       # create (or update) all tables
alembic current            # which migration is applied (should say 0001 (head))
alembic downgrade base     # remove all tables (careful: deletes data)
```
Run `alembic upgrade head` once after the database exists, and again whenever a new migration is added. Only the **app** database needs this; the tests create their own tables in `dealership_test`.

### 4.6 Start over with an empty database
- **Docker:** `docker compose down -v`, then `docker compose up -d db`, then `alembic upgrade head`.
- **Native install:** in `psql` as the administrator:
  ```sql
  DROP DATABASE dealership;
  CREATE DATABASE dealership OWNER dealership;
  ```
  then `alembic upgrade head`. (You cannot drop a database while something is connected to it: stop the backend first.)

### 4.7 A hosted database (optional, for deployment later)
Providers such as Neon or Supabase give you a connection string that starts with `postgresql://`. **Change the start to `postgresql+psycopg://`** before putting it in `DATABASE_URL`. See `NEXT_STEPS.md`, Part F.

---

## 5. Docker Desktop

Only needed for Option A (and for the optional full-stack `docker compose up --build`).

- **Windows:** download from https://www.docker.com/products/docker-desktop. It uses **WSL 2**; the installer offers to set it up. **Virtualisation must be enabled** in your computer's BIOS/UEFI (most computers have it on). Restart if asked.
- **macOS:** download the version for your chip (Apple silicon or Intel). The images this project uses work on both.
- **Linux:** follow https://docs.docker.com/engine/install/ and install the Compose plugin. (You may need `sudo` or to add your user to the `docker` group.)

**Start Docker Desktop and wait until it says "running"**, then check:
```bash
docker --version
docker compose version
docker run hello-world        # downloads a tiny image and prints a greeting
```

---

## 6. The project's configuration files

Settings live in `.env` files that are **never committed** (they are git-ignored). Each folder has a `.env.example` to copy:

```bash
cd backend  && cp .env.example .env        # Windows: copy .env.example .env
cd ../frontend && cp .env.example .env
```

### backend/.env
| Variable | What it does | What to put |
|---|---|---|
| `DATABASE_URL` | Where the app finds its database | The default works for Docker and the Option B steps above |
| `TEST_DATABASE_URL` | The database the tests wipe | Must end in `_test`. **Never point it at your real database** |
| `SECRET_KEY` | Signs login tokens | A long random string (below). Keep it secret |
| `JWT_ALGORITHM` | Token signing method | Leave `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | How long a login lasts | `60` is fine |
| `CORS_ORIGINS` | Which website addresses may call the API | A JSON list, e.g. `["http://localhost:5173"]` |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin account the seed script creates | Change the password if you ever deploy |

Make a secret key and paste it after `SECRET_KEY=`:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```
**Shortcut:** `python -m app.scripts.setup_env` (from `backend/`) creates both `.env` files and generates the `SECRET_KEY` for you. It is safe to run again: it never overwrites a value you set yourself and never prints the secret.

After you edit `.env`, **restart the backend** (settings are read once at startup).

### frontend/.env
| Variable | What it does | What to put |
|---|---|---|
| `VITE_API_BASE_URL` | Where the website finds the API | `http://localhost:8000` |

**Safety net.** If `TEST_DATABASE_URL` points at a database whose name does not end in `_test`, the test run **refuses to start** and the doctor reports it. This exists because the tests drop every table in that database.

---

## 7. Install the project's packages

```bash
# backend (virtual environment active)
cd backend
pip install -r requirements-dev.txt
alembic upgrade head

# frontend (in a second terminal)
cd frontend
npm ci
```
`npm ci` installs exactly the versions in `package-lock.json` (use it, not `npm install`, so you match the reviewers' setup).

---

## 8. Editor (VS Code, optional)

Install from https://code.visualstudio.com, then open the **project root** folder. Useful extensions: **Python**, **Pylance**, **Ruff**, **Tailwind CSS IntelliSense**, **Docker**, **GitLens**.
- Pick the interpreter: press Ctrl/Cmd+Shift+P, choose **Python: Select Interpreter**, and pick the one inside `backend/.venv`.
- Open a terminal inside the editor (Ctrl+`) and remember to activate the virtual environment in it.

---

## 9. Verify everything: the doctor

From the `backend` folder with the virtual environment active:
```bash
python -m app.scripts.doctor
```
Example output (from a Linux machine without Docker, so it shows one warning):
```
Checking your environment...

[ ok ] Python 3.12.3
[ ok ] git version 2.43.0
[ ok ] node v22.22.2
[ ok ] npm 10.9.7
[warn] docker not found: optional but recommended for PostgreSQL: https://www.docker.com/products/docker-desktop
[ ok ] psql (PostgreSQL) 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
[ ok ] backend/.env exists
[ ok ] SECRET_KEY is set and long enough
[ ok ] frontend dependencies are installed
[ ok ] app database:  connected (PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1))
[ ok ] app database:  tables exist (migrations applied)
[ ok ] test database: connected (PostgreSQL 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1))

Everything needed is working (1 warning(s)).
```
`[warn]` lines are fine. **Fix every `[FAIL]` line first**, because each one explains the fix. It exits with code 0 when nothing is broken and 1 otherwise.

What it checks (each of these was tested): Python, Git, Node and npm versions; Docker and `psql` (optional); `.env` present; a long enough `SECRET_KEY`; frontend packages installed; both databases reachable; migrations applied; wrong password, database missing, PostgreSQL not running, a URL missing `+psycopg`, and an unsafe test database name.

**Then prove it end to end:**
```bash
cd backend  && pytest                         # all pass
cd frontend && npm test                       # all pass
cd backend  && uvicorn app.main:app --reload  # open http://localhost:8000/docs
cd frontend && npm run dev                    # open http://localhost:5173
```

---

## 10. Troubleshooting

| What you see | What it means | Fix |
|---|---|---|
| `Connection refused` / "PostgreSQL is not running" | Nothing is listening on port 5432 | Docker: start Docker Desktop, then `docker compose up -d db`. Native: start the service (`brew services start postgresql@16`, `sudo systemctl start postgresql`, or Windows Services > postgresql) |
| `password authentication failed for user "dealership"` | Wrong password in the URL | Check `.env`. The Docker default is `dealership` / `dealership`. A native install uses the password you set in `CREATE USER` |
| `database "dealership_test" does not exist` | The test database was never created | Docker: `docker compose exec db psql -U dealership -d dealership -c "CREATE DATABASE dealership_test;"` (or `docker compose down -v` and start again). Native: `CREATE DATABASE dealership_test OWNER dealership;` |
| `role "dealership" does not exist` | The user was never created (native install) | Run the `CREATE USER` statement from section 4.3 |
| `port is already allocated` / port 5432 in use | Another PostgreSQL (or program) already uses 5432 | Find it: `lsof -i :5432` (macOS/Linux) or `netstat -ano \| findstr :5432` (Windows). Stop it, or change the Docker mapping to `"5433:5432"` in `docker-compose.yml` and use `5433` in both URLs |
| `psql: command not found` / "not recognized" | `psql` is not on your PATH | Use the Docker command (`docker compose exec db psql ...`), or add PostgreSQL's `bin` folder to PATH (Windows: `C:\Program Files\PostgreSQL\16\bin`) |
| `type "role" already exists` or `relation "users" already exists` when running `alembic upgrade head` | The database already has tables Alembic did not create | Start over with an empty database (section 4.6) |
| `Refusing to run: TEST_DATABASE_URL points at ...` | The safety net stopped you from wiping a real database | Point `TEST_DATABASE_URL` at a database whose name ends in `_test` |
| `(.venv)` missing; `pip` installs everywhere, or "externally-managed-environment" | The virtual environment is not active | Activate it (section 2) |
| PowerShell: "running scripts is disabled" when activating | Windows blocks scripts by default | Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then activate again |
| `python` not found, or opens the Microsoft Store | PATH not set | Reinstall Python and tick "Add to PATH", or use `py -3.12` (Windows) / `python3` (macOS/Linux) |
| `pip` fails building `psycopg` | An old pip | `python -m pip install --upgrade pip`, then install again (the project uses the prebuilt `psycopg[binary]`) |
| `ModuleNotFoundError: app` | Wrong folder, or venv not active | Run commands from inside `backend/` with `(.venv)` showing |
| `npm ci` fails with `EBADENGINE` or odd errors | Node is too old | Install Node 20 or newer, then `npm ci` again |
| Browser shows a CORS error | The API does not allow your website's address | Add it to `CORS_ORIGINS` in `backend/.env` (a JSON list) and restart the backend |
| Port 8000 or 5173 already in use | Another program has it | Stop it, or run on another port (`uvicorn ... --port 8001`, and update `VITE_API_BASE_URL` and `CORS_ORIGINS`) |
| I changed `.env` but nothing changed | Settings are read at startup | Restart the backend / dev server |
| "Docker daemon is not running" / cannot connect to the Docker API | Docker Desktop is not running | Start Docker Desktop and wait for "running". Windows: make sure WSL 2 is installed |
| A special character in the password breaks the URL | The URL cannot contain raw `@`, `#`, `/` | URL-encode it (`@` > `%40`, `#` > `%23`, `/` > `%2F`) |
| SQL error mentioning `postgresql://` or an unknown dialect | The URL is missing the driver | Start it with `postgresql+psycopg://` |

---

## 11. Starting completely over

```bash
docker compose down -v                  # wipes the database volume (Docker)
cd backend && rm -rf .venv              # Windows: rmdir /s /q .venv
cd ../frontend && rm -rf node_modules   # Windows: rmdir /s /q node_modules
```
Then repeat sections 2, 4 and 7. Your code and git history are untouched.
