#!/usr/bin/env node
// Manifest script hook returns a manifest JSON if it exists in the working directory
const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');

/** 
 * Implements the get-manifest script hook required by the Slack CLI
 * Returns a manifest.json to stdout
 * Looks for a manifest.ts, .js and .json files. If multiple are found 
 * Then they will be deepmerged in a way where .ts overwrites .js overwrites .json
 * When no file is found, script returns empty json blob
*/
(function _(cwd) {
  const file = 'manifest';
  let manifestJSON, manifestTS, manifestJS;
  
  // look for a manifest files
  manifestTS = readImportedManifestFile(cwd, `${file}.ts`);
  manifestJS = readImportedManifestFile(cwd, `${file}.js`);
  manifestJSON = readManifestJSONFile(cwd, `${file}.json`);

  if (multipleManifests(manifestJS, manifestTS, manifestJSON)) {
    console.log('Warning, multiple manifests may exist. We strongly recommend supplying a single manifest file. Valid formats: .ts, .js, or .json.')
  }
  // merge if required and return output
  try {
    let manifest = merge(manifestJSON, manifestJS);
    manifest = merge(manifest, manifestTS);
    // console.log(manifest);
    console.log(JSON.stringify(manifest));
  } catch (error) {
    throw new Error(`Error generating manifest: ${error}`);
  }
  // return the manifest
}(process.cwd()));

// look for manifest.json in the current working directory
function readManifestJSONFile (cwd, filename) {
  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = path.resolve(cwd, filename);
    manifestJSON = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
  } catch (error) {
    return {};
  }
  return manifestJSON;
}

// look for a manifest file in the current working directory
function readImportedManifestFile (cwd, filename) {
  let jsFilePath, manifestImported;
  try {
    jsFilePath = path.resolve(cwd, filename);
    console.log(jsFilePath)
    manifestImported = require(`${jsFilePath}`);
  } catch (error) {
    console.log(error);
    return {};
  }
  return manifestImported;
};

// returns true if at least two provided objects is non-empty
function multipleManifests (...manifests) {
  let mCount = 0;
  for (let m of manifests) {
    if (Object.keys(m).length > 0) {
      mCount++;
    }
  }
  return mCount > 1; 
}
// removes manifest attributes that don't belong in API payloads
// function prepareManifest = (manifest) => {
//   // remove function source_file
// }