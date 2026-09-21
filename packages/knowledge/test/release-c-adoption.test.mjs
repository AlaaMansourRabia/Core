import assert from "node:assert/strict";
import {test} from "node:test";

import {createKnowledge} from "../dist/index.mjs";

const kb = createKnowledge();

const productPlan = {
	planId: "plan_product_fixture",
	contractVersion: "artifact-contract/1",
	goal: "product-ui",
	implementationMode: "compose",
	artifactContract: {
		required: [{id: "core-app-sidebar", tier: "widget", reason: "Standard product shell"}],
		recommended: [],
		allowedPrimitives: ["button"],
		manualRecreationForbidden: ["application-sidebar"],
		requiredTemplateRegions: [],
	},
	substitutions: [],
};

test("wakecore-imports remains a compatibility-level import check even with authored CSS", async () => {
	const result = await kb.callTool("validate", {
		mode: "wakecore-imports",
		files: [
			{
				path: "src/App.tsx",
				language: "tsx",
				content: 'import {Button} from "@wakecap/core-ui/button"; export default () => <Button>Go</Button>;',
			},
			{path: "src/app.css", language: "css", content: ".app { color: #123456; }"},
		],
	});
	assert.equal(result.data.compliant, true);
	assert.equal(result.data.complianceLevel, "imports-only");
	assert.ok(result.data.findings.some((finding) => finding.metric === "tokens-color" && finding.level === "warning"));
});

test("product validation rejects primitive-only output against its artifact contract", async () => {
	const result = await kb.callTool("validate", {
		mode: "wakecore-product",
		implementationPlan: productPlan,
		files: [
			{
				path: "src/App.tsx",
				language: "tsx",
				content: 'import {Button} from "@wakecap/core-ui/button"; export default () => <Button>Go</Button>;',
			},
		],
	});
	assert.equal(result.data.compliant, false);
	assert.ok(result.data.artifactInventory.missingRequired.includes("CoreAppSidebar"));
	assert.ok(result.data.findings.some((finding) => finding.metric === "artifact-selection" && !finding.pass));
});

test("product validation detects a manually recreated standard sidebar", async () => {
	const result = await kb.callTool("validate", {
		mode: "wakecore-product",
		implementationPlan: productPlan,
		code: `
			import {Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarFooter} from "@wakecap/core-ui/sidebar";
			export default () => <Sidebar><SidebarHeader/><SidebarContent/><SidebarMenu/><SidebarFooter/></Sidebar>;
		`,
	});
	assert.equal(result.data.compliant, false);
	assert.ok(result.data.findings.some((finding) => finding.metric === "manual-recreation-avoidance"));
});

test("a full contracted showcase passes with relevant widgets, utility, inventory, and token CSS", async () => {
	const result = await kb.callTool("validate", {
		mode: "wakecore-showcase",
		implementationPlan: {
			planId: "plan_showcase_fixture",
			contractVersion: "artifact-contract/1",
			goal: "wakecore-showcase",
			implementationMode: "adapt-template",
			referenceTemplate: "analytics-overview",
			artifactContract: {
				required: [
					{id: "core-app-sidebar", tier: "widget"},
					{id: "core-app-top-bar", tier: "widget"},
					{id: "trend-chart", tier: "widget"},
					{id: "core-content-area", tier: "utility"},
				],
				recommended: [],
				allowedPrimitives: [],
				manualRecreationForbidden: [],
				requiredTemplateRegions: [],
			},
			substitutions: [],
		},
		files: [
			{
				path: "src/App.tsx",
				language: "tsx",
				content: `
					import {CoreAppSidebar} from "@wakecap/core-ui/navigation/core-app-sidebar";
					import {CoreAppTopBar} from "@wakecap/core-ui/navigation/core-app-top-bar";
					import {TrendChart} from "@wakecap/core-ui/trend-chart";
					import {CoreContentArea} from "@wakecap/core-ui/pages/core-content-area";
					export const wakecoreInventory = {templates: [], widgets: ["CoreAppSidebar", "CoreAppTopBar", "TrendChart"], components: [], tokens: ["color.background.surface"]};
					export default () => <CoreContentArea><CoreAppSidebar/><CoreAppTopBar/><TrendChart/></CoreContentArea>;
				`,
			},
			{
				path: "src/app.css",
				language: "css",
				content: ".app { color: var(--wwc-color-foreground); gap: var(--wwc-spacing-4); }",
			},
		],
	});
	assert.equal(result.data.compliant, true, result.data.summary.text);
	assert.equal(result.data.complianceLevel, "showcase");
	assert.equal(result.data.scores.widgetCoverage, 1);
});

test("wakecore-only reports its deprecation alias", async () => {
	const result = await kb.callTool("validate", {
		mode: "wakecore-only",
		code: 'import {Button} from "@wakecap/core-ui/button"; export default () => <Button>Go</Button>;',
	});
	assert.equal(result.data.effectiveMode, "wakecore-imports");
	assert.ok(result.warnings.some((warning) => warning.code === "validation_mode.deprecated"));
});

test("product validation detects a plan contract changed after planning", async () => {
	const planned = await kb.callTool("create_implementation_plan", {
		intent: "a field operations interface with status cards and an activity table",
		strategy: "compose",
		goal: "product-ui",
	});
	const tampered = structuredClone(planned.data);
	tampered.artifactContract.required = [];
	const result = await kb.callTool("validate", {
		mode: "wakecore-product",
		implementationPlan: tampered,
		code: 'import {Button} from "@wakecap/core-ui/button"; export default () => <Button>Go</Button>;',
	});
	assert.equal(result.data.compliant, false);
	assert.ok(result.data.findings.some((finding) => finding.metric === "artifact-contract-integrity"));
});
