#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

// Run script hook verifies that requirements for running an App in
// in developerMode (via Socket Mode) are met
(function _(cwd) {
  // TODO - Format so that its less miss-able in output
  console.log('Preparing local run in developer mode (Socket Mode)');
  // Check required local run tokens
  validate();

  // Kick off a subprocess to run the app in development mode
  const app = spawn('node', [`${path.resolve(cwd, 'app.js')}`]);
  app.stdout.setEncoding('utf-8');
  // TODO - Is there a way to configure this in spawn invocation
  app.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  app.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  app.on('close', (code) => {
    console.log(`bolt-app local run exited with code ${code}`);
  });
}(process.cwd()));

function validate() {
  if (!process.env.SLACK_CLI_XOXB) {
    throw new Error('Missing local run bot token. Please see slack-cli maintainers to troubleshoot.');
  }
  if (!process.env.SLACK_CLI_XAPP) {
    throw new Error('Missing local run app token. Please see slack-cli maintainers to troubleshoot');
  }
}
