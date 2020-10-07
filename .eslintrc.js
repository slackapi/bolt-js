module.exports = {
  // This is a root of the project, ESLint should not look through the parent directories to find more config
  root: true,

  // These environments contain lists of global variables which are allowed to be accessed
  env: {
    es2017: true,
    node: true,
  },

  // Allow ESLint to understand TypeScript syntax
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // The following option makes it possible to use rules that require type information
    project: './tsconfig.eslint.json',
  },

  // Allow ESLint to load rules from the TypeScript plugin
  plugins: ['@typescript-eslint'],

  extends: [
    /* TODO: Uncomment rule below once jsdoc comments are added.
    This matches the jsdoc rules in the TSLint config */
    // 'prettier',
    // 'prettier/@typescript-eslint',
    // './eslint-config-base', // the common settings in eslint-config-base

    // ESLint's recommended built-in rules
    'eslint:recommended',

    // TypeScript plugin's recommended rules
    'plugin:@typescript-eslint/recommended',

    // Airbnb's ESLint config with TypeScript support
    // Although some documentation shows this config as a replacement for the two above, if you look at the source,
    // you'll see that this config does not extend the previous configs and it's written to augment them. There are many
    // useful recommended rules that would not be added if the two above were not included, too.
    // https://github.com/airbnb/javascript
    'airbnb-typescript/base',

    // JSDoc plugin's recommended rules
    'plugin:jsdoc/recommended',
  ],
  ignorePatterns: [
    // Ignore all build outputs and artifacts (node_modules, dotfiles, and dot directories are implicitly ignored)
    '/dist',
    '/coverage',

    // TODO: figure out if we actually need a separate config for test, or if we can just use this config
    // We likely do need a separate config because the tests have different globals available, so will need a different
    // env setting.
    // We might be able to address this issue using the overrides option
    // '**/*.spec.ts',
    // 'src/test-helpers.ts'
  ],
  rules: {
    // Rules
    //
    // The goal is to have as few rules in this section as possible, while providing the style enforcement needed to
    // maintain this project. We would rather adopt an existing well-considered styleguide, like the one from AirBnB,
    // than to spend time crafting a unique complete set of rules for ourselves. This section contains additional rules
    // where we found the styleguide to fall short of our needs, for well understood reasons.

    // Eliminating tabs helps standardize on spaces for indentation. You may need to turn this rule off inline when
    // you want to use tabs for something other than indentation.
    'no-tabs': 'error',

    // Increasing the max line length to 120. The rest of this setting is copied from the AirBnB config.
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],

    // Restrict the use of backticks to declare a normal string. Template literals should only be used when the template
    // string contains placeholders. The rest of this setting is copied from the AirBnb config.
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],

    // Allow leading underscores for parameter names, which is used to acknowledge unused variables in TypeScript.
    // Ideally, the leading underscore could be restricted to only unused parameter names, but this rule isn't capable
    // of knowing when a variable is unused. Also enforce camelCase naming for variables. The camelcase and
    // no-underscore-dangle rules are replaced with the naming-convention rule because of discrepancies found between
    // the written style guide and the rules in the extended configs.
    camelcase: 'off',
    'no-underscore-dangle': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
      },
      {
        selector: 'variable',
        // PascalCase for variables is added to allow exporting a singleton, function library, or bare object as in
        // section 23.8 of the AirBnB style guide
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],

    // Bans use of comma as an operator because it can obscure side effects and is often an accident.
    'no-sequences': 'error',

    // Disallow the delete operator with computed key expressions because its a sign you should be using a different
    // data structure (consider a Map or a Set).
    '@typescript-eslint/no-dynamic-delete': 'error',

    // Disallow invocations of require(). This will help make imports more consistent and ensures a smoother transition
    // to the best future syntax.
    '@typescript-eslint/no-require-imports': 'error',

    // Prevent importing submodules of other modules. Using the internal structure of a module exposes implementation
    // details that can potentially change in breaking ways. Use the option to set a list of allowable globs if
    // necessary.
    'import/no-internal-modules': 'error',

    // Prevent using non-boolean types as conditions. This ensures we're not relying on implicit type coercions in
    // conditionals, which can accidentally change the falsiness of the value.
    // NOTE: It's unclear if this will prevent undefined from being used in a condition
    '@typescript-eslint/strict-boolean-expressions': ['error', {
      allowString: false,
      allowNumber: false,
      allowNullableObject: false,
    }],

    // The following rules are not considered in the AirBnB style guide because they are completely specific to
    // TypeScript and not set by the typescript-eslint/recommended config.

    // Prefer and interface declaration over a type alias because interfaces can be extended, implemented, and merged
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    // Require class properties and methods to explicitly use accessibility modifiers (public, private, protected)
    // NOTE: overrides to turn this rule off for anything that's not a .ts
    '@typescript-eslint/explicit-member-accessibility': 'error',

    // Forbids an object literal to appear in a type assertion expression unless its used as a parameter. This allows
    // the typechecker to perform validation on the value as an assignment, instead of allowing the type assertion to
    // always win.
    // Requires use of `as Type` instead of `<Type>` for type assertion. Consistency.
    '@typescript-eslint/consistent-type-assertions': ['error', {
      assertionStyle: 'as',
      objectLiteralTypeAssertions: 'allow-as-parameter',
    }],

    //
    '@typescript-eslint/explicit-module-boundary-types': ['error', {
      allowArgumentsExplicitlyTypedAsAny: true,
    }],

    // No types in JSDoc for @param or @returns. TypeScript will provide this type information, so it would be
    // redundant, and possibly conflicting.
    'jsdoc/no-types': 'error',

    /* Below are some of the  new 'airbnb-typescript' rules that the project currently does not follow.
       They've been disabled here since they raise errors in a few files. The best course
       of action is likely to adopt these rules and make the quick (and mostly automated) fixes
       needed in the repo to conform to these. ESLint and the airbnb-typescript config is more strict
       than the original TSLint configuration that this project had. */
    // 'import/first': ['off'],
    // 'import/prefer-default-export': ['off'],
    // 'max-classes-per-file': ['off', 1],
    // 'import/no-cycle': ['off'],
    // '@typescript-eslint/no-use-before-define': 'off',
    // 'no-nested-ternary': 'off',
    // 'consistent-return': 'off',
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

// Rules that were enforced by TSLint and do not currently have an equivalent rule in ESLint:
//
// adds statements, members, and elements to the base config
// "align": [true, "parameters", "arguments", "statements", "members", "elements"],
//
// adds number of spaces so auto-fixing will work
// NOTE: while an equivalent rule does exist, the author has advised against using it, and advocates for the
// use of Prettier instead
// "indent": [true, "spaces", 2],
//
// adds check-module, check-type, check-rest-spread, check-typecast, check-type-operator
// NOTE: it's not clear whether check-type is covered by the @typescript-eslint/type-annotation-spacing rule or not
// "whitespace": [true,
//   "check-type",
//   "check-module",
//   "check-rest-spread",
//   "check-typecast",
//   "check-type-operator"
// ],
