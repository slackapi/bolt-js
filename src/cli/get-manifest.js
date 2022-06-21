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

  if (!hasManifest(manifestTS, manifestJS, manifestJSON)) {
    throw new Error('A valid m was found in this project');
  }

  // merge if required and return output
  try {
    let manifest = merge(manifestJSON, manifestJS);
    manifest = merge(manifest, manifestTS);
    
    // write the merged manifest to stdout
    console.log(JSON.stringify(manifest));
  } catch (error) {
    throw new Error(`Error generating manifest: ${error}`);
  }
}(process.cwd()));

// look for manifest.json in the current working directory
function readManifestJSONFile (cwd, filename) {
  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = find(cwd, filename);
    if (fs.existsSync(jsonFilePath)) {
      manifestJSON = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
  } catch (error) {
    return {};
  }
  return manifestJSON;
}

// look for a manifest file in the current working directory
function readImportedManifestFile (cwd, filename) {
  let jsFilePath, manifestImported;

  try {
    jsFilePath = find(cwd, filename);
    if (fs.existsSync(jsFilePath)) {
      manifestImported = require(`${jsFilePath}`);
    }
  } catch (error) {
    console.log(error);
    return {};
  }
  return manifestImported;
}

// true if any non empty manifest has been supplied
function hasManifest(...entries) {
  console.log(entries);
  for (let ent of entries) {
    if (ent && (Object.keys(ent).length > 0)) {
      return true;
    }
  }
  return false;
}

// removes manifest attributes that don't belong in API payloads
// TODO, do we need  to be able to export this or should we write this
// ourselves? 
// function prepareManifest = (manifest) => {
//   // remove function source_file
// }

// recursive search for provided path and return full path when filename is found
function find(currentPath, targetFilename) {
  if (currentPath.endsWith(`/${targetFilename}`)) {
    return currentPath;
  }

  if (fs.existsSync(currentPath) && fs.lstatSync(currentPath).isDirectory()) {
    // get entries
    let foundEntry;
    let dirents = fs.readdirSync(currentPath);
    for (let entry of dirents) {
      if (entry !== 'node_modules') {
        let newPath = path.resolve(currentPath, entry);
        foundEntry = find(newPath, targetFilename);
        if (foundEntry) {
          return foundEntry;
        }
      }
    }
  }
}


// :todo: deep merge of arrays is a little janky (it creates multiple values) - test to see if deno does that too
// :todo: implement a find