#!/usr/bin/env node --no-warnings
const { checkForSDKUpdates } = require('./hook-utils/get-check-update-data');

/** 
 * Implements the check-update hook and looks for available SDK updates.
 * Returns an object detailing info on Slack dependencies to pass up to the CLI.
*/
(async function _(cwd) {
  let updates = await checkForSDKUpdates(cwd);
    
  // write updates to stdout
  console.log(JSON.stringify(updates));
}(process.cwd()));
