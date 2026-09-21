// WidgetManifestPanel — pilot docs block that renders a widget's *build contract* from its manifest
// (manifests/*.widget.json). Complements the ComponentKnowledge block (which renders decision knowledge —
// intent/when/avoid/chooseOver — from library-index.json). This panel renders the manifest-only fields:
// data contract, configuration, states, composition, placement, common mistakes, minimal example.
//
// PILOT ONLY: this is wired by hand for the DataTable page (see DataTable.stories.tsx). The general
// manifest system (schema engine / registry / codegen) is intentionally NOT built yet.

import {Unstyled} from "@storybook/addon-docs/blocks";

type Field = {type?: string; required?: boolean; default?: unknown; note?: string};
type Mistake = {id?: string; mistake: string; symptom?: string; fix?: string};
export type WidgetManifest = {
	tier?: string;
	name?: string;
	version?: string;
	source?: {import?: string};
	dataContract?: {input?: Record<string, Field>; rowIdentity?: string; slots?: Record<string, string>};
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
	borderLeft: "3px solid #7c3aed",
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

/** Renders the manifest build-contract for a single widget. Pass the imported manifest JSON. */
export function WidgetManifestPanel({manifest: m}: {manifest: WidgetManifest}) {
	if (!m) return null;
	return (
		<Unstyled>
			<div style={wrap}>
				<div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
					<strong style={{fontSize: 13, letterSpacing: 0.3}}>WIDGET CONTRACT</strong>
					<span
						style={chip({
							color: "#6d28d9",
							background: "#ede9fe",
							borderColor: "#ede9fe",
							fontWeight: 600,
							marginTop: 0,
						})}
					>
						tier: {m.tier ?? "widget"}
					</span>
					{m.version && <span style={{...muted, fontSize: 12}}>v{m.version}</span>}
					{m.source?.import && <code style={{...mono, ...muted, marginLeft: "auto"}}>{m.source.import}</code>}
				</div>
				<p style={{...muted, fontSize: 12, margin: "6px 0 0"}}>
					The build contract from <code style={mono}>manifests/{m.name?.toLowerCase()}.widget.json</code> — the
					data/config/state boundary an agent or generator needs to use this widget. Decision knowledge (when / why /
					vs) is in the Catalog knowledge panel above.
				</p>

				{m.dataContract?.input && (
					<>
						<span style={label}>Data contract — input</span>
						<FieldTable fields={m.dataContract.input} />
						{m.dataContract.rowIdentity && (
							<p style={{...muted, fontSize: 12.5, margin: "6px 0 0"}}>
								<strong>Row identity:</strong> {m.dataContract.rowIdentity}
							</p>
						)}
					</>
				)}

				{m.dataContract?.slots && Object.keys(m.dataContract.slots).length > 0 && (
					<>
						<span style={label}>Slots (render props / extension points)</span>
						<ul style={{margin: "2px 0 0", paddingLeft: 18}}>
							{Object.entries(m.dataContract.slots).map(([k, v]) => (
								<li key={k} style={{fontSize: 13, lineHeight: 1.5}}>
									<code style={mono}>{k}</code> — <span style={muted}>{v}</span>
								</li>
							))}
						</ul>
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
						<span style={label}>Minimal example</span>
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
