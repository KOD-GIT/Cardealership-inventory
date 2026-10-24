# Complete build guide: from zero to submission

This is the master guide. It follows your kata document line by line and covers the steps that were missing from the earlier guides. Two other documents go deeper on specific parts:
- [`SETUP_GUIDE.md`](SETUP_GUIDE.md): **installing and configuring every tool**, including PostgreSQL with and without Docker (Stage 1 and 4 use it)
- [`ANTIGRAVITY_SETUP.md`](ANTIGRAVITY_SETUP.md): a runbook you hand to the **Antigravity agent** so it does the whole setup for you (Stage 4 can be done this way)
- [`NEXT_STEPS.md`](NEXT_STEPS.md): the backend phases in detail, with verified code hints (Stage 5 summarises it)
- [`PROJECT_PLAN.md`](PROJECT_PLAN.md): the decisions behind the design

**Every step in this guide is tagged** `[TDD]`, `[FIX = TEST FIRST]`, `[NOT TDD]` or `[CHECK]`. Only the first two start with a failing test. The **TDD map** below shows all of them in one table.

## 0. What was missing (read this first)

I re-read the kata and checked the project against it. The code covers the technical requirements. The gaps were in the **process and deliverables**, which the kata grades too:

| # | Gap | Kata rule it affects | Fixed in |
|---|---|---|---|
| 1 | The first guide said "make one commit" for the whole skeleton | "Commit frequently… narrate your development journey" | Stage 3: 11 logical commits (commands tested) |
| 2 | The frontend was generated in bulk, so it has **no Red-Green history** | "Write tests before implementing functionality" | Stage 6: build one frontend feature test-first yourself |
| 3 | Nothing was capturing your raw AI chat logs | Root `PROMPTS.md` with raw, unedited logs or public links | Stage 1: capture from day one |
| 4 | The co-author trailer format was shaky: git collapses "two empty lines" into one | "Add two empty lines, followed by the co-author trailer" | Stage 3.4: verified commands |
| 5 | Nobody said the repository must be **public** and checked while logged out | "A public Git repository link" | Stages 1 and 9 |
| 6 | The **test report** was only a command to run | "A test report showing the results of your test suite" | Stage 8 |
| 7 | "My AI Usage" was a blank template | Must describe tools, how you used them, your reflection | Stage 8: guidance on what to write, in your own words |
| 8 | No step makes you **understand the code** you will submit | Interview discussion; "we want to see your work" | Stage 2: project tour and explain-back |
| 9 | Screenshots came from mocked data | "Screenshots of your final application in action" | Stage 7 |
| 10 | CI was never confirmed green | Quality signal reviewers see on GitHub | Stages 3 and 9 |
| 11 | The guides assumed PostgreSQL, Docker, Python, Node and GitHub login were already set up | You cannot start without them | [`SETUP_GUIDE.md`](SETUP_GUIDE.md), plus a `doctor` command that checks it all |
| 12 | Pointing `TEST_DATABASE_URL` at your real database would let one `pytest` run wipe it | Protects your data while you work | A guard that refuses to run, tested; the doctor flags it too |
| 13 | Nothing said **which steps are TDD** and which are not, and some tests you would write cannot show a Red because they already pass | "Write tests before implementing functionality" | The TDD map and Stage 5 (tags, expected failures, "born green" tests) |

## 1. The kata, mapped to this project

| Kata requirement | Where it lives | Status |
|---|---|---|
| Backend in Python/FastAPI | `backend/` | Skeleton done; **you build the logic** (Stage 5) |
| Real database (not in-memory) | PostgreSQL, schema and migration | Done |
| Register and login with JWT | Phases 2 to 5 | You build |
| `POST/GET/PUT/DELETE /api/vehicles`, `GET /api/vehicles/search` | Phases 6 to 8 | You build |
| `POST /api/vehicles/:id/purchase` and `/restock` | Phases 9 and 10 | You build |
| Vehicle has unique ID, make, model, category, price, quantity | `models/vehicle.py` | Done |
| Frontend with HTML5, CSS3, Tailwind, React | `frontend/` | Done |
| Register and login forms, dashboard, search and filter | `pages/`, `components/vehicles/` | Done |
| Purchase button disabled at zero quantity | `VehicleCard.tsx` | Done (tested) |
| Admin UI to add, update, delete | `components/admin/` | Done |
| Responsive, visually appealing | Verified at 1440 px and 390 px | Done (retake screenshots, Stage 7) |
| TDD with Red-Green-Refactor history | Backend phases, plus your Stage 6 feature | **You do it** |
| Clean code, SOLID, comments | Layers: routes, services, repositories | Structure done; keep it up |
| Git with frequent descriptive commits | Stage 3 onward | **You do it** |
| AI co-author on every AI-assisted commit | Stage 3.4 | **You do it** |
| README: explanation, setup, screenshots, My AI Usage, test report | Stage 8 | **You write it** |
| `PROMPTS.md` with raw logs | Stage 1 and Stage 8 | **You collect them** |
| Public repo link | Stage 1 and Stage 9 | **You do it** |
| Optional: live deployment | Stage 10 | Optional |

## TDD map: which steps are test-first

Every step carries one of four tags. **Only `[TDD]` and `[FIX = TEST FIRST]` steps start with a failing test.** Setup, configuration, documentation and checking are not test-first, because there is nothing to test yet or no new behaviour to drive.

| Tag | Meaning | Commit pattern |
|---|---|---|
| **[TDD]** | New behaviour: write failing tests first, then the code, then clean up | `test:` (RED), then `feat:` (GREEN), then `refactor:` |
| **[FIX = TEST FIRST]** | You found a bug: write a test that reproduces it, watch it fail, then fix it | `test:` then `fix:` |
| **[NOT TDD]** | Setup, config, git housekeeping, documentation, deliverables | `chore:`, `docs:`, `ci:` |
| **[CHECK]** | Run something and compare with the expected result; no new code | none |

| Where | Tag | The first thing you do |
|---|---|---|
| Stage 1: accounts, tools, logging habit | NOT TDD | Install and configure |
| Stage 2: project tour | NOT TDD | Read, then explain back |
| Stage 3.2: the 11 import commits | NOT TDD | Import the AI-generated skeleton, with honest messages |
| Stage 3.3: push and CI | CHECK | Confirm CI is green |
| Stage 4: run what exists | CHECK | Confirm the baseline (40 backend and 72 frontend tests pass) |
| **Stage 5, phases 1 to 11: the backend** | **TDD** | **Write a failing test** |
| Stage 5, phase 12: coverage and report | CHECK, then TDD | Read the report; write a test first for any gap worth closing |
| **Stage 6: one frontend feature** | **TDD** | **Write a failing component test** |
| Stage 7: connect and QA | CHECK + FIX = TEST FIRST | Run the checklist; every bug becomes a failing test before the fix |
| Stage 7: CORS setting, screenshots | NOT TDD | Configure, then capture |
| Stage 8: README, logs, test report | NOT TDD | Write |
| Stage 9: final verification | CHECK | Run the checks |
| Stage 10: deployment, 3D models | NOT TDD | Configure, add assets (a *new feature* here would be TDD) |
| Stage 11: interview preparation | NOT TDD | Prepare |

**Inside the backend, not every edit gets its own test first:**
- **Wiring** (adding `Depends(...)` to a route, registering a router) is driven by the endpoint tests of that phase, so it has no separate test.
- **Schema changes** (a new column or constraint): write the test that needs it first (RED), then change the model and create the migration (GREEN), then run `alembic upgrade head` and `alembic downgrade base` yourself `[CHECK]`.
- **Dependencies, configuration, docstrings, comments:** `[NOT TDD]`.
- **Refactoring** is only allowed while everything is green, and you do not edit the tests while you do it.

---

## Time budget (estimates, not measurements)

| Stage | What | Rough time |
|---|---|---|
| 1 | Accounts, tools (install PostgreSQL, Docker and the rest), logging habit | 1 to 2 h |
| 2 | Understand the project | 1.5 h |
| 3 | Git history and CI | 45 min |
| 4 | Run what exists | 30 min |
| 5 | Backend with TDD | 8 to 10 h |
| 6 | One frontend feature, test-first | 1 h |
| 7 | Integration and QA | 1.5 h |
| 8 | Deliverables | 1.5 h |
| 9 | Final verification | 30 min |

---

## Stage 1. Accounts, tools and one habit [NOT TDD]

### 1.1 Install and check versions
**Step-by-step installs for every tool (Git, GitHub login, Python, Node, Docker, PostgreSQL with and without Docker, your `.env` files, editor, troubleshooting) are in [`SETUP_GUIDE.md`](SETUP_GUIDE.md).** Do that first, then come back. The quick version check:
```bash
git --version          # any recent version
python --version       # 3.12 recommended (CI uses it; 3.11 should also work, but it is untested)
node --version         # 20 or newer
docker --version       # Docker Desktop, running
```

### 1.2 Create a PUBLIC GitHub repository
Create it on GitHub as **public**, **empty** (do not tick "add a README", ".gitignore" or a licence: the project already has files and a first push would conflict). A licence is optional; add one later if you want to.

### 1.3 Start the prompt log now (the habit that saves you later)
The kata wants **raw, unedited** chat logs or public chat links in a root `PROMPTS.md`, with **no AI-generated summaries**. Reconstructing them at the end is painful, so collect them as you go:
- After every AI session, paste the full transcript into `PROMPTS.md` under a dated heading (`## 2025-xx-xx: Backend phase 3`). Do not edit or tidy it.
- Many chat apps have a "share" option that makes a public link to the conversation. If yours does, you can paste that link instead (or as well). Check what the link exposes before you share it.
- **This whole conversation counts**: it is where the plan, the skeleton and the frontend came from. Save it too.
- Do the same for every Stitch session: your prompts and its replies.
- The generated file `docs/design/stitch_prompts.md` is a prompt *pack* written for you. It is not a log, so keep it in `docs/`, not in `PROMPTS.md`.

### 1.4 Keep a list of AI tools
Write down every tool you touch (an assistant for planning and code, Stitch for design, an editor assistant if you use one). You need this list for "My AI Usage".

---

## Stage 2. Understand what you have [NOT TDD]

The skeleton was generated with AI. **You are responsible for it**, and you will be asked about it. Unzip the project and take the tour.

### 2.1 What each part is

| Path | What it is | You should know |
|---|---|---|
| `docs/` | Plan, API contract, ER diagram, design review, guides | The decisions D1 to D18 and why |
| `backend/app/models/` | SQLAlchemy tables: users, vehicles, purchases | Why money is stored as cents |
| `backend/app/schemas/` | Pydantic request and response shapes | Validation rules, price as a JSON number |
| `backend/app/api/routes/` | HTTP layer only | Routes stay thin |
| `backend/app/services/` | Business rules (your Stage 5 work) | Where the rules live and why |
| `backend/app/repositories/` | Database queries (your Stage 5 work) | Why queries are separate from rules |
| `backend/app/core/` | Config, security helpers, money helpers, errors | The stubs you implement |
| `backend/tests/` | Fixtures and the first tests | `client` and `db_session` fixtures |
| `backend/alembic/` | Database migration | How tables get created |
| `frontend/src/api/`, `context/`, `hooks/` | API client with JWT, auth state, data fetching | How a login becomes an authorised request |
| `frontend/src/components/` | UI: `ui/`, `layout/`, `vehicles/`, `admin/`, `vehicle3d/` | One component per job |
| `frontend/src/pages/` | Login, Register, Dashboard, Admin | Page-level flow |
| `.github/workflows/ci.yml` | CI for both halves | What runs on every push |

### 2.2 Reading order (about an hour)
1. `docs/PROJECT_PLAN.md`, then `docs/API_CONTRACT.md`.
2. `backend/app/models/*.py`, then `schemas/*.py`, then `api/routes/vehicles.py`, then the service and repository stubs.
3. `frontend/src/api/client.ts`, `context/AuthContext.tsx`, `hooks/useVehicles.ts`.
4. `pages/DashboardPage.tsx`, `components/vehicles/VehicleCard.tsx`, `components/vehicle3d/VehicleCard3D.tsx`.

### 2.3 Explain-back exercise (do not skip)
In a private notes file, write **one sentence in your own words** for each of these. If you cannot, read the file again until you can:
- Why does the database store cents but the API show decimals?
- What stops two people buying the last car at once? (You will write this in Stage 5; read the plan now.)
- How does a logged-in user's token reach the server, and what happens on a 401?
- Why is the 3D canvas created only while a card is hovered?
- What is the difference between a route, a service and a repository?

---

## Stage 3. Git history and CI [NOT TDD]

### 3.1 Initialise
```bash
cd car-dealership-inventory
git init -b main
git config commit.template .gitmessage
```

### 3.2 Make 11 logical commits (tested)
These commands were run on a clean copy: **every file ends up committed, and every commit carries the trailer.** Run them from the project root, in this order. They work in Git Bash, macOS and Linux terminals, and PowerShell (each is one line).

```bash
git add .gitignore .gitmessage
git commit -m "chore: add repository config" -m "Gitignore and the commit-message template (type prefixes and AI co-author trailer). Generated with AI assistance, reviewed by me." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add docs/PROJECT_PLAN.md docs/API_CONTRACT.md docs/ER_DIAGRAM.md docs/ER_DIAGRAM.svg docs/ER_DIAGRAM.png docs/DESIGN_REVIEW.md docs/NEXT_STEPS.md docs/BUILD_GUIDE.md docs/SETUP_GUIDE.md docs/ANTIGRAVITY_SETUP.md docs/design
git commit -m "docs: add project plan, API contract and ER diagram" -m "Requirements decisions (D1-D18), endpoint contract and permission matrix, PostgreSQL schema diagram. Drafted with AI, then reviewed against the kata." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add backend/app/models backend/app/db backend/alembic backend/alembic.ini docker-compose.yml docker
git commit -m "feat: add PostgreSQL schema, models and initial migration" -m "Users, vehicles and purchases tables with CHECK constraints, native enums and indexes. Alembic migration verified up and down. AI-assisted boilerplate." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add backend
git commit -m "chore: add FastAPI skeleton with stubbed services" -m "Routes, services, repositories, schemas and test fixtures. Business logic is intentionally stubbed; every stub is implemented test-first in later commits." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add .github
git commit -m "ci: add GitHub Actions for backend and frontend" -m "Backend job runs ruff, the migration and pytest against a PostgreSQL service. Frontend job runs tests and the build." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/vite.config.ts frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/.env.example frontend/Dockerfile frontend/public frontend/src/main.tsx frontend/src/index.css frontend/src/vite-env.d.ts
git commit -m "chore: scaffold React, Vite and Tailwind frontend" -m "Tooling, design tokens, fonts and entry point. AI-assisted." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add frontend/src/components/ui frontend/src/lib frontend/src/types frontend/src/hooks/useMediaQuery.ts frontend/src/hooks/useDocumentTitle.ts
git commit -m "feat: add UI primitives, formatting helpers and types" -m "Accessible button, fields, modal, toast, badge and skeleton. AI-assisted." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add frontend/src/api frontend/src/context frontend/src/components/layout frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx frontend/src/pages/NotFoundPage.tsx
git commit -m "feat: add auth flow, API client and route guards" -m "JWT interceptor, AuthContext, login and register pages. AI-assisted." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add frontend/src/components/vehicles frontend/src/components/admin frontend/src/components/vehicle3d frontend/src/hooks/useVehicles.ts frontend/src/pages/DashboardPage.tsx frontend/src/pages/AdminPage.tsx frontend/src/App.tsx
git commit -m "feat: add vehicle dashboard, admin screens and 3D card" -m "Search and filters, purchase, admin CRUD dialogs, lazy-loaded 3D card. AI-assisted." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add frontend
git commit -m "test: add frontend test suite with MSW" -m "Vitest and Testing Library tests for components, pages and flows. Written together with the code by an AI assistant; I reviewed them." -m "Co-authored-by: Claude <noreply@anthropic.com>"

git add README.md PROMPTS.md docs/screenshots
git commit -m "docs: add README, screenshots and prompt log placeholder" -m "README skeleton with setup, My AI Usage template and screenshots from the mocked build." -m "Co-authored-by: Claude <noreply@anthropic.com>"
```
Check: `git status` should print "nothing to commit, working tree clean", and `git log --oneline` should show 11 commits.

**Be honest in these messages.** The frontend and its tests were written *together* by AI, so the commits say that. They are not a fake Red-Green trail. Real Red-Green history starts in Stage 5.

### 3.3 Push and check CI [CHECK]
```bash
git remote add origin <your-repo-url>
git push -u origin main
```
Open the **Actions** tab. Both jobs (backend, frontend) should go green. Fix a red CI before moving on.

### 3.4 The co-author trailer, for every commit from now on
Use this pattern **only on commits where an AI tool helped** (boilerplate, tests, debugging, explanations that shaped the code):
```bash
git commit -m "feat: implement user registration" -m "Used an AI assistant for the service boilerplate; I wrote the duplicate-email handling." -m "Co-authored-by: Claude <noreply@anthropic.com>"
```
Notes, all verified:
- The trailer is the **last paragraph**, after a blank line. Git collapses extra blank lines into one by default, and the trailer is still recognised. If you want literally two blank lines, write the message to a file and use `git commit --cleanup=verbatim -F message.txt`.
- Check any commit with: `git log -1 --format=%B | git interpret-trailers --parse`
- Use the tool's real name. The kata's example uses `Name <AI@users.noreply.github.com>`; any `Name <email>` in that shape is fine.
- Commits you wrote entirely yourself carry **no** trailer.

---

## Stage 4. Run what exists [CHECK]

**Prefer to let an AI agent do all of this?** Give the Antigravity agent the runbook in [`ANTIGRAVITY_SETUP.md`](ANTIGRAVITY_SETUP.md). The manual commands are below.
```bash
docker compose up -d db                # PostgreSQL; wait for "healthy" in `docker compose ps`

cd backend
python -m venv .venv
source .venv/bin/activate              # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
cp .env.example .env                   # Windows: copy .env.example .env  (set a real SECRET_KEY)
#   or in one go, with a generated SECRET_KEY and no editing:  python -m app.scripts.setup_env
alembic upgrade head
pytest                                 # expect 40 passed
python -m app.scripts.doctor           # checks tools, .env and both databases; fix every [FAIL] line
uvicorn app.main:app --reload          # http://localhost:8000/docs

# second terminal
cd frontend
cp .env.example .env
npm ci
npm test                               # expect 72 passed
npm run dev                            # http://localhost:5173
```
Login fails until the backend exists, and Swagger endpoints answer `501`. Both are expected. If anything above fails, run the doctor and read [`SETUP_GUIDE.md`](SETUP_GUIDE.md) section 10 (troubleshooting).

---

## Stage 5. Build the backend, test-first [TDD]

**This is where the kata's Red-Green-Refactor history is made.** Every phase below is `[TDD]`: the tests come first, and `git log` must show each `test:` commit **before** the `feat:` commit that makes it pass.

### 5.1 The cycle (repeat for every behaviour inside a phase)
1. **RED.** Write ONE new test for ONE behaviour and run it. It must fail **because the behaviour is missing** (the expected messages are in 5.2), not because of a typo, an import error or a broken fixture. Commit: `test: ...`
2. **GREEN.** Write the least code that makes that test pass, and nothing more. Run the whole suite. Commit: `feat: ...`
3. **REFACTOR.** Clean up (rename, extract, remove duplication) while everything stays green. Do not touch the tests. Commit: `refactor: ...`
4. Next behaviour: back to step 1. A phase is usually **2 to 4 cycles**, not one giant test file followed by one giant implementation.

Before you push, `pytest` and `ruff check .` must pass. **Do not push while a test is red.** Commit locally and push once green, otherwise CI shows a red run for that moment. The history still shows the test commit first.

### 5.2 What to write first in each phase

All phases are `[TDD]`. The "expected failure" column is what a proper RED looks like on the skeleton (checked by running these tests against it).

| Phase | Write FIRST (your first RED) | Expected failure | Then implement (GREEN) |
|---|---|---|---|
| 1 Money | `to_cents(Decimal("27999.99")) == 2799999` | `NotImplementedError` | `core/money.py` |
| 2 Security | the hash is not the plain password | `NotImplementedError` | `core/security.py` |
| 3 Register | a valid registration returns 201 | `assert 501 == 201` | user repository, `auth_service`, auth route |
| 4 Login | a valid login returns 200 with a token | `assert 501 == 200` | same files |
| 5 Current user | no credentials gives 401 | `NotImplementedError` from `get_current_user` | `api/deps.py` |
| 6 Create vehicle | an anonymous create gives 401 | `assert 501 == 401` | vehicle repository, service, route |
| 7 List, update, delete | a list without a token gives 401 | `assert 501 == 401` | same files |
| 8 Search | filtering by make returns only that make | `assert 501 == 200` | same files |
| 9 Purchase | a purchase without a token gives 401 | `assert 501 == 401` | inventory service, purchase repository |
| 10 Restock | a restock without a token gives 401 | `assert 501 == 401` | inventory service |
| 11 Seed | the seed creates the admin | `NotImplementedError` from `main()` | `scripts/seed.py` |

The complete test list for each phase is in `NEXT_STEPS.md`, Part C. Write them **one at a time** in the cycle above.

If your first run fails with anything else (an `ImportError`, a `fixture not found`, a typo), that is not a real RED. Fix the test first.

### 5.3 Tests that are already green ("born green")
On the skeleton, **six tests you will want to write already pass**, because the request schemas enforce them: registering with an invalid email, a short password, or a password over 72 bytes (all 422); creating a vehicle with price 0 (422); purchasing or restocking with quantity 0 (422). Also, "a client cannot choose their own role when registering" will pass the moment registration works at all, because the schema has no `role` field.

They cannot show a Red, so they are **not TDD**. Keep them as **guard tests**: write them, confirm they pass, and commit them as `test: guard ...`. Never delete or soften them. A test that passes on its very first run when you expected it to fail means either the behaviour already exists (fine, call it a guard) or the test is wrong (check it).

### 5.4 Worked example: Phase 3 (registration) as TDD cycles

| Cycle | RED: the test you write | What you see | GREEN: the least code | Commits |
|---|---|---|---|---|
| 1 | A valid registration returns 201 with `id`, `email` and `role: "USER"` | `assert 501 == 201` | `UserRepository.add`, `AuthService.register` (hash the password), remove the 501 from the route | `test: add failing test for successful registration`, `feat: register a new user` |
| 2 | Registering the same email twice returns 409 | The test **errors** with `IntegrityError: duplicate key value violates unique constraint "ix_users_email"`: the database refuses the duplicate, but nothing turns that into a 409 yet | Look the email up first and raise `EmailAlreadyRegisteredError` | `test: add failing test for duplicate email`, `feat: reject duplicate emails` |
| 3 | `Jane@x.com` after `jane@x.com` also returns 409 | The second request returns 201 | Lowercase the email before saving and looking it up | `test: ...`, `feat: treat emails as case-insensitive` |
| (guard) | The response has no `hashed_password`; the stored password is not the plain text; a `role: "ADMIN"` in the request still creates a USER | Passes at once (cycle 1 made it true) | nothing | `test: guard registration against leaking the hash and choosing a role` |
| Refactor | (all tests stay green) | | Extract an email-normalising helper | `refactor: extract email normalisation` |

Do the same for the other phases: pick the next behaviour from the phase's test list and run one cycle.

### 5.5 Rules, and what to do if you slip
- **No production code before a failing test** that needs it.
- **Never weaken or delete a test to get green.** Fix the code.
- **One failing test at a time.** Several red tests at once make it unclear what you are fixing.
- **AI-drafted tests are fine**, but you run them and confirm the RED before any implementation exists. Add the trailer to that commit (Stage 3.4).
- **If you realise you wrote code first:** stop. Stash the implementation (`git stash`), commit the test, run it and watch it genuinely fail, then bring the code back (`git stash pop`) and commit it. Say so in the commit message ("implementation written first; test confirmed failing without it"). Do not hide it, and never rewrite history to make it look different.

**Full test lists, verified code hints and the exact Phase 1 test file:** `NEXT_STEPS.md`, Part C. Hints already verified there: bcrypt's 72-byte limit, PyJWT needing `sub` as a string, the atomic purchase `UPDATE`, search parameters as a query model so bad input is a 422.

**Target:** at least 90% backend coverage. `pytest` prints it and writes `backend/reports/`.

---

## Stage 6. Make the frontend yours: one feature, test-first [TDD]

The frontend arrived complete, so its history cannot show Red-Green. Add one small feature **yourself, test-first**, so your commit history shows the discipline on the frontend too. Example: **sort vehicles by price** on the dashboard. This is `[TDD]`: the same cycle as Stage 5.1, with `npx vitest run ...` instead of `pytest`.

**Red.** Add this test to `frontend/src/pages/DashboardPage.test.tsx` (inside the `describe`). It was run to confirm it fails for the right reason ("Unable to find a label with the text of: Sort by"):
```tsx
it("sorts by price when asked (lowest first, then highest first)", async () => {
  const { user } = open();
  await screen.findByRole("article", { name: "Toyota Camry" });
  const order = () => screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));

  await user.selectOptions(screen.getByLabelText("Sort by"), "price-asc");
  expect(order()).toEqual(["Honda Civic", "Toyota Camry", "Ford F-150"]); // 22,500 / 27,999.99 / 41,250.50

  await user.selectOptions(screen.getByLabelText("Sort by"), "price-desc");
  expect(order()).toEqual(["Ford F-150", "Toyota Camry", "Honda Civic"]);
});
```
Run `npx vitest run src/pages/DashboardPage.test.tsx`, see it fail, then commit: `test: add failing test for sorting vehicles by price`.

**Green.** In `DashboardPage.tsx`, add a "Sort by" `SelectField` (options: Featured, Price: low to high, Price: high to low), keep the choice in state, and render a sorted copy of the list (`useMemo`, copy the array before sorting). A reference implementation took about 15 lines and made all **73** tests pass with a clean type-check. Commit: `feat: add sort by price to the dashboard`.

**Refactor.** Move the comparison into `src/lib/sort.ts` as `sortVehicles(list, mode)`, give it its own small unit test file, and keep the page test. Commit: `refactor: extract sortVehicles into lib`.

Other small features you could do the same way: a purchase quantity selector (the API already accepts `quantity`), a "show only in stock" filter.

Also **change something visibly personal** (copy, a colour, a label) and commit it. The goal is that you know the code well enough to change it.

---

## Stage 7. Integration and QA [CHECK, and bugs are FIX = TEST FIRST]

1. Start the database, the backend and `npm run dev`. If the browser shows a CORS error, add your frontend address to `CORS_ORIGINS` in `backend/.env` (a JSON list) and restart the backend.
2. Walk through this checklist:
   - [ ] `/` while signed out redirects to Sign in
   - [ ] Register works and lands on the dashboard; refresh keeps you signed in
   - [ ] `/admin` as a user bounces back; no "Manage inventory" link
   - [ ] Search by make, category and price range; Reset restores everything
   - [ ] Nonsense search shows the empty state
   - [ ] Hover, drag and release a car; it parks again
   - [ ] Purchasing the last unit turns the badge to Out of stock and the button to Unavailable
   - [ ] Sign in as the seeded admin: Admin badge and the Manage inventory link
   - [ ] Add, edit, restock and delete a vehicle (cancel once before confirming a delete)
   - [ ] Stop the backend and reload: error banner with Try again
   - [ ] Phone width: navbar fits, admin shows cards
   - [ ] Keyboard only: focus ring always visible; the 3D card opens with Enter
3. **Any mismatch or bug is `[FIX = TEST FIRST]`.** Do not patch it first:
   1. Check `docs/API_CONTRACT.md` to decide which side is wrong.
   2. Write the smallest failing test that reproduces it, at the lowest level that can catch it (a backend integration test, or a frontend component test).
   3. Run it and confirm it fails for the right reason. Commit: `test: reproduce <the bug>`.
   4. Fix it. Commit: `fix: <the bug>`.

   Example from this project: prices were once sent as JSON strings. `test_price_is_a_json_number_not_a_string` was written first, failed, and then the fix turned it green. Setting `CORS_ORIGINS` and retaking screenshots are `[NOT TDD]`.
4. **Retake the screenshots** into `docs/screenshots/` (`login`, `dashboard`, `admin`, `card-3d-states`, `admin-modals`, `mobile`, `states`). The current ones came from mocked data.

---

## Stage 8. Deliverables, one by one [NOT TDD]

| Deliverable | What to do |
|---|---|
| **Public repo link** | Repository is public (check Stage 9) |
| **README: explanation** | 3 sentences on what the app does |
| **README: setup** | Backend and frontend steps that work on a clean machine (prove it in Stage 9) |
| **README: screenshots** | The real ones from Stage 7 |
| **README: My AI Usage** | See below |
| **README: test report** | See below |
| **`PROMPTS.md`** | Raw, unedited logs or public links, collected since Stage 1 |
| **Optional: live link** | Stage 10 |

### My AI Usage (write it yourself, in your own words)
The kata requires three things. Answer each honestly and specifically:
1. **Which tools?** Every tool you used (assistant, Stitch, anything else).
2. **How did you use them?** Concrete examples, such as "planning and the project skeleton", "generating the first version of the frontend", "debugging X", "reviewing my tests". Say which parts you wrote, which you changed, and which you rejected.
3. **Reflection.** What went faster, what you had to fix, what you learned, what you would do differently.

Real examples from this project you can cite, because they happened: the API was sending prices as JSON strings and a long password would have crashed bcrypt (both caught in review and fixed with tests); the Stitch design added invented features (VINs, a role toggle on login, fake security badges) that were removed; two palette colours failed accessibility contrast and were corrected; an invisible button blocked the 3D drag until it was found in a browser run. Do not copy sentences from this guide into the README. The section must read as you.

### Test report
```bash
cd backend && pytest                                   # writes backend/reports/test-report.html and coverage
cd frontend && npm run test:coverage > ../docs/test-report-frontend.txt
cd backend && pytest > ../docs/test-report-backend.txt
```
Commit `backend/reports/test-report.html` and the two `.txt` files, and paste the pass counts and coverage totals into the README under "Tests". (The HTML coverage folder is git-ignored on purpose.)

---

## Stage 9. Final verification (do not skip) [CHECK]

- [ ] Both CI jobs are green on the latest commit
- [ ] `pytest`: all pass, coverage at least 90%; `npm test`: all pass
- [ ] `git status` is clean; `git log --oneline` reads like a story
- [ ] AI-assisted commits have the trailer (`git log --format=%B | grep -c Co-authored-by`)
- [ ] No secrets committed:
  ```bash
  git grep -n "SECRET_KEY=" -- . ':!*.example'          # prints nothing
  git log --all --oneline -- .env backend/.env frontend/.env   # prints nothing
  ```
- [ ] **Clean-clone test:** clone the repo into a new folder and follow your own README from the first line. Anything that fails there would fail for the reviewer.
- [ ] Open the repository in a private/incognito window: it loads **without logging in**
- [ ] README links and images all work on GitHub
- [ ] `PROMPTS.md` has raw logs or links, nothing summarised
- [ ] `npm audit --omit=dev` shows no vulnerabilities

Then submit the repository link.

---

## Stage 10. Optional extras (after everything above) [NOT TDD]
Live deployment, real 3D car models and dependency updates are in `NEXT_STEPS.md`, Part F.

## Stage 11. Interview preparation [NOT TDD]
`NEXT_STEPS.md` Part G has ten technical questions. Add these AI-specific ones, which the kata says to expect:
- Show me a prompt that worked well, and one that did not. Why?
- What did the AI get wrong, and how did you notice?
- Which part of this code could you rewrite from scratch right now, and which could you not?
- Where did you decide against the AI's suggestion?
- How would you work differently next time?
