// Generates stories/_docs/component-pages.json — a map of { catalogName: storybookDocsId } so the
// Components/Overview index can deep-link each entry to its own Docs page.
//
// IDs are read from the AUTHORITATIVE Storybook index (dist/index.json after `pnpm storybook:build`,
// or a running server's /index.json), never re-derived — so links can't drift from real titles.
// Mapping reuses the same explicit alias table the docs block uses (title-aliases.json).
//
// Run:  node scripts/gen-component-pages.mjs [path-to-index.json]   (defaults to dist/index.json)
// Re-run whenever component story titles change.

import {readFileSync, writeFileSync} from "node:fs";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const indexPath = process.argv[2] ?? resolve(here, "../dist/index.json");
const index = read(indexPath);
const library = read(resolve(root, "library-index.json"));
const aliasesRaw = read(resolve(here, "../stories/_docs/title-aliases.json"));
const aliases = Object.fromEntries(Object.entries(aliasesRaw).filter(([k]) => !k.startsWith("_")));
const nameToLeaf = Object.fromEntries(Object.entries(aliases).map(([leaf, name]) => [name, leaf]));

// Authoritative: leaf (last title segment) -> docs id, from the real Storybook index. Includes the
// Widgets/ and Templates/ tiers so promoted artifacts (e.g. DataTable -> Widgets/Data/DataTable) still link.
const TIER_PREFIXES = ["Components/", "Widgets/", "Templates/"];
const leafToDocsId = {};
for (const entry of Object.values(index.entries ?? {})) {
	if (
		entry.type === "docs" &&
		typeof entry.title === "string" &&
		TIER_PREFIXES.some((p) => entry.title.startsWith(p))
	) {
		leafToDocsId[entry.title.split("/").pop().trim()] = entry.id;
	}
}

// Every catalog name -> its docs id, when a page exists for it.
const names = [];
for (const category of Object.keys(library.components))
	for (const c of library.components[category]) names.push(c.name);

const pages = {};
let linked = 0;
const noPage = [];
for (const name of names) {
	const leaf = nameToLeaf[name] ?? name;
	const id = leafToDocsId[leaf];
	if (id) {
		pages[name] = id;
		linked++;
	} else {
		noPage.push(name);
	}
}

const out = resolve(here, "../stories/_docs/component-pages.json");
writeFileSync(out, JSON.stringify(pages, null, 2) + "\n");
console.log(`component-pages.json: ${linked} entries linked, ${noPage.length} without a page`);
console.log(`  no page (correctly unlinked): ${noPage.join(", ")}`);
