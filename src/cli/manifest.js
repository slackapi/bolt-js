#!/usr/bin/env node
// Manifest script hook returns a manifest JSON if it exists in the working directory
const fs = require('fs');
const path = require('path');
(function _(cwd) {
  // TODO: Support additonal accepted formats
  // const acceptedFormat = ['json', 'yml', 'ts'];
  let fileData;
  try {
    fileData = fs.readFileSync(path.resolve(cwd, 'manifest.json'), 'utf8');
  } catch (error) {
    // TODO: Throw a coded error
    console.error(`Failed to find a manifest file in this project: ${error}`);
    process.exit(1);
  }
  console.log(JSON.stringify(JSON.parse(fileData)));
}(process.cwd()));
