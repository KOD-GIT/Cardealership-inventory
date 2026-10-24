# Car Dealership Inventory System

A full-stack inventory app for a car dealership, built as a TDD kata.
Users register and log in, browse/search vehicles and purchase them (stock decreases).
Admins can also add, update, delete and restock vehicles.

> **Status:** skeleton. Structure, schema, migration and API contract are in place; features are built test-first.

## Tech stack
| Layer | Tech |
|---|---|
| API | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 |
| Auth | JWT (PyJWT, HS256), bcrypt |
| Database | PostgreSQL 16 (via Docker Compose), psycopg 3 |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query |
| Tests | pytest + pytest-cov (backend), Vitest + Testing Library + MSW (frontend) |

## Documentation
- [ER diagram](docs/ER_DIAGRAM.md) (Chen notation, PostgreSQL DDL)
- [API contract and permission matrix](docs/API_CONTRACT.md)
- [Stitch UI prompts & design system](docs/stitch_prompts.md)

## Run locally

### 1. Database
```bash
docker compose up -d db        # PostgreSQL on :5432 with `dealership` and `dealership_test` databases
```
(No Docker? Install PostgreSQL 14+ and create both `dealership` and `dealership_test` databases.)

### 2. Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\\Scripts\\activate
pip install -r requirements-dev.txt
cp .env.example .env                                   # set a real SECRET_KEY
alembic upgrade head                                   # creates the tables
python -m app.scripts.seed                             # creates the admin + sample data (after phase 11)
uvicorn app.main:app --reload                          # http://localhost:8000/docs
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev                                            # http://localhost:5173
```

### Everything in Docker (optional)
```bash
docker compose up --build        # PostgreSQL, API :8000, UI :3000
```

### Seeded admin (for reviewers)
| Email | Password |
|---|---|
| `admin@dealership.com` | `Admin@12345` |

(Configurable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`.)

## Tests
```bash
cd backend  && pytest          # needs `docker compose up -d db`; prints coverage, writes backend/reports/test-report.html
cd frontend && npm test
```
**Test report:** _paste the final pytest + coverage summary here._

## Screenshots
_Add screenshots of login, dashboard, search, purchase and admin pages here._

## My AI Usage
**Tools used:** Google Stitch, Claude

**How I used them:**
- **Google Stitch:** Generated comprehensive UI screen mockups and design system specifications for the Showroom digital car dealership web application. Created structured, self-contained prompts for 11 required screens (Desktop Sign in, Create account, Vehicle dashboard with parked & interactive card states, Admin inventory management, Restock/Delete modals, and Mobile equivalents) and 4 optional states (Loading skeletons, Empty search, Connection error, and Toast notifications) using contrast-checked WCAG AA design tokens.
- **Claude:** Assisted with project architecture, full-stack directory skeleton, FastAPI & SQLAlchemy data models, TDD test specifications, and API contract design.

**Reflection:**
Using Google Stitch allowed establishing a consistent visual design language (colors, typography, component layout rules) upfront before implementing frontend React and Tailwind components. Strict prompt negative constraints (e.g. forbidding telemetry, fake stats, or VIN numbers) prevented AI hallucinations and ensured the visual screens strictly mirrored our data model and API contract.

Raw chat logs and prompts are documented in [`PROMPTS.md`](PROMPTS.md) and [`docs/stitch_prompts.md`](docs/stitch_prompts.md).

## Project structure
```
backend/   app/{api,services,repositories,models,schemas,core,db,scripts}  alembic/  tests/{unit,integration}
frontend/  src/{api,components,pages,hooks,context,types,test}
docs/      ER_DIAGRAM.md  API_CONTRACT.md  stitch_prompts.md
```
