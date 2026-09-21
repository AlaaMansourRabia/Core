// ComponentKnowledge — the shared autodocs "catalog" block.
//
// Surfaces each component's entry from the repo-root library-index.json (the SAME knowledge AI
// agents load) directly on that component's Storybook Docs page, so every page becomes its own
// catalog. There is NO per-story duplication and NO hand-authored MDX: this single block reads the
// JSON and resolves the current page by its story title.
//
// Wired globally via parameters.docs.page (AutodocsPage, below) in .storybook/preview.ts.

import {Controls, Description, Primary, Stories, Subtitle, Title, Unstyled, useOf} from "@storybook/addon-docs/blocks";

import catalogJson from "../../../../library-index.json";
import {resolveCatalogName} from "./catalog-map";

// ── Types (cast the JSON loosely; shape mirrors ComponentCatalog.tsx) ──
type ChooseOver = {component: string; because: string};
type InsteadUse = {whenInstead: string; component: string};
type Entry = {
	name: string;
	import?: string;
	intent?: string;
	description?: string;
	when?: string[];
	chooseOver?: ChooseOver[];
	insteadUse?: InsteadUse[];
	requires?: string[];
	pairsWith?: string[];
	variantIntent?: Record<string, string>;
	variants?: string[];
	avoid?: string[];
	knowledgeLevel?: string;
	tags?: string[];
};

// ── Flatten the category-keyed catalog into one name→entry index (built once) ──
const CATALOG: Record<string, Entry & {_category: string}> = (() => {
	const flat: Record<string, Entry & {_category: string}> = {};
	const comps = (catalogJson as {components: Record<string, Entry[]>}).components ?? {};
	for (const category of Object.keys(comps)) {
		for (const entry of comps[category]) flat[entry.name] = {...entry, _category: category};
	}
	return flat;
})();

const CATALOG_NAMES = Object.keys(CATALOG);

/** Resolve a story title (e.g. "Components/Forms/Date Picker") to its catalog entry, or undefined. */
function resolveEntry(title?: string): (Entry & {_category: string}) | undefined {
	const name = resolveCatalogName(title, CATALOG_NAMES);
	return name ? CATALOG[name] : undefined;
}

// ── Presentation (inline styles: deterministic + Chromatic-stable, matches ComponentCatalog.tsx) ──
const KL: Record<string, {label: string; color: string; bg: string}> = {
	full: {label: "full", color: "#15803d", bg: "#dcfce7"},
	concise: {label: "concise", color: "#1d4ed8", bg: "#dbeafe"},
	generated: {label: "generated", color: "#4b5563", bg: "#f3f4f6"},
	"needs-review": {label: "needs review", color: "#b45309", bg: "#fef3c7"},
};
const wrap: React.CSSProperties = {
	border: "1px solid #e5e7eb",
	borderLeft: "3px solid #2563eb",
	borderRadius: 10,
	padding: "14px 18px 16px",
	margin: "8px 0 28px",
	background: "#fff",
	color: "#111827",
};
const mono: React.CSSProperties = {fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5};
const muted: React.CSSProperties = {color: "#6b7280"};
const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
	display: "inline-block",
	fontSize: 12,
	padding: "1px 8px",
	borderRadius: 999,
	border: "1px solid #e5e7eb",
	background: "#f9fafb",
	color: "#374151",
	marginRight: 6,
	marginTop: 4,
	...extra,
});
const label: React.CSSProperties = {
	display: "block",
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: 0.4,
	textTransform: "uppercase",
	color: "#6b7280",
	margin: "12px 0 3px",
};

function List({items}: {items: React.ReactNode[]}) {
	return (
		<ul style={{margin: "2px 0 0", paddingLeft: 18}}>
			{items.map((it, i) => (
				<li key={i} style={{fontSize: 13.5, lineHeight: 1.5, margin: "1px 0"}}>
					{it}
				</li>
			))}
		</ul>
	);
}

/** The catalog block. Reads the current page title from the docs context; renders nothing if the
 * page has no library-index entry (e.g. Charts, Map sub-views) so those pages stay clean. */
export function ComponentKnowledge() {
	const resolved = useOf("meta") as {preparedMeta?: {title?: string}; csfFile?: {meta?: {title?: string}}};
	const title = resolved?.preparedMeta?.title ?? resolved?.csfFile?.meta?.title;
	const e = resolveEntry(title);
	if (!e) return null;

	const kl = KL[e.knowledgeLevel ?? "generated"] ?? KL.generated;
	const related = Array.from(
		new Set([...(e.chooseOver ?? []).map((c) => c.component), ...(e.insteadUse ?? []).map((i) => i.component)]),
	);

	return (
		<Unstyled>
			<div style={wrap}>
				<div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2}}>
					<strong style={{fontSize: 13, letterSpacing: 0.3}}>CATALOG KNOWLEDGE</strong>
					<span style={chip({color: kl.color, background: kl.bg, borderColor: kl.bg, fontWeight: 600, marginTop: 0})}>
						{kl.label}
					</span>
					{e.import && <code style={{...mono, ...muted, marginLeft: "auto"}}>{e.import}</code>}
				</div>

				{e.intent && <p style={{margin: "6px 0 2px", fontSize: 14.5, lineHeight: 1.55}}>{e.intent}</p>}

				{e.when && e.when.length > 0 && (
					<>
						<span style={label}>When to use</span>
						<List items={e.when} />
					</>
				)}

				{e.avoid && e.avoid.length > 0 && (
					<>
						<span style={{...label, color: "#b91c1c"}}>When NOT to use / common mistakes</span>
						<List items={e.avoid} />
					</>
				)}

				{e.chooseOver && e.chooseOver.length > 0 && (
					<>
						<span style={label}>Choose this over</span>
						<List
							items={e.chooseOver.map((c) => (
								<>
									<strong>{c.component}</strong> — <span style={muted}>{c.because}</span>
								</>
							))}
						/>
					</>
				)}

				{e.insteadUse && e.insteadUse.length > 0 && (
					<>
						<span style={label}>Use instead when…</span>
						<List
							items={e.insteadUse.map((i) => (
								<>
									<strong>{i.component}</strong> — <span style={muted}>{i.whenInstead}</span>
								</>
							))}
						/>
					</>
				)}

				{e.variantIntent && Object.keys(e.variantIntent).length > 0 && (
					<>
						<span style={label}>Variant meaning</span>
						<List
							items={Object.entries(e.variantIntent).map(([k, v]) => (
								<>
									<code style={mono}>{k}</code> — <span style={muted}>{v}</span>
								</>
							))}
						/>
					</>
				)}

				{e.requires && e.requires.length > 0 && (
					<>
						<span style={label}>Requires (providers / wiring)</span>
						<div style={{marginTop: 2}}>
							{e.requires.map((r) => (
								<code key={r} style={chip({...mono})}>
									{r}
								</code>
							))}
						</div>
					</>
				)}

				{e.pairsWith && e.pairsWith.length > 0 && (
					<>
						<span style={label}>Pairs with</span>
						<div style={{marginTop: 2}}>
							{e.pairsWith.map((p) => (
								<span key={p} style={chip()}>
									{p}
								</span>
							))}
						</div>
					</>
				)}

				{related.length > 0 && (
					<>
						<span style={label}>Related components</span>
						<div style={{marginTop: 2}}>
							{related.map((r) => (
								<span key={r} style={chip()}>
									{r}
								</span>
							))}
						</div>
					</>
				)}

				<p style={{...muted, fontSize: 11.5, margin: "14px 0 0"}}>
					From the WakeCore semantic catalog (<code style={mono}>library-index.json</code>) — the same knowledge agents
					load. See <strong>Components / Overview</strong> for the full index.
				</p>
			</div>
		</Unstyled>
	);
}

/** Default autodocs page template = the standard blocks with the catalog knowledge inserted near the
 * top, right after the description and before the first example. Keeps Title/Subtitle/Description/
 * Primary/Controls/Stories (args table + controls + all stories) exactly as the default autodocs. */
export function AutodocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}
