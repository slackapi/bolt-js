require('mocha');
const sinon = require('sinon');
const { expect, assert } = require('chai');
const rewiremock = require('rewiremock/node');
const { hasManifest } = require('./manifest');
const merge = require('deepmerge');

async function importGetManifestDataMock(overrides) {
  return rewiremock.module(() => import('./get-manifest-data.js'), overrides);
}

describe('Slack CLI Script Hooks: get-manifest-data', () => {
  it('returns a manifest object, when manifest.json and .js exist', async () => {
    // Override methods that return manifest file data
    const { getManifestData } = await importGetManifestDataMock({
      './manifest.js': {
        'readManifestJSONFile': () => ({
          testJSONKey: ''
        }),
        'readImportedManifestFile': () => ({
          testModuleKey: ''
        }),
        'hasManifest': hasManifest,
        'merge': merge
      }
    });
   
    // doesnt error
    const shouldNotThrow = () => getManifestData('testSearchDir', 'testFilename');
    assert.doesNotThrow(shouldNotThrow);

    // returns a manifest with keys
    const manifestData = getManifestData('testSearchDir', 'testFilename');
    assert.isNotEmpty(manifestData);
    assert.containsAllKeys(manifestData, ['testJSONKey', 'testModuleKey']);
  });
  it('returns a manifest object, when manifest.json exists', async () => {
    const { getManifestData } = await importGetManifestDataMock({
      './manifest.js': {
        'readManifestJSONFile': () => ({
          testJSONKey: ''
        }),
        'readImportedManifestFile': () => null, // no manifest.js found
        'hasManifest': hasManifest,
        'merge': merge
      }
    });
   
    // doesnt error
    const shouldNotThrow = () => getManifestData('testSearchDir', 'testFilename');
    assert.doesNotThrow(shouldNotThrow);

    // returns a manifest
    const manifestData = getManifestData('testSearchDir', 'testFilename');
    assert.isNotEmpty(manifestData);
    assert.containsAllKeys(manifestData, ['testJSONKey']);
    assert.doesNotHaveAllKeys(manifestData, ['testModuleKey']);
  });
  it('returns a manifest object, when manifest.js exists', async () => {
    // Override readManifestJSON to return a value
    const { getManifestData } = await importGetManifestDataMock({
      './manifest.js': {
        'readManifestJSONFile': () => null,
        'readImportedManifestFile': () => ({
          testModuleKey: ''
        }),
        'hasManifest': hasManifest,
        'merge': merge
      }
    });
   
    // doesnt error
    const shouldNotThrow = () => getManifestData('testSearchDir', 'testFilename');
    assert.doesNotThrow(shouldNotThrow);

    // returns a manifest
    const manifestData = getManifestData('testSearchDir', 'testFilename');
    assert.isNotEmpty(manifestData);
    assert.containsAllKeys(manifestData, ['testModuleKey']);
    assert.doesNotHaveAllKeys(manifestData, ['testJSONKey']);
  });
  it('errors when no manifest js or json exist', async () => {
    // Override neither manifest json nor js found
    const { getManifestData } = await importGetManifestDataMock({
      './manifest.js': {
        'readManifestJSONFile': () => null,
        'readImportedManifestFile': () => null,
        'hasManifest': hasManifest,
        'merge': merge
      }
    });
   
    // doesnt error
    const shouldThrow = () => getManifestData('testSearchDir', 'testFilename');
    assert.throws(shouldThrow, Error, 'Unable to find a manifest');
  });
});
