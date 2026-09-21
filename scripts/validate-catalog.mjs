#!/usr/bin/env node
// P2 CI entry: hard-gate catalog integrity on every PR (free + deterministic).
// Wraps the pure validators/catalog.mjs with real filesystem access.
//
// Usage:  node scripts/validate-catalog.mjs   (exit 1 on any error)

import {existsSync} from "node:fs";
import {join} from "node:path";

import {validateCatalog} from "./validators/catalog.mjs";
import {loadCatalog, repoRoot} from "./validators/load.mjs";

const catalog = loadCatalog();
const {errors, warnings} = validateCatalog(catalog, {
	fileExists: (p) => existsSync(join(repoRoot, p)),
});

for (const w of warnings) console.warn(`  warning  ${w}`);
for (const e of errors) console.error(`  error    ${e}`);

console.log(
	`\nCatalog integrity: ${catalog.components.length} components checked — ${errors.length} error(s), ${warnings.length} warning(s).`,
);

if (errors.length > 0) {
	console.error(
		"\nCatalog drift detected. Regenerate with: node scripts/extract-component-catalog.mjs && node scripts/sync-library-index.mjs",
	);
	process.exit(1);
}
