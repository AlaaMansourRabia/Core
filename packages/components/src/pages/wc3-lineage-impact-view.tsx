import {useState} from "react";

import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Combobox} from "../combobox";
import {MetricCard} from "../metric-card";
import {usePersistentState} from "../use-persistent-state";
import {
	WC3_PROJECTION_USAGE,
	getLineageProcess,
	getPipeline,
	impactFor,
	type Wc3LineageProcess,
} from "./wc3-lineage-data";
import {LineageGlyph, Pane, lineageNav, useDetailLabel, type LineageViewProps} from "./wc3-lineage-shared";
import {
	WC3_ACTION_TYPES,
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	getInterface,
	getObjectType,
	instanceCount,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

const OBJECT_TYPE_OPTIONS = WC3_OBJECT_TYPES.map((ot) => ({
	value: ot.id,
	label: ot.displayName,
	icon: <OntologyGlyph name={ot.icon} color={ot.color} className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0" />,
}));

// Lineage › Impact (what-if) — the third tab of the Lineage perspective, ported from the
// unified-workspace prototype's "m7-lineage.js" LineageImpact view.
//
// The six lists and their counts come from WC3_IMPACT (captured verbatim from the prototype's own
// impactOf(), the same helper its delete guards use) rather than being re-derived here: the counts
// are headline figures and a partial re-derivation would drift from the numbers the prototype was
// reviewed against. Only the per-process caption is derived live, which is why a process can sit in
// the precomputed list and still read "(declared touchpoint)" — that is correct, not a bug.

/** Impact accepts a routed object-type id — the port of the prototype's /lineage/impact/<id> route. */
export type LineageImpactProps = LineageViewProps & {
	/**
	 * Deep-linked object type. The shell does not pass it today; it stays optional so the component
	 * is still assignable to LINEAGE_VIEWS' value type. A routed id wins over the remembered one.
	 */
	objectTypeId?: string;
};

const ACTION_TYPE_BY_ID = new Map(WC3_ACTION_TYPES.map((a) => [a.id, a]));
const LINK_TYPE_BY_ID = new Map(WC3_LINK_TYPES.map((l) => [l.id, l]));

/**
 * Does any action type reachable from this process's transitions point at the type?
 *
 * `parameters` is typed with an index signature but carries an `objectTypeId` (including literal
 * `null`s), so the id has to be read through a cast. `rules` is a union — an array of CRUD/link
 * rules OR one exclusive function rule — so it must be narrowed before it can be walked.
 */
function transitionsTouch(process: Wc3LineageProcess, otId: string): boolean {
	return process.transitions.some((t) => {
		const at = ACTION_TYPE_BY_ID.get(t.actionTypeId);
		if (!at) return false;
		const viaParam = at.parameters.some((p) => (p as {objectTypeId?: string | null}).objectTypeId === otId);
		const viaRule = Array.isArray(at.rules) && at.rules.some((r) => r.objectTypeId === otId);
		return viaParam || viaRule;
	});
}

function processCaption(process: Wc3LineageProcess, otId: string): string {
	if (process.objectTypeId === otId) return "(maps this type's lifecycle)";
	if (transitionsTouch(process, otId)) return "(transition actions touch it)";
	return "(declared touchpoint)";
}

/** One clickable record line: glyph, a link-styled control, and an optional muted caption. */
function ImpactLine({
	icon,
	label,
	caption,
	onOpen,
}: {
	icon: string;
	label: string;
	caption?: string;
	onOpen: () => void;
}) {
	return (
		<div className="wwc:flex wwc:min-w-0 wwc:flex-wrap wwc:items-center wwc:gap-1.5">
			<LineageGlyph name={icon} />
			<Button
				variant="link"
				size="sm"
				className="wwc:h-auto wwc:min-w-0 wwc:justify-start wwc:whitespace-normal wwc:p-0 wwc:text-left wwc:text-xs"
				onClick={onOpen}
			>
				{label}
			</Button>
			{caption && <span className="wwc:text-xs wwc:text-muted-foreground">{caption}</span>}
		</div>
	);
}

function EmptyLine({children}: {children: React.ReactNode}) {
	return <p className="wwc:text-xs wwc:text-muted-foreground">{children}</p>;
}

/** The full-width rule between two sections of a card body. Rendered even when a side is empty. */
function Divider() {
	return <div className="wwc:my-2 wwc:border-t wwc:border-border" />;
}

export function LineageImpactView({onDetailChange, onNavigate, objectTypeId}: LineageImpactProps = {}) {
	// The tab unmounts on every perspective/tab switch, so plain useState would lose the choice.
	// Persisting it is what makes "leave the tab and come back" reuse the last-picked type.
	const [remembered, setRemembered] = usePersistentState<string | null>("wc3.lineage.impact.type", null);
	// A pick made in this session outranks the routed id — otherwise a deep link to a deleted type
	// would leave the picker inert, and its banner tells the reader to "pick another type above".
	const [picked, setPicked] = useState<string | null>(null);

	const rememberedType = remembered ? getObjectType(remembered) : undefined;
	const selectedId = picked ?? objectTypeId ?? rememberedType?.id ?? WC3_OBJECT_TYPES[0]?.id ?? null;
	const selected = selectedId ? getObjectType(selectedId) : undefined;

	// The top bar owns the breadcrumb, so the picked type has to be reported upward.
	useDetailLabel(selected?.displayName ?? null, onDetailChange);

	const choose = (id: string) => {
		setPicked(id);
		setRemembered(id);
	};

	// Nothing to compute a blast radius for — no picker, no banner, just the one line.
	if (WC3_OBJECT_TYPES.length === 0)
		return (
			<Pane>
				<Card>
					<CardContent className="wwc:pt-6">
						<p className="wwc:text-sm wwc:text-muted-foreground">
							No object types exist — nothing to compute impact for.
						</p>
					</CardContent>
				</Card>
			</Pane>
		);

	const picker = (hint: boolean) => (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
			<span className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
				What-if: delete / change
			</span>
			{/*
			 * Combobox, not Select: with 16 object types the list is long enough to want typing, and
			 * SelectTrigger is bg-transparent, which reads as an unfilled gap against the pane. The
			 * Combobox trigger is a Button variant="outline" — bg-card, so it is a solid surface in
			 * light mode and the right one in dark. Options carry the type's glyph via the optional
			 * `icon` field, so nothing is lost against the prototype's icon-beside-name dropdown.
			 */}
			<Combobox
				className="wwc:w-64"
				popoverClassName="wwc:w-64"
				value={selected?.id ?? ""}
				onValueChange={choose}
				placeholder="Pick an object type…"
				searchPlaceholder="Search object types…"
				emptyMessage="No object type matches."
				/* Store order, not alphabetical — the prototype lists them exactly as seeded. */
				options={OBJECT_TYPE_OPTIONS}
			/>
			{hint && (
				<span className="wwc:text-xs wwc:text-muted-foreground">
					— blast radius from the live reference graph plus declared touchpoints (same helpers that guard deletes)
				</span>
			)}
		</div>
	);

	// A routed id that resolves to nothing: picker (placeholder, no trailing hint) and one banner.
	if (!selected)
		return (
			<Pane>
				{picker(false)}
				<Banner
					variant="warning"
					title="Object type no longer exists"
					description={`${selectedId} was deleted or never seeded. Its blast radius cannot be computed. Pick another type above to continue.`}
				/>
			</Pane>
		);

	const impact = impactFor(selected.id);
	const tiles = [
		{label: "pipelines", value: impact.pipelines.length},
		{label: "processes", value: impact.processes.length},
		{label: "actions", value: impact.actions.length},
		{label: "link types", value: impact.linkTypes.length},
		{label: "interface constraints", value: impact.interfaces.length},
		{label: "projections", value: impact.projections.length},
	];

	// Banner takes plain strings, so the prototype's inline <b> emphasis is dropped rather than
	// hand-rolling an amber div out of light-mode hex — reuse beats fidelity here.
	const sentence =
		`Deleting “${selected.displayName}” touches ${impact.pipelines.length} pipeline(s), ` +
		`${impact.processes.length} process(es), ${impact.actions.length} action(s), ` +
		`${impact.linkTypes.length} link type(s), ${impact.interfaces.length} interface constraint(s) and ` +
		`${impact.projections.length} projection(s), plus ${instanceCount(selected.id)} live instance row(s).`;

	return (
		<Pane>
			{picker(true)}

			<Banner variant="warning" title={sentence} />

			<div className="wwc:grid wwc:gap-2.5 wwc:grid-cols-2 wwc:md:grid-cols-3 wwc:xl:grid-cols-6">
				{tiles.map((t) => (
					<MetricCard key={t.label} title={t.label} value={t.value} />
				))}
			</div>

			<div className="wwc:grid wwc:items-start wwc:gap-3.5 wwc:grid-cols-1 wwc:lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle className="wwc:text-sm">Pipelines &amp; processes</CardTitle>
					</CardHeader>
					<CardContent>
						{impact.pipelines.length === 0 ? (
							<EmptyLine>no pipelines reference it</EmptyLine>
						) : (
							<div className="wwc:space-y-1">
								{impact.pipelines.map((id) => {
									const pipeline = getPipeline(id);
									return (
										<ImpactLine
											key={id}
											icon={pipeline?.icon ?? "pipeline"}
											label={pipeline?.name ?? id}
											caption="(sink target or node reference)"
											onOpen={() => onNavigate?.(lineageNav.pipeline(id))}
										/>
									);
								})}
							</div>
						)}

						{/* Always rendered, even when one side is empty — the prototype draws it unconditionally. */}
						<Divider />

						{impact.processes.length === 0 ? (
							<EmptyLine>no processes reference it</EmptyLine>
						) : (
							<div className="wwc:space-y-1">
								{impact.processes.map((id) => {
									const process = getLineageProcess(id);
									return (
										<ImpactLine
											key={id}
											icon="process"
											label={process?.name ?? id}
											caption={process ? processCaption(process, selected.id) : undefined}
											onOpen={() => onNavigate?.(lineageNav.process(id))}
										/>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="wwc:text-sm">Actions, links, interfaces &amp; projections</CardTitle>
					</CardHeader>
					<CardContent>
						{impact.actions.length === 0 ? (
							<EmptyLine>no actions reference it</EmptyLine>
						) : (
							<div className="wwc:space-y-1">
								{impact.actions.map((id) => (
									<ImpactLine
										key={id}
										icon="bolt"
										label={ACTION_TYPE_BY_ID.get(id)?.displayName ?? id}
										onOpen={() => onNavigate?.(lineageNav.actionType(id))}
									/>
								))}
							</div>
						)}

						<Divider />

						{impact.linkTypes.length === 0 ? (
							<EmptyLine>no link types</EmptyLine>
						) : (
							<div className="wwc:space-y-1">
								{impact.linkTypes.map((id) => {
									const lt = LINK_TYPE_BY_ID.get(id);
									return (
										<ImpactLine
											key={id}
											icon="link"
											// Not linkTypeLabel() — that joins the two sides with " / "; the prototype's
											// impact list reads them as a two-way relationship.
											label={lt ? `${lt.sideA.displayName} ↔ ${lt.sideB.displayName}` : id}
											onOpen={() => onNavigate?.(lineageNav.linkType(id))}
										/>
									);
								})}
							</div>
						)}

						{/* Omitted entirely when empty — this block has no empty text of its own. */}
						{impact.interfaces.length > 0 && (
							<>
								<Divider />
								<div className="wwc:space-y-1">
									{impact.interfaces.map((id) => (
										<ImpactLine
											key={id}
											icon="puzzle"
											label={getInterface(id)?.displayName ?? id}
											caption="(link constraint)"
											onOpen={() => onNavigate?.(lineageNav.interface(id))}
										/>
									))}
								</div>
							</>
						)}

						<Divider />

						{impact.projections.length === 0 ? (
							<EmptyLine>no projections consume it</EmptyLine>
						) : (
							/* Chips, not links — the prototype's projection chips are the one inert row here. */
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
								{impact.projections.map((key) => {
									const projection = WC3_PROJECTION_USAGE[key];
									return (
										<Badge key={key} variant="neutralSoft" className="wwc:font-normal">
											<LineageGlyph name={projection?.icon ?? "box"} />
											{projection?.label ?? key}
										</Badge>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</Pane>
	);
}
