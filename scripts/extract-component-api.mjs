#!/usr/bin/env node
// Generate per-component prop/type contracts from the BUILT .d.mts (source of truth = the
// published TypeScript types). Includes high-risk shell, header, tab, and chart artifacts so catalog
// configuration claims can be checked against the public API. Emits component-api.json (generated).
//
// For each target component we resolve its `<Name>Props` type (or the export's own type) via the
// TS checker and enumerate component-specific props — name, required?, type, and string-literal
// enum values (variants/size). Inherited DOM/React attributes are summarized, not listed.
//
// Run: node scripts/extract-component-api.mjs

import {mkdirSync, writeFileSync} from "node:fs";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";
import ts from "typescript";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(repoRoot, "packages", "components", "dist");
const outFile = join(repoRoot, "eval", "contracts", "component-api.json");

// family file → components to extract, and their import subpath.
const TARGETS = [
	{file: "button", import: "@corensystem/coren-ui/button", components: ["Button"]},
	{file: "form", import: "@corensystem/coren-ui/form", components: ["Form", "FormField", "FormItem", "FormControl", "FormLabel", "FormMessage"]},
	{file: "data-table", import: "@corensystem/coren-ui/data-table", components: ["DataTable"]},
	{file: "stepper", import: "@corensystem/coren-ui/stepper", components: ["Stepper", "StepperItem", "StepperIndicator"]},
	{file: "chart", import: "@corensystem/coren-ui/chart", components: ["ChartContainer"], catalogNames: {ChartContainer: "Chart"}},
	{file: "sheet", import: "@corensystem/coren-ui/sheet", components: ["Sheet", "SheetContent"]},
	{file: "dialog", import: "@corensystem/coren-ui/dialog", components: ["Dialog", "DialogContent"]},
	{file: "view-tab-bar", import: "@corensystem/coren-ui/view-tab-bar", components: ["ViewTabBar"]},
	{file: "trend-chart", import: "@corensystem/coren-ui/trend-chart", components: ["TrendChart"]},
	{file: "page-content-header", import: "@corensystem/coren-ui/page-content-header", components: ["PageContentHeader"]},
	{file: "context-toolbar", import: "@corensystem/coren-ui/context-toolbar", components: ["ContextToolbar"]},
	{file: "navigation/core-app-top-bar", import: "@corensystem/coren-ui/navigation/core-app-top-bar", components: ["CoreAppTopBar"]},
	{file: "navigation/core-dashboard-header", import: "@corensystem/coren-ui/navigation/core-dashboard-header", components: ["CoreDashboardHeader"]},
];

const dtsPath = (f) => join(distDir, `${f}.d.mts`);

const program = ts.createProgram(
	TARGETS.map((t) => dtsPath(t.file)),
	{
		moduleResolution: ts.ModuleResolutionKind.Bundler,
		module: ts.ModuleKind.ESNext,
		target: ts.ScriptTarget.ES2022,
		jsx: ts.JsxEmit.ReactJSX,
		skipLibCheck: true,
		strict: false,
	},
);
const checker = program.getTypeChecker();

const isInherited = (sym) => {
	const f = sym.declarations?.[0]?.getSourceFile().fileName ?? "";
	return f.includes("node_modules/@types/react") || /\/typescript\/lib\//.test(f) || f.includes("csstype");
};

function enumValues(type) {
	if (!type.isUnion()) return null;
	const lits = type.types.filter((t) => t.isStringLiteral());
	if (lits.length === 0 || lits.length !== type.types.length) return null;
	return lits.map((t) => t.value);
}

function extractProps(type) {
	const props = {};
	const required = [];
	let inherited = 0;
	for (const sym of checker.getPropertiesOfType(type)) {
		if (isInherited(sym)) {
			inherited += 1;
			continue;
		}
		const decl = sym.valueDeclaration ?? sym.declarations?.[0];
		if (!decl) continue;
		const pt = checker.getTypeOfSymbolAtLocation(sym, decl);
		const optional = (sym.flags & ts.SymbolFlags.Optional) !== 0;
		const values = enumValues(pt);
		props[sym.name] = {
			type: values ? "enum" : checker.typeToString(pt).slice(0, 80),
			...(values ? {values} : {}),
			required: !optional,
		};
		if (!optional) required.push(sym.name);
	}
	return {props, requiredProps: required, inheritedAttributeCount: inherited};
}

function typeOfExport(moduleSym, name) {
	const ex = checker.getExportsOfModule(moduleSym).find((s) => s.name === name);
	if (!ex) return null;
	// Prefer a declared `<Name>Props` type alias/interface if present.
	const propsType = checker.getExportsOfModule(moduleSym).find((s) => s.name === `${name}Props`);
	if (propsType) return checker.getDeclaredTypeOfSymbol(propsType);
	// Otherwise take the value's type and try its first construct/call-signature parameter (props).
	const valType = checker.getTypeOfSymbolAtLocation(ex, ex.valueDeclaration ?? ex.declarations?.[0]);
	const sig = valType.getCallSignatures()[0] ?? valType.getConstructSignatures()[0];
	if (sig && sig.parameters[0]) {
		const p = sig.parameters[0];
		return checker.getTypeOfSymbolAtLocation(p, p.valueDeclaration ?? ex.declarations?.[0]);
	}
	return null;
}

const out = {generatedFrom: "packages/components/dist/*.d.mts", generatedFor: "catalog/API compatibility and prop-aware selection", components: {}};
for (const t of TARGETS) {
	const sf = program.getSourceFile(dtsPath(t.file));
	const moduleSym = sf && checker.getSymbolAtLocation(sf);
	if (!moduleSym) {
		console.warn(`! no module symbol for ${t.file}`);
		continue;
	}
	for (const name of t.components) {
		const catalogName = t.catalogNames?.[name] ?? name;
		const type = typeOfExport(moduleSym, name);
		if (!type) {
			out.components[catalogName] = {import: t.import, export: name, props: {}, requiredProps: [], note: "props not statically extractable from .d.ts — rely on overlay"};
			continue;
		}
		const {props, requiredProps, inheritedAttributeCount} = extractProps(type);
		out.components[catalogName] = {
			import: t.import,
			export: name,
			props,
			requiredProps,
			inheritsHtmlReactAttributes: inheritedAttributeCount > 0,
		};
	}
}

mkdirSync(dirname(outFile), {recursive: true});
writeFileSync(outFile, `${JSON.stringify(out, null, 2)}\n`);
const n = Object.keys(out.components).length;
const withProps = Object.values(out.components).filter((c) => Object.keys(c.props).length > 0).length;
console.log(`Wrote ${outFile}: ${n} components, ${withProps} with statically-extracted props.`);
for (const [name, c] of Object.entries(out.components)) {
	console.log(`  ${name.padEnd(14)} ${Object.keys(c.props).length} props${c.note ? "  (" + c.note + ")" : ""}`);
}
