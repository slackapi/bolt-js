const fs = require('fs');
const path = require('path');

// helper array merge function
function unionMerge(array1, array2) {
  return [...new Set(array1.concat(array2))];
}

// look for manifest.json in the current working directory
function readManifestJSONFile(cwd, filename, options = {}) {
  //affordance for testing
  const fsModule = (options.mockfs !== undefined) ? options.mockfs : fs;

  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = find(cwd, filename, options);
    if (fsModule.existsSync(jsonFilePath)) {
      manifestJSON = JSON.parse(fsModule.readFileSync(jsonFilePath, 'utf8'));
    }
  } catch (error) {
    return;
  }
  return manifestJSON;
}

// look for a manifest file in the current working directory
function readImportedManifestFile(cwd, filename, options = {}) {
  //affordance for testing
  const fsModule = (options.mockfs !== undefined) ? options.mockfs : fs;

  let importedManifestFilePath, manifestImported;

  try {
    importedManifestFilePath = find(cwd, filename, options);
    if (fsModule.existsSync(importedManifestFilePath)) {
      manifestImported = require(`${importedManifestFilePath}`);
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

// removes manifest attributes that don't belong in API payloads
// TODO, do we need  to be able to export this or should we write this
// ourselves? 
// function prepareManifest = (manifest) => {
//   // remove function source_file
// }

// recursive search for provided path and return full path when filename is found
function find(currentPath, targetFilename, options = {}) {
  // affordance for testing
  const fsModule = (options.mockfs !== undefined) ? options.mockfs : fs;
  
  if (currentPath.endsWith(`/${targetFilename}`)) {
    return currentPath;
  }

  if (fsModule.existsSync(currentPath) && fsModule.lstatSync(currentPath).isDirectory()) {
    let foundEntry;
    let dirents = fsModule.readdirSync(currentPath);
    for (let entry of dirents) {
      if (entry !== 'node_modules') {
        let newPath = path.resolve(currentPath, entry);
        foundEntry = find(newPath, targetFilename, options);
        if (foundEntry) {
          return foundEntry;
        }
      }
    }
  }
}

module.exports = {
  unionMerge,
  readManifestJSONFile,
  readImportedManifestFile,
  hasManifest,
  find,
}