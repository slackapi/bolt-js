const fs = require('fs');
const path = require('path');

// helper array merge function
function unionMerge(array1, array2) {
  return [...new Set(array1.concat(array2))];
}

// look for manifest.json in the current working directory
function readManifestJSONFile(cwd, filename) {
  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = find(cwd, filename);
    if (fs.existsSync(jsonFilePath)) {
      manifestJSON = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
  } catch (error) {
    return;
  }
  return manifestJSON;
}

// look for a manifest file in the current working directory
function readImportedManifestFile(cwd, filename) {
  let importedManifestFilePath, manifestImported;

  try {
    importedManifestFilePath = find(cwd, filename);
    if (fs.existsSync(importedManifestFilePath)) {
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

module.exports = {
  unionMerge,
  readManifestJSONFile,
  readImportedManifestFile,
  hasManifest,
  find,
}