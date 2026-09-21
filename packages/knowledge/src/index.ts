// @wakecap/knowledge — the WakeCore Knowledge Platform. A versioned, transport-agnostic API over
// WakeCore knowledge, built from the canonical manifests + library-index. MCP is one transport over
// this; the knowledge model and capability API are the product.
//
// Usage:
//   const kb = createKnowledge();                       // builds the in-memory index from the repo
//   const res = await kb.callTool("resolve_template", {intent: "admin settings page"});
//   kb.tools;         // tool metadata (name/description) for a transport to advertise
//   kb.jsonSchemas(); // JSON Schema per tool input (for MCP inputSchema / a /schemas endpoint)

import type {CapabilityContext, InjectedValidators} from "./capabilities/context";
import {callTool, TOOLS, toolJsonSchemas} from "./capabilities/index";
import type {Envelope} from "./schemas/envelope";
import {createFileSystemStore} from "./store/filesystem-store";
import type {KnowledgeStore, StoreMeta} from "./store/store";

export interface Knowledge {
	store: KnowledgeStore;
	tools: {name: string; description: string}[];
	jsonSchemas(): Record<string, unknown>;
	callTool(name: string, args: unknown): Promise<Envelope<unknown>>;
	meta(): StoreMeta;
}

export interface CreateKnowledgeOptions {
	rootDir?: string;
	/** Provide a custom store (e.g. a future DbStore, or a bundle-backed memory store). Defaults to the filesystem store. */
	store?: KnowledgeStore;
	/** Pre-loaded code validators so `validate` never touches the filesystem (serverless/bundle deploys). */
	validators?: InjectedValidators;
	builtAt?: string;
}

export function createKnowledge(opts: CreateKnowledgeOptions = {}): Knowledge {
	const store = opts.store ?? createFileSystemStore({rootDir: opts.rootDir, builtAt: opts.builtAt});
	const ctx: CapabilityContext = {store, validators: opts.validators};
	return {
		store,
		tools: TOOLS.map((t) => ({name: t.name, description: t.description})),
		jsonSchemas: toolJsonSchemas,
		callTool: (name, args) => callTool(name, args, ctx),
		meta: () => store.meta(),
	};
}

export {TOOLS, TOOL_BY_NAME, callTool, toolJsonSchemas} from "./capabilities/index";
export {createFileSystemStore, createMemoryStore, storeFromIndex} from "./store/filesystem-store";
export {buildIndex, assembleIndex, INDEX_VERSION, MANIFEST_SCHEMA} from "./pipeline/build-index";
export {createLexicalSearchProvider, tokenize} from "./search/lexical-provider";
export {API_VERSION} from "./schemas/envelope";
export {INPUT_SCHEMAS} from "./schemas/inputs";
export {CapabilityError} from "./capabilities/context";
export {
	ARTIFACT_CONTRACT_VERSION,
	ARTIFACT_CONTRACT_VERSION_V2,
	artifactContractPlanId,
	createArtifactContract,
} from "./compliance/artifact-contract";
export {createApplicationContract} from "./compliance/application-contract";
export {IMPLEMENTATION_GOALS, inferImplementationGoal} from "./compliance/implementation-goal";
export {ARTIFACT_RESPONSIVE_BEHAVIORS} from "./model/record";

export type {Envelope, OkEnvelope, ErrorEnvelope, Warning, Provenance, Meta} from "./schemas/envelope";
export type {KnowledgeStore, StoreMeta, ReverseKind} from "./store/store";
export type {
	ArtifactOwnership,
	ArtifactResponsiveBehavior,
	NormalizedRecord,
	Tier,
	WidgetPlacement,
	RegionRecord,
	PropDef,
	ChooseOver,
} from "./model/record";
export type {SearchProvider, SearchHit, SearchQuery} from "./search/provider";
export type {CapabilityContext, InjectedValidators} from "./capabilities/context";
export type {ArtifactContract, ArtifactRequirement, TemplateRegionExpectation} from "./compliance/artifact-contract";
export type {
	ApplicationContract,
	RouteContract,
	RouteRegionContract,
	ShellLayoutOwnership,
	ShellContract,
} from "./compliance/application-contract";
export type {ImplementationGoal} from "./compliance/implementation-goal";
export type {KnowledgeIndex} from "./pipeline/build-index";
