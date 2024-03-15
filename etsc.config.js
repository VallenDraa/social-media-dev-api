const rimraf = require('rimraf');

module.exports = {
	/** @type {import("esbuild").BuildOptions} */
	esbuild: {
		bundle: true,
		treeShaking: true,
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
		rimraf.sync('./dist'); // clean up dist folder
	},
};
