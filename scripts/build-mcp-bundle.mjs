#!/usr/bin/env node
// Build the self-contained JSON bundle the hosted Vercel function loads. The function does ZERO
// filesystem discovery at runtime — it imports these two JSON files — so it behaves identically
// locally and on Vercel's serverless filesystem (the fragile part of serverless).
//
//   api/_bundle/index.json       { meta, records }          — the normalized knowledge index
//   api/_bundle/validators.json  { catalog fields as arrays } — the code-validator catalog
//
// Run after @wakecap/knowledge is built. Wired into the Vercel buildCommand; also `pnpm mcp:bundle`.

import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import {createKnowledge} from "../packages/knowledge/dist/index.mjs";
import {loadCatalog} from "./validators/index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "api", "_bundle");
mkdirSync(OUT, {recursive: true});

// 1) Knowledge index — records + meta (the memory store re-derives all lookups from records).
const kb = createKnowledge();
const portableMeta = {...kb.meta()};
delete portableMeta.rootDir;
const index = {meta: portableMeta, records: kb.store.all()};
writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index)}\n`);

// 2) Validator catalog — serialize Sets/Maps as arrays; the function reconstructs them.
const cat = loadCatalog();
const validators = {
	coreUi: cat.coreUi,
	components: cat.components,
	patterns: cat.patterns,
	exportsSet: [...cat.exportsSet],
	requires: cat.requires,
	failureModes: cat.failureModes,
};
writeFileSync(join(OUT, "validators.json"), `${JSON.stringify(validators)}\n`);

process.stderr.write(
	`[build-mcp-bundle] wrote api/_bundle/{index,validators}.json — ${index.records.length} records, ${validators.components.length} components, ${validators.failureModes.length} failure modes\n`,
);
