# Undici Peer Dependency Design

**Issue:** [slackapi/bolt-js#3039](https://github.com/slackapi/bolt-js/issues/3039)

## Problem

`@slack/socket-mode@3.0.0` declares `undici@^7.0.0` as a **peer dependency** (v3
replaced `ws` with `undici`). `@slack/bolt` depends on `@slack/socket-mode@^3.0.0`
and constructs `SocketModeClient` internally (`src/receivers/SocketModeReceiver.ts`),
but Bolt neither declares `undici` as a dependency nor forwards it as a peer.

As a result, nothing in the ancestor chain formally *provides* the `undici` peer
that socket-mode requires. Strict package managers surface this:

```text
@slack/bolt@npm:5.0.0 doesn't provide undici to @slack/socket-mode@npm:3.0.0
```

npm 7+ hides the gap by auto-installing peers of transitive deps; Yarn Berry /
pnpm validate strictly and report the unmet peer.

### Load-time reality

`undici` is loaded **eagerly by every Bolt app**, not just Socket Mode apps.
Verified at runtime: `require('@slack/bolt')` pulls in `undici`. The chain is
static, top-level `require`s all the way down:

`src/index.ts` → `import SocketModeReceiver`
→ `import { SocketModeClient } from '@slack/socket-mode'`
→ `require("undici")` at the top of `SocketModeClient.js`.

There is no lazy/dynamic import in that path, so `undici` is required at
module-load time even for a plain HTTP-receiver app.

## Decision

Declare `undici@^7.0.0` in Bolt's `peerDependencies` (**not** marked optional).

- **Not optional** is technically accurate: without `undici`, `require('@slack/bolt')`
  throws `Cannot find module 'undici'` for *all* consumers.
- Matches socket-mode's own range (`^7.0.0`), so any future `7.x` peer bump in
  socket-mode stays satisfied automatically. The range would only need touching
  on an `undici` **major** bump — which coincides with a `@slack/socket-mode`
  major upgrade done deliberately.

### Trade-off (accepted, on record)

Because `undici` loads eagerly regardless of receiver, a required (non-optional)
peer means existing v5 consumers on strict package managers who do **not** use
Socket Mode will now see a peer warning / be required to install `undici`, even
for a plain HTTP app. This is a minor behavior change for an already-released
major. Mitigated by the docs note and the drift-guard test below.

### Sync burden

There is no package.json mechanism to *inherit* a transitive peer's version
range — a declared range is static, so some duplication is unavoidable. Two
things make drift harmless and self-detecting:

1. Matching caret range (`^7.0.0`) absorbs all `7.x` peer bumps automatically.
2. A drift-guard unit test fails CI if Bolt's declared range ever becomes
   incompatible with socket-mode's actual `peerDependencies.undici`.

## Scope

1. **`package.json`** — add `undici: "^7.0.0"` to `peerDependencies`; add
   `semver` + `@types/semver` to `devDependencies` for the guard test.
2. **Drift-guard test** — `test/unit/peer-dependencies.spec.ts`. Reads Bolt's
   own declared `undici` peer range and the installed
   `@slack/socket-mode` `peerDependencies.undici`; asserts Bolt declares
   `undici` and that `semver.subset(boltRange, socketModeRange)` is `true`.
3. **Changeset** — patch entry describing the new peer dependency.
4. **Docs** — note in `docs/english/concepts/socket-mode.md` that consumers on
   strict package managers must install `undici` alongside `@slack/bolt`.
   (Japanese mirror out of scope for this change.)

## Non-goals

- Fixing `@slack/socket-mode` itself (different repo) — out of scope here.
- Marking the peer optional — rejected as inaccurate given eager load.
- Adding `undici` as a regular `dependency` — considered; peer chosen instead.

## Verification

Full `npm test` pipeline (build → lint → type tests → unit coverage) passes,
including the new guard test.
