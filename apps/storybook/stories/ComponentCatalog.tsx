import {useMemo, useState} from "react";

import catalogJson from "../../../library-index.json";
import componentPages from "./_docs/component-pages.json";

// ── Types (the catalog is hand+generated JSON; cast loosely) ──
type ChooseOver = {component: string; because: string};
type Entry = {
	name: string;
	import?: string;
	intent?: string;
	description?: string;
	when?: string[];
	chooseOver?: ChooseOver[];
	insteadUse?: {whenInstead: string; component: string}[];
	requires?: string[];
	pairsWith?: string[];
	variantIntent?: Record<string, string>;
	variants?: string[];
	sizes?: string[];
	avoid?: string[];
	knowledgeLevel?: string;
	tags?: string[];
};
type Recipe = {
	name: string;
	intent?: string;
	when?: string;
	components?: string[];
	order?: string[];
	requires?: string[];
	notes?: string;
};

const catalog = catalogJson as unknown as {
	version: string;
	lastUpdated: string;
	components: Record<string, Entry[]>;
	patterns: Recipe[];
};

// name → Storybook docs id, generated from the real index (scripts/gen-component-pages.mjs).
const PAGES = componentPages as Record<string, string>;

const KL: Record<string, {label: string; color: string; bg: string}> = {
	full: {label: "full", color: "#15803d", bg: "#dcfce7"},
	concise: {label: "concise", color: "#1d4ed8", bg: "#dbeafe"},
	generated: {label: "generated", color: "#4b5563", bg: "#f3f4f6"},
	"needs-review": {label: "needs review", color: "#b45309", bg: "#fef3c7"},
};

const card: React.CSSProperties = {
	border: "1px solid #e5e7eb",
	borderRadius: 10,
	padding: "14px 16px",
	marginBottom: 12,
	background: "#fff",
};
const row: React.CSSProperties = {
	display: "flex",
	alignItems: "baseline",
	gap: 8,
	flexWrap: "wrap",
	padding: "9px 4px",
	borderBottom: "1px solid #f1f5f9",
};
const chip: React.CSSProperties = {
	display: "inline-block",
	fontSize: 12,
	padding: "1px 8px",
	borderRadius: 999,
	border: "1px solid #e5e7eb",
	background: "#f9fafb",
	color: "#374151",
	marginRight: 6,
	marginTop: 4,
};
const mono: React.CSSProperties = {fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5};
const muted: React.CSSProperties = {color: "#6b7280"};

function Badge({level}: {level?: string}) {
	const k = KL[level ?? "generated"] ?? KL.generated;
	return (
		<span style={{...chip, color: k.color, background: k.bg, borderColor: k.bg, fontWeight: 600, marginTop: 0}}>
			{k.label}
		</span>
	);
}

// One thin index row: name (links to its own Docs page when one exists) + level + one-line intent.
// The full catalog entry (when / avoid / chooseOver / variants / …) now lives on that component page.
function IndexRow({e}: {e: Entry & {_cat: string}}) {
	const docsId = PAGES[e.name];
	return (
		<div style={row}>
			<span style={{minWidth: 170, fontWeight: 600, fontSize: 14}}>
				{docsId ? (
					// target="_top" navigates the Storybook manager (not the docs iframe); relative href
					// keeps any base path. No JS → deterministic for snapshots.
					<a href={`./?path=/docs/${docsId}`} target="_top" style={{color: "#2563eb", textDecoration: "none"}}>
						{e.name} →
					</a>
				) : (
					<span title="No dedicated component page (widget/utility export)">{e.name}</span>
				)}
			</span>
			<Badge level={e.knowledgeLevel} />
			<span style={{...muted, fontSize: 11}}>{e._cat}</span>
			<span style={{flex: 1, minWidth: 220, fontSize: 13, color: "#374151"}}>{e.intent ?? e.description ?? ""}</span>
			{e.import && <code style={{...mono, ...muted}}>{e.import}</code>}
		</div>
	);
}

export function ComponentCatalog() {
	const cats = Object.keys(catalog.components);
	const all = useMemo(() => cats.flatMap((c) => catalog.components[c].map((e) => ({...e, _cat: c}))), []);
	const [q, setQ] = useState("");
	const [cat, setCat] = useState("all");
	const [kl, setKl] = useState("all");

	const filtered = all.filter((e) => {
		if (cat !== "all" && e._cat !== cat) return false;
		if (kl !== "all" && (e.knowledgeLevel ?? "generated") !== kl) return false;
		const s = q.trim().toLowerCase();
		if (!s) return true;
		return [e.name, e.intent, ...(e.when ?? []), ...(e.tags ?? [])].join(" ").toLowerCase().includes(s);
	});

	const counts = all.reduce<Record<string, number>>((a, e) => {
		const k = e.knowledgeLevel ?? "generated";
		a[k] = (a[k] ?? 0) + 1;
		return a;
	}, {});
	const linked = all.filter((e) => PAGES[e.name]).length;

	const select: React.CSSProperties = {padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13};

	return (
		<div>
			<div
				style={{
					...card,
					borderLeft: "3px solid #2563eb",
					background: "#f8fafc",
					marginBottom: 16,
				}}
			>
				<strong>This is the searchable index.</strong> Each component's full catalog entry — intent, when to use, when
				not to, what to choose it over, required wiring, variant meaning — now lives on <em>its own Docs page</em>.
				Click a component below (or open it in the sidebar under <strong>Components/</strong>) to see its entry,
				rendered from the same <code style={mono}>library-index.json</code> that AI agents load.
			</div>

			<p style={muted}>
				Catalog v{catalog.version} · {all.length} components ({linked} with their own page) ·{" "}
				{Object.entries(counts)
					.map(([k, n]) => `${n} ${k}`)
					.join(" · ")}{" "}
				· {catalog.patterns.length} recipes
			</p>
			<div style={{display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0 16px"}}>
				<input
					placeholder="Search components…"
					value={q}
					onChange={(ev) => setQ(ev.target.value)}
					style={{...select, flex: 1, minWidth: 200}}
				/>
				<select value={cat} onChange={(ev) => setCat(ev.target.value)} style={select}>
					<option value="all">All categories</option>
					{cats.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
				<select value={kl} onChange={(ev) => setKl(ev.target.value)} style={select}>
					<option value="all">All knowledge levels</option>
					{Object.keys(KL).map((k) => (
						<option key={k} value={k}>
							{k}
						</option>
					))}
				</select>
			</div>

			<p style={{...muted, fontSize: 13}}>
				{filtered.length} match{filtered.length === 1 ? "" : "es"}
			</p>
			<div style={{border: "1px solid #e5e7eb", borderRadius: 10, padding: "4px 12px", background: "#fff"}}>
				{filtered.map((e) => (
					<IndexRow key={`${e._cat}-${e.name}`} e={e} />
				))}
			</div>

			<h2 style={{marginTop: 28}}>Composition recipes</h2>
			<p style={muted}>Screen-level patterns — which components compose a screen, in what order.</p>
			{catalog.patterns.map((p) => (
				<div key={p.name} style={card}>
					<strong style={{fontSize: 15}}>{p.name}</strong>
					{p.intent && <p style={{margin: "6px 0"}}>{p.intent}</p>}
					{p.when && (
						<p style={{...muted, fontSize: 13, margin: "0 0 6px"}}>
							<strong>When:</strong> {p.when}
						</p>
					)}
					<div>
						{p.components?.map((c) => (
							<span key={c} style={chip}>
								{c}
							</span>
						))}
					</div>
					{p.order && (
						<p style={{fontSize: 13, margin: "8px 0 0"}}>
							<strong>Order:</strong> {p.order.join(" → ")}
						</p>
					)}
					{p.notes && <p style={{...muted, fontSize: 12.5, margin: "6px 0 0"}}>{p.notes}</p>}
				</div>
			))}
		</div>
	);
}
