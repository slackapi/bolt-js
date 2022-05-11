#!/usr/bin/env node
console.log(JSON.stringify({
  hooks: {
    'get-manifest': 'npm exec --package=@slack/bolt slack-cli-get-manifest',
    start: 'npm exec --package=@slack/bolt slack-cli-start',
  },
  config: {
    watch: {
      'filter-regex': '^manifest\\.(ts|js|json)$',
      paths: [
        '.',
      ],
    },
    'sdk-managed-connection-enabled': true,
  },
}));
