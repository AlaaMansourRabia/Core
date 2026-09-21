// WakeCore renderer — the code-eval path. Every template is REAL editable page source, compiled on
// the server by esbuild (CJS, React externalized) and evaluated here against one shared React, so a
// chat edit to the source shows up live. Exposes window.WakeCore.renderModule(compiledCjs, el).
//
// This replaces the old canonical-by-id / composition renderers: a single mechanism that renders any
// compiled WakeCore page, which is what makes ALL templates editable "as if building with a chat".
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as JsxRuntime from "react/jsx-runtime";
import * as JsxDevRuntime from "react/jsx-dev-runtime";
import {createRoot, type Root} from "react-dom/client";

// The modules a compiled page bundle may require. Everything else is bundled into the page itself; only
// React is shared so hooks + context work across the renderer and the evaluated page.
const registry: Record<string, unknown> = {
	react: React,
	"react-dom": ReactDOM,
	"react-dom/client": ReactDOMClient,
	"react/jsx-runtime": JsxRuntime,
	"react/jsx-dev-runtime": JsxDevRuntime,
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {err?: Error}> {
	state: {err?: Error} = {};
	static getDerivedStateFromError(err: Error) {
		return {err};
	}
	render() {
		if (this.state.err) {
			return (
				<pre style={{padding: 16, color: "#b91c1c", whiteSpace: "pre-wrap", font: "13px/1.5 ui-monospace,monospace"}}>
					Render error: {String(this.state.err.message)}
				</pre>
			);
		}
		return this.props.children;
	}
}

function evalModule(code: string): React.ComponentType {
	const mod = {exports: {} as Record<string, unknown>};
	const require = (id: string) => {
		if (id in registry) return registry[id];
		throw new Error(`Cannot require "${id}" — only React and bundled modules are available.`);
	};
	// eslint-disable-next-line no-new-func
	new Function("require", "module", "exports", code)(require, mod, mod.exports);
	const Comp = (mod.exports.default ?? mod.exports.Page) as React.ComponentType | undefined;
	if (!Comp) throw new Error("The compiled page has no default export.");
	return Comp;
}

let root: Root | undefined;

(window as unknown as {WakeCore: {renderModule: (code: string, el: HTMLElement) => void}}).WakeCore = {
	renderModule(code, el) {
		try {
			const Comp = evalModule(code);
			if (!root) root = createRoot(el);
			root.render(
				<ErrorBoundary>
					<Comp />
				</ErrorBoundary>,
			);
		} catch (e) {
			el.innerHTML = `<pre style="padding:16px;color:#b91c1c;white-space:pre-wrap;font:13px/1.5 ui-monospace,monospace">Eval error: ${String((e as Error).message)}</pre>`;
		}
	},
};
