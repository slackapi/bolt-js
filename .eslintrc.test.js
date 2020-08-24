module.exports = {
	extends: [
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'./eslint-config-base',
	],
	env: {
		commonjs: true,
		mocha: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.test.json',
	},
	plugins: ['@typescript-eslint'],
	rules: {
        /* The rules below currently raise errors. They are easy and mostly automated fixes so conforming to them
        would be a good idea. Make sure to remove the rules below if you chose to adopt these rules. */
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/require-await': 'off',
		'@typescript-eslint/restrict-template-expressions': 'off',
		'@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        'prefer-rest-params': 'off',
        'brace-style': 'off',
	},
};
