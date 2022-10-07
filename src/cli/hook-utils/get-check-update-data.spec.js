require("mocha");
const sinon = require("sinon");
const { expect, assert } = require("chai");
const rewiremock = require("rewiremock/node");
const mockfs = require("mock-fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

async function importCheckUpdateDataMock(overrides) {
  return rewiremock.module(
    () => import("./get-check-update-data.js"),
    overrides
  );
}

describe("Slack CLI Script Hooks: check-update", () => {
  // Test getting package.json file
  it("returns an array of dependencies (just package.json) if it exists in directory", async () => {
    const { getJSONFiles } = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
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
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "package-lock.json": "1",
        "slack.json": "1",
      },
    });

    const cwd = "test-project";
    // Should not error
    const shouldNotThrow = async () => await getJSONFiles(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    // Get JSON dependency file (package.json) and make sure it records it
    const { jsonDepFiles, inaccessibleFiles } = await getJSONFiles(`${cwd}`);
    assert.isNotEmpty(jsonDepFiles);
    assert.deepEqual(jsonDepFiles, ["package.json"]);

    mockfs.restore();
  });

  // test if package.json can't be found
  it("returns an empty array of dependencies (just package.json) if it doesn't exist", async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
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
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package-lock.json": "1",
        "slack.json": "1",
      },
    });

    const cwd = "test-project";
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
  it("returns JSON file if package.json exists", async () => {
    const { getJSON } = await importCheckUpdateDataMock();

    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
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
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "package-lock.json": "1",
        "slack.json": "1",
      },
    });

    const cwd = "test-project";
    // Should not error
    const shouldNotThrow = async () => await getJSON(`${cwd}/package.json`);
    assert.doesNotThrow(shouldNotThrow);

    // Check returned package.json data and make sure it's valid
    const jsonData = await getJSON(`${cwd}/package.json`);
    assert.isNotEmpty(jsonData);
    assert.containsAllKeys(jsonData, ["dependencies"]);

    mockfs.restore();
  });

  // Test for successful version map that needs upgrade
  it("returns a version map indicating it needs upgrades if it can access package.json and finds all dependencies", async () => {
    const output = await importCheckUpdateDataMock({});
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "slack.json": "1",
      },
    });

    const cwd = "test-project";

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubBoltFunc = sinon.stub(
      output.currentVersionFunctions,
      "getBoltCurrentVersion"
    );
    stubBoltFunc.returns(`{
      "version": "1.0.0",
      "name": "bolt-js-template",
      "dependencies": {
        "@slack/bolt": {
          "version": "4.0.0-nextGen.6",
          "overridden": false
        }
      }
    }`);

    var stubDenoFunc = sinon.stub(
      output.currentVersionFunctions,
      "getDenoCurrentVersion"
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
    assert.equal(versionMap.releases[0].name, "@slack/bolt");
    assert.equal(versionMap.releases[0].current, "4.0.0-nextGen.6");
    assert.equal(versionMap.releases[0].update, true);
    assert.equal(versionMap.releases[0].breaking, false);
    assert.equal(versionMap.releases[1].name, "@slack/deno-slack-sdk");
    assert.equal(versionMap.releases[1].current, "1.1.9");
    assert.equal(versionMap.releases[1].update, true);
    assert.equal(versionMap.releases[1].breaking, false);

    mockfs.restore();
  });

  // Test for breaking changes in version map
  it("returns a version map indicating breaking changes", async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "slack.json": "1",
      },
    });

    const cwd = "test-project";

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubBoltFunc = sinon.stub(
      output.currentVersionFunctions,
      "getBoltCurrentVersion"
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
      output.currentVersionFunctions,
      "getDenoCurrentVersion"
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
    assert.equal(versionMap.releases[0].name, "@slack/bolt");
    assert.equal(versionMap.releases[0].current, "3.0.0-nextGen.6");
    assert.equal(versionMap.releases[0].update, true);
    assert.equal(versionMap.releases[0].breaking, true);
    assert.equal(versionMap.releases[1].name, "@slack/deno-slack-sdk");
    assert.equal(versionMap.releases[1].current, "0.2.0");
    assert.equal(versionMap.releases[1].update, true);
    assert.equal(versionMap.releases[1].breaking, true);

    mockfs.restore();
  });

  // Test if only @slack/bolt is found
  // Test for breaking changes in version map
  it("returns a version map without a Deno SDK version", async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "slack.json": "1",
      },
    });

    const cwd = "test-project";

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubExtractDependencies = sinon.stub(
      output.currentVersionFunctions,
      "extractDependencies"
    );
    stubExtractDependencies.returns([
      [
        "@slack/bolt",
        {
          version: "4.0.0-nextGen.6",
        },
      ],
      [
        "@slack/deno-slack-sdk",
        {
          version: "",
        },
      ],
    ]);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, "@slack/bolt");
    assert.equal(versionMap.releases[0].current, "4.0.0-nextGen.6");
    assert.equal(versionMap.releases[0].update, false);
    assert.equal(versionMap.releases[0].breaking, false);
    assert.equal(versionMap.releases[1].name, "@slack/deno-slack-sdk");
    assert.equal(versionMap.releases[1].current, "");
    assert.equal(versionMap.releases[1].update, false);
    assert.equal(versionMap.releases[1].breaking, true);

    mockfs.restore();
  });

  // Test if only @slack/deno-slack-sdk is found
  it("returns a version map without a Bolt version", async () => {
    const output = await importCheckUpdateDataMock();
    // Mock Bolt JS file system
    mockfs({
      "test-project": {
        "README.md": "1",
        ".github": {
          /** empty directory */
        },
        manifest: {
          /** empty directory */
        },
        triggers: {
          /** empty directory */
        },
        ".eslintignore": "1",
        ".eslintrc.json": "1",
        ".gitignore": {
          /** empty directory */
        },
        "app.js": "1",
        LICENSE: "1",
        "package.json": mockfs.load("./src/cli/hook-utils/test-json/test.json"),
        "slack.json": "1",
      },
    });

    const cwd = "test-project";

    // Should not error
    const shouldNotThrow = async () =>
      await output.checkForSDKUpdates(`${cwd}`);
    assert.doesNotThrow(shouldNotThrow);

    var stubExtractDependencies = sinon.stub(
      output.currentVersionFunctions,
      "extractDependencies"
    );
    stubExtractDependencies.returns([
      [
        "@slack/bolt",
        {
          version: "",
        },
      ],
      [
        "@slack/deno-slack-sdk",
        {
          version: "1.2.0",
        },
      ],
    ]);

    // call check for SDK updates
    const versionMap = await output.checkForSDKUpdates(`${cwd}`);
    assert.isNotEmpty(versionMap);
    assert.equal(versionMap.releases[0].name, "@slack/bolt");
    assert.equal(versionMap.releases[0].current, "");
    assert.equal(versionMap.releases[0].update, false);
    assert.equal(versionMap.releases[0].breaking, true);
    assert.equal(versionMap.releases[1].name, "@slack/deno-slack-sdk");
    assert.equal(versionMap.releases[1].current, "1.2.0");
    assert.equal(versionMap.releases[1].update, false);
    assert.equal(versionMap.releases[1].breaking, false);

    mockfs.restore();
  });
});
