#!/usr/bin/env node
const merge = require('deepmerge');
const { unionMerge, readManifestJSONFile, readImportedManifestFile, hasManifest } = require('./hook-utils/manifest');

/** 
 * Implements the get-manifest script hook required by the Slack CLI
 * Returns a manifest JSON string to stdout.
 * Looks for a manifest.ts, .js and .json files. If multiple are found 
 * Then any manifest.ts (or missing that, manifest.js) defined
 * properties will merge into any manifest.json
*/
(function _(cwd) {
  const file = 'manifest';
  let manifest = {};

  // look for a manifest files
  const manifestJSON = readManifestJSONFile(cwd, `${file}.json`);
  const manifestTS = readImportedManifestFile(cwd, `${file}.ts`);
  const manifestJS = readImportedManifestFile(cwd, `${file}.js`);

  if (!hasManifest(manifestTS, manifestJS, manifestJSON)) {
    throw new Error('Unable to find a manifest file in this project');
  }

  // manage manifest merge
  // check for .json
  if (manifestJSON) {
    manifest = merge(manifest, manifestJSON, { arrayMerge: unionMerge});
  }
  // check for either .ts or .js file
  if (manifestTS) {
    manifest = merge(manifest, manifestTS, { arrayMerge: unionMerge });
  } else if (manifestJS) {
    manifest = merge(manifest, manifestJS, { arrayMerge: unionMerge });
  }
    
  // write the merged manifest to stdout
  console.log(JSON.stringify(manifest));
}(process.cwd()));