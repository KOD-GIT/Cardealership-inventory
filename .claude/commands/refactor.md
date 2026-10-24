---
description: TDD step 3 (REFACTOR). Clean up while everything stays green. Never touches tests
---
1. Run the whole suite and ruff first. If anything is red, stop: refactoring is only allowed on green.
2. Suggest at most 3 small refactors (naming, duplication, an extract), one line of why each. Wait for me to pick.
3. Apply only what I pick. Do not edit any test file and do not change behaviour.
4. Run the whole suite and ruff again. Propose `refactor: ...`. Do not commit unless I say so.
