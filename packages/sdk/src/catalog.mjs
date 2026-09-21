// Phase 6 prototype — catalog loader. Reads the REAL Core artifacts (manifests/*.json +
// library-index.json) into an in-memory catalog the SDK resolves/validates against. Zero dependencies.

import {readFileSync, readdirSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// packages/sdk/src → repo root is two levels up.
const ROOT = join(HERE, "..", "..", ".."); // repo root
const MANIFESTS = join(ROOT, "manifests");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

/** Load every manifest + the generated library index into a queryable catalog. */
export function loadCatalog() {
	const templates = [];
	const widgets = [];
	const components = [];
	for (const f of readdirSync(MANIFESTS).filter((f) => f.endsWith(".json"))) {
		const m = readJson(join(MANIFESTS, f));
		if (f.endsWith(".template.json")) templates.push(m);
		else if (f.endsWith(".widget.json")) widgets.push(m);
		else if (f.endsWith(".component.json")) components.push(m);
	}

	let libraryIndex = {components: {}};
	try {
		libraryIndex = readJson(join(ROOT, "library-index.json"));
	} catch {
		// optional
	}
	const variantsByName = new Map();
	for (const group of Object.values(libraryIndex.components ?? {}))
		for (const c of group) variantsByName.set(c.name, c.variants ?? []);

	return {
		templates,
		widgets,
		components,
		templateById: new Map(templates.map((t) => [t.id, t])),
		widgetByName: new Map(widgets.map((w) => [w.name, w])),
		componentByName: new Map(components.map((c) => [c.name, c])),
		variantsByName,
		counts: {templates: templates.length, widgets: widgets.length, components: components.length},
	};
}
