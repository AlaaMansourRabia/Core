#!/usr/bin/env node
// Wire Core into an Open Design instance: (1) install the core-compose skill so its workflow
// is injected into generation, and (2) register the Core MCP server so OD's agent can call the
// Core tools. Idempotent. Env overrides: OD_DIR (OD checkout), OD_DATA_DIR (OD runtime state).

import {mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {execSync} from "node:child_process";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = join(HERE, "..", "..", ".."); // repo root
const OD_DIR = process.env.OD_DIR ?? "/tmp/open-design";
const OD_DATA_DIR = process.env.OD_DATA_DIR ?? "/tmp/od-data";

// 0) patch OD's Home so its NATIVE template rail + picker ARE the Core templates (click → build,
// no plugin/form). This edits OD source in the clone; skipped cleanly if already applied. Optional —
// the reusable MCP + skill + gallery plugin below work without it.
{
	const patch = join(HERE, "..", "od-studio.patch");
	const applied = () => {
		try {
			execSync(`git -C "${OD_DIR}" apply --reverse --check "${patch}"`, {stdio: "ignore"});
			return true;
		} catch {
			return false;
		}
	};
	if (applied()) {
		console.log("✓ home-templates patch already applied");
	} else {
		try {
			execSync(`git -C "${OD_DIR}" apply "${patch}"`, {stdio: "ignore"});
			console.log("✓ home-templates patch applied (OD native rail = Core templates)");
		} catch (e) {
			console.log(`⚠ skipped home-templates patch (${e.message.split("\n")[0]}) — MCP/skill/gallery still work`);
		}
	}
}

// 1) install the skill into OD's built-in skills scan
const skillDir = join(OD_DIR, "skills", "core-compose");
mkdirSync(skillDir, {recursive: true});
copyFileSync(join(HERE, "SKILL.md"), join(skillDir, "SKILL.md"));
console.log(`✓ skill installed → ${skillDir}/SKILL.md`);

// 1b) install the "Core Templates" gallery plugin (a scenario) into OD's auto-scanned scenarios
// dir so it appears in the Plugins gallery — click a template → generate via Core → open in the
// editor. OD scans plugins/_official/scenarios/** from disk on startup (requires an OD restart).
const galleryDir = join(OD_DIR, "plugins", "_official", "scenarios", "core-templates");
mkdirSync(galleryDir, {recursive: true});
copyFileSync(join(HERE, "..", "gallery", "open-design.json"), join(galleryDir, "open-design.json"));
copyFileSync(join(HERE, "SKILL.md"), join(galleryDir, "SKILL.md"));
console.log(`✓ templates gallery plugin installed → ${galleryDir}/ (restart OD to load)`);

// 2) register the Core MCP server in OD's external mcp-config
mkdirSync(OD_DATA_DIR, {recursive: true});
const cfgPath = join(OD_DATA_DIR, "mcp-config.json");
let cfg = {servers: []};
if (existsSync(cfgPath)) {
	try {
		cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
		if (!Array.isArray(cfg.servers)) cfg.servers = [];
	} catch {
		cfg = {servers: []};
	}
}
const server = {
	id: "core",
	label: "Core",
	transport: "stdio",
	enabled: true,
	command: "node",
	args: [join(CORE_ROOT, "packages", "mcp", "src", "server.mjs")],
};
cfg.servers = cfg.servers.filter((s) => s.id !== "core");
cfg.servers.push(server);
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
console.log(`✓ MCP server registered → ${cfgPath}`);
console.log(`  core → node ${server.args[0]}`);

console.log(`
Next:
  1. Start the Core renderer:   node ${join(CORE_ROOT, "integrations/open-design/renderer/serve.mjs")}
  2. Start Open Design:             cd ${OD_DIR} && OD_DATA_DIR=${OD_DATA_DIR} pnpm tools-dev run web
  3. In OD: new project → pick the "core-compose" skill → prompt e.g. "an operations dashboard".
`);
