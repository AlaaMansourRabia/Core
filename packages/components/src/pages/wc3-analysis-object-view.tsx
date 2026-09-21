import type {ReactElement} from "react";

import {Button} from "../button";
import {
	AnalysisOption,
	AnalysisWorkbench,
	Mono,
	TypeGlyphLabel,
	WC3_OBSERVATION_ROWS,
	type Wc3AnalysisStageContext,
	type Wc3AnalysisViewProps,
	type Wc3LineageNavTarget,
	analysisTraversalKind,
	lineageNav,
} from "./wc3-analysis-shared";
import {WC3_LINK_TYPES, getObjectType} from "./wc3-ontology-data";

// The `object` tab of the Analysis perspective — "start from an ontology object set".
//
// This file is deliberately thin. It mounts AnalysisWorkbench from wc3-analysis-shared.tsx and
// supplies exactly TWO stage bodies: Source and Traverse / Join, the only two stages the prototype
// itself writes differently per mode. The rail, Filter, Derive, Group, Visualize, Publish, the
// result panel and the execution-meta panel are the shared implementation, so this tab and the Data
// analysis tab structurally cannot drift.
//
// Nothing here holds state and nothing here computes a number. The spec and its result arrive on
// the session; every edit is `ctx.setSpec(patch)`, which is the shared module's one spec writer —
// hand-building `{...session, object: {...}}` would desynchronise the exec-meta panel from the query
// with no type error anywhere.
//
// ONE DELIBERATE CORRECTION OF THE PROTOTYPE, not a port of it. The prototype's traverse stage offers
// `reported_by → ot_worker` AND `assigned_to → ot_worker` under the hint "Only traversals the object
// type declares are offered — this is the ontology acting as the semantic plane." That claim is false
// of the second option: WC3_LINK_TYPES declares exactly two links off ot_observation — lt_obs_reporter
// (fkProperty reported_by) and lt_obs_zone (fkProperty zone_id) — and ZERO link types reference
// assigned_to, which is the plain string property p_assigned_to_139. The join still resolves for all
// of its non-null values, so the option is kept; it is moved under a heading that says what it is.
// The declared half of the list is DERIVED from WC3_LINK_TYPES rather than typed out, so a link
// added to or removed from the ontology fixture changes this stage without an edit here.

/**
 * The object type the traversal step resolves rows against.
 *
 * Not a preference — a fact about the shared engine: `analysisRun`'s traversal maps each matched row
 * through `analysisWorker`, which is a lookup over WC3_WORKER_ROWS keyed by `worker_id`. A link to
 * any other object type would therefore resolve to null for every row, so a declared link that does
 * not land on ot_worker is named below rather than offered.
 */
const TRAVERSAL_TARGET = "ot_worker";

/**
 * The one non-link FK column the prototype offers, kept for fidelity.
 *
 * It is listed as a candidate, not as a fact: the render below only shows it under the "property
 * join" heading if `analysisTraversalKind` confirms no link type backs it AND the source object type
 * really declares it as a property. If the ontology ever grows a link type over `assigned_to`, the
 * declared list picks it up and this heading disappears on its own.
 */
const PROPERTY_JOIN_CANDIDATES = ["assigned_to"];

/**
 * Source stage — an ontology object set.
 *
 * ONE option, permanently selected, exactly as the prototype has it, and for a reason the panel
 * states rather than hides: the shared engine's object mode scans the seeded ot_observation
 * instances, and the metrics, the reported_by traversal and the contractor/severity/zone groupings
 * are all defined against that type. A second object type in the picker would not change a single
 * number, which is the kind of padding this perspective refuses.
 *
 * The count is `WC3_OBSERVATION_ROWS.length` — the same array the engine scans and the same array
 * the Processes perspective reads — never a literal.
 */
function ObjectSourceConfig({
	ctx,
	onNavigate,
}: {
	ctx: Wc3AnalysisStageContext;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
}): ReactElement {
	const typeId = ctx.spec.sourceType ?? "ot_observation";
	const type = getObjectType(typeId);
	// The ontology's identity claim, resolved: primaryKey holds PROPERTY IDS, so it is mapped through
	// the type's own property list to the api names an analyst would recognise.
	const identity = (type?.primaryKey ?? [])
		.map((pid) => type?.properties.find((p) => p.id === pid)?.apiName ?? pid)
		.join(", ");

	return (
		<div>
			<div className="wwc:flex wwc:flex-wrap">
				{/*
				 * `onSelect` is a no-op: there is nothing else to select. Kept as a pressed option rather
				 * than as static text so the source stage reads the same as every other stage in the rail.
				 */}
				<AnalysisOption selected onSelect={() => {}}>
					{typeId} — {WC3_OBSERVATION_ROWS.length.toLocaleString()} instances
				</AnalysisOption>
			</div>
			<div className="wwc:mt-2 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1 wwc:text-sm">
				<TypeGlyphLabel type={type} />
				{identity ? (
					<span className="wwc:text-muted-foreground">
						identity <Mono>{identity}</Mono>
					</span>
				) : null}
				{onNavigate ? (
					<Button type="button" size="sm" variant="link" onClick={() => onNavigate(lineageNav.objectType(typeId))}>
						Open in Ontology
					</Button>
				) : null}
			</div>
			{type ? <p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">{type.description}</p> : null}
			{/* Trimmed to one line: the point is that the picker is short because the DATA is, not that
			    an option is missing. The long version said the same thing in four lines. */}
			<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
				The only object set with seeded metrics and groupings behind it.
			</p>
		</div>
	);
}

/**
 * Traverse / Join stage — link traversal, split honestly.
 *
 * The declared half is derived from WC3_LINK_TYPES: foreign-key links whose `fkObjectTypeId` is the
 * source object type and whose far side lands on {@link TRAVERSAL_TARGET}. Today that is exactly
 * lt_obs_reporter. A declared link that lands elsewhere (lt_obs_zone → ot_zone) is NAMED under the
 * options instead of offered, because the engine's traversal resolves ot_worker rows and following
 * it would join nothing — an option that silently matches zero rows is worse than an explained
 * absence.
 *
 * The property-join half holds only candidates that {@link analysisTraversalKind} confirms are NOT
 * backed by a link type, so the two headings can never both claim the same field.
 */
function ObjectTraverseConfig({ctx}: {ctx: Wc3AnalysisStageContext}): ReactElement {
	const {spec, setSpec} = ctx;
	const typeId = spec.sourceType ?? "ot_observation";
	const type = getObjectType(typeId);

	// `flatMap` rather than `filter`, so the FK column is narrowed to a string here instead of being
	// cast at every use site — `Wc3LinkType["backing"]` declares every field optional because the same
	// shape covers non-foreign-key backings.
	const declared = WC3_LINK_TYPES.flatMap((l) =>
		l.backing.kind === "foreignKey" && l.backing.fkObjectTypeId === typeId && l.backing.fkProperty
			? [{link: l, field: l.backing.fkProperty}]
			: [],
	);
	const traversable = declared.filter((d) => d.link.sideB.objectTypeId === TRAVERSAL_TARGET);
	// Declared, but pointing at a type this stage cannot resolve. Listed, not offered.
	const elsewhere = declared.filter((d) => d.link.sideB.objectTypeId !== TRAVERSAL_TARGET);

	const propertyJoins = PROPERTY_JOIN_CANDIDATES.map((field) => ({
		field,
		property: type?.properties.find((p) => p.apiName === field),
		kind: analysisTraversalKind(field),
	})).filter((c) => c.property !== undefined && !c.kind.declared);

	return (
		<div>
			<p className="wwc:text-xs wwc:font-medium wwc:text-foreground">Declared link traversals</p>
			<div className="wwc:mt-1 wwc:flex wwc:flex-wrap">
				{traversable.map(({link, field}) => {
					// Routed through the shared decision function rather than read off `link` directly, so the
					// "declared" claim this UI makes and the one the shared module makes are the same claim.
					const kind = analysisTraversalKind(field);
					return (
						<AnalysisOption
							key={link.id}
							selected={spec.traverse === field}
							onSelect={() => setSpec({traverse: field})}
							// The backing link, api name, cardinality and description used to be a paragraph per
							// option stacked under the chips. Same facts, on hover.
							hint={`${kind.declared ? kind.linkTypeId : link.id} · ${kind.declared ? kind.apiName : link.sideA.apiName} · ${link.cardinality} — ${link.description}`}
						>
							{field} → {link.sideB.objectTypeId}
						</AnalysisOption>
					);
				})}
			</div>

			{propertyJoins.length > 0 ? (
				<>
					<p className="wwc:mt-3 wwc:text-xs wwc:font-medium wwc:text-foreground">
						Property join — not an ontology-declared link
					</p>
					<div className="wwc:mt-1 wwc:flex wwc:flex-wrap">
						{propertyJoins.map((c) => (
							<AnalysisOption
								key={c.field}
								selected={spec.traverse === c.field}
								onSelect={() => setSpec({traverse: c.field})}
								hint={`${c.property?.baseType} property ${c.property?.id} (${c.property?.displayName}) — ${c.property?.description}`}
							>
								{c.field} → {TRAVERSAL_TARGET}
							</AnalysisOption>
						))}
					</div>
					{/* One caveat for the whole group, not one paragraph per option — the distinction that
					    matters is column-join vs declared link, and the heading above already says it. */}
					<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
						Joins on a column, so unresolved rows count as unlinked.
					</p>
				</>
			) : null}

			<div className="wwc:mt-3 wwc:flex wwc:flex-wrap">
				<AnalysisOption selected={!spec.traverse} onSelect={() => setSpec({traverse: null})}>
					no traversal
				</AnalysisOption>
			</div>

			{elsewhere.length > 0 ? (
				<p className="wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
					{typeId} declares other links, but this stage resolves {TRAVERSAL_TARGET} rows — they would join nothing.
				</p>
			) : null}
		</div>
	);
}

/**
 * OBJECT ANALYSIS — the perspective's first builder tab.
 *
 * `onDetailChange` is accepted by the props type and deliberately unused: no Analysis surface drills
 * into a record, so there is no breadcrumb tail to report.
 */
export function ObjectAnalysisView({session, onSessionChange, onNavigate}: Wc3AnalysisViewProps): ReactElement {
	return (
		<AnalysisWorkbench
			mode="object"
			session={session}
			onSessionChange={onSessionChange}
			onNavigate={onNavigate}
			renderSourceConfig={(ctx) => <ObjectSourceConfig ctx={ctx} onNavigate={onNavigate} />}
			renderTraverseConfig={(ctx) => <ObjectTraverseConfig ctx={ctx} />}
		/>
	);
}
