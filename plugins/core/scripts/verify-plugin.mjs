#!/usr/bin/env node

import {existsSync, readFileSync} from "node:fs";
import {dirname, join, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(PLUGIN_ROOT, "../..");

function readJson(path) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function requireCondition(condition, message, errors) {
	if (!condition) errors.push(message);
}

export function validateCorePlugin() {
	const errors = [];
	const manifest = readJson(join(PLUGIN_ROOT, ".codex-plugin", "plugin.json"));
	const marketplace = readJson(join(REPO_ROOT, ".agents", "plugins", "marketplace.json"));
	const mcp = readJson(join(PLUGIN_ROOT, ".mcp.json"));
	const skill = readFileSync(join(PLUGIN_ROOT, "skills", "core-ui", "SKILL.md"), "utf8");
	const pluginDocs = readFileSync(join(PLUGIN_ROOT, "README.md"), "utf8");
	const migrationDocs = readFileSync(join(REPO_ROOT, "docs", "CORE-COMPLIANCE-MIGRATION.md"), "utf8");
	const hostingDocs = readFileSync(join(REPO_ROOT, ".agents", "plugins", "README.md"), "utf8");
	const hostedServer = readFileSync(join(REPO_ROOT, "api", "mcp.mjs"), "utf8");
	const hostedPackageServer = readFileSync(join(REPO_ROOT, "apps", "hosted-mcp", "src", "server.ts"), "utf8");
	const implementationPlan = readFileSync(
		join(REPO_ROOT, "packages", "knowledge", "src", "capabilities", "create-implementation-plan.ts"),
		"utf8",
	);
	const distAssembler = readFileSync(join(REPO_ROOT, "scripts", "assemble-hub-dist.mjs"), "utf8");
	const developerAccess = [
		readFileSync(join(REPO_ROOT, "apps", "web", "src", "pages", "DeveloperAccessPage.tsx"), "utf8"),
		readFileSync(join(REPO_ROOT, "apps", "hub", "src", "DeveloperAccess.tsx"), "utf8"),
	];

	requireCondition(manifest.name === "core", "manifest name must be core", errors);
	requireCondition(manifest.skills === "./skills/", "manifest must wire ./skills/", errors);
	requireCondition(manifest.mcpServers === "./.mcp.json", "manifest must wire ./.mcp.json", errors);
	requireCondition(Array.isArray(manifest.interface?.defaultPrompt), "manifest must provide starter prompts", errors);

	for (const field of ["composerIcon", "logo", "logoDark"]) {
		const asset = manifest.interface?.[field];
		requireCondition(
			typeof asset === "string" && existsSync(join(PLUGIN_ROOT, asset)),
			`${field} asset is missing`,
			errors,
		);
	}

	const server = mcp.mcpServers?.core;
	requireCondition(server?.type === "http", "Core MCP must use HTTP transport", errors);
	requireCondition(
		server?.url === "https://core.core.com/mcp",
		"Core MCP URL does not match production",
		errors,
	);
	const mcpText = JSON.stringify(mcp);
	requireCondition(
		!/(token|secret|authorization|cookie)/i.test(mcpText),
		"committed MCP config must not contain credentials",
		errors,
	);

	const entry = marketplace.plugins?.find((plugin) => plugin.name === "core");
	requireCondition(marketplace.name === "core", "marketplace name must be core", errors);
	requireCondition(entry?.source?.source === "local", "marketplace source must be local", errors);
	requireCondition(
		entry?.source?.path === "./plugins/core",
		"marketplace source path must be ./plugins/core",
		errors,
	);
	requireCondition(
		entry?.policy?.installation === "AVAILABLE",
		"marketplace installation policy must be AVAILABLE",
		errors,
	);
	requireCondition(
		entry?.policy?.authentication === "ON_INSTALL",
		"marketplace authentication policy must be ON_INSTALL",
		errors,
	);
	requireCondition(
		typeof entry?.category === "string" && entry.category.length > 0,
		"marketplace category is required",
		errors,
	);
	requireCondition(
		existsSync(join(REPO_ROOT, entry?.source?.path ?? "missing")),
		"marketplace source path does not resolve",
		errors,
	);

	const workflow = [
		"resolve_template",
		"selectionGate",
		"create_implementation_plan",
		"Implement the approved plan",
		"Validate the finished implementation",
	];
	let cursor = -1;
	for (const marker of workflow) {
		const next = skill.indexOf(marker, cursor + 1);
		requireCondition(next > cursor, `skill workflow is missing or misorders ${marker}`, errors);
		cursor = next;
	}
	requireCondition(
		implementationPlan.includes('onMissingDependency: "setup-and-continue"'),
		"implementation plan must prepare missing workspace dependencies",
		errors,
	);
	for (const marker of [
		"React",
		"TSX",
		"@corensystem/coren-ui",
		"Prepare the workspace",
		"scaffold a React + TypeScript app",
		"NODE_AUTH_TOKEN",
		"standalone HTML/CSS",
		"data.compliant",
		"exactly `true`",
		"adapt-template",
		"compose-widgets",
		"create-with-core",
		"never ask for confirmation",
		"artifact utilization map",
		"substitution map",
		"`files`",
		"`implementationPlan`",
		"imported, rendered, and visibly exercised",
		"detailed category scores",
		"route/region map",
		"stable Core sidebar and top bar",
		"normative shell fingerprint",
		"module boundary",
		"same density",
		"data-core-shell",
		"data-core-artifact",
		"semantic tokens",
		"[data-state]",
		"CoreContextTabs",
		"owned computed visuals",
		"workspace preparation incomplete",
		"runtimeAudit",
		"token provenance",
		"referenceAnalysis",
		"Analyze reference images",
		"height: 100dvh",
		"data-core-content-scroll",
		"duplicate composers",
		"functional Core canvas",
		"reference fidelity and Core fidelity",
		"machine-readable `ownership` contract",
		"PageContentHeader",
		"ContextToolbar",
		"createThemedChartOption",
		"820px narrow viewports",
		"duplicate surface dividers",
	]) {
		requireCondition(skill.includes(marker), `skill is missing required instruction: ${marker}`, errors);
	}
	for (const mode of ["core-imports", "core-product", "core-showcase", "core-template-strict"]) {
		requireCondition(skill.includes(mode), `skill is missing validation mode: ${mode}`, errors);
		requireCondition(pluginDocs.includes(mode), `plugin docs are missing validation mode: ${mode}`, errors);
		requireCondition(migrationDocs.includes(mode), `migration docs are missing validation mode: ${mode}`, errors);
	}
	requireCondition(
		skill.includes("core-only") && skill.includes("deprecated alias"),
		"skill must describe core-only as a deprecated alias",
		errors,
	);
	requireCondition(
		migrationDocs.includes("Stage 1") && migrationDocs.includes("Stage 4"),
		"migration docs must define a staged rollout",
		errors,
	);
	for (const marker of [
		"SERVER_INSTRUCTIONS",
		"resolve_template first",
		"without asking for confirmation",
		"adapt the nearest template",
		"compose Core widgets",
		"create new application-level UI",
		"create_implementation_plan before editing",
		"prepare the workspace",
		"compliant=true",
		"route/region map",
		"runtimeAudit",
		"CSS ownership",
		"shell fingerprint",
		"semantic token",
		"owned computed",
		"missing audit command",
		"referenceAnalysis",
		"stationary-sidebar/content-scroll geometry",
		"duplicate affordances",
		"functional canvas state",
		"machine-readable ownership contract",
		"duplicate surface dividers",
		"820px",
	]) {
		requireCondition(hostedServer.includes(marker), `hosted MCP is missing required instruction: ${marker}`, errors);
		requireCondition(
			hostedPackageServer.includes(marker),
			`hosted MCP package is missing required instruction: ${marker}`,
			errors,
		);
	}
	for (const marker of [
		"artifact utilization map",
		"adapt-template",
		"files",
		"implementationPlan",
		"core-imports",
		"core-product",
		"core-showcase",
		"core-template-strict",
		"core-only is a deprecated alias",
		"tier and component coverage",
		"token compliance",
		"imported/rendered/exercised artifact inventory",
		"blocking findings",
		"advisory findings",
	]) {
		requireCondition(
			hostedPackageServer.includes(marker),
			`hosted MCP package is missing compliance instruction: ${marker}`,
			errors,
		);
	}
	requireCondition(
		!skill.includes("stop without implementation edits and explain the gate's reason"),
		"skill must not block implementation solely on template selection confidence",
		errors,
	);
	requireCondition(
		!hostedServer.includes("selectionGate.mayImplement=false"),
		"hosted MCP must not block implementation solely on template selection confidence",
		errors,
	);
	requireCondition(
		!hostedPackageServer.includes("selectionGate.mayImplement=false"),
		"hosted MCP package must not block implementation solely on template selection confidence",
		errors,
	);
	requireCondition(
		hostedServer.includes("new McpServer(SERVER_INFO, {instructions: SERVER_INSTRUCTIONS})"),
		"hosted MCP must send the mandatory workflow as server instructions",
		errors,
	);
	for (const marker of ['[".agents", "plugins"]', "cpSync(source, destination, {recursive: true})"]) {
		requireCondition(
			distAssembler.includes(marker),
			`production build does not publish plugin content: ${marker}`,
			errors,
		);
	}

	const allUserContent = `${JSON.stringify(manifest)}\n${skill}\n${pluginDocs}\n${hostingDocs}\n${migrationDocs}`;
	requireCondition(
		!/\[?TODO(?::|\b)/i.test(allUserContent),
		"user-facing plugin content contains a TODO placeholder",
		errors,
	);
	requireCondition(
		hostingDocs.includes("https://<core-host>/.agents/plugins/marketplace.json"),
		"hosting docs must include the portable marketplace URL",
		errors,
	);
	for (const marker of ["https://github.com/core/Core.git", ".agents/plugins", "plugins/core"]) {
		requireCondition(hostingDocs.includes(marker), `installation docs are missing Git source: ${marker}`, errors);
	}
	for (const content of developerAccess) {
		requireCondition(
			content.includes("https://github.com/core/Core.git"),
			"Developer Access must provide the Git marketplace source",
			errors,
		);
		requireCondition(
			!content.includes("Add marketplace by URL"),
			"Developer Access must not present the hosted JSON artifact as a Git marketplace source",
			errors,
		);
	}
	requireCondition(
		pluginDocs.includes("NODE_AUTH_TOKEN") && pluginDocs.includes("read:packages"),
		"package authentication docs must use an environment-backed GitHub Packages token",
		errors,
	);
	requireCondition(
		pluginDocs.includes("bearer_token_env_var"),
		"authentication docs must use environment-backed bearer auth",
		errors,
	);

	return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const errors = validateCorePlugin();
	if (errors.length) {
		for (const error of errors) process.stderr.write(`- ${error}\n`);
		process.exitCode = 1;
	} else {
		process.stdout.write("Core Codex plugin validation passed.\n");
	}
}
