import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";

import {createKnowledge} from "../dist/index.mjs";
import {analyzeRouteAdoption} from "../dist/validate/route-adoption.mjs";

const routePlan = (routes, shellContinuity) => ({
	contractVersion: "core-artifact-contract/2",
	implementationMode: "compose",
	goal: "product-ui",
	artifactContract: {
		required: [],
		recommended: [],
		allowedPrimitives: [],
		manualRecreationForbidden: [],
		requiredTemplateRegions: [],
		routes,
		shellContinuity,
	},
	substitutions: [],
});

const fixtureFile = (name) => ({
	path: `src/${name}`,
	language: name.endsWith(".css") ? "css" : "tsx",
	content: readFileSync(
		new URL(`../../../eval/fixtures/multi-surface-adoption-negative/${name}`, import.meta.url),
		"utf8",
	),
});

test("contract v1 receives neutral route scores and no route findings", () => {
	const result = analyzeRouteAdoption({
		mode: "core-product",
		code: "export default () => null",
		implementationPlan: {
			contractVersion: "core-artifact-contract/1",
			implementationMode: "compose",
			artifactContract: {
				required: [],
				recommended: [],
				allowedPrimitives: [],
				manualRecreationForbidden: [],
				requiredTemplateRegions: [],
			},
			substitutions: [],
		},
	});
	assert.equal(result.active, false);
	assert.deepEqual(result.findings, []);
	assert.deepEqual(result.scores, {
		shellPairing: 1,
		shellContinuity: 1,
		shellFidelity: 1,
		routeCoverage: 1,
		ownedRegionAdoption: 1,
		artifactRelevance: 1,
	});
});

test("artifacts rendered on another route do not satisfy an owned route region", () => {
	const result = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: routePlan(
			[
				{
					id: "projects",
					path: "/projects",
					file: "src/routes/Projects.tsx",
					regions: [{id: "records", requiredArtifacts: ["data-table"]}],
				},
				{
					id: "users",
					path: "/users",
					file: "src/routes/Users.tsx",
					regions: [{id: "records", requiredArtifacts: ["data-table"]}],
				},
			],
			{moduleBoundary: "src/layout/AppShell.tsx"},
		),
		files: [
			{
				path: "src/routes/Projects.tsx",
				language: "tsx",
				content:
					'import AppShell from "../layout/AppShell"; export const Projects = () => <AppShell><Card><Table /></Card></AppShell>;',
			},
			{
				path: "src/routes/Users.tsx",
				language: "tsx",
				content:
					'import AppShell from "../layout/AppShell"; export const Users = () => <AppShell><DataTable /></AppShell>;',
			},
			{
				path: "src/layout/AppShell.tsx",
				language: "tsx",
				content: "export default ({children}) => <><CoreAppSidebar/><CoreAppTopBar/>{children}</>;",
			},
		],
	});
	assert.equal(result.scores.shellPairing, 1);
	assert.equal(result.scores.shellContinuity, 1);
	assert.ok(
		result.findings.some(
			(finding) =>
				finding.metric === "owned-region-adoption" &&
				finding.source === "projects:records" &&
				finding.message.includes("another route"),
		),
	);
	assert.ok(
		result.findings.some(
			(finding) => finding.metric === "artifact-relevance" && finding.message.includes("Card + Table"),
		),
	);
});

test("route analysis detects broken shell continuity, custom topbars, and reload navigation", () => {
	const result = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: routePlan([
			{id: "one", file: "src/One.tsx", regions: []},
			{id: "two", file: "src/Two.tsx", regions: []},
		]),
		files: [
			{
				path: "src/One.tsx",
				language: "tsx",
				content: "export const One = () => <><CoreAppSidebar/><header>One</header></>;",
			},
			{
				path: "src/Two.tsx",
				language: "tsx",
				content:
					"export const Two = () => <><CoreAppSidebar/><CoreAppTopBar/><button onClick={() => window.location.reload()}>Two</button></>;",
			},
		],
	});
	assert.equal(result.scores.shellPairing, 0.5);
	assert.equal(result.scores.shellContinuity, 0);
	assert.ok(result.findings.some((finding) => finding.metric === "shell-continuity"));
	assert.ok(result.findings.some((finding) => finding.message.includes("custom header/topbar")));
	assert.ok(result.findings.some((finding) => finding.message.includes("window.location.reload")));
});

test("declared module boundaries use their own paired shell density", () => {
	const plan = routePlan([{id: "studio", file: "src/Studio.tsx", moduleBoundaryId: "studio-product", regions: []}], {
		moduleBoundary: "src/layout/AppShell.tsx",
	});
	plan.artifactContract.shell = {
		id: "main-shell",
		persistentAcrossRoutes: true,
		density: "comfortable",
		moduleBoundaries: [{id: "studio-product", density: "compact", routes: ["studio"]}],
	};
	const result = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: plan,
		files: [
			{
				path: "src/Studio.tsx",
				language: "tsx",
				content:
					'export const Studio = () => <><CoreAppSidebar density="compact"/><CoreAppTopBar density="compact"/></>;',
			},
			{
				path: "src/layout/AppShell.tsx",
				language: "tsx",
				content: "export const AppShell = () => <><CoreAppSidebar/><CoreAppTopBar/></>;",
			},
		],
	});
	assert.equal(result.scores.shellFidelity, 1);
	assert.equal(result.routeInventory[0].moduleBoundaryId, "studio-product");
});

test("owned regions detect primitive chat, filter, tab, monitoring, and canvas replacements", () => {
	const result = analyzeRouteAdoption({
		mode: "core-showcase",
		implementationPlan: routePlan(
			[
				{
					id: "workspace",
					file: "src/Workspace.tsx",
					regions: [
						{id: "chat", artifacts: ["core-ai-chat"]},
						{id: "filters", artifacts: ["core-filter-strip"]},
						{id: "views", artifacts: ["core-context-tabs"]},
						{id: "monitor", artifacts: ["trend-chart"]},
						{id: "canvas", artifacts: ["design-canvas"]},
					],
				},
			],
			{moduleBoundary: "src/Workspace.tsx"},
		),
		files: [
			{
				path: "src/Workspace.tsx",
				language: "tsx",
				content: `
					export const Workspace = () => <><CoreAppSidebar/><CoreAppTopBar/>
						<CoreChatMessage/><CoreChatInput/><Select/><Tabs/><Card><ChartContainer/></Card>
						<div className="absolute"><Toolbar/> canvas zoom</div>
					</>;
				`,
			},
		],
	});
	const relevance = result.findings.filter((finding) => finding.metric === "artifact-relevance");
	for (const expectedMessage of [
		"Chat primitives",
		"Primitive select/date",
		"Primitive Tabs",
		"ChartContainer",
		"canvas/toolbar",
	])
		assert.ok(
			relevance.some((finding) => finding.message.includes(expectedMessage)),
			expectedMessage,
		);
});

test("reviewed substitutions are bound to their declared route region and catalog gap", () => {
	const plan = routePlan(
		[
			{
				id: "studio",
				file: "src/Studio.tsx",
				regions: [
					{
						id: "inspector",
						artifacts: ["section-panel"],
						catalogGapId: "catalog-gap/studio-inspector",
					},
				],
			},
		],
		{moduleBoundary: "src/Studio.tsx"},
	);
	plan.substitutions = [
		{
			route: "studio",
			templateRegion: "inspector",
			catalogGapId: "catalog-gap/studio-inspector",
			reason: "No catalog inspector exists",
			reviewStatus: "approved",
		},
	];
	const accepted = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: plan,
		files: [
			{
				path: "src/Studio.tsx",
				language: "tsx",
				content: "export const Studio = () => <><CoreAppSidebar/><CoreAppTopBar/></>;",
			},
		],
	});
	assert.ok(
		accepted.findings.some(
			(finding) => finding.source === "studio:inspector" && finding.pass && finding.message.includes("Approved"),
		),
	);

	plan.substitutions[0].reviewStatus = "rejected";
	const rejected = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: plan,
		files: [
			{
				path: "src/Studio.tsx",
				language: "tsx",
				content: "export const Studio = () => <><CoreAppSidebar/><CoreAppTopBar/></>;",
			},
		],
	});
	assert.ok(rejected.findings.some((finding) => !finding.pass && finding.message.includes("not approved")));
});

test("unknown adapt-template replacement requires a structured catalog-gap declaration", async () => {
	const kb = createKnowledge();
	const result = await kb.callTool("validate", {
		mode: "core-product",
		implementationPlan: {
			contractVersion: "artifact-contract/1",
			goal: "product-ui",
			implementationMode: "adapt-template",
			referenceTemplate: "analytics-overview",
			artifactContract: {
				required: [],
				recommended: [],
				allowedPrimitives: [],
				manualRecreationForbidden: [],
				requiredTemplateRegions: ["content"],
			},
			substitutions: [{templateRegion: "content", replacement: "LocalPanel", reason: "No match"}],
		},
		code: `
			import {Button} from "@corensystem/coren-ui/button";
			export default () => <LocalPanel><Button>Go</Button></LocalPanel>;
		`,
	});
	assert.equal(result.data.compliant, false);
	assert.ok(
		result.data.findings.some(
			(finding) => finding.metric === "template-substitution" && finding.message.includes("structured catalog-gap"),
		),
	);
});

test("the minimized multi-surface experiment fixture remains a failing adoption baseline", () => {
	const result = analyzeRouteAdoption({
		mode: "core-product",
		implementationPlan: routePlan(
			[
				{id: "home", files: ["src/Home.tsx"], regions: [{id: "work-items", requiredArtifacts: ["data-table"]}]},
				{
					id: "monitoring",
					files: ["src/Monitoring.tsx"],
					regions: [{id: "monitoring", requiredArtifacts: ["trend-chart"]}],
				},
				{id: "studio", files: ["src/Studio.tsx"], regions: [{id: "canvas", requiredArtifacts: ["design-canvas"]}]},
			],
			{moduleBoundary: "src/AppShell.tsx"},
		),
		files: [
			fixtureFile("AppShell.tsx"),
			fixtureFile("Home.tsx"),
			fixtureFile("Monitoring.tsx"),
			fixtureFile("Studio.tsx"),
		],
	});
	assert.ok(result.scores.ownedRegionAdoption < 1);
	assert.ok(result.findings.some((finding) => finding.message.includes("ChartContainer")));
	assert.ok(result.findings.some((finding) => finding.message.includes("window.location.reload")));
});
