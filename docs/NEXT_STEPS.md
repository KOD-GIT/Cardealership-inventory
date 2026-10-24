# Next steps: from skeleton to submission

Everything below is in the order you should do it. Rough time budget: **about two focused days** (estimates, not measurements).

**Step tags:** `[TDD]` write failing tests first (Red, Green, Refactor) · `[FIX = TEST FIRST]` a bug gets a failing test before the fix · `[NOT TDD]` setup, config, docs · `[CHECK]` run and verify. Only the first two start with a test. All tags in one table: [`BUILD_GUIDE.md`](BUILD_GUIDE.md), "TDD map".

| Part | What | Rough time |
|---|---|---|
| A | Set up your machine, git and CI | 1 h |
| B | Learn the TDD loop you will repeat | 15 min |
| C | Build the backend, phases 1 to 11 | 8 to 10 h |
| D | Connect and test the frontend against the real API | 1.5 h |
| E | README, test report, logs, final checks | 1.5 h |
| F | Optional: deploy, real 3D models | 2 h |
| G | Interview preparation | 1 h |

## Where you are now

| Done | Still to do |
|---|---|
| Frontend: all pages, 3D card, 72 tests (98% statement coverage) | Backend business logic (everything returns `501` or raises `NotImplementedError`) |
| Database schema + Alembic migration (PostgreSQL) | Backend tests for phases 1 to 11 |
| Backend skeleton: routes, services, repositories, schemas, environment doctor, 40 passing tests | Seed script |
| Docs: plan, API contract, ER diagram, design review | README screenshots from the real app, "My AI Usage", `PROMPTS.md` |
| CI workflow (backend with a PostgreSQL service, frontend) | Confirm CI is green on GitHub |

Two bugs in the skeleton were found and **already fixed** while preparing this guide, so you will not hit them:
- Prices were sent as JSON strings (`"27999.99"`). They are now numbers, as the API contract and the frontend expect.
- bcrypt 5 crashes on passwords longer than 72 **bytes**. Registration now rejects them with a clean `422`.

---

## Part A. Set up (once) [NOT TDD]

### A1. Tools you need
**Full step-by-step installs and configuration (PostgreSQL with or without Docker, Git and GitHub login, Python, Node, `.env` files) are in [`SETUP_GUIDE.md`](SETUP_GUIDE.md).** This section is the short version.

Git, Python 3.12, Node 20+, and Docker Desktop (easiest way to run PostgreSQL). No Docker? Install PostgreSQL 14+ yourself and create two databases: `dealership` and `dealership_test` (see `docker/postgres/init.sql`).

### A2. Unzip and open the project
Unzip `car-dealership-inventory.zip`, open the folder in your editor, and open **two terminals**: one in `backend/`, one in `frontend/`.

### A3. Initialise git and make the first commits
```bash
cd car-dealership-inventory
git init -b main
git config commit.template .gitmessage     # pre-fills the commit message format
```
**Do not make one giant "import everything" commit.** The kata wants a history that narrates your work. [`BUILD_GUIDE.md`](BUILD_GUIDE.md) Stage 3 has the exact commands for 11 logical commits (tested: every file ends up committed, every commit carries the AI trailer). Do that now, then come back here.

### A4. Start the database
```bash
docker compose up -d db          # PostgreSQL on port 5432
docker compose ps                # STATUS should say "healthy" after a few seconds
```
This creates two databases: `dealership` (the app) and `dealership_test` (the tests).

### A5. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cp .env.example .env             # Windows: copy .env.example .env
```
Edit `.env` and set a real secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"   # paste the output as SECRET_KEY
```
Then:
```bash
alembic upgrade head             # creates the tables
pytest                           # expect: 40 passed
python -m app.scripts.doctor     # checks tools, .env and both databases
uvicorn app.main:app --reload    # open http://localhost:8000/docs
```
In Swagger (`/docs`) you should see every endpoint, and calling one returns `501`. That is correct for now.

### A6. Frontend
```bash
cd frontend
cp .env.example .env             # Windows: copy .env.example .env
npm ci
npm test                         # expect: 72 passed
npm run dev                      # open http://localhost:5173
```
The pages load, but login fails until the backend exists. That is expected.

### A7. Push to GitHub and check CI
Create an empty GitHub repository, then:
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```
Open the **Actions** tab. Both jobs (backend, frontend) should turn green. The backend job starts its own PostgreSQL, runs `ruff`, `alembic upgrade head` and `pytest`. **Fix a red CI before moving on**, because every later commit builds on it.

### If something goes wrong

| Symptom | Fix |
|---|---|
| `connection refused` on port 5432 | Docker is not running, or the container is not healthy: `docker compose up -d db` and wait |
| Port 5432 already in use | You have a local PostgreSQL. Stop it, or change the port in `docker-compose.yml` and your `.env` URLs |
| `alembic` cannot connect | `.env` is missing, or `DATABASE_URL` does not start with `postgresql+psycopg://` |
| `ModuleNotFoundError: app` | Run commands from inside `backend/` with the venv active |
| Tests pass locally but CI fails | CI uses its own database. Check the failing step's log, not your machine |
| `npm ci` fails | Node older than 20, or the lockfile was edited. Reinstall Node 20 |

---

## Part B. The loop you repeat for every phase [TDD]

**Red, Green, Refactor**, with at least three commits per feature. This loop applies to every `[TDD]` phase in Part C and to every `[FIX = TEST FIRST]` bug. The full rules, the tests that are "born green", and a worked example are in [`BUILD_GUIDE.md`](BUILD_GUIDE.md) Stage 5.

1. **RED.** Write the tests first. Run only them and watch them **fail for the right reason**:
   ```bash
   pytest tests/unit/test_money.py -x --no-cov
   ```
   Commit: `git commit -m "test: add failing tests for money conversion"`
2. **GREEN.** Write the *least* code that makes them pass. Commit: `feat: implement to_cents and from_cents`
3. **REFACTOR.** Clean up with the tests as a safety net. Commit: `refactor: ...`
4. **Before you push:** `pytest` (everything) and `ruff check .` must both pass.

Useful commands:
```bash
pytest -k purchase                 # only tests whose name contains "purchase"
pytest tests/integration -x        # stop at the first failure
pytest --lf                        # re-run only what failed last time
pytest                             # full run; writes backend/reports/ (coverage + HTML report)
```
Fixtures you already have in `tests/conftest.py`: `client` (a TestClient wired to the test database) and `db_session` (rolled back after every test, so tests never leak data).

**Commit etiquette (graded):** small commits, imperative messages (`feat: add ...`), types `test`, `feat`, `refactor`, `fix`, `docs`, `chore`, `ci`. Never commit `.env`.

---

## Part C. Backend phases [TDD]

Each phase lists the tests to write, the files to touch, hints for the tricky parts, and when you are done. Later phases reuse helpers (fixtures) you add earlier.

### Phase 1. Money helpers [TDD]
**First RED:** `to_cents(Decimal("27999.99")) == 2799999`. **Expected failure:** `NotImplementedError` (all 16 tests below fail until both functions exist).
**Files:** `app/core/money.py` (stubs exist). **Why:** the database stores integer cents so there are no floating-point errors; the API shows decimals.

Create `tests/unit/test_money.py`. This exact file was run against the stubs (16 fail) and against a reference implementation (16 pass):
```python
from decimal import Decimal

import pytest

from app.core.money import from_cents, to_cents


@pytest.mark.parametrize("amount,cents", [("27999.99", 2799999), ("0.01", 1), ("10", 1000), ("10.5", 1050), ("0", 0)])
def test_to_cents_converts_decimals(amount: str, cents: int) -> None:
    assert to_cents(Decimal(amount)) == cents


def test_to_cents_returns_an_int() -> None:
    assert isinstance(to_cents(Decimal("1.00")), int)


def test_to_cents_rounds_half_up() -> None:
    assert to_cents(Decimal("19.994")) == 1999
    assert to_cents(Decimal("19.995")) == 2000


def test_to_cents_has_no_float_drift() -> None:
    assert to_cents(Decimal("0.1") + Decimal("0.2")) == 30


@pytest.mark.parametrize("cents,text", [(2799999, "27999.99"), (1, "0.01"), (1000, "10.00"), (0, "0.00")])
def test_from_cents_always_has_two_decimals(cents: int, text: str) -> None:
    assert from_cents(cents) == Decimal(text)
    assert str(from_cents(cents)) == text


@pytest.mark.parametrize("text", ["27999.99", "0.01", "10.00", "41250.50"])
def test_round_trip(text: str) -> None:
    assert from_cents(to_cents(Decimal(text))) == Decimal(text)
```
**Hint:** `Decimal.quantize(Decimal("1"), rounding=ROUND_HALF_UP)` after multiplying by 100. Never use `float`.
**Done when:** the file passes. Commits: `test:` then `feat:`.

### Phase 2. Password hashing and JWT [TDD]
**First RED:** the hash is not the plain password. **Expected failure:** `NotImplementedError`.
**Files:** `app/core/security.py`. **Tests** (`tests/unit/test_security.py`):
- hash is not the plain password, and two hashes of the same password differ (salt)
- `verify_password` is true for the right password, false for a wrong one
- `verify_password` returns **False (not an exception)** for a password over 72 bytes
- a token round trip gives back the same `sub` and `role`
- expired token is rejected (create with `expires_delta=timedelta(seconds=-1)`)
- tampered token is rejected; token signed with a different secret is rejected
- the token contains `exp` and `iat`

**Hints (all verified against the installed library versions):**
```python
import bcrypt, jwt
from datetime import datetime, timedelta, timezone

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except ValueError:        # longer than 72 bytes, or a malformed hash
        return False

payload = {"sub": str(user_id), "role": role, "iat": now, "exp": now + timedelta(minutes=60)}
token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
claims = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])   # ALWAYS pass algorithms=[...]
```
- **`sub` must be a string** (`str(user.id)`). PyJWT 2.15 raises `InvalidSubjectError` for an integer.
- Invalid tokens raise subclasses of `jwt.PyJWTError`: `ExpiredSignatureError`, `DecodeError`, `InvalidSignatureError`. Catch the base class where you handle them.
- Use a `SECRET_KEY` of at least 32 characters, or PyJWT warns.

### Phase 3. Registration [TDD]
**First RED:** a valid registration returns 201. **Expected failure:** `assert 501 == 201`. **Born green** (the schema already enforces them): invalid email, short password and 73-byte password all give 422. Keep them as guard tests, not as your Red.
**Files:** `repositories/user_repository.py`, `services/auth_service.py`, `api/routes/auth.py`. Remove the `HTTPException(501)` from the route and call the service through `Depends(get_auth_service)` (already in `api/deps.py`).

**Tests** (`tests/integration/test_register.py`, using `client` and `db_session`):
- 201 returns `{id, email, role: "USER"}` and **no** `hashed_password`
- the password is stored hashed (query the user from `db_session`)
- duplicate email gives 409 (decide whether `Jane@x.com` and `jane@x.com` are the same, and test it; lowercasing emails is the usual choice)
- invalid email gives 422; a 7-character password gives 422; a 73-byte password gives 422
- sending `"role": "ADMIN"` in the request still creates a `USER`

**Hints:**
- `UserRepository`: `get_by_email`, `get_by_id`, `add` (add, then `commit` and `refresh`).
- The service raises `EmailAlreadyRegisteredError`; `main.py` already maps it to 409.
- Two simultaneous registrations can both pass the "does it exist" check. Also catch `IntegrityError` from the unique index and turn it into the same 409.
- The `client` fixture uses the savepoint-based session, so `commit()` inside your repository works in tests.

### Phase 4. Login [TDD]
**First RED:** a valid login returns 200 with a token. **Expected failure:** `assert 501 == 200`.
**Tests** (`tests/integration/test_login.py`): success returns `access_token`, `token_type: "bearer"` and the user; wrong password gives 401; unknown email gives 401 **with the identical message** (no account enumeration); the token decodes to the right `sub` and `role`.

**Hint:** raise `InvalidCredentialsError` for both failure cases (already mapped to 401). After this phase add fixtures to `conftest.py` that every later test will use:
```python
@pytest.fixture()
def make_user(db_session): ...                 # creates a user directly through UserRepository
@pytest.fixture()
def auth_headers(make_user): ...               # {"Authorization": "Bearer <token>"} for a USER
@pytest.fixture()
def admin_headers(make_user): ...              # same for an ADMIN (create the admin via the repository, since the API can't)
```

### Phase 5. Current user and admin guard [TDD]
**First RED:** no credentials gives 401. **Expected failure:** `NotImplementedError` from `get_current_user`.
**Files:** `api/deps.py` (`get_current_user`, `require_admin`).

**Tests** (call the functions directly with a fake `HTTPAuthorizationCredentials` and `db_session`, so you do not depend on later routes): no credentials gives 401; malformed token gives 401; expired gives 401; valid token returns the right user; token for a deleted user gives 401; `require_admin` gives 403 for a USER and passes an ADMIN.

**Hints:**
- Declare `credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)`. The scheme is already created with `auto_error=False` so **you** return a consistent 401.
- Add the header `WWW-Authenticate: Bearer` to 401 responses.
- Load the user from the database on every request and use **their stored role**, not the token's claim. A demoted admin then loses access immediately.

### Phase 6. Create vehicle [TDD]
**First RED:** an anonymous create gives 401. **Expected failure:** `assert 501 == 401`. **Born green:** an invalid body (for example price 0) already gives 422.
**Files:** `repositories/vehicle_repository.py`, `services/vehicle_service.py`, `routes/vehicles.py`.

**Tests** (`tests/integration/test_vehicle_create.py`): admin gets 201 and the response price is a **number**; USER gets 403; anonymous gets 401; invalid body (price 0, negative quantity, bad category, empty make) gives 422; the row is stored with `price_cents` (check `2799999`).

**Hints:** `Depends(require_admin)` on the route; the service converts `price` to cents with `to_cents`; build the response with `VehicleRead.from_model(vehicle)` (already written).

### Phase 7. List, update, delete [TDD]
**First RED:** a list without a token gives 401. **Expected failure:** `assert 501 == 401`.
**Tests:** list includes vehicles with `quantity` 0; list needs a token (401 without); update changes **only the fields sent** (partial update); update of a missing id gives 404; delete as admin gives 204; delete as USER gives 403; delete of a missing id gives 404; **deleting a vehicle keeps its purchases** (`vehicle_id` becomes `NULL`).

**Hint for partial updates:** `data.model_dump(exclude_unset=True)`, so an omitted field is not overwritten with `None`.

### Phase 8. Search [TDD]
**First RED:** filtering by make returns only that make. **Expected failure:** `assert 501 == 200`. The `min > max` and bad-category tests are also RED today (`assert 501 == 422`), because the stub route takes plain parameters; the query-model hint below turns them green.
**Tests:** each filter alone (make, model, category, min price, max price); several filters combined with AND; `make=toy` matches `Toyota` (case-insensitive partial); prices are **inclusive** at both ends; empty result gives `200` and `[]`; `min_price > max_price` gives 422; a bad category gives 422.

**Hints (verified):**
- Use the Pydantic model as the query parameters so invalid input becomes a **422, not a 500**:
  ```python
  from typing import Annotated
  from fastapi import Query
  def search_vehicles(params: Annotated[VehicleSearchCriteria, Query()], ...): ...
  ```
- `Vehicle.make.ilike(f"%{escaped}%", escape="\\")`. Escape `%` and `_` in the user's text, or a search for `100%` matches everything.
- Declare `/search` **before** `/{vehicle_id}` (already done in the skeleton). If you reorder routes, `search` would be read as an id.
- Compare prices in cents: `Vehicle.price_cents >= to_cents(min_price)`.

### Phase 9. Purchase (the most important phase) [TDD]
**First RED:** a purchase without a token gives 401. **Expected failure:** `assert 501 == 401`. **Born green:** quantity 0 already gives 422.
**Files:** `repositories/vehicle_repository.py` (`decrement_stock`), `repositories/purchase_repository.py`, `services/inventory_service.py`, the purchase route.

**Tests** (`tests/integration/test_purchase.py`): success returns the updated vehicle with `quantity - 1`; a purchase row is written with the **price at that moment**; buying the last unit works and then the next attempt gives 409; asking for more than the stock gives 409 and leaves the stock unchanged; quantity 0 gives 422; unknown id gives 404; anonymous gives 401; **stock never goes negative**; if the vehicle price is changed afterwards, the old purchase row keeps the old price.

**The atomic update (verified on PostgreSQL: with 2 in stock, two purchases succeed, then both a purchase at zero and one for more than the stock affect no rows, and the final quantity is 0):**
```python
result = db.execute(
    update(Vehicle)
    .where(Vehicle.id == vehicle_id, Vehicle.quantity >= quantity)
    .values(quantity=Vehicle.quantity - quantity)
)
if result.rowcount == 0:
    ...   # either the vehicle does not exist (404) or there is not enough stock (409): load it to tell which
```
Why this and not "read, check, write": two customers buying the last car at the same time would both pass the check. The `WHERE quantity >= :q` and the update happen in one statement, and PostgreSQL's row lock serialises them.

**Do the stock change and the `purchases` insert in the same transaction**, so you never have a sale without a record, or a record without a sale.

**Stretch test (great for the interview):** buy the last unit from two threads or two sessions at once, and assert exactly one succeeds.

### Phase 10. Restock [TDD]
**First RED:** a restock without a token gives 401. **Expected failure:** `assert 501 == 401`. **Born green:** quantity 0 already gives 422.
**Tests:** admin adds stock and the new quantity is returned; USER gets 403; anonymous gets 401; quantity 0 or negative gives 422; unknown id gives 404. Reuse `increment_stock`.

### Phase 11. Seed script [TDD]
**First RED:** the seed creates the admin account. **Expected failure:** `NotImplementedError` from `main()`.
**File:** `app/scripts/seed.py`. **Tests** (`tests/unit/test_seed.py`): it creates the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD`; it creates sample vehicles; **running it twice does not duplicate anything** (idempotent). Include at least one out-of-stock vehicle and one with quantity 1 so the UI states are visible. Run it for real with `python -m app.scripts.seed`.

Then re-enable it in `backend/Dockerfile` (the TODO comment shows where) so Docker starts with data.

### Phase 12. Coverage and the report [CHECK, then TDD for any gap]
Read the coverage table. For any untested line worth covering, write the failing test first; if it passes straight away it is a guard test, and if it fails you have found a bug (`[FIX = TEST FIRST]`).
Run `pytest` and look at the coverage table. The target is **90% or more**. `backend/reports/test-report.html` and `backend/reports/coverage/` are written for you. Paste the final summary into the README under "Tests".

---

## Part D. Connect the frontend to the real backend [CHECK, and bugs are FIX = TEST FIRST]

1. Start the database, then the backend (`uvicorn ...`), then `npm run dev`.
2. Check `frontend/.env`: `VITE_API_BASE_URL=http://localhost:8000`.
3. If the browser console shows a CORS error, add your frontend address to `CORS_ORIGINS` in `backend/.env` (it is a JSON list, for example `["http://localhost:5173"]`) and restart the backend.

**Manual test script** (tick each one):

| # | Do this | Expect |
|---|---|---|
| 1 | Open `/` while signed out | Redirect to Sign in |
| 2 | Register a new account | Lands on the dashboard, header shows the email and a **User** badge |
| 3 | Refresh the page | Still signed in |
| 4 | Try `/admin` | Sent back to the dashboard; no "Manage inventory" link |
| 5 | Search by make, then by category and a price range | Only matching cars; Reset restores all |
| 6 | Search for nonsense | Empty state with a working Reset button |
| 7 | Hover a car, drag it, then move away | It slides in, rotates, then parks again |
| 8 | Purchase a car with 1 left | Success toast; the badge becomes **Out of stock**; the button turns to **Unavailable** |
| 9 | Log out, sign in as the seeded admin | **Admin** badge and the "Manage inventory" link |
| 10 | Admin: add a vehicle | It appears in the table and on the dashboard |
| 11 | Admin: edit, restock, delete (cancel first, then confirm) | Each updates the list; stock totals change |
| 12 | Stop the backend, reload the dashboard | Error banner with **Try again** |
| 13 | Shrink the window to phone width | Navbar fits; admin shows cards |
| 14 | Tab through a page with the keyboard | Focus ring always visible; the 3D card opens with Enter |

Any mismatch (a field name, a status code, a message) is a **bug in either side**. Check `docs/API_CONTRACT.md` to decide which side is wrong, fix it with a test first, and commit.

Then **retake the screenshots** and overwrite the files in `docs/screenshots/` (`login`, `dashboard`, `admin`, `card-3d-states`, `admin-modals`, `mobile`). The current ones came from mocked data.

---

## Part E. Documentation and final checks [NOT TDD]

**README must contain** (the skeleton already has the headings):
- [ ] What the app does, in 3 sentences
- [ ] Tech stack
- [ ] Setup steps that work on a clean machine (try them, see below)
- [ ] The seeded admin email and password
- [ ] Screenshots from the **real** app
- [ ] The test report: paste the `pytest` summary with coverage, and the frontend `npm test` summary
- [ ] **My AI Usage**: the tools (Claude, Google Stitch, plus any others), how you used them (planning, skeleton, frontend, debugging), what you changed or rejected, and what you learned. Be honest and specific.
- [ ] Credits (fonts, hero photo, any 3D models and their licences)

**PROMPTS.md:** paste your raw, unedited chat logs or public share links. Do not summarise them.

**Commits:** AI-assisted ones carry the `Co-authored-by` trailer (Part A3).

**Final checks:**
```bash
git log --oneline            # tests and features alternate; messages are clear
git grep -n "SECRET_KEY=" -- . ':!*.example'     # should print nothing
git log --all --oneline -- .env backend/.env frontend/.env   # should print nothing: no .env was ever committed
```
The demo admin password (`Admin@12345`) is a documented default in `config.py` and the README, which is fine for a kata. In any real deployment, set your own `ADMIN_PASSWORD` and `SECRET_KEY` as environment variables.
**Clean-clone test (do not skip):** clone your repo into a new folder and follow your own README from the first line. Anything that fails there would fail for the reviewer too.

**Definition of done:** run `/final-check` for the full checklist. Both CI jobs are green, and backend coverage is 90% or more.

---

## Part F. Optional extras (only after everything above is done) [NOT TDD]

**Dependency security.** `npm audit --omit=dev` reports **0 vulnerabilities** in what ships to browsers (zod 4, React Router 7 and @hookform/resolvers 5 were upgraded for this). The `npm audit` warnings that remain are in dev tooling only (Vite, Vitest, the Tailwind build chain) and need major upgrades. They only matter if you expose your dev server or `vitest --ui` to a network, so don't. Upgrading Vite, Vitest and Tailwind later is optional. Run `npm audit` again right before you submit.

**Real 3D models.** Add one `.glb` per category under `frontend/public/models/` (see the credits and licence note), pass `modelUrl` to `VehicleCard3D`, and credit the authors in the README. Keep each file under about 2 MB.

**Deployment** (a bonus):
- **Database:** a managed PostgreSQL (Neon, Supabase, or the host's own). Hosts usually give a URL starting with `postgresql://`. **Change it to `postgresql+psycopg://`** or SQLAlchemy will look for the wrong driver.
- **Backend:** Render, Fly.io or Railway from `backend/Dockerfile`. Set `DATABASE_URL`, `SECRET_KEY` and `CORS_ORIGINS` (a JSON list containing your frontend's URL). Run `alembic upgrade head` on deploy, then the seed.
- **Frontend:** Vercel or Netlify with `VITE_API_BASE_URL` set to the backend URL. Single-page apps need a rewrite to `index.html`, otherwise refreshing `/admin` gives a 404. On Vercel add `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`.
- Free tiers sleep when idle, so the first request can be slow. Mention that in the README.

---

## Part G. Interview preparation [NOT TDD]

You should be able to answer these by pointing at your own code:

1. **How do you stop two customers buying the last car?** The conditional `UPDATE ... WHERE quantity >= :q` and the row lock (Phase 9).
2. **Why store money as integer cents?** No floating-point errors; `to_cents` and `from_cents` are tested.
3. **Why 409 for out of stock, and 401 versus 403?** 409 is a conflict with the current state; 401 means "who are you?", 403 means "I know you, but no".
4. **How is admin access enforced?** In the API with `require_admin` (the real security) and in the UI with route guards (convenience only). The role comes from the database, not the token.
5. **Why a service and a repository layer?** Single responsibility and dependency inversion: routes talk HTTP, services hold rules, repositories hold queries. Services can be tested without HTTP.
6. **How do your tests stay isolated?** A separate test database; each test runs in a transaction that is rolled back.
7. **Why PostgreSQL?** Real concurrency control, native enums, and easy managed hosting.
8. **How does the 3D card stay fast?** Lazy-loaded (about 250 kB gzipped, only on first hover), a single canvas only while a card is engaged, and a plain image the rest of the time.
9. **What did AI do, and what did you change?** Be specific (skeleton, tests, review), and name at least one thing you corrected.
10. **What would you improve next?** For example pagination, refresh tokens, rate limiting on login, real car models, an audit page for purchases.

---

## Quick command reference

| Task | Command |
|---|---|
| Start DB | `docker compose up -d db` |
| Backend tests | `cd backend && pytest` |
| Backend lint | `cd backend && ruff check .` |
| Run API | `cd backend && uvicorn app.main:app --reload` |
| Migrate | `cd backend && alembic upgrade head` |
| Seed | `cd backend && python -m app.scripts.seed` |
| Frontend tests | `cd frontend && npm test` |
| Frontend type-check | `cd frontend && npm run typecheck` |
| Run UI | `cd frontend && npm run dev` |
| Everything in Docker | `docker compose up --build` |
