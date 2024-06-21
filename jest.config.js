/** @type {import("jest").Config} */
export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFiles: ['dotenv/config'],
	roots: ['<rootDir>/src'],
	modulePathIgnorePatterns: [
		'<rootDir>/src/v1/__tests__/types',
		'<rootDir>/src/v1/__tests__/mocks',
	],
	moduleNameMapper: {
		'^src/(.*)$': ['<rootDir>/src/$1'],
	},
};
