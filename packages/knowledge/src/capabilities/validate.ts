// validate — authoritative, deterministic implementation validation. Basic modes preserve the
// historical snippet checks; product/showcase/template modes additionally bind the result to the
// implementation plan, complete file set, artifact tiers, and application-level token usage.

import type {CapabilityResult, Warning} from "../schemas/envelope";
import type {ValidateInput} from "../schemas/inputs";
import {loadValidators, type GradeResult, type ValidatorFinding} from "../validate/adapter";
import {validateArtifactAdoption, type AdoptionFinding} from "../validate/artifact-adoption";
import {validateRuntimeAudit, type RuntimeAuditFinding} from "../validate/runtime-audit";
import {type CapabilityContext, type CapabilityFn} from "./context";

type ValidationMode = ValidateInput["mode"];
type EffectiveMode = Exclude<ValidationMode, "core-only">;

export interface ValidateFinding {
	metric: string;
	pass: boolean;
	level: "error" | "warning" | "info";
	message?: string;
	fix?: string;
	source?: string;
	path?: string;
	line?: number;
}

export interface ValidateData {
	ok: boolean;
	pass: boolean;
	compliant: boolean;
	mode: ValidationMode;
	effectiveMode: EffectiveMode;
	complianceLevel: "standard" | "imports-only" | "product" | "showcase" | "template-strict";
	template?: string;
	metrics: Record<string, boolean | number>;
	scores: Record<string, number>;
	findings: ValidateFinding[];
	summary: {errors: number; warnings: number; passed: number; total: number; text: string};
	tierCoverage?: unknown;
	componentCoverage?: unknown;
	tokenCompliance?: unknown;
	artifactInventory?: unknown;
	tokenProvenance?: unknown;
	tokenSemantics?: unknown;
	cssOwnership?: unknown;
	interactionSemantics?: unknown;
	runtimeAudit?: unknown;
	exceptions?: unknown[];
}

const CORE_MODES = new Set<ValidationMode>([
	"core-only",
	"core-imports",
	"core-product",
	"core-showcase",
	"core-template-strict",
]);

const mapFinding = (finding: ValidatorFinding): ValidateFinding => ({
	metric: finding.metric,
	pass: finding.pass,
	level: finding.pass ? "info" : "error",
	message: finding.reason,
	fix: finding.suggestedFix,
	source: finding.source,
	path: typeof finding.path === "string" ? finding.path : undefined,
	line: typeof finding.line === "number" ? finding.line : undefined,
});

const mapAdoptionFinding = (finding: AdoptionFinding): ValidateFinding => ({...finding});
const mapRuntimeFinding = (finding: RuntimeAuditFinding): ValidateFinding => ({...finding});

function effectiveMode(mode: ValidationMode): EffectiveMode {
	return mode === "core-only" ? "core-imports" : mode;
}

function complianceLevel(mode: EffectiveMode): ValidateData["complianceLevel"] {
	if (mode === "core-imports") return "imports-only";
	if (mode === "core-product") return "product";
	if (mode === "core-showcase") return "showcase";
	if (mode === "core-template-strict") return "template-strict";
	return "standard";
}

function allCode(input: ValidateInput): string {
	return input.files?.map((file) => file.content).join("\n") ?? input.code ?? "";
}

function expectedTemplate(input: ValidateInput): string | undefined {
	return (
		input.template ??
		(input.implementationPlan?.implementationMode === "direct-template"
			? (input.implementationPlan.templateId ?? input.implementationPlan.referenceTemplate)
			: undefined)
	);
}

function coreFindings(input: ValidateInput, ctx: CapabilityContext): ValidateFinding[] {
	if (!CORE_MODES.has(input.mode)) return [];
	const code = allCode(input);
	const findings: ValidateFinding[] = [];
	const hasCoreImport =
		/from\s+["']@corensystem\/coren-ui(?:\/|["'])/.test(code) ||
		/import\s+["']@corensystem\/coren-ui\/styles\.css["']/.test(code);
	if (!hasCoreImport)
		findings.push({
			metric: "core-imports",
			pass: false,
			level: "error",
			message: "No Core import was found; this appears to be a manual or generic UI implementation.",
			fix: "Use resolve_template/create_implementation_plan and import the selected Core artifacts.",
			source: "core-imports",
		});

	if (/<!doctype\s+html|<html(?:\s|>)|<style(?:\s|>)/i.test(code))
		findings.push({
			metric: "core-imports",
			pass: false,
			level: "error",
			message: "Standalone HTML or embedded CSS was detected in a Core implementation.",
			fix: "Use TSX and include application CSS as a separate file in the validation file set.",
			source: "core-imports",
		});

	const templateId = expectedTemplate(input);
	if (input.mode === "core-template-strict" && !templateId)
		findings.push({
			metric: "template-strict",
			pass: false,
			level: "error",
			message: "core-template-strict requires a selected template.",
			fix: "Pass template or the direct-template implementation plan.",
			source: "core-template-strict",
		});

	if (templateId) {
		const template = ctx.store.getById(templateId) ?? ctx.store.getByName(templateId);
		if (!template || template.tier !== "template")
			findings.push({
				metric: "template-adoption",
				pass: false,
				level: "error",
				message: `Expected template "${templateId}" is not present in the Core index.`,
				fix: "Call resolve_template again and pass a valid template id.",
				source: "template-adoption",
			});
		else if (template.source.import && !code.includes(template.source.import))
			findings.push({
				metric: "template-adoption",
				pass: false,
				level: "error",
				message: `Template ${template.name} exists but its required import "${template.source.import}" is missing.`,
				fix: template.minimalExample ?? `Import ${template.name} from "${template.source.import}".`,
				source: template.manifestPath,
			});
		else if (template.source.export && !new RegExp(`<${template.source.export}(?=[\\s/>])`).test(code))
			findings.push({
				metric: "template-adoption",
				pass: false,
				level: "error",
				message: `Template import is present but ${template.source.export} is not rendered.`,
				fix: template.minimalExample ?? `Import and render ${template.source.export}.`,
				source: template.manifestPath,
			});
	}

	if (findings.length === 0)
		findings.push({
			metric: "core-imports",
			pass: true,
			level: "info",
			message: "Core import requirements are satisfied.",
			source: "core-imports",
		});
	return findings;
}

async function grade(input: ValidateInput, ctx: CapabilityContext): Promise<GradeResult> {
	const files = input.files ?? (input.code ? [{path: "Component.tsx", language: "tsx", content: input.code}] : []);
	if (ctx.validators) {
		if (ctx.validators.gradeFileSet)
			return ctx.validators.gradeFileSet(files, input.task ?? {}, ctx.validators.catalog) as GradeResult;
		return ctx.validators.gradeSnippet(allCode(input), input.task ?? {}, ctx.validators.catalog) as GradeResult;
	}
	const rootDir = ctx.store.meta().rootDir;
	if (!rootDir) throw new Error("validate requires either injected validators or a filesystem-backed store (rootDir).");
	const validators = await loadValidators(rootDir);
	if (validators.gradeFileSet) return validators.gradeFileSet(files, input.task ?? {}, validators.catalog);
	return validators.gradeSnippet(allCode(input), input.task ?? {}, validators.catalog);
}

function numericScores(metrics: Record<string, boolean | number>): Record<string, number> {
	return Object.fromEntries(
		Object.entries(metrics).map(([key, value]) => [key, typeof value === "number" ? value : value ? 1 : 0]),
	);
}

export const validate: CapabilityFn<ValidateInput, ValidateData> = async (
	input,
	ctx,
): Promise<CapabilityResult<ValidateData>> => {
	const mode = effectiveMode(input.mode);
	const graded = await grade(input, ctx);
	const findings: ValidateFinding[] = [
		...graded.findings.map((finding) => {
			const mapped = mapFinding(finding);
			if (finding.metric.startsWith("tokens-")) mapped.level = "warning";
			if (finding.metric === "artifact-visibility")
				mapped.level = mode === "core-showcase" && !finding.pass ? "error" : finding.pass ? "info" : "warning";
			return mapped;
		}),
		...coreFindings(input, ctx),
	];
	if (input.implementationPlan?.goal === "visual-reproduction") {
		const analysis = input.implementationPlan.referenceAnalysis;
		findings.push({
			metric: "reference-analysis",
			pass: Boolean(analysis?.images.length),
			level: analysis?.images.length ? "info" : "error",
			message: analysis?.images.length
				? `${analysis.images.length} reference image analysis map(s) are bound to the plan.`
				: "Visual reproduction is missing the required pre-template reference analysis.",
			fix: analysis?.images.length
				? undefined
				: "Analyze shell, regions, scrolling, navigation semantics, interactions, responsiveness, and source-brand traits before implementation.",
			source: "implementation-plan",
		});
		if (analysis) {
			const analyzedRegions = new Set(analysis.images.flatMap((image) => image.regions.map((region) => region.id)));
			const plannedRegions = new Set(
				"routes" in input.implementationPlan.artifactContract
					? input.implementationPlan.artifactContract.routes.flatMap((route) =>
							route.regions.map((region) => region.id),
						)
					: [],
			);
			const missing = [...analyzedRegions].filter((region) => !plannedRegions.has(region));
			findings.push({
				metric: "reference-region-ownership",
				pass: missing.length === 0,
				level: missing.length ? "error" : "info",
				message: missing.length
					? `Reference regions lack planned Core owners: ${missing.join(", ")}.`
					: "Every analyzed reference region is represented in the route contract.",
				fix: missing.length ? "Assign a Core owner or approved catalog gap to every analyzed region." : undefined,
				source: "implementation-plan",
			});
		}
	}
	const adoption =
		mode === "core-product" || mode === "core-showcase" || mode === "core-template-strict"
			? validateArtifactAdoption(input, ctx)
			: undefined;
	if (adoption) findings.push(...adoption.findings.map(mapAdoptionFinding));
	const runtime = validateRuntimeAudit({
		mode,
		implementationPlan: input.implementationPlan,
		runtimeAudit: input.runtimeAudit,
	});
	findings.push(...runtime.findings.map(mapRuntimeFinding));

	const rawTokens = (graded.tokenCompliance ?? graded.tokens) as
		| {overall?: number | {score?: number}; exceptions?: unknown[]}
		| undefined;
	const rawCoverage = graded.coverage as
		| {imported?: string[]; rendered?: string[]; visiblyExercised?: string[]; [key: string]: unknown}
		| undefined;
	const rawVisibility = graded.visibility as {runtimeAuditRequired?: boolean} | undefined;
	const tokenOverall = typeof rawTokens?.overall === "number" ? rawTokens.overall : rawTokens?.overall?.score;
	const minimumTokenScore = mode === "core-showcase" ? 0.8 : mode === "core-product" ? 0.6 : undefined;
	if (minimumTokenScore !== undefined && tokenOverall !== undefined) {
		const pass = tokenOverall >= minimumTokenScore;
		findings.push({
			metric: "token-compliance",
			pass,
			level: pass ? "info" : "error",
			message: `Application token compliance is ${tokenOverall}; ${mode} requires ${minimumTokenScore}.`,
			fix: pass
				? undefined
				: "Replace application-authored color, spacing, typography, radius, and shadow values with Core tokens.",
			source: "token-compliance",
		});
	}

	const metrics: Record<string, boolean | number> = Object.fromEntries(
		Object.entries(graded.metrics).filter(
			([metric]) => !metric.startsWith("tokens-") && metric !== "artifact-visibility",
		),
	);
	for (const finding of findings)
		if (finding.level !== "warning")
			metrics[finding.metric] =
				typeof metrics[finding.metric] === "number"
					? metrics[finding.metric]
					: Boolean(metrics[finding.metric] ?? true) && finding.pass;
	if (input.mode === "core-only")
		metrics["core-compliance"] = findings
			.filter((finding) => finding.metric === "core-imports" || finding.metric === "template-adoption")
			.every((finding) => finding.pass);
	const errors = findings.filter((finding) => !finding.pass && finding.level === "error").length;
	const warningsCount = findings.filter((finding) => !finding.pass && finding.level === "warning").length;
	const pass = errors === 0 && Object.entries(metrics).every(([, value]) => typeof value === "number" || value);
	const level = complianceLevel(mode);
	const scores = {...numericScores(metrics), ...adoption?.scores, ...runtime.scores};
	const text = pass
		? `${level} compliance passed.`
		: level === "imports-only"
			? "Core import compliance failed."
			: `Core ${level} compliance failed with ${errors} blocking finding${errors === 1 ? "" : "s"}.`;
	const warnings: Warning[] =
		input.mode === "core-only"
			? [{code: "validation_mode.deprecated", message: "core-only is deprecated; use core-imports."}]
			: [];

	return {
		data: {
			ok: pass,
			pass,
			compliant: pass,
			mode: input.mode,
			effectiveMode: mode,
			complianceLevel: level,
			template: expectedTemplate(input),
			metrics,
			scores,
			findings,
			summary: {
				errors,
				warnings: warningsCount,
				passed: findings.length - errors - warningsCount,
				total: findings.length,
				text,
			},
			tierCoverage: adoption?.tierCoverage ?? graded.tierCoverage,
			componentCoverage: rawCoverage
				? {
						imported: rawCoverage.imported?.length ?? 0,
						rendered: rawCoverage.rendered?.length ?? 0,
						visiblyExercised: rawCoverage.visiblyExercised?.length ?? 0,
						interactiveStatesTested: null,
						runtimeAuditRequired: rawVisibility?.runtimeAuditRequired ?? true,
						artifacts: rawCoverage,
					}
				: graded.componentCoverage,
			tokenCompliance: rawTokens,
			tokenProvenance: graded.tokenProvenance,
			tokenSemantics: graded.tokenSemantics,
			cssOwnership: graded.cssOwnership,
			interactionSemantics: graded.interactionSemantics,
			runtimeAudit: runtime.summary,
			artifactInventory: adoption
				? {...adoption.artifactInventory, visiblyExercised: rawCoverage?.visiblyExercised ?? []}
				: rawCoverage,
			exceptions: graded.exceptions ?? rawTokens?.exceptions,
		},
		warnings,
	};
};
