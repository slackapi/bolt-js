#!/usr/bin/env node
// Manifest script hook returns a manifest JSON if it exists in the working directory
const fs = require('fs');
const path = require('path');
const fileName = 'manifest';
const fileFormats = {
  JSON: 'json',
  js: 'js',
  ts: 'ts'  
};

(function _(cwd) {
  // Looks for a manifest.json file. If exists, use it.
  // Looks for a manifest.ts file. If exists, default export is used. If you also had a manifest.json file, 
  // it is deep-merged on top of the json file.
  // If no manifest.ts exists, looks for a manifest.js file, and follows the same logic as manifest.ts does.
  let manifest;
 
    try {
      // look for a manifest.json
      manifest = getJSON(cwd);
      if (manifest === null) {
        // look for a manifest.js or manifest.ts
        console.log('there is no manifest.json');ejbbccujfefbfjncvttecgvfuvlvecnhlihenijddibg
      }
    } catch (error) {
      // TODO: Throw a coded error
      console.error(`Failed to find a manifest file in this project: ${error}`);
      // process.exit(1);
    }
  console.log(manifest);
}(process.cwd()));

const getJSON = (cwd) => {
  let fileDataJSON;
  try {
    fileDataJSON = fs.readFileSync(path.resolve(cwd, `${fileName}.${fileFormats.JSON}`), 'utf8');
    console.log(`Found manifest.json file in this project`);
  } catch (error) {
    return null;
  }
  return JSON.stringify(JSON.parse(fileDataJSON));
}