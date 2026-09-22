import type {ArtifactOwnership, NormalizedRecord, RegionRecord, Tier, WidgetPlacement} from "../model/record";
import type {ImplementationGoal} from "./implementation-goal";

export const ARTIFACT_CONTRACT_VERSION = "core-artifact-contract/1";
export const ARTIFACT_CONTRACT_VERSION_V2 = "core-artifact-contract/2";

export interface ArtifactRequirement {
	id: string;
	name: string;
	tier: Tier;
	reason: string;
	region?: string;
	ownership?: ArtifactOwnership;
}

export interface TemplateRegionExpectation {
	id: string;
	role?: string;
	required: boolean;
	recommendedArtifacts: string[];
	note?: string;
}

export interface ArtifactContract {
	contractVersion: typeof ARTIFACT_CONTRACT_VERSION;
	required: ArtifactRequirement[];
	recommended: ArtifactRequirement[];
	allowedPrimitives: string[];
	manualRecreationForbidden: string[];
	requiredTemplateRegions: string[];
	templateStructuralExpectations: {
		referenceTemplateId?: string;
		preserveOwnedLayout: boolean;
		regions: TemplateRegionExpectation[];
	};
}

interface ContractInput {
	goal: ImplementationGoal;
	strategy: "direct-template" | "adapt-template" | "compose";
	template?: NormalizedRecord;
	pairedArtifacts: NormalizedRecord[];
	compositionCandidates: NormalizedRecord[];
	resolveByName(name: string): NormalizedRecord | undefined;
}

function requirement(record: NormalizedRecord, reason: string, region?: string): ArtifactRequirement {
	return {id: record.id, name: record.name, tier: record.tier, reason, region, ownership: record.ownership};
}

function placementRequirement(
	placement: WidgetPlacement,
	resolveByName: ContractInput["resolveByName"],
	reason: string,
): ArtifactRequirement | undefined {
	const record = resolveByName(placement.name);
	return record ? requirement(record, reason, placement.region) : undefined;
}

function uniqueRequirements(values: Array<ArtifactRequirement | undefined>): ArtifactRequirement[] {
	const seen = new Set<string>();
	return values.filter((value): value is ArtifactRequirement => {
		if (!value || seen.has(value.id)) return false;
		seen.add(value.id);
		return true;
	});
}

function regionExpectation(region: RegionRecord): TemplateRegionExpectation {
	return {
		id: region.id,
		role: region.role,
		required: region.required,
		recommendedArtifacts: region.recommended,
		note: region.note,
	};
}

export function createArtifactContract(input: ContractInput): ArtifactContract {
	const template = input.template;
	const placements = template?.widgets ?? [];
	const requiredPlacements = placements.filter((placement) => placement.required);
	const recommendedPlacements = placements.filter((placement) => !placement.required);
	const required: Array<ArtifactRequirement | undefined> = [];
	const recommended: Array<ArtifactRequirement | undefined> = [];

	if (template) {
		const templateRequirement = requirement(
			template,
			input.strategy === "direct-template"
				? "Render the selected authoritative Core template."
				: "Use this catalog template as the structural and interaction reference.",
		);
		if (input.strategy === "direct-template") required.push(templateRequirement);
		else recommended.push(templateRequirement);
	}

	for (const placement of requiredPlacements)
		(input.strategy === "direct-template" ? recommended : required).push(
			placementRequirement(
				placement,
				input.resolveByName,
				`Required by the ${template?.name ?? "selected"} template${placement.region ? ` in region ${placement.region}` : ""}.`,
			),
		);
	for (const placement of recommendedPlacements)
		recommended.push(
			placementRequirement(
				placement,
				input.resolveByName,
				`Recommended by the ${template?.name ?? "selected"} template${placement.region ? ` for region ${placement.region}` : ""}.`,
			),
		);
	for (const record of input.pairedArtifacts)
		recommended.push(requirement(record, `Catalog pairing declared by ${template?.name ?? "the selected artifact"}.`));

	const candidates = input.compositionCandidates;
	const requiredCandidateCount =
		input.goal === "core-showcase"
			? Math.min(3, candidates.length)
			: input.goal === "component-evaluation"
				? Math.min(2, candidates.length)
				: input.strategy === "compose"
					? Math.min(1, candidates.length)
					: 0;
	for (const [index, record] of candidates.entries()) {
		const value = requirement(record, `Catalog match for the ${input.goal} intent.`);
		if (index < requiredCandidateCount) required.push(value);
		else recommended.push(value);
	}

	const finalRequired = uniqueRequirements(required);
	const requiredIds = new Set(finalRequired.map((item) => item.id));
	const finalRecommended = uniqueRequirements(recommended).filter((item) => !requiredIds.has(item.id));
	const adoptedRecords = uniqueRequirements([...finalRequired, ...finalRecommended]);
	const allowedPrimitives = adoptedRecords
		.filter((item) => item.tier === "component" || item.tier === "pattern" || item.tier === "utility")
		.map((item) => item.id);
	const manualRecreationForbidden = uniqueRequirements([
		...(template ? [requirement(template, "Catalog template exists.")] : []),
		...placements.map((placement) => placementRequirement(placement, input.resolveByName, "Catalog artifact exists.")),
		...input.pairedArtifacts.map((record) => requirement(record, "Catalog artifact exists.")),
		...candidates.map((record) => requirement(record, "Catalog artifact exists.")),
	]).map((item) => item.name);
	const regions = (template?.regions ?? []).map(regionExpectation);

	return {
		contractVersion: ARTIFACT_CONTRACT_VERSION,
		required: finalRequired,
		recommended: finalRecommended,
		allowedPrimitives: [...new Set(allowedPrimitives)],
		manualRecreationForbidden: [...new Set(manualRecreationForbidden)],
		requiredTemplateRegions: regions.filter((region) => region.required).map((region) => region.id),
		templateStructuralExpectations: {
			referenceTemplateId: template?.id,
			preserveOwnedLayout: input.strategy === "direct-template",
			regions,
		},
	};
}

function canonicalize(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
	if (value && typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
			.filter(([, item]) => item !== undefined)
			.sort(([left], [right]) => left.localeCompare(right));
		return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`).join(",")}}`;
	}
	return JSON.stringify(value);
}

/** Stable, runtime-independent FNV-1a digest suitable for contract identity (not authentication). */
export function artifactContractPlanId(value: unknown): string {
	const source = canonicalize(value);
	let hash = 0x811c9dc5;
	for (let index = 0; index < source.length; index += 1) {
		hash ^= source.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}
	return `plan_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
