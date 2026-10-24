"""Environment doctor: checks your tools, env file and databases, and explains what to fix.

Run it from the backend folder with the virtual environment active:

    python -m app.scripts.doctor

Exit code 0 means nothing is broken (warnings are fine); 1 means something needs fixing.
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings, get_settings

REPO_ROOT = Path(__file__).resolve().parents[3]


def driver_hint(url: str) -> str | None:
    """SQLAlchemy needs the driver name in the URL; plain `postgresql://` points at a driver we do not use."""
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        return "Change the start of the URL to postgresql+psycopg:// (SQLAlchemy needs the driver name)."
    return None


def unsafe_test_database(url: str) -> str | None:
    """The test suite DROPS every table in its database, so that database's name must end in _test."""
    name = make_url(url).database or ""
    if name.endswith("_test"):
        return None
    return (
        f"TEST_DATABASE_URL points at '{name}'. The tests DROP every table in that database, "
        "so its name must end in _test (for example dealership_test)."
    )


def diagnose(message: str) -> str:
    """Turn a raw PostgreSQL / driver error into a short instruction. Unknown errors pass through."""
    lowered = message.lower()
    if "password authentication failed" in lowered:
        return (
            "Wrong username or password in the database URL. "
            "The Docker default is dealership / dealership."
        )
    database = re.search(r'database "([^"]+)" does not exist', message)
    if database:
        name = database.group(1)
        return (
            f"The database '{name}' does not exist. Create it: "
            f"docker compose exec db psql -U dealership -d dealership -c \"CREATE DATABASE {name};\" "
            f"(native install: run CREATE DATABASE {name} OWNER dealership; in psql)."
        )
    if re.search(r'role "[^"]+" does not exist', message):
        return (
            "That database user does not exist. "
            "Create it with CREATE USER dealership WITH PASSWORD 'dealership' CREATEDB;"
        )
    if "could not translate host name" in lowered or "name or service not known" in lowered:
        return (
            "The host name in the database URL cannot be found. "
            "Use localhost (or db inside Docker Compose)."
        )
    if "connection refused" in lowered or "could not connect" in lowered or "timeout expired" in lowered:
        return (
            "PostgreSQL is not running or not listening on this port. "
            "Docker: docker compose up -d db. Native: start the PostgreSQL service."
        )
    return message


class Report:
    """Collects results and prints them in a stable, ASCII-only format (safe on any terminal)."""

    def __init__(self) -> None:
        self.failures = 0
        self.warnings = 0

    def ok(self, message: str) -> None:
        print(f"[ ok ] {message}")

    def warn(self, message: str) -> None:
        self.warnings += 1
        print(f"[warn] {message}")

    def fail(self, message: str) -> None:
        self.failures += 1
        print(f"[FAIL] {message}")


def tool_version(command: str) -> str | None:
    """First line of `<command> --version`, or None if the tool is missing."""
    executable = shutil.which(command)
    if executable is None:
        return None
    try:
        result = subprocess.run(
            [executable, "--version"], capture_output=True, text=True, timeout=10, check=False
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    lines = (result.stdout or result.stderr).strip().splitlines()
    first = lines[0] if lines else "installed"
    # "v22.1.0" -> "node v22.1.0"; "git version 2.4" already starts with the tool name
    return first if first.lower().startswith(command) else f"{command} {first}"


def check_tools(report: Report) -> None:
    version = sys.version_info
    label = f"Python {version.major}.{version.minor}.{version.micro}"
    if version < (3, 11):
        report.fail(f"{label}: need 3.11 or newer (3.12 recommended)")
    elif version < (3, 12):
        report.warn(f"{label}: works in theory, but CI and this project were tested on 3.12")
    else:
        report.ok(label)

    for command, required, advice in [
        ("git", True, "install Git: https://git-scm.com/downloads"),
        ("node", True, "install Node 20 or newer: https://nodejs.org"),
        ("npm", True, "npm comes with Node: reinstall Node"),
        ("docker", False, "optional but recommended for PostgreSQL: https://www.docker.com/products/docker-desktop"),
        ("psql", False, "optional (only needed to inspect the database from a terminal)"),
    ]:
        found = tool_version(command)
        if found:
            report.ok(found)
        elif required:
            report.fail(f"{command} not found: {advice}")
        else:
            report.warn(f"{command} not found: {advice}")


def check_files(report: Report, settings: Settings) -> None:
    if (Path.cwd() / ".env").exists():
        report.ok("backend/.env exists")
    else:
        report.fail("backend/.env is missing: copy .env.example to .env (cp .env.example .env)")
    if settings.secret_key == "dev-only-change-me" or len(settings.secret_key) < 32:
        report.warn(
            "SECRET_KEY is the default or shorter than 32 characters. Generate one: "
            "python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    else:
        report.ok("SECRET_KEY is set and long enough")
    if (REPO_ROOT / "frontend" / "node_modules").exists():
        report.ok("frontend dependencies are installed")
    else:
        report.warn("frontend dependencies are not installed: cd frontend && npm ci")


def check_database(report: Report, label: str, url: str, expect_migrated: bool) -> None:
    hint = driver_hint(url) or (None if expect_migrated else unsafe_test_database(url))
    if hint:
        report.fail(f"{label + ':':<15}{hint}")
        return
    engine = create_engine(url, connect_args={"connect_timeout": 3})
    try:
        with engine.connect() as connection:
            version = connection.execute(text("select version()")).scalar_one()
            report.ok(f"{label + ':':<15}connected ({version.split(' on ')[0]})")
            tables = set(inspect(connection).get_table_names())
        if expect_migrated:
            expected = {"users", "vehicles", "purchases"}
            if expected <= tables and "alembic_version" in tables:
                report.ok(f"{label + ':':<15}tables exist (migrations applied)")
            else:
                report.warn(f"{label + ':':<15}tables are missing: run  alembic upgrade head")
    except SQLAlchemyError as error:
        raw = str(getattr(error, "orig", error)).strip().splitlines()
        report.fail(f"{label + ':':<15}{diagnose(' '.join(raw))}")
    finally:
        engine.dispose()


def main() -> int:
    report = Report()
    settings = get_settings()
    print("Checking your environment...\n")
    check_tools(report)
    check_files(report, settings)
    check_database(report, "app database", settings.database_url, expect_migrated=True)
    check_database(report, "test database", settings.test_database_url, expect_migrated=False)
    print()
    if report.failures:
        print(
            f"{report.failures} problem(s) to fix, {report.warnings} warning(s). "
            "Fix the [FAIL] lines first."
        )
        return 1
    print(f"Everything needed is working ({report.warnings} warning(s)).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
