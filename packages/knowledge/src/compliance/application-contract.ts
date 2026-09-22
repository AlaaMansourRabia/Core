import type {NormalizedRecord} from "../model/record";
import {ARTIFACT_CONTRACT_VERSION_V2, type ArtifactContract, type ArtifactRequirement} from "./artifact-contract";

export interface ShellContractInput {
	id?: string;
	persistentAcrossRoutes?: boolean;
	sidebar?: string;
	topBar?: string;
	density?: "compact" | "comfortable";
	brandKey?: string;
	navigationFingerprint?: string;
	footerFingerprint?: string;
	providerOwner?: string;
	allowedRouteMutations?: string[];
	layoutOwnership?: Partial<ShellLayoutOwnership>;
	moduleBoundaries?: ModuleBoundaryContractInput[];
	additionalArtifacts?: string[];
}

export interface ShellLayoutOwnership {
	viewportOwner: "application-shell";
	scrollOwner: "route-content";
	contiguous: boolean;
	sidebarStationary: boolean;
	requiredShellHeight: "100dvh";
	requiredShellOverflow: "hidden";
	requiredContentMinHeight: "0";
	requiredContentOverflow: "auto";
}

export interface ModuleBoundaryContractInput {
	id: string;
	routes: string[];
	shellId: string;
	sidebar?: string;
	topBar?: string;
	density: "compact" | "comfortable";
	brandKey: string;
	navigationFingerprint: string;
	footerFingerprint?: string;
	providerOwner: string;
	entryBehavior: string;
	exitBehavior: string;
	reason: string;
}

export interface RouteRegionContractInput {
	id: string;
	role: string;
	required?: boolean;
	requiredArtifacts?: string[];
	acceptableArtifacts?: string[];
	fallbackOrder?: string[];
	catalogGapId?: string;
	interactions?: string[];
	ownerArtifact?: string;
	supportedVariant?: string;
	surfaceOwner?: "artifact" | "route" | "shell";
	scrollOwner?: boolean;
	interactionOwner?: string;
	messageHistoryOwner?: string;
	messageComposerOwner?: string;
	navigationRelationship?: {type: "peer" | "parent" | "drill-in-origin" | "history" | "none"; destination?: string};
	requiredCapabilities?: string[];
	referencePreserved?: string[];
	referenceReplaced?: string[];
}

export interface RouteContractInput {
	id: string;
	path?: string;
	intent?: string;
	template?: string;
	files?: string[];
	moduleBoundaryId?: string;
	regions: RouteRegionContractInput[];
}

export interface ModuleBoundaryContract extends Omit<ModuleBoundaryContractInput, "sidebar" | "topBar"> {
	sidebar?: ArtifactRequirement;
	topBar?: ArtifactRequirement;
}

export interface ShellContract {
	id: string;
	persistentAcrossRoutes: boolean;
	sidebar?: ArtifactRequirement;
	topBar?: ArtifactRequirement;
	density: "compact" | "comfortable";
	brandKey: string;
	navigationFingerprint: string;
	footerFingerprint?: string;
	providerOwner: string;
	allowedRouteMutations: string[];
	layoutOwnership: ShellLayoutOwnership;
	moduleBoundaries: ModuleBoundaryContract[];
	additionalArtifacts: ArtifactRequirement[];
}

export interface RouteRegionContract {
	id: string;
	role: string;
	required: boolean;
	requiredArtifacts: ArtifactRequirement[];
	acceptableArtifacts: ArtifactRequirement[];
	fallbackOrder: string[];
	catalogGapId?: string;
	interactions: string[];
	ownerArtifact?: ArtifactRequirement;
	supportedVariant?: string;
	surfaceOwner?: "artifact" | "route" | "shell";
	scrollOwner?: boolean;
	interactionOwner?: string;
	messageHistoryOwner?: string;
	messageComposerOwner?: string;
	navigationRelationship?: {type: "peer" | "parent" | "drill-in-origin" | "history" | "none"; destination?: string};
	requiredCapabilities: string[];
	referencePreserved: string[];
	referenceReplaced: string[];
}

export interface RouteContract {
	id: string;
	path?: string;
	intent?: string;
	templateId?: string;
	files: string[];
	moduleBoundaryId?: string;
	regions: RouteRegionContract[];
}

/**
 * Contract v2 keeps the aggregate v1 fields so older validators can still apply
 * artifact-level checks while route-aware validators enforce ownership.
 */
export interface ApplicationContract extends Omit<ArtifactContract, "contractVersion"> {
	contractVersion: typeof ARTIFACT_CONTRACT_VERSION_V2;
	shell: ShellContract;
	routes: RouteContract[];
}

interface ApplicationContractInput {
	base: ArtifactContract;
	shell?: ShellContractInput;
	routes: RouteContractInput[];
	resolve(ref: string): NormalizedRecord | undefined;
}

function resolveArtifact(
	ref: string,
	resolve: ApplicationContractInput["resolve"],
	reason: string,
	region?: string,
): ArtifactRequirement {
	const record = resolve(ref);
	if (!record) throw new Error(`Unknown Core catalog artifact "${ref}".`);
	return {id: record.id, name: record.name, tier: record.tier, reason, region};
}

function uniqueRequirements(values: ArtifactRequirement[]): ArtifactRequirement[] {
	const seen = new Set<string>();
	return values.filter((value) => {
		if (seen.has(value.id)) return false;
		seen.add(value.id);
		return true;
	});
}

export function createApplicationContract(input: ApplicationContractInput): ApplicationContract {
	const shellInput = input.shell ?? {};
	const shellId = shellInput.id ?? "core-shared-shell";
	const sidebarRef = shellInput.sidebar ?? (shellInput.topBar ? "CoreAppSidebar" : undefined);
	const topBarRef = shellInput.topBar ?? (shellInput.sidebar ? "CoreAppTopBar" : undefined);
	const sidebar = sidebarRef
		? resolveArtifact(sidebarRef, input.resolve, `Shared shell sidebar for ${shellId}.`, "shell.sidebar")
		: undefined;
	const topBar = topBarRef
		? resolveArtifact(topBarRef, input.resolve, `Shared shell top bar for ${shellId}.`, "shell.top-bar")
		: undefined;
	const moduleBoundaries = (shellInput.moduleBoundaries ?? []).map((boundary): ModuleBoundaryContract => {
		const boundarySidebar = boundary.sidebar ?? (boundary.topBar ? "CoreAppSidebar" : undefined);
		const boundaryTopBar = boundary.topBar ?? (boundary.sidebar ? "CoreAppTopBar" : undefined);
		return {
			...boundary,
			routes: [...new Set(boundary.routes)],
			sidebar: boundarySidebar
				? resolveArtifact(
						boundarySidebar,
						input.resolve,
						`Module boundary sidebar for ${boundary.id}.`,
						`${boundary.id}.sidebar`,
					)
				: undefined,
			topBar: boundaryTopBar
				? resolveArtifact(
						boundaryTopBar,
						input.resolve,
						`Module boundary top bar for ${boundary.id}.`,
						`${boundary.id}.top-bar`,
					)
				: undefined,
		};
	});
	const boundaryIds = new Set(moduleBoundaries.map((boundary) => boundary.id));
	const routeIds = new Set(input.routes.map((route) => route.id));
	for (const boundary of moduleBoundaries)
		for (const route of boundary.routes)
			if (!routeIds.has(route))
				throw new Error(`Module boundary "${boundary.id}" references unknown route "${route}".`);
	const additionalArtifacts = (shellInput.additionalArtifacts ?? []).map((ref) =>
		resolveArtifact(ref, input.resolve, `Shared shell artifact for ${shellId}.`, "shell"),
	);

	const routes = input.routes.map((route): RouteContract => {
		const template = route.template ? input.resolve(route.template) : undefined;
		if (route.template && (!template || template.tier !== "template"))
			throw new Error(`Unknown Core catalog template "${route.template}" for route "${route.id}".`);
		if (route.moduleBoundaryId && !boundaryIds.has(route.moduleBoundaryId))
			throw new Error(`Route "${route.id}" references unknown module boundary "${route.moduleBoundaryId}".`);
		return {
			id: route.id,
			path: route.path,
			intent: route.intent,
			templateId: template?.id,
			files: [...new Set(route.files ?? [])],
			moduleBoundaryId: route.moduleBoundaryId,
			regions: route.regions.map((region): RouteRegionContract => {
				const reason = `Bound to ${route.id}/${region.id} for the ${region.role} role.`;
				const requiredArtifacts = (region.requiredArtifacts ?? []).map((ref) =>
					resolveArtifact(ref, input.resolve, reason, `${route.id}/${region.id}`),
				);
				const acceptableArtifacts = (region.acceptableArtifacts ?? []).map((ref) =>
					resolveArtifact(ref, input.resolve, `Acceptable alternative ${reason}`, `${route.id}/${region.id}`),
				);
				const fallbackOrder = (region.fallbackOrder ?? []).map(
					(ref) => resolveArtifact(ref, input.resolve, `Fallback ${reason}`).id,
				);
				const ownerArtifact = region.ownerArtifact
					? resolveArtifact(
							region.ownerArtifact,
							input.resolve,
							`Owns ${route.id}/${region.id}.`,
							`${route.id}/${region.id}`,
						)
					: requiredArtifacts[0];
				if (
					region.messageHistoryOwner &&
					region.messageComposerOwner &&
					region.messageHistoryOwner !== region.messageComposerOwner
				)
					throw new Error(
						`Region "${route.id}/${region.id}" assigns message history and composition to different owners.`,
					);
				if (region.navigationRelationship?.type === "peer" && region.navigationRelationship.destination)
					throw new Error(
						`Region "${route.id}/${region.id}" cannot declare a back destination for a peer sidebar route.`,
					);
				return {
					id: region.id,
					role: region.role,
					required: region.required ?? true,
					requiredArtifacts,
					acceptableArtifacts,
					fallbackOrder,
					catalogGapId: region.catalogGapId,
					interactions: region.interactions ?? [],
					ownerArtifact,
					supportedVariant: region.supportedVariant,
					surfaceOwner: region.surfaceOwner,
					scrollOwner: region.scrollOwner,
					interactionOwner: region.interactionOwner,
					messageHistoryOwner: region.messageHistoryOwner,
					messageComposerOwner: region.messageComposerOwner,
					navigationRelationship: region.navigationRelationship,
					requiredCapabilities: [...new Set(region.requiredCapabilities ?? [])],
					referencePreserved: [...new Set(region.referencePreserved ?? [])],
					referenceReplaced: [...new Set(region.referenceReplaced ?? [])],
				};
			}),
		};
	});

	const routeRequirements = routes.flatMap((route) =>
		route.regions
			.filter((region) => region.required)
			.flatMap((region) => [...region.requiredArtifacts, ...(region.ownerArtifact ? [region.ownerArtifact] : [])]),
	);
	const routeRecommendations = routes.flatMap((route) => route.regions.flatMap((region) => region.acceptableArtifacts));
	const required = uniqueRequirements([
		...input.base.required,
		...(sidebar ? [sidebar] : []),
		...(topBar ? [topBar] : []),
		...additionalArtifacts,
		...moduleBoundaries
			.flatMap((boundary) => [boundary.sidebar, boundary.topBar])
			.filter((item): item is ArtifactRequirement => Boolean(item)),
		...routeRequirements,
	]);
	const requiredIds = new Set(required.map((item) => item.id));
	const recommended = uniqueRequirements([...input.base.recommended, ...routeRecommendations]).filter(
		(item) => !requiredIds.has(item.id),
	);

	return {
		...input.base,
		contractVersion: ARTIFACT_CONTRACT_VERSION_V2,
		required,
		recommended,
		shell: {
			id: shellId,
			persistentAcrossRoutes: shellInput.persistentAcrossRoutes ?? true,
			sidebar,
			topBar,
			density: shellInput.density ?? "comfortable",
			brandKey: shellInput.brandKey ?? "core",
			navigationFingerprint: shellInput.navigationFingerprint ?? "core-primary-navigation",
			footerFingerprint: shellInput.footerFingerprint,
			providerOwner: shellInput.providerOwner ?? "application-root",
			allowedRouteMutations: [
				...new Set(shellInput.allowedRouteMutations ?? ["activeItemId", "breadcrumbs", "contextActions"]),
			],
			layoutOwnership: {
				viewportOwner: "application-shell",
				scrollOwner: "route-content",
				contiguous: shellInput.layoutOwnership?.contiguous ?? true,
				sidebarStationary: shellInput.layoutOwnership?.sidebarStationary ?? true,
				requiredShellHeight: "100dvh",
				requiredShellOverflow: "hidden",
				requiredContentMinHeight: "0",
				requiredContentOverflow: "auto",
			},
			moduleBoundaries,
			additionalArtifacts,
		},
		routes,
	};
}
