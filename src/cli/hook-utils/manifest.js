const fs = require('fs');
const path = require('path');
const merge = require('deepmerge');

// helper array merge function
function unionMerge(array1, array2) {
  return [...new Set(array1.concat(array2))];
}

// look for manifest.json in the current working directory
function readManifestJSONFile(searchDir, filename) {
  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = find(searchDir, filename);
    if (fs.existsSync(jsonFilePath)) {
      manifestJSON = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
  } catch (error) {
    return;
  }
  return manifestJSON;
}

// look for a manifest file in the current working directory
function readImportedManifestFile(searchDir, filename) {
  let importedManifestFilePath, manifestImported;

  try {
    importedManifestFilePath = find(searchDir, filename);
    if (fs.existsSync(importedManifestFilePath)) {
      manifestImported = require(`${importedManifestFilePath}`);
      
      // if a default key is provided, assumes default export contains manifest
      if (manifestImported["default"]) {
        manifestImported = manifestImported["default"]
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
  return manifestImported;
}

// true if any non empty manifest has been supplied
function hasManifest(...entries) {
  for (let ent of entries) {
    if (ent && (Object.keys(ent).length > 0)) {
      return true;
    }
  }
  return false;
}

// recursive search for provided path and return full path when filename is found
// TODO: Cache searched paths and check that they haven't been explored already
// This guards against rare edge case of a subdir in the file tree which is 
// symlinked back to root or in such a way that creates a cycle. Can also implement
// max depth check. 
function find(currentPath, targetFilename) {
  if (currentPath.endsWith(`/${targetFilename}`)) {
    return currentPath;
  }

  if (fs.existsSync(currentPath) && fs.lstatSync(currentPath).isDirectory()) {
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
    return null;
  }
}

function getManifestData(searchDir) {
  const file = 'manifest';
  let manifest = {};

  // look for a manifest JSON
  const manifestJSON = readManifestJSONFile(searchDir, `${file}.json`);
  
  // look for manifest.js
  // stringify and parses the JSON in order to ensure that objects with .toJSON() functions
  // resolve properly. This is a known behavior for CustomType
  const manifestJS = JSON.parse(JSON.stringify(readImportedManifestFile(searchDir, `${file}.js`)));

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
  return manifest;
} 

module.exports = {
  getManifestData,
  unionMerge,
  readManifestJSONFile,
  readImportedManifestFile,
  hasManifest,
  find,
}