import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { assert } from 'chai';
import semver from 'semver';

// createRequire is needed for require.resolve in ESM contexts (Node 20+).
const moduleRequire = createRequire(join(process.cwd(), 'package.json'));

describe('undici peer dependency', () => {
  // Bolt's own package.json (repo root).
  const boltPkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
    peerDependencies?: Record<string, string>;
  };
  // The installed @slack/socket-mode manifest, resolved from node_modules.
  const socketModePkg = JSON.parse(readFileSync(moduleRequire.resolve('@slack/socket-mode/package.json'), 'utf8')) as {
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
