/** @type {import("jest").Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	setupFiles: ['dotenv/config'],
	roots: ['<rootDir>/src'],
	modulePathIgnorePatterns: ['<rootDir>/src/__tests__/helper'],
	moduleNameMapper: {
		'^src/(.*)$': ['<rootDir>/src/$1'],
	},
};
