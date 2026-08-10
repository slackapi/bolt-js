# Undici Peer Dependency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@slack/bolt` formally provide the `undici` peer dependency required by `@slack/socket-mode@3`, with a CI guard that prevents the declared range from silently drifting out of sync.

**Architecture:** Add `undici@^7.0.0` to Bolt's `peerDependencies` (not optional — undici loads eagerly for every Bolt app). Add a unit test that reads socket-mode's actual `peerDependencies.undici` at test time and asserts Bolt's declared range is a semver subset of it. Ship a changeset and a docs note.

**Tech Stack:** TypeScript, npm, Mocha + Chai (unit tests), `semver` (range comparison), Changesets, Biome.

**Branch:** `feat/undici-peer-dependency` (already created off `main`).

## Global Constraints

- **Undici range:** `^7.0.0` — must match `@slack/socket-mode`'s declared `peerDependencies.undici` range verbatim. Copied from `node_modules/@slack/socket-mode/package.json`.
- **Not optional:** do NOT add `undici` to `peerDependenciesMeta` — undici is required at module-load time for all consumers.
- **Node/npm floors:** unchanged (`node >=20`, `npm >=9.6.4` per `engines`).
- **Linting:** Biome only (`npm run lint`). Never ESLint/Prettier.
- **Full gate:** `npm test` (build → lint → type tests → unit coverage) MUST pass before the work is considered complete. `npm run test:unit` requires a prior build.
- **Commit trailer:** every commit message ends with:
  `Co-Authored-By: Claude <svc-devxp-claude@slack-corp.com>`

---

### Task 1: Add `undici` peer dependency and `semver` devDependencies

**Files:**
- Modify: `package.json` (`peerDependencies`, `devDependencies`)

**Interfaces:**
- Consumes: nothing.
- Produces: `peerDependencies.undici === "^7.0.0"` in `package.json`; `semver` and `@types/semver` present in `devDependencies` (consumed by Task 2's guard test).

- [ ] **Step 1: Add `undici` to `peerDependencies`**

Edit `package.json` so the `peerDependencies` block reads (keep keys alphabetized):

```json
"peerDependencies": {
  "@types/express": "^5.0.0",
  "undici": "^7.0.0"
}
```

- [ ] **Step 2: Add `semver` + `@types/semver` to `devDependencies`**

Add these entries into the existing `devDependencies` block (alphabetized), needed by the Task 2 guard test:

```json
"@types/semver": "^7.7.0",
"semver": "^7.7.0",
```

- [ ] **Step 3: Install to refresh the lockfile**

Run: `npm install`
Expected: succeeds; `package-lock.json` updated; `semver` and `@types/semver` resolve into `node_modules`. If the min-release-age gate blocks a fresh version, re-run with `npm install --min-release-age=0`.

- [ ] **Step 4: Verify undici now resolves as provided by bolt**

Run: `npm ls undici`
Expected: shows `undici` under `@slack/socket-mode`; no "unmet peer" / "invalid" error for bolt.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
feat: declare undici peer dependency for socket-mode

@slack/socket-mode@3 declares undici@^7 as a peer dependency, which Bolt
constructs internally via SocketModeClient. Declare it as a Bolt peer so
the dependency graph is complete under strict package managers (Yarn/pnpm).
Add semver + @types/semver as devDependencies for the drift-guard test.

Refs: https://github.com/slackapi/bolt-js/issues/3039

Co-Authored-By: Claude <svc-devxp-claude@slack-corp.com>
EOF
)"
```

---

### Task 2: Add the drift-guard unit test

**Files:**
- Create: `test/unit/peer-dependencies.spec.ts`
- Reference (read-only): `package.json`, `node_modules/@slack/socket-mode/package.json`

**Interfaces:**
- Consumes: `undici` peer range from Task 1; `semver` devDependency from Task 1.
- Produces: a mocha spec that fails when Bolt's declared `undici` range is not a subset of socket-mode's `peerDependencies.undici`.

**Design notes:**
- Use `semver.subset(boltRange, socketModeRange)` — passes as long as every undici version Bolt accepts is acceptable to socket-mode. This tolerates cosmetic differences and only fails on a real incompatibility (e.g. socket-mode narrows to `^7.5.0` while Bolt stays `^7.0.0`).
- Resolve socket-mode's `package.json` via `require.resolve('@slack/socket-mode/package.json')` so the test reads the *installed* version, not a hardcoded string.
- Read Bolt's own `package.json` from the repo root (the spec file lives at `test/unit/`, so go up two levels).

- [ ] **Step 1: Write the failing test**

Create `test/unit/peer-dependencies.spec.ts`:

```typescript
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assert } from 'chai';
import semver from 'semver';

describe('undici peer dependency', () => {
  // Bolt's own package.json (repo root, two levels up from test/unit/).
  const boltPkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')) as {
    peerDependencies?: Record<string, string>;
  };
  // The installed @slack/socket-mode manifest, resolved from node_modules.
  const socketModePkg = JSON.parse(readFileSync(require.resolve('@slack/socket-mode/package.json'), 'utf8')) as {
    peerDependencies?: Record<string, string>;
  };

  it('is declared by Bolt', () => {
    assert.isDefined(
      boltPkg.peerDependencies?.undici,
      'Bolt must declare undici in peerDependencies so it provides the peer required by @slack/socket-mode',
    );
  });

  it("satisfies @slack/socket-mode's undici peer requirement", () => {
    const boltRange = boltPkg.peerDependencies?.undici;
    const socketModeRange = socketModePkg.peerDependencies?.undici;
    assert.isDefined(socketModeRange, '@slack/socket-mode should declare an undici peer dependency');
    assert.isString(boltRange);
    assert.isTrue(
      semver.subset(boltRange as string, socketModeRange as string),
      `Bolt's undici range "${boltRange}" must be a subset of @slack/socket-mode's "${socketModeRange}". ` +
        'Update peerDependencies.undici in package.json to match.',
    );
  });
});
```

- [ ] **Step 2: Build, then run the test to verify it passes**

Run: `npm run build && npm run test:unit -- --grep "undici peer dependency"`
Expected: both assertions PASS (Task 1 already added the matching `^7.0.0` range).

Note: this test is designed to pass once Task 1 is done. To confirm it genuinely guards, do Step 3.

- [ ] **Step 3: Temporarily prove the guard bites**

Temporarily edit `package.json` `peerDependencies.undici` to an incompatible range like `"^6.0.0"`, then run:
`npm run build && npm run test:unit -- --grep "undici peer dependency"`
Expected: the second test FAILS with the "must be a subset" message.
Then **revert** the range back to `"^7.0.0"` and re-run to confirm PASS.

- [ ] **Step 4: Run Biome on the new file**

Run: `npm run lint`
Expected: no lint errors. If formatting differs, run `npm run lint:fix` and re-check.

- [ ] **Step 5: Commit**

```bash
git add test/unit/peer-dependencies.spec.ts
git commit -m "$(cat <<'EOF'
test: guard undici peer range against @slack/socket-mode drift

Reads the installed @slack/socket-mode peerDependencies.undici at test time
and asserts Bolt's declared range is a semver subset, so the two can't
silently fall out of sync.

Co-Authored-By: Claude <svc-devxp-claude@slack-corp.com>
EOF
)"
```

---

### Task 3: Add changeset and docs note

**Files:**
- Create: `.changeset/undici-peer-dependency.md`
- Modify: `docs/english/concepts/socket-mode.md`

**Interfaces:**
- Consumes: nothing from prior tasks (documentation only).
- Produces: a patch changeset; a consumer-facing install note.

- [ ] **Step 1: Create the changeset**

Create `.changeset/undici-peer-dependency.md`:

```markdown
---
"@slack/bolt": patch
---

Declare `undici` as a peer dependency (`^7.0.0`). `@slack/bolt` constructs a `SocketModeClient` from `@slack/socket-mode@3`, which requires `undici@^7` as a peer. Consumers on strict package managers (Yarn Berry, pnpm) should install `undici` alongside `@slack/bolt`. Resolves #3039.
```

- [ ] **Step 2: Add the docs note**

In `docs/english/concepts/socket-mode.md`, immediately after the opening paragraph (the line ending `be sure to enable it within your app configuration.`), insert a blank line and this note:

```markdown
> #### Installing `undici`
>
> Socket Mode uses [`undici`](https://www.npmjs.com/package/undici) for its WebSocket connection, declared as a peer dependency. npm installs it automatically, but on strict package managers (Yarn Berry, pnpm) you may need to install it explicitly:
>
> ```shell
> npm install undici
> ```
```

- [ ] **Step 3: Lint docs**

Run: `npm run lint`
Expected: no errors (Biome checks `docs`).

- [ ] **Step 4: Commit**

```bash
git add .changeset/undici-peer-dependency.md docs/english/concepts/socket-mode.md
git commit -m "$(cat <<'EOF'
docs: note undici peer dependency for Socket Mode

Add changeset and a Socket Mode install note for strict package managers.

Co-Authored-By: Claude <svc-devxp-claude@slack-corp.com>
EOF
)"
```

---

### Task 4: Full pipeline verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: all prior tasks.
- Produces: green `npm test` run.

- [ ] **Step 1: Run the full test pipeline**

Run: `npm test`
Expected: build → lint → type tests → unit coverage all PASS, including `undici peer dependency` specs.

- [ ] **Step 2: If anything fails, fix and re-run**

Address failures, re-run `npm test` until green. Do not mark complete on a red pipeline.

- [ ] **Step 3: Push the branch and open a PR (only if the user asks)**

```bash
git push -u origin feat/undici-peer-dependency
```
Then open a PR referencing issue #3039. Do not push or open the PR without explicit user go-ahead.

---

## Self-Review

- **Spec coverage:**
  - `package.json` peer + devDeps → Task 1. ✓
  - Drift-guard test → Task 2. ✓
  - Changeset → Task 3 Step 1. ✓
  - Docs note → Task 3 Step 2. ✓
  - `npm test` verification → Task 4. ✓
  - Non-optional peer constraint → Global Constraints + Task 1 (no `peerDependenciesMeta`). ✓
- **Placeholder scan:** no TBD/TODO; all code and commands are concrete. ✓
- **Type consistency:** `boltRange`/`socketModeRange` typed and used consistently; `semver.subset(a, b)` argument order (bolt is subset of socket-mode) consistent between the design and the test. ✓
