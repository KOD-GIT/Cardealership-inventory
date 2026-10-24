"""Create the .env files and generate a SECRET_KEY, safely and without any manual editing.

Run it from the backend folder (needs only the Python standard library):

    python -m app.scripts.setup_env

What it does:
  * backend/.env   is created from .env.example if it does not exist
  * frontend/.env  is created from .env.example if it does not exist
  * SECRET_KEY     is generated if it is missing, a placeholder, or shorter than 32 characters

What it never does: overwrite a value you set yourself, or print the secret.
It is safe to run any number of times.
"""
import re
import secrets
import shutil
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2]
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

PLACEHOLDERS = {"", "replace-with-a-long-random-string", "dev-only-change-me"}
MIN_SECRET_LENGTH = 32
_SECRET_LINE = re.compile(r"^SECRET_KEY=(.*)$", re.MULTILINE)


def is_placeholder_secret(value: str) -> bool:
    """True for empty, example or too-short secrets, i.e. anything that should be replaced."""
    return value.strip() in PLACEHOLDERS or len(value.strip()) < MIN_SECRET_LENGTH


def ensure_secret_key(env_text: str) -> tuple[str, bool]:
    """Return (new_text, changed). Replaces a placeholder secret, keeps a real one, adds a missing one."""
    match = _SECRET_LINE.search(env_text)
    if match is None:
        separator = "" if env_text.endswith("\n") or not env_text else "\n"
        return f"{env_text}{separator}SECRET_KEY={secrets.token_urlsafe(48)}\n", True
    # drop an inline "  # comment" before judging the value
    current = re.split(r"\s+#", match.group(1), maxsplit=1)[0]
    if not is_placeholder_secret(current):
        return env_text, False
    new_line = f"SECRET_KEY={secrets.token_urlsafe(48)}"
    return _SECRET_LINE.sub(lambda _m: new_line, env_text, count=1), True


def copy_example(folder: Path) -> str:
    """Create folder/.env from folder/.env.example when missing. Returns a status word."""
    target, example = folder / ".env", folder / ".env.example"
    if target.exists():
        return "kept"
    if not example.exists():
        return "missing-example"
    shutil.copyfile(example, target)
    return "created"


def describe(name: str, status: str) -> str:
    """One status line for an env file, e.g. '[ ok ] backend/.env created from .env.example'."""
    outcome = "created from .env.example" if status == "created" else "already exists (kept)"
    return f"[ ok ] {name} {outcome}"


def main() -> int:
    status = copy_example(BACKEND_DIR)
    if status == "missing-example":
        print("[FAIL] backend/.env.example not found. Run this from the backend folder of the project.")
        return 1
    print(describe("backend/.env", status))

    env_file = BACKEND_DIR / ".env"
    new_text, changed = ensure_secret_key(env_file.read_text(encoding="utf-8"))
    if changed:
        env_file.write_text(new_text, encoding="utf-8")
        print("[ ok ] SECRET_KEY generated and saved (not shown)")
    else:
        print("[ ok ] SECRET_KEY already set (kept)")

    front_status = copy_example(FRONTEND_DIR)
    if front_status == "missing-example":
        print("[warn] frontend/.env.example not found: skipped the frontend .env")
    else:
        print(describe("frontend/.env", front_status))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
