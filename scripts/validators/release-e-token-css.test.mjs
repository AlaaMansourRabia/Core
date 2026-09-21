import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {describe, it} from "node:test";

import {gradeFileSet} from "./index.mjs";

describe("Release E token provenance and CSS ownership", () => {
	it("rejects the experiment's literal-backed reference palette", () => {
		const result = gradeFileSet({
			"src/app.css":
				":root { --ref-color-brand: #0f6fc6; --ref-color-ink: #17212b; --ref-color-panel: #ffffff; }\n.panel { color: var(--ref-color-brand); background: var(--ref-color-panel); border-color: var(--ref-color-ink); }",
		});
		assert.equal(result.metrics["token-provenance"], false);
		assert.equal(result.metrics["tokens-color"], false);
		assert.equal(result.tokenProvenance.summary.invalid, 3);
		assert.ok(result.tokens.overall.score < 1);
		assert.equal(
			result.cssOwnership.issues.some((issue) => issue.kind === "custom-color-system"),
			true,
		);
	});

	it("accepts recursive aliases that terminate in a documented WakeCore token", () => {
		const result = gradeFileSet({
			"src/app.css":
				":root { --app-fg: var(--surface-fg); --surface-fg: var(--wwc-color-foreground); }\n.panel { color: var(--app-fg); gap: var(--wwc-spacing-4); }",
		});
		assert.equal(result.metrics["token-provenance"], true);
		assert.equal(result.tokens.overall.score, 1);
		assert.equal(result.tokenProvenance.usages[0].status, "wakecore-token");
	});

	it("rejects unresolved and cyclic aliases", () => {
		const result = gradeFileSet({
			"src/app.css":
				":root { --cycle-a: var(--cycle-b); --cycle-b: var(--cycle-a); }\n.a { color: var(--cycle-a); } .b { color: var(--missing-brand); }",
		});
		assert.deepEqual(
			new Set(result.tokenProvenance.issues.map((issue) => issue.status)),
			new Set(["cyclic", "unresolved"]),
		);
		assert.equal(result.metrics["token-provenance"], false);
	});

	it("does not treat non-design functional variables as token violations", () => {
		const result = gradeFileSet({
			"src/app.css": ".meter { transform: translateX(var(--progress-offset)); opacity: var(--progress-opacity); }",
		});
		assert.equal(result.metrics["token-provenance"], true);
		assert.equal(result.tokenProvenance.summary.total, 0);
	});

	it("reports internal selectors and dense custom widget anatomy", () => {
		const result = gradeFileSet({
			"src/app.css":
				"[data-slot='card'] .custom-sidebar { position: absolute; width: 240px; } [data-sidebar] .chart-card { position: absolute; height: 200px; } .dashboard-header { position: fixed; width: 100%; height: 64px; min-height: 64px; }",
		});
		assert.equal(result.cssOwnership.internalOverrides.length, 2);
		assert.equal(
			result.cssOwnership.issues.some((issue) => issue.kind === "custom-widget-anatomy"),
			true,
		);
		assert.equal(result.metrics["css-ownership"], false);
	});

	it("rejects missing tokens, semantic-role remapping, and incompatible complete-color wrappers", () => {
		const result = gradeFileSet({
			"src/app.css": `
				:root {
					--app-muted-text: var(--wwc-color-violet-500);
					--app-brand: var(--wwc-color-blue-100);
				}
				.panel { color: var(--app-muted-text); background: hsl(var(--background)); border-color: var(--app-brand); }
			`,
		});
		assert.equal(result.metrics["token-provenance"], false);
		assert.equal(result.metrics["token-semantics"], false);
		assert.ok(result.tokenSemantics.unresolvedTokens.some((issue) => issue.name === "--app-brand"));
		assert.ok(result.tokenSemantics.semanticRoleIssues.some((issue) => issue.name === "--app-muted-text"));
		assert.ok(result.tokenSemantics.syntaxIssues.some((issue) => issue.token === "--background"));
	});

	it("scans chart configuration and SVG props for raw TSX colors", () => {
		const result = gradeFileSet({
			"src/Chart.tsx": `
				export const options = {series: [{itemStyle: {color: "#39c987"}, lineStyle: {color: "rgb(124, 58, 237)"}}]};
				export const Chart = () => <svg><path fill="#f59e0b" /></svg>;
			`,
		});
		assert.equal(result.metrics["source-color-literals"], false);
		assert.equal(result.tokenSemantics.sourceColors.length, 3);
	});

	it("detects role/state and wrapper-child overrides that create hybrid component variants", () => {
		const result = gradeFileSet({
			"src/app.css": `
				.app-crumb > div { background: transparent; border-bottom: 0; }
				.metric-tabs [role="tablist"] { background: transparent; }
				.metric-tabs [role="tab"][data-state="active"] { background: var(--primary); border-radius: var(--radius); }
			`,
		});
		assert.ok(result.cssOwnership.wrapperChildOverrides.length > 0);
		assert.ok(result.cssOwnership.variantIntegrity.length > 0);
		assert.ok(result.cssOwnership.internalOverrides.some((item) => item.attribute === "role"));
		assert.equal(result.metrics["css-ownership"], false);
	});

	it("keeps the minimized multi-surface experiment as a negative end-to-end fixture", () => {
		const fixture = new URL("../../eval/fixtures/multi-surface-adoption-negative/", import.meta.url);
		const result = gradeFileSet({
			"src/styles.css": readFileSync(new URL("styles.css", fixture), "utf8"),
			"src/Monitoring.tsx": readFileSync(new URL("Monitoring.tsx", fixture), "utf8"),
			"src/Home.tsx": readFileSync(new URL("Home.tsx", fixture), "utf8"),
			"src/Studio.tsx": readFileSync(new URL("Studio.tsx", fixture), "utf8"),
			"src/EmailAssistant.tsx": readFileSync(new URL("EmailAssistant.tsx", fixture), "utf8"),
		});
		assert.equal(result.metrics["token-semantics"], false);
		assert.equal(result.metrics["source-color-literals"], false);
		assert.equal(result.metrics["css-ownership"], false);
		assert.ok(result.tokenSemantics.unresolvedTokens.some((issue) => issue.name === "--wwc-color-blue-100"));
		assert.ok(result.tokenSemantics.sourceColors.length >= 2);
		assert.ok(result.cssOwnership.variantIntegrity.length > 0);
		assert.ok(result.cssOwnership.shellLayout.issues.length > 0);
		assert.ok(result.cssOwnership.ownedArtifactOverrides.length > 0);
		assert.equal(result.metrics["interaction-semantics"], false);
		assert.ok(result.interactionSemantics.duplicateComposers.length > 0);
		assert.ok(result.interactionSemantics.redundantSurfaceWrappers.length > 0);
		assert.ok(result.interactionSemantics.fabricatedBackNavigation.length > 0);
		assert.ok(result.interactionSemantics.decorativeCanvases.length > 0);
	});

	it("requires viewport-owned shell scrolling and rejects accidental shell gutters", () => {
		const invalid = gradeFileSet({
			"src/app.css":
				".app-shell { min-height: 100vh; } .main-shell { padding-left: 24px; } .route-content { min-height: 100vh; }",
		});
		assert.equal(invalid.metrics["css-ownership"], false);
		assert.ok(invalid.cssOwnership.shellLayout.issues.some((issue) => issue.kind === "viewport-scroll-ownership"));
		assert.ok(invalid.cssOwnership.shellLayout.issues.some((issue) => issue.kind === "shell-gutter"));

		const valid = gradeFileSet({
			"src/app.css":
				".app-shell { height: 100dvh; overflow: hidden; } .route-content { min-height: 0; overflow: auto; }",
		});
		assert.equal(valid.cssOwnership.shellLayout.viewportOwned, true);
		assert.equal(valid.cssOwnership.shellLayout.contentOwned, true);
	});

	it("rejects DataTable and chart surface repainting", () => {
		const result = gradeFileSet({
			"src/app.css":
				".data-table th { color: var(--wwc-color-blue-600); } .monitoring-chart { background: var(--wwc-color-muted); }",
		});
		assert.equal(result.metrics["css-ownership"], false);
		assert.deepEqual(
			new Set(result.cssOwnership.ownedArtifactOverrides.map((item) => item.kind)),
			new Set(["data-table-internals", "chart-surface"]),
		);
	});

	it("rejects duplicate composers, redundant table surfaces, fabricated back buttons, and decorative canvases", () => {
		const result = gradeFileSet({
			"src/Experiment.tsx": `
				const Experiment = () => <>
					<CoreAiChat/><PromptInput placeholder="Ask your agent to update itself"/>
					<Card><DataTable/></Card>
					<Button onClick={() => navigate("/")}><ArrowLeft/>Back</Button>
					<div className="absolute"><ZoomTools/></div>
				</>;
			`,
		});
		assert.equal(result.metrics["interaction-semantics"], false);
		assert.ok(result.interactionSemantics.duplicateComposers.length > 0);
		assert.ok(result.interactionSemantics.redundantSurfaceWrappers.length > 0);
		assert.ok(result.interactionSemantics.fabricatedBackNavigation.length > 0);
		assert.ok(result.interactionSemantics.decorativeCanvases.length > 0);
	});

	it("rejects duplicate CoreAppTopBar dividers and inactive gap utilities", () => {
		const result = gradeFileSet({
			"src/Header.tsx": `
				const Header = () => <header className="wwc:border-b"><CoreAppTopBar activeLabel="Home" /></header>;
				const Actions = () => <div className="wwc:gap-3"><Button>Edit</Button><Button>Share</Button></div>;
			`,
		});
		assert.equal(result.metrics["interaction-semantics"], false);
		assert.equal(result.interactionSemantics.duplicateSurfaceBoundaries.length, 1);
		assert.equal(result.interactionSemantics.inactiveGaps.length, 1);
	});
});
