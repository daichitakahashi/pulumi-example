//import { build } from "esbuild";
const { build } = require("esbuild")

console.log(__dirname)

build({
	absWorkingDir: __dirname,
	entryPoints: ['src/index.ts'],
  sourcemap: "external",
	outfile: "./dist/index.js",
	bundle: true,
	format: "esm",
	platform: "node",
	minify: true
})
