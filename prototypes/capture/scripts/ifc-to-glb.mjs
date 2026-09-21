// Convert an IFC file to a single GLB, as a one-time build step (per the Cesium spec: don't parse
// IFC in the browser — pre-convert and commit the output). Cesium's Model.fromGltfAsync loads the GLB.
//
// Run from the repo root so `web-ifc` + `@gltf-transform/core` resolve:
//   node prototypes/capture/scripts/ifc-to-glb.mjs <input.ifc> <output.glb>
//
// Geometry comes from web-ifc (meters, per-placement transform + colour). IFC is Z-up; glTF is Y-up,
// so everything is parented under a root node that rotates Z-up → Y-up (Cesium then orients it upright).
import {readFileSync} from "node:fs";
import {Document, NodeIO} from "@gltf-transform/core";
import {IfcAPI} from "web-ifc";

const [ifcPath, outPath] = process.argv.slice(2);
if (!ifcPath || !outPath) {
	console.error("usage: node ifc-to-glb.mjs <input.ifc> <output.glb>");
	process.exit(1);
}

const api = new IfcAPI();
api.SetWasmPath(process.cwd() + "/node_modules/web-ifc/", true);
await api.Init();

const modelID = api.OpenModel(new Uint8Array(readFileSync(ifcPath)));
console.log(`opened ${ifcPath}`);

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene();
// Root: Z-up (IFC) → Y-up (glTF), column-major. (x,y,z) → (x, z, -y).
const root = doc.createNode("ifc-root").setMatrix([1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1]);
scene.addChild(root);

// Reuse geometry accessors + materials across the thousands of placements that share them.
const geomCache = new Map();
const matCache = new Map();
let placements = 0;

function getGeometry(expressID) {
	let cached = geomCache.get(expressID);
	if (cached) return cached;
	const geom = api.GetGeometry(modelID, expressID);
	// Interleaved [px,py,pz, nx,ny,nz] × vertexCount.
	const raw = api.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize());
	const idx = api.GetIndexArray(geom.GetIndexData(), geom.GetIndexDataSize());
	const count = raw.length / 6;
	const pos = new Float32Array(count * 3);
	const nor = new Float32Array(count * 3);
	for (let i = 0; i < count; i++) {
		pos[i * 3] = raw[i * 6];
		pos[i * 3 + 1] = raw[i * 6 + 1];
		pos[i * 3 + 2] = raw[i * 6 + 2];
		nor[i * 3] = raw[i * 6 + 3];
		nor[i * 3 + 1] = raw[i * 6 + 4];
		nor[i * 3 + 2] = raw[i * 6 + 5];
	}
	const position = doc.createAccessor().setType("VEC3").setArray(pos).setBuffer(buffer);
	const normal = doc.createAccessor().setType("VEC3").setArray(nor).setBuffer(buffer);
	const indices = doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(idx)).setBuffer(buffer);
	geom.delete();
	cached = {position, normal, indices};
	geomCache.set(expressID, cached);
	return cached;
}

function getMaterial(color) {
	const rgba = [
		Math.round(color.x * 1000) / 1000,
		Math.round(color.y * 1000) / 1000,
		Math.round(color.z * 1000) / 1000,
		Math.round(color.w * 1000) / 1000,
	];
	const key = rgba.join(",");
	let mat = matCache.get(key);
	if (mat) return mat;
	mat = doc.createMaterial().setBaseColorFactor(rgba).setMetallicFactor(0).setRoughnessFactor(0.9).setDoubleSided(true);
	if (rgba[3] < 1) mat.setAlphaMode("BLEND");
	matCache.set(key, mat);
	return mat;
}

api.StreamAllMeshes(modelID, (flatMesh) => {
	const geometries = flatMesh.geometries;
	for (let i = 0; i < geometries.size(); i++) {
		const pg = geometries.get(i);
		const {position, normal, indices} = getGeometry(pg.geometryExpressID);
		const prim = doc
			.createPrimitive()
			.setAttribute("POSITION", position)
			.setAttribute("NORMAL", normal)
			.setIndices(indices)
			.setMaterial(getMaterial(pg.color));
		const mesh = doc.createMesh().addPrimitive(prim);
		root.addChild(doc.createNode().setMesh(mesh).setMatrix(pg.flatTransformation));
		placements++;
	}
});

api.CloseModel(modelID);
console.log(`placements: ${placements} · geometries: ${geomCache.size} · materials: ${matCache.size}`);

await new NodeIO().write(outPath, doc);
console.log(`wrote ${outPath}`);
