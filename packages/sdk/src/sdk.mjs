// Phase 6 prototype — the Core SDK (subset), implementing the Phase 2 capability contract against
// the real catalog and emitting the Phase 5 PageInstance (page-instance/0.1). Deterministic; no LLM.
// Implements: loadManifest, resolveTemplate, resolveWidgets, validateComposition, generatePageInstance,
// validatePage. Advisory (resolve*) vs authoritative (validate*) is preserved.

const STOP = new Set(["a", "an", "the", "for", "of", "to", "with", "and", "in", "on", "your", "page", "screen", "ui", "build", "make", "create"]);
// tokenize splits on hyphens too, so a manifest's "sign-in form" matches a query token "sign".
const tokenize = (s) =>
	String(s ?? "")
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.split(/\s+/)
		.filter((t) => t && !STOP.has(t));
// minimal synonym expansion (stand-in for the real embedding re-rank; applied to the QUERY only).
const SYNONYMS = {
	sign: ["login", "auth"],
	signin: ["login", "auth"],
	login: ["auth"],
	ops: ["operations"],
	operations: ["ops"],
	overview: ["dashboard"],
	dashboard: ["overview"],
	metrics: ["kpi"],
};
const expand = (tokens) => [...new Set(tokens.flatMap((t) => [t, ...(SYNONYMS[t] ?? [])]))];
const round = (n) => Math.round(n * 100) / 100;
const norm = (w) => (typeof w === "string" ? {name: w} : w);

export function createSdk(cat) {
	const prov = (arts) => ({
		sdkVersion: "core-sdk/1",
		manifestSchema: "artifact-manifest/0.2",
		pageInstanceSchema: "page-instance/0.1",
		knowledge: {status: "candidate", confidence: "unset"},
		artifacts: arts.map((a) => ({id: a.id ?? a.name, tier: a.tier ?? "template", version: a.version ?? "1.0.0"})),
	});
	const issue = (level, code, category, message, fix, target) => ({level, code, category, message, fix, target});

	const regionsOf = (t) => t.regions ?? [];
	const declaredForRegion = (t, region) =>
		[...(t.requiredWidgets ?? []).map(norm), ...(t.optionalWidgets ?? []).map(norm)].filter(
			(w) => w.region === region || !w.region,
		);
	const defaultConfig = (w) => {
		const cfg = {};
		for (const [k, s] of Object.entries(w?.configSchema ?? {})) if (s.default !== undefined) cfg[k] = s.default;
		return cfg;
	};

	function loadManifest({id, tier}) {
		const map = tier === "widget" ? cat.widgetByName : tier === "component" ? cat.componentByName : cat.templateById;
		const m = map.get(id);
		if (!m) throw {code: "ArtifactNotFound", message: `${tier} "${id}" not found`};
		return m;
	}

	// ---- resolution (advisory: ranked + rationale) ----------------------------------------------------
	function resolveTemplate({intent, limit = 3}) {
		const q = expand(tokenize(intent));
		const scored = cat.templates
			.map((t) => {
				const hay = tokenize(
					[t.name, t.id, t.archetype, (t.tags ?? []).join(" "), t.intent, (t.when ?? []).join(" ")].join(" "),
				);
				const hits = [...new Set(q.filter((tok) => hay.includes(tok)))];
				let score = hits.length / Math.max(q.length, 1);
				if (t.manifestStatus === "variant") score *= 0.6; // base templates rank above variants
				return {t, score, hits};
			})
			.filter((x) => x.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);
		return {
			query: {intent},
			candidates: scored.map(({t, score, hits}) => ({
				ref: {id: t.id, tier: "template", version: t.version ?? "1.0.0"},
				name: t.name,
				intent: t.intent,
				score: round(score),
				rationale: `matched [${hits.join(", ") || "archetype"}]${t.archetype ? ` · ${t.archetype}` : ""} · ${regionsOf(t).length} regions`,
				when: t.when,
				whenNot: t.whenNot,
			})),
			notes: [],
			provenance: prov(scored.map((s) => s.t)),
		};
	}

	function resolveWidgets({template, region}) {
		const t = loadManifest({id: template.id, tier: "template"});
		const regions = region ? regionsOf(t).filter((r) => r.id === region) : regionsOf(t);
		const cand = (name, kind) => ({
			ref: {id: name, tier: "widget"},
			name,
			intent: cat.widgetByName.get(name)?.intent ?? null,
			kind,
			renderable: cat.widgetByName.has(name),
		});
		const byRegion = {};
		for (const r of regions) {
			const declared = declaredForRegion(t, r.id);
			byRegion[r.id] = {
				role: r.role,
				regionRequired: !!r.required,
				required: declared.filter((w) => w.required).map((w) => cand(w.name, "required")),
				recommended: declared.filter((w) => !w.required).map((w) => cand(w.name, "recommended")),
				compatible: [],
			};
		}
		return {byRegion, provenance: prov([t])};
	}

	// ---- validation (authoritative: deterministic) ----------------------------------------------------
	function validateComposition({template, placements}) {
		const t = loadManifest({id: template.id, tier: "template"});
		const issues = [];
		const placedNames = new Set(placements.map((p) => p.widget));
		const filledRegions = new Set(placements.map((p) => p.region));

		for (const r of regionsOf(t))
			if (r.required && !filledRegions.has(r.id))
				issues.push(issue("error", "region.required.empty", "Regions", `Required region "${r.role ?? r.id}" is empty.`, `Add a widget to ${r.id}.`, {region: r.id}));

		for (const w of (t.requiredWidgets ?? []).map(norm))
			if (!placedNames.has(w.name))
				issues.push(issue("error", "widget.required.missing", "Required widgets", `Required widget ${w.name} is not placed.`, w.region ? `Add it to "${w.region}".` : "Add it.", {widget: w.name, region: w.region}));

		for (const p of placements) {
			const declared = new Set(declaredForRegion(t, p.region).map((w) => w.name));
			if (!declared.has(p.widget))
				issues.push(issue("warning", "widget.placement.undeclared", "Placement", `${p.widget} is not declared for region "${p.region}".`, "Confirm it belongs here, or move it.", {widget: p.widget, region: p.region}));
			const wm = cat.widgetByName.get(p.widget);
			for (const [name, spec] of Object.entries(wm?.dataContract?.input ?? {}))
				if (spec.required && !(p.bindings ?? {})[name])
					issues.push(issue("warning", "binding.unbound", "Data contracts", `${p.widget}: required input "${name}" is unbound.`, "Bind a {{source.path}}.", {widget: p.widget, input: name}));
		}

		const errors = issues.filter((i) => i.level === "error").length;
		return {
			ok: errors === 0,
			buildable: errors === 0,
			issues,
			summary: {errors, warnings: issues.length - errors, info: 0},
			provenance: prov([t]),
		};
	}

	// ---- generation (canonical output: page-instance/0.1) ---------------------------------------------
	function generatePageInstance({template, desired = [], fill = "required", name}) {
		const t = loadManifest({id: template.id, tier: "template"});
		const placements = [...desired];
		const have = new Set(placements.map((p) => `${p.region}:${p.widget}`));
		const add = (widgetName, region) => {
			if (!region || have.has(`${region}:${widgetName}`)) return;
			placements.push({
				id: `${widgetName}-${region}`,
				widget: widgetName,
				region,
				config: defaultConfig(cat.widgetByName.get(widgetName)),
			});
			have.add(`${region}:${widgetName}`);
		};
		if (fill === "required" || fill === "recommended")
			for (const w of (t.requiredWidgets ?? []).map(norm)) add(w.name, w.region ?? regionsOf(t)[0]?.id);
		if (fill === "recommended") for (const w of (t.optionalWidgets ?? []).map(norm)) add(w.name, w.region);

		const page = {
			schemaVersion: "page-instance/0.1",
			name: name ?? `${t.name} page`,
			template: {id: t.id, version: t.version ?? "1.0.0"},
			widgets: placements.map((p, i) => ({
				id: p.id ?? `w${i}`,
				widget: p.widget,
				region: p.region,
				order: i,
				config: p.config ?? {},
				bindings: p.bindings ?? {},
			})),
			provenance: prov([t]),
		};

		const validation = validateComposition({template: {id: t.id}, placements: page.widgets});
		const unresolved = [];
		for (const r of regionsOf(t))
			if (r.required && !page.widgets.some((w) => w.region === r.id))
				unresolved.push({kind: "required-widget", target: r.id, prompt: `Region "${r.role ?? r.id}" is required but its manifest declares no widget — this region is not yet widgetized.`});
		for (const w of page.widgets) {
			const wm = cat.widgetByName.get(w.widget);
			for (const [n, s] of Object.entries(wm?.dataContract?.input ?? {}))
				if (s.required && !w.bindings[n]) unresolved.push({kind: "binding", target: `${w.widget}.${n}`, prompt: `Bind ${w.widget}.${n} to a {{source.path}}.`});
		}
		return {
			page,
			validation,
			unresolved,
			rationale: `filled ${page.widgets.length} widget(s) (fill=${fill}); ${validation.summary.errors} blocking, ${validation.summary.warnings} advisory.`,
			provenance: prov([t]),
		};
	}

	const validatePage = (page) => validateComposition({template: {id: page.template.id}, placements: page.widgets});

	return {loadManifest, resolveTemplate, resolveWidgets, validateComposition, generatePageInstance, validatePage};
}
