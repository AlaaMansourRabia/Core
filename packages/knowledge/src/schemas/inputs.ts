// Tool input schemas (zod) — the single source of truth for each capability's request shape. These
// are (a) served verbatim to editors as MCP `inputSchema` (via z.toJSONSchema), (b) used to validate
// and type every incoming call, and (c) the versioned contract asserted in tests. Changing one is a
// reviewed, versioned change — never ad-hoc.

import {z} from "zod";

import {ARTIFACT_RESPONSIVE_BEHAVIORS} from "../model/record";

const TIERS = ["template", "widget", "component", "pattern", "utility"] as const;
const IMPLEMENTATION_GOALS = ["product-ui", "core-showcase", "component-evaluation", "visual-reproduction"] as const;
const VALIDATION_MODES = [
	"standard",
	"core-only",
	"core-imports",
	"core-product",
	"core-showcase",
	"core-template-strict",
] as const;

const implementationGoal = z.enum(IMPLEMENTATION_GOALS);
const artifactOwnership = z.object({
	surface: z.enum(["artifact", "route", "shell"]),
	background: z.enum(["owned", "transparent", "consumer"]),
	border: z.enum(["top", "bottom", "all", "none"]),
	padding: z.enum(["owned", "slot", "consumer"]),
	scrolling: z.enum(["artifact", "route", "none"]),
	responsiveBehavior: z.enum(ARTIFACT_RESPONSIVE_BEHAVIORS),
	expectedWrapper: z.string().min(1),
});
const artifactRequirement = z.object({
	id: z.string().min(1),
	name: z.string().min(1).optional(),
	tier: z.enum(TIERS),
	reason: z.string().optional(),
	region: z.string().optional(),
	ownership: artifactOwnership.optional(),
});
const artifactContractV1 = z.object({
	contractVersion: z.string().optional(),
	required: z.array(artifactRequirement).default([]),
	recommended: z.array(z.union([z.string().min(1), artifactRequirement])).default([]),
	allowedPrimitives: z.array(z.string().min(1)).default([]),
	manualRecreationForbidden: z.array(z.string().min(1)).default([]),
	requiredTemplateRegions: z.array(z.string().min(1)).optional().default([]),
	templateStructuralExpectations: z
		.object({
			referenceTemplateId: z.string().min(1).optional(),
			preserveOwnedLayout: z.boolean(),
			regions: z.array(
				z.object({
					id: z.string().min(1),
					role: z.string().optional(),
					required: z.boolean(),
					recommendedArtifacts: z.array(z.string()),
					note: z.string().optional(),
				}),
			),
		})
		.optional(),
});

const shellDensity = z.enum(["compact", "comfortable"]);
const referenceImageAnalysis = z.object({
	id: z.string().min(1),
	productShell: z.string().min(1),
	navigationModel: z.enum(["sidebar-destination", "hierarchical", "drill-in", "history", "standalone"]),
	density: shellDensity,
	regions: z
		.array(
			z.object({
				id: z.string().min(1),
				purpose: z.string().min(1),
				hierarchy: z.string().min(1),
				repeatedPatterns: z.array(z.string().min(1)).default([]),
				impliedInteractions: z.array(z.string().min(1)).default([]),
			}),
		)
		.min(1),
	scrollOwnership: z.array(z.string().min(1)).min(1),
	responsiveImplications: z.array(z.string().min(1)).default([]),
	semanticRelationships: z.array(z.string().min(1)).default([]),
	sourceBrandTraitsToReplace: z.array(z.string().min(1)).default([]),
});
const referenceAnalysis = z.object({
	images: z.array(referenceImageAnalysis).min(1),
	intentionalDifferences: z.array(z.string().min(1)).default([]),
});
const shellLayoutOwnership = z.object({
	viewportOwner: z.literal("application-shell").default("application-shell"),
	scrollOwner: z.literal("route-content").default("route-content"),
	contiguous: z.boolean().default(true),
	sidebarStationary: z.boolean().default(true),
	requiredShellHeight: z.literal("100dvh").default("100dvh"),
	requiredShellOverflow: z.literal("hidden").default("hidden"),
	requiredContentMinHeight: z.literal("0").default("0"),
	requiredContentOverflow: z.literal("auto").default("auto"),
});
const moduleBoundaryInput = z.object({
	id: z.string().min(1),
	routes: z.array(z.string().min(1)).min(1),
	shellId: z.string().min(1),
	sidebar: z.string().min(1).optional(),
	topBar: z.string().min(1).optional(),
	density: shellDensity,
	brandKey: z.string().min(1),
	navigationFingerprint: z.string().min(1),
	footerFingerprint: z.string().min(1).optional(),
	providerOwner: z.string().min(1),
	entryBehavior: z.string().min(1),
	exitBehavior: z.string().min(1),
	reason: z.string().min(1),
});
const shellContractInput = z.object({
	id: z.string().min(1).optional(),
	persistentAcrossRoutes: z.boolean().optional(),
	sidebar: z.string().min(1).optional().describe("Core catalog id or name for the shared sidebar."),
	topBar: z.string().min(1).optional().describe("Core catalog id or name for the shared top bar."),
	density: shellDensity.optional(),
	brandKey: z.string().min(1).optional(),
	navigationFingerprint: z.string().min(1).optional(),
	footerFingerprint: z.string().min(1).optional(),
	providerOwner: z.string().min(1).optional(),
	allowedRouteMutations: z.array(z.string().min(1)).optional().default([]),
	layoutOwnership: shellLayoutOwnership.optional(),
	moduleBoundaries: z.array(moduleBoundaryInput).optional().default([]),
	additionalArtifacts: z.array(z.string().min(1)).optional().default([]),
});

const routeRegionInput = z.object({
	id: z.string().min(1),
	role: z.string().min(1),
	required: z.boolean().optional().default(true),
	requiredArtifacts: z.array(z.string().min(1)).optional().default([]),
	acceptableArtifacts: z.array(z.string().min(1)).optional().default([]),
	fallbackOrder: z.array(z.string().min(1)).optional().default([]),
	catalogGapId: z.string().min(1).optional(),
	interactions: z.array(z.string().min(1)).optional().default([]),
	ownerArtifact: z.string().min(1).optional(),
	supportedVariant: z.string().min(1).optional(),
	surfaceOwner: z.enum(["artifact", "route", "shell"]).optional(),
	scrollOwner: z.boolean().optional(),
	interactionOwner: z.string().min(1).optional(),
	messageHistoryOwner: z.string().min(1).optional(),
	messageComposerOwner: z.string().min(1).optional(),
	navigationRelationship: z
		.object({
			type: z.enum(["peer", "parent", "drill-in-origin", "history", "none"]),
			destination: z.string().min(1).optional(),
		})
		.optional(),
	requiredCapabilities: z.array(z.string().min(1)).optional().default([]),
	referencePreserved: z.array(z.string().min(1)).optional().default([]),
	referenceReplaced: z.array(z.string().min(1)).optional().default([]),
});

const routeContractInput = z.object({
	id: z.string().min(1),
	path: z.string().min(1).optional(),
	intent: z.string().min(1).optional(),
	template: z.string().min(1).optional().describe("Core catalog template id or name for this route."),
	files: z
		.array(z.string().min(1))
		.optional()
		.default([])
		.describe("Application-authored implementation files owned by this route."),
	moduleBoundaryId: z.string().min(1).optional(),
	regions: z.array(routeRegionInput).min(1),
});

const artifactContractV2 = artifactContractV1.extend({
	contractVersion: z.literal("core-artifact-contract/2"),
	shell: z.object({
		id: z.string().min(1),
		persistentAcrossRoutes: z.boolean(),
		sidebar: artifactRequirement.optional(),
		topBar: artifactRequirement.optional(),
		density: shellDensity,
		brandKey: z.string().min(1),
		navigationFingerprint: z.string().min(1),
		footerFingerprint: z.string().min(1).optional(),
		providerOwner: z.string().min(1),
		allowedRouteMutations: z.array(z.string().min(1)),
		layoutOwnership: shellLayoutOwnership,
		moduleBoundaries: z.array(
			moduleBoundaryInput.omit({sidebar: true, topBar: true}).extend({
				sidebar: artifactRequirement.optional(),
				topBar: artifactRequirement.optional(),
			}),
		),
		additionalArtifacts: z.array(artifactRequirement).default([]),
	}),
	routes: z.array(
		z.object({
			id: z.string().min(1),
			path: z.string().min(1).optional(),
			intent: z.string().min(1).optional(),
			templateId: z.string().min(1).optional(),
			files: z.array(z.string().min(1)).default([]),
			moduleBoundaryId: z.string().min(1).optional(),
			regions: z.array(
				z.object({
					id: z.string().min(1),
					role: z.string().min(1),
					required: z.boolean(),
					requiredArtifacts: z.array(artifactRequirement),
					acceptableArtifacts: z.array(artifactRequirement),
					fallbackOrder: z.array(z.string().min(1)),
					catalogGapId: z.string().min(1).optional(),
					interactions: z.array(z.string().min(1)),
					ownerArtifact: artifactRequirement.optional(),
					supportedVariant: z.string().min(1).optional(),
					surfaceOwner: z.enum(["artifact", "route", "shell"]).optional(),
					scrollOwner: z.boolean().optional(),
					interactionOwner: z.string().min(1).optional(),
					messageHistoryOwner: z.string().min(1).optional(),
					messageComposerOwner: z.string().min(1).optional(),
					navigationRelationship: z
						.object({
							type: z.enum(["peer", "parent", "drill-in-origin", "history", "none"]),
							destination: z.string().min(1).optional(),
						})
						.optional(),
					requiredCapabilities: z.array(z.string().min(1)),
					referencePreserved: z.array(z.string().min(1)),
					referenceReplaced: z.array(z.string().min(1)),
				}),
			),
		}),
	),
});

const artifactContract = z.union([artifactContractV2, artifactContractV1]);

export const resolveTemplateInput = z.object({
	intent: z.string().min(1).describe("Natural-language description of the screen the user wants to build."),
	goal: implementationGoal.optional().describe("Implementation goal; inferred from intent when omitted."),
	limit: z.number().int().positive().max(25).optional().describe("Max candidates to return (default 3)."),
	archetype: z.string().optional().describe("Optional archetype filter, e.g. 'Dashboard'."),
	category: z.string().optional().describe("Optional category filter."),
	referenceAnalysis: referenceAnalysis
		.optional()
		.describe("Required screenshot-first analysis when images are supplied."),
});

export const resolveWidgetsInput = z.object({
	template: z.string().min(1).describe("Template id (from resolve_template)."),
	region: z.string().optional().describe("Optional region id to narrow the plan to."),
});

export const createImplementationPlanInput = z
	.object({
		template: z.string().min(1).optional().describe("Selected or nearest template id/name from resolve_template."),
		intent: z.string().min(1).optional().describe("Full UI intent, required when composing without a template."),
		goal: implementationGoal.optional().describe("Implementation goal; inferred from intent when omitted."),
		strategy: z
			.enum(["direct-template", "adapt-template", "compose"])
			.optional()
			.describe("Execution strategy returned by resolve_template. Defaults from the selected template when omitted."),
		shell: shellContractInput
			.optional()
			.describe("Shared application shell. Providing shell or routes opts the plan into contract v2."),
		routes: z
			.array(routeContractInput)
			.min(1)
			.optional()
			.describe("Materially different routes and their owned semantic regions for a multi-surface application."),
		referenceAnalysis: referenceAnalysis
			.optional()
			.describe("Structured reference-image inventory produced before template selection."),
	})
	.refine((input) => Boolean(input.template || input.intent), {
		message: "Provide `template` or `intent`.",
	});

export const resolveComponentInput = z.object({
	intent: z.string().min(1).optional().describe("Natural-language intent to rank components by."),
	name: z.string().min(1).optional().describe("Exact component name or kebab id, for a direct lookup."),
	requiredProps: z
		.array(z.string().min(1))
		.optional()
		.default([])
		.describe("Props the chosen component must expose; compatible candidates rank first."),
	limit: z.number().int().positive().max(25).optional().describe("Max candidates when using `intent` (default 5)."),
});

export const searchInput = z.object({
	query: z.string().min(1).describe("Semantic query across the whole design system."),
	tiers: z.array(z.enum(TIERS)).optional().describe("Restrict to these artifact tiers."),
	limit: z.number().int().positive().max(50).optional().describe("Max results (default 10)."),
});

const legacySubstitution = z.object({
	templateRegion: z.string().min(1),
	replacement: z.string().min(1),
	reason: z.string().min(1),
});
const reviewedSubstitutionBase = z.object({
	route: z.string().min(1),
	templateRegion: z.string().min(1),
	originalArtifactId: z.string().min(1),
	// Compatibility projection for the v1 adoption validator. Route-aware validation
	// consumes replacementArtifactId/catalogGapId directly.
	replacement: z.string().default(""),
	reason: z.string().min(1),
	reviewStatus: z.enum(["proposed", "approved", "rejected"]),
});
const reviewedSubstitution = z.union([
	reviewedSubstitutionBase.extend({replacementArtifactId: z.string().min(1), catalogGapId: z.never().optional()}),
	reviewedSubstitutionBase.extend({catalogGapId: z.string().min(1), replacementArtifactId: z.never().optional()}),
]);

const implementationPlan = z.object({
	planId: z.string().min(1).optional(),
	contractVersion: z.string().optional(),
	intent: z.string().min(1).optional(),
	goal: implementationGoal.optional(),
	implementationMode: z.enum(["direct-template", "adapt-template", "compose"]),
	templateId: z.string().min(1).optional(),
	referenceTemplate: z.string().min(1).optional(),
	referenceAnalysis: referenceAnalysis.optional(),
	artifactContract,
	substitutions: z
		.array(z.union([reviewedSubstitution, legacySubstitution]))
		.optional()
		.default([]),
});

const runtimeAudit = z.object({
	producer: z.string().min(1),
	version: z.string().min(1),
	planId: z.string().min(1),
	generatedAt: z.string().min(1),
	routes: z.array(
		z.object({
			route: z.string().min(1),
			shellId: z.string().min(1),
			shellFingerprint: z.object({
				shellId: z.string().min(1),
				sidebarArtifactId: z.string().min(1).optional(),
				topBarArtifactId: z.string().min(1).optional(),
				density: shellDensity.optional(),
				sidebarDensity: shellDensity.optional(),
				topBarDensity: shellDensity.optional(),
				brandKey: z.string().min(1).optional(),
				navigationFingerprint: z.string().min(1).optional(),
				footerFingerprint: z.string().min(1).optional(),
				providerOwner: z.string().min(1).optional(),
				domPersistent: z.boolean(),
			}),
			ownedStyles: z.array(
				z.object({
					artifactId: z.string().min(1),
					region: z.string().min(1).optional(),
					variant: z.string().min(1).optional(),
					surface: z.string().min(1).optional(),
					properties: z.record(z.string(), z.string()),
				}),
			),
			shellGeometry: z.object({
				viewportHeight: z.number(),
				shellHeight: z.number(),
				sidebarRight: z.number(),
				topBarLeft: z.number(),
				contentLeft: z.number(),
				sidebarPositionDelta: z.number(),
				contentScrollRange: z.number().nonnegative(),
				contentScrollDelta: z.number(),
				documentScrollDelta: z.number(),
			}),
			duplicateAffordances: z.array(z.object({purpose: z.string().min(1), count: z.number().int().positive()})),
			duplicateSurfaceBoundaries: z.array(
				z.object({artifactId: z.string().min(1), owner: z.string().min(1), edge: z.string().min(1)}),
			),
			responsiveAudits: z.array(
				z.object({
					name: z.string().min(1),
					width: z.number().positive(),
					height: z.number().positive(),
					horizontalOverflow: z.boolean(),
					groups: z.array(
						z.object({
							id: z.string().min(1),
							priority: z.string().optional(),
							left: z.number(),
							right: z.number(),
							top: z.number(),
							bottom: z.number(),
							width: z.number(),
							height: z.number(),
						}),
					),
					overlaps: z.array(z.object({first: z.string().min(1), second: z.string().min(1)})),
					splitGroups: z.array(z.string().min(1)),
					identityWidths: z.array(z.object({id: z.string().min(1), width: z.number().nonnegative()})),
					unlabeledIconActions: z.array(z.string()),
				}),
			),
			canvasCapabilities: z.array(
				z.object({
					region: z.string().min(1),
					capabilities: z.array(z.string().min(1)),
					observableStateChanged: z.boolean(),
				}),
			),
			navigationAffordances: z.array(
				z.object({
					purpose: z.string().min(1),
					relationship: z.string().min(1),
					destination: z.string().min(1).optional(),
				}),
			),
			sidebar: z.string().min(1).optional(),
			topBar: z.string().min(1).optional(),
			title: z.string().min(1).optional(),
			mainAction: z.string().min(1).optional(),
			regions: z.array(z.string().min(1)),
			interactions: z.array(z.object({id: z.string().min(1), passed: z.boolean()})),
			historyBackPassed: z.boolean(),
			reloadDetected: z.boolean(),
			consoleErrors: z.array(z.string()),
			accessibilityErrors: z.array(z.string()),
		}),
	),
	evidenceHash: z.string().min(1).optional(),
});

export const validateInput = z
	.object({
		code: z
			.string()
			.min(1)
			.max(200_000)
			.optional()
			.describe("Legacy single-file TSX input. Prefer `files` for product/showcase validation."),
		files: z
			.array(
				z.object({
					path: z.string().min(1).max(500),
					language: z.enum(["tsx", "ts", "jsx", "js", "css"]),
					content: z.string().max(200_000),
				}),
			)
			.min(1)
			.max(50)
			.optional()
			.describe("Complete implementation file set, including TSX, CSS, and application entry files."),
		task: z
			.object({
				expected: z.array(z.string()).optional(),
				acceptable: z.array(z.string()).optional(),
				forbidden: z.array(z.string()).optional(),
			})
			.optional()
			.describe("Optional expected/acceptable/forbidden component hints for component-choice grading."),
		mode: z
			.enum(VALIDATION_MODES)
			.optional()
			.default("standard")
			.describe("Validation level. core-only is a deprecated alias for core-imports."),
		template: z
			.string()
			.min(1)
			.optional()
			.describe(
				"Expected Core template id/name for direct-template mode. Omit for adapt-template or composition plans.",
			),
		implementationPlan: implementationPlan
			.optional()
			.describe("Plan and artifact contract returned before implementation."),
		runtimeAudit: runtimeAudit.optional().describe("Core-owned runtime evidence tied to the implementation plan."),
	})
	.refine((input) => Boolean(input.code || input.files?.length), {message: "Provide `code` or `files`."})
	.superRefine((input, ctx) => {
		const total = (input.code?.length ?? 0) + (input.files ?? []).reduce((sum, file) => sum + file.content.length, 0);
		if (total > 1_000_000)
			ctx.addIssue({code: "custom", message: "Combined validation input exceeds 1,000,000 characters."});
	});

export const explainInput = z.object({
	id: z.string().min(1).optional().describe("Artifact id or name to explain."),
	name: z.string().min(1).optional().describe("Alias for `id`."),
});

export const INPUT_SCHEMAS = {
	resolve_template: resolveTemplateInput,
	resolve_widgets: resolveWidgetsInput,
	create_implementation_plan: createImplementationPlanInput,
	resolve_component: resolveComponentInput,
	search: searchInput,
	validate: validateInput,
	explain: explainInput,
} as const;

export type ResolveTemplateInput = z.infer<typeof resolveTemplateInput>;
export type ResolveWidgetsInput = z.infer<typeof resolveWidgetsInput>;
export type CreateImplementationPlanInput = z.infer<typeof createImplementationPlanInput>;
export type ResolveComponentInput = z.infer<typeof resolveComponentInput>;
export type SearchInput = z.infer<typeof searchInput>;
export type ValidateInput = z.infer<typeof validateInput>;
export type ExplainInput = z.infer<typeof explainInput>;
