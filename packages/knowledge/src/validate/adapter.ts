// Adapter over the existing deterministic code validators (scripts/validators/index.mjs). We reuse
// `gradeSnippet` verbatim rather than re-implementing the rules — it is the same grader used by the
// evals and CI. Loaded once (its own loadCatalog reads library-index + component exports + failure
// modes) and cached. Loaded via a rootDir-relative dynamic import so the untyped .mjs never enters
// the TS build graph and the path survives bundling.

import {join} from "node:path";
import {pathToFileURL} from "node:url";

export interface ValidatorFinding {
	metric: string;
	pass: boolean;
	reason?: string;
	suggestedFix?: string;
	source?: string;
	[k: string]: unknown;
}

export interface GradeResult {
	findings: ValidatorFinding[];
	metrics: Record<string, boolean | number>;
	pass: boolean;
	coverage?: unknown;
	tierCoverage?: unknown;
	componentCoverage?: unknown;
	tokenCompliance?: unknown;
	tokenProvenance?: unknown;
	tokenSemantics?: unknown;
	cssOwnership?: unknown;
	interactionSemantics?: unknown;
	tokens?: unknown;
	visibility?: unknown;
	inventory?: unknown;
	exceptions?: unknown[];
}

export interface ValidatorTask {
	expected?: string[];
	acceptable?: string[];
	forbidden?: string[];
}

interface Validators {
	gradeSnippet: (code: string, task: ValidatorTask, catalog: unknown) => GradeResult;
	gradeFileSet?: (
		files: Array<{path: string; language: string; content: string}>,
		task: ValidatorTask,
		catalog: unknown,
	) => GradeResult;
	catalog: unknown;
}

let cache: Validators | null = null;

export async function loadValidators(rootDir: string): Promise<Validators> {
	if (cache) return cache;
	const url = pathToFileURL(join(rootDir, "scripts", "validators", "index.mjs")).href;
	const mod = (await import(url)) as {
		gradeSnippet: Validators["gradeSnippet"];
		gradeFileSet?: Validators["gradeFileSet"];
		loadCatalog: () => unknown;
	};
	cache = {gradeSnippet: mod.gradeSnippet, gradeFileSet: mod.gradeFileSet, catalog: mod.loadCatalog()};
	return cache;
}
