import assert from "node:assert/strict";
import {test} from "node:test";

import {artifactContractPlanId, createKnowledge} from "../dist/index.mjs";

const kb = createKnowledge();

const applicationInput = {
	intent: "Build a multi-route operations product with home, monitoring, and studio surfaces",
	goal: "product-ui",
	strategy: "compose",
	shell: {
		id: "operations-shell",
		sidebar: "CoreAppSidebar",
		topBar: "core-app-top-bar",
		persistentAcrossRoutes: true,
		density: "comfortable",
		brandKey: "core-operations",
		navigationFingerprint: "operations-primary-nav-v1",
		footerFingerprint: "operations-footer-v1",
		providerOwner: "src/AppShell.tsx",
		allowedRouteMutations: ["activeItemId", "breadcrumbs"],
	},
	routes: [
		{
			id: "home",
			path: "/",
			files: ["src/routes/Home.tsx"],
			regions: [
				{
					id: "work-items",
					role: "operational-data",
					requiredArtifacts: ["DataTable"],
					acceptableArtifacts: ["SectionPanel"],
					fallbackOrder: ["DataTable", "SectionPanel"],
					interactions: ["sort-work-items"],
				},
			],
		},
		{
			id: "monitoring",
			path: "/monitoring",
			files: ["src/routes/Monitoring.tsx"],
			regions: [
				{
					id: "charts",
					role: "monitoring-charts",
					requiredArtifacts: ["TrendChart"],
					acceptableArtifacts: ["CoreFilterStrip"],
					interactions: ["change-time-range"],
				},
			],
		},
		{
			id: "studio",
			path: "/studio",
			files: ["src/routes/Studio.tsx"],
			template: "design-canvas",
			regions: [
				{
					id: "canvas",
					role: "design-canvas",
					requiredArtifacts: ["design-canvas"],
					catalogGapId: "catalog-gap/studio-node-inspector",
					interactions: ["select-node"],
				},
			],
		},
	],
};

test("contract v2 binds the shared shell and Home/Monitoring/Studio regions to catalog ids", async () => {
	const result = await kb.callTool("create_implementation_plan", applicationInput);
	assert.equal(result.ok, true);
	assert.equal(result.data.contractVersion, "core-artifact-contract/2");
	assert.equal(result.data.artifactContract.contractVersion, result.data.contractVersion);
	assert.equal(result.data.artifactContract.shell.id, "operations-shell");
	assert.equal(result.data.artifactContract.shell.sidebar.id, "core-app-sidebar");
	assert.equal(result.data.artifactContract.shell.topBar.id, "core-app-top-bar");
	assert.equal(result.data.artifactContract.shell.density, "comfortable");
	assert.equal(result.data.artifactContract.shell.brandKey, "core-operations");
	assert.equal(result.data.artifactContract.shell.navigationFingerprint, "operations-primary-nav-v1");
	assert.deepEqual(result.data.artifactContract.shell.allowedRouteMutations, ["activeItemId", "breadcrumbs"]);
	assert.deepEqual(
		result.data.artifactContract.routes.map((route) => route.id),
		["home", "monitoring", "studio"],
	);
	assert.equal(result.data.artifactContract.routes[0].regions[0].requiredArtifacts[0].id, "data-table");
	assert.deepEqual(result.data.artifactContract.routes[0].files, ["src/routes/Home.tsx"]);
	assert.equal(result.data.artifactContract.routes[1].regions[0].requiredArtifacts[0].id, "trend-chart");
	assert.equal(result.data.artifactContract.routes[2].templateId, "design-canvas");
	assert.equal(result.data.artifactContract.routes[2].regions[0].catalogGapId, "catalog-gap/studio-node-inspector");
	assert.ok(result.data.artifactContract.required.every((item) => kb.store.getById(item.id)));
	assert.equal(result.data.workspaceRequirements.runtimeAudit.required, true);
	assert.equal(result.data.completionGate.arguments.requireRuntimeAudit, true);
});

test("contract v2 route tampering changes the deterministic plan identity", async () => {
	const result = await kb.callTool("create_implementation_plan", applicationInput);
	assert.equal(result.ok, true);
	const identity = {
		contractVersion: result.data.contractVersion,
		goal: result.data.goal,
		implementationMode: result.data.implementationMode,
		templateId: result.data.templateId,
		intent: result.data.intent,
		artifactContract: result.data.artifactContract,
	};
	assert.equal(artifactContractPlanId(identity), result.data.planId);

	const tampered = structuredClone(identity);
	tampered.artifactContract.routes[1].regions[0].role = "unowned-decoration";
	assert.notEqual(artifactContractPlanId(tampered), result.data.planId);
});

test("single-screen planning remains on contract v1", async () => {
	const result = await kb.callTool("create_implementation_plan", {
		intent: "Build a field operations table",
		goal: "product-ui",
		strategy: "compose",
	});
	assert.equal(result.ok, true);
	assert.equal(result.data.contractVersion, "core-artifact-contract/1");
	assert.equal(result.data.artifactContract.contractVersion, "core-artifact-contract/1");
	assert.equal("routes" in result.data.artifactContract, false);
});

test("contract v2 rejects route artifacts that are not catalog-derived", async () => {
	const invalid = structuredClone(applicationInput);
	invalid.routes[0].regions[0].requiredArtifacts = ["HandRolledMegaTable"];
	const result = await kb.callTool("create_implementation_plan", invalid);
	assert.equal(result.ok, false);
	assert.equal(result.error.code, "application_contract.invalid_catalog_reference");
});

test("contract v2 records an explicit second-product module boundary", async () => {
	const input = structuredClone(applicationInput);
	input.shell.moduleBoundaries = [
		{
			id: "studio-module",
			routes: ["studio"],
			shellId: "studio-shell",
			sidebar: "CoreAppSidebar",
			topBar: "CoreAppTopBar",
			density: "compact",
			brandKey: "core-studio",
			navigationFingerprint: "studio-primary-nav-v1",
			providerOwner: "src/studio/StudioShell.tsx",
			entryBehavior: "Client-side transition from the primary shell.",
			exitBehavior: "Back returns to the previous product route.",
			reason: "Studio is an intentionally separate product module.",
		},
	];
	input.routes[2].moduleBoundaryId = "studio-module";
	const result = await kb.callTool("create_implementation_plan", input);
	assert.equal(result.ok, true);
	assert.equal(result.data.artifactContract.shell.moduleBoundaries[0].sidebar.id, "core-app-sidebar");
	assert.equal(result.data.artifactContract.routes[2].moduleBoundaryId, "studio-module");
});

test("standard shell artifacts are automatically planned as a pair", async () => {
	const input = structuredClone(applicationInput);
	delete input.shell.topBar;
	const result = await kb.callTool("create_implementation_plan", input);
	assert.equal(result.ok, true);
	assert.equal(result.data.artifactContract.shell.sidebar.id, "core-app-sidebar");
	assert.equal(result.data.artifactContract.shell.topBar.id, "core-app-top-bar");
});

test("visual reproduction requires a pre-template reference analysis and binds region ownership", async () => {
	const missing = await kb.callTool("create_implementation_plan", {
		...applicationInput,
		goal: "visual-reproduction",
	});
	assert.equal(missing.ok, false);
	assert.equal(missing.error.code, "reference_analysis.required");

	const input = structuredClone(applicationInput);
	input.goal = "visual-reproduction";
	input.referenceAnalysis = {
		images: [
			{
				id: "home-reference",
				productShell: "Persistent sidebar and compact top bar",
				navigationModel: "sidebar-destination",
				density: "compact",
				regions: [
					{
						id: "work-items",
						purpose: "Operational records",
						hierarchy: "Primary content",
						impliedInteractions: ["sort-work-items"],
					},
				],
				scrollOwnership: ["route-content"],
				sourceBrandTraitsToReplace: ["source palette", "source card geometry"],
			},
		],
		intentionalDifferences: ["Use Core navigation semantics"],
	};
	input.shell.density = "compact";
	input.routes[0].regions[0].ownerArtifact = "DataTable";
	input.routes[0].regions[0].surfaceOwner = "artifact";
	input.routes[0].regions[0].supportedVariant = "default";
	input.routes[0].regions[0].navigationRelationship = {type: "peer"};
	const result = await kb.callTool("create_implementation_plan", input);
	assert.equal(result.ok, true);
	assert.equal(result.data.referenceAnalysis.images[0].id, "home-reference");
	assert.equal(result.data.artifactContract.shell.layoutOwnership.requiredShellHeight, "100dvh");
	assert.equal(result.data.artifactContract.shell.layoutOwnership.scrollOwner, "route-content");
	assert.equal(result.data.artifactContract.routes[0].regions[0].ownerArtifact.id, "data-table");
	assert.equal(result.data.completionGate.arguments.requireReferenceAnalysis, true);
	assert.equal(result.data.completionGate.arguments.requireRuntimeAudit, true);
});

test("region contracts reject split chat ownership and fabricated peer back destinations", async () => {
	const split = structuredClone(applicationInput);
	split.routes[0].regions[0].messageHistoryOwner = "CoreAiChat";
	split.routes[0].regions[0].messageComposerOwner = "PromptInput";
	const splitResult = await kb.callTool("create_implementation_plan", split);
	assert.equal(splitResult.ok, false);
	assert.match(splitResult.error.message, /different owners/);

	const peer = structuredClone(applicationInput);
	peer.routes[0].regions[0].navigationRelationship = {type: "peer", destination: "/"};
	const peerResult = await kb.callTool("create_implementation_plan", peer);
	assert.equal(peerResult.ok, false);
	assert.match(peerResult.error.message, /peer sidebar route/);
});
