---
description: TDD step 2 (GREEN). Write the least code that makes the failing test pass, then run everything
---
1. Run the tests that currently fail (backend: `python -m pytest --lf -q`; frontend: `npm test`). There must be exactly one failing test, from the last `/red`. If not, tell me and stop.
2. Write the LEAST production code that makes it pass. Do not edit tests. Do not add anything the test does not need.
3. Run that test, then the whole suite, then `python -m ruff check .` (frontend: `npm test` and `npm run typecheck`).
4. Report in under 10 lines: the files you changed and the result of each run.
5. Propose a commit message (`feat: ...`). Wait for me. Do not commit or push unless I say so.
