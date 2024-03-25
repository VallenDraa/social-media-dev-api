/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
const rimraf = require('rimraf');
const fs = require('fs');

module.exports = {
	/** @type {import("esbuild").BuildOptions} */
	esbuild: {
		bundle: true,
		minify: true,
		platform: 'node',
		minifySyntax: true,
		minifyIdentifiers: true,
		minifyWhitespace: true,
		target: 'es2020',
		entryPoints: ['./src/server.ts'],
		outdir: 'dist',
	},
	// Prebuild hook
	prebuild() {
		rimraf.sync('./dist'); // Clean up dist folder
	},
};
