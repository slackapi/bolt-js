#!/usr/bin/env node
const { getManifestData } = require('./hook-utils/manifest');

/** 
 * Implements the get-manifest script hook required by the Slack CLI
 * Returns a manifest JSON string to stdout.
 * Looks for a manifest.ts, .js and .json files. If multiple are found 
 * Then any manifest.ts (or missing that, manifest.js) defined
 * properties will merge into any manifest.json
*/
(function _(cwd) {
  let manifest = getManifestData(cwd);
    
  // write manifest to stdout
  console.log(JSON.stringify(manifest));
}(process.cwd()));