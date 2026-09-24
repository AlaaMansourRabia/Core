// Behavioral grader (V3): does the snippet actually type-check against the REAL built
// @corensystem/coren-ui types? This is the first grader where "correct" means "compiles," not
// "matches a string." It uses the TypeScript compiler API with `moduleResolution: bundler`
// so the package `exports` map + `types` condition resolve exactly as a real consumer build
// would — meaning a barrel `import { Button } from "@corensystem/coren-ui"` fails for the real
// reason (the barrel d.ts has no `Button` export), not because a regex said so.
//
// Two signals, because they answer different questions:
//   resolves  — every import path resolves AND every named import exists (codes 2307/2305).
//               This is the hard "won't run as written" floor.
//   compiles  — zero diagnostics at all (resolves + prop/type correctness).
//
// Requires the package to be BUILT (packages/components/dist/*.d.mts). If dist is missing,
// returns a skipped result rather than a false failure.

import {existsSync} from "node:fs";
import {createRequire} from "node:module";
import {basename, dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import ts from "typescript";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SNIPPET_PATH = join(repoRoot, "__eval_snippet__.tsx");
const DIST = join(repoRoot, "packages", "components", "dist", "index.d.mts");

// A real consumer app has ONE copy of react / react-dom / react-hook-form, so its code and
// @corensystem/coren-ui's types resolve them to the same module identity. In this monorepo the
// snippet (at repo root) and core-ui's bundled .d.ts resolve those packages to DIFFERENT paths
// (symlink vs .pnpm realpath) → TS sees duplicate type identities → false cross-module errors
// (e.g. `<Form {...useForm()}>`). Pin each to a single canonical dir — the one core-ui is built
// against — so grading matches a deduped consumer, not the monorepo layout.
function singletonPaths() {
	const paths = {};
	try {
		const reqC = createRequire(join(repoRoot, "packages", "components", "dist", "index.mjs"));
		const pkgRoot = (spec) => {
			let d = dirname(reqC.resolve(spec));
			while (d !== dirname(d)) {
				if (basename(d) === spec && existsSync(join(d, "package.json"))) return d;
				d = dirname(d);
			}
			return dirname(reqC.resolve(spec));
		};
		// Only react-hook-form needs deduping for the cross-module Form identity issue. Pinning
		// react/react-dom too caused unrelated regressions (data-grid/dashboard), so leave them.
		for (const spec of ["react-hook-form"]) {
			try {
				const root = pkgRoot(spec);
				paths[spec] = [root];
				paths[`${spec}/*`] = [join(root, "*")];
			} catch {
				/* leave unmapped if not resolvable */
			}
		}
	} catch {
		/* no mapping — fall back to default resolution */
	}
	return paths;
}

// Import-resolution / missing-export errors — the snippet literally cannot run as written.
const RESOLUTION_CODES = new Set([
	2307, // Cannot find module 'X' or its type declarations
	2305, // Module '"X"' has no exported member 'Y'  ← the barrel-import failure (fm-prim-1)
	2724, // '"X"' has no exported member named 'Y'. Did you mean 'Z'?
]);

const COMPILER_OPTIONS = {
	noEmit: true,
	jsx: ts.JsxEmit.ReactJSX,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.Bundler,
	target: ts.ScriptTarget.ES2022,
	strict: false, // we want "won't run", not strict-null nits
	skipLibCheck: true,
	esModuleInterop: true,
	allowImportingTsExtensions: false,
	lib: ["lib.es2022.d.ts", "lib.dom.d.ts", "lib.dom.iterable.d.ts"],
	types: [], // don't pull ambient @types/node etc.
	baseUrl: repoRoot,
	paths: singletonPaths(), // dedupe react / react-dom / react-hook-form to one identity (real-app-like)
};

function makeHost(code) {
	const host = ts.createCompilerHost(COMPILER_OPTIONS, true);
	const origGetSourceFile = host.getSourceFile.bind(host);
	host.getSourceFile = (name, languageVersion, onError, shouldCreate) => {
		if (name === SNIPPET_PATH) return ts.createSourceFile(name, code, languageVersion, true, ts.ScriptKind.TSX);
		return origGetSourceFile(name, languageVersion, onError, shouldCreate);
	};
	const origFileExists = host.fileExists.bind(host);
	host.fileExists = (f) => (f === SNIPPET_PATH ? true : origFileExists(f));
	const origReadFile = host.readFile.bind(host);
	host.readFile = (f) => (f === SNIPPET_PATH ? code : origReadFile(f));
	return host;
}

/**
 * Type-check a snippet against the real built library types.
 * @param {string} code
 * @returns {{skipped?: boolean, compiles: boolean, resolves: boolean, diagnostics: {code:number, line:number, message:string}[]}}
 */
export function compileSnippet(code) {
	if (!existsSync(DIST)) {
		return {skipped: true, compiles: false, resolves: false, diagnostics: [], reason: "package not built (run pnpm build)"};
	}
	const program = ts.createProgram([SNIPPET_PATH], COMPILER_OPTIONS, makeHost(code));
	const sf = program.getSourceFile(SNIPPET_PATH);
	const raw = [
		...program.getSyntacticDiagnostics(sf),
		...program.getSemanticDiagnostics(sf),
		...program.getGlobalDiagnostics(),
	];
	const diagnostics = raw.map((d) => {
		const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
		const line = d.file && d.start != null ? d.file.getLineAndCharacterOfPosition(d.start).line + 1 : 0;
		return {code: d.code, line, message};
	});
	return {
		compiles: diagnostics.length === 0,
		resolves: !diagnostics.some((d) => RESOLUTION_CODES.has(d.code)),
		diagnostics,
	};
}

/** Finding-shaped result for the eval runner (mirrors scripts/validators/util.mjs). */
export function gradeCompile(code) {
	const r = compileSnippet(code);
	if (r.skipped) {
		return {metric: "compile", pass: true, reason: `skipped: ${r.reason}`, suggestedFix: "", source: "tsc", skipped: true};
	}
	const blocking = r.diagnostics.filter((d) => RESOLUTION_CODES.has(d.code));
	return {
		metric: "compile",
		pass: r.resolves, // floor: imports resolve + named exports exist
		compiles: r.compiles, // stricter: full type-check clean
		reason: r.resolves
			? r.compiles
				? "Type-checks clean against @corensystem/coren-ui."
				: `Imports resolve, but ${r.diagnostics.length} type error(s) remain.`
			: `${blocking.length} import/export error(s): ${blocking.map((d) => d.message).join("; ").slice(0, 200)}`,
		suggestedFix: r.resolves ? "" : "Fix import paths / named imports so they resolve against the package exports.",
		source: "tsc",
		diagnostics: r.diagnostics,
	};
}
