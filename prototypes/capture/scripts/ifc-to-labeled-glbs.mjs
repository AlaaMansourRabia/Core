// Split an IFC into one GLB per (floor × category) + a manifest.json, the way the reference
// "cesium-ifc-viewer" does — so each piece can be a Cesium Entity carrying levelName/categoryName that
// the hover tooltip reads. Runs OFFLINE (the browser never parses IFC).
//
// Run from the repo root:
//   node prototypes/capture/scripts/ifc-to-labeled-glbs.mjs <input.ifc> <outDir>
//   e.g. ... UE22-...ifc prototypes/capture/public/models/ue22
//
// Geometry is exported in one shared local frame (IFC world coords, Z-up → Y-up); placement (lat/long)
// is done in Cesium, NOT baked here — so all pieces line up when added at the same origin.
import {mkdirSync, writeFileSync} from "node:fs";
import {readFileSync} from "node:fs";
import {Document, NodeIO} from "@gltf-transform/core";
import {IfcAPI} from "web-ifc";
import * as WEBIFC from "web-ifc";

const [ifcPath, outDir] = process.argv.slice(2);
if (!ifcPath || !outDir) {
	console.error("usage: node ifc-to-labeled-glbs.mjs <input.ifc> <outDir>");
	process.exit(1);
}

// The exact category set the reference app surfaces (element IFC class). Anything else is dropped.
const CATEGORY_NAMES = [
	"IFCWALL", "IFCWALLSTANDARDCASE", "IFCSLAB", "IFCWINDOW", "IFCMEMBER", "IFCPLATE", "IFCCURTAINWALL",
	"IFCDOOR", "IFCRAMP", "IFCSTAIR", "IFCBUILDINGELEMENTPROXY", "IFCSITE", "IFCCOLUMN", "IFCFLOWTERMINAL",
	"IFCRAILING", "IFCCOVERING", "IFCFURNISHINGELEMENT", "IFCROOF", "IFCTRANSPORTELEMENT", "IFCBEAM",
];
const allowed = new Map(); // type code → category name
for (const name of CATEGORY_NAMES) {
	if (WEBIFC[name] !== undefined) allowed.set(WEBIFC[name], name);
}

const api = new IfcAPI();
api.SetWasmPath(process.cwd() + "/node_modules/web-ifc/", true);
await api.Init();
const modelID = api.OpenModel(new Uint8Array(readFileSync(ifcPath)));
console.log(`opened ${ifcPath}`);

// ── element → floor (level) via IfcRelContainedInSpatialStructure ───────────────
const elemLevel = new Map();
const rels = api.GetLineIDsWithType(modelID, WEBIFC.IFCRELCONTAINEDINSPATIALSTRUCTURE);
for (let i = 0; i < rels.size(); i++) {
	const rel = api.GetLine(modelID, rels.get(i));
	const structure = api.GetLine(modelID, rel.RelatingStructure.value);
	const levelName = structure?.Name?.value ?? "No level";
	for (const handle of rel.RelatedElements ?? []) elemLevel.set(handle.value, levelName);
}
console.log(`spatial containment: ${elemLevel.size} elements across ${rels.size()} relations`);

// ── group by (category, level); each group is its own glTF document ─────────────
const groups = new Map();
const ROOT_ZUP_TO_YUP = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1]; // (x,y,z) → (x, z, -y)

function groupFor(category, level) {
	const key = `${category}__${level}`;
	let g = groups.get(key);
	if (g) return g;
	const doc = new Document();
	const buffer = doc.createBuffer();
	const scene = doc.createScene();
	const root = doc.createNode("ifc-root").setMatrix(ROOT_ZUP_TO_YUP);
	scene.addChild(root);
	g = {category, level, doc, buffer, root, geomCache: new Map(), matCache: new Map(), placements: 0};
	groups.set(key, g);
	return g;
}

function getGeometry(g, expressID) {
	let cached = g.geomCache.get(expressID);
	if (cached) return cached;
	const geom = api.GetGeometry(modelID, expressID);
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
	const position = g.doc.createAccessor().setType("VEC3").setArray(pos).setBuffer(g.buffer);
	const normal = g.doc.createAccessor().setType("VEC3").setArray(nor).setBuffer(g.buffer);
	const indices = g.doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(idx)).setBuffer(g.buffer);
	geom.delete();
	cached = {position, normal, indices};
	g.geomCache.set(expressID, cached);
	return cached;
}

function getMaterial(g, color) {
	const rgba = [color.x, color.y, color.z, color.w].map((v) => Math.round(v * 1000) / 1000);
	const key = rgba.join(",");
	let mat = g.matCache.get(key);
	if (mat) return mat;
	mat = g.doc.createMaterial().setBaseColorFactor(rgba).setMetallicFactor(0).setRoughnessFactor(0.9).setDoubleSided(true);
	if (rgba[3] < 1) mat.setAlphaMode("BLEND");
	g.matCache.set(key, mat);
	return mat;
}

let kept = 0;
let dropped = 0;
api.StreamAllMeshes(modelID, (flatMesh) => {
	const category = allowed.get(api.GetLineType(modelID, flatMesh.expressID));
	if (!category) {
		dropped++;
		return;
	}
	const level = elemLevel.get(flatMesh.expressID) ?? "No level";
	const g = groupFor(category, level);
	const geometries = flatMesh.geometries;
	for (let i = 0; i < geometries.size(); i++) {
		const pg = geometries.get(i);
		const {position, normal, indices} = getGeometry(g, pg.geometryExpressID);
		const prim = g.doc
			.createPrimitive()
			.setAttribute("POSITION", position)
			.setAttribute("NORMAL", normal)
			.setIndices(indices)
			.setMaterial(getMaterial(g, pg.color));
		g.root.addChild(g.doc.createNode().setMesh(g.doc.createMesh().addPrimitive(prim)).setMatrix(pg.flatTransformation));
		g.placements++;
	}
	kept++;
});
api.CloseModel(modelID);
console.log(`elements kept: ${kept} · dropped (off-category): ${dropped} · groups: ${groups.size}`);

// ── write one GLB per group + manifest ──────────────────────────────────────────
mkdirSync(outDir, {recursive: true});
const io = new NodeIO();
const usedNames = new Set();
const manifest = [];
const sanitize = (s) => s.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "");
for (const g of groups.values()) {
	let file = `${g.category}__${sanitize(g.level)}.glb`;
	let n = 1;
	while (usedNames.has(file)) file = `${g.category}__${sanitize(g.level)}_${n++}.glb`;
	usedNames.add(file);
	await io.write(`${outDir}/${file}`, g.doc);
	manifest.push({file, category: g.category, level: g.level});
}
writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`wrote ${manifest.length} GLBs + manifest.json to ${outDir}`);
