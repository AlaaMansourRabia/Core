// Builds each template into ONE self-contained .html — no server, no install, no network.
// Everything (JS, CSS, fonts, images) is inlined, so the file can be emailed and opened by
// double-clicking it. Run from the repo root: `node standalone/build.mjs`.
//
// Resolution runs through apps/storybook, which already has vite, @vitejs/plugin-react and React 18
// linked, so this needs no workspace entry and no extra install.
import {readFileSync, rmSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..");
const STORYBOOK = resolve(REPO, "apps/storybook");

const require = createRequire(resolve(STORYBOOK, "package.json"));
const {build} = await import(require.resolve("vite"));
const react = (await import(require.resolve("@vitejs/plugin-react"))).default;

const TARGETS = [
	{name: "app-installer", title: "App Installer"},
	{name: "workforce", title: "Workforce"},
];

const OUT = resolve(HERE, "dist");
rmSync(OUT, {recursive: true, force: true});

for (const target of TARGETS) {
	const stage = resolve(OUT, `.${target.name}`);

	await build({
		root: HERE,
		configFile: false,
		logLevel: "warn",
		plugins: [react()],
		resolve: {
			// standalone/ is not a workspace package, so React has to be pointed at explicitly. Alias to
			// the package DIRECTORY (not its entry file) so subpaths like react/jsx-runtime still resolve,
			// and dedupe so core-ui and the entry share one copy — two copies breaks hooks.
			alias: {
				react: dirname(require.resolve("react/package.json")),
				"react-dom": dirname(require.resolve("react-dom/package.json")),
			},
			dedupe: ["react", "react-dom"],
		},
		build: {
			outDir: stage,
			emptyOutDir: true,
			// Inline every asset regardless of size — nothing may end up as a sibling file.
			assetsInlineLimit: Number.MAX_SAFE_INTEGER,
			cssCodeSplit: false,
			modulePreload: {polyfill: false},
			rollupOptions: {
				input: resolve(HERE, `${target.name}.html`),
				output: {inlineDynamicImports: true, entryFileNames: "app.js", assetFileNames: "app[extname]"},
			},
		},
	});

	// Fold the emitted JS and CSS back into the HTML.
	let html = readFileSync(resolve(stage, `${target.name}.html`), "utf8");
	const js = readFileSync(resolve(stage, "app.js"), "utf8");
	let css = "";
	try {
		css = readFileSync(resolve(stage, "app.css"), "utf8");
	} catch {
		// A target with no imported CSS is fine; both of ours have some.
	}

	html = html
		.replace(/<link rel="stylesheet"[^>]*>/g, "")
		.replace(/<script type="module"[^>]*src="[^"]*"[^>]*><\/script>/g, "");

	// `</script>` inside the bundle would close the tag early — the standard escape.
	const safeJs = js.replace(/<\/script>/g, "<\\/script>");

	// Replacer FUNCTIONS, not replacement strings: minified JS contains `$&`, `$'` and friends, which a
	// string replacement would expand as substitution patterns and corrupt the bundle.
	html = html
		.replace("</head>", () => `${css ? `<style>${css}</style>` : ""}</head>`)
		.replace("</body>", () => `<script type="module">${safeJs}</script></body>`);

	const file = resolve(OUT, `wakecap-${target.name}.html`);
	writeFileSync(file, html);
	rmSync(stage, {recursive: true, force: true});

	const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
	console.log(`${target.title.padEnd(14)} → standalone/dist/wakecap-${target.name}.html  (${kb} KB)`);
}
