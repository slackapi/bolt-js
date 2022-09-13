const { 
  readManifestJSONFile,
  readImportedManifestFile,
  hasManifest,
  unionMerge,
} = require('./manifest.js');
const merge = require('deepmerge');


/** 
 * Returns any manifest data, if it exists.
 * Otherwise throws an error
 * @param searchDir path to begin searching at
 */
 function getManifestData(searchDir) {
  const file = 'manifest';
  let manifest = {};
  
  // look for a manifest JSON
  const manifestJSON = readManifestJSONFile(searchDir, `${file}.json`);
  // look for manifest.js
  let manifestJS = readImportedManifestFile(searchDir, `${file}.js`);
  
  if (!hasManifest(manifestJS, manifestJSON)) {
    const msg = 'Unable to find a manifest file in this project';
    throw new Error(msg);
  }

  // manage manifest merge
  if (manifestJSON) {
    manifest = merge(manifest, manifestJSON, { arrayMerge: unionMerge });
  }  
  if (manifestJS) {
    manifest = merge(manifest, manifestJS, { arrayMerge: unionMerge });
  }
  return manifest;
} 

module.exports = { getManifestData };