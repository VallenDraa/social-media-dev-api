/** @type {import("eslint").Linter.Config} */
module.exports = {
	env: {
		es2021: true,
		jest: true,
		node: true,
	},
	extends: ['xo', 'xo-typescript', 'prettier'],
	ignorePatterns: [
		'dist',
		'coverage',
		'node_modules',
		'jest.config.js',
		'process-env.d.ts',
		'.eslintrc.cjs',
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['src/**/*.ts', '.eslintrc.cjs', 'jest.config.js'],
			rules: {
				'@typescript-eslint/ban-types': 'off',
				'@typescript-eslint/naming-convention': 'off',
			},
		},
	],
};
