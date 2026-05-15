##Use when something is not working, instead of iterating

Task type: micro

Mode: EXECUTE

Goal:
Fix incorrect or incomplete implementation from previous step without expanding scope.

Context:
The previous change did not behave as expected.

Debug:

1. Restate what the system should do (1–2 sentences)
2. Identify what is currently wrong
3. Identify exact file(s) involved
4. Propose the smallest possible fix

Constraints:
- follow CONTRACT.md
- follow AGENTS.md
- do not modify more than 1–2 files
- do not refactor unrelated code
- do not introduce new patterns
- do not improve anything beyond the fix

Success:
- behavior matches expected outcome
- no unrelated changes