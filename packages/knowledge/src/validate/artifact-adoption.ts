import type {CapabilityContext} from "../capabilities/context";
import {artifactContractPlanId} from "../compliance/artifact-contract";
import type {NormalizedRecord, Tier} from "../model/record";
import type {ValidateInput} from "../schemas/inputs";
import {analyzeRouteAdoption} from "./route-adoption";

export interface AdoptionFinding {
	metric: string;
	pass: boolean;
	level: "error" | "info";
	message: string;
	fix?: string;
	source: string;
}

export interface AdoptionResult {
	findings: AdoptionFinding[];
	tierCoverage: Record<Tier, number> & {primitive: number};
	artifactInventory: {
		imported: string[];
		rendered: string[];
		required: string[];
		missingRequired: string[];
		routes: ReturnType<typeof analyzeRouteAdoption>["routeInventory"];
	};
	scores: {
		artifactSelection: number;
		widgetCoverage: number;
		templateAdoption: number;
		manualRecreationAvoidance: number;
		shellPairing: number;
		shellContinuity: number;
		shellFidelity: number;
		routeCoverage: number;
		ownedRegionAdoption: number;
		artifactRelevance: number;
	};
}

const strictModes = new Set(["wakecore-product", "wakecore-showcase", "wakecore-template-strict"]);

function sourceText(input: ValidateInput): string {
	return input.files?.map((file) => file.content).join("\n") ?? input.code ?? "";
}

function namesFor(record: NormalizedRecord): string[] {
	return [...new Set([record.name, record.source.export].filter((value): value is string => Boolean(value)))];
}

function isImported(code: string, record: NormalizedRecord): boolean {
	if (record.source.import && code.includes(record.source.import)) return true;
	return namesFor(record).some((name) =>
		new RegExp(`import\\s*(?:\\{[^}]*\\b${escapeRegExp(name)}\\b[^}]*\\}|${escapeRegExp(name)}\\b)`).test(code),
	);
}

function isRendered(code: string, record: NormalizedRecord): boolean {
	return namesFor(record).some((name) => new RegExp(`<${escapeRegExp(name)}(?=[\\s/>])`).test(code));
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function artifactRecord(ctx: CapabilityContext, idOrName: string): NormalizedRecord | undefined {
	return ctx.store.getById(idOrName) ?? ctx.store.getByName(idOrName) ?? undefined;
}

function detectsManualRecreation(code: string, pattern: string): boolean {
	const key = pattern.toLowerCase();
	if (key.includes("sidebar")) {
		const parts = ["SidebarHeader", "SidebarContent", "SidebarMenu", "SidebarFooter"].filter((name) =>
			new RegExp(`<${name}(?=[\\s/>])`).test(code),
		);
		return parts.length >= 3;
	}
	if (key.includes("chart")) return /<CardHeader(?=[\s/>])/.test(code) && /<ChartContainer(?=[\s/>])/.test(code);
	if (key.includes("checklist") || key.includes("onboarding"))
		return /\.map\s*\([^)]*=>[\s\S]{0,300}<Card(?=[\s/>])/.test(code) && /complete|progress|step/i.test(code);
	if (key.includes("filter")) return /<(?:Input|Select)(?=[\s/>])/.test(code) && /filter|search/i.test(code);
	if (key.includes("data-section") || key.includes("table"))
		return /<Card(?=[\s/>])/.test(code) && /<Table(?=[\s/>])/.test(code) && /<CardHeader(?=[\s/>])/.test(code);
	return false;
}

function clampRatio(numerator: number, denominator: number): number {
	return denominator === 0 ? 1 : Math.round((numerator / denominator) * 100) / 100;
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
	return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

interface ParsedSubstitution {
	region: string;
	replacement: string;
	reason?: string;
	catalogGap: boolean;
	catalogGapId?: string;
	gapReason?: string;
	applicationComponent?: string;
	reviewStatus?: string;
}

function parseSubstitution(value: unknown): ParsedSubstitution | undefined {
	const entry = objectValue(value);
	if (!entry) return undefined;
	const replacementValue = entry.replacement;
	const replacement = objectValue(replacementValue);
	const gapValue = entry.catalogGapId ?? entry.catalogGap ?? replacement?.catalogGap;
	const gap = objectValue(gapValue);
	const region = entry.templateRegion ?? entry.regionId ?? entry.region;
	const replacementName =
		typeof entry.replacementArtifactId === "string"
			? entry.replacementArtifactId
			: typeof entry.catalogGapId === "string"
				? entry.catalogGapId
				: typeof replacementValue === "string"
					? replacementValue
					: (replacement?.id ?? replacement?.artifactId ?? replacement?.name ?? entry.applicationComponent);
	if (typeof region !== "string" || typeof replacementName !== "string") return undefined;
	return {
		region,
		replacement: replacementName,
		reason: typeof entry.reason === "string" ? entry.reason : undefined,
		catalogGap:
			typeof entry.catalogGapId === "string" ||
			gapValue === true ||
			Boolean(gap) ||
			entry.kind === "catalog-gap" ||
			replacement?.kind === "catalog-gap",
		catalogGapId: typeof entry.catalogGapId === "string" ? entry.catalogGapId : undefined,
		gapReason:
			typeof gapValue === "string"
				? gapValue
				: typeof gap?.reason === "string"
					? gap.reason
					: typeof entry.gapReason === "string"
						? entry.gapReason
						: undefined,
		applicationComponent:
			typeof entry.applicationComponent === "string"
				? entry.applicationComponent
				: typeof gap?.applicationComponent === "string"
					? gap.applicationComponent
					: undefined,
		reviewStatus: typeof entry.reviewStatus === "string" ? entry.reviewStatus : undefined,
	};
}

function structuredSubstitutionCovers(
	planValue: unknown,
	originalArtifactId: string,
	renderedIds: Set<string>,
	ctx: CapabilityContext,
): boolean {
	const plan = objectValue(planValue);
	const contract = objectValue(plan?.artifactContract);
	const routes = Array.isArray(contract?.routes) ? contract.routes : [];
	const substitutions = Array.isArray(plan?.substitutions) ? plan.substitutions : [];
	return substitutions.some((value) => {
		const substitution = objectValue(value);
		if (
			!substitution ||
			substitution.reviewStatus !== "approved" ||
			substitution.originalArtifactId !== originalArtifactId ||
			typeof substitution.route !== "string" ||
			typeof substitution.templateRegion !== "string" ||
			typeof substitution.reason !== "string" ||
			!substitution.reason.trim()
		)
			return false;
		const route = routes
			.map(objectValue)
			.find((candidate) => candidate?.id === substitution.route || candidate?.path === substitution.route);
		const regions = Array.isArray(route?.regions) ? route.regions : [];
		const region = regions.map(objectValue).find((candidate) => candidate?.id === substitution.templateRegion);
		if (!region) return false;
		if (typeof substitution.catalogGapId === "string") return substitution.catalogGapId === region.catalogGapId;
		if (typeof substitution.replacementArtifactId !== "string") return false;
		const replacement = artifactRecord(ctx, substitution.replacementArtifactId);
		if (!replacement || !renderedIds.has(replacement.id)) return false;
		const relevantIds = [region.requiredArtifacts, region.acceptableArtifacts]
			.filter(Array.isArray)
			.flatMap((items) => items as unknown[])
			.map(objectValue)
			.flatMap((item) => (typeof item?.id === "string" ? [item.id] : []));
		return relevantIds.includes(replacement.id);
	});
}

export function validateArtifactAdoption(input: ValidateInput, ctx: CapabilityContext): AdoptionResult {
	const code = sourceText(input);
	const records = ctx.store.all();
	const importedRecords = records.filter((record) => isImported(code, record));
	const renderedRecords = records.filter((record) => isRendered(code, record));
	const renderedIds = new Set(renderedRecords.map((record) => record.id));
	const plan = input.implementationPlan;
	const required = plan?.artifactContract.required ?? [];
	const recommended = (plan?.artifactContract.recommended ?? []).map((entry) =>
		typeof entry === "string" ? entry : entry.id,
	);
	const requiredRecords = required
		.map((entry) => artifactRecord(ctx, entry.id))
		.filter((record): record is NormalizedRecord => Boolean(record));
	const missingRequired = requiredRecords.filter(
		(record) => !renderedIds.has(record.id) && !structuredSubstitutionCovers(plan, record.id, renderedIds, ctx),
	);
	const findings: AdoptionFinding[] = [];
	const routeAdoption = analyzeRouteAdoption(input);
	findings.push(...routeAdoption.findings);
	if (plan?.planId && plan.intent && plan.contractVersion && plan.goal) {
		const actualPlanId = artifactContractPlanId({
			contractVersion: plan.contractVersion,
			goal: plan.goal,
			implementationMode: plan.implementationMode,
			templateId: plan.templateId,
			intent: plan.intent,
			artifactContract: plan.artifactContract,
		});
		if (actualPlanId !== plan.planId)
			findings.push({
				metric: "artifact-contract-integrity",
				pass: false,
				level: "error",
				message: "The implementation plan or artifact contract changed after planning.",
				fix: "Pass the unchanged create_implementation_plan output, or create a new plan for the changed intent.",
				source: "implementation-plan",
			});
	}

	if (strictModes.has(input.mode) && !plan) {
		findings.push({
			metric: "artifact-contract",
			pass: false,
			level: "error",
			message: `${input.mode} requires the implementation plan and artifact contract produced before coding.`,
			fix: "Pass the unchanged create_implementation_plan result as implementationPlan.",
			source: "implementation-plan",
		});
	}

	for (const entry of required) {
		const record = artifactRecord(ctx, entry.id);
		if (!record) {
			findings.push({
				metric: "artifact-contract",
				pass: false,
				level: "error",
				message: `Required artifact ${entry.id} is not present in the WakeCore catalog.`,
				fix: "Regenerate the implementation plan against the current catalog.",
				source: "artifact-contract",
			});
			continue;
		}
		const substituted = structuredSubstitutionCovers(plan, record.id, renderedIds, ctx);
		const pass = renderedIds.has(record.id) || substituted;
		findings.push({
			metric: "artifact-selection",
			pass,
			level: pass ? "info" : "error",
			message: pass
				? substituted
					? `Required ${record.tier} ${record.name} has an approved route-scoped substitution.`
					: `Required ${record.tier} ${record.name} is rendered.`
				: `Required ${record.tier} ${record.name} was not rendered.`,
			fix: pass ? undefined : (record.minimalExample ?? `Import and render ${record.name}.`),
			source: record.manifestPath ?? record.id,
		});
	}

	let templateAdopted = true;
	if (plan?.implementationMode === "adapt-template") {
		const templateId = plan.referenceTemplate ?? plan.templateId;
		const template = templateId ? artifactRecord(ctx, templateId) : undefined;
		const templateRendered = Boolean(template && renderedIds.has(template.id));
		const structuralNames = [
			...(template?.widgets ?? []).map((placement) => placement.name),
			...(template?.pairsWith ?? []),
			...required.filter((entry) => Boolean(entry.region)).map((entry) => entry.id),
		];
		const structural = structuralNames
			.map((name) => artifactRecord(ctx, name))
			.filter((record): record is NormalizedRecord => Boolean(record));
		const structuralRendered = structural.filter((record) => renderedIds.has(record.id)).length;
		const requiredRegions = plan.artifactContract.requiredTemplateRegions ?? [];
		const declaredRegions = new Set([
			...requiredRegions,
			...(plan.artifactContract.templateStructuralExpectations?.regions ?? []).map((region) => region.id),
		]);
		const validSubstitutedRegions = new Set<string>();
		const seenSubstitutedRegions = new Set<string>();
		const rawSubstitutions = (plan.substitutions ?? []) as unknown[];
		for (const rawSubstitution of rawSubstitutions) {
			const substitution = parseSubstitution(rawSubstitution);
			if (!substitution) {
				findings.push({
					metric: "template-substitution",
					pass: false,
					level: "error",
					message: "A template substitution is missing its region or structured replacement.",
					fix: "Provide templateRegion/regionId, replacement, and a reason.",
					source: "adapt-template",
				});
				continue;
			}
			if (seenSubstitutedRegions.has(substitution.region)) {
				findings.push({
					metric: "template-substitution",
					pass: false,
					level: "error",
					message: `Region ${substitution.region} has more than one substitution declaration.`,
					fix: "Provide one authoritative structured substitution per owned region.",
					source: "adapt-template",
				});
				continue;
			}
			seenSubstitutedRegions.add(substitution.region);
			const regionKnown = declaredRegions.size === 0 || declaredRegions.has(substitution.region);
			const replacement = artifactRecord(ctx, substitution.replacement);
			const applicationName = substitution.applicationComponent ?? substitution.replacement;
			const replacementRendered = replacement
				? renderedIds.has(replacement.id)
				: new RegExp(`<${escapeRegExp(applicationName)}(?=[\\s/>])`).test(code);
			const gapDocumented = Boolean(
				substitution.catalogGap &&
				(substitution.gapReason || substitution.reason) &&
				(substitution.catalogGapId || substitution.applicationComponent),
			);
			const reasonDocumented = Boolean(substitution.reason?.trim());
			const reviewed = !substitution.reviewStatus || substitution.reviewStatus === "approved";
			const valid =
				regionKnown && reasonDocumented && reviewed && ((Boolean(replacement) && replacementRendered) || gapDocumented);
			if (valid) validSubstitutedRegions.add(substitution.region);
			findings.push({
				metric: "template-substitution",
				pass: valid,
				level: valid ? "info" : "error",
				message: valid
					? substitution.catalogGap
						? `Approved catalog gap ${substitution.catalogGapId ?? substitution.replacement} is documented for region ${substitution.region}.`
						: `Documented replacement ${substitution.replacement} is valid and rendered for region ${substitution.region}.`
					: !regionKnown
						? `Substitution targets undeclared region ${substitution.region}.`
						: !reviewed
							? `Substitution for ${substitution.region} is not approved.`
							: !reasonDocumented
								? `Substitution for ${substitution.region} has no rationale.`
								: !replacement && !gapDocumented
									? `Replacement ${substitution.replacement} is not a catalog artifact and lacks a structured catalog-gap declaration.`
									: `Documented replacement ${applicationName} is not rendered for region ${substitution.region}.`,
				fix: valid
					? undefined
					: "Use and render a catalog artifact, or declare the region's catalog gap with an approved rationale.",
				source: replacement?.manifestPath ?? "adapt-template",
			});
		}
		const substitutionsCoverRegions =
			requiredRegions.length > 0 && requiredRegions.every((id) => validSubstitutedRegions.has(id));
		templateAdopted = templateRendered || structuralRendered > 0 || substitutionsCoverRegions;
		findings.push({
			metric: "template-adoption",
			pass: templateAdopted,
			level: templateAdopted ? "info" : "error",
			message: templateAdopted
				? "The reference template is represented by rendered structure or documented substitutions."
				: "The selected template was only a conceptual reference; no template-owned structure or documented substitutions were detected.",
			fix: templateAdopted
				? undefined
				: "Render the template, use its paired shell/widgets, or document region substitutions in the implementation plan.",
			source: template?.manifestPath ?? "adapt-template",
		});
	}

	let recreationFailures = 0;
	for (const pattern of plan?.artifactContract.manualRecreationForbidden ?? []) {
		const expected = records.find((record) => {
			const normalized = `${record.id} ${record.name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
			return normalized.includes(pattern.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
		});
		if (expected && renderedIds.has(expected.id)) continue;
		if (!detectsManualRecreation(code, pattern)) continue;
		recreationFailures += 1;
		findings.push({
			metric: "manual-recreation-avoidance",
			pass: false,
			level: "error",
			message: `${pattern} appears to have been manually composed from lower-level primitives.`,
			fix: expected
				? `Use ${expected.name} unless the plan records an approved substitution.`
				: "Record an approved substitution.",
			source: expected?.manifestPath ?? "artifact-contract",
		});
	}

	if (input.mode === "wakecore-showcase" && !/export\s+const\s+wakecoreInventory\b/.test(code)) {
		findings.push({
			metric: "showcase-inventory",
			pass: false,
			level: "error",
			message: "WakeCore showcase implementations must export a machine-readable wakecoreInventory.",
			fix: "Export wakecoreInventory with templates, widgets, components, and tokens used by the implementation.",
			source: "wakecore-showcase",
		});
	}
	if (input.mode === "wakecore-showcase" && plan) {
		const applicable = [...required.map((entry) => entry.id), ...recommended]
			.map((id) => artifactRecord(ctx, id))
			.filter((record): record is NormalizedRecord => Boolean(record));
		const applicableWidgetsForShowcase = applicable.filter((record) => record.tier === "widget");
		const widgetTarget = Math.min(3, applicableWidgetsForShowcase.length);
		const renderedWidgetCount = applicableWidgetsForShowcase.filter((record) => renderedIds.has(record.id)).length;
		if (renderedWidgetCount < widgetTarget)
			findings.push({
				metric: "showcase-widget-coverage",
				pass: false,
				level: "error",
				message: `Only ${renderedWidgetCount} of ${widgetTarget} relevant showcase widgets are visibly represented.`,
				fix: "Render the relevant widgets selected by the implementation plan; do not add irrelevant widgets for counting.",
				source: "artifact-contract",
			});
		const applicableUtilities = applicable.filter((record) => record.tier === "utility");
		if (applicableUtilities.length > 0 && !applicableUtilities.some((record) => renderedIds.has(record.id)))
			findings.push({
				metric: "showcase-utility-coverage",
				pass: false,
				level: "error",
				message: "No applicable WakeCore layout utility is rendered.",
				fix: `Use ${applicableUtilities.map((record) => record.name).join(" or ")}.`,
				source: "artifact-contract",
			});
	}

	const tierCoverage = {
		template: renderedRecords.filter((record) => record.tier === "template").length,
		widget: renderedRecords.filter((record) => record.tier === "widget").length,
		component: renderedRecords.filter((record) => record.tier === "component").length,
		pattern: renderedRecords.filter((record) => record.tier === "pattern").length,
		utility: renderedRecords.filter((record) => record.tier === "utility").length,
		primitive: renderedRecords.filter((record) => record.tier === "component" && !record.composedOf?.length).length,
	};
	const applicableWidgets = requiredRecords.filter((record) => record.tier === "widget");
	const usedApplicableWidgets = applicableWidgets.filter((record) => renderedIds.has(record.id));

	return {
		findings,
		tierCoverage,
		artifactInventory: {
			imported: importedRecords.map((record) => record.name),
			rendered: renderedRecords.map((record) => record.name),
			required: requiredRecords.map((record) => record.name),
			missingRequired: missingRequired.map((record) => record.name),
			routes: routeAdoption.routeInventory,
		},
		scores: {
			artifactSelection: clampRatio(requiredRecords.length - missingRequired.length, requiredRecords.length),
			widgetCoverage: clampRatio(usedApplicableWidgets.length, applicableWidgets.length),
			templateAdoption: templateAdopted ? 1 : 0,
			manualRecreationAvoidance: recreationFailures === 0 ? 1 : 0,
			...routeAdoption.scores,
		},
	};
}
