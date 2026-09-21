export interface RuntimeInteractionEvidence {
	id: string;
	passed: boolean;
}

export interface RuntimeShellFingerprint {
	shellId: string;
	sidebarArtifactId?: string;
	topBarArtifactId?: string;
	density?: "compact" | "comfortable";
	sidebarDensity?: "compact" | "comfortable";
	topBarDensity?: "compact" | "comfortable";
	brandKey?: string;
	navigationFingerprint?: string;
	footerFingerprint?: string;
	providerOwner?: string;
	domPersistent: boolean;
}

export interface RuntimeOwnedStyleEvidence {
	artifactId: string;
	region?: string;
	variant?: string;
	surface?: string;
	properties: Record<string, string>;
}

export interface RuntimeShellGeometryEvidence {
	viewportHeight: number;
	shellHeight: number;
	sidebarRight: number;
	topBarLeft: number;
	contentLeft: number;
	sidebarPositionDelta: number;
	contentScrollRange: number;
	contentScrollDelta: number;
	documentScrollDelta: number;
}

export interface RuntimeResponsiveAuditEvidence {
	name: string;
	width: number;
	height: number;
	horizontalOverflow: boolean;
	groups: Array<{
		id: string;
		priority?: string;
		left: number;
		right: number;
		top: number;
		bottom: number;
		width: number;
		height: number;
	}>;
	overlaps: Array<{first: string; second: string}>;
	splitGroups: string[];
	identityWidths: Array<{id: string; width: number}>;
	unlabeledIconActions: string[];
}

export interface RuntimeRouteEvidence {
	route: string;
	shellId: string;
	shellFingerprint: RuntimeShellFingerprint;
	ownedStyles: RuntimeOwnedStyleEvidence[];
	shellGeometry: RuntimeShellGeometryEvidence;
	duplicateAffordances: Array<{purpose: string; count: number}>;
	duplicateSurfaceBoundaries: Array<{artifactId: string; owner: string; edge: string}>;
	responsiveAudits: RuntimeResponsiveAuditEvidence[];
	canvasCapabilities: Array<{region: string; capabilities: string[]; observableStateChanged: boolean}>;
	navigationAffordances: Array<{purpose: string; relationship: string; destination?: string}>;
	sidebar?: string;
	topBar?: string;
	title?: string;
	mainAction?: string;
	regions: string[];
	interactions: RuntimeInteractionEvidence[];
	historyBackPassed: boolean;
	reloadDetected: boolean;
	consoleErrors: string[];
	accessibilityErrors: string[];
}

export interface RuntimeAuditEvidence {
	producer: string;
	version: string;
	planId: string;
	generatedAt: string;
	routes: RuntimeRouteEvidence[];
	evidenceHash?: string;
}

interface PlannedRoute {
	id?: string;
	route?: string;
	path?: string;
	regions?: Array<{
		id?: string;
		interactions?: Array<string | {id?: string; required?: boolean}>;
		ownerArtifact?: PlannedArtifact;
		surfaceOwner?: string;
		requiredCapabilities?: string[];
		navigationRelationship?: {type?: string; destination?: string};
	}>;
	interactions?: Array<string | {id?: string; required?: boolean}>;
	moduleBoundary?: boolean;
	moduleBoundaryId?: string;
	shell?: {id?: string; shellId?: string};
}

interface RuntimePlan {
	planId?: string;
	goal?: string;
	contractVersion?: string;
	applicationContract?: {contractVersion?: string; shell?: PlannedShell; routes?: PlannedRoute[]};
	artifactContract?: {contractVersion?: string; shell?: PlannedShell; routes?: PlannedRoute[]};
}

interface PlannedArtifact {
	id?: string;
}

interface PlannedModuleBoundary {
	id?: string;
	routes?: string[];
	shellId?: string;
	sidebar?: PlannedArtifact;
	topBar?: PlannedArtifact;
	density?: "compact" | "comfortable";
	brandKey?: string;
	navigationFingerprint?: string;
	footerFingerprint?: string;
	providerOwner?: string;
	layoutOwnership?: {contiguous?: boolean; sidebarStationary?: boolean; scrollOwner?: string};
}

interface PlannedShell {
	id?: string;
	shellId?: string;
	persistentAcrossRoutes?: boolean;
	sidebar?: PlannedArtifact;
	topBar?: PlannedArtifact;
	density?: "compact" | "comfortable";
	brandKey?: string;
	navigationFingerprint?: string;
	footerFingerprint?: string;
	providerOwner?: string;
	moduleBoundaries?: PlannedModuleBoundary[];
	layoutOwnership?: {contiguous?: boolean; sidebarStationary?: boolean; scrollOwner?: string};
}

export interface RuntimeAuditFinding {
	metric: string;
	pass: boolean;
	level: "error" | "info";
	message: string;
	fix?: string;
	source: string;
}

export interface RuntimeAuditResult {
	findings: RuntimeAuditFinding[];
	scores: {
		routeRuntimeCoverage: number;
		regionRuntimeCoverage: number;
		interactionCoverage: number;
		shellRuntimeContinuity: number;
		shellFingerprintFidelity: number;
		ownedVisualFidelity: number;
		shellGeometryFidelity: number;
		interactionSemantics: number;
		responsiveLayoutFidelity: number;
	};
	summary: {
		plannedRoutes: number;
		auditedRoutes: number;
		requiredRegions: number;
		auditedRegions: number;
		requiredInteractions: number;
		passedInteractions: number;
		fingerprintChecks: number;
		passedFingerprintChecks: number;
		ownedStyleChecks: number;
		passedOwnedStyleChecks: number;
		geometryChecks: number;
		passedGeometryChecks: number;
		semanticChecks: number;
		passedSemanticChecks: number;
		responsiveChecks: number;
		passedResponsiveChecks: number;
	};
}

function routeId(route: PlannedRoute): string {
	return route.id ?? route.route ?? route.path ?? "";
}

function plannedRoutes(plan: RuntimePlan | undefined): PlannedRoute[] {
	return plan?.applicationContract?.routes ?? plan?.artifactContract?.routes ?? [];
}

function plannedShell(plan: RuntimePlan | undefined): PlannedShell | undefined {
	return plan?.applicationContract?.shell ?? plan?.artifactContract?.shell;
}

function expectedShell(
	plan: RuntimePlan | undefined,
	route: PlannedRoute,
): PlannedShell | PlannedModuleBoundary | undefined {
	const shell = plannedShell(plan);
	const boundary = shell?.moduleBoundaries?.find(
		(candidate) => candidate.id === route.moduleBoundaryId || candidate.routes?.includes(routeId(route)),
	);
	return boundary ?? shell;
}

function expectedShellId(value: PlannedShell | PlannedModuleBoundary | undefined): string | undefined {
	return value?.shellId ?? value?.id;
}

function requiredInteractionIds(route: PlannedRoute): string[] {
	return [...(route.interactions ?? []), ...(route.regions ?? []).flatMap((region) => region.interactions ?? [])]
		.filter((entry) => typeof entry === "string" || entry.required !== false)
		.map((entry) => (typeof entry === "string" ? entry : (entry.id ?? "")))
		.filter(Boolean);
}

function ratio(numerator: number, denominator: number): number {
	return denominator === 0 ? 1 : Number((numerator / denominator).toFixed(4));
}

export function validateRuntimeAudit(input: {
	mode: string;
	implementationPlan?: unknown;
	runtimeAudit?: RuntimeAuditEvidence;
}): RuntimeAuditResult {
	const plan = input.implementationPlan as RuntimePlan | undefined;
	const routes = plannedRoutes(plan);
	const evidence = input.runtimeAudit;
	const findings: RuntimeAuditFinding[] = [];
	const contractVersion =
		plan?.contractVersion ?? plan?.applicationContract?.contractVersion ?? plan?.artifactContract?.contractVersion;
	const runtimeRequired =
		contractVersion === "wakecore-artifact-contract/2" &&
		routes.length > 0 &&
		(["wakecore-product", "wakecore-showcase"].includes(input.mode) || plan?.goal === "visual-reproduction");
	const plannedRegionCount = routes.reduce(
		(total, route) => total + (route.regions ?? []).filter((region) => region.id).length,
		0,
	);
	const plannedInteractionCount = routes.reduce((total, route) => total + requiredInteractionIds(route).length, 0);

	if (!runtimeRequired)
		return {
			findings,
			scores: {
				routeRuntimeCoverage: 1,
				regionRuntimeCoverage: 1,
				interactionCoverage: 1,
				shellRuntimeContinuity: 1,
				shellFingerprintFidelity: 1,
				ownedVisualFidelity: 1,
				shellGeometryFidelity: 1,
				interactionSemantics: 1,
				responsiveLayoutFidelity: 1,
			},
			summary: {
				plannedRoutes: routes.length,
				auditedRoutes: evidence?.routes.length ?? 0,
				requiredRegions: plannedRegionCount,
				auditedRegions: 0,
				requiredInteractions: plannedInteractionCount,
				passedInteractions: 0,
				fingerprintChecks: 0,
				passedFingerprintChecks: 0,
				ownedStyleChecks: 0,
				passedOwnedStyleChecks: 0,
				geometryChecks: 0,
				passedGeometryChecks: 0,
				semanticChecks: 0,
				passedSemanticChecks: 0,
				responsiveChecks: 0,
				passedResponsiveChecks: 0,
			},
		};

	if (!evidence) {
		findings.push({
			metric: "runtime-audit",
			pass: false,
			level: "error",
			message: `${input.mode} requires a runtime audit for every planned route.`,
			fix: "Run the WakeCore runtime audit command against the application and pass its evidence to validate.",
			source: "runtime-audit",
		});
		return {
			findings,
			scores: {
				routeRuntimeCoverage: 0,
				regionRuntimeCoverage: 0,
				interactionCoverage: 0,
				shellRuntimeContinuity: 0,
				shellFingerprintFidelity: 0,
				ownedVisualFidelity: 0,
				shellGeometryFidelity: 0,
				interactionSemantics: 0,
				responsiveLayoutFidelity: 0,
			},
			summary: {
				plannedRoutes: routes.length,
				auditedRoutes: 0,
				requiredRegions: plannedRegionCount,
				auditedRegions: 0,
				requiredInteractions: plannedInteractionCount,
				passedInteractions: 0,
				fingerprintChecks: 0,
				passedFingerprintChecks: 0,
				ownedStyleChecks: 0,
				passedOwnedStyleChecks: 0,
				geometryChecks: 0,
				passedGeometryChecks: 0,
				semanticChecks: 0,
				passedSemanticChecks: 0,
				responsiveChecks: 0,
				passedResponsiveChecks: 0,
			},
		};
	}

	const producerValid = evidence.producer === "wakecore-runtime-audit/4" && evidence.version === "4";
	findings.push({
		metric: "runtime-audit-provenance",
		pass: producerValid,
		level: producerValid ? "info" : "error",
		message: producerValid
			? `Runtime evidence was produced by ${evidence.producer}.`
			: "Runtime evidence was not produced by the current WakeCore audit harness (version 4).",
		fix: producerValid ? undefined : "Generate evidence with the WakeCore runtime audit command.",
		source: "runtime-audit",
	});

	const planMatches = Boolean(plan?.planId && evidence.planId === plan.planId);
	findings.push({
		metric: "runtime-audit-plan",
		pass: planMatches,
		level: planMatches ? "info" : "error",
		message: planMatches
			? "Runtime evidence matches the implementation plan."
			: "Runtime evidence planId does not match the implementation plan.",
		fix: planMatches ? undefined : "Re-run the audit with the unchanged implementation plan.",
		source: "runtime-audit",
	});

	const evidenceByRoute = new Map(evidence.routes.map((route) => [route.route, route]));
	let auditedRoutes = 0;
	const requiredInteractions = plannedInteractionCount;
	let passedInteractions = 0;
	const requiredRegions = plannedRegionCount;
	let auditedRegions = 0;
	let shellContinuity = true;
	let fingerprintChecks = 0;
	let passedFingerprintChecks = 0;
	let ownedStyleChecks = 0;
	let passedOwnedStyleChecks = 0;
	let geometryChecks = 0;
	let passedGeometryChecks = 0;
	let semanticChecks = 0;
	let passedSemanticChecks = 0;
	let responsiveChecks = 0;
	let passedResponsiveChecks = 0;
	const sharedShell = plannedShell(plan);

	for (const route of routes) {
		const id = routeId(route);
		const audited = evidenceByRoute.get(id);
		if (!audited) {
			findings.push({
				metric: "route-runtime-coverage",
				pass: false,
				level: "error",
				message: `Planned route ${id} has no runtime audit evidence.`,
				fix: `Navigate to and audit route ${id}.`,
				source: "runtime-audit",
			});
			continue;
		}
		auditedRoutes += 1;
		const renderedRegions = new Set(audited.regions);
		for (const region of route.regions ?? []) {
			if (!region.id) continue;
			if (renderedRegions.has(region.id)) auditedRegions += 1;
			else
				findings.push({
					metric: "region-runtime-coverage",
					pass: false,
					level: "error",
					message: `Required region ${id}/${region.id} was not visible during the runtime audit.`,
					fix: `Render and mark the region with data-wakecore-region="${region.id}".`,
					source: "runtime-audit",
				});
		}
		const shellContract = expectedShell(plan, route);
		const shellId = route.shell?.shellId ?? route.shell?.id ?? expectedShellId(shellContract);
		if (shellId && audited.shellId !== shellId) {
			shellContinuity = false;
			findings.push({
				metric: "shell-runtime-continuity",
				pass: false,
				level: "error",
				message: `Route ${id} rendered shell ${audited.shellId}; expected ${shellId}.`,
				fix: "Keep the shared application shell stable or declare an intentional module boundary.",
				source: "runtime-audit",
			});
		}

		const fingerprint = audited.shellFingerprint;
		const expectedFingerprint: Array<[string, string | undefined, string | undefined]> = [
			["shellId", expectedShellId(shellContract), fingerprint.shellId],
			["sidebarArtifactId", shellContract?.sidebar?.id, fingerprint.sidebarArtifactId],
			["topBarArtifactId", shellContract?.topBar?.id, fingerprint.topBarArtifactId],
			["density", shellContract?.density, fingerprint.density],
			["brandKey", shellContract?.brandKey, fingerprint.brandKey],
			["navigationFingerprint", shellContract?.navigationFingerprint, fingerprint.navigationFingerprint],
			["footerFingerprint", shellContract?.footerFingerprint, fingerprint.footerFingerprint],
			["providerOwner", shellContract?.providerOwner, fingerprint.providerOwner],
		];
		const fingerprintMismatches = [];
		for (const [field, expected, actual] of expectedFingerprint) {
			if (!expected) continue;
			fingerprintChecks += 1;
			if (actual === expected) passedFingerprintChecks += 1;
			else fingerprintMismatches.push(`${field}: expected ${expected}, received ${actual ?? "missing"}`);
		}
		if (fingerprint.sidebarDensity || fingerprint.topBarDensity) {
			fingerprintChecks += 1;
			const densityPaired =
				Boolean(fingerprint.sidebarDensity) &&
				fingerprint.sidebarDensity === fingerprint.topBarDensity &&
				(!shellContract?.density || fingerprint.sidebarDensity === shellContract.density);
			if (densityPaired) passedFingerprintChecks += 1;
			else fingerprintMismatches.push("sidebar/top-bar densities are not paired");
		}
		const boundaryDeclared =
			Boolean(route.moduleBoundary || route.moduleBoundaryId) ||
			Boolean(sharedShell?.moduleBoundaries?.some((boundary) => boundary.routes?.includes(id)));
		if (sharedShell?.persistentAcrossRoutes && !boundaryDeclared) {
			fingerprintChecks += 1;
			if (fingerprint.domPersistent) passedFingerprintChecks += 1;
			else fingerprintMismatches.push("shared shell DOM node was remounted");
		}
		if (fingerprintMismatches.length) {
			shellContinuity = false;
			findings.push({
				metric: "shell-runtime-fingerprint",
				pass: false,
				level: "error",
				message: `Route ${id} changed the contracted shell fingerprint (${fingerprintMismatches.join("; ")}).`,
				fix: "Keep shell artifacts, brand, navigation, footer, provider ownership, density, and DOM identity stable, or declare a module boundary.",
				source: "runtime-audit",
			});
		}

		if (shellContract?.topBar?.id) {
			ownedStyleChecks += 1;
			const topBarStyle = audited.ownedStyles.find((style) => style.artifactId === shellContract.topBar?.id);
			const background = topBarStyle?.properties.backgroundColor ?? "";
			const borderWidth = Number.parseFloat(topBarStyle?.properties.borderBottomWidth ?? "0");
			const borderStyle = topBarStyle?.properties.borderBottomStyle ?? "none";
			const visualPass =
				Boolean(topBarStyle) &&
				!/^(?:transparent|rgba\([^)]*,\s*0\s*\))$/i.test(background) &&
				borderWidth >= 1 &&
				borderStyle !== "none";
			if (visualPass) passedOwnedStyleChecks += 1;
			else
				findings.push({
					metric: "owned-visual-fidelity",
					pass: false,
					level: "error",
					message: `Route ${id} does not preserve the CoreAppTopBar background and bottom border.`,
					fix: "Remove application selectors that make the top bar transparent or remove its bottom border.",
					source: "runtime-audit",
				});
		}
		if (shellContract?.layoutOwnership) {
			const geometry = audited.shellGeometry;
			const checks = [
				Math.abs(geometry.shellHeight - geometry.viewportHeight) <= 1,
				!shellContract.layoutOwnership.sidebarStationary || Math.abs(geometry.sidebarPositionDelta) <= 1,
				shellContract.layoutOwnership.scrollOwner !== "route-content" ||
					geometry.contentScrollRange <= 1 ||
					geometry.contentScrollDelta > 0,
				Math.abs(geometry.documentScrollDelta) <= 1,
				!shellContract.layoutOwnership.contiguous ||
					(Math.abs(geometry.sidebarRight - geometry.topBarLeft) <= 1 &&
						Math.abs(geometry.sidebarRight - geometry.contentLeft) <= 1),
			];
			geometryChecks += checks.length;
			passedGeometryChecks += checks.filter(Boolean).length;
			if (checks.some((value) => !value))
				findings.push({
					metric: "shell-runtime-geometry",
					pass: false,
					level: "error",
					message: `Route ${id} does not preserve viewport-owned shell scrolling or a contiguous sidebar boundary.`,
					fix: "Use height:100dvh/overflow:hidden on the shell and min-height:0/overflow:auto on contiguous route content.",
					source: "runtime-audit",
				});
		}

		for (const duplicate of audited.duplicateSurfaceBoundaries) {
			semanticChecks += 1;
			findings.push({
				metric: "duplicate-divider-runtime",
				pass: false,
				level: "error",
				message: `Route ${id} adds a duplicate ${duplicate.edge} boundary around ${duplicate.artifactId} from its ${duplicate.owner}.`,
				fix: "Remove the wrapper/sibling border; the WakeCore artifact owns this surface boundary.",
				source: "runtime-audit",
			});
		}

		responsiveChecks += 1;
		if (audited.responsiveAudits.length >= 2) passedResponsiveChecks += 1;
		else
			findings.push({
				metric: "responsive-layout-runtime",
				pass: false,
				level: "error",
				message: `Route ${id} was audited at ${audited.responsiveAudits.length} viewport(s); at least desktop and 820px narrow evidence is required.`,
				fix: "Generate runtime evidence with WakeCore runtime audit version 4.",
				source: "runtime-audit",
			});
		for (const viewport of audited.responsiveAudits) {
			responsiveChecks += 1;
			const identityReadable = viewport.identityWidths.every((identity) => identity.width >= 200);
			const pass =
				!viewport.horizontalOverflow &&
				viewport.overlaps.length === 0 &&
				viewport.splitGroups.length === 0 &&
				viewport.unlabeledIconActions.length === 0 &&
				identityReadable;
			if (pass) passedResponsiveChecks += 1;
			else
				findings.push({
					metric: "responsive-layout-runtime",
					pass: false,
					level: "error",
					message: `Route ${id} fails responsive layout at ${viewport.name} (${viewport.width}px): overflow=${viewport.horizontalOverflow}, overlaps=${viewport.overlaps.length}, split groups=${viewport.splitGroups.length}, unlabeled icon actions=${viewport.unlabeledIconActions.length}, identity readable=${identityReadable}.`,
					fix: "Preserve atomic flex/grid groups, collapse lower-priority actions into overflow, keep identity width readable, and label icon buttons.",
					source: "runtime-audit",
				});
		}

		for (const duplicate of audited.duplicateAffordances) {
			semanticChecks += 1;
			if (duplicate.count <= 1) passedSemanticChecks += 1;
			else
				findings.push({
					metric: "duplicate-affordance-runtime",
					pass: false,
					level: "error",
					message: `Route ${id} renders ${duplicate.count} visible affordances for ${duplicate.purpose}.`,
					fix: "Keep one visible interaction owner for each user purpose.",
					source: "runtime-audit",
				});
		}
		for (const region of route.regions ?? []) {
			if (
				region.ownerArtifact?.id &&
				region.surfaceOwner === "artifact" &&
				/(?:data-table|chart|tabs?)/i.test(region.ownerArtifact.id)
			) {
				ownedStyleChecks += 1;
				const style = audited.ownedStyles.find((item) => item.artifactId === region.ownerArtifact?.id);
				const background = style?.properties.backgroundColor ?? "";
				if (style && !/^(?:transparent|rgba\([^)]*,\s*0\s*\))$/i.test(background)) passedOwnedStyleChecks += 1;
				else
					findings.push({
						metric: "owned-visual-fidelity",
						pass: false,
						level: "error",
						message: `Route ${id}/${region.id ?? "region"} does not preserve the owned ${region.ownerArtifact.id} surface.`,
						fix: "Remove page CSS repainting and use an official artifact surface variant.",
						source: "runtime-audit",
					});
			}
			if (region.requiredCapabilities?.length) {
				const canvas = audited.canvasCapabilities.find((item) => item.region === region.id);
				for (const capability of region.requiredCapabilities) {
					semanticChecks += 1;
					if (canvas?.capabilities.includes(capability) && canvas.observableStateChanged) passedSemanticChecks += 1;
					else
						findings.push({
							metric: "functional-capability-runtime",
							pass: false,
							level: "error",
							message: `Route ${id}/${region.id ?? "region"} did not prove functional ${capability} behavior.`,
							fix: "Connect visible canvas controls to observable viewport or model state.",
							source: "runtime-audit",
						});
				}
			}
			if (region.navigationRelationship?.type === "peer" || region.navigationRelationship?.type === "none") {
				const backs = audited.navigationAffordances.filter((item) => item.purpose === "back");
				semanticChecks += 1;
				if (backs.length === 0) passedSemanticChecks += 1;
				else
					findings.push({
						metric: "navigation-semantics-runtime",
						pass: false,
						level: "error",
						message: `Route ${id} renders back navigation for a peer/standalone destination.`,
						fix: "Remove redundant back navigation or declare a real parent, drill-in origin, or history relationship.",
						source: "runtime-audit",
					});
			}
		}
		if (audited.reloadDetected || !audited.historyBackPassed)
			findings.push({
				metric: "route-navigation-runtime",
				pass: false,
				level: "error",
				message: `Route ${id} ${audited.reloadDetected ? "performed a full reload" : "failed browser history/back behavior"}.`,
				fix: "Use router-aware navigation that preserves expected application state.",
				source: "runtime-audit",
			});
		if (audited.consoleErrors.length || audited.accessibilityErrors.length)
			findings.push({
				metric: "runtime-quality",
				pass: false,
				level: "error",
				message: `Route ${id} produced ${audited.consoleErrors.length} console and ${audited.accessibilityErrors.length} accessibility error(s).`,
				fix: "Fix runtime and accessibility errors, then repeat the audit.",
				source: "runtime-audit",
			});

		const interactions = new Map(audited.interactions.map((entry) => [entry.id, entry.passed]));
		for (const interactionId of requiredInteractionIds(route)) {
			const passed = interactions.get(interactionId) === true;
			if (passed) passedInteractions += 1;
			else
				findings.push({
					metric: "interaction-coverage",
					pass: false,
					level: "error",
					message: `Required interaction ${interactionId} was not successfully exercised on route ${id}.`,
					fix: `Exercise ${interactionId} through the visible UI and repeat the audit.`,
					source: "runtime-audit",
				});
		}
	}

	return {
		findings,
		scores: {
			routeRuntimeCoverage: ratio(auditedRoutes, routes.length),
			regionRuntimeCoverage: ratio(auditedRegions, requiredRegions),
			interactionCoverage: ratio(passedInteractions, requiredInteractions),
			shellRuntimeContinuity: shellContinuity ? 1 : 0,
			shellFingerprintFidelity: ratio(passedFingerprintChecks, fingerprintChecks),
			ownedVisualFidelity: ratio(passedOwnedStyleChecks, ownedStyleChecks),
			shellGeometryFidelity: ratio(passedGeometryChecks, geometryChecks),
			interactionSemantics: ratio(passedSemanticChecks, semanticChecks),
			responsiveLayoutFidelity: ratio(passedResponsiveChecks, responsiveChecks),
		},
		summary: {
			plannedRoutes: routes.length,
			auditedRoutes,
			requiredRegions,
			auditedRegions,
			requiredInteractions,
			passedInteractions,
			fingerprintChecks,
			passedFingerprintChecks,
			ownedStyleChecks,
			passedOwnedStyleChecks,
			geometryChecks,
			passedGeometryChecks,
			semanticChecks,
			passedSemanticChecks,
			responsiveChecks,
			passedResponsiveChecks,
		},
	};
}
