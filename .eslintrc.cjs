/** @type {import("eslint").Linter.Config} */
module.exports = {
	env: {
		es2021: true,
		jest: true,
		node: true,
	},
	extends: ['xo', 'xo-typescript', 'prettier'],
	ignorePatterns: ['dist', 'node_modules'],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['src/**/*.ts', '.eslintrc.cjs', 'jest.config.js'],
			rules: {
				'@typescript-eslint/naming-convention': 'off',
			},
		},
	],
};
