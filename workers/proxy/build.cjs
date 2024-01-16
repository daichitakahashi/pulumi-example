const { build } = require("esbuild");
const { NodeGlobalsPolyfillPlugin } = require("@esbuild-plugins/node-globals-polyfill");
const { NodeModulesPolyfillPlugin } = require("@esbuild-plugins/node-modules-polyfill");

build({
	absWorkingDir: __dirname,
	entryPoints: ['src/index.ts'],
	sourcemap: "inline",
	outfile: "./dist/index.js",
	bundle: true,
	format: "esm",
	minify: true,
	plugins: [
		NodeGlobalsPolyfillPlugin({ buffer: true }),
		NodeModulesPolyfillPlugin(),
		{
			name: "resolve pg-cloudflare",
			setup(build) {
				build.onResolve({
					filter: /^pg-cloudflare$/
				}, () => ({
					path: `${__dirname}/node_modules/pg-cloudflare/dist/index.js`,
				}))
			}
		},
	]
});