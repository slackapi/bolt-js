module.exports = {
	rules: {
		// The rules below are ESLint equivalents for the old TSLint rules in tslint.json
		// Matches the quotemark rule
		'@typescript-eslint/quotes': [
			'error',
			'single',
			{
				'avoidEscape': true,
				'allowTemplateLiterals': false,
			},
		],
		// matches the variable-name rule
		'@typescript-eslint/naming-convention': [
			'error',
			// custom rule to ignore cases that require quoting
			{
				'selector': 'variableLike',
				'format': ['camelCase', 'UPPER_CASE'],
				'leadingUnderscore': 'allow',
				'filter': {
					// you can expand this regex as you find more cases that require quoting that you want to allow
					'regex': '[_ ]',
					'match': false,
				},
			},
		],
		// matches ban-comma-operator rule
		'no-sequences': 'error',
		// matches the await-promise rule
		'@typescript-eslint/await-thenable': 'error',
		// matches interface-over-type-literal rule
		'@typescript-eslint/consistent-type-definitions': 'error',
		// matches member-access rule
		'@typescript-eslint/explicit-member-accessibility': [
			'error',
			{
				'accessibility': 'explicit',
				'overrides': {
					'constructors': 'no-public',
				},
			},
		],
		// matches no-duplicate-switch-case
		'no-duplicate-case': 'error',
		// matches no-duplicate-variable
		'no-redeclare': 'error',
		// matches no-require-imports
		'@typescript-eslint/no-require-imports': 'error',
		// matches no-return-await
		'no-return-await': 'error',
		// matches no-submodule-imports (slightly different)
		// "import/no-internal-modules": "error",
		// matches no-this-assignment
		'@typescript-eslint/no-this-alias': 'error',
		// matches no-unused-expression
		'@typescript-eslint/no-unused-expressions': 'error',
		// matches no-var-requires
		'@typescript-eslint/no-var-requires': 'error',
		// sorta matches one-line (Prettier takes care of this)
		'brace-style': ['error', '1tbs'],
		// matches strict-boolean-expressions
		'@typescript-eslint/strict-boolean-expressions': 'error',
		// matches typedef
		// REVIEW: This raised errors in a couple of the files. To view these errors, its value from 'off' to 'error'
		'@typescript-eslint/explicit-function-return-type': 'off',
		// matches typedef-whitespace
		'@typescript-eslint/type-annotation-spacing': 'error',
		// max-line-length is matched by Prettier
	},
};
