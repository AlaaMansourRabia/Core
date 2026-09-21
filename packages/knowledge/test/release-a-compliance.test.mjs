import assert from "node:assert/strict";
import {test} from "node:test";

import {createKnowledge, INPUT_SCHEMAS} from "../dist/index.mjs";

const kb = createKnowledge();

test("resolve_template infers showcase intent and honors an explicit goal", async () => {
	const inferred = await kb.callTool("resolve_template", {
		intent: "Build a page to evaluate and showcase Core components",
	});
	assert.equal(inferred.ok, true);
	assert.equal(inferred.data.goal, "core-showcase");
	assert.deepEqual(inferred.data.query, {
		intent: "Build a page to evaluate and showcase Core components",
		goal: "core-showcase",
		goalSource: "inferred",
	});

	const explicit = await kb.callTool("resolve_template", {
		intent: "Build an operations dashboard",
		goal: "visual-reproduction",
	});
	assert.equal(explicit.data.goal, "visual-reproduction");
	assert.equal(explicit.data.query.goalSource, "explicit");
});

test("implementation plans expose a deterministic, catalog-derived artifact contract", async () => {
	const input = {
		template: "analytics-overview",
		intent: "Build a Core showcase for analytics",
		strategy: "adapt-template",
	};
	const first = await kb.callTool("create_implementation_plan", input);
	const second = await kb.callTool("create_implementation_plan", input);

	assert.equal(first.ok, true);
	assert.equal(first.data.goal, "core-showcase");
	assert.match(first.data.planId, /^plan_[0-9a-f]{8}$/);
	assert.equal(first.data.planId, second.data.planId);
	assert.equal(first.data.contractVersion, "core-artifact-contract/1");
	assert.equal(first.data.artifactContract.contractVersion, first.data.contractVersion);
	assert.ok(first.data.artifactContract.required.length > 0);
	assert.ok(first.data.artifactContract.recommended.length > 0);
	assert.ok(first.data.artifactContract.manualRecreationForbidden.length > 0);
	assert.equal(first.data.artifactContract.templateStructuralExpectations.referenceTemplateId, "analytics-overview");
	assert.deepEqual(
		first.data.artifactContract.requiredTemplateRegions,
		first.data.artifactContract.templateStructuralExpectations.regions
			.filter((region) => region.required)
			.map((region) => region.id),
	);
	const widgets = await kb.callTool("resolve_widgets", {template: "analytics-overview"});
	const catalogIds = new Set([
		first.data.templateId,
		...first.data.compositionCandidates.map((candidate) => candidate.id),
		...first.data.pairedArtifacts.map((artifact) => artifact.id).filter(Boolean),
		...widgets.data.widgets.map((widget) => widget.ref.id),
	]);
	assert.ok(first.data.artifactContract.required.every((artifact) => catalogIds.has(artifact.id)));
});

test("generated ownership contracts pass validate input parsing unchanged", async () => {
	const result = await kb.callTool("create_implementation_plan", {
		template: "wc3-workspace",
		intent: "Adapt the WC3 workspace without rewriting its generated plan",
		strategy: "adapt-template",
		goal: "product-ui",
	});

	assert.equal(result.ok, true);
	const pageContentHeader = result.data.artifactContract.recommended.find(
		(entry) => typeof entry === "object" && entry.id === "page-content-header",
	);
	assert.equal(pageContentHeader.ownership.responsiveBehavior, "overflow-menu-and-navigation-row");

	const parsed = INPUT_SCHEMAS.validate.safeParse({
		files: [{path: "src/App.tsx", language: "tsx", content: "export default function App() { return null; }"}],
		mode: "core-product",
		implementationPlan: {
			planId: result.data.planId,
			contractVersion: result.data.contractVersion,
			intent: result.data.intent,
			goal: result.data.goal,
			implementationMode: result.data.implementationMode,
			templateId: result.data.templateId,
			referenceTemplate: result.data.templateId,
			artifactContract: result.data.artifactContract,
			substitutions: [],
		},
	});

	assert.equal(parsed.success, true, parsed.success ? undefined : JSON.stringify(parsed.error.issues));
});

test("every catalog ownership value is accepted by validate input parsing", () => {
	const recommended = kb.store
		.all()
		.filter((record) => record.ownership)
		.map((record) => ({
			id: record.id,
			name: record.name,
			tier: record.tier,
			ownership: record.ownership,
		}));

	const parsed = INPUT_SCHEMAS.validate.safeParse({
		files: [{path: "src/App.tsx", language: "tsx", content: "export default function App() { return null; }"}],
		implementationPlan: {
			implementationMode: "compose",
			artifactContract: {
				contractVersion: "core-artifact-contract/1",
				required: [],
				recommended,
				allowedPrimitives: [],
				manualRecreationForbidden: [],
				requiredTemplateRegions: [],
			},
			substitutions: [],
		},
	});

	assert.ok(recommended.length > 0);
	assert.equal(parsed.success, true, parsed.success ? undefined : JSON.stringify(parsed.error.issues));
});

test("direct-template contracts bind the template and preserve owned layout", async () => {
	const result = await kb.callTool("create_implementation_plan", {template: "timesheet"});
	assert.equal(result.ok, true);
	assert.equal(result.data.goal, "product-ui");
	assert.ok(result.data.artifactContract.required.some((item) => item.id === "timesheet"));
	assert.equal(result.data.artifactContract.templateStructuralExpectations.preserveOwnedLayout, true);
	assert.ok(result.data.artifactContract.manualRecreationForbidden.includes(result.data.templateName));
});

test("compose contracts derive adoption requirements from ranked catalog candidates", async () => {
	const result = await kb.callTool("create_implementation_plan", {
		intent: "a field operations interface with status cards and an activity table",
		strategy: "compose",
		goal: "product-ui",
	});
	assert.equal(result.ok, true);
	assert.equal(result.data.artifactContract.required.length, 1);
	assert.equal(result.data.artifactContract.required[0].id, result.data.compositionCandidates[0].id);
	assert.ok(
		result.data.artifactContract.allowedPrimitives.every((id) =>
			result.data.compositionCandidates.some((candidate) => candidate.id === id),
		),
	);
});
