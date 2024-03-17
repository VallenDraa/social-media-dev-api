/** @type {import("eslint").Linter.Config} */
module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
		{
			extends: ['xo', 'xo-typescript', 'prettier'],
			files: ['*.ts', '*.tsx'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	ignorePatterns: ['dist', 'node_modules'],
	rules: {},
};
