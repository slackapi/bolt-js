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
    const { jsonDepFile, inaccessibleFiles } = await getJSONFiles(`${cwd}`);
    assert.isNotEmpty(jsonDepFile);
    assert.deepEqual(jsonDepFile, {
      body: {
        "name": "bolt-js-template",
        "version": "1.0.0",
        "description": "A scaffold template for Slack apps",
        "main": "app.js",
        "scripts": {
          "start": "node app.js",
          "lint": "eslint --ext .js ."
        },
        "author": "Slack Technologies, LLC",
        "license": "MIT",
        "keywords": [
          "slack",
          "bolt",
          "slackapi"
        ],
        "repository": {
          "type": "git",
          "url": "https://github.com/slackapi/bolt-js-template.git"
        },
        "bugs": {
          "url": "https://github.com/slackapi/bolt-js-template/issues"
        },
        "dependencies": {
          "@slack/bolt": "4.0.0-nextGen.2",
          "@slack/deno-slack-sdk": "1.1.9",
          "dotenv": "~16.0.3"
        },
        "devDependencies": {
          "eslint": "~8.24.0",
          "eslint-config-airbnb-base": "~15.0.0",
          "eslint-plugin-import": "~2.26.0"
        }
      },
      name: "package.json"  
    });

    mockfs.restore();
  });

  // test if package.json can't be found
  it(`returns an empty dependency object if package.json doesn't exist`, async () => {
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
    const { jsonDepFile, inaccessibleFiles } = await output.getJSONFiles(
      `${cwd}`
    );
    assert.isEmpty(jsonDepFile);
    assert.deepEqual(jsonDepFile, {});

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

  it('checking for SDK updates does not throw an error', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    var stubBoltFunc = sinon.stub(
      output.checkUpdateExports,
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

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    mockfs.restore();
  });

  // Test for successful version map that needs upgrade
  it('returns a version map indicating it needs upgrades if it can access package.json and finds all dependencies', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    var stubBoltFunc = sinon.stub(
      output.checkUpdateExports,
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

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '4.0.0-nextGen.2', 'has a current Bolt version');
    assert.equal(versionMap.releases[0].update, true, 'Bolt can be updated');
    assert.equal(versionMap.releases[0].breaking, false, 'Bolt update is not breaking change');

    mockfs.restore();
  });

  // Test for breaking changes in version map
  it('returns a version map indicating breaking changes', async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs(fileSystem);

    const cwd = 'test-project';

    var stubBoltFunc = sinon.stub(
      output.checkUpdateExports,
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

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, '@slack/bolt', 'has Bolt dependency');
    assert.equal(versionMap.releases[0].current, '3.0.0-nextGen.6', 'has a current Bolt version');
    assert.equal(versionMap.releases[0].update, true, 'Bolt can be updated');
    assert.equal(versionMap.releases[0].breaking, true, 'Bolt update is breaking change');

    mockfs.restore();
  });
});
