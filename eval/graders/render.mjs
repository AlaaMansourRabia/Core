// Behavioral grader (V3): render-smoke. Does the generated snippet actually MOUNT?
//
// Minimal by design: transpile the snippet (TS/JSX → JS), import it so its `@wakecap/core-ui`
// imports resolve against the real built modules, find the top component, and server-render it
// with react-dom/server `renderToStaticMarkup`. Two failure signals we care about:
//   - runtime crash on mount (undefined component, missing provider, throw during render)
//   - empty render (component returns nothing)
//
// React-version unification: this workspace currently resolves React to 18.3.1 for
// @wakecap/core-ui but 19.x at the repo root, so a naive SSR mixes React-18 elements (from
// core-ui) with a React-19 renderer and throws. To render real components we resolve react +
// react-dom/server from the SAME context core-ui uses and rewrite the snippet's react import
// specifiers to match — so elements and renderer are one React instance.
//
// LIMITATION (documented, not hidden): this is a *server* render — it runs the component's
// render path but NOT effects (useEffect) or browser-only APIs (canvas/ResizeObserver/window).
// Components that touch the DOM during render (some charts/maps) will fail here even though they
// work in a browser. So render-smoke is a FLOOR ("the composition mounts and produces markup"),
// not full interactive fidelity — full render needs the Vitest/Chromium harness (V3 follow-up).
//
// No new packages: uses react / react-dom / typescript (all deps). Requires the core-ui package
// to be BUILT (packages/components/dist) so runtime imports resolve.

import {existsSync, mkdirSync, unlinkSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";
import ts from "typescript";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const tmpDir = join(here, ".render-tmp");
let counter = 0;

// Resolve react / react-dom from the same place @wakecap/core-ui resolves them (one instance).
const SPECS = ["react/jsx-dev-runtime", "react/jsx-runtime", "react-dom/server", "react-dom/client", "react-dom", "react"];
let _runtime;
function runtime() {
	if (_runtime) return _runtime;
	const req = createRequire(join(repoRoot, "packages", "components", "dist", "index.mjs"));
	const byspec = {};
	for (const spec of SPECS) {
		try {
			byspec[spec] = pathToFileURL(req.resolve(spec)).href;
		} catch {
			/* not resolvable in this context — fall back to bare specifier */
		}
	}
	_runtime = {byspec, react: byspec.react ?? "react", server: byspec["react-dom/server"] ?? "react-dom/server"};
	return _runtime;
}

function transpile(code) {
	return ts.transpileModule(code, {
		compilerOptions: {jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
	}).outputText;
}

// Point every react import in the transpiled snippet at the unified react instance.
function unifyReactImports(js, {byspec}) {
	for (const spec of SPECS) {
		const url = byspec[spec];
		if (!url) continue;
		js = js.replaceAll(`"${spec}"`, `"${url}"`).replaceAll(`'${spec}'`, `'${url}'`);
	}
	return js;
}

// The component to mount: prefer a default export, else the first PascalCase function export.
function pickComponent(mod) {
	if (typeof mod.default === "function") return mod.default;
	for (const [name, val] of Object.entries(mod)) {
		if (typeof val === "function" && /^[A-Z]/.test(name)) return val;
	}
	return null;
}

const finding = (pass, reason) => ({metric: "render", pass, reason, source: "render-smoke"});

/**
 * @param {string} code  agent-generated (or fixture) snippet
 * @returns {Promise<{metric:"render", pass:boolean, reason:string, source:string, skipped?:boolean}>}
 */
export async function gradeRender(code) {
	const rt = runtime();
	let React;
	let server;
	try {
		React = (await import(rt.react)).default ?? (await import(rt.react));
		server = await import(rt.server);
	} catch {
		return {...finding(true, "react/react-dom unavailable — render-smoke skipped"), skipped: true};
	}

	let file;
	try {
		if (!existsSync(tmpDir)) mkdirSync(tmpDir, {recursive: true});
		file = join(tmpDir, `r-${process.pid}-${counter++}.mjs`);
		writeFileSync(file, unifyReactImports(transpile(code), rt));
		const mod = await import(`file://${file}?v=${counter}`);
		const Comp = pickComponent(mod);
		if (!Comp) return finding(false, "No renderable component export found (need a default or PascalCase export).");
		const html = server.renderToStaticMarkup(React.createElement(Comp));
		if (!html || html.trim().length === 0) return finding(false, "Component mounted but rendered empty output.");
		return finding(true, `Mounted and rendered ${html.length} chars of static markup.`);
	} catch (err) {
		return finding(false, `Crashed on mount: ${(err?.message ?? String(err)).split("\n")[0].slice(0, 160)}`);
	} finally {
		if (file) {
			try {
				unlinkSync(file);
			} catch {
				/* best-effort cleanup */
			}
		}
	}
}
