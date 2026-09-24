// Dependency-free normalization and Core artifact coverage for multi-file input.

const SOURCE_RE = /\.(?:[cm]?[jt]sx?)$/i;
const CSS_RE = /\.(?:css|scss|sass|less)$/i;

/** Accept a path->content object or an array of {path, content|code}. */
export function normalizeFiles(files) {
	const entries = Array.isArray(files)
		? files
		: Object.entries(files ?? {}).map(([path, content]) => ({path, content}));
	return entries
		.map((file, index) => ({
			path: String(file?.path ?? file?.name ?? `file-${index}.tsx`),
			language: typeof file?.language === "string" ? file.language.toLowerCase() : undefined,
			content: String(file?.content ?? file?.code ?? ""),
		}))
		.sort((a, b) => a.path.localeCompare(b.path));
}

export function sourceFiles(files) {
	return files.filter((file) => SOURCE_RE.test(file.path) || ["tsx", "ts", "jsx", "js"].includes(file.language));
}

export function styleFiles(files) {
	return files.filter((file) => CSS_RE.test(file.path) || ["css", "scss", "sass", "less"].includes(file.language));
}

function catalogTier(catalog, name) {
	if (catalog?.byName?.has(name)) return "component";
	const collections = [
		["widget", catalog?.widgets],
		["template", catalog?.templates],
		["pattern", catalog?.patterns],
	];
	for (const [tier, values] of collections) {
		if ((values ?? []).some((item) => (typeof item === "string" ? item : (item?.name ?? item?.id)) === name))
			return tier;
	}
	return "unknown";
}

/** Parse named imports, retaining aliases, from Core modules. */
export function coreImports(files, coreUi = "@corensystem/coren-ui") {
	const imports = [];
	for (const file of sourceFiles(files)) {
		const re = /import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/g;
		let match;
		while ((match = re.exec(file.content)) !== null) {
			if (!match[2].startsWith(coreUi)) continue;
			if (/^\s*type\b/.test(match[1])) continue;
			const braced = match[1].match(/\{([^}]*)\}/);
			if (!braced) continue;
			for (const part of braced[1].split(",")) {
				if (/^\s*type\b/.test(part)) continue;
				const cleaned = part.trim();
				if (!cleaned) continue;
				const [name, local = name] = cleaned.split(/\s+as\s+/).map((value) => value.trim());
				imports.push({name, local, specifier: match[2], path: file.path});
			}
		}
	}
	return imports;
}

export function analyzeCoverage(files, catalog, visibility) {
	const importedRecords = coreImports(files, catalog?.coreUi);
	const renderedRecords = [];
	for (const imported of importedRecords) {
		const renderedIn = sourceFiles(files)
			.filter((file) => new RegExp(`<${escapeRegExp(imported.local)}(?=[\\s/>])`).test(file.content))
			.map((file) => file.path);
		if (renderedIn.length) renderedRecords.push({...imported, renderedIn});
	}

	const hiddenNames = new Set(visibility.hidden.map((item) => item.component));
	const nearZeroNames = new Set(visibility.nearZero.map((item) => item.component));
	const visiblyExercised = renderedRecords.filter(
		(item) => !hiddenNames.has(item.local) && !nearZeroNames.has(item.local),
	);
	const tiers = {template: new Set(), widget: new Set(), component: new Set(), pattern: new Set(), unknown: new Set()};
	for (const item of importedRecords) tiers[catalogTier(catalog, item.name)].add(item.name);

	return {
		imported: uniqueNames(importedRecords),
		rendered: uniqueNames(renderedRecords),
		visiblyExercised: uniqueNames(visiblyExercised),
		rates: {
			rendered: ratio(renderedRecords.length, importedRecords.length),
			visiblyExercised: ratio(visiblyExercised.length, importedRecords.length),
		},
		tiers: Object.fromEntries(Object.entries(tiers).map(([tier, names]) => [tier, [...names].sort()])),
	};
}

export function extractInventory(files) {
	const candidates = files.filter((file) => /(?:core[-_.]?)?inventory\.json$/i.test(file.path));
	const parsed = [];
	for (const file of candidates) {
		try {
			const value = JSON.parse(file.content);
			parsed.push({
				path: file.path,
				valid: true,
				metadata: value?.metadata ?? value?.meta ?? null,
				entries: inventorySize(value),
			});
		} catch {
			parsed.push({path: file.path, valid: false, metadata: null, entries: 0});
		}
	}
	return {present: candidates.length > 0, files: parsed};
}

function inventorySize(value) {
	if (Array.isArray(value)) return value.length;
	for (const key of ["artifacts", "components", "items", "entries"])
		if (Array.isArray(value?.[key])) return value[key].length;
	return 0;
}

function uniqueNames(records) {
	return [...new Set(records.map((item) => item.name))].sort();
}

function ratio(numerator, denominator) {
	return denominator === 0 ? 1 : Number((numerator / denominator).toFixed(4));
}

function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
