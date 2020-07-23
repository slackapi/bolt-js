module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-typescript/base',
    /* TODO: Uncomment rule below once jsdoc comments are added. 
    This matches the jsdoc rules in the TSLint config */
    // "plugin:jsdoc/recommended",
    'prettier',
    'prettier/@typescript-eslint',
    './eslint-config-base', // the common settings in eslint-config-base
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['**/*.spec.ts', 'src/test-helpers.ts'],
  rules: {
    /* Below are some of the  new 'airbnb-typescript' rules that the project currently does not follow.
       They've been disabled here since they raise errors in a few files. The best course
       of action is likely to adopt these rules and make the quick (and mostly automated) fixes
       needed in the repo to conform to these. ESLint and the airbnb-typecript config is more strict
       than the original TSLint configuration that this project had. */
    'import/first': ['off'],
    'import/prefer-default-export': ['off'],
    'max-classes-per-file': ['off', 1],
    'import/no-cycle': ['off'],
    '@typescript-eslint/no-use-before-define': 'off',
    'no-nested-ternary': 'off',
    'consistent-return': 'off',
    // 'import/order': ['off'],
    // 'import/newline-after-import': ['off'],
    // 'import/no-useless-path-segments': ['off'],
    // '@typescript-eslint/lines-between-class-members': 'off',
    // 'no-restricted-globals': 'off',
    // 'no-lonely-if': 'off',
    // 'no-undef-init': 'off',
    // 'no-multi-assign': 'off',
    // 'prefer-object-spread': 'off',
    // 'no-restricted-syntax': 'off',
    // 'prefer-destructuring': 'off',

    /* Some currently-enabled additional rules. Uncomment to disable. The project currently conforms to them
     so there it's best to just keep these commented or delete them entirely */
    // '@typescript-eslint/ban-types': 'off',
    // '@typescript-eslint/no-empty-interface': 'off',
    // '@typescript-eslint/no-unsafe-assign': 'off',
    // '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/no-unsafe-return': 'off',
    // '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/no-unsafe-call': 'off',
    // '@typescript-eslint/restrict-template-expressions': 'off',
    // '@typescript-eslint/unbound-method': 'off',
    // '@typescript-eslint/explicit-module-boundary-types': 'off',
    // '@typescript-eslint/require-await': 'off',
  },
};
