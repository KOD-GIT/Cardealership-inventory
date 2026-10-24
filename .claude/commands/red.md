---
description: TDD step 1 (RED). Write ONE failing test for one behaviour, run it, and stop
argument-hint: "[behaviour to test, e.g. registering the same email twice returns 409]"
---
Behaviour to test: $ARGUMENTS

Do exactly this, then stop:
1. Look at the existing tests for this area so you follow their style and reuse their fixtures (`client`, `db_session`, any user/vehicle helpers).
2. Write ONE new test for ONE behaviour, in the right file under `backend/tests/` (or `frontend/src/` for UI). Edit tests only in this step. Do not touch production code.
3. Run only that test.
4. Judge the result:
   - Fails because the behaviour is missing (`assert 501 == 201`, `NotImplementedError`, or an assertion about missing behaviour): a good RED.
   - Fails for another reason (ImportError, missing fixture, typo): fix the test and run it again.
   - Passes immediately: it is "born green" (a schema or an earlier cycle already guarantees it). Say so, call it a guard test, and ask me whether to keep it.
5. Show me: the test, one sentence on what it checks, the failure line, and the commit message you propose (`test: ...`).
Wait for me. Do not write the implementation. Do not commit unless I say so.
