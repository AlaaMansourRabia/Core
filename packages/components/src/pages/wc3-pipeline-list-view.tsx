import type {ColumnDef, Row} from "@tanstack/react-table";
import type {ReactElement, ReactNode} from "react";

import {cn} from "@corensystem/coren-utils";
import {ArrowUpRight, Play, Plus, Search, Share2, TriangleAlert} from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {CatalogueCardGrid, CatalogueViewToggle, useCatalogueViewMode} from "../catalogue-view-toggle";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Empty} from "../empty";
import {Filter, FilterCategory, FilterContent, FilterOption, FilterTrigger, type FilterValue} from "../filter";
import {FormDialog, FormDialogField, FormDialogNote} from "../form-dialog";
import {Input} from "../input";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {HoverTooltip} from "../tooltip";
import {usePersistentState} from "../use-persistent-state";
import {Wc3FsPathLabel} from "./wc3-fs-path-label";
import {wc3FsLocationOf} from "./wc3-fs-store";
import type {Wc3Pipeline} from "./wc3-lineage-data";
import {LineageGlyph, Mono, Pane, useDetailLabel, useOpenRecord} from "./wc3-lineage-shared";
import {PipelineDetail} from "./wc3-pipeline-detail";
import {
	PipelineGlyph,
	PortDot,
	WC3_PIPELINE_ICONS,
	type Wc3PipelineDraft,
	type Wc3PipelineFacts,
	type Wc3PipelineViewProps,
	createPipeline,
	nodeKindLabel,
	pipelineFacts,
	pipelineSearchText,
	replacePipeline,
	runPipeline,
} from "./wc3-pipeline-shared";

// The Pipelines perspective's entry point: the list/card catalogue, the "New pipeline" dialog it
// owns, and the drill-in into one pipeline's editable canvas.
//
// This DIFFERS from the prototype on purpose. The prototype is ONE builder page for a pipeline
// chosen from a header dropdown, with the palette as a sidebar. Here the LIST is the entry point,
// the builder is its drill-in, and the palette and the run log are tabs of their own.
//
// Nothing in this file reads WC3_PIPELINES. The live array arrives on props and every mutation is
// committed back through `onPipelinesChange` — a fixture-bound lookup (`getPipeline`) would keep
// reporting the seeded three the instant the session creates or runs one, exactly the trap
// wc3-product-catalogue-view.tsx:271-275 documents for installs.

// ─── Filter facet labels ─────────────────────────────────────────────────────

const RUN_STATE_LABEL: Record<string, string> = {never: "Never run", session: "Run in session"};

// ─── Shared cell/card fragments ──────────────────────────────────────────────

/** The pipeline's own glyph in the same 28px tile the product catalogue uses for its identity cell. */
function PipelineTile({pipeline}: {pipeline: Wc3Pipeline}): ReactElement {
	return (
		<span className="wwc:flex wwc:size-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40">
			<PipelineGlyph pipeline={pipeline} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
		</span>
	);
}

function Chip({children, title}: {children: ReactNode; title?: string}) {
	return (
		<span
			title={title}
			className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:px-1.5 wwc:py-0.5 wwc:text-[10.5px] wwc:text-muted-foreground"
		>
			{children}
		</span>
	);
}

/**
 * What this pipeline writes: one badge per sync sink resolved to its object type's display name,
 * plus a distinct chip per topic sink naming the topic.
 *
 * The topic chip is NOT decoration — pipe_tel's `presence_events` sink carries no `targetOt`, so
 * without it the only thing that pipeline emits would vanish from both the column and the card.
 */
function SyncChips({facts}: {facts: Wc3PipelineFacts}): ReactElement {
	if (facts.syncTargets.length === 0 && facts.topicSinks.length === 0) {
		return <span className="wwc:text-muted-foreground">—</span>;
	}
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
			{facts.syncTargets.map((s) => (
				<Badge key={s.nodeId} variant="infoSoft" title={`${s.nodeLabel} syncs into ${s.displayName}`}>
					{s.displayName}
				</Badge>
			))}
			{facts.topicSinks.map((t) => (
				<Chip key={t.nodeId} title="Stream topic sink — emits events, writes no object type">
					<Share2 className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
					{t.topic}
				</Chip>
			))}
		</span>
	);
}

/** The distinct port types the graph carries, in legend order. Labelled on the card, dots-only in the table. */
function PortTypes({facts, labelled}: {facts: Wc3PipelineFacts; labelled?: boolean}): ReactElement {
	if (facts.portTypes.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-2.5 wwc:gap-y-1">
			{facts.portTypes.map((type) => (
				<span key={type} className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
					<PortDot type={type} />
					{labelled ? type : null}
				</span>
			))}
		</span>
	);
}

/**
 * Structural HINTS from pipelineFacts — never errors, and never escalated to one. Both of the two
 * rules fire on the shipped fixture (pipe_bim's QTO output has no consumer anywhere in the palette;
 * pipe_tel ships two disconnected source chains) and both are legal graphs.
 */
function HealthHint({facts}: {facts: Wc3PipelineFacts}): ReactElement {
	if (facts.healthNotes.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	return (
		<HoverTooltip
			content={
				<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
					{facts.healthNotes.map((note) => (
						<span key={note}>{note}</span>
					))}
				</span>
			}
		>
			<Badge variant="warningSoft">
				<TriangleAlert />
				{facts.healthNotes.length === 1 ? "1 hint" : `${facts.healthNotes.length} hints`}
			</Badge>
		</HoverTooltip>
	);
}

/** "Never run" until something is run in-session — the honest zero, on both the card and the table. */
function RunStateBadge({facts}: {facts: Wc3PipelineFacts}): ReactElement {
	if (facts.runCount === 0) return <Badge variant="neutralSoft">Never run</Badge>;
	return <Badge variant="successSoft">{`${facts.runCount} run${facts.runCount === 1 ? "" : "s"}`}</Badge>;
}

// ─── Row / card actions ──────────────────────────────────────────────────────

type PipelineActions = {onRun: (id: string) => void; onOpen: (id: string) => void};

// ─── Card ────────────────────────────────────────────────────────────────────

/**
 * One catalogue card. It carries every fact the table row carries — plus the description, which is
 * the one column that ships hidden. Table-only facts: none. Card-only facts: none. That is the bar
 * the toggle has to clear to be lossless.
 */
function PipelineCard({
	pipeline,
	facts,
	onRun,
	onOpen,
}: {pipeline: Wc3Pipeline; facts: Wc3PipelineFacts} & PipelineActions) {
	const open = () => onOpen(pipeline.id);
	return (
		// role="button" rather than a real <button> so the footer's Run button can nest legally — the
		// same trade-off ProductCard makes. Enter/Space are wired by hand.
		<Card
			role="button"
			tabIndex={0}
			data-pipeline-card={pipeline.id}
			title={`Open ${pipeline.name}`}
			onClick={open}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					open();
				}
			}}
			className="wwc:flex wwc:cursor-pointer wwc:flex-col wwc:gap-2 wwc:rounded-lg wwc:p-3 wwc:text-left wwc:transition-colors wwc:hover:bg-accent/40 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
		>
			<div className="wwc:flex wwc:items-start wwc:gap-2">
				<PipelineTile pipeline={pipeline} />
				<div className="wwc:min-w-0 wwc:flex-1">
					<div className="wwc:truncate wwc:text-sm wwc:font-semibold">{pipeline.name}</div>
					<Mono>{`${pipeline.id} · rev ${pipeline.dropRev}`}</Mono>
					<Wc3FsPathLabel perspectiveId="pipelines" recordId={pipeline.id} className="wwc:mt-0.5" />
				</div>
				<RunStateBadge facts={facts} />
			</div>

			{/* The card's advantage over the table, where `description` ships hidden. */}
			<p className="wwc:line-clamp-2 wwc:text-xs wwc:text-foreground">{pipeline.desc}</p>

			<p className="wwc:text-xs wwc:text-muted-foreground wwc:tabular-nums">
				{`${facts.nodeCount} nodes · ${facts.wireCount} wires · ${facts.sourceCount} source${
					facts.sourceCount === 1 ? "" : "s"
				} · ${facts.runCount} runs`}
			</p>

			<SyncChips facts={facts} />
			<PortTypes facts={facts} labelled />

			{facts.healthNotes.length > 0 && (
				<p className="wwc:flex wwc:items-start wwc:gap-1.5 wwc:text-xs wwc:text-amber-600">
					<TriangleAlert className="wwc:mt-0.5 wwc:h-3 wwc:w-3 wwc:shrink-0" />
					<span>{facts.healthNotes.join(" ")}</span>
				</p>
			)}

			<div className="wwc:mt-auto wwc:flex wwc:items-center wwc:gap-1.5 wwc:pt-1">
				{facts.lastRun ? <Mono>{`last run ${facts.lastRun.at}`}</Mono> : null}
				<span className="wwc:flex-1" />
				<Button
					variant="ghost"
					size="sm"
					onClick={(e) => {
						e.stopPropagation();
						onRun(pipeline.id);
					}}
				>
					<Play />
					Run pipeline
				</Button>
			</div>
		</Card>
	);
}

// ─── Empty state ─────────────────────────────────────────────────────────────

/**
 * ONE definition, passed to the DataTable's `emptyMessage` AND returned from the card grid's empty
 * branch, so the two view modes cannot drift apart.
 *
 * It has two readings because there are two ways to reach zero rows: a filter that matches nothing,
 * and a catalogue a user has genuinely emptied. Only the second offers "New pipeline".
 */
function PipelinesEmptyState({
	hasAny,
	onClear,
	onNew,
}: {
	hasAny: boolean;
	onClear: () => void;
	onNew: () => void;
}): ReactElement {
	if (!hasAny) {
		return (
			<Empty
				icon={<Share2 className="wwc:h-6 wwc:w-6" />}
				title="No pipelines yet"
				description="A pipeline wires typed source, transform and sink nodes into an acyclic graph. Create one and the canvas opens empty, with the palette as the way forward."
				action={
					<Button onClick={onNew}>
						<Plus />
						New pipeline
					</Button>
				}
			/>
		);
	}
	return (
		<Empty
			icon={<Search className="wwc:h-6 wwc:w-6" />}
			title="No pipelines match"
			description="Nothing in this catalogue matches the current search and filter."
			action={
				<Button variant="outline" onClick={onClear}>
					<Search />
					Clear the filter
				</Button>
			}
		/>
	);
}

// ─── New pipeline dialog ─────────────────────────────────────────────────────

/**
 * "New pipeline from scratch" — net-new work: the prototype has NO create, delete or rename
 * pipeline affordance anywhere (verified by grep). The modal shell, the "never disable Create"
 * required-field idiom and the reset-on-close rule are all FormDialog's, so this file carries only
 * what is specific to a pipeline.
 *
 * It hands back a DRAFT; the caller builds the record with createPipeline() and drills straight in,
 * the same shape wc3-ontology-views.tsx:375-379 uses for a new object type group.
 */
function NewPipelineDialog({
	open,
	onOpenChange,
	onCreate,
	locationField,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreate: (draft: Wc3PipelineDraft) => void;
	/** The file system's "where does this go?", supplied by the shell. See Wc3FsLinkProps. */
	locationField?: React.ReactNode;
}) {
	const [name, setName] = useState("");
	const [desc, setDesc] = useState("");
	const [icon, setIcon] = useState(WC3_PIPELINE_ICONS[0] ?? "pipeline");

	const valid = name.trim().length > 0;

	const reset = () => {
		setName("");
		setDesc("");
		setIcon(WC3_PIPELINE_ICONS[0] ?? "pipeline");
	};

	return (
		<FormDialog
			open={open}
			onOpenChange={onOpenChange}
			title="New pipeline"
			valid={valid}
			hint="Name it, then create."
			error="Name required."
			submitLabel="Create pipeline"
			onSubmit={() => onCreate({name: name.trim(), desc: desc.trim(), icon})}
			onReset={reset}
		>
			{/* First, because where a thing goes is decided before what it is called is worth typing. */}
			{locationField && <FormDialogField label="Location">{locationField}</FormDialogField>}
			<FormDialogField label="Name" invalid={!valid}>
				{({invalid, id}) => (
					<Input
						id={id}
						value={name}
						placeholder="e.g. Site photo intake — captures → observations"
						onChange={(e) => setName(e.target.value)}
						aria-invalid={invalid}
						className={cn(invalid && "wwc:border-destructive")}
					/>
				)}
			</FormDialogField>
			<FormDialogField label="Description">
				{({id}) => <Textarea id={id} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />}
			</FormDialogField>
			<FormDialogField label="Icon" className="wwc:space-y-2">
				{({labelId}) => (
					<ToggleGroup
						type="single"
						value={icon}
						// A group is not a labelable control, so the caption names it by id rather than `htmlFor`.
						aria-labelledby={labelId}
						// Radix emits "" when the active item is pressed again; a pipeline always has an
						// icon, so a de-select is swallowed the same way the view-mode toggle swallows it.
						onValueChange={(next) => {
							if (next) setIcon(next);
						}}
						variant="outline"
						size="sm"
						className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
					>
						{WC3_PIPELINE_ICONS.map((name_) => (
							<ToggleGroupItem key={name_} value={name_} aria-label={name_} title={name_}>
								<LineageGlyph name={name_} />
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
			</FormDialogField>
			<FormDialogNote>
				It starts empty — no nodes, no wires, drop rev 1 — and opens on its canvas, where the palette adds the first
				node.
			</FormDialogNote>
		</FormDialog>
	);
}

// ─── View ────────────────────────────────────────────────────────────────────

export function PipelineListView({
	pipelines,
	onPipelinesChange,
	onDetailChange,
	onNavigate,
	openRecordId,
	onOpenRecordConsumed,
	onShowInFiles,
	createLocationField,
	onRecordCreated,
}: Wc3PipelineViewProps) {
	const [filters, setFilters] = useState<FilterValue>({});
	// Controlled so the empty state's "Clear the filter" can clear the query as well as the facets.
	const [query, setQuery] = useState("");
	// Persisted, because switching to the Palette or Runs tab UNMOUNTS this whole surface: the shell
	// resolves exactly one PIPELINE_VIEWS entry per render. Both must survive that round trip.
	const [mode, setMode] = useCatalogueViewMode("wc3.pipelines.view");
	const [openId, setOpenId] = usePersistentState<string | null>("wc3.pipelines.open", null);
	const [newOpen, setNewOpen] = useState(false);

	// The not-found guard is mandatory, not defensive: `openId` survives a reload in localStorage
	// while the pipeline array does not, so a session-created id comes back dangling.
	const open = openId ? (pipelines.find((p) => p.id === openId) ?? null) : null;
	useDetailLabel(open?.name ?? null, onDetailChange);

	// Derived once per commit and shared by the columns, the cards and the facet counts, so the three
	// can never disagree about how many wires a pipeline has.
	const factsById = useMemo(() => new Map(pipelines.map((p) => [p.id, pipelineFacts(p)] as const)), [pipelines]);
	const factsOf = useCallback((p: Wc3Pipeline) => factsById.get(p.id) ?? pipelineFacts(p), [factsById]);

	const openPipeline = useCallback((id: string) => setOpenId(id), [setOpenId]);

	// Arriving from the file system: the file's ref named this pipeline, so open it rather than
	// dropping the user on the list and making them find it again.
	useOpenRecord(openRecordId, (id) => pipelines.some((p) => p.id === id), openPipeline, onOpenRecordConsumed);

	const runOne = useCallback(
		(id: string) => {
			const pipeline = pipelines.find((p) => p.id === id);
			if (!pipeline) return;
			onPipelinesChange(replacePipeline(pipelines, runPipeline(pipeline).pipeline));
		},
		[pipelines, onPipelinesChange],
	);

	const createFromDraft = useCallback(
		(draft: Wc3PipelineDraft) => {
			const created = createPipeline(draft);
			onPipelinesChange([...pipelines, created]);
			// The shell files it at whatever the Location field chose, so a pipeline made here is as
			// findable as one made in Files.
			onRecordCreated?.(created.id, created.name);
			// Straight into the (empty) canvas — the palette there is the only way to add a node.
			setOpenId(created.id);
		},
		[pipelines, onPipelinesChange, onRecordCreated, setOpenId],
	);

	const clearAll = useCallback(() => {
		setFilters({});
		setQuery("");
	}, []);

	// ── Facets. Three only, counted off the LIVE array — a pipeline created this session has no
	// sinks, no sources and no runs, and must be counted as such rather than silently invisible.
	//
	// Deliberately NOT shipped, so the popover is not padded:
	//   · Node category — Sources/Transforms/Sinks each select all three rows; only BHoM
	//     discriminates, and it does so as a worse proxy for "the BIM one" than Source kind.
	//   · Drop rev — every pipeline ships rev 1, so it is a single-option facet that filters
	//     nothing. It stays a VISIBLE COLUMN instead, which is where the in-session bump shows.
	//   · Port types carried — Objects and Table select everything; Geometry and Stream restate
	//     one Source kind option each.
	//   · Has topic sink — a real 1-of-3 split, but the syncs column and the card chip already
	//     expose it and it is too narrow to earn a slot.
	const syncOptions = useMemo(() => {
		const counts = new Map<string, {displayName: string; count: number}>();
		for (const p of pipelines) {
			// A pipeline that syncs the same type from two nodes still counts once.
			const seen = new Set<string>();
			for (const s of factsOf(p).syncTargets) {
				if (!s.otId || seen.has(s.otId)) continue;
				seen.add(s.otId);
				const entry = counts.get(s.otId);
				if (entry) entry.count += 1;
				else counts.set(s.otId, {displayName: s.displayName, count: 1});
			}
		}
		return [...counts.entries()].sort((a, b) => a[1].displayName.localeCompare(b[1].displayName));
	}, [pipelines, factsOf]);

	const sourceKindOptions = useMemo(() => {
		const counts = new Map<string, number>();
		for (const p of pipelines) {
			for (const kindId of new Set(factsOf(p).sourceKinds)) counts.set(kindId, (counts.get(kindId) ?? 0) + 1);
		}
		return [...counts.entries()].sort((a, b) => nodeKindLabel(a[0]).localeCompare(nodeKindLabel(b[0])));
	}, [pipelines, factsOf]);

	const runCounts = useMemo(() => {
		const ran = pipelines.filter((p) => p.runs.length > 0).length;
		return {ran, never: pipelines.length - ran};
	}, [pipelines]);

	// ONE predicate for both view modes — the toggle changes what DataTable's body renders, never
	// what it filters.
	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return pipelines.filter((p) => {
			if (needle && !pipelineSearchText(p).toLowerCase().includes(needle)) return false;
			const facts = factsOf(p);
			const syncs = filters.syncsObjectType;
			if (syncs && syncs.length > 0 && !facts.syncTargets.some((s) => syncs.includes(s.otId))) return false;
			const runState = filters.runState;
			if (runState && runState.length > 0 && !runState.includes(facts.runCount > 0 ? "session" : "never")) return false;
			const sourceKind = filters.sourceKind;
			if (sourceKind && sourceKind.length > 0 && !facts.sourceKinds.some((k) => sourceKind.includes(k))) return false;
			return true;
		});
	}, [pipelines, query, filters, factsOf]);

	const columns: ColumnDef<Wc3Pipeline, unknown>[] = useMemo(
		() => [
			{
				// Ids are space-separated lowercase on purpose: the column-toggle popover capitalises
				// `column.id`, so "portTypes" would read "PortTypes" in the list.
				id: "pipeline",
				accessorFn: (p) => p.name,
				header: ({column}) => <DataTableColumnHeader column={column} title="Pipeline" />,
				enableHiding: false,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:whitespace-nowrap">
						<PipelineTile pipeline={row.original} />
						<span className="wwc:min-w-0">
							{/* The drill-in affordance is this button, not a whole-row onClick. */}
							<HoverTooltip content={row.original.desc}>
								<button
									type="button"
									onClick={() => openPipeline(row.original.id)}
									className="wwc:block wwc:truncate wwc:text-left wwc:font-medium wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
								>
									{row.original.name}
								</button>
							</HoverTooltip>
							<Mono>{row.original.id}</Mono>
						</span>
					</span>
				),
			},
			{
				id: "location",
				accessorFn: (p) => wc3FsLocationOf("pipelines", p.id)?.path ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="Location" />,
				cell: ({row}) => (
					<Wc3FsPathLabel perspectiveId="pipelines" recordId={row.original.id} onOpenFolder={onShowInFiles} />
				),
			},
			{
				// Hidden by default — every description is 90+ chars and the shared Table is table-fixed,
				// so it would squeeze every other column. It still participates in the search predicate
				// regardless of visibility, and the card body shows it in full.
				id: "description",
				accessorFn: (p) => p.desc,
				header: "Description",
				cell: ({row}) => <span className="wwc:text-xs wwc:text-muted-foreground">{row.original.desc}</span>,
			},
			{
				id: "nodes",
				accessorFn: (p) => p.nodes.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Nodes" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.nodes.length,
			},
			{
				id: "wires",
				accessorFn: (p) => p.wires.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Wires" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => row.original.wires.length,
			},
			{
				// The highest-value column: it answers "what feeds Workers?", and it is the same edge
				// Lineage and the ontology's Impact view traverse.
				id: "syncs",
				accessorFn: (p) =>
					pipelineFacts(p)
						.syncTargets.map((s) => s.displayName)
						.join(" "),
				header: ({column}) => <DataTableColumnHeader column={column} title="Syncs" />,
				cell: ({row}) => <SyncChips facts={factsOf(row.original)} />,
			},
			{
				id: "sources",
				accessorFn: (p) => pipelineFacts(p).sourceCount,
				header: ({column}) => <DataTableColumnHeader column={column} title="Sources" />,
				meta: {headerClassName: "wwc:text-right", cellClassName: "wwc:text-right wwc:tabular-nums"},
				cell: ({row}) => {
					const facts = factsOf(row.original);
					if (facts.sourceCount === 0) return <span className="wwc:text-muted-foreground">—</span>;
					return (
						<HoverTooltip
							content={
								<span className="wwc:flex wwc:flex-col wwc:gap-0.5">
									{facts.sourceLabels.map((label) => (
										<span key={label}>{label}</span>
									))}
								</span>
							}
						>
							<span>{facts.sourceCount}</span>
						</HoverTooltip>
					);
				},
			},
			{
				// Hidden by default: a cross-tab link to the Palette's legend, not a fact three rows need
				// on screen at all times.
				id: "port types",
				accessorFn: (p) => pipelineFacts(p).portTypes.join(" "),
				header: "Port types",
				cell: ({row}) => <PortTypes facts={factsOf(row.original)} />,
			},
			{
				// Kept VISIBLE even though all three seeded rows read rev 1: the detail page's "Receive new
				// IFC drop" bumps pipe_bim to rev 2 in-session, and this column is where that lands.
				id: "drop rev",
				accessorFn: (p) => p.dropRev,
				header: ({column}) => <DataTableColumnHeader column={column} title="Drop rev" />,
				cell: ({row}) => <Mono>{`rev ${row.original.dropRev}`}</Mono>,
			},
			{
				id: "runs",
				accessorFn: (p) => p.runs.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Runs" />,
				cell: ({row}) => {
					const facts = factsOf(row.original);
					// "—" on every row until something is run in-session. The fixture ships zero runs and
					// none are invented.
					if (!facts.lastRun) return <span className="wwc:text-muted-foreground">—</span>;
					return (
						<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap wwc:tabular-nums">
							{facts.runCount}
							<Mono>{facts.lastRun.at}</Mono>
						</span>
					);
				},
			},
			{
				id: "health",
				accessorFn: (p) => pipelineFacts(p).healthNotes.length,
				header: ({column}) => <DataTableColumnHeader column={column} title="Health" />,
				cell: ({row}) => <HealthHint facts={factsOf(row.original)} />,
			},
			{
				id: "actions",
				header: "",
				enableSorting: false,
				enableHiding: false,
				// Per DataTable's own doc comment — body cells truncate at max-w-0 by default, which
				// would ellipsise the buttons.
				meta: {cellClassName: "wwc:w-px wwc:max-w-none wwc:whitespace-nowrap"},
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-1">
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label={`Run ${row.original.name}`}
							tooltip="Run pipeline"
							onClick={(e) => {
								e.stopPropagation();
								runOne(row.original.id);
							}}
						>
							<Play />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label={`Open ${row.original.name}`}
							tooltip="Open"
							onClick={(e) => {
								e.stopPropagation();
								openPipeline(row.original.id);
							}}
						>
							<ArrowUpRight />
						</Button>
					</span>
				),
			},
		],
		[factsOf, openPipeline, runOne, onShowInFiles],
	);

	const renderGrid = useCallback(
		(rows: Row<Wc3Pipeline>[]) => {
			// The SAME rows the <Table> would have painted — already filtered, sorted and paginated by
			// the one DataTable this view mounts.
			if (rows.length === 0) {
				return <PipelinesEmptyState hasAny={pipelines.length > 0} onClear={clearAll} onNew={() => setNewOpen(true)} />;
			}
			return (
				<CatalogueCardGrid data-pipelines-catalogue={rows.length}>
					{rows.map((row) => (
						<PipelineCard
							key={row.id}
							pipeline={row.original}
							facts={factsOf(row.original)}
							onRun={runOne}
							onOpen={openPipeline}
						/>
					))}
				</CatalogueCardGrid>
			);
		},
		[pipelines.length, clearAll, factsOf, runOne, openPipeline],
	);

	return (
		<>
			{/*
			 * Unconditional SIBLING of the drill-in, not a child of the catalogue branch: an early
			 * `if (open) return <PipelineDetail/>` would unmount the dialog the moment a pipeline is
			 * open, and the empty catalogue's "New pipeline" action would open nothing.
			 */}
			<NewPipelineDialog
				open={newOpen}
				onOpenChange={setNewOpen}
				onCreate={createFromDraft}
				locationField={createLocationField}
			/>

			{/*
			 * PipelineDetail is NOT wrapped in Pane. It owns its own layout — a header band above a
			 * canvas/right-rail grid with its own p-6 — so Pane's px-6 would apply the gutter twice and
			 * inset the whole page (measured on the products precedent: 48px right gutter against 24px).
			 */}
			{open ? (
				<PipelineDetail
					// Keyed on the pipeline so the detail's transient builder state (selection, armed wire,
					// refusal banner, run sweep) is dropped when the user crosses from one pipeline to
					// another rather than carrying over — the prototype leaves a refusal on screen after a
					// pipeline switch, and that bug is not ported.
					key={open.id}
					pipeline={open}
					onChange={(next) => onPipelinesChange(replacePipeline(pipelines, next))}
					onBack={() => setOpenId(null)}
					onNavigate={onNavigate}
				/>
			) : (
				<Pane flush>
					{/* No in-content <h1> — the perspective tab bar is the header. */}
					<p className="wwc:pt-4 wwc:text-xs wwc:text-muted-foreground">
						Typed-port graphs that put data into the ontology — open one to wire it, or create one from scratch.
						Everything here is session state: a reload restores the seeded catalogue.
					</p>

					<Filter value={filters} onChange={setFilters}>
						{/*
						 * ONE DataTable is mounted for the life of this view. `mode` appears in exactly two
						 * props — `renderGrid` and `showColumnToggle` — and nowhere else: no `key`, no
						 * conditional render, no second table. The sorting, the page index and the column
						 * visibility all live in useState INSIDE DataTable, so any structure that unmounts it
						 * would reset them; this one structurally cannot. The query and the applied filter are
						 * held above it, here, for the same reason.
						 */}
						<DataTable
							columns={columns}
							data={data}
							search={query}
							onSearchChange={setQuery}
							searchPlaceholder="Filter pipelines…"
							recordLabel="pipeline"
							recordLabelPlural="pipelines"
							pageSize={25}
							flushToolbar
							getRowId={(p) => p.id}
							showColumnToggle={mode === "table"}
							initialColumnVisibility={{description: false, "port types": false}}
							renderGrid={mode === "cards" ? renderGrid : undefined}
							emptyMessage={
								<PipelinesEmptyState hasAny={pipelines.length > 0} onClear={clearAll} onNew={() => setNewOpen(true)} />
							}
							filterChipLabel={(category, value) => {
								if (category === "syncsObjectType") {
									return syncOptions.find(([otId]) => otId === value)?.[1].displayName ?? value;
								}
								if (category === "runState") return RUN_STATE_LABEL[value] ?? value;
								if (category === "sourceKind") return nodeKindLabel(value);
								return value;
							}}
							toolbarExtra={
								<>
									<Button size="sm" onClick={() => setNewOpen(true)}>
										<Plus className="wwc:h-3.5 wwc:w-3.5" />
										New pipeline
									</Button>
									<CatalogueViewToggle value={mode} onValueChange={setMode} />
									<FilterTrigger />
									<FilterContent>
										<FilterCategory value="syncsObjectType" label="Syncs object type">
											{syncOptions.map(([otId, meta]) => (
												<FilterOption key={otId} value={otId}>
													{`${meta.displayName} (${meta.count})`}
												</FilterOption>
											))}
										</FilterCategory>
										{/*
										 * Degenerate at first paint — every seeded pipeline reads "Never run" because the
										 * fixture ships zero runs. It is kept because it is the one facet that becomes
										 * useful purely through use: it is how you find what you just ran.
										 */}
										<FilterCategory value="runState" label="Run state">
											<FilterOption value="never">{`Never run (${runCounts.never})`}</FilterOption>
											<FilterOption value="session">{`Run in session (${runCounts.ran})`}</FilterOption>
										</FilterCategory>
										<FilterCategory value="sourceKind" label="Source kind">
											{sourceKindOptions.map(([kindId, count]) => (
												<FilterOption key={kindId} value={kindId}>
													{`${nodeKindLabel(kindId)} (${count})`}
												</FilterOption>
											))}
										</FilterCategory>
									</FilterContent>
								</>
							}
						/>
					</Filter>
				</Pane>
			)}
		</>
	);
}
