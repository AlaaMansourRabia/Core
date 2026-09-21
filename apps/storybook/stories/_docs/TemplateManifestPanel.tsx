// TemplateManifestPanel — pilot docs block that renders a template's *build contract* from its
// manifest (manifests/*.template.json). Sibling of WidgetManifestPanel; renders the template-specific
// fields: regions, required widgets/components, configuration, states, composition, placement, common
// mistakes, minimal example. Decision knowledge (intent / when / vs) stays in the ComponentKnowledge
// panel above.
//
// PILOT ONLY: wired by hand for the ErrorPage page (see ErrorPage.stories.tsx). The general manifest
// system (schema engine / registry / codegen) is intentionally NOT built yet.

import {Unstyled} from "@storybook/addon-docs/blocks";

type Field = {type?: string; required?: boolean; default?: unknown; note?: string};
type Mistake = {id?: string; mistake: string; symptom?: string; fix?: string};
type Region = {id: string; role: string; source?: string; required?: boolean; recommended?: string[]; note?: string};
type Req = string | {name: string; region?: string; required?: boolean; note?: string};
export type TemplateManifest = {
	id?: string;
	tier?: string;
	// Open union: known values give autocomplete, but imported manifest JSON widens to `string`.
	consumption?: "compose" | "import" | (string & {});
	name?: string;
	version?: string;
	category?: string;
	source?: {import?: string; export?: string};
	intent?: string;
	regions?: Region[];
	requiredWidgets?: Req[];
	requiredComponents?: Req[];
	dataContract?: {applicable?: boolean; input?: Record<string, Field>; note?: string};
	configSchema?: Record<string, Field>;
	states?: Record<string, string>;
	composedOf?: string[];
	requiredProviders?: string[];
	allowedPlacement?: string[];
	forbiddenPlacement?: string[];
	commonMistakes?: Mistake[];
	minimalExample?: string;
};

const wrap: React.CSSProperties = {
	border: "1px solid #e5e7eb",
	borderLeft: "3px solid #0d9488",
	borderRadius: 10,
	padding: "14px 18px 16px",
	margin: "8px 0 28px",
	background: "#fff",
	color: "#111827",
};
const mono: React.CSSProperties = {fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5};
const muted: React.CSSProperties = {color: "#6b7280"};
const label: React.CSSProperties = {
	display: "block",
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: 0.4,
	textTransform: "uppercase",
	color: "#6b7280",
	margin: "14px 0 4px",
};
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
const th: React.CSSProperties = {
	textAlign: "left",
	fontSize: 11,
	color: "#6b7280",
	fontWeight: 700,
	padding: "4px 10px 4px 0",
};
const td: React.CSSProperties = {
	fontSize: 13,
	padding: "4px 10px 4px 0",
	verticalAlign: "top",
	borderTop: "1px solid #f1f5f9",
};

function FieldTable({fields}: {fields: Record<string, Field>}) {
	return (
		<table style={{borderCollapse: "collapse", width: "100%", marginTop: 2}}>
			<thead>
				<tr>
					<th style={th}>key</th>
					<th style={th}>type</th>
					<th style={th}>default</th>
					<th style={th}>notes</th>
				</tr>
			</thead>
			<tbody>
				{Object.entries(fields).map(([k, f]) => (
					<tr key={k}>
						<td style={{...td, ...mono, whiteSpace: "nowrap"}}>
							{k}
							{f.required ? <span style={{color: "#b91c1c"}}> *</span> : null}
						</td>
						<td style={{...td, ...mono, color: "#4b5563"}}>{f.type}</td>
						<td style={{...td, ...mono, color: "#4b5563"}}>{f.default === undefined ? "—" : String(f.default)}</td>
						<td style={{...td, ...muted}}>{f.note ?? ""}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

function reqName(r: Req): string {
	return typeof r === "string" ? r : r.name;
}

/** Renders the manifest build-contract for a single template. Pass the imported manifest JSON. */
export function TemplateManifestPanel({manifest: m}: {manifest: TemplateManifest}) {
	if (!m) return null;
	const required = [
		...(m.requiredWidgets ?? []).map((r) => ({r, kind: "widget" as const})),
		...(m.requiredComponents ?? []).map((r) => ({r, kind: "component" as const})),
	];
	return (
		<Unstyled>
			<div style={wrap}>
				<div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
					<strong style={{fontSize: 13, letterSpacing: 0.3}}>TEMPLATE CONTRACT</strong>
					<span
						style={chip({
							color: "#0f766e",
							background: "#ccfbf1",
							borderColor: "#ccfbf1",
							fontWeight: 600,
							marginTop: 0,
						})}
					>
						tier: {m.tier ?? "template"}
					</span>
					{m.category && <span style={chip({marginTop: 0})}>{m.category}</span>}
					{m.version && <span style={{...muted, fontSize: 12}}>v{m.version}</span>}
					{m.source?.import && (
						<code style={{...mono, ...muted, marginLeft: "auto"}}>
							{m.source.import}
							{m.consumption === "compose" ? " (preview only)" : null}
						</code>
					)}
				</div>
				<p style={{...muted, fontSize: 12, margin: "6px 0 0"}}>
					The build contract from <code style={mono}>manifests/{m.id ?? m.name?.toLowerCase()}.template.json</code> —
					the regions, composition, and states a generator or agent needs to assemble this page. Decision knowledge
					(when / why / vs) is in the Catalog knowledge panel above.
				</p>

				{m.consumption === "compose" && (
					<div
						style={{
							marginTop: 12,
							border: "1px solid #fde68a",
							background: "#fffbeb",
							borderRadius: 8,
							padding: "10px 12px",
							fontSize: 12.5,
							color: "#92400e",
							lineHeight: 1.5,
						}}
					>
						<strong>Reference prototype — build against it, don't import it.</strong> This template renders built-in
						demo data and mock handlers. Importing <code style={mono}>{m.source?.export ?? m.name}</code> ships that
						sample data into your app. Build your page by composing the widgets/components below, wired to your own
						data. The <code style={mono}>{m.source?.import}</code> export is a Storybook preview and is not part of the
						supported public API.
					</div>
				)}

				{m.regions && m.regions.length > 0 && (
					<>
						<span style={label}>Regions</span>
						<ul style={{margin: "2px 0 0", paddingLeft: 18}}>
							{m.regions.map((r) => (
								<li key={r.id} style={{fontSize: 13, lineHeight: 1.5}}>
									<code style={mono}>{r.id}</code>
									{r.required ? <span style={{color: "#b91c1c"}}> *</span> : null} — <span>{r.role}</span>
									{r.source && <span style={muted}> · from {r.source}</span>}
									{r.recommended?.length ? <span style={muted}> · recommended: {r.recommended.join(", ")}</span> : null}
									{r.note && <span style={muted}> — {r.note}</span>}
								</li>
							))}
						</ul>
					</>
				)}

				{required.length > 0 && (
					<>
						<span style={label}>Required widgets / components</span>
						<div style={{marginTop: 2}}>
							{required.map(({r, kind}) => {
								const name = reqName(r);
								const opt = typeof r !== "string" && r.required === false;
								return (
									<span
										key={kind + name}
										style={chip(
											kind === "widget" ? {color: "#6d28d9", background: "#ede9fe", borderColor: "#ede9fe"} : undefined,
										)}
										title={typeof r !== "string" ? r.note : undefined}
									>
										{name}
										{opt ? <span style={muted}> (optional)</span> : null}
									</span>
								);
							})}
							{required.length === 0 && <span style={muted}>none</span>}
						</div>
					</>
				)}

				{m.dataContract && m.dataContract.applicable === false && (
					<>
						<span style={label}>Data contract</span>
						<p style={{...muted, fontSize: 12.5, margin: "2px 0 0"}}>
							<span style={chip({color: "#15803d", background: "#dcfce7", borderColor: "#dcfce7", marginTop: 0})}>
								N/A — config-driven
							</span>
							{m.dataContract.note}
						</p>
					</>
				)}
				{m.dataContract?.input && (
					<>
						<span style={label}>Data contract — input</span>
						<FieldTable fields={m.dataContract.input} />
					</>
				)}

				{m.configSchema && (
					<>
						<span style={label}>Configuration</span>
						<FieldTable fields={m.configSchema} />
					</>
				)}

				{m.states && (
					<>
						<span style={label}>States</span>
						<ul style={{margin: "2px 0 0", paddingLeft: 18}}>
							{Object.entries(m.states).map(([k, v]) => (
								<li key={k} style={{fontSize: 13, lineHeight: 1.5}}>
									<strong>{k}</strong> — <span style={muted}>{v}</span>
								</li>
							))}
						</ul>
					</>
				)}

				{m.composedOf && m.composedOf.length > 0 && (
					<>
						<span style={label}>Composed of</span>
						<div style={{marginTop: 2}}>
							{m.composedOf.map((c) => (
								<span key={c} style={chip()}>
									{c}
								</span>
							))}
							{(m.requiredProviders?.length ?? 0) === 0 && (
								<span style={chip({color: "#15803d", background: "#dcfce7", borderColor: "#dcfce7"})}>
									no required providers
								</span>
							)}
						</div>
					</>
				)}

				{(m.allowedPlacement?.length || m.forbiddenPlacement?.length) && (
					<>
						<span style={label}>Placement</span>
						<div style={{marginTop: 2}}>
							{m.allowedPlacement?.map((p) => (
								<span key={p} style={chip({color: "#15803d", background: "#dcfce7", borderColor: "#dcfce7"})}>
									✓ {p}
								</span>
							))}
							{m.forbiddenPlacement?.map((p) => (
								<span key={p} style={chip({color: "#b91c1c", background: "#fee2e2", borderColor: "#fee2e2"})}>
									✗ {p}
								</span>
							))}
						</div>
					</>
				)}

				{m.commonMistakes && m.commonMistakes.length > 0 && (
					<>
						<span style={{...label, color: "#b91c1c"}}>Common mistakes</span>
						<ul style={{margin: "2px 0 0", paddingLeft: 18}}>
							{m.commonMistakes.map((mk, i) => (
								<li key={i} style={{fontSize: 13, lineHeight: 1.55, margin: "2px 0"}}>
									{mk.id && <code style={{...mono, ...muted}}>{mk.id}</code>} <strong>{mk.mistake}</strong>
									{mk.symptom && <span style={muted}> — {mk.symptom}.</span>}
									{mk.fix && (
										<span>
											{" "}
											<span style={{color: "#15803d"}}>Fix:</span> {mk.fix}
										</span>
									)}
								</li>
							))}
						</ul>
					</>
				)}

				{m.minimalExample && (
					<>
						<span style={label}>{m.consumption === "compose" ? "How to build this" : "Minimal example"}</span>
						<pre
							style={{
								...mono,
								background: "#0f172a",
								color: "#e2e8f0",
								padding: "12px 14px",
								borderRadius: 8,
								overflowX: "auto",
								fontSize: 12.5,
								lineHeight: 1.5,
								margin: "2px 0 0",
							}}
						>
							{m.minimalExample}
						</pre>
					</>
				)}
			</div>
		</Unstyled>
	);
}
