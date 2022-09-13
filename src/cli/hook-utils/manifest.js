const fs = require('fs');
const path = require('path');

/** 
 * Union merge of arrays
 */
function unionMerge(array1, array2) {
  return [...new Set(array1.concat(array2))];
}

/** 
 * Returns a manifest.json if it exists, null otherwise
 * @param searchDir typically current working directory
 * @param filename file to search for
 */
function readManifestJSONFile(searchDir, filename) {
  let jsonFilePath, manifestJSON;
  try {
    jsonFilePath = find(searchDir, filename);
    if (fs.existsSync(jsonFilePath)) {
      manifestJSON = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    }
  } catch (error) {
    return null;
  }
  return manifestJSON;
}

/** 
 * Returns a manifest object if it exists, null otherwise
 * @param searchDir typically current working directory
 * @param filename file to search for
 */
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
      // stringify and parses the JSON in order to ensure that objects with .toJSON() functions
      // resolve properly. This is a known behavior for CustomType
      manifestImported = JSON.parse(JSON.stringify(manifestImported));
    }
  } catch (error) {
    console.log(error);
    return null;
  }
  return manifestImported;
}

/** 
 * @param entries 
 * @returns true if any non-empty manifest has been supplied 
 * */
function hasManifest(...entries) {
  for (let ent of entries) {
    if (ent && (Object.keys(ent).length > 0)) {
      return true;
    }
  }
  return false;
}

/** 
 * Search for provided file path. 
 * Returns full path when filename is found or null if no file found. 
 * @param currentPath string of current path
 * @param targetFilename filename to match
 * @returns full file path string relative to starting path or null
 * */
function find(currentPath, targetFilename) {
  //  TODO Cache searched paths and check that they haven't been explored already
  //  This guards against rare edge case of a subdir in the file tree which is 
  //  symlinked back to root or in such a way that creates a cycle. Can also implement
  //  max depth check. 
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