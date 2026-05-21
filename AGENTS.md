# AGENTS.md

## Operating policy (Codex)

**Sources of truth**

- Current product behavior in [`README.md`](./README.md)
- Current game and tracking implementation under `src/`
- Tracker issue acceptance criteria and any linked PR review feedback

**Workflow**

1. Read the tracker issue carefully and inspect the relevant files before editing.
2. Keep changes scoped to the current tracker issue.
3. Prefer additive changes over broad rewrites unless the issue explicitly asks for a replacement.
4. Preserve existing camera/tracking modes unless the issue explicitly changes them.
5. Add or update focused automated tests when behavior changes are testable in this repo.

**Validation guidance**

Use best judgment and discretion when deciding how much validation to run after a change.
Match the test scope to the risk and blast radius:

- For broad changes, shared wiring, gameplay behavior, camera/tracking behavior, or anything likely to affect multiple modes, run the full baseline: `npm run build` and `npm test`.
- For focused or low-risk changes, prefer targeted tests, a build, lint/static checks, or no automated validation when that is the honest best fit.
- In the final handoff, state what validation was run and call out any meaningful validation that was intentionally skipped.

If a change touches camera-tracking or gameplay wiring that is hard to prove in the current automated suite, record the remaining manual-validation gap in the workpad instead of pretending it is covered.

**Git and PR guidance**

- Use the tracker-provided branch name.
- Keep PR titles in the form `<ISSUE-ID> <very brief description>`.
- Target `${SYMPHONY_MERGE_BASE:-main}`.

**When something feels off**

If the requested change would require a large architecture rewrite, new backend services, or major product decisions that are not already implied by the issue, stop and ask for clarification instead of guessing.
