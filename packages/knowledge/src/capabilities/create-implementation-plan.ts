// create_implementation_plan — turns a template match or UI intent into an executable contract.
// Exact matches bind to their authoritative import; all other requests receive a deterministic
// Core adaptation/composition ladder instead of a clarification gate.

import {createApplicationContract, type ApplicationContract} from "../compliance/application-contract";
import {
	ARTIFACT_CONTRACT_VERSION,
	ARTIFACT_CONTRACT_VERSION_V2,
	artifactContractPlanId,
	createArtifactContract,
	type ArtifactContract,
} from "../compliance/artifact-contract";
import {inferImplementationGoal, type ImplementationGoal} from "../compliance/implementation-goal";
import type {NormalizedRecord} from "../model/record";
import type {CapabilityResult} from "../schemas/envelope";
import type {CreateImplementationPlanInput} from "../schemas/inputs";
import {CapabilityError, type CapabilityFn} from "./context";

type ImplementationStrategy = "direct-template" | "adapt-template" | "compose";

export interface ImplementationPlanData {
	planId: string;
	contractVersion: typeof ARTIFACT_CONTRACT_VERSION | typeof ARTIFACT_CONTRACT_VERSION_V2;
	intent: string;
	goal: ImplementationGoal;
	templateId?: string;
	templateName?: string;
	implementationMode: ImplementationStrategy;
	referenceAnalysis?: CreateImplementationPlanInput["referenceAnalysis"];
	requiredImport?: {path: string; export?: string};
	minimalExample?: string;
	workspaceRequirements: {
		framework: "React";
		sourceLanguage: "TSX";
		package: "@core/core-ui";
		onMissingDependency: "setup-and-continue";
		runtimeAudit: {
			required: boolean;
			producer: "core-runtime-audit/4";
			command: "pnpm audit:runtime -- --url <app-url> --plan <plan.json> --out <evidence.json>";
			packageScript: "node scripts/core-runtime-audit.mjs";
			requiredDevDependencies: ["playwright"];
			requiredDataAttributes: string[];
		};
	};
	requiredProviders: string[];
	pairedArtifacts: Array<{
		id?: string;
		name: string;
		tier?: string;
		import?: string;
		export?: string;
		minimalExample?: string;
	}>;
	compositionCandidates: Array<{
		id: string;
		name: string;
		tier: string;
		import?: string;
		export?: string;
		minimalExample?: string;
	}>;
	artifactContract: ArtifactContract | ApplicationContract;
	fallbackOrder: Array<"adapt-template" | "compose-widgets" | "compose-components" | "create-with-core">;
	forbiddenApproaches: string[];
	completionGate: {
		tool: "validate";
		arguments: {
			mode: "core-product" | "core-showcase" | "core-template-strict";
			template?: string;
			requireFiles: true;
			requireImplementationPlan: true;
			requireRuntimeAudit: boolean;
			requireReferenceAnalysis: boolean;
		};
		require: "compliant=true";
	};
}

export const createImplementationPlan: CapabilityFn<CreateImplementationPlanInput, ImplementationPlanData> = (
	input,
	ctx,
): CapabilityResult<ImplementationPlanData> => {
	const template = input.template
		? (ctx.store.getById(input.template) ?? ctx.store.getByName(input.template))
		: undefined;
	if (input.template && (!template || template.tier !== "template")) {
		if (!input.intent)
			throw new CapabilityError("template.not_found", `No template "${input.template}" in the index.`, {
				target: input.template,
			});
	}
	const usableTemplate = template?.tier === "template" ? template : undefined;
	const strategy: ImplementationStrategy =
		input.strategy ?? (usableTemplate?.source.import ? "direct-template" : "compose");
	if (strategy === "direct-template" && !usableTemplate?.source.import)
		throw new CapabilityError(
			"template.import_unavailable",
			"direct-template strategy requires a selected template with an authoritative import.",
		);

	const pairedArtifacts = (usableTemplate?.pairsWith ?? []).map((name) => {
		const record = ctx.store.getByName(name);
		return {
			id: record?.id,
			name,
			tier: record?.tier,
			import: record?.source.import,
			export: record?.source.export,
			minimalExample: record?.minimalExample,
		};
	});
	const intent = input.intent ?? usableTemplate?.intent ?? usableTemplate?.name ?? "Core application interface";
	const goal = input.goal ?? inferImplementationGoal(intent);
	if (goal === "visual-reproduction" && !input.referenceAnalysis)
		throw new CapabilityError(
			"reference_analysis.required",
			"Visual reproduction requires a structured reference analysis before template selection and planning.",
		);
	const compositionHits =
		strategy === "direct-template"
			? []
			: ctx.store.searchProvider().search({query: intent, tiers: ["widget", "component", "pattern"], limit: 12});
	const compositionCandidates = compositionHits.map(({record}) => ({
		id: record.id,
		name: record.name,
		tier: record.tier,
		import: record.source.import,
		export: record.source.export,
		minimalExample: record.minimalExample,
	}));
	const related = (usableTemplate?.pairsWith ?? [])
		.map((name) => ctx.store.getByName(name))
		.filter((record): record is NormalizedRecord => Boolean(record));
	const sources = [
		...(usableTemplate ? [usableTemplate] : []),
		...related,
		...compositionHits.map((hit) => hit.record),
	];
	const directTemplate = strategy === "direct-template" ? usableTemplate : undefined;
	const compositionRecords = compositionHits.map((hit) => hit.record);
	const baseArtifactContract = createArtifactContract({
		goal,
		strategy,
		template: usableTemplate,
		pairedArtifacts: related,
		compositionCandidates: compositionRecords,
		resolveByName: (name) => ctx.store.getByName(name) ?? undefined,
	});
	let artifactContract: ArtifactContract | ApplicationContract = baseArtifactContract;
	if (input.routes?.length) {
		try {
			artifactContract = createApplicationContract({
				base: baseArtifactContract,
				shell: input.shell,
				routes: input.routes,
				resolve: (ref) => ctx.store.getById(ref) ?? ctx.store.getByName(ref) ?? undefined,
			});
		} catch (error) {
			throw new CapabilityError(
				"application_contract.invalid_catalog_reference",
				error instanceof Error ? error.message : "The application contract references an unknown artifact.",
			);
		}
	}
	const contractVersion = artifactContract.contractVersion;
	const planIdentity = {
		contractVersion,
		goal,
		implementationMode: strategy,
		templateId: usableTemplate?.id,
		intent,
		referenceAnalysis: input.referenceAnalysis,
		artifactContract,
	};
	const planId = artifactContractPlanId(planIdentity);
	const validationMode =
		strategy === "direct-template"
			? "core-template-strict"
			: goal === "core-showcase" || goal === "component-evaluation"
				? "core-showcase"
				: "core-product";
	const runtimeAuditRequired =
		contractVersion === ARTIFACT_CONTRACT_VERSION_V2 &&
		(validationMode === "core-product" || validationMode === "core-showcase" || goal === "visual-reproduction");

	return {
		data: {
			planId,
			contractVersion,
			intent,
			goal,
			templateId: usableTemplate?.id,
			templateName: usableTemplate?.name,
			implementationMode: strategy,
			referenceAnalysis: input.referenceAnalysis,
			requiredImport: directTemplate?.source.import
				? {path: directTemplate.source.import, export: directTemplate.source.export}
				: undefined,
			minimalExample: directTemplate?.minimalExample,
			workspaceRequirements: {
				framework: "React",
				sourceLanguage: "TSX",
				package: "@core/core-ui",
				onMissingDependency: "setup-and-continue",
				runtimeAudit: {
					required: runtimeAuditRequired,
					producer: "core-runtime-audit/4",
					command: "pnpm audit:runtime -- --url <app-url> --plan <plan.json> --out <evidence.json>",
					packageScript: "node scripts/core-runtime-audit.mjs",
					requiredDevDependencies: ["playwright"],
					requiredDataAttributes: [
						"data-core-shell",
						"data-core-artifact",
						"data-core-density",
						"data-core-brand",
						"data-core-navigation-fingerprint",
						"data-core-provider-owner",
						"data-core-content-scroll",
						"data-core-surface-owner",
						"data-core-affordance-purpose",
						"data-core-canvas-capabilities",
						"data-core-region",
						"data-core-interaction",
						"data-core-route-link",
						"data-core-responsive-group",
						"data-core-responsive-atomic",
					],
				},
			},
			requiredProviders: usableTemplate?.requiredProviders ?? [],
			pairedArtifacts,
			compositionCandidates,
			artifactContract,
			fallbackOrder: ["adapt-template", "compose-widgets", "compose-components", "create-with-core"],
			forbiddenApproaches: [
				"Do not replace Core with standalone HTML, CSS, SVG, canvas, or another UI library.",
				"Do not wrap surface-owning artifacts in duplicate backgrounds, borders, height, or padding.",
				"Do not use gap utilities on elements that are not flex or grid containers.",
				"Use an exact template import only in direct-template mode; otherwise adapt or compose with Core artifacts and design tokens.",
				"Do not ask for confirmation solely because template confidence is low or no template matched.",
				"Do not reproduce screenshot HTML, CSS, colors, geometry, or invalid navigation before assigning Core region owners.",
				"Do not repaint DataTable, chart, tab, card, or shell-owned surfaces through application descendant selectors.",
				"Do not render duplicate composers or decorative canvas controls without functional viewport behavior.",
				"Prepare missing React, TSX, and @core/core-ui prerequisites before implementation; report only setup failures that cannot be recovered safely.",
			],
			completionGate: {
				tool: "validate",
				arguments: {
					mode: validationMode,
					...(directTemplate ? {template: directTemplate.id} : {}),
					requireFiles: true,
					requireImplementationPlan: true,
					requireRuntimeAudit: runtimeAuditRequired,
					requireReferenceAnalysis: goal === "visual-reproduction",
				},
				require: "compliant=true",
			},
		},
		sources,
	};
};
