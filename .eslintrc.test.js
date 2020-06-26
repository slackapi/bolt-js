module.exports = {
  // FIXME 
  "extends": [".eslintrc.js"],
  "overrides": [{
    "files": ["**/*.spec.ts", "src/test-helpers.ts"],
    "env":{
        "mocha": true
    },
    "parserOptions": {
      "project": "tsconfig.test.json"
    }
  }]
};
