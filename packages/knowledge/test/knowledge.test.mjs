// Capability + index tests. Run against the BUILT package (Node 20 has no native TS execution), so
// `pnpm build` must run first. Exercises the envelope contract, the three widget shapes, the props
// gap, code validation, and the error paths.

import assert from "node:assert/strict";
import {test} from "node:test";

import {API_VERSION, createKnowledge} from "../dist/index.mjs";

const kb = createKnowledge();

/** Every response must carry the versioned envelope. */
function assertEnvelope(res, capability) {
	assert.equal(res.apiVersion, API_VERSION, "apiVersion");
	assert.equal(res.capability, capability, "capability echoed");
	assert.match(res.requestId, /^req_/, "requestId");
	assert.equal(typeof res.ok, "boolean");
	if (res.ok) {
		assert.ok(res.provenance && res.provenance.indexVersion, "provenance");
		assert.ok(Array.isArray(res.warnings), "warnings array");
		assert.ok(res.meta && typeof res.meta.elapsedMs === "number", "meta.elapsedMs");
	} else {
		assert.ok(res.error && res.error.code, "error.code");
	}
}

test("index builds from canonical sources with all tiers", () => {
	const counts = kb.meta().counts;
	for (const tier of ["template", "widget", "component", "pattern", "utility"])
		assert.ok(counts[tier] > 0, `has ${tier}s`);
	assert.equal(kb.meta().indexVersion, "knowledge-index/0.1");
});

test("exposes the strict implementation workflow tools", () => {
	assert.deepEqual(kb.tools.map((t) => t.name).sort(), [
		"create_implementation_plan",
		"explain",
		"resolve_component",
		"resolve_template",
		"resolve_widgets",
		"search",
		"validate",
	]);
	assert.deepEqual(Object.keys(kb.jsonSchemas()).sort(), kb.tools.map((t) => t.name).sort());
});

test("resolve_template ranks by intent with derived confidence + next-path flags", async () => {
	const res = await kb.callTool("resolve_template", {intent: "admin settings management page", limit: 3});
	assertEnvelope(res, "resolve_template");
	assert.ok(res.ok);
	assert.ok(res.data.candidates.length > 0);
	assert.ok(
		res.data.candidates.some((c) => c.name === "CoreAdminPanel"),
		"AdminPanel surfaces",
	);
	const top = res.data.candidates[0];
	assert.ok(["high", "medium", "low"].includes(top.confidence));
	assert.equal(typeof top.hasComposedOf, "boolean");
	assert.equal(top.implementationContract.requiredNextTool, "create_implementation_plan");
	// scores are sorted descending
	const scores = res.data.candidates.map((c) => c.score);
	assert.deepEqual(
		scores,
		[...scores].sort((a, b) => b - a),
	);
});

test("resolve_template exposes a direct-import contract when a template is renderable", async () => {
	const res = await kb.callTool("resolve_template", {
		intent: "workforce attendance verification command center with operational queues",
		limit: 5,
	});
	const candidate = res.data.candidates.find((item) => item.ref.id === "timesheet");
	assert.ok(candidate, "Timesheet template surfaces");
	assert.equal(candidate.implementationContract.mode, "direct-template");
	assert.equal(candidate.implementationContract.requiredImport.path, "@core/core-ui/pages/core-timesheet");
	assert.match(candidate.implementationContract.minimalExample, /Timesheet/);
});

test("resolve_template routes low-confidence matches into non-blocking adaptation", async () => {
	const res = await kb.callTool("resolve_template", {
		intent: "a worker-management dashboard for status, attendance, observations, and site activity",
	});
	assert.equal(res.data.candidates[0].confidence, "low");
	assert.equal(res.data.candidates[0].implementationContract.mode, "adapt-template");
	assert.equal(res.data.selectionGate.status, "fallback-ready");
	assert.equal(res.data.selectionGate.mayImplement, true);
	assert.equal(res.data.selectionGate.strategy, "adapt-template");
	assert.deepEqual(res.data.selectionGate.fallbackOrder, [
		"adapt-template",
		"compose-widgets",
		"compose-components",
		"create-with-core",
	]);
	assert.doesNotMatch(res.data.selectionGate.message, /confirm|clarif/i);
});

test("resolve_template routes a filtered no-match into non-blocking composition", async () => {
	const res = await kb.callTool("resolve_template", {
		intent: "a novel field operations interface",
		archetype: "does-not-exist",
	});
	assert.deepEqual(res.data.candidates, []);
	assert.equal(res.data.selectionGate.status, "fallback-ready");
	assert.equal(res.data.selectionGate.mayImplement, true);
	assert.equal(res.data.selectionGate.strategy, "compose");
	assert.match(res.data.selectionGate.message, /Continue without confirmation/);
});

test("create_implementation_plan makes direct import and strict validation mandatory", async () => {
	const res = await kb.callTool("create_implementation_plan", {template: "timesheet"});
	assertEnvelope(res, "create_implementation_plan");
	assert.equal(res.data.implementationMode, "direct-template");
	assert.equal(res.data.requiredImport.path, "@core/core-ui/pages/core-timesheet");
	assert.equal(res.data.workspaceRequirements.onMissingDependency, "setup-and-continue");
	assert.deepEqual(res.data.completionGate.arguments, {
		mode: "core-template-strict",
		template: "timesheet",
		requireFiles: true,
		requireImplementationPlan: true,
		requireRuntimeAudit: false,
		requireReferenceAnalysis: false,
	});
	assert.equal(res.data.completionGate.require, "compliant=true");
});

test("create_implementation_plan adapts a nearest template without exact-template validation", async () => {
	const res = await kb.callTool("create_implementation_plan", {
		template: "analytics-overview",
		intent: "a language model monitoring dashboard with traces and evaluations",
		strategy: "adapt-template",
	});
	assertEnvelope(res, "create_implementation_plan");
	assert.equal(res.data.implementationMode, "adapt-template");
	assert.equal(res.data.requiredImport, undefined);
	assert.ok(res.data.compositionCandidates.length > 0);
	assert.deepEqual(res.data.completionGate.arguments, {
		mode: "core-product",
		requireFiles: true,
		requireImplementationPlan: true,
		requireRuntimeAudit: false,
		requireReferenceAnalysis: false,
	});
});

test("create_implementation_plan composes without any selected template", async () => {
	const res = await kb.callTool("create_implementation_plan", {
		intent: "a novel field operations interface with status cards and an activity table",
		strategy: "compose",
	});
	assertEnvelope(res, "create_implementation_plan");
	assert.equal(res.ok, true);
	assert.equal(res.data.templateId, undefined);
	assert.equal(res.data.implementationMode, "compose");
	assert.ok(res.data.compositionCandidates.length > 0);
	assert.deepEqual(res.data.completionGate.arguments, {
		mode: "core-product",
		requireFiles: true,
		requireImplementationPlan: true,
		requireRuntimeAudit: false,
		requireReferenceAnalysis: false,
	});
});

test("resolve_widgets unifies the available template shapes", async () => {
	const blueprint = await kb.callTool("resolve_widgets", {template: "blueprint-viewer"});
	assertEnvelope(blueprint, "resolve_widgets");
	assert.equal(blueprint.data.shape, "widgets");
	assert.ok(blueprint.data.widgets.length > 0);

	const login = await kb.callTool("resolve_widgets", {template: "login-page"});
	assert.equal(login.data.shape, "composed");
	assert.ok(login.warnings.some((w) => w.code === "widgets.derived_from_composedOf"));

	const thin = await kb.callTool("resolve_widgets", {template: "core-project-overview"});
	assert.equal(thin.data.shape, "thin");
	assert.equal(thin.data.widgets.length, 0);
	assert.ok(thin.data.notes.length > 0);
});

test("resolve_widgets on a composedOf template lists building blocks + deps", async () => {
	const res = await kb.callTool("resolve_widgets", {template: "admin-panel"});
	assert.equal(res.data.shape, "composed");
	assert.ok(res.data.widgets.length > 0);
	assert.ok(Array.isArray(res.data.requiredDependencies));
	assert.ok(
		res.data.widgets.some((widget) => widget.source?.import),
		"entries expose implementation imports",
	);
});

test("resolve_component returns import + variants; reports props honestly", async () => {
	const byName = await kb.callTool("resolve_component", {name: "Button"});
	assertEnvelope(byName, "resolve_component");
	const btn = byName.data.candidates[0];
	assert.equal(btn.source.import, "@core/core-ui/button");
	assert.ok(btn.variants.includes("outline"));
	assert.equal(btn.propsStatus, "available");
	assert.ok(btn.props.some((p) => p.name === "variant"));

	const byIntent = await kb.callTool("resolve_component", {intent: "data grid table"});
	assert.ok(byIntent.data.candidates.length > 0);
	// components without extracted props must be flagged, never fabricated
	const missing = byIntent.data.candidates.filter((c) => c.propsStatus === "unavailable");
	if (missing.length) {
		assert.ok(byIntent.warnings.some((w) => w.code === "props.unavailable"));
		assert.ok(missing.every((c) => c.props === null));
	}

	const contextToolbar = await kb.callTool("resolve_component", {
		name: "ContextToolbar",
		requiredProps: ["title", "actions"],
	});
	assert.equal(contextToolbar.data.candidates[0].propCompatibility.status, "compatible");
	assert.equal(contextToolbar.data.candidates[0].ownership.surface, "route");
	assert.equal(contextToolbar.data.candidates[0].ownership.responsiveBehavior, "overflow-menu");
});

test("search ranks across tiers with snippets", async () => {
	const res = await kb.callTool("search", {query: "confirm destructive action", limit: 5});
	assertEnvelope(res, "search");
	assert.ok(res.data.results.length > 0);
	assert.ok(res.data.results.some((r) => r.name === "AlertDialog"));
	assert.ok(res.data.results.every((r) => typeof r.snippet === "string"));

	const header = await kb.callTool("search", {query: "route content header identity navigation actions", limit: 10});
	assert.ok(header.data.results.some((candidate) => candidate.name === "PageContentHeader"));

	const scoped = await kb.callTool("search", {query: "dashboard", tiers: ["template"], limit: 5});
	assert.ok(scoped.data.results.every((r) => r.tier === "template"));
});

test("validate is authoritative on generated code", async () => {
	const bad = await kb.callTool("validate", {
		code: `import {Button} from "@core/core-ui";\nexport default () => <Button>Hi</Button>;`,
	});
	assertEnvelope(bad, "validate");
	assert.equal(bad.data.pass, false, "barrel import fails");
	assert.equal(bad.data.metrics.imports, false);
	assert.ok(bad.data.findings.some((f) => !f.pass && f.metric === "imports"));

	const good = await kb.callTool("validate", {
		code: `import {Button} from "@core/core-ui/button";\nexport default () => <Button>Hi</Button>;`,
	});
	assert.equal(good.data.pass, true, "deep-path import passes");
});

test("core-only validation rejects standalone approximations and requires the exact template", async () => {
	const approximation = await kb.callTool("validate", {
		mode: "core-only",
		template: "timesheet",
		code: `<!doctype html><html><style>.card { padding: 1rem }</style><div class="card">Workers</div></html>`,
	});
	assert.equal(approximation.data.compliant, false);
	assert.equal(approximation.data.metrics["core-compliance"], false);
	assert.ok(
		approximation.data.findings.some((finding) => !finding.pass && finding.message.includes("required import")),
	);

	const wrongCoreComponent = await kb.callTool("validate", {
		mode: "core-only",
		template: "timesheet",
		code: `import {Card} from "@core/core-ui/card";\nexport default () => <Card>Workers</Card>;`,
	});
	assert.equal(
		wrongCoreComponent.data.compliant,
		false,
		"a generic Core component cannot replace the template",
	);

	const pathWithoutExport = await kb.callTool("validate", {
		mode: "core-only",
		template: "timesheet",
		code: `import "@core/core-ui/pages/core-timesheet";\nexport default () => null;`,
	});
	assert.equal(pathWithoutExport.data.compliant, false, "the required template export must also be used");

	const exactTemplate = await kb.callTool("validate", {
		mode: "core-only",
		template: "timesheet",
		code: `import {Timesheet} from "@core/core-ui/pages/core-timesheet";\nexport default () => <Timesheet />;`,
	});
	assert.equal(exactTemplate.data.compliant, true);
	assert.equal(exactTemplate.data.metrics["core-compliance"], true);
});

test("explain gives purpose + clean alternatives + related artifacts", async () => {
	const res = await kb.callTool("explain", {name: "AlertDialog"});
	assertEnvelope(res, "explain");
	assert.ok(res.data.purpose && res.data.purpose.length > 0);
	assert.ok(res.data.alternatives.every((a) => typeof a === "string"));
	assert.ok(res.data.alternatives.includes("Dialog"));
});

test("errors are values, never thrown across the boundary", async () => {
	const unknown = await kb.callTool("does_not_exist", {});
	assert.equal(unknown.ok, false);
	assert.equal(unknown.error.code, "unknown_tool");

	const invalid = await kb.callTool("resolve_template", {});
	assert.equal(invalid.ok, false);
	assert.equal(invalid.error.code, "invalid_input");

	const missing = await kb.callTool("resolve_widgets", {template: "no-such-template"});
	assert.equal(missing.ok, false);
	assert.equal(missing.error.code, "template.not_found");
});
