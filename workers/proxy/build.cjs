//import { build } from "esbuild";
const { build } = require("esbuild")
const { NodeGlobalsPolyfillPlugin } = require("@esbuild-plugins/node-globals-polyfill");
const { NodeModulesPolyfillPlugin } = require("@esbuild-plugins/node-modules-polyfill");

build({
	absWorkingDir: __dirname,
	entryPoints: ['src/index.ts'],
	sourcemap: "inline",
	outfile: "./dist/index.js",
	bundle: true,
	format: "esm",
	platform: "node",
	minify: true,
	plugins: [
		NodeGlobalsPolyfillPlugin({ buffer: true }),
		NodeModulesPolyfillPlugin(),
	]
})
