#!/usr/bin/env node
// The "Build / Index" stage as a standalone artifact. Projects the canonical sources into a slim,
// inspectable knowledge-index.json (records minus the internal search haystack). Not required at
// runtime (the server rebuilds in-memory on boot) — this is for inspection, diffing in CI, and future
// warm-start / DB seeding. Runs against the built package: `pnpm build` first.

import {writeFileSync} from "node:fs";

import {createKnowledge} from "../dist/index.mjs";

const out = process.argv[2] ?? "knowledge-index.json";
const kb = createKnowledge();
const records = kb.store.all().map(({_search, ...rest}) => rest);
writeFileSync(out, `${JSON.stringify({meta: kb.meta(), records}, null, "\t")}\n`);
process.stderr.write(`[build-index] wrote ${records.length} records (${JSON.stringify(kb.meta().counts)}) → ${out}\n`);
