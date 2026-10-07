<!--
Sync Impact Report
- Version change: (unversioned scaffold) → 1.0.0
- Modified principles: none (initial ratification)
- Added sections:
  - Core Principles: I. Upstream Contract Compatibility
  - Core Principles: II. Patterns Are Generated Data
  - Core Principles: III. Test-First Quality Gate (NON-NEGOTIABLE)
  - Core Principles: IV. Deterministic, Dependency-Free Core
  - Core Principles: V. Simplicity and Documentation (YAGNI)
  - Additional Constraints
  - Development Workflow and Quality Gates
  - Governance
- Removed sections: none (placeholder scaffold replaced)
- Follow-up TODOs: none; all placeholders resolved.
-->

# hyphenasi Constitution

## Core Principles

### I. Upstream Contract Compatibility

The public API MUST remain source-compatible with upstream `hyphen`. `export-contract.js`
is the authoritative contract for every language entry point (`hyphenate`,
`hyphenateSync`, `hyphenateHTML`, `hyphenateHTMLSync`, `patterns`); no change may alter
these names, arities, option semantics, or return shapes without a MAJOR version bump.
`hyphen.d.ts` MUST be updated in the same change as any API-visible edit, and
README/Storybook examples MUST keep compiling as written.

Rationale: this project is a drop-in fork; consumers switching between `hyphen` and
`hyphenasi` MUST NOT need code changes. Silent contract drift is the highest-cost failure
mode for a library fork.

### II. Patterns Are Generated Data

The `tex/` directory is the source of truth for patterns; `src/`- and package-level
pattern output MUST be regenerated exclusively through `npm run sync:patterns` /
`build:patterns` and MUST NOT be hand-edited. Any intentional divergence from the
upstream `tex-hyphen` corpus MUST be declared in `scripts/check-drift.cjs` (as
`hyph-id.tex` is today), so `npm run check:drift` fails on every undeclared divergence.
The drift check MUST pass before any pattern change is merged.

Rationale: pattern corruption is invisible in casual testing but breaks hyphenation for
an entire language; making generated files un-editable by hand and every exception
explicit keeps the corpus auditable.

### III. Test-First Quality Gate (NON-NEGOTIABLE)

Every behavior change MUST ship with jest tests that fail before the fix and pass after;
the pre-commit gate (`eslint` + `check:drift` + `jest`) MUST pass on every commit, and
PRs MUST NOT be merged with skipped or `.only` tests. Changes to the hyphenation hot path
MUST also satisfy the existing `performance.test.js` and `stress.test.js` budgets.

Rationale: the core algorithm is subtle (pattern tries, exception lists, vowel splitting,
HTML tokenization); regressions surface in edge words a reviewer will not spot by reading
the diff.

### IV. Deterministic, Dependency-Free Core

The hyphenation core MUST stay deterministic for a given `(text, options, patterns)` input
and MUST NOT introduce runtime dependencies, network access, environment reads, or
unbounded caches in the hot path. Any cache MUST have an explicit, tested size limit
(`cache-limit.test.js`). Asynchronous behavior MUST be opt-in via the existing
`async: true` option; the sync path MUST remain fully synchronous.

Rationale: the library runs in browsers and servers alike; a zero-runtime-dependency,
pure core keeps bundle size, security surface, and reproducibility under control.

### V. Simplicity and Documentation (YAGNI)

Prefer plain JavaScript and existing scripts over new tooling or abstraction layers; a
feature is not done until its README and Storybook usage examples are updated. New
abstractions MUST be justified by at least two concrete use cases. Public behavior MUST
be documented where consumers will find it (README, Storybook), not only in code comments.

Rationale: the project's value is a small, predictable text utility; complexity is a
liability paid by every downstream consumer.

## Additional Constraints

- Zero runtime dependencies; `package.json` `dependencies` MUST remain empty.
- No `eval`, dynamic code execution, or processing of untrusted pattern files at runtime;
  patterns are build-time artifacts only.
- Generated build output (`package/`, generated `src/` pattern data, `hyphen.js`
  artifacts) MUST be reproducible from committed sources via the `build:*` scripts;
  manual edits to generated output are forbidden.
- Unicode correctness: output MUST use U+00AD soft hyphen insertion, MUST NOT corrupt
  multi-byte characters, and non-Latin coverage MUST be verified by `non-latin.test.js`.
- Node and evergreen browser environments MUST both be supported; any Node-only API in
  the runtime path is prohibited.
- License compatibility of imported pattern data MUST be verified before adding a new
  language pattern set.

## Development Workflow and Quality Gates

- Commits MUST pass the husky `pre-commit` hook: `npm run lint && npm run check:drift
  && npm run test`. Bypassing hooks (e.g. `--no-verify`) is prohibited except for
  documentation-only commits, and then only with justification in the commit message.
- `main` MUST remain releasable: merges happen via PR, and each PR description MUST name
  the principle(s) affected and the tests that cover the change.
- API-visible changes MUST update `export-contract.js`, `hyphen.d.ts`, README, and
  Storybook examples atomically in the same PR.
- Pattern updates MUST go through `sync:patterns` → `check:drift` → pattern-specific
  tests, never through direct edits to generated files.
- Versioning follows semver against the public API contract: MAJOR for contract breaks,
  MINOR for new languages/features, PATCH for pattern data and fixes.

## Governance

- This constitution supersedes informal practice; where it conflicts with a code comment,
  README note, or personal preference, this document wins.
- Amendments are made only via `/speckit.constitution`, require a semantic version bump
  (MAJOR: principle removal/redefinition; MINOR: new or materially expanded principle;
  PATCH: clarifications), and MUST record the change in a Sync Impact Report until the
  report is removed before commit.
- All PRs and reviews MUST verify compliance with the Core Principles and Quality Gates;
  a violation blocks merge until fixed or the constitution is formally amended.
- Complexity, new dependencies, or new build tooling MUST be justified explicitly against
  Principles IV and V during review.
- Runtime development guidance lives in `README.md`; architectural guidance for Spec Kit
  commands is read from this file at command time.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
