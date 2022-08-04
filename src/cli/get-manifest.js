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

  // look for a manifest JSON
  const manifestJSON = readManifestJSONFile(cwd, `${file}.json`);
  
  // look for manifest.js
  // stringify and parses the JSON in order to ensure that objects with .toJSON() functions
  // resolve properly. This is a known behavior for CustomType
  const manifestJS = JSON.parse(JSON.stringify(readImportedManifestFile(cwd, `${file}.js`)));

  if (!hasManifest(manifestJS, manifestJSON)) {
    throw new Error('Unable to find a manifest file in this project');
  }

  // manage manifest merge
  if (manifestJSON) {
    manifest = merge(manifest, manifestJSON, { arrayMerge: unionMerge});
  }  
  if (manifestJS) {
    manifest = merge(manifest, manifestJS, { arrayMerge: unionMerge });
  }
    
  // write the merged manifest to stdout
  console.log(JSON.stringify(manifest));
}(process.cwd()));