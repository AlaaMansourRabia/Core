// What every capability receives. Capabilities are pure functions over the Store (the only knowledge
// surface) — they never touch the filesystem or globals, which is what keeps them DB-swappable.

import type {CapabilityResult} from "../schemas/envelope";
import type {KnowledgeStore} from "../store/store";

/** Pre-loaded code validators. Injected in bundle/serverless deploys so `validate` never touches the
 *  filesystem; when absent, `validate` lazily loads them from the repo (scripts/validators). */
export interface InjectedValidators {
	gradeSnippet: (
		code: string,
		task: unknown,
		catalog: unknown,
	) => {findings: unknown[]; metrics: Record<string, boolean | number>; pass: boolean};
	gradeFileSet?: (
		files: Array<{path: string; language: string; content: string}>,
		task: unknown,
		catalog: unknown,
	) => {
		findings: unknown[];
		metrics: Record<string, boolean | number>;
		pass: boolean;
		coverage?: unknown;
		tokenCompliance?: unknown;
	};
	catalog: unknown;
}

export interface CapabilityContext {
	store: KnowledgeStore;
	validators?: InjectedValidators;
}

export type CapabilityFn<Input, Data> = (
	input: Input,
	ctx: CapabilityContext,
) => CapabilityResult<Data> | Promise<CapabilityResult<Data>>;

/** Thrown by a capability for an expected, structured failure (turned into an ErrorEnvelope, never a crash). */
export class CapabilityError extends Error {
	code: string;
	retryable: boolean;
	target?: string;
	constructor(code: string, message: string, opts: {retryable?: boolean; target?: string} = {}) {
		super(message);
		this.name = "CapabilityError";
		this.code = code;
		this.retryable = opts.retryable ?? false;
		this.target = opts.target;
	}
}

/** Score -> derived confidence band. Confidence is DERIVED from the ranking, never hand-set. */
export function confidenceBand(score: number): "high" | "medium" | "low" {
	if (score >= 0.5) return "high";
	if (score >= 0.25) return "medium";
	return "low";
}
