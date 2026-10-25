# Car Dealership Inventory System

A graded coding kata: a full-stack car-dealership inventory app built with strict TDD, under rules about AI usage.
Backend: Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 16, JWT (HS256), bcrypt.
Frontend: React 18, TypeScript, Vite, Tailwind, TanStack Query, React Hook Form + Zod, Vitest + Testing Library + MSW.

## How to work with me
- The developer must understand and be able to explain every line in an interview. Work in small steps, pair-programming style. Never build a whole phase at once unless I ask.
- For each test or change, say in 1 to 3 plain sentences what it does and why. Keep replies short. No emojis.
- Before editing more than one file, or doing anything hard to undo, say what you are about to do and wait.
- Prefer the slash commands in `.claude/commands/` (`/status`, `/phase`, `/red`, `/green`, `/refactor`, `/commit-ai`, `/final-check`).
- Docs, read on demand (not every session): `docs/NEXT_STEPS.md` (phase test lists and verified hints), `docs/API_CONTRACT.md`, `docs/ER_DIAGRAM.md`, `docs/HANDOFF.md`.

## State at handoff (volatile: run /status for the truth)
- Backend is complete (all 11 TDD phases, 141 tests, ruff clean). Migrations 0001 and 0002 (prices are BIGINT paise so crore-level prices fit). The seed creates the admin and 14 vehicles with photos.
- Frontend is the IGNITION design (branch `redesign-ignition`; `main` still has the older Showroom UI): Home, The Floor, vehicle manifest, cart, watchlist, compare, purchase history, The Ledger. 204 tests.
- Next work: review and merge the redesign branch, then the README "My AI Usage" in the developer's own words, `PROMPTS.md`, final checks.

## Commands
`python` below means the project's virtual-environment Python: `backend/.venv/bin/python` (macOS, Linux, WSL) or `backend\.venv\Scripts\python.exe` (Windows). Never activate the venv inside a command.

| Task | Command (working directory) |
|---|---|
| Start PostgreSQL | `docker compose up -d db` (repo root) |
| Create `.env` files + SECRET_KEY | `python -m app.scripts.setup_env` (backend) |
| Environment health check | `python -m app.scripts.doctor` (backend) |
| Create/upgrade tables | `python -m alembic upgrade head` (backend) |
| Backend tests (+ coverage report) | `python -m pytest -q` (backend) |
| One test / last failures | `python -m pytest path::test_name -q`, `python -m pytest --lf -q` |
| Backend lint | `python -m ruff check .` (backend) |
| API dev server | `python -m uvicorn app.main:app --reload` (backend) |
| Frontend install | `npm ci` (frontend; use `ci`, not `install`) |
| Frontend tests / types / build | `npm test`, `npm run typecheck`, `npm run build` (frontend) |
| Frontend dev server | `npm run dev` (frontend) |

## TDD rules (the heart of the kata)
Every new behaviour is Red, then Green, then Refactor, in separate commits: `test:` first, then `feat:`, then `refactor:`.
1. RED: write ONE test for ONE behaviour, run it, and confirm it fails because the behaviour is missing (`assert 501 == 201`, `NotImplementedError`, or an assertion about the missing behaviour). An ImportError, missing fixture or typo is not a real RED: fix the test first.
2. GREEN: write the least code that passes, nothing more. Run the whole suite and ruff.
3. REFACTOR: only while everything is green, and never edit tests while refactoring.
4. Never weaken or delete a test to get green. Never write production code before a failing test needs it. One failing test at a time.
5. A bug found later is `[FIX = TEST FIRST]`: write a failing test that reproduces it, then fix it (`test:` then `fix:`).
6. Tests that already pass on their first run are "born green" (the schemas enforce them): keep them as guard tests (`test: guard ...`), they do not count as a RED. At handoff these are: invalid email / short password / 73-byte password on register (422), price 0 on create (422), quantity 0 on purchase and restock (422).
7. Setup, config, docs and git housekeeping are not TDD. Wiring (adding `Depends(...)`, registering a router) is driven by the endpoint tests of that phase.
8. Do not push while a test is red.

## Backend phases (first RED and expected failure on the skeleton)
| Phase | First RED | Expected failure | Implement |
|---|---|---|---|
| 1 Money | `to_cents(Decimal("27999.99")) == 2799999` | `NotImplementedError` | `app/core/money.py` |
| 2 Security | hash differs from plain password | `NotImplementedError` | `app/core/security.py` |
| 3 Register | valid registration returns 201 | `assert 501 == 201` | `repositories/user_repository.py`, `services/auth_service.py`, `api/routes/auth.py` |
| 4 Login | valid login returns 200 + token + user | `assert 501 == 200` | same files |
| 5 Current user | no credentials gives 401 | `NotImplementedError` from `get_current_user` | `api/deps.py` |
| 6 Create vehicle | anonymous create gives 401 | `assert 501 == 401` | `repositories/vehicle_repository.py`, `services/vehicle_service.py`, `api/routes/vehicles.py` |
| 7 List/update/delete | list without token gives 401 | `assert 501 == 401` | same files |
| 8 Search | filter by make returns only that make | `assert 501 == 200` | same files |
| 9 Purchase | purchase without token gives 401 | `assert 501 == 401` | `services/inventory_service.py`, `repositories/purchase_repository.py` |
| 10 Restock | restock without token gives 401 | `assert 501 == 401` | `services/inventory_service.py` |
| 11 Seed | seed creates the admin | `NotImplementedError` from `main()` | `app/scripts/seed.py` |
Full test lists and hints per phase: `docs/NEXT_STEPS.md` Part C. Target: at least 90% backend coverage.

## Commits and git
- Small commits. Subject in imperative mood with a type prefix: `test:`, `feat:`, `refactor:`, `fix:`, `docs:`, `chore:`, `ci:`. Template: `.gitmessage` (set `git config commit.template .gitmessage` once per clone).
- Every commit you help with ends with exactly ONE trailer, as the last paragraph after a blank line: `Co-authored-by: Claude <noreply@anthropic.com>`. Use separate `-m` paragraphs (subject, one honest sentence on how AI helped, trailer). Claude Code may add its own attribution line: after each commit check `git log -1 --format=%B | git interpret-trailers --parse` and make sure there is exactly one Co-authored-by line for Claude, not two.
- Use `/commit-ai`. Stage named files only (never `git add -A`). Never commit `.env`, `backend/reports/coverage/`, `node_modules`, `dist`.
- Never push without asking. Never force-push, `git reset --hard`, `git clean`, or rewrite history unless I explicitly ask.

## Safety
- Never read, print or paste `.env` files or secrets. Create them with `python -m app.scripts.setup_env`.
- `TEST_DATABASE_URL` must point at a database whose name ends in `_test`: the tests DROP every table in it (a guard in `backend/tests/conftest.py` refuses otherwise). Never weaken that guard.
- No destructive commands without my approval: `docker compose down -v`, `DROP DATABASE`, `rm -rf`, `alembic downgrade`.
- `docs/PROJECT_PLAN.md` may be deliberately git-ignored (private). Do not un-ignore or commit it unless I ask.

## Design decisions (do not change without asking)
- All `/api/vehicles/**` need a token. `GET /api/vehicles` includes zero-stock vehicles (the UI shows a disabled Purchase). Create/update/delete/restock are admin-only (403 for users, 401 anonymous). Registration always creates a USER; the admin comes from the seed script. Login response includes the `user` (id, email, role).
- Money is integer cents in the database and a decimal in the API; the API sends `price` as a JSON number (schema `Money` serializer), never a string.
- Purchase: optional `quantity` (default 1), 409 when stock is too low, 404 unknown id, writes a `purchases` row with the price at that moment. It must be one atomic `UPDATE vehicles SET quantity = quantity - :q WHERE id = :id AND quantity >= :q` (check `rowcount`), in the same transaction as the purchase row.
- Delete is a hard delete; `purchases.vehicle_id` becomes NULL (`ON DELETE SET NULL`). IDs are auto-increment integers. Categories are the fixed enum SEDAN, SUV, HATCHBACK, COUPE, CONVERTIBLE, TRUCK, VAN. One access token, 60 minutes, no refresh. No pagination.
- Architecture: routes are thin (HTTP only), services hold business rules and raise domain errors (`app/core/exceptions.py`, mapped to HTTP in `app/main.py`), repositories hold queries. Services never import FastAPI.

## Gotchas already found (verified)
- bcrypt 5 raises for passwords over 72 BYTES: `verify_password` must return False (not raise) for them; the register schema rejects them with 422.
- PyJWT requires `sub` to be a string (`str(user.id)`). Always pass `algorithms=[...]` to `jwt.decode`. Load the user from the database and use their stored role, not the token's claim.
- `get_current_user`: the bearer scheme is created with `auto_error=False`, so return the 401 yourself (with `WWW-Authenticate: Bearer`).
- Search params must be a Pydantic model used as query parameters (`Annotated[VehicleSearchCriteria, Query()]`) so `min_price > max_price` and a bad category give 422, not 500. Declare `/search` before `/{vehicle_id}`. Escape `%` and `_` in `ilike`.
- Registration race: also catch `IntegrityError` on the unique email index and return the same 409. Treat emails case-insensitively (lowercase).
- Alembic: native PostgreSQL enums outlive their tables, so the downgrade drops `role` and `vehiclecategory` explicitly.
- Backend tests use real PostgreSQL; each test runs in a rolled-back transaction (fixtures `client`, `db_session` in `backend/tests/conftest.py`).
- Frontend tests use MSW (`onUnhandledRequest: "error"`) and `mockInventoryApi()` in `frontend/src/test/api.ts`, a stateful stand-in for the inventory API. Under fake timers use `vi.useFakeTimers({ shouldAdvanceTime: true })` or Testing Library hangs. `userEvent.setup()` replaces `navigator.clipboard`, so spy on it after setup.
- Outlined text (`-webkit-text-stroke`) needs `paint-order: stroke fill` and a static (not variable) font, or overlapping glyph contours show as stray lines. Syne is the static `@fontsource/syne`.
- API errors are plain words (`{"detail": "Out of stock"}`), set per class in `backend/app/core/exceptions.py`. The frontend shows `detail` to people, so never let a class name through.

## Frontend conventions
- Pages in `src/pages`, components under `src/components/{ui,layout,vehicles,cart,admin}`, API modules in `src/api`, shared inventory query `useInventory` in `src/hooks/useVehicles.ts` (one list feeds every screen), pure rules in `src/lib` (money, browse, cart, compare, csv), the demo layer in `src/data`.
- Look: square corners, hairline borders, no shadows or glass, orange `#FF4A1C` as the single accent, lime only for healthy stock. Tokens are in `tailwind.config.js` (muted text opacities chosen for WCAG AA). Keep text at 12 px or more, every input labelled, every icon-only button with an `aria-label`, visible focus ring, reduced-motion respected.
- Money is integer paise in the browser (`src/lib/money.ts`), shown with Indian grouping. Newest = `created_at`, never the model year. Low stock is 2 units or fewer.
- Real vs demo: vehicles, auth, purchases and restocks come from the API. Cart, watchlist, compare, recent, purchase history, stock movements and admin home-page choices are a labelled demo layer in localStorage (`src/data/stores.ts`). Never present them as server data, and never invent specs, VINs or inspection claims: show "Not provided".

## Deliverables still to produce (kata)
Public repo, README (what it does, setup, real screenshots, My AI Usage in the developer's own words, test report), `PROMPTS.md` with raw unedited chat logs (export with `/export`), AI co-author trailer on AI-assisted commits, green CI, optional live link. Run `/final-check`.
