//
// SlackAPI JavaScript and TypeScript style
// ---
// This style helps maintainers enforce safe and consistent programming practices in this project. It is not meant to be
// comprehensive on its own or vastly different from existing styles. The goal is to inherit and aggregate as many of
// the communities' recommended styles for the technologies used as we can. When, and only when, we have a stated need
// to differentiate, we add more rules (or modify options). Therefore, the fewer rules directly defined in this file,
// the better.
//

const jsDocPlugin = require('eslint-plugin-jsdoc');

const jsDocRecommendedRulesOff = Object.assign(
  ...Object.keys(jsDocPlugin.configs.recommended.rules).map((rule) => ({ [rule]: 'off' })),
);

module.exports = {
  // This is a root of the project, ESLint should not look through parent directories to find more config
  root: true,

  ignorePatterns: [
    // Ignore all build outputs and artifacts (node_modules, dotfiles, and dot directories are implicitly ignored)
    '/dist',
    '/coverage',
  ],

  // These environments contain lists of global variables which are allowed to be accessed
  env: {
    // According to https://node.green, the target node version (v10) supports all important ES2018 features. But es2018
    // is not an option since it presumably doesn't introduce any new globals over ES2017.
    es2017: true,
    node: true,
  },

  extends: [
    // ESLint's recommended built-in rules: https://eslint.org/docs/rules/
    'eslint:recommended',

    // Node plugin's recommended rules: https://github.com/mysticatea/eslint-plugin-node
    'plugin:node/recommended',

    // AirBnB style guide (without React) rules: https://github.com/airbnb/javascript.
    'airbnb-base',

    // JSDoc plugin's recommended rules
    'plugin:jsdoc/recommended',
  ],

  rules: {
    // JavaScript rules
    // ---
    // The top level of this configuration contains rules which apply to JavaScript (and will also be inherited for
    // TypeScript). This section does not contain rules meant to override options or disable rules in the base
    // configurations (ESLint, Node, AirBnb). Those rules are added in the final override.

    // Eliminate tabs to standardize on spaces for indentation. If you want to use tabs for something other than
    // indentation, you may need to turn this rule off using an inline config comments.
    'no-tabs': 'error',

    // Bans use of comma as an operator because it can obscure side effects and is often an accident.
    'no-sequences': 'error',

    // Disallow the use of process.exit()
    'node/no-process-exit': 'error',

    // Allow safe references to functions before the declaration. Overrides AirBnB config. Not located in the override
    // section below because a distinct override is necessary in TypeScript files.
    'no-use-before-define': ['error', 'nofunc'],
  },

  overrides: [
    {
      files: ['**/*.ts'],
      // Allow ESLint to understand TypeScript syntax
      parser: '@typescript-eslint/parser',
      parserOptions: {
        // The following option makes it possible to use rules that require type information
        project: './tsconfig.eslint.json',
      },
      // Allow ESLint to load rules from the TypeScript plugin
      plugins: ['@typescript-eslint'],
      extends: [
        // TypeScript plugin's recommended rules
        'plugin:@typescript-eslint/recommended',

        // AirBnB style guide (without React), modified for TypeScript rules: https://github.com/iamturns/eslint-config-airbnb-typescript.
        'airbnb-typescript/base',
      ],

      rules: {
        // TypeScript rules
        // ---
        // This level of this configuration contains rules which apply only to TypeScript. It also contains rules that
        // are meant to override options or disable rules in the base configurations (there are no more base
        // configurations in the subsequent overrides).

        // Disallow invocations of require(). This will help make imports more consistent and ensures a smoother
        // transition to the best future syntax. And since this rule affects TypeScript, which is compiled, there's
        // no reason we cannot adopt this syntax now.
        // NOTE: The `@typescript-eslint/no-require-imports` rule can also achieve the same effect, but it is less
        // configurable and only built to provide a migration path from TSLint.
        'import/no-commonjs': ['error', {
          allowConditionalRequire: false,
        }],

        // Don't verify that all named imports are part of the set of named exports for the referenced module. The
        // TypeScript compiler will already perform this check, so it is redundant.
        // NOTE: Consider contributing this to the `airbnb-typescript` config.
        'import/named': 'off',
        'node/no-missing-import': 'off',

        // Prevent using non-boolean types as conditions. This ensures we're not relying on implicit type coercions in
        // conditionals, which can lead to unintended behavior.
        // NOTE: Consider contributing this to the `airbnb-typescript` config. https://github.com/airbnb/javascript#comparison--shortcuts
        '@typescript-eslint/strict-boolean-expressions': ['error', {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        }],

        // Prefer an interface declaration over a type alias because interfaces can be extended, implemented, and merged
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

        // Require class properties and methods to explicitly use accessibility modifiers (public, private, protected)
        '@typescript-eslint/explicit-member-accessibility': 'error',

        // Forbids an object literal to appear in a type assertion expression unless its used as a parameter. This
        // allows the typechecker to perform validation on the value as an assignment, instead of allowing the type
        // assertion to always win.
        // Requires use of `as Type` instead of `<Type>` for type assertion. Consistency.
        '@typescript-eslint/consistent-type-assertions': ['error', {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'allow-as-parameter',
        }],

        // Ensure that the values returned from a module are of the expected type
        '@typescript-eslint/explicit-module-boundary-types': ['error', {
          allowArgumentsExplicitlyTypedAsAny: true,
        }],

        // Turns off all JSDoc plugin rules because they don't work consistently in TypeScript contexts. For example,
        // it's not an error to export interfaces and types that don't have JSDoc on them without these contexts. Also,
        // satisfying some of these rules would require redundant type information in the JSDoc comments, so its in
        // conflict with the next rule.
        // TODO: track progress on this issue https://github.com/gajus/eslint-plugin-jsdoc/issues/615
        ...jsDocRecommendedRulesOff,

        // No types in JSDoc for @param or @returns. TypeScript will provide this type information, so it would be
        // redundant, and possibly conflicting.
        'jsdoc/no-types': 'error',

        // Allow use of import and export syntax, despite it not being supported in the node versions. Since this
        // project is transpiled, the ignore option is used. Overrides node/recommended.
        // 'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
        // TODO: The node plugin's ignore option doesn't work in order to suppress this error.
        'node/no-unsupported-features/es-syntax': 'off',

        // Allow safe references to functions before the declaration. Overrides AirBnB config. Not located in the
        // override section below because a distinct override is necessary in JavaScript files.
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
      },
    },
    {
      files: ['**/*.js', '**/*.ts'],
      rules: {
        // Override rules
        // ---
        // This level of this configuration contains rules which override options or disable rules in the base
        // configurations in both JavaScript and TypeScript.

        // Increase the max line length to 120. The rest of this setting is copied from the AirBnB config.
        'max-len': ['error', 120, 2, {
          ignoreUrls: true,
          ignoreComments: false,
          ignoreRegExpLiterals: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        }],

        // Restrict the use of backticks to declare a normal string. Template literals should only be used when the
        // template string contains placeholders. The rest of this setting is copied from the AirBnb config.
        quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: false }],

        // TODO: not sure if this will work because of plugin loading on .js files
        // Allow leading underscores for parameter names, which is used to acknowledge unused variables in TypeScript.
        // Also, enforce camelCase naming for variables. Ideally, the leading underscore could be restricted to only
        // unused parameter names, but this rule isn't capable of knowing when a variable is unused. The camelcase and
        // no-underscore-dangle rules are replaced with the naming-convention rule because this single rule can serve
        // both purposes, and it works fine on non-TypeScript code.
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

        // Allow cyclical imports. Turning this rule on is mainly a way to manage the performance concern for linting
        // time. Our projects are not large enough to warrant this. Overrides AirBnB styles.
        'import/no-cycle': 'off',

        // Prevent importing submodules of other modules. Using the internal structure of a module exposes
        // implementation details that can potentially change in breaking ways. Overrides AirBnB styles.
        'import/no-internal-modules': ['error', {
          // Use the following option to set a list of allowable globs in this project.
          allow: [
            '**/middleware/*', // the src/middleware directory doesn't export a module, it's just a namespace.
          ],
        }],

        // Remove the minProperties option for enforcing line breaks between braces. The AirBnB config sets this to 4,
        // which is arbitrary and not backed by anything specific in the style guide. If we just remove it, we can
        // rely on the max-len rule to determine if the line is too long and then enforce line breaks. Overrides AirBnB
        // styles.
        'object-curly-newline': ['error', { multiline: true, consistent: true }],

      },
    },
  ],
};

// Test files globs
// '**/*.spec.ts',
// 'src/test-helpers.ts'
