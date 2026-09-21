const INTERNAL_SELECTOR_RE = /\[((?:data-(?:slot|sidebar|state))|role)(?:[\s~|^$*]?=[^\]]+)?\]/g;
const ANATOMY_RE =
	/[.#][\w-]*(?:sidebar|topbar|top-bar|breadcrumb|dashboard-header|chart-card|data-table|filter-strip|chat-panel|canvas-node|canvas-toolbar)[\w-]*/gi;
const OWNED_WRAPPER_RE = /(?:sidebar|topbar|top-bar|crumb|tabs?|card|chart|table|filter|chat|canvas)/i;
const COLOR_RE = /#[0-9a-f]{3,8}\b|\b(?:rgb|hsl|oklch|oklab)a?\([^)]*\)/gi;

function lineAt(content, offset) {
	return content.slice(0, offset).split(/\r?\n/).length;
}

export function analyzeCssOwnership(files) {
	const internalOverrides = [];
	const widgetAnatomy = [];
	const geometry = {absolute: [], fixed: [], fixedSize: [], totalDeclarations: 0};
	const customColors = [];
	const wrapperChildOverrides = [];
	const variantIntegrity = [];
	const ownedArtifactOverrides = [];
	const shellLayout = {active: false, viewportOwned: false, contentOwned: false, accidentalGutters: [], issues: []};

	for (const file of files) {
		let match;
		while ((match = INTERNAL_SELECTOR_RE.exec(file.content)) !== null)
			internalOverrides.push({
				selector: match[0],
				attribute: match[1],
				path: file.path,
				line: lineAt(file.content, match.index),
			});
		while ((match = ANATOMY_RE.exec(file.content)) !== null)
			widgetAnatomy.push({selector: match[0], path: file.path, line: lineAt(file.content, match.index)});

		const blockRe = /([^{}]+)\{([^{}]*)\}/g;
		while ((match = blockRe.exec(file.content)) !== null) {
			const selector = match[1].trim();
			const declarations = match[2];
			const location = {selector, path: file.path, line: lineAt(file.content, match.index)};
			if (selector.includes(">") && OWNED_WRAPPER_RE.test(selector)) wrapperChildOverrides.push(location);
			if (
				/(?:\[role=["']?tab|\[data-state=["']?active)/i.test(selector) &&
				/(?:background(?:-color)?|border-radius|box-shadow)\s*:/i.test(declarations)
			)
				variantIntegrity.push({...location, kind: "hybrid-tab-variant"});
			if (
				/(?:data-table|datatable|\[data-wakecore-artifact=["']data-table)[^,{]*(?:\btable\b|\bth\b|\btd\b)/i.test(
					selector,
				) ||
				(/(?:chart|trend-chart)/i.test(selector) && /background(?:-color)?\s*:/i.test(declarations))
			)
				ownedArtifactOverrides.push({
					...location,
					kind: /chart/i.test(selector) ? "chart-surface" : "data-table-internals",
				});
			if (/(?:app-shell|wakecore-shell|main-shell|route-content|content-scroll)/i.test(selector))
				shellLayout.active = true;
			if (
				/(?:app-shell|wakecore-shell)/i.test(selector) &&
				/height\s*:\s*100dvh/i.test(declarations) &&
				/overflow\s*:\s*hidden/i.test(declarations)
			)
				shellLayout.viewportOwned = true;
			if (
				/(?:route-content|content-scroll)/i.test(selector) &&
				/min-height\s*:\s*0(?:\D|$)/i.test(declarations) &&
				/overflow(?:-y)?\s*:\s*auto/i.test(declarations)
			)
				shellLayout.contentOwned = true;
			if (
				/(?:main-shell|topbar|top-bar)/i.test(selector) &&
				/(?:padding-left|margin-left|padding-inline|margin-inline)\s*:\s*(?!0(?:\D|$))[^;]+/i.test(declarations)
			)
				shellLayout.accidentalGutters.push(location);
		}

		const declarationRe = /([\w-]+)\s*:\s*([^;{}]+)\s*;?/g;
		while ((match = declarationRe.exec(file.content)) !== null) {
			const [, property, value] = match;
			geometry.totalDeclarations += 1;
			const location = {property, value: value.trim(), path: file.path, line: lineAt(file.content, match.index)};
			if (property === "position" && /\babsolute\b/i.test(value)) geometry.absolute.push(location);
			if (property === "position" && /\bfixed\b/i.test(value)) geometry.fixed.push(location);
			if (
				/^(?:width|height|min-width|min-height|max-width|max-height)$/i.test(property) &&
				/\d(?:px|rem|em|vh|vw)\b/i.test(value)
			)
				geometry.fixedSize.push(location);
			if (property.startsWith("--") && !/var\(/.test(value)) {
				for (const color of value.match(COLOR_RE) ?? [])
					customColors.push({name: property, value: color, path: file.path, line: location.line});
			}
		}
	}

	const positioned = geometry.absolute.length + geometry.fixed.length;
	const positionDensity = geometry.totalDeclarations ? positioned / geometry.totalDeclarations : 0;
	const fixedSizeDensity = geometry.totalDeclarations ? geometry.fixedSize.length / geometry.totalDeclarations : 0;
	const signals = {
		internalOverrides: internalOverrides.length,
		widgetAnatomy: widgetAnatomy.length,
		customColorDefinitions: new Set(customColors.map((item) => item.name)).size,
		wrapperChildOverrides: wrapperChildOverrides.length,
		variantIntegrity: variantIntegrity.length,
		ownedArtifactOverrides: ownedArtifactOverrides.length,
		positionDensity: Number(positionDensity.toFixed(4)),
		fixedSizeDensity: Number(fixedSizeDensity.toFixed(4)),
	};
	const issues = [];
	if (internalOverrides.length) issues.push({kind: "internal-selector-override", count: internalOverrides.length});
	if (wrapperChildOverrides.length)
		issues.push({kind: "wrapper-child-owned-override", count: wrapperChildOverrides.length});
	if (variantIntegrity.length) issues.push({kind: "variant-integrity", count: variantIntegrity.length});
	if (ownedArtifactOverrides.length)
		issues.push({kind: "owned-artifact-override", count: ownedArtifactOverrides.length});
	if (shellLayout.active && (!shellLayout.viewportOwned || !shellLayout.contentOwned))
		shellLayout.issues.push({kind: "viewport-scroll-ownership", count: 1});
	if (shellLayout.accidentalGutters.length)
		shellLayout.issues.push({kind: "shell-gutter", count: shellLayout.accidentalGutters.length});
	issues.push(...shellLayout.issues);
	if (signals.customColorDefinitions >= 3)
		issues.push({kind: "custom-color-system", count: signals.customColorDefinitions});
	if (positioned >= 3 && positionDensity >= 0.2) issues.push({kind: "positioning-density", count: positioned});
	if (geometry.fixedSize.length >= 5 && fixedSizeDensity >= 0.3)
		issues.push({kind: "fixed-size-density", count: geometry.fixedSize.length});
	if (widgetAnatomy.length >= 3) issues.push({kind: "custom-widget-anatomy", count: widgetAnatomy.length});

	return {
		internalOverrides,
		wrapperChildOverrides,
		variantIntegrity,
		ownedArtifactOverrides,
		shellLayout,
		widgetAnatomy,
		geometry,
		customColors,
		signals,
		issues,
		pass: issues.length === 0,
	};
}
