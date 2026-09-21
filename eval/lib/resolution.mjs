// A2 — Knowledge Resolution (retrieval).
//
// Replaces the wholesale knowledge injection (all 122 components + 9 patterns + 27 failure modes) with
// a small, RELEVANT slice per task. Two deterministic mechanisms over the manifest-projected catalog:
//   1. intent matching   — fuzzy token overlap of the query against each artifact's name/intent/when/tags
//   2. structural walk    — pull the closure of the matched artifacts (requires / pairsWith / composedOf /
//                           requiredWidgets) so providers + composed parts come along
// plus the failure modes referenced by the selected artifacts (fm-* ids in their `avoid` lines).
//
// Pure/deterministic: no model calls, no randomness. Same query -> same slice.

const STOP = new Set(
	"a an the of to for and or with in on at as is are be use using build show your you it this that page panel view above below across then while into from by per each one single set list grid row rows column columns data need needs want".split(
		" ",
	),
);

// Naive depluralize so "cards"/"panels"/"charts" match "card"/"panel"/"chart". Applied to BOTH the
// query and the catalog docs, so matching stays fair. (No real stemmer — this is enough for retrieval.)
const stem = (t) =>
	t.length > 4 && t.endsWith("ies")
		? t.slice(0, -3) + "y"
		: t.length > 3 && t.endsWith("s") && !t.endsWith("ss")
			? t.slice(0, -1)
			: t;

const tok = (s) =>
	String(s ?? "")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((t) => t.length > 2 && !STOP.has(t))
		.map(stem);

/** Precompute a token bag per component (weighted fields kept separate for scoring). */
export function buildIndex(catalog) {
	const docs = catalog.components.map((c) => {
		const nameTok = new Set(tok(c.name));
		const tagTok = new Set((c.tags ?? []).flatMap(tok));
		const bodyTok = new Set([
			...tok(c.intent),
			...(c.when ?? []).flatMap(tok),
			...(c.chooseOver ?? []).flatMap((o) => tok(o.component)),
		]);
		return {c, nameTok, tagTok, bodyTok};
	});
	const patterns = catalog.patterns.map((p) => ({
		p,
		toks: new Set([
			...tok(p.name),
			...tok(p.intent),
			...tok(p.when),
			...(p.tags ?? []).flatMap(tok),
			...(p.components ?? []).flatMap(tok),
		]),
	}));
	return {
		docs,
		patterns,
		byName: catalog.byName,
		failureModeById: catalog.failureModeById,
		failureModes: catalog.failureModes,
	};
}

const overlap = (q, set) => {
	let n = 0;
	for (const t of q) if (set.has(t)) n++;
	return n;
};

/** Resolve a bounded, relevant knowledge slice for a task. */
export function resolve(task, catalog, opts = {}) {
	const {k = 14, maxComponents = 16, patternK = 2, fmCap = 6} = opts;
	const index = catalog.__index ?? (catalog.__index = buildIndex(catalog));
	const q = new Set(tok(task.prompt));

	// 1. intent matching — score every component
	const scored = index.docs
		.map(({c, nameTok, tagTok, bodyTok}) => {
			const score = 3 * overlap(q, nameTok) + 2 * overlap(q, tagTok) + overlap(q, bodyTok);
			return {c, score};
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name));

	const picked = new Map();
	for (const {c} of scored.slice(0, k)) picked.set(c.name, c);
	const seed = [...picked.values()];

	// 2. structural walk — one level out, in priority order under a hard cap:
	//    (a) NECESSARY deps first — providers (requires) + composed parts (composedOf / requiredWidgets /
	//        requiredComponents): always included, they're required to build the picked artifacts.
	//    (b) SUGGESTIVE pairs (pairsWith): fill remaining budget up to maxComponents.
	const add = (ref) => {
		const r = index.byName.get(ref);
		if (r && !picked.has(r.name)) picked.set(r.name, r);
	};
	const necessary = (c) => [
		...(c.requires ?? []),
		...(c.composedOf ?? []),
		...(c.requiredWidgets ?? []).map((w) => (typeof w === "string" ? w : w?.name)),
		...(c.requiredComponents ?? []).map((w) => (typeof w === "string" ? w : w?.name)),
	];
	for (const c of seed) for (const ref of necessary(c)) add(ref);
	for (const c of seed) {
		if (picked.size >= maxComponents) break;
		for (const ref of c.pairsWith ?? []) {
			if (picked.size >= maxComponents) break;
			add(ref);
		}
	}

	// 3. failure modes referenced by the selected components (fm-* ids in `avoid`)
	const fmIds = new Set();
	for (const c of picked.values()) {
		for (const a of c.avoid ?? []) {
			for (const m of String(a).matchAll(/fm-[a-z0-9-]+/g)) fmIds.add(m[0]);
		}
	}
	// top up with same-domain failure modes (by priority) if the referenced set is thin
	const domainFms = index.failureModes
		.filter((fm) => fm.domain === task.domain)
		.sort((x, y) => (x.priority > y.priority ? 1 : -1));
	for (const fm of domainFms) {
		if (fmIds.size >= fmCap) break;
		fmIds.add(fm.id);
	}
	const failureModes = [...fmIds]
		.map((id) => index.failureModeById.get(id))
		.filter(Boolean)
		.slice(0, fmCap);

	// patterns — score + top-K
	const patterns = index.patterns
		.map(({p, toks}) => ({p, score: overlap(q, toks)}))
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name))
		.slice(0, patternK)
		.map((x) => x.p);

	return {components: [...picked.values()], patterns, failureModes};
}

/** The resolved knowledge digest (same shape the wholesale arm injects, but only the slice). */
export function resolvedDigest(slice) {
	const components = slice.components.map((c) => ({
		name: c.name,
		import: c.import,
		intent: c.intent,
		when: c.when,
		chooseOver: c.chooseOver,
		requires: c.requires,
		avoid: c.avoid,
	}));
	const failure = slice.failureModes
		.map((fm) => `### ${fm.id} — ${fm.title} (${fm.priority})\nWRONG:\n${fm.wrong}\nCORRECT:\n${fm.correct}`)
		.join("\n\n");
	return [
		"## Relevant components (retrieved for this task)",
		JSON.stringify({components, patterns: slice.patterns}, null, 1),
		"",
		"## Relevant failure modes",
		failure,
	].join("\n");
}
