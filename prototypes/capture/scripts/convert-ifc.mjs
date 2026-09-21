// Convert an IFC file to a Fragments (.frag) model the FragmentViewer can read.
//
// The viewer reads `.frag` only, so IFC is converted ahead of time — this keeps web-ifc's wasm out of
// the browser bundle. Run from the repo root so `@thatopen/fragments` + `web-ifc` resolve:
//
//   node prototypes/capture/scripts/convert-ifc.mjs <input.ifc> <output.frag>
//
// e.g. node prototypes/capture/scripts/convert-ifc.mjs model.ifc prototypes/capture/public/models/duplex.frag
import {readFileSync, writeFileSync} from "node:fs";
import {IfcImporter} from "@thatopen/fragments";

const [ifcPath, outPath] = process.argv.slice(2);
if (!ifcPath || !outPath) {
	console.error("usage: node convert-ifc.mjs <input.ifc> <output.frag>");
	process.exit(1);
}

const importer = new IfcImporter();
// web-ifc's WASM (Node build) lives in the hoisted root node_modules.
importer.wasm = {absolute: true, path: process.cwd() + "/node_modules/web-ifc/"};

const bytes = new Uint8Array(readFileSync(ifcPath));
console.log(`IFC: ${ifcPath} (${bytes.length} bytes)`);

const frag = await importer.process({
	bytes,
	progressCallback: (p) => process.stdout.write(`\r  converting ${(p * 100).toFixed(0)}%   `),
});

writeFileSync(outPath, frag);
console.log(`\nwrote ${outPath} (${frag.length} bytes)`);
