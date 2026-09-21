import {mkdir, readFile, writeFile} from "node:fs/promises";
import {dirname, resolve, sep} from "node:path";
import {fileURLToPath} from "node:url";

import {IfcImporter} from "@thatopen/fragments";

const [, , inputArg, outputArg] = process.argv;

if (!inputArg || !outputArg) {
	console.error("Usage: node scripts/convert-ifc-to-frag.mjs <input.ifc> <output.frag>");
	process.exit(1);
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
const wasmPath = dirname(fileURLToPath(import.meta.resolve("web-ifc/web-ifc-node.wasm")));
const input = await readFile(inputPath);
const importer = new IfcImporter();
importer.wasm = {path: `${wasmPath}${sep}`, absolute: true};

let reportedProgress = -1;
const fragments = await importer.process({
	id: "uptown",
	bytes: new Uint8Array(input.buffer, input.byteOffset, input.byteLength),
	progressCallback: (progress) => {
		const percent = Math.floor(progress * 100);
		if (percent >= reportedProgress + 5 || percent === 100) {
			reportedProgress = percent;
			console.log(`Converting IFC: ${percent}%`);
		}
	},
});

await mkdir(dirname(outputPath), {recursive: true});
await writeFile(outputPath, fragments);
console.log(`Wrote ${outputPath} (${(fragments.byteLength / 1024 / 1024).toFixed(1)} MB)`);
