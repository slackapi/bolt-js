module.exports = {
    "extends": [
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "env": {
        "commonjs": true,
        "mocha": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.test.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "prefer-rest-params": "off"
    }

};
