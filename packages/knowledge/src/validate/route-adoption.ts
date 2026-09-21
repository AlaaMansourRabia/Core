import type {ValidateInput} from "../schemas/inputs";
import {
	filesForRoute,
	hasJsx,
	normalizeRouteSpecs,
	planRecord,
	ratio,
	rendersArtifact,
	type SourceFile,
} from "./route-adoption-helpers";

export interface RouteAdoptionFinding {
	metric:
		| "shell-pairing"
		| "shell-continuity"
		| "shell-fidelity"
		| "route-coverage"
		| "owned-region-adoption"
		| "artifact-relevance";
	pass: boolean;
	level: "error" | "info";
	message: string;
	fix?: string;
	source: string;
}

export interface RouteAdoptionResult {
	active: boolean;
	findings: RouteAdoptionFinding[];
	scores: {
		shellPairing: number;
		shellContinuity: number;
		shellFidelity: number;
		routeCoverage: number;
		ownedRegionAdoption: number;
		artifactRelevance: number;
	};
	routeInventory: Array<{
		route: string;
		path?: string;
		files: string[];
		imported: string[];
		rendered: string[];
		shell: {sidebar: boolean; topBar: boolean};
		moduleBoundaryId?: string;
		regions: Array<{id: string; requiredArtifacts: string[]; renderedArtifacts: string[]}>;
	}>;
}

const emptyResult = (): RouteAdoptionResult => ({
	active: false,
	findings: [],
	scores: {
		shellPairing: 1,
		shellContinuity: 1,
		shellFidelity: 1,
		routeCoverage: 1,
		ownedRegionAdoption: 1,
		artifactRelevance: 1,
	},
	routeInventory: [],
});

function jsxDensity(source: string, component: string): "compact" | "comfortable" | undefined {
	const match = source.match(new RegExp(`<${component}\\b([^>]*)>`));
	if (!match) return undefined;
	return /\bdensity=["']compact["']/.test(match[1]) ? "compact" : "comfortable";
}

function importedCoreNames(source: string): string[] {
	const names = [];
	for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@core\/core-ui[^"']*["']/g))
		for (const value of match[1].split(",")) {
			const name = value.trim().split(/\s+as\s+/)[0];
			if (name && !name.startsWith("type ")) names.push(name);
		}
	return [...new Set(names)].sort();
}

function inputFiles(input: ValidateInput): SourceFile[] {
	return (
		input.files?.map(({path, content}) => ({path, content})) ??
		(input.code ? [{path: "Component.tsx", content: input.code}] : [])
	);
}

const expected = (artifacts: string[], pattern: RegExp): boolean =>
	artifacts.some((artifact) => pattern.test(artifact));

function manualReplacement(source: string, artifacts: string[]): string | undefined {
	if (expected(artifacts, /data-?table|section-?panel/i) && hasJsx(source, "Card") && hasJsx(source, "Table"))
		return "Card + Table manually recreates the contracted DataTable/SectionPanel region.";
	if (
		expected(artifacts, /trend-?chart|task-?monitor|progress|monitoring|chart-?widget/i) &&
		hasJsx(source, "Card") &&
		hasJsx(source, "ChartContainer")
	)
		return "Card + ChartContainer manually recreates the contracted monitoring/chart widget.";
	if (
		expected(artifacts, /core-?context-?tabs|view-?tab-?bar|browser-?tabs/i) &&
		(hasJsx(source, "Tabs") || hasJsx(source, "TabsList"))
	)
		return "Primitive Tabs replace the contracted page-level tab artifact.";
	if (
		expected(artifacts, /core-?filter-?strip|week-?selector|date-?picker|filter-?widget/i) &&
		(hasJsx(source, "Select") || /<select(?=[\s>])/.test(source) || /type=["']date["']/.test(source))
	)
		return "Primitive select/date controls replace the contracted filter artifact.";
	if (
		expected(artifacts, /core-?(?:ai-)?chat(?:-panel|-widget)?$/i) &&
		!artifacts.some((artifact) => rendersArtifact(source, artifact)) &&
		(hasJsx(source, "CoreChatMessage") || hasJsx(source, "CoreChatInput") || hasJsx(source, "CoreAiChatMessage"))
	)
		return "Chat primitives replace the contracted full chat artifact.";
	if (
		expected(artifacts, /design-?canvas|canvas-?navigator|canvas-?toolbar|blueprint/i) &&
		/(?:position\s*:\s*["']absolute|className=["'][^"']*\babsolute\b)/.test(source) &&
		(hasJsx(source, "Toolbar") || hasJsx(source, "ToolbarButton") || /zoom|pan|canvas/i.test(source))
	)
		return "An absolute-positioned canvas/toolbar manually recreates the contracted canvas artifact.";
	return undefined;
}

export function analyzeRouteAdoption(input: ValidateInput): RouteAdoptionResult {
	const routes = normalizeRouteSpecs(input.implementationPlan as unknown);
	if (routes.length === 0) return emptyResult();
	const files = inputFiles(input);
	const findings: RouteAdoptionFinding[] = [];
	let pairedShells = 0;
	let shellRoutes = 0;
	let shellFidelityChecks = 0;
	let shellFidelityPasses = 0;
	let coveredRoutes = 0;
	let regions = 0;
	let adoptedRegions = 0;
	let relevantArtifacts = 0;
	let adoptedArtifacts = 0;
	const plan = planRecord(input.implementationPlan);
	const contract = planRecord(plan?.artifactContract);
	const declaredShell = planRecord(contract?.shell);
	const substitutions = Array.isArray(plan?.substitutions) ? plan.substitutions : [];
	const sharedShellFiles =
		declaredShell?.persistentAcrossRoutes === true
			? files.filter((file) => hasJsx(file.content, "CoreAppSidebar") && hasJsx(file.content, "CoreAppTopBar"))
			: [];
	const routeInventory: RouteAdoptionResult["routeInventory"] = [];

	for (const route of routes) {
		const routeFiles = filesForRoute(route, files);
		const source = [...new Set([...routeFiles, ...(route.moduleBoundaryId ? [] : sharedShellFiles)])]
			.map((file) => file.content)
			.join("\n");
		if (routeFiles.length > 0) coveredRoutes += 1;
		else
			findings.push({
				metric: "route-coverage",
				pass: false,
				level: "error",
				message: `No implementation module could be associated with route ${route.id}.`,
				fix: "Declare the route's file/module/component boundary in the artifact contract.",
				source: route.id,
			});

		if (route.shell) {
			shellRoutes += 1;
			const sidebar = hasJsx(source, "CoreAppSidebar");
			const topbar = hasJsx(source, "CoreAppTopBar");
			if (sidebar && topbar) pairedShells += 1;
			else
				findings.push({
					metric: "shell-pairing",
					pass: false,
					level: "error",
					message: `Route ${route.id} does not render CoreAppSidebar and CoreAppTopBar as a pair.`,
					fix: "Use the paired Core application shell at the declared shared layout boundary.",
					source: route.id,
				});
			if (!topbar && /<(?:header|[A-Z][A-Za-z]*(?:Header|TopBar))(?=[\s/>])/.test(source))
				findings.push({
					metric: "artifact-relevance",
					pass: false,
					level: "error",
					message: `Route ${route.id} uses a custom header/topbar instead of CoreAppTopBar.`,
					fix: "Use CoreAppTopBar in the shared Core shell.",
					source: route.id,
				});
			const moduleBoundaries = Array.isArray(declaredShell?.moduleBoundaries) ? declaredShell.moduleBoundaries : [];
			const boundary = moduleBoundaries
				.map((value) => planRecord(value))
				.find((value) => value?.id === route.moduleBoundaryId);
			const shellContract = boundary ?? declaredShell;
			const plannedDensity =
				shellContract?.density === "compact" || shellContract?.density === "comfortable"
					? shellContract.density
					: undefined;
			const sidebarDensity = jsxDensity(source, "CoreAppSidebar");
			const topBarDensity = jsxDensity(source, "CoreAppTopBar");
			if (sidebarDensity && topBarDensity) {
				shellFidelityChecks += 1;
				const densityPass = sidebarDensity === topBarDensity && (!plannedDensity || sidebarDensity === plannedDensity);
				if (densityPass) shellFidelityPasses += 1;
				else
					findings.push({
						metric: "shell-fidelity",
						pass: false,
						level: "error",
						message: `Route ${route.id} pairs sidebar density ${sidebarDensity} with top-bar density ${topBarDensity}${plannedDensity ? `; the plan requires ${plannedDensity}` : ""}.`,
						fix: "Use the same planned density for CoreAppSidebar and CoreAppTopBar.",
						source: route.id,
					});
			}
		}

		for (const region of route.regions) {
			regions += 1;
			const rendered = region.artifacts.filter((artifact) => rendersArtifact(source, artifact));
			relevantArtifacts += region.artifacts.length;
			adoptedArtifacts += rendered.length;
			const approvedSubstitution = substitutions.some((value) => {
				const substitution = planRecord(value);
				if (
					!substitution ||
					substitution.reviewStatus !== "approved" ||
					substitution.route !== route.id ||
					substitution.templateRegion !== region.id
				)
					return false;
				const replacementId =
					typeof substitution.replacementArtifactId === "string" ? substitution.replacementArtifactId : undefined;
				const catalogGapId = typeof substitution.catalogGapId === "string" ? substitution.catalogGapId : undefined;
				return Boolean(
					(catalogGapId && catalogGapId === region.catalogGapId) ||
					(replacementId && region.artifacts.includes(replacementId) && rendersArtifact(source, replacementId)),
				);
			});
			const adopted = region.artifacts.length === 0 || rendered.length > 0 || approvedSubstitution;
			if (adopted) adoptedRegions += 1;
			else {
				const renderedElsewhere = files
					.filter((file) => !routeFiles.includes(file))
					.some((file) => region.artifacts.some((artifact) => rendersArtifact(file.content, artifact)));
				findings.push({
					metric: "owned-region-adoption",
					pass: false,
					level: "error",
					message: renderedElsewhere
						? `Artifacts for ${route.id}/${region.id} appear on another route, not in their owned region.`
						: `No contracted artifact is rendered for ${route.id}/${region.id}.`,
					fix: `Render a route-relevant artifact for region ${region.id} inside ${route.id}.`,
					source: `${route.id}:${region.id}`,
				});
			}
			const replacement = manualReplacement(source, region.artifacts);
			if (replacement)
				findings.push({
					metric: "artifact-relevance",
					pass: false,
					level: "error",
					message: `${route.id}/${region.id}: ${replacement}`,
					fix: "Use the highest applicable contracted Core artifact or document a structured catalog-gap substitution.",
					source: `${route.id}:${region.id}`,
				});
			if (
				/(?:page|primary|section|context).*(?:navigation|tabs)|(?:navigation|tabs).*(?:page|primary|section|context)/i.test(
					region.role ?? "",
				) &&
				hasJsx(source, "Tabs") &&
				!hasJsx(source, "CoreContextTabs")
			)
				findings.push({
					metric: "artifact-relevance",
					pass: false,
					level: "error",
					message: `${route.id}/${region.id} uses ordinary Tabs for page-level navigation.`,
					fix: "Use CoreContextTabs or the application shell for page-level sections.",
					source: `${route.id}:${region.id}`,
				});
		}
		const allContractedArtifacts = route.regions.flatMap((region) => region.artifacts);
		routeInventory.push({
			route: route.id,
			path: route.path,
			files: routeFiles.map((file) => file.path),
			imported: importedCoreNames(source),
			rendered: [...new Set(allContractedArtifacts.filter((artifact) => rendersArtifact(source, artifact)))],
			shell: {sidebar: hasJsx(source, "CoreAppSidebar"), topBar: hasJsx(source, "CoreAppTopBar")},
			moduleBoundaryId: route.moduleBoundaryId,
			regions: route.regions.map((region) => ({
				id: region.id,
				requiredArtifacts: region.artifacts,
				renderedArtifacts: region.artifacts.filter((artifact) => rendersArtifact(source, artifact)),
			})),
		});
	}

	for (const value of substitutions) {
		const substitution = planRecord(value);
		if (!substitution || typeof substitution.route !== "string") continue;
		const route = routes.find(
			(candidate) => candidate.id === substitution.route || candidate.path === substitution.route,
		);
		const regionId =
			typeof substitution.templateRegion === "string"
				? substitution.templateRegion
				: typeof substitution.regionId === "string"
					? substitution.regionId
					: undefined;
		const region = route?.regions.find((candidate) => candidate.id === regionId);
		const approved = substitution.reviewStatus === "approved";
		const replacementId =
			typeof substitution.replacementArtifactId === "string" ? substitution.replacementArtifactId : undefined;
		const catalogGapId = typeof substitution.catalogGapId === "string" ? substitution.catalogGapId : undefined;
		const routeSource = route
			? filesForRoute(route, files)
					.map((file) => file.content)
					.join("\n")
			: "";
		const replacementValid = Boolean(
			replacementId && region?.artifacts.includes(replacementId) && rendersArtifact(routeSource, replacementId),
		);
		const gapValid = Boolean(catalogGapId && region?.catalogGapId === catalogGapId);
		const valid = Boolean(route && region && approved && (replacementValid || gapValid));
		findings.push({
			metric: "owned-region-adoption",
			pass: valid,
			level: valid ? "info" : "error",
			message: valid
				? `Approved substitution for ${substitution.route}/${regionId} matches its route contract.`
				: !route || !region
					? `Substitution targets unknown route/region ${substitution.route}/${regionId ?? "(missing)"}.`
					: !approved
						? `Substitution for ${substitution.route}/${regionId} is not approved.`
						: replacementId && !region.artifacts.includes(replacementId)
							? `Replacement ${replacementId} is not relevant to ${substitution.route}/${regionId}.`
							: replacementId
								? `Replacement ${replacementId} is not rendered on route ${substitution.route}.`
								: `Catalog gap ${catalogGapId ?? "(missing)"} does not match ${substitution.route}/${regionId}.`,
			fix: valid
				? undefined
				: "Approve one route-scoped substitution using a relevant catalog artifact, or the region's declared catalogGapId.",
			source: `${substitution.route}:${regionId ?? "unknown"}`,
		});
	}

	const allSource = files.map((file) => file.content).join("\n");
	if (/window\.location\.reload\s*\(/.test(allSource))
		findings.push({
			metric: "artifact-relevance",
			pass: false,
			level: "error",
			message: "window.location.reload() was used for internal navigation.",
			fix: "Use the application's client-side router/navigation primitive.",
			source: "routing",
		});

	const continuity = planRecord(contract?.shellContinuity ?? plan?.shellContinuity);
	const boundaryDeclared = Boolean(
		continuity?.moduleBoundary ??
		continuity?.layoutFile ??
		continuity?.sharedLayout ??
		contract?.moduleBoundaries ??
		(declaredShell?.persistentAcrossRoutes === true && declaredShell.id),
	);
	const continuityPass = shellRoutes <= 1 || boundaryDeclared;
	if (!continuityPass)
		findings.push({
			metric: "shell-continuity",
			pass: false,
			level: "error",
			message: "Multiple shell routes are declared without a shared shell/module-boundary declaration.",
			fix: "Declare the shared shell layout module so navigation preserves shell continuity.",
			source: "artifact-contract",
		});

	const relevanceFailures = findings.filter((finding) => finding.metric === "artifact-relevance").length;
	return {
		active: true,
		findings,
		scores: {
			shellPairing: ratio(pairedShells, shellRoutes),
			shellContinuity: continuityPass ? 1 : 0,
			shellFidelity: ratio(shellFidelityPasses, shellFidelityChecks),
			routeCoverage: ratio(coveredRoutes, routes.length),
			ownedRegionAdoption: ratio(adoptedRegions, regions),
			artifactRelevance:
				relevanceFailures === 0
					? ratio(adoptedArtifacts, relevantArtifacts)
					: Math.max(0, ratio(adoptedArtifacts, relevantArtifacts) - 0.5),
		},
		routeInventory,
	};
}
