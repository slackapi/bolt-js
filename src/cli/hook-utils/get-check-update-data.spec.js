require('mocha');
const sinon = require('sinon');
const { expect, assert } = require('chai');
const rewiremock = require('rewiremock/node');
const mockfs = require('mock-fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

let fileSystem = {
  'test-project': {
    'README.md': '1',
    '.github': {
      /** empty directory */
    },
    manifest: {
      /** empty directory */
    },
    triggers: {
      /** empty directory */
    },
    '.eslintignore': '1',
    '.eslintrc.json': '1',
    '.gitignore': {
      /** empty directory */
    },
    'app.js': '1',
    LICENSE: '1',
    'package.json': mockfs.load('./src/cli/hook-utils/test-json/test.json'),
    'slack.json': '1',
  },
};

async function importCheckUpdateDataMock(overrides) {
  return rewiremock.module(
    () => import('./get-check-update-data.js'),
    overrides
  );
}

describe('Slack CLI Script Hooks: check-update', () => {
  // Test getting package.json file
  it('returns an array of dependencies (just package.json) if it exists in directory', async () => {
    const { getJSONFiles } = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      'test-project': {
        'README.md': '1',
        '.github': {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        node_modules: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        '.eslintignore': '1',
        '.eslintrc.json': '1',
        '.gitignore': {
          /** empty directory */
        },
        'app.js': '1',
        LICENSE: '1',
        'package.json': mockfs.load('./src/cli/hook-utils/test-json/test.json'),
        'package-lock.json': '1',
        'slack.json': '1',
      },
    });

    const cwd = 'test-project';
    // Should not error
    const shouldNotThrow = async () => await getJSONFiles(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    // Get JSON dependency file (package.json) and make sure it records it
    const { jsonDepFiles, inaccessibleFiles } = await getJSONFiles(`${cwd}`);
    assert.isNotEmpty(jsonDepFiles);
    assert.deepEqual(jsonDepFiles, ['package.json']);

    mockfs.restore();
  });

  // test if package.json can't be found
  it(`returns an empty array of dependencies (just package.json) if it doesn't exist`, async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      'test-project': {
        'README.md': '1',
        '.github': {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        node_modules: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        '.eslintignore': '1',
        '.eslintrc.json': '1',
        '.gitignore': {
          /** empty directory */
        },
        'app.js': '1',
        LICENSE: '1',
        'package-lock.json': '1',
        'slack.json': '1',
      },
    });

    const cwd = 'test-project';
    // Should not error
    const shouldNotThrow = async () => await output.getJSONFiles(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    // Get JSON dependency file (package.json) and make sure it records it
    const { jsonDepFiles, inaccessibleFiles } = await output.getJSONFiles(
      `${cwd}`
    );
    assert.isEmpty(jsonDepFiles);
    assert.deepEqual(jsonDepFiles, []);

    mockfs.restore();
  });

  // Test if package.json can be read
  it('returns JSON file if package.json exists', async () => {
    const { getJSON } = await importCheckUpdateDataMock();

    // Mock Bolt JS file system
    mockfs({
      'test-project': {
        'README.md': '1',
        '.github': {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        node_modules: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        '.eslintignore': '1',
        '.eslintrc.json': '1',
        '.gitignore': {
          /** empty directory */
        },
        'app.js': '1',
        LICENSE: '1',
        'package.json': mockfs.load('./src/cli/hook-utils/test-json/test.json'),
        'package-lock.json': '1',
        'slack.json': '1',
      },
    });

    const cwd = 'test-project';
    // Should not error
    const shouldNotThrow = async () => await getJSON(`${cwd}/package.json`);
    assert.doesNotThrow(shouldNotThrow);

    // Check returned package.json data and make sure it's valid
    const jsonData = await getJSON(`${cwd}/package.json`);
    assert.isNotEmpty(jsonData);
    assert.containsAllKeys(jsonData, ['dependencies']);

    mockfs.restore();
  });

  // Test for successful version map that needs upgrade
  // TODO: getting error here, will need to add messaging to assert messages
  it('returns a version map indicating it needs upgrades if it can access package.json and finds all dependencies', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubBoltFunc = sinon.stub(
      output.dependencyExports,
      'getBoltCurrentVersion'
    );
    stubBoltFunc.returns(`{
      "version": "1.0.0",
      "name": "bolt-js-template",
      "dependencies": {
        "@slack/bolt": {
          "version": "4.0.0-nextGen.2",
          "overridden": false
        }
      }
    }`);

    var stubDenoFunc = sinon.stub(
      output.dependencyExports,
      'getDenoCurrentVersion'
    );
    stubDenoFunc.returns(`{
      "version": "1.0.0",
      "name": "bolt-js-template",
      "dependencies": {
        "@slack/deno-slack-sdk": {
          "version": "1.1.9",
          "overridden": false
        }
      }
    }`);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '4.0.0-nextGen.2', 'has current Bolt version');
    assert.equal(versionMap.releases[0].update, true, 'Bolt can be updated');
    assert.equal(versionMap.releases[0].breaking, false, 'Bolt update is not breaking change');
    assert.equal(versionMap.releases[1].name, '@slack/deno-slack-sdk', 'has Deno dependency');
    assert.equal(versionMap.releases[1].current, '1.1.9', 'has current Deno version');
    assert.equal(versionMap.releases[1].update, true, 'Deno can be updated');
    assert.equal(versionMap.releases[1].breaking, false, 'Deno update is not breaking change');

    mockfs.restore();
  });

  // Test for breaking changes in version map
  it('returns a version map indicating breaking changes', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubBoltFunc = sinon.stub(
      output.dependencyExports,
      'getBoltCurrentVersion'
    );
    stubBoltFunc.returns(`{
      "version": "1.0.0",
      "name": "bolt-js-template",
      "dependencies": {
        "@slack/bolt": {
          "version": "3.0.0-nextGen.6",
          "overridden": false
        }
      }
    }`);

    var stubDenoFunc = sinon.stub(
      output.dependencyExports,
      'getDenoCurrentVersion'
    );
    stubDenoFunc.returns(`{
      "version": "1.0.0",
      "name": "bolt-js-template",
      "dependencies": {
        "@slack/deno-slack-sdk": {
          "version": "0.2.0",
          "overridden": false
        }
      }
    }`);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '3.0.0-nextGen.6', 'has current Bolt version');
    assert.equal(versionMap.releases[0].update, true, 'Bolt can be updated');
    assert.equal(versionMap.releases[0].breaking, true, 'Bolt update is breaking change');
    assert.equal(versionMap.releases[1].name, '@slack/deno-slack-sdk', 'has Deno dependency');
    assert.equal(versionMap.releases[1].current, '0.2.0', 'has current Deno version');
    assert.equal(versionMap.releases[1].update, true, 'Deno can be updated');
    assert.equal(versionMap.releases[1].breaking, true, 'Deno update is breaking change');

    mockfs.restore();
  });

  // Test if only @slack/bolt is found
  // Test for breaking changes in version map
  it('returns a version map without a Deno SDK version', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubExtractDependencies = sinon.stub(
      output.dependencyExports,
      'extractDependencies'
    );
    stubExtractDependencies.returns([
      [
        '@slack/bolt',
        {
          version: '4.0.0-nextGen.6',
        },
      ],
      [
        '@slack/deno-slack-sdk',
        {
          version: '',
        },
      ],
    ]);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '4.0.0-nextGen.6', 'has current Bolt version');
    assert.equal(versionMap.releases[0].update, false, `Bolt can't be updated`);
    assert.equal(versionMap.releases[0].breaking, false, 'Bolt update is breaking change');
    assert.equal(versionMap.releases[1].name, '@slack/deno-slack-sdk', 'has Deno dependency');
    assert.equal(versionMap.releases[1].current, '', 'has no current Deno version');
    assert.equal(versionMap.releases[1].update, false, `Deno can't be updated`);
    assert.equal(versionMap.releases[1].breaking, true, 'Deno update is breaking change');

    mockfs.restore();
  });

  // Test if only @slack/deno-slack-sdk is found
  it('returns a version map without a Bolt version', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubExtractDependencies = sinon.stub(
      output.dependencyExports,
      'extractDependencies'
    );
    stubExtractDependencies.returns([
      [
        '@slack/bolt',
        {
          version: '',
        },
      ],
      [
        '@slack/deno-slack-sdk',
        {
          version: '1.2.0',
        },
      ],
    ]);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '', 'has no current Bolt version');
    assert.equal(versionMap.releases[0].update, false, `Bolt can't be updated`);
    assert.equal(versionMap.releases[0].breaking, true, 'Bolt update is breaking change');
    assert.equal(versionMap.releases[1].name, '@slack/deno-slack-sdk', 'has Deno dependency');
    assert.equal(versionMap.releases[1].current, '1.2.0', 'has current Deno version');
    assert.equal(versionMap.releases[1].update, false, `Deno can't be updated`);
    assert.equal(versionMap.releases[1].breaking, false, 'Deno update is not breaking change');

    mockfs.restore();
  });
});
