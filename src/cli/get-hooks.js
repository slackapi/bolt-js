#!/usr/bin/env node
console.log(JSON.stringify({
  hooks: {
    'get-manifest': 'npm exec bolt-cli-get-manifest',
    start: 'npm exec bolt-cli-start',
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
