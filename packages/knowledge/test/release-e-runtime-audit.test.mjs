import assert from "node:assert/strict";
import {test} from "node:test";

import {validateRuntimeAudit} from "../dist/validate/runtime-audit.mjs";

const implementationPlan = {
	planId: "plan_routes",
	contractVersion: "core-artifact-contract/2",
	artifactContract: {
		shell: {
			id: "operations-shell",
			persistentAcrossRoutes: true,
			sidebar: {id: "core-app-sidebar"},
			topBar: {id: "core-app-top-bar"},
			density: "comfortable",
			brandKey: "core",
			navigationFingerprint: "primary-nav",
			providerOwner: "application-root",
			layoutOwnership: {contiguous: true, sidebarStationary: true, scrollOwner: "route-content"},
			moduleBoundaries: [],
		},
		routes: [
			{id: "home", path: "/", regions: [{id: "work", interactions: ["sort-work"]}]},
			{id: "studio", path: "/studio", regions: [{id: "canvas", interactions: ["select-node"]}]},
		],
	},
};

const routeEvidence = (route, interaction) => ({
	route,
	shellId: "operations-shell",
	shellFingerprint: {
		shellId: "operations-shell",
		sidebarArtifactId: "core-app-sidebar",
		topBarArtifactId: "core-app-top-bar",
		density: "comfortable",
		sidebarDensity: "comfortable",
		topBarDensity: "comfortable",
		brandKey: "core",
		navigationFingerprint: "primary-nav",
		providerOwner: "application-root",
		domPersistent: true,
	},
	ownedStyles: [
		{
			artifactId: "core-app-top-bar",
			region: "shell.top-bar",
			properties: {
				backgroundColor: "rgb(255, 255, 255)",
				borderBottomWidth: "1px",
				borderBottomStyle: "solid",
				borderBottomColor: "rgb(220, 220, 220)",
			},
		},
	],
	shellGeometry: {
		viewportHeight: 900,
		shellHeight: 900,
		sidebarRight: 240,
		topBarLeft: 240,
		contentLeft: 240,
		sidebarPositionDelta: 0,
		contentScrollRange: 600,
		contentScrollDelta: 160,
		documentScrollDelta: 0,
	},
	duplicateAffordances: [],
	duplicateSurfaceBoundaries: [],
	responsiveAudits: [
		{
			name: "desktop",
			width: 1440,
			height: 900,
			horizontalOverflow: false,
			groups: [],
			overlaps: [],
			splitGroups: [],
			identityWidths: [],
			unlabeledIconActions: [],
		},
		{
			name: "narrow",
			width: 820,
			height: 900,
			horizontalOverflow: false,
			groups: [],
			overlaps: [],
			splitGroups: [],
			identityWidths: [],
			unlabeledIconActions: [],
		},
	],
	canvasCapabilities: [],
	navigationAffordances: [],
	regions: [route === "home" ? "work" : "canvas"],
	interactions: [{id: interaction, passed: true}],
	historyBackPassed: true,
	reloadDetected: false,
	consoleErrors: [],
	accessibilityErrors: [],
});

test("contract v2 product validation blocks missing runtime evidence", () => {
	const result = validateRuntimeAudit({mode: "core-product", implementationPlan});
	assert.equal(result.scores.routeRuntimeCoverage, 0);
	assert.ok(result.findings.some((finding) => finding.metric === "runtime-audit" && !finding.pass));
});

test("contract v2 screenshot validation blocks missing runtime evidence in strict mode", () => {
	const screenshotPlan = {...implementationPlan, goal: "visual-reproduction"};
	const result = validateRuntimeAudit({mode: "core-template-strict", implementationPlan: screenshotPlan});
	assert.equal(result.scores.routeRuntimeCoverage, 0);
	assert.ok(result.findings.some((finding) => finding.metric === "runtime-audit" && !finding.pass));
});

test("contract v2 rejects evidence from the pre-fingerprint runtime harness", () => {
	const result = validateRuntimeAudit({
		mode: "core-product",
		implementationPlan,
		runtimeAudit: {
			producer: "core-runtime-audit/1",
			version: "1",
			planId: "plan_routes",
			generatedAt: "2026-07-16T00:00:00.000Z",
			routes: [routeEvidence("home", "sort-work"), routeEvidence("studio", "select-node")],
		},
	});
	assert.ok(result.findings.some((finding) => finding.metric === "runtime-audit-provenance" && !finding.pass));
});

test("runtime evidence covers routes, shared shell, history, and required interactions", () => {
	const result = validateRuntimeAudit({
		mode: "core-product",
		implementationPlan,
		runtimeAudit: {
			producer: "core-runtime-audit/4",
			version: "4",
			planId: "plan_routes",
			generatedAt: "2026-07-16T00:00:00.000Z",
			routes: [routeEvidence("home", "sort-work"), routeEvidence("studio", "select-node")],
		},
	});
	assert.deepEqual(result.scores, {
		routeRuntimeCoverage: 1,
		regionRuntimeCoverage: 1,
		interactionCoverage: 1,
		shellRuntimeContinuity: 1,
		shellFingerprintFidelity: 1,
		ownedVisualFidelity: 1,
		shellGeometryFidelity: 1,
		interactionSemantics: 1,
		responsiveLayoutFidelity: 1,
	});
	assert.equal(result.findings.filter((finding) => !finding.pass).length, 0);
});

test("runtime evidence rejects shell drift, reloads, and failed interactions", () => {
	const studio = routeEvidence("studio", "select-node");
	studio.shellId = "studio-shell";
	studio.shellFingerprint.shellId = "studio-shell";
	studio.shellFingerprint.brandKey = "fleet";
	studio.shellFingerprint.topBarDensity = "compact";
	studio.shellFingerprint.domPersistent = false;
	studio.ownedStyles[0].properties.backgroundColor = "transparent";
	studio.ownedStyles[0].properties.borderBottomWidth = "0px";
	studio.ownedStyles[0].properties.borderBottomStyle = "none";
	studio.shellGeometry.shellHeight = 1200;
	studio.shellGeometry.sidebarPositionDelta = -160;
	studio.shellGeometry.contentScrollDelta = 0;
	studio.shellGeometry.documentScrollDelta = 160;
	studio.shellGeometry.topBarLeft = 264;
	studio.duplicateAffordances = [{purpose: "Ask your agent to update itself", count: 2}];
	studio.reloadDetected = true;
	studio.interactions[0].passed = false;
	const result = validateRuntimeAudit({
		mode: "core-showcase",
		implementationPlan,
		runtimeAudit: {
			producer: "core-runtime-audit/4",
			version: "4",
			planId: "plan_routes",
			generatedAt: "2026-07-16T00:00:00.000Z",
			routes: [routeEvidence("home", "sort-work"), studio],
		},
	});
	assert.equal(result.scores.shellRuntimeContinuity, 0);
	assert.equal(result.scores.interactionCoverage, 0.5);
	assert.ok(result.scores.shellFingerprintFidelity < 1);
	assert.equal(result.scores.ownedVisualFidelity, 0.5);
	assert.ok(result.scores.shellGeometryFidelity < 1);
	assert.equal(result.scores.interactionSemantics, 0);
	assert.ok(result.findings.some((finding) => finding.metric === "route-navigation-runtime"));
	assert.ok(result.findings.some((finding) => finding.metric === "shell-runtime-fingerprint"));
	assert.ok(result.findings.some((finding) => finding.metric === "owned-visual-fidelity"));
	assert.ok(result.findings.some((finding) => finding.metric === "shell-runtime-geometry"));
	assert.ok(result.findings.some((finding) => finding.metric === "duplicate-affordance-runtime"));
});

test("runtime evidence rejects decorative canvas controls and peer-route back navigation", () => {
	const plan = structuredClone(implementationPlan);
	plan.artifactContract.routes[1].regions[0].requiredCapabilities = ["pan", "fit-to-view"];
	plan.artifactContract.routes[1].regions[0].navigationRelationship = {type: "peer"};
	const studio = routeEvidence("studio", "select-node");
	studio.canvasCapabilities = [{region: "canvas", capabilities: ["zoom"], observableStateChanged: false}];
	studio.navigationAffordances = [{purpose: "back", relationship: "peer", destination: "/"}];
	const result = validateRuntimeAudit({
		mode: "core-product",
		implementationPlan: plan,
		runtimeAudit: {
			producer: "core-runtime-audit/4",
			version: "4",
			planId: "plan_routes",
			generatedAt: "2026-07-18T00:00:00.000Z",
			routes: [routeEvidence("home", "sort-work"), studio],
		},
	});
	assert.ok(result.findings.some((finding) => finding.metric === "functional-capability-runtime"));
	assert.ok(result.findings.some((finding) => finding.metric === "navigation-semantics-runtime"));
	assert.ok(result.scores.interactionSemantics < 1);
});

test("runtime evidence rejects duplicate surface boundaries and narrow responsive failures", () => {
	const home = routeEvidence("home", "sort-work");
	home.duplicateSurfaceBoundaries = [{artifactId: "core-app-top-bar", owner: "parent", edge: "bottom"}];
	home.responsiveAudits[1].horizontalOverflow = true;
	home.responsiveAudits[1].overlaps = [{first: "identity", second: "actions"}];
	home.responsiveAudits[1].splitGroups = ["actions"];
	home.responsiveAudits[1].identityWidths = [{id: "identity", width: 140}];
	home.responsiveAudits[1].unlabeledIconActions = ["<button><svg /></button>"];
	const result = validateRuntimeAudit({
		mode: "core-product",
		implementationPlan,
		runtimeAudit: {
			producer: "core-runtime-audit/4",
			version: "4",
			planId: "plan_routes",
			generatedAt: "2026-07-18T00:00:00.000Z",
			routes: [home, routeEvidence("studio", "select-node")],
		},
	});
	assert.ok(result.findings.some((finding) => finding.metric === "duplicate-divider-runtime"));
	assert.ok(result.findings.some((finding) => finding.metric === "responsive-layout-runtime"));
	assert.ok(result.scores.responsiveLayoutFidelity < 1);
});
