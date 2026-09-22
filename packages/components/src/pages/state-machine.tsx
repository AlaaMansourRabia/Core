import type {ColumnDef} from "@tanstack/react-table";
import type {CSSProperties, ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {
	ArrowLeft,
	ArrowRight,
	ChevronDown,
	ChevronUp,
	CircleDot,
	ClipboardList,
	Clock,
	GitBranch,
	LayoutGrid,
	Plus,
	Rows3,
	Settings2,
	ShieldCheck,
	Trash2,
	TriangleAlert,
	Workflow,
	X,
	XCircle,
} from "lucide-react";
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../accordion";
// React Flow ships its own positioning styles; without these the canvas does not lay out at all.
import {Badge} from "../badge";
import {Banner} from "../banner";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {Combobox} from "../combobox";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {Empty} from "../empty";
// Everything React Flow comes through GraphCanvas — the Core component that owns the
// dependency, its stylesheet and its version. This file names no third-party package, which is the
// point: the canvas is a Core surface, not a React Flow integration that happens to live here.
import type {Connection, Edge, FinalConnectionState, Node, NodeProps} from "../graph-canvas";
import {
	GraphCanvas,
	Handle,
	MarkerType,
	Panel,
	Position,
	useEdgesState,
	useNodesState,
	useReactFlow,
} from "../graph-canvas";
import {Input} from "../input";
import {Label} from "../label";
import {RecordDetailShell} from "../record-detail-shell";
import {type SideMenuGroup} from "../side-menu";
import {Switch} from "../switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";
import {HoverTooltip} from "../tooltip";
import {getObjectType} from "./wc3-ontology-data";
import {PermitPolicySection, WC3_PERMIT_POLICY_INITIAL, type Wc3PermitPolicy} from "./wc3-permit-policy";
import {ProcessBottlenecksSection} from "./wc3-process-bottlenecks";
import {
	CustomTag,
	KindLegend,
	Mono,
	ProcessGlyphTile,
	ProcessProvenanceNote,
	ProductChip,
	ProposedTag,
	SlaModelBadge,
	StateChip,
	StateFlagBadges,
	TransitionKindBadge,
	TypeGlyphLabel,
	WC3_PROCESS_EDIT_INITIAL,
	WC3_PROCESS_ICONS,
	WC3_PROCESS_MESSAGES,
	WC3_PROCESS_STATE_COLORS,
	type Wc3LineageNavTarget,
	type Wc3ProcessEditState,
	type Wc3ProcessFacts,
	type Wc3ProcessInstanceRow,
	type StateMachineAction,
	type Wc3ProcessRecord,
	type Wc3ProcessState,
	type Wc3ProcessStateFlag,
	type Wc3ProcessTransition,
	addState,
	addTransition,
	checkTransition,
	deleteState,
	deleteTransition,
	formatHours,
	lineageNav,
	moveState,
	processFacts,
	processLayout,
	processRowAgeHours,
	processRowKeys,
	processRowOverSla,
	processRowPk,
	processRowSlaHours,
	processRowTitle,
	processSlaModel,
	processStateOf,
	processTokens,
	rebindTransition,
	stateDeleteBlockReason,
	transitionAction,
	updateProcessMeta,
	updateState,
} from "./wc3-process-shared";

// StateMachine — the whole state-machine authoring surface: header band, left section rail, canvas,
// editing panel and validity footer. ONE widget, and the two products that author a state machine
// both mount it: Core Connect V3's process page (variant="connect", via ProcessDetail) and the
// Digital Work Permit template register (variant="work-permit"). Neither owns a copy — the widget is
// the source and the templates are its callers, which is what keeps a fix to the canvas from having
// to be made twice.
//
// Today the ONLY thing that differs between the two cuts is the left rail: which sections, in what
// order, under what labels, and whether General carries the permit fields. That is a table
// (VARIANT_TRAITS), not a branch, so when one product's canvas does need to diverge it becomes a new
// trait row and the other keeps what it had.
//
// Extracted from wc3-process-detail.tsx, which had grown into a page AND an editor in one file. The
// page furniture — the header band, the SideMenu, the Instances / Bottlenecks / Settings sections —
// stayed there; everything that draws or mutates the GRAPH lives here and is the widget. It was
// called ProcessBuilder until the Work Permit cut made "process" the wrong half of the name: what it
// authors is a state machine, whatever the product calls the record.
//
// It is the ONLY surface that mutates a process graph. Every edit routes through a pure helper in
// wc3-process-shared.tsx and is committed with one `onChange(next)`; nothing here writes a state, a
// transition or a layout entry in place.
//
// THREE DOCUMENTED DIVERGENCES FROM THE PROTOTYPE, all deliberate:
//  1. The prototype hides editing behind a P6.edit toggle. Editing is always available here (a
//     drill-in page IS the editor), so there is no mode a user can be in where an edit is invisible.
//  2. The prototype's canvas is a static SVG whose positions are recomputed every render. This one is
//     draggable, so positions live in the record's `layout` and a drag commits through moveState().
//  3. A legal connection drag CREATES the transition on drop, unbound. Everything a transition needs
//     is either derived (key, kind) or came from the drag itself (from, to); the action binding is
//     the single field a drag cannot supply, and it is nullable for exactly this reason. The edge is
//     real, selected, undoable and drawn dashed; lint rule L7 says it is not publishable until it is
//     bound. This used to refuse the drop and pre-fill a form instead — which threw away a gesture
//     the author had already made, for the sake of a field they were about to fill in.
const STATE_CATEGORIES: readonly Wc3ProcessState["category"][] = ["draft", "pending", "active", "terminal"];
const STATE_TYPES: readonly Wc3ProcessState["type"][] = ["initial", "intermediate", "terminal"];
/**
 * How much of a state's identity colour goes into its node.
 *
 * Enough to tell two states apart at a glance and to match the dot the rail prints beside the same
 * state; not enough to fight the default node's own border or to stop the label reading. It is mixed
 * into React Flow's node background, so one number covers light and dark.
 */
const WC3_PROCESS_NODE_TINT = "14%";

// ─── The domain the caller supplies ──────────────────────────────────────────
//
// The widget used to be parameterised on PRESENTATION and hardcoded on DOMAIN: seven props to
// change how it looks and none to change what it shows. Every vocabulary below came from a
// module-level demo fixture compiled into the package, which meant a product with its own action
// types could not bind a transition — the widget rejected its ids as "not in the ontology" — and a
// product with its own rows saw an empty Instances section and a 0 on every node.
//
// They are props now, and they DEFAULT TO EMPTY rather than to the fixture. Empty is the honest
// default for a library: it means "the host has not told me", which is a different thing from "the
// host has these seven permit effects". The demo vocabularies moved to
// `@corensystem/core-ui/pages/state-machine-fixtures`, which the stories import and nothing else does —
// so they stop riding along in every consumer's bundle.
//
// Reaching the deep pieces (both inspectors, both add-forms, the entry lists) through context
// rather than prop-drilling: they are five levels down and every level between them would otherwise
// grow four pass-through props it does not use.

/** One entry in the vocabulary a transition may bind to. Re-exported so consumers need one import. */
export type {StateMachineAction} from "./wc3-process-shared";

/** One entry in the vocabulary a state's entry effects are chosen from. */
export type StateMachineEffect = {id: string; label: string; note?: string};

/** One behavioural flag offered in the state inspector, with the label to show for it. */
export type StateMachineFlagOption = {flag: Wc3ProcessStateFlag; label: string};

type StateMachineData = {
	actions: readonly StateMachineAction[];
	effects: readonly StateMachineEffect[];
	stateFlags: readonly StateMachineFlagOption[];
	instances: readonly Wc3ProcessInstanceRow[];
	readOnly: boolean;
};

/** Stable identities, so an omitted prop does not change a memo's deps on every render. */
const NO_ACTIONS: readonly StateMachineAction[] = [];
const NO_EFFECTS: readonly StateMachineEffect[] = [];
const NO_ROWS: readonly Wc3ProcessInstanceRow[] = [];

/**
 * The five behavioural flags, in the order the permit editor reads them out.
 *
 * These default to the built-in five rather than to empty, unlike the vocabularies above, and the
 * difference is real: `Wc3ProcessState.flags` is a closed union in the MODEL, so these are labels
 * for something the widget already understands rather than a list only the host can know. Pass
 * `stateFlags` to relabel them, to reorder them, or to offer fewer.
 */
const DEFAULT_STATE_FLAGS: readonly StateMachineFlagOption[] = [
	{flag: "monitored", label: "Monitored"},
	{flag: "authorizesWork", label: "Authorizes work"},
	{flag: "editableAnswers", label: "Answers editable"},
	{flag: "mutableReceiver", label: "Receiver editable"},
	{flag: "reopenable", label: "Reopenable"},
];

const StateMachineDataContext = createContext<StateMachineData>({
	actions: NO_ACTIONS,
	effects: NO_EFFECTS,
	stateFlags: DEFAULT_STATE_FLAGS,
	instances: NO_ROWS,
	readOnly: false,
});

/** Everything the host supplied, for the pieces too deep to prop-drill to. */
function useStateMachineData(): StateMachineData {
	return useContext(StateMachineDataContext);
}

/** The bound-action picker's options, in Combobox shape. */
const actionOptions = (actions: readonly StateMachineAction[]) => actions.map((a) => ({value: a.id, label: a.label}));

// ─── Canvas node ─────────────────────────────────────────────────────────────

type ProcFlowNodeData = {
	state: Wc3ProcessState;
};

/**
 * A state on the canvas, drawn as React Flow's OWN default node.
 *
 * This used to paint a bespoke box: an identity colour strip, the category and graph role, the
 * custom / proposed markers, the behavioural flags, a live token pill and an SLA tint, all inside a
 * fixed 176×66 frame. Next to the graphs on reactflow.dev/examples it read as noise — five type
 * sizes in a box the size of a business card, a different stroke colour per transition kind, and
 * orthogonal wiring fighting the curves. The whole canvas is back on React Flow's defaults: default
 * node chrome, default `#b1b1b7` bezier edges, default handles, default selection. The readouts it
 * dropped are all still on the page — the rail's state inspector and the Instances section.
 *
 * Registered under the `default` KEY, not a name of our own, and that is what buys the default look:
 * React Flow classes every node `react-flow__node-<type>`, so `type: "default"` picks up the
 * library's own node CSS — fill, 1px border, radius, 150px width, 12px centred text, hover and
 * selected shadow — while this component still supplies the four handles below.
 *
 * FOUR explicit handles, not two. A self-transition and a backward edge only render when source and
 * target resolve to DIFFERENT handles: with in/out alone the extension loop would draw nothing and
 * every reject_loop / reopen edge would overlay the forward edge it runs beside.
 */
export function ProcessFlowNode({data}: NodeProps) {
	const {state} = data as unknown as ProcFlowNodeData;

	return (
		<>
			<Handle id="in" type="target" position={Position.Left} title="incoming" />
			<Handle id="back-in" type="target" position={Position.Top} title="incoming (loop / backward)" />
			{state.name}
			<Handle id="out" type="source" position={Position.Right} title="outgoing" />
			<Handle id="back-out" type="source" position={Position.Bottom} title="outgoing (loop / backward)" />
		</>
	);
}

// Module-level, never an inline object: a new map identity on every render remounts every node.
// Keyed `default` on purpose — see ProcessFlowNode.
export const PROCESS_NODE_TYPES = {default: ProcessFlowNode};

// ─── Rail ────────────────────────────────────────────────────────────────────

export function ProcessRailCard({title, count, children}: {title: string; count?: number; children: ReactNode}) {
	return (
		<Card className="wwc:shrink-0">
			<CardHeader className="wwc:p-3">
				<CardTitle className="wwc:text-sm">
					{title}
					{count !== undefined ? <span className="wwc:font-normal wwc:text-muted-foreground"> ({count})</span> : null}
				</CardTitle>
			</CardHeader>
			<CardContent className="wwc:p-3 wwc:pt-0">{children}</CardContent>
		</Card>
	);
}

// ─── State inspector ─────────────────────────────────────────────────────────

/**
 * Mounted with `key={state.id}` so its uncontrolled inputs and its inline errors reset when the
 * selection moves — the same reason the pipeline's node inspector keys on its node.
 */
/**
 * The vocabulary "Add effect…" offers.
 *
 * FIXTURE, not a contract. The engine's real effect set is not modelled anywhere in this repo — the
 * permit process's own SLA note mentions `start_sla_timer` in passing and nothing else — so this is
 * a plausible list to author against, kept small and named the way the note names its one example.
 * Replace it with the engine's list when there is one; every consumer reads it from here.
 */
export const WC3_PROCESS_EFFECTS: {id: string; label: string; note: string}[] = [
	{id: "start_sla_timer", label: "start_sla_timer", note: "Begins this state's SLA clock on the permit."},
	{id: "stop_sla_timer", label: "stop_sla_timer", note: "Stops any running SLA clock."},
	{id: "notify_receiver", label: "notify_receiver", note: "Notifies the permit's receiver."},
	{id: "notify_issuer", label: "notify_issuer", note: "Notifies the issuing authority."},
	{id: "lock_answers", label: "lock_answers", note: "Freezes the permit's answers against further edits."},
	{id: "unlock_answers", label: "unlock_answers", note: "Reopens the permit's answers for editing."},
	{id: "write_audit_entry", label: "write_audit_entry", note: "Writes an extra audit line beyond the implicit one."},
];

/**
 * Mounted with `key={state.id}` so its uncontrolled inputs and its inline errors reset when the
 * selection moves — the same reason the pipeline's node inspector keys on its node.
 *
 * Entry requirements and effects are COLLAPSED by default. They are the deep end of a state — most
 * edits here are a rename or a flag — and an always-open pair of pickers would push the next state
 * in the list off the screen for the sake of two lines that usually read "none".
 */
export function StateInspector({
	process,
	state,
	onChange,
	onDelete,
	onSelectTransition,
	authoring = false,
}: {
	process: Wc3ProcessRecord;
	state: Wc3ProcessState;
	onChange: (next: Wc3ProcessRecord) => void;
	onDelete: () => void;
	onSelectTransition: (transitionId: string) => void;
	/**
	 * Authoring a template: show the fields that DEFINE the state and hide the ones that describe an
	 * established one. Colour, SLA and the outgoing-transition list stay on the process page, where
	 * the canvas tint and the token queue actually read them.
	 */
	authoring?: boolean;
}) {
	const [nameErr, setNameErr] = useState<string | null>(null);
	const [slaErr, setSlaErr] = useState<string | null>(null);
	const [showEntry, setShowEntry] = useState(false);

	const {actions, effects: effectOptions, stateFlags, instances} = useStateMachineData();
	const objectType = getObjectType(process.objectTypeId);
	const tokens = processTokens(process, state.id, [...instances]);
	const outgoing = process.transitions.filter((t) => t.from === state.id);
	// slaBySeverity wins for every row, so a per-state SLA on a severity-driven process is committed
	// but has no effect. The field is disabled and says so rather than silently accepting the number.
	const severityDriven = processSlaModel(process) === "severity";

	const requirements = state.entryRequirements ?? [];
	const effects = state.entryEffects ?? [];

	const commitName = (value: string) => {
		const next = value.trim();
		if (!next) {
			setNameErr(WC3_PROCESS_MESSAGES.nameRequired);
			return;
		}
		if (
			process.states.some(
				(s) =>
					s.id !== state.id &&
					(s.name.toLowerCase() === next.toLowerCase() || s.value.toLowerCase() === next.toLowerCase()),
			)
		) {
			setNameErr(WC3_PROCESS_MESSAGES.stateNameTaken);
			return;
		}
		setNameErr(null);
		onChange(updateState(process, state.id, {name: next}));
	};

	const commitSla = (raw: string) => {
		const trimmed = raw.trim();
		if (!trimmed) {
			setSlaErr(null);
			onChange(updateState(process, state.id, {slaHours: null}));
			return;
		}
		const value = Number(trimmed);
		if (!Number.isFinite(value) || value <= 0) {
			setSlaErr(WC3_PROCESS_MESSAGES.slaPositive);
			return;
		}
		setSlaErr(null);
		onChange(updateState(process, state.id, {slaHours: value}));
	};

	const toggleFlag = (flag: Wc3ProcessStateFlag) => {
		const next = state.flags.includes(flag) ? state.flags.filter((f) => f !== flag) : [...state.flags, flag];
		onChange(updateState(process, state.id, {flags: next}));
	};

	const setRequirements = (next: string[]) => onChange(updateState(process, state.id, {entryRequirements: next}));
	const setEffects = (next: string[]) => onChange(updateState(process, state.id, {entryEffects: next}));

	return (
		<div className="wwc:space-y-3">
			{/*
			 * Key / Label / Category / Type, then the flags, then the collapsed entry panel — the order
			 * the permit editor reads them. Stacked rather than one row because the rail is 22rem wide;
			 * the grid opens up on its own if this is ever mounted somewhere wider.
			 */}
			<div className="wwc:grid wwc:gap-3 wwc:@md:grid-cols-2">
				<div className="wwc:space-y-1.5">
					<Label htmlFor={`state-key-${state.id}`}>Key (auto)</Label>
					{/* Derived from the name by addState and never edited by hand: the key is what lands in the
					    instance row's status property, so a free-text key would let the graph and the data
					    disagree about what "draft" means. */}
					<Input
						id={`state-key-${state.id}`}
						value={state.value}
						disabled
						readOnly
						className="wwc:font-mono wwc:text-xs"
					/>
				</div>

				<div className="wwc:space-y-1.5">
					<Label htmlFor={`state-label-${state.id}`}>Label</Label>
					<Input
						id={`state-label-${state.id}`}
						defaultValue={state.name}
						aria-invalid={nameErr !== null}
						className={cn(nameErr && "wwc:border-destructive")}
						onBlur={(event) => commitName(event.target.value)}
					/>
					{nameErr && <p className="wwc:text-xs wwc:text-destructive">{nameErr}</p>}
				</div>

				<div className="wwc:space-y-1.5">
					<Label>Category</Label>
					<Combobox
						options={STATE_CATEGORIES.map((value) => ({value, label: value}))}
						value={state.category}
						onValueChange={(value) =>
							onChange(updateState(process, state.id, {category: value as Wc3ProcessState["category"]}))
						}
						className="wwc:w-full"
					/>
				</div>

				<div className="wwc:space-y-1.5">
					<Label>Type</Label>
					<Combobox
						options={STATE_TYPES.map((value) => ({value, label: value}))}
						value={state.type}
						onValueChange={(value) =>
							onChange(updateState(process, state.id, {type: value as Wc3ProcessState["type"]}))
						}
						className="wwc:w-full"
					/>
				</div>
			</div>

			{/* Switches, not the pressed-buttons the port started with: these are five independent
			    on/off settings, and a row of toggles says that where a row of chips reads as a
			    multi-select. */}
			<div className="wwc:grid wwc:gap-2">
				{stateFlags.map(({flag, label}) => (
					<div key={flag} className="wwc:flex wwc:items-center wwc:gap-2">
						<Switch
							id={`state-${state.id}-${flag}`}
							checked={state.flags.includes(flag)}
							onCheckedChange={() => toggleFlag(flag)}
						/>
						<Label htmlFor={`state-${state.id}-${flag}`} className="wwc:text-xs wwc:font-normal">
							{label}
						</Label>
					</div>
				))}
			</div>

			{!authoring && (
				<>
					<div className="wwc:space-y-1.5">
						<Label htmlFor={`state-sla-${state.id}`}>SLA (hours)</Label>
						<Input
							id={`state-sla-${state.id}`}
							defaultValue={state.slaHours ?? ""}
							disabled={severityDriven}
							placeholder="none"
							aria-invalid={slaErr !== null}
							className={cn(slaErr && "wwc:border-destructive")}
							onBlur={(event) => commitSla(event.target.value)}
						/>
						{slaErr && <p className="wwc:text-xs wwc:text-destructive">{slaErr}</p>}
						{severityDriven && (
							<p className="wwc:text-[10.5px] wwc:text-muted-foreground">{WC3_PROCESS_MESSAGES.severitySlaOverride}</p>
						)}
					</div>

					<div className="wwc:space-y-1.5">
						<Label>Colour</Label>
						<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
							{WC3_PROCESS_STATE_COLORS.map((color) => (
								<button
									key={color}
									type="button"
									aria-label={color}
									aria-pressed={state.color === color}
									className={cn(
										"wwc:size-5 wwc:rounded-full wwc:border",
										state.color === color ? "wwc:border-primary wwc:ring-1 wwc:ring-primary" : "wwc:border-border",
									)}
									style={{background: color}}
									onClick={() => onChange(updateState(process, state.id, {color}))}
								/>
							))}
						</div>
					</div>

					<div className="wwc:space-y-1 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
						<div className="wwc:text-[10px] wwc:font-semibold wwc:tracking-wider wwc:text-muted-foreground wwc:uppercase">
							Outgoing transitions
						</div>
						{outgoing.length === 0 ? (
							<p className="wwc:text-xs wwc:text-muted-foreground">
								None. A non-terminal state without an outgoing transition fails rule L5.
							</p>
						) : (
							<div className="wwc:space-y-1">
								{outgoing.map((t) => (
									<button
										key={t.id}
										type="button"
										className="wwc:flex wwc:w-full wwc:items-center wwc:gap-1.5 wwc:text-left wwc:text-xs wwc:hover:underline"
										onClick={() => onSelectTransition(t.id)}
									>
										<Mono>{t.key}</Mono>
										<TransitionKindBadge kind={t.kind} />
									</button>
								))}
							</div>
						)}
					</div>

					<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
						{tokens.length} live {objectType?.displayName ?? "row"}
						{tokens.length === 1 ? "" : "s"} in this state.
					</p>
				</>
			)}

			{/* Collapsed by default — the deep end of a state, and usually two lines that read "none". */}
			<div className="wwc:space-y-3 wwc:border-t wwc:border-border wwc:pt-3">
				<Button
					variant="outline"
					size="sm"
					aria-expanded={showEntry}
					className="wwc:gap-1.5"
					onClick={() => setShowEntry((open) => !open)}
				>
					<ChevronDown className={cn("wwc:h-3.5 wwc:w-3.5 wwc:transition-transform", showEntry && "wwc:rotate-180")} />
					Entry requirements
				</Button>

				{showEntry && (
					<>
						<EntryList
							title="Entry requirements"
							description={`Collected before a permit may REACH “${state.name}”, on any incoming transition.`}
							empty="None required here."
							placeholder="Add required action…"
							options={actionOptions(actions)}
							values={requirements}
							labelOf={(id) => actions.find((a) => a.id === id)?.label ?? id}
							onChange={setRequirements}
						/>

						<EntryList
							title="Entry effects"
							description={`Applied in this order whenever a permit ENTERS “${state.name}”, in the commit phase and after the incoming edge’s own effects. Reordering them changes what the permit ends up with.`}
							empty="No effects beyond the implicit audit entry."
							placeholder="Add effect…"
							options={effectOptions.map((effect) => ({value: effect.id, label: effect.label}))}
							values={effects}
							labelOf={(id) => effectOptions.find((effect) => effect.id === id)?.label ?? id}
							ordered
							onChange={setEffects}
						/>
					</>
				)}
			</div>

			<Button variant="outline" size="sm" className="wwc:w-full wwc:gap-1.5 wwc:text-destructive" onClick={onDelete}>
				<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
				Delete state
			</Button>
		</div>
	);
}

/**
 * One entry list — requirements or effects. Same shape both times: a heading, what it means, the
 * current entries, and a picker that only offers what is not already in the list.
 *
 * `ordered` adds move-up / move-down, because for EFFECTS the order is the behaviour — the panel
 * says so in its own description — while a requirement is a set and numbering it would imply a
 * sequence that does not exist.
 */
function EntryList({
	title,
	description,
	empty,
	placeholder,
	options,
	values,
	labelOf,
	ordered = false,
	onChange,
}: {
	title: string;
	description: string;
	empty: string;
	placeholder: string;
	options: {value: string; label: string}[];
	values: string[];
	labelOf: (id: string) => string;
	ordered?: boolean;
	onChange: (next: string[]) => void;
}) {
	const remaining = options.filter((option) => !values.includes(option.value));

	const move = (index: number, by: number) => {
		const next = [...values];
		const target = index + by;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};

	return (
		<div className="wwc:space-y-1.5">
			<div>
				<div className="wwc:text-xs wwc:font-semibold">{title}</div>
				<p className="wwc:text-[10.5px] wwc:text-muted-foreground">{description}</p>
			</div>

			{values.length === 0 ? (
				<p className="wwc:text-xs wwc:text-muted-foreground">{empty}</p>
			) : (
				<div className="wwc:space-y-1">
					{values.map((id, index) => (
						<div
							key={id}
							className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:border wwc:border-border wwc:px-2 wwc:py-1"
						>
							{ordered && (
								<span className="wwc:shrink-0 wwc:text-[10px] wwc:tabular-nums wwc:text-muted-foreground">
									{index + 1}
								</span>
							)}
							<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-xs">{labelOf(id)}</span>
							{ordered && (
								<>
									<Button
										variant="ghost"
										icon
										aria-label="Move up"
										disabled={index === 0}
										className="wwc:h-6 wwc:w-6"
										onClick={() => move(index, -1)}
									>
										<ChevronUp className="wwc:h-3 wwc:w-3" />
									</Button>
									<Button
										variant="ghost"
										icon
										aria-label="Move down"
										disabled={index === values.length - 1}
										className="wwc:h-6 wwc:w-6"
										onClick={() => move(index, 1)}
									>
										<ChevronDown className="wwc:h-3 wwc:w-3" />
									</Button>
								</>
							)}
							<Button
								variant="ghost"
								icon
								aria-label={`Remove ${labelOf(id)}`}
								className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
								onClick={() => onChange(values.filter((value) => value !== id))}
							>
								<X className="wwc:h-3 wwc:w-3" />
							</Button>
						</div>
					))}
				</div>
			)}

			{/* Only what is not already listed: offering a duplicate and then refusing it is a worse
			    conversation than not offering it. */}
			{remaining.length > 0 && (
				<Combobox
					options={remaining}
					value=""
					onValueChange={(value) => {
						if (value) onChange([...values, value]);
					}}
					placeholder={placeholder}
					className="wwc:w-full"
				/>
			)}
		</div>
	);
}
export function TransitionInspector({
	process,
	transition,
	onChange,
	onDelete,
	onNavigate,
}: {
	process: Wc3ProcessRecord;
	transition: Wc3ProcessTransition;
	onChange: (next: Wc3ProcessRecord) => void;
	onDelete: () => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
}) {
	const from = process.states.find((s) => s.id === transition.from);
	const to = process.states.find((s) => s.id === transition.to);
	const {actions} = useStateMachineData();
	const action = transitionAction(transition, actions);
	const unbound = transition.actionTypeId === null;
	const [showDetail, setShowDetail] = useState(false);

	return (
		<div className="wwc:space-y-3">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
				<span className="wwc:text-sm wwc:font-semibold">{transition.key}</span>
				<TransitionKindBadge kind={transition.kind} />
				{transition.proposed && <ProposedTag />}
			</div>

			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:text-xs">
				{from ? <StateChip state={from} /> : <span className="wwc:text-muted-foreground wwc:italic">deleted</span>}
				<ArrowRight className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
				{to ? <StateChip state={to} /> : <span className="wwc:text-muted-foreground wwc:italic">deleted</span>}
			</div>

			{/*
			 * The binding stays ABOVE the fold, alone, because it is the one field a canvas drop cannot
			 * fill and therefore the one the author has landed here to fill. Everything below it —
			 * actor role, guards, effects — is folded away by default, the same call the state
			 * inspector makes about entry requirements: the deep end, and usually a line reading "none".
			 */}
			<div className="wwc:space-y-1.5">
				<Label>Bound action type</Label>
				{/* Rebinding is what makes lint rule L7 reachable: the fixture's bindings all resolve, a
				    rebound one need not. processGraphLint() adds L7 for exactly this — and for an edge
				    that has never been bound at all. */}
				<Combobox
					options={actionOptions(actions)}
					value={transition.actionTypeId ?? ""}
					onValueChange={(value) => onChange(rebindTransition(process, transition.id, value))}
					placeholder="Select action type…"
					className="wwc:w-full"
				/>
				{action ? (
					<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
						Enforcement lives on the shared ontology action — parameter validation, submission criteria and guard
						functions. Run it from any projection and the same rules apply.
					</p>
				) : unbound ? (
					// Not an error: the edge was drawn a moment ago and this is the field it is waiting on.
					// Amber, and it says what happens next rather than what went wrong.
					<p className="wwc:text-xs wwc:text-amber-700 wwc:dark:text-amber-400">
						Drawn, not bound. The edge is on the canvas and dashed until it binds; rule L7 holds the graph back from
						publishing until then.
					</p>
				) : (
					<p className="wwc:text-xs wwc:text-destructive">
						This binding does not resolve in the ontology — rule L7 flags it until it is rebound.
					</p>
				)}
			</div>

			<div className="wwc:space-y-3 wwc:border-t wwc:border-border wwc:pt-3">
				<Button
					variant="outline"
					size="sm"
					aria-expanded={showDetail}
					className="wwc:gap-1.5"
					onClick={() => setShowDetail((open) => !open)}
				>
					<ChevronDown className={cn("wwc:h-3.5 wwc:w-3.5 wwc:transition-transform", showDetail && "wwc:rotate-180")} />
					Actor, guards and effects
				</Button>

				{showDetail && (
					<>
						<div className="wwc:text-[10.5px] wwc:text-muted-foreground">actor role: {transition.actorRole}</div>

						<div className="wwc:space-y-1">
							<div className="wwc:text-[10px] wwc:font-semibold wwc:tracking-wider wwc:text-muted-foreground wwc:uppercase">
								Guards
							</div>
							{transition.guards.length === 0 ? (
								<p className="wwc:text-xs wwc:text-muted-foreground">None declared on this edge.</p>
							) : (
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1">
									{transition.guards.map((guard) => (
										<span key={guard} className="wwc:rounded wwc:bg-muted wwc:px-1.5 wwc:py-0.5">
											<Mono>{guard}</Mono>
										</span>
									))}
								</div>
							)}
						</div>

						<div className="wwc:space-y-1">
							<div className="wwc:text-[10px] wwc:font-semibold wwc:tracking-wider wwc:text-muted-foreground wwc:uppercase">
								Effects
							</div>
							<p className="wwc:text-xs">
								{transition.note ?? (
									<span className="wwc:text-muted-foreground">No effects beyond the implicit audit entry.</span>
								)}
							</p>
						</div>
					</>
				)}
			</div>

			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
				<Button variant="destructive" size="sm" className="wwc:gap-1.5" onClick={onDelete}>
					<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
					Delete transition…
				</Button>
				{action && onNavigate && (
					<Button
						variant="ghost"
						size="sm"
						className="wwc:h-6 wwc:gap-1 wwc:px-1.5 wwc:text-[11px]"
						onClick={() => onNavigate(lineageNav.actionType(action.id))}
					>
						action type
						<ArrowRight className="wwc:h-3 wwc:w-3" />
					</Button>
				)}
			</div>
		</div>
	);
}

// ─── Add-transition form ─────────────────────────────────────────────────────

/**
 * The rail's way to create a transition, for the edge you would rather type than draw. A canvas drag
 * is the other way and it commits on drop; neither needs a binding, which is nullable.
 *
 * The check runs LIVE on the current draft, so its refusal — or its rule-L6 note, which is a hint and
 * not a refusal — is readable before the button is pressed.
 */
/**
 * The in-place "add state" form.
 *
 * Name, category and role rather than name alone: a state added with only a name lands as an
 * intermediate/pending/custom guess that then has to be corrected in the inspector, and the two
 * fields that decide how the graph READS — where it starts and where it ends — are exactly the ones
 * worth asking for up front. Everything else (colour, SLA, flags) has a sensible default and is a
 * refinement, so it stays in the inspector.
 */
export function AddStateForm({
	onAdd,
	onCancel,
	error,
}: {
	onAdd: (draft: {name: string; category: Wc3ProcessState["category"]; type: Wc3ProcessState["type"]}) => void;
	onCancel: () => void;
	/** Refusal from the caller — a blank or duplicate name. Rendered verbatim. */
	error: string | null;
}) {
	const [name, setName] = useState("");
	const [category, setCategory] = useState<Wc3ProcessState["category"]>("pending");
	const [type, setType] = useState<Wc3ProcessState["type"]>("intermediate");

	return (
		<div className="wwc:space-y-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
			<div className="wwc:space-y-1.5">
				<Label htmlFor="new-state-name">Name</Label>
				<Input
					id="new-state-name"
					value={name}
					placeholder="New state name…"
					aria-invalid={error !== null}
					className={cn(error && "wwc:border-destructive")}
					onChange={(event) => setName(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") onAdd({name, category, type});
						if (event.key === "Escape") onCancel();
					}}
				/>
			</div>

			<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
				<div className="wwc:space-y-1.5">
					<Label>Category</Label>
					<Combobox
						options={STATE_CATEGORIES.map((value) => ({value, label: value}))}
						value={category}
						onValueChange={(value) => setCategory(value as Wc3ProcessState["category"])}
						className="wwc:w-full"
					/>
				</div>
				<div className="wwc:space-y-1.5">
					<Label>Role</Label>
					<Combobox
						options={STATE_TYPES.map((value) => ({value, label: value}))}
						value={type}
						onValueChange={(value) => setType(value as Wc3ProcessState["type"])}
						className="wwc:w-full"
					/>
				</div>
			</div>

			{error && <p className="wwc:text-xs wwc:text-destructive">{error}</p>}

			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Button size="sm" className="wwc:gap-1.5" onClick={() => onAdd({name, category, type})}>
					<Plus className="wwc:h-3.5 wwc:w-3.5" />
					Add state
				</Button>
				<Button variant="ghost" size="sm" onClick={onCancel}>
					Cancel
				</Button>
			</div>

			<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
				It lands custom, with no SLA and no outgoing edge — so rule L5 flags it until a transition is added.
			</p>
		</div>
	);
}

export function AddTransitionForm({
	process,
	draft,
	onDraftChange,
	onAdd,
	onCancel,
}: {
	process: Wc3ProcessRecord;
	draft: Wc3ProcessEditState["draftTransition"];
	onDraftChange: (next: Wc3ProcessEditState["draftTransition"]) => void;
	onAdd: (args: {from: string; to: string; actionTypeId: string | null}) => void;
	/** Renders a Cancel beside Add. Omitted, the form has no way out and none is drawn. */
	onCancel?: () => void;
}) {
	const {actions} = useStateMachineData();
	const stateOptions = process.states.map((s) => ({
		value: s.id,
		label: s.name,
	}));
	// Both endpoints are needed before the guards can say anything useful: without them the first guard
	// to fire is "that state no longer exists", which is not what an empty picker means.
	const check =
		draft.from && draft.to ? checkTransition(process, draft.from, draft.to, draft.actionTypeId, actions) : null;

	return (
		<div className="wwc:space-y-2">
			<div className="wwc:grid wwc:gap-2">
				<Combobox
					options={stateOptions}
					value={draft.from ?? ""}
					onValueChange={(value) => onDraftChange({...draft, from: value})}
					placeholder="from state…"
					className="wwc:w-full"
				/>
				<Combobox
					options={stateOptions}
					value={draft.to ?? ""}
					onValueChange={(value) => onDraftChange({...draft, to: value})}
					placeholder="to state…"
					className="wwc:w-full"
				/>
				{/* Optional, and labelled so. An unbound transition is representable — the canvas creates
				    them on every drop — so the form has no business demanding here what the drop does not. */}
				<Combobox
					options={actionOptions(actions)}
					value={draft.actionTypeId ?? ""}
					onValueChange={(value) => onDraftChange({...draft, actionTypeId: value})}
					placeholder="bound action (optional)…"
					className="wwc:w-full"
				/>
			</div>

			{check && !check.ok && <p className="wwc:text-xs wwc:text-destructive">{check.reason}</p>}
			{check?.ok && check.note && <p className="wwc:text-[10.5px] wwc:text-muted-foreground">{check.note}</p>}
			{check?.ok && !check.note && (
				<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
					Will be created as kind <b>{check.kind}</b> — derived from the graph, never asked for.
					{!draft.actionTypeId && " Unbound, so rule L7 will hold the graph back from publishing until it binds."}
				</p>
			)}

			<Button
				size="sm"
				className="wwc:gap-1.5"
				// Disabled only until both endpoints are picked: two empty pickers explain themselves, and
				// the guards have nothing to say about an edge with no ends. A missing BINDING is left to
				// the guards, which is why the button stays live once from/to are set.
				disabled={!draft.from || !draft.to}
				onClick={() => {
					if (!draft.from || !draft.to) return;
					onAdd({
						from: draft.from,
						to: draft.to,
						actionTypeId: draft.actionTypeId,
					});
				}}
			>
				<Plus className="wwc:h-3.5 wwc:w-3.5" />
				Add transition
			</Button>
			{onCancel && (
				<Button variant="ghost" size="sm" className="wwc:ml-2" onClick={onCancel}>
					Cancel
				</Button>
			)}
		</div>
	);
}

// ─── Instances section ───────────────────────────────────────────────────────

/** Present in at least one row — an optional column is shipped only when the data actually has it. */
const rowsCarry = (rows: Wc3ProcessInstanceRow[], key: string) =>
	rows.some((row) => row[key] !== undefined && row[key] !== null && row[key] !== "");

export function InstancesSection({
	process,
	selectedStateId,
	onSelectState,
	loading = false,
}: {
	process: Wc3ProcessRecord;
	selectedStateId: string | null;
	onSelectState: (stateId: string | null) => void;
	/** Rows are still on their way. Separates "no live work" from "not fetched yet". */
	loading?: boolean;
}) {
	const [query, setQuery] = useState("");
	const {instances} = useStateMachineData();
	const objectType = getObjectType(process.objectTypeId);
	const allRows = useMemo(() => [...instances], [instances]);
	const scoped = useMemo(
		() => (selectedStateId ? processTokens(process, selectedStateId, allRows) : allRows),
		[process, selectedStateId, allRows],
	);
	const selectedState = selectedStateId ? process.states.find((s) => s.id === selectedStateId) : undefined;

	// Rows whose status value matches no state of this graph. Never zero-suppressed: it is the honest
	// reading of "tokens are keyed by OBJECT TYPE, not by process".
	const unclaimed = useMemo(
		() => allRows.filter((row) => processStateOf(process, row) === undefined).length,
		[process, allRows],
	);

	const columns: ColumnDef<Wc3ProcessInstanceRow, unknown>[] = useMemo(() => {
		// The two identity columns are named by the BACKING OBJECT TYPE's primary-key and title
		// properties, resolved through processRowKeys — never hardcoded, so a process created on any
		// object type gets the right two columns under their real apiNames.
		const keys = processRowKeys(process);
		const defs: ColumnDef<Wc3ProcessInstanceRow, unknown>[] = [
			{
				id: "id",
				accessorFn: (row) => processRowPk(process, row),
				header: ({column}) => <DataTableColumnHeader column={column} title={keys.pk || "Id"} />,
				enableHiding: false,
				cell: ({row}) => <Mono>{processRowPk(process, row.original)}</Mono>,
			},
			{
				id: "title",
				accessorFn: (row) => processRowTitle(process, row),
				header: ({column}) => <DataTableColumnHeader column={column} title={keys.title || "Title"} />,
				cell: ({row}) => <span className="wwc:text-xs">{processRowTitle(process, row.original)}</span>,
			},
			{
				id: "state",
				accessorFn: (row) => processStateOf(process, row)?.name ?? "",
				header: ({column}) => <DataTableColumnHeader column={column} title="State" />,
				cell: ({row}) => {
					const state = processStateOf(process, row.original);
					if (!state) {
						return (
							<span className="wwc:text-xs wwc:text-muted-foreground wwc:italic">
								no state matches {String(row.original[process.statusProp] ?? "—")}
							</span>
						);
					}
					return <StateChip state={state} />;
				},
			},
		];

		if (rowsCarry(scoped, "severity_level")) {
			defs.push({
				id: "severity",
				accessorFn: (row) => String(row.severity_level ?? ""),
				header: ({column}) => <DataTableColumnHeader column={column} title="Severity" />,
				cell: ({row}) => <Badge variant="neutralSoft">{String(row.original.severity_level ?? "—")}</Badge>,
			});
		}
		if (rowsCarry(scoped, "zone_id")) {
			defs.push({
				id: "zone",
				accessorFn: (row) => String(row.zone_id ?? ""),
				header: ({column}) => <DataTableColumnHeader column={column} title="Zone" />,
				cell: ({row}) => <Mono>{String(row.original.zone_id ?? "—")}</Mono>,
			});
		}
		if (rowsCarry(scoped, "assigned_to")) {
			defs.push({
				id: "assigned to",
				accessorFn: (row) => String(row.assigned_to ?? ""),
				header: ({column}) => <DataTableColumnHeader column={column} title="Assigned to" />,
				cell: ({row}) => <Mono>{String(row.original.assigned_to ?? "unassigned")}</Mono>,
			});
		}
		if (rowsCarry(scoped, "receiver_worker_id")) {
			defs.push({
				id: "receiver",
				accessorFn: (row) => String(row.receiver_worker_id ?? ""),
				header: ({column}) => <DataTableColumnHeader column={column} title="Receiver" />,
				cell: ({row}) => <Mono>{String(row.original.receiver_worker_id ?? "—")}</Mono>,
			});
		}

		defs.push(
			{
				id: "age",
				accessorFn: (row) => processRowAgeHours(process, row),
				header: ({column}) => <DataTableColumnHeader column={column} title="Age" />,
				meta: {
					headerClassName: "wwc:text-right",
					cellClassName: "wwc:text-right wwc:tabular-nums",
				},
				// Against the FROZEN clock (WC3_PROCESS_FIXTURE_NOW), never Date.now().
				cell: ({row}) => formatHours(processRowAgeHours(process, row.original)),
			},
			{
				id: "sla",
				accessorFn: (row) => processRowSlaHours(process, row, processStateOf(process, row)) ?? 0,
				header: ({column}) => <DataTableColumnHeader column={column} title="SLA" />,
				meta: {
					headerClassName: "wwc:text-right",
					cellClassName: "wwc:text-right wwc:tabular-nums",
				},
				cell: ({row}) => {
					const sla = processRowSlaHours(process, row.original, processStateOf(process, row.original));
					return sla === null ? <span className="wwc:text-muted-foreground">—</span> : `${sla} h`;
				},
			},
			{
				id: "over sla",
				accessorFn: (row) => (processRowOverSla(process, row) ? 1 : 0),
				header: ({column}) => <DataTableColumnHeader column={column} title="Over SLA" />,
				cell: ({row}) =>
					processRowOverSla(process, row.original) ? (
						<Badge variant="dangerSoft">
							<Clock className="wwc:h-3 wwc:w-3" />
							over
						</Badge>
					) : (
						<span className="wwc:text-muted-foreground">—</span>
					),
			},
		);
		return defs;
	}, [process, scoped]);

	const data = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return scoped;
		return scoped.filter((row) =>
			Object.values(row)
				.map((value) => (value === null ? "" : String(value)))
				.join(" ")
				.toLowerCase()
				.includes(needle),
		);
	}, [scoped, query]);

	return (
		<div className="wwc:space-y-4">
			<Card>
				<CardContent className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1.5 wwc:px-3.5 wwc:py-2.5 wwc:text-xs">
					<span className="wwc:font-semibold">
						{selectedState ? `Tokens in “${selectedState.name}”` : "All tokens"}
					</span>
					<span className="wwc:text-muted-foreground">
						{scoped.length} of {allRows.length} {objectType?.pluralName ?? "rows"}
					</span>
					<Combobox
						options={process.states.map((s) => ({
							value: s.id,
							label: s.name,
						}))}
						value={selectedStateId ?? ""}
						onValueChange={(value) => onSelectState(value || null)}
						placeholder="Scope to a state…"
						className="wwc:w-52"
					/>
					{selectedStateId && (
						<Button variant="ghost" size="sm" onClick={() => onSelectState(null)}>
							Clear scope
						</Button>
					)}
					<span className="wwc:flex-1" />
					<span className="wwc:text-muted-foreground">
						a row sits in whichever state's <Mono>value</Mono> matches its <Mono>{process.statusProp}</Mono>
					</span>
				</CardContent>
			</Card>

			{unclaimed > 0 && (
				// TOKENS ARE KEYED BY OBJECT TYPE, NOT BY PROCESS. A second process on the same object type
				// sees the same rows, and a state whose `value` matches nothing shows 0 tokens. Stated, not
				// discovered.
				<Banner
					variant="info"
					title={`${unclaimed} of ${allRows.length} rows sit in no state of this process`}
					description={`Tokens are the live ${objectType?.pluralName ?? "instance"} rows of ${
						objectType?.displayName ?? process.objectTypeId
					}, shared by every process bound to that object type. A row sits in whichever state's value matches its ${
						process.statusProp
					} field — a state whose value matches nothing shows 0 tokens.`}
				/>
			)}

			<DataTable
				columns={columns}
				data={data}
				search={query}
				onSearchChange={setQuery}
				searchPlaceholder="Filter tokens…"
				recordLabel="token"
				recordLabelPlural="tokens"
				pageSize={25}
				flushToolbar
				getRowId={(row) => processRowPk(process, row)}
				isLoading={loading}
				emptyMessage={
					// Three different sentences for three different situations, because "nothing here" is
					// not one state: still fetching, fetched and genuinely empty, or filtered to nothing.
					loading
						? "Loading tokens…"
						: allRows.length === 0
							? `No ${objectType?.pluralName ?? "instance"} rows back this process, so it has no tokens.`
							: "No tokens match the current scope and search."
				}
			/>
		</div>
	);
}

// ─── Settings section ────────────────────────────────────────────────────────

export function SettingsSection({
	process,
	onChange,
	onNavigate,
	identityExtra,
	authoring = false,
}: {
	process: Wc3ProcessRecord;
	onChange: (next: Wc3ProcessRecord) => void;
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/** Extra fields for the Identity card, below Icon — the work-permit cut's type and description. */
	identityExtra?: ReactNode;
	/**
	 * Strip the section back to identity alone: no icon, no ontology binding row, and none of the
	 * cards below it. See {@link StateMachineProps.authoring} for why.
	 */
	authoring?: boolean;
}) {
	const [nameErr, setNameErr] = useState(false);
	const facts = useMemo(() => processFacts(process), [process]);
	const objectType = getObjectType(process.objectTypeId);

	return (
		<div className="wwc:space-y-4">
			<Card>
				<CardHeader className="wwc:p-3">
					<CardTitle className="wwc:text-sm">Identity</CardTitle>
				</CardHeader>
				<CardContent className="wwc:space-y-3 wwc:p-3 wwc:pt-0">
					<div className="wwc:space-y-1.5">
						<Label htmlFor={`proc-name-${process.id}`}>Name</Label>
						<Input
							id={`proc-name-${process.id}`}
							defaultValue={process.name}
							aria-invalid={nameErr}
							className={cn(nameErr && "wwc:border-destructive")}
							onBlur={(event) => {
								const value = event.target.value.trim();
								// Empty name → inline error and NO commit. A nameless process is unfindable in the list.
								if (!value) {
									setNameErr(true);
									return;
								}
								setNameErr(false);
								onChange(updateProcessMeta(process, {name: value}));
							}}
						/>
						{nameErr && <p className="wwc:text-xs wwc:text-destructive">{WC3_PROCESS_MESSAGES.nameRequired}</p>}
					</div>

					{/* A permit template has no icon of its own, so authoring never offers one. */}
					{!authoring && (
						<div className="wwc:space-y-1.5">
							<Label>Icon</Label>
							<Combobox
								options={WC3_PROCESS_ICONS.map((icon) => ({
									value: icon,
									label: icon,
								}))}
								value={process.icon}
								onValueChange={(value) => onChange(updateProcessMeta(process, {icon: value}))}
								className="wwc:w-full"
							/>
						</div>
					)}

					{identityExtra}

					{/* The ontology binding and its provenance chips. A template being authored has an id
					    nobody has seen, a binding it did not choose and no product behind it — a row of facts
					    about a record rather than about the permit. */}
					{!authoring && (
						<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1.5 wwc:text-xs">
							<Mono>{process.id}</Mono>
							<span className="wwc:flex wwc:items-center wwc:gap-1.5">
								backing type
								{onNavigate ? (
									<button
										type="button"
										className="wwc:underline wwc:underline-offset-2"
										onClick={() => onNavigate(lineageNav.objectType(process.objectTypeId))}
									>
										<TypeGlyphLabel type={objectType} />
									</button>
								) : (
									<TypeGlyphLabel type={objectType} />
								)}
							</span>
							<span className="wwc:flex wwc:items-center wwc:gap-1.5">
								status property <Mono>{process.statusProp}</Mono>
							</span>
							<ProductChip
								process={process}
								onOpenProduct={onNavigate ? (key) => onNavigate(lineageNav.product(key)) : undefined}
							/>
							<SlaModelBadge process={process} />
						</div>
					)}
				</CardContent>
			</Card>

			{/*
			 * Everything below Identity reports on an ESTABLISHED process: what else the graph touches,
			 * where its lifecycle came from, whether it passes the engine rules, and what it currently
			 * holds. On a template being authored they are empty, or say "created in this session", or
			 * flag a graph whose only fault is being unfinished. The transition legend and the state list
			 * are also already on the canvas, so nothing here is lost by dropping them.
			 */}
			{!authoring && (
				<>
					<Card>
						<CardHeader className="wwc:p-3">
							<CardTitle className="wwc:text-sm">
								Also touches
								<span className="wwc:font-normal wwc:text-muted-foreground"> ({facts.alsoTouches.length})</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="wwc:p-3 wwc:pt-0">
							{facts.alsoTouches.length === 0 ? (
								<p className="wwc:text-xs wwc:text-muted-foreground">
									This graph reads and writes only its own object type.
								</p>
							) : (
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
									{facts.alsoTouches.map((touch) => (
										<Badge key={touch.otId} variant="neutralSoft">
											{touch.displayName}
											{touch.productKey ? ` · ${touch.productKey}` : ""}
										</Badge>
									))}
								</div>
							)}
						</CardContent>
					</Card>

					{/* evidenceNote + slaNote, verbatim. Dropping them would make the port claim shipped behaviour
			    it does not have. */}
					<ProcessProvenanceNote process={process} />

					{facts.lint.length > 0 ? (
						<Banner
							variant="warning"
							title="Graph validity (DWP engine rules L1–L7)"
							items={facts.lint.map((error) => `${error.rule} · ${error.msg}`)}
						/>
					) : (
						<Banner
							variant="success"
							title="Graph is publishable"
							description="Every validity rule L1–L7 passes: one initial state, at least one terminal and one active state, no unreachable state, every non-terminal state has an outgoing edge, terminal states take only reopen edges, and every transition binds to an action type that exists."
						/>
					)}

					<Card>
						<CardHeader className="wwc:p-3">
							<CardTitle className="wwc:text-sm">Transition kinds</CardTitle>
						</CardHeader>
						<CardContent className="wwc:space-y-2 wwc:p-3 wwc:pt-0">
							<KindLegend />
							<p className="wwc:text-[10.5px] wwc:text-muted-foreground">
								A kind is derived from the graph when a transition is added — a self edge is an extension loop, an edge
								leaving a terminal state is a reopen, an edge going back a column is a reject loop, everything else is
								forward.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:p-3">
							<CardTitle className="wwc:text-sm">States</CardTitle>
						</CardHeader>
						<CardContent className="wwc:space-y-2 wwc:p-3 wwc:pt-0">
							{process.states.map((state) => (
								<div
									key={state.id}
									className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:border-b wwc:border-border wwc:pb-2 wwc:text-xs wwc:last:border-b-0 wwc:last:pb-0"
								>
									<StateChip state={state} />
									<Badge variant="neutralSoft">{state.type}</Badge>
									{state.custom && <CustomTag />}
									{state.proposed && <ProposedTag />}
									<StateFlagBadges state={state} />
									<span className="wwc:flex-1" />
									<Mono>{state.value}</Mono>
									<span className="wwc:text-muted-foreground">
										{state.slaHours === null ? "no SLA" : `${state.slaHours} h`}
									</span>
								</div>
							))}
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

// ─── Permit fields ───────────────────────────────────────────────────────────

/**
 * The permit's type and description, shown inside the General section's Identity card.
 *
 * They sit BESIDE the record's own Name and Icon rather than in a panel of their own: all four
 * answer "what is this permit", and splitting them across two surfaces would make the same question
 * take two places to answer.
 */
export function PermitFields({
	permit,
	onPermitChange,
	typeOptions,
}: {
	permit: Wc3PermitMeta;
	onPermitChange: (next: Wc3PermitMeta) => void;
	typeOptions: PermitTypeOption[];
}) {
	return (
		<>
			<div className="wwc:space-y-1.5">
				<Label>Permit type</Label>
				{typeOptions.length === 0 ? (
					// Not a disabled picker: an empty select reads as "choices are loading". This says why
					// there are none — the backing rows carry no permit_type at all.
					<p className="wwc:text-xs wwc:text-muted-foreground">
						This process&apos;s rows carry no <Mono>permit_type</Mono>, so there is no type to choose.
					</p>
				) : (
					/*
					 * Pills rather than a dropdown: the list is short, closed and stable — every option fits
					 * on screen at once, so a menu would hide a handful of choices behind a click and make
					 * comparing them a matter of memory. Same ToggleGroup the create dialog uses for its icon
					 * picker, so single-select pills behave identically in both places.
					 */
					<ToggleGroup
						type="single"
						value={permit.type}
						// Radix emits "" when the active item is pressed again. Passed straight through, so a
						// second press CLEARS the type — unlike the icon picker, where a process must always
						// have one, a template with no type chosen yet is a real state.
						onValueChange={(next) => onPermitChange({...permit, type: next})}
						variant="outline"
						size="sm"
						className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
					>
						{typeOptions.map((option) => {
							const picked = permit.type === option.value;
							return (
								<ToggleGroupItem
									key={option.value}
									value={option.value}
									aria-label={option.label}
									/*
									 * FOUR redundant cues for the selected pill — ring, border, tinted surface and
									 * weight — because the base toggle marks `on` with `bg-accent` alone, and a light
									 * grey fill beside seven other pills is not a state anyone can find at a glance.
									 * Redundancy is the same reason the tab triggers stack their cues.
									 */
									className={cn(
										"wwc:gap-2 wwc:rounded-full wwc:px-3 wwc:capitalize",
										"wwc:data-[state=on]:border-primary wwc:data-[state=on]:bg-primary/10 wwc:data-[state=on]:font-semibold wwc:data-[state=on]:text-foreground wwc:data-[state=on]:ring-1 wwc:data-[state=on]:ring-primary",
									)}
								>
									{/* The type's identity colour. Full strength when picked, dimmed when not, so the
									    row reads as one selected type among seven rather than eight equal dots. */}
									<span
										className={cn("wwc:size-2 wwc:shrink-0 wwc:rounded-full", !picked && "wwc:opacity-40")}
										style={{background: option.dot}}
									/>
									{option.label}
								</ToggleGroupItem>
							);
						})}
					</ToggleGroup>
				)}
			</div>

			<div className="wwc:space-y-1.5">
				<Label htmlFor="permit-description">Description</Label>
				<Textarea
					id="permit-description"
					value={permit.description}
					rows={4}
					placeholder="What this permit covers, and when it applies…"
					onChange={(event) => onPermitChange({...permit, description: event.target.value})}
				/>
			</div>
		</>
	);
}

// ─── Canvas tools ────────────────────────────────────────────────────────────

/**
 * Re-runs the auto-layout and re-frames the graph.
 *
 * Positions are owned by the drag once the record is seeded — nothing recomputes them, by design, or
 * every unrelated edit would snap a moved state back. That leaves no way out of a graph the user has
 * pulled apart, or one where three states added in a row have stacked in the last column. This is
 * that way out, and it is explicit, so it can never fight a drag.
 *
 * Mounted as a GraphCanvas CHILD, which puts it inside the ReactFlowProvider — the only place
 * `fitView` can be called from. Re-framing matters here: a tidy that moved every node off screen
 * would read as having deleted the graph.
 */
function TidyLayoutButton({onTidy}: {onTidy: () => void}) {
	const {fitView} = useReactFlow();
	return (
		<Panel position="top-right">
			<Button
				variant="outline"
				size="sm"
				className="wwc:gap-1.5 wwc:bg-card"
				onClick={() => {
					onTidy();
					// After the commit lands, so the fit measures the new positions rather than the old.
					requestAnimationFrame(() => void fitView({padding: 0.12, duration: 250}));
				}}
			>
				<LayoutGrid className="wwc:h-3.5 wwc:w-3.5" />
				Tidy layout
			</Button>
		</Panel>
	);
}

// ─── Workflow status ─────────────────────────────────────────────────────────

/**
 * The canvas footer: whether the graph currently passes the engine's rules.
 *
 * It replaced a legend and a how-to-drag hint. Both were static text that said the same thing on
 * every visit; this line changes, and what it changes to is the one question an author actually has
 * open while wiring a graph — is this publishable yet.
 *
 * The check is INSTANT (processGraphLint is pure and local), so the "Checking…" state is not
 * hiding latency. It is there because a result that flips silently between two green sentences is
 * indistinguishable from a result that never ran: the brief pause is what makes the recheck visible,
 * and it is what a real server-side validation would occupy anyway.
 */
function WorkflowStatus({lint, graphKey}: {lint: Wc3ProcessFacts["lint"]; graphKey: string}) {
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		setChecking(true);
		const timer = setTimeout(() => setChecking(false), 450);
		return () => clearTimeout(timer);
		// Keyed on the GRAPH, not the record: dragging a state changes the layout and clones the record,
		// and re-running the check for a move that cannot alter validity would make the line flicker on
		// every drag.
	}, [graphKey]);

	if (checking) {
		return (
			// <output>, not a span with role="status": it carries the role and aria-live="polite"
			// implicitly, so a screen reader hears the line settle from "Checking" to its verdict.
			<output
				className={cn(
					"wwc:text-xs wwc:text-transparent",
					// A highlight sweeping across the glyphs, not a pulsing block: the words are being
					// recomputed, they are not absent, so a Skeleton would say the wrong thing. The
					// gradient is painted twice the line's width and clipped to the text; the animation
					// slides it. Under motion-reduce the slide stops and the frozen gradient runs
					// muted-foreground → foreground, both of which read normally as text.
					"wwc:bg-[linear-gradient(90deg,var(--wwc-color-muted-foreground)_0%,var(--wwc-color-muted-foreground)_35%,var(--wwc-color-foreground)_50%,var(--wwc-color-muted-foreground)_65%,var(--wwc-color-muted-foreground)_100%)]",
					"wwc:bg-[length:200%_100%] wwc:bg-clip-text",
					"wwc:animate-text-shimmer wwc:motion-reduce:animate-none",
				)}
			>
				Checking workflow…
			</output>
		);
	}

	if (lint.length === 0) {
		return (
			<output className="wwc:text-xs wwc:text-green-700 wwc:dark:text-green-400">
				Workflow validated — no blocking issues.
			</output>
		);
	}

	return (
		<output className="wwc:text-xs wwc:text-destructive">
			{lint.length} blocking issue{lint.length === 1 ? "" : "s"} — {lint.map((error) => error.rule).join(", ")}.
		</output>
	);
}

// ─── The widget ──────────────────────────────────────────────────────────────

/**
 * The variant axis: which PRODUCT is authoring the state machine.
 *
 * - `connect` — Core Connect V3's process page: header band, section rail (Canvas / Instances /
 *   Bottlenecks / Settings), canvas and editing rail. This is what {@link ProcessDetail} mounts.
 * - `work-permit` — the Digital Work Permit cut. The same widget, re-cut: General (the Settings
 *   section, renamed, carrying the permit's type and description beside the record's own name and
 *   icon), then Canvas, then Form, then Policy; then a rule, then Instances and Bottlenecks.
 *
 * TODAY THE ONLY DIFFERENCE IS THE LEFT RAIL — the sections, their order, their labels, and whether
 * General carries the permit fields. The canvas, the editing panel, the guards and the footer are
 * one implementation shared by both, and that is the point of the variant axis rather than two
 * components: when one product's canvas does need to differ, it becomes a new TRAIT here and the
 * other product keeps what it had.
 *
 * A new variant belongs HERE, as another member of this union, plus a row in
 * {@link VARIANT_TRAITS}. The pieces a variant is assembled from — {@link ProcessFlowNode},
 * {@link ProcessRailCard}, {@link StateInspector}, {@link TransitionInspector},
 * {@link AddTransitionForm}, {@link InstancesSection}, {@link SettingsSection} and
 * {@link PermitFields} — are all exported for exactly that reason: a variant recomposes them, it
 * does not fork this file.
 *
 * The graph ALONE — no shell, no rail — is not a variant, because it is not a product cut. It is
 * `shell={false}`; see {@link StateMachineProps.shell}.
 */
export type StateMachineVariant = "connect" | "work-permit";

/**
 * What each variant turns on.
 *
 * A record rather than a chain of `variant === "…"` tests: every behavioural difference between
 * variants is visible in one table, and a variant that has not opted into a trait cannot silently
 * inherit it from whichever branch happened to run. Add a trait as a new KEY here — never as an
 * inline test in the render.
 *
 * - `rail` — mount the editing rail, and with it the connection gesture. The two go together: a
 *   dragged edge takes its action binding in the rail's Add-transition form, so a rail-less variant
 *   that still accepted connections would strand every drag.
 */
/** Which half of the editing rail is open — the subject being inspected and added to. */
type RailTab = "state" | "transition";

/** A section of the widget's shell. `canvas` is the graph; the rest are the panels around it. */
export type StateMachineSection = "canvas" | "instances" | "bottlenecks" | "general" | "form" | "policy";

/** One block of the section rail. A `divider` group is ruled off from the one before it. */
export type SectionGroup = {items: readonly StateMachineSection[]; divider?: boolean};

export type VariantTraits = {
	/** Mount the editing rail beside the canvas, and with it the connection gesture. */
	rail: boolean;
	/** Mount the page shell — the header band and the left section rail. Overridable per instance. */
	shell: boolean;
	/** The rail's groups, in order. The first item of the first group is the default section. */
	sections: readonly SectionGroup[];
	/** Per-variant renames, for a section one cut calls something else. */
	sectionLabels?: Partial<Record<StateMachineSection, string>>;
	/** Show the permit's type and description in the General section. */
	permitFields: boolean;
};

/**
 * What each variant turns on.
 *
 * A record rather than a chain of `variant === "…"` tests: every behavioural difference between
 * variants is visible in one table, and a variant that has not opted into a trait cannot silently
 * inherit it from whichever branch happened to run. Add a trait as a new KEY here — never as an
 * inline test in the render.
 */
const VARIANT_TRAITS: Record<StateMachineVariant, VariantTraits> = {
	connect: {
		rail: true,
		shell: true,
		sections: [{items: ["canvas", "instances", "bottlenecks", "general"]}],
		// The Connect process page has always called this section Settings. `connect` is what that page
		// mounts, so renaming it here would rename it there — a change nobody asked for.
		sectionLabels: {general: "Settings"},
		permitFields: false,
	},
	"work-permit": {
		rail: true,
		shell: true,
		// General first, then the graph, then the request form; the two read-only views of live work
		// are ruled off below them.
		sections: [{items: ["general", "canvas", "form", "policy"]}, {items: ["instances", "bottlenecks"], divider: true}],
		permitFields: true,
	},
};

const SECTION_LABEL: Record<StateMachineSection, string> = {
	canvas: "Canvas",
	instances: "Instances",
	bottlenecks: "Bottlenecks",
	general: "General",
	form: "Form",
	policy: "Policy",
};

const SECTION_ICON: Record<StateMachineSection, typeof Workflow> = {
	canvas: Workflow,
	instances: Rows3,
	bottlenecks: Clock,
	general: Settings2,
	form: ClipboardList,
	policy: ShieldCheck,
};

/**
 * Mirrors RecordDetailShell's non-flush content well (unpadded scroll owner outside, padded block
 * inside — see the comment there for why they nest). The shell is mounted `flush` here so the form
 * builder can stay a stable direct child across section switches (hidden, never unmounted); the
 * sections that want the classic padded well get it from this wrapper instead.
 */
function SectionWell({children}: {children: ReactNode}) {
	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:w-full wwc:space-y-4 wwc:p-6">{children}</div>
		</div>
	);
}

/**
 * The permit's identity, as the left panel edits it.
 *
 * `name` has a home on the record and is committed there through `updateProcessMeta`. `type` and
 * `description` do NOT: a permit TYPE is a property of each token row (`Wc3PermitRow.permit_type`),
 * not of the process definition, and `Wc3Process` carries no description field. Rather than invent
 * two fields on a frozen fixture type, they live in this value — controlled-optional, exactly like
 * {@link Wc3ProcessEditState} — so the panel is real UI and the host decides where it persists.
 */
export type Wc3PermitMeta = {
	name: string;
	/** One of the values the backing rows actually carry — see {@link permitTypeOptions}. */
	type: string;
	description: string;
	/** The rules a permit issued from this template inherits — see the Policy section. */
	policy: Wc3PermitPolicy;
};

/**
 * The colour each permit type is known by, keyed by its raw `permit_type` value.
 *
 * ONE source for both surfaces that paint a type: the pills in this file and the table chips in
 * work-permit-templates.tsx. Two maps would drift, and a type that is red in a list and orange in
 * its editor is worse than a type with no colour at all.
 *
 * `dot` is a hex applied INLINE — legal here for the same reason WC3_PROCESS_STATE_COLORS is: it is
 * fixture identity, never chrome, and a dot carries no text so it has no contrast to lose. `chip`
 * has to be classes instead, because a chip DOES carry text and a single hex would be one value for
 * both themes.
 */
export const PERMIT_TYPE_COLOR: Record<string, {dot: string; chip: string}> = {
	hot_work: {dot: "#dc2626", chip: "wwc:border-red-600/25 wwc:bg-red-500/10 wwc:text-red-700 wwc:dark:text-red-400"},
	cold_work: {
		dot: "#2563eb",
		chip: "wwc:border-blue-600/25 wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400",
	},
	confined_space: {
		dot: "#7c3aed",
		chip: "wwc:border-violet-600/25 wwc:bg-violet-500/10 wwc:text-violet-700 wwc:dark:text-violet-400",
	},
	work_at_height: {
		dot: "#ea580c",
		chip: "wwc:border-orange-600/25 wwc:bg-orange-500/10 wwc:text-orange-700 wwc:dark:text-orange-400",
	},
	electrical_work: {
		dot: "#d97706",
		chip: "wwc:border-amber-600/25 wwc:bg-amber-500/10 wwc:text-amber-700 wwc:dark:text-amber-400",
	},
	excavation: {
		dot: "#059669",
		chip: "wwc:border-emerald-600/25 wwc:bg-emerald-500/10 wwc:text-emerald-700 wwc:dark:text-emerald-400",
	},
	lifting: {
		dot: "#0891b2",
		chip: "wwc:border-cyan-600/25 wwc:bg-cyan-500/10 wwc:text-cyan-700 wwc:dark:text-cyan-400",
	},
	radiography: {
		dot: "#db2777",
		chip: "wwc:border-pink-600/25 wwc:bg-pink-500/10 wwc:text-pink-700 wwc:dark:text-pink-400",
	},
};

/** Neutral rather than a random colour: an unrecognised type should read as unclassified, not as a
 *  type whose colour nobody can look up. */
const PERMIT_TYPE_FALLBACK = {
	dot: "var(--wwc-color-muted-foreground)",
	chip: "wwc:border-border wwc:bg-muted wwc:text-muted-foreground",
};

export const permitTypeColor = (value: string) => PERMIT_TYPE_COLOR[value] ?? PERMIT_TYPE_FALLBACK;

export type PermitTypeOption = {value: string; label: string; dot: string};

/**
 * The permit types this process's OWN tokens carry, deduped and in first-seen order.
 *
 * Derived rather than declared: a hard-coded list would silently drift from the fixture the moment a
 * row is added. A process whose rows have no `permit_type` yields an empty list, and the field says
 * so instead of offering choices that mean nothing.
 */
export function permitTypeOptions(
	process: Wc3ProcessRecord,
	instances: readonly Wc3ProcessInstanceRow[] = [],
): PermitTypeOption[] {
	const seen = new Set<string>();
	for (const row of instances) {
		const value = row.permit_type;
		if (typeof value === "string" && value !== "" && !seen.has(value)) seen.add(value);
	}
	return [...seen].map((value) => ({value, label: value.replace(/_/g, " "), dot: permitTypeColor(value).dot}));
}

export type StateMachineProps = {
	/** The process being edited. Every commit arrives back through {@link onChange}. */
	process: Wc3ProcessRecord;
	/** Receives the WHOLE next record. The widget never mutates in place. */
	onChange: (next: Wc3ProcessRecord) => void;
	/** Which product cut. A PRESET over `sections` / `sectionLabels`. @default "connect" */
	variant?: StateMachineVariant;
	/**
	 * The actions a transition may bind to. **Defaults to empty**, and empty means "the host has not
	 * declared a vocabulary" — the binding picker offers nothing, `checkTransition` accepts any id it
	 * is given, and lint rule L7 does not fire. Supply it and both come back: an id outside the list
	 * is refused, and an unbound edge holds the graph back from publishing.
	 *
	 * It used to be 24 demo actions compiled into the package, which rejected a consumer's real ids
	 * as "not in the ontology" while L7 refused to let the graph publish unbound — a wall with no
	 * way through.
	 */
	actions?: readonly StateMachineAction[];
	/** The effects a state's entry effects are chosen from. Defaults to empty. */
	effects?: readonly StateMachineEffect[];
	/**
	 * The behavioural flags the state inspector offers, and their labels.
	 *
	 * Unlike {@link actions} and {@link effects} this defaults to the built-in five rather than to
	 * empty, because `Wc3ProcessState.flags` is a closed union in the MODEL — these are labels for
	 * something the widget already understands, not a vocabulary only the host can know.
	 */
	stateFlags?: readonly StateMachineFlagOption[];
	/**
	 * The rows this process's tokens are — what Instances lists, what Bottlenecks ranks, and what the
	 * count on each canvas node reads. **Defaults to empty.**
	 *
	 * Token rows are keyed by BACKING OBJECT TYPE, not by process, so the widget cannot fetch them:
	 * only the host knows where its rows live. It used to read a demo fixture keyed on
	 * `objectTypeId`, which meant a real process showed an empty Instances section, an empty
	 * Bottlenecks section, and a 0 on every node.
	 */
	instances?: readonly Wc3ProcessInstanceRow[];
	/** Rows are still loading. Separates "no live work yet" from "not fetched yet" in the empty state. */
	instancesLoading?: boolean;
	/**
	 * Read-only: the graph can be read, selected and panned, but not changed.
	 *
	 * Turns off node drag, the connection gesture, both add forms and every delete. Most people who
	 * open a workflow are not authoring it, and the closest thing before this was `shell={false}`,
	 * which stripped the header and the rail and STILL committed a `moveState` on every drag.
	 */
	readOnly?: boolean;
	/**
	 * The rail's groups, in order. Overrides what {@link variant} declares.
	 *
	 * This is what stops the library naming its own consumers. `variant` is a preset that resolves to
	 * a `sections` value; a third product passes its own rail here instead of sending a PR to add a
	 * key to an enum inside core-ui.
	 */
	sections?: readonly SectionGroup[];
	/** Per-section renames, for a section a product calls something else. Overrides {@link variant}. */
	sectionLabels?: Partial<Record<StateMachineSection, string>>;
	/**
	 * Mount the page shell — the header band and the left section rail. Defaults to what the variant
	 * declares, which is `true` for both product cuts.
	 *
	 * `false` gives the GRAPH ALONE, for embedding a state machine inside a surface that already has
	 * its own chrome. It turns the editing rail off with it, and the two go together on purpose: a
	 * dragged edge takes its action binding in the rail, so a rail-less mount that still accepted
	 * connections would strand every drag. Selection and layout drag still commit.
	 */
	shell?: boolean;
	/**
	 * Transient edit state — selection, SLA tint, last refusal, the pre-filled transition draft.
	 *
	 * Controlled-OPTIONAL: pass it (with {@link onEditChange}) when the host has other surfaces that
	 * must agree about which state is selected, as the process page's Instances and Bottlenecks
	 * sections do. Omit both and the builder owns the state itself.
	 */
	edit?: Wc3ProcessEditState;
	onEditChange?: (next: Wc3ProcessEditState) => void;
	/** Opens an ontology element the inspector links to. Without it those links are plain text. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
	/**
	 * The permit identity shown in the `work-permit` variant's left panel.
	 *
	 * Controlled-OPTIONAL, like {@link edit}: omit it (and {@link onPermitChange}) and the builder
	 * seeds it from the record and owns it. `name` is mirrored back onto the record through
	 * `updateProcessMeta` either way, because that is the one field with a home there.
	 *
	 * Ignored by variants with no permit panel.
	 */
	permit?: Wc3PermitMeta;
	onPermitChange?: (next: Wc3PermitMeta) => void;
	/** Which section the rail has open. Controlled-optional; ignored by variants with no shell. */
	section?: StateMachineSection;
	onSectionChange?: (next: StateMachineSection) => void;
	/** Renders a Back button in the header band. Omitted, there is nothing to go back to and no button. */
	onBack?: () => void;
	/**
	 * Authoring mode: this graph is being written, not inspected. Default false.
	 *
	 * ONE flag rather than a handful, because every surface it removes fails for the same reason —
	 * each reports on an ESTABLISHED process, and on a graph created moments ago it is not merely
	 * empty but WRONG. The lint rules flag a graph whose only fault is being unfinished. The token
	 * counts are the backing object type's existing rows, which belong to whatever process already
	 * owns them, not to this draft. The product chip, the evidence note and the SLA model report
	 * provenance a new record does not have. So they go together:
	 *
	 * - Header band — keeps Back and the name; drops the glyph, product chip, SLA badge, lint count,
	 *   the states/transitions/tokens line and the SLA-tint switch.
	 * - Section rail — General, Canvas and Form only. Instances and Bottlenecks are views of live work
	 *   this graph has never done.
	 * - General — identity alone: no icon, no ontology binding row, and none of the cards below it.
	 *   The transition legend and the state list are already on the canvas, so nothing is lost.
	 *
	 * Ignored when there is no shell.
	 */
	authoring?: boolean;
	/** Rendered in the Form section. Defaults to a scaffold naming what belongs there. */
	formSlot?: ReactNode;
	/**
	 * Actions for the far right of the header band — save, discard, publish.
	 *
	 * A slot rather than a prop per action: what "saving" MEANS belongs to the host. A permit template
	 * register publishes a version; the process page commits on every edit and has nothing to save.
	 * The builder knows neither, and guessing would put a Save button on a surface that autosaves.
	 * Ignored when there is no shell.
	 */
	headerActions?: ReactNode;
	/** Extra rail cards, appended below the built-in ones. Ignored by variants with no rail. */
	railFooter?: ReactNode;
	/** Applied to the widget's outer grid — the host owns the gutters. */
	className?: string;
};

/**
 * The state-machine authoring surface: header band, section rail, canvas and editing panel.
 *
 * Pick the cut with {@link StateMachineProps.variant} — `connect` or `work-permit`. Both render the
 * same canvas, the same editing panel and the same guards; they differ in the left rail alone.
 *
 * Height contract: the canvas fills its container, so the container MUST resolve a height. Placed in
 * a box with no resolved height the canvas collapses to a 0px strip — the same failure GraphCanvas
 * documents, inherited here because this widget is one.
 *
 * ```tsx
 * <div className="h-[42rem]">
 *   <StateMachine variant="connect" process={process} onChange={setProcess} />
 * </div>
 * ```
 */
export function StateMachine({
	process,
	onChange,
	variant = "connect",
	shell: shellProp,
	edit: editProp,
	onEditChange,
	onNavigate,
	permit: permitProp,
	onPermitChange,
	section: sectionProp,
	onSectionChange,
	onBack,
	formSlot,
	headerActions,
	railFooter,
	authoring = false,
	actions = NO_ACTIONS,
	effects = NO_EFFECTS,
	stateFlags = DEFAULT_STATE_FLAGS,
	instances = NO_ROWS,
	instancesLoading = false,
	readOnly = false,
	sections: sectionsProp,
	sectionLabels: sectionLabelsProp,
	className,
}: StateMachineProps) {
	const traits = VARIANT_TRAITS[variant];
	// The traits a caller may override. `variant` is a preset: it supplies these, and anything passed
	// explicitly wins — which is what lets a third product declare its own rail without a key in an
	// enum here.
	const shell = shellProp ?? traits.shell;
	const sectionGroups = sectionsProp ?? traits.sections;
	const sectionLabels = sectionLabelsProp ?? traits.sectionLabels;
	const {permitFields} = traits;
	// Read-only takes the rail with it: the rail is where every edit is made.
	const editing = shell && traits.rail && !readOnly;

	// One object for the whole subtree, memoised so the deep pieces do not re-render on every parent
	// render just because a literal changed identity.
	const data = useMemo(
		() => ({actions, effects, stateFlags, instances, readOnly}),
		[actions, effects, stateFlags, instances, readOnly],
	);
	/**
	 * Which section the rail opens on.
	 *
	 * AUTHORING ALWAYS OPENS ON THE CANVAS. A graph that is being written has nothing else worth
	 * landing on — Instances and Bottlenecks are dropped in that mode, and General is identity fields
	 * for a record whose whole point is the shape being drawn behind them. The work-permit cut is the
	 * one this changes: its rail leads with General, which is right for an existing template and
	 * wrong for a blank one.
	 */
	const defaultSection = authoring ? "canvas" : (sectionGroups[0]?.items[0] ?? "canvas");

	// Controlled-optional. `editProp` is read at call time, so a functional update always sees the
	// value the host is currently rendering.
	const [ownEdit, setOwnEdit] = useState<Wc3ProcessEditState>(WC3_PROCESS_EDIT_INITIAL);
	const controlled = editProp !== undefined;
	const edit = editProp ?? ownEdit;
	const setEdit = useCallback(
		(update: (prev: Wc3ProcessEditState) => Wc3ProcessEditState) => {
			if (controlled) onEditChange?.(update(editProp as Wc3ProcessEditState));
			else setOwnEdit(update);
		},
		[controlled, editProp, onEditChange],
	);

	// Same controlled-optional shape as `edit`, for the same reason: the process page may want the
	// permit fields in its own header, and a standalone mount should not need a host to work.
	const [ownPermit, setOwnPermit] = useState<Wc3PermitMeta>(() => ({
		name: process.name,
		type: "",
		description: "",
		policy: WC3_PERMIT_POLICY_INITIAL,
	}));
	const permit = permitProp ?? ownPermit;
	const setPermit = (next: Wc3PermitMeta) => {
		if (permitProp === undefined) setOwnPermit(next);
		onPermitChange?.(next);
		// `name` is the one field with a home on the record. Mirroring it here is what keeps the panel
		// from being a second, divergent copy of the process name.
		if (next.name !== process.name) onChange(updateProcessMeta(process, {name: next.name}));
	};

	const [ownSection, setOwnSection] = useState<StateMachineSection>(defaultSection);
	const section = sectionProp ?? ownSection;
	const setSection = (next: StateMachineSection) => {
		if (sectionProp === undefined) setOwnSection(next);
		onSectionChange?.(next);
	};

	const typeOptions = useMemo(() => permitTypeOptions(process, instances), [process, instances]);

	const [pending, setPending] = useState<{
		kind: "state" | "transition";
		id: string;
	} | null>(null);
	// Which half of the rail is open. Held rather than derived from the selection: with nothing
	// selected there is no selection to derive from, and the user must still be able to reach the
	// add-transition form. Every gesture that changes the subject moves it — see the canvas handlers.
	const [railTab, setRailTab] = useState<RailTab>("state");
	const [newStateErr, setNewStateErr] = useState<string | null>(null);
	// Whether the in-place add forms are open. A canvas drag opens the transition one — see onConnect —
	// because otherwise the endpoints it fills in would land on a form nobody can see.
	const [addingState, setAddingState] = useState(false);
	const [addingTransition, setAddingTransition] = useState(false);

	// Cleared whenever the open process changes — including graphErr, which the prototype leaves on
	// screen after switching processes. That is a bug we do not port. When `edit` is controlled the
	// host resets it; resetting `ownEdit` here is then a no-op on unread state.
	useEffect(() => {
		setOwnEdit(WC3_PROCESS_EDIT_INITIAL);
		setOwnSection(defaultSection);
		setRailTab("state");
		setOwnPermit({name: process.name, type: "", description: "", policy: WC3_PERMIT_POLICY_INITIAL});
		setPending(null);
		setNewStateErr(null);
		setAddingState(false);
		setAddingTransition(false);
		// `process.name` is deliberately NOT a dependency: this reseeds when a DIFFERENT process opens,
		// and rerunning it on every rename would fight the name field keystroke by keystroke.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [process.id]);

	const rows = useMemo(() => [...instances], [instances]);
	const facts = useMemo(() => processFacts(process, rows, actions), [process, rows, actions]);

	/**
	 * What the validity check depends on: the SHAPE of the graph, not the record.
	 *
	 * Every commit deep-clones the process, so `process` itself changes identity when a state is
	 * merely dragged. Hashing the fields the rules actually read keeps the footer from re-checking on
	 * a move that cannot alter the answer.
	 */
	const graphKey = useMemo(
		() =>
			[
				process.states.map((state) => `${state.id}:${state.type}:${state.category}:${state.flags.join("+")}`).join("|"),
				process.transitions.map((t) => `${t.id}:${t.from}>${t.to}:${t.actionTypeId}`).join("|"),
			].join("//"),
		[process.states, process.transitions],
	);

	// ── Canvas derivation ─────────────────────────────────────────────────────
	// Positions are fed STRAIGHT from the record's `layout`, seeded once by processLayout() at seed
	// time and thereafter owned by the drag. No layout pass on render: recomputing would fight every
	// drag and snap a moved state back the moment anything else changed.
	//
	// Both maps stay as close to a bare React Flow node/edge as the graph allows: `type: "default"`,
	// no `style`, no `markerEnd` colour, no label styling. Selection rides React Flow's own
	// `selected` flag rather than a border of ours, so a picked state gets the library's selected
	// shadow and a picked transition its `#555` stroke.
	const flowNodes: Node[] = useMemo(
		() =>
			process.states.map((state) => ({
				id: state.id,
				type: "default",
				position: process.layout[state.id] ?? {x: 36, y: 34},
				selected: edit.stateSel === state.id,
				// The ONE thing this node says that a bare default node cannot: which state it is. The
				// state's identity colour is the same value the rail's State list prints as a dot beside
				// every row, so the canvas and the list name a state the same way.
				//
				// Set as React Flow's own --xy-node-background-color, not a `background` of ours, so
				// everything else about the box stays the library's — and mixed INTO
				// --xy-node-background-color-default rather than into a literal white, so the tint lands
				// on #fff in light mode and #1e1e1e in dark without a second table of colours.
				style: {
					["--xy-node-background-color"]: `color-mix(in srgb, ${state.color} ${WC3_PROCESS_NODE_TINT}, var(--xy-node-background-color-default))`,
				} as CSSProperties,
				data: {state} satisfies ProcFlowNodeData,
			})),
		[process.states, process.layout, edit.stateSel],
	);

	const flowEdges: Edge[] = useMemo(() => {
		const known = new Set(process.states.map((s) => s.id));
		return process.transitions
			.map((t): Edge | null => {
				// Guarded on both endpoints, so a transition left by a half-applied edit draws nothing
				// rather than dangling. deleteState cascades, so this should never fire.
				if (!known.has(t.from) || !known.has(t.to)) return null;
				const selfLoop = t.from === t.to;
				const backward = !selfLoop && (process.layout[t.to]?.x ?? 0) < (process.layout[t.from]?.x ?? 0);
				// A self-loop and a backward edge only RENDER when source and target resolve to different
				// handles. With in/out alone the extension loop draws nothing and every reopen /
				// reject_loop overlays the forward edge beside it. This is routing, not decoration, so it
				// survives the move to default styling; the edge itself is a plain default bezier.
				//
				// The two cases take DIFFERENT handle pairs, and the difference is the bezier's own
				// geometry. A backward edge runs bottom → top and reads as an arc under the row. A
				// self-loop cannot: both endpoints sit on one node, so bottom → top puts all four
				// control points on the same x and the "loop" comes out as a straight vertical line
				// drawn THROUGH the node. Leaving from the right and returning into the top gives the
				// two ends different axes, and the default curve swings clear over the top-right corner
				// on its own.
				return {
					id: t.id,
					source: t.from,
					target: t.to,
					sourceHandle: backward ? "back-out" : "out",
					targetHandle: selfLoop || backward ? "back-in" : "in",
					// NO label. The transition keys are long snake_case identifiers — reject_from_submitted,
					// reopen_from_rejected — and printing one on every line put more text between the
					// nodes than inside them, crossing the neighbouring edges to do it. A transition is
					// named in three places that can hold the whole key: the rail's Transition list, the
					// state inspector's outgoing rows, and the inspector a click on the edge opens.
					selected: edit.transSel === t.id,
					// The ONE edge style that survives the move to React Flow's defaults, and it earns it by
					// carrying state rather than decoration: a dashed line is an edge that has been drawn
					// but not bound to an action type yet. It is what makes commit-on-drop honest — the
					// gesture keeps its line, and the line says it is not finished. Rule L7 says the same
					// thing in the footer, and the publish gate enforces it.
					...(t.actionTypeId === null ? {style: {strokeDasharray: "5 4"}} : {}),
					// The one addition to the default edge. Direction is the whole content of a state
					// machine — an unmarked line does not say which way the transition runs — and leaving
					// `color` off keeps the head on React Flow's own `#b1b1b7`.
					markerEnd: {type: MarkerType.ArrowClosed},
				} satisfies Edge;
			})
			.filter((edge): edge is Edge => edge !== null);
	}, [process.states, process.transitions, process.layout, edit.transSel]);

	const [nodes, setNodes, onNodesChange] = useNodesState<Node>(flowNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

	// React Flow owns positions DURING a drag; the record owns them between drags. Re-seeding on every
	// derivation change is safe because a drag does not touch `process` until onNodeDragStop commits.
	useEffect(() => setNodes(flowNodes), [flowNodes, setNodes]);
	useEffect(() => setEdges(flowEdges), [flowEdges, setEdges]);

	// ── Editing ───────────────────────────────────────────────────────────────
	const openAddState = () => {
		setNewStateErr(null);
		setAddingState(true);
	};

	const addNewState = (draft: {name: string; category: Wc3ProcessState["category"]; type: Wc3ProcessState["type"]}) => {
		const name = draft.name.trim();
		if (!name) {
			setNewStateErr(WC3_PROCESS_MESSAGES.nameRequired);
			return;
		}
		if (
			process.states.some(
				(s) => s.name.toLowerCase() === name.toLowerCase() || s.value.toLowerCase() === name.toLowerCase(),
			)
		) {
			setNewStateErr(WC3_PROCESS_MESSAGES.stateNameTaken);
			return;
		}
		setNewStateErr(null);
		// addState owns id, value, colour and layout; the two fields the form asked for are applied on
		// top through the same pure helper the inspector uses, so there is one way a state is written.
		const {process: added, stateId} = addState(process, name);
		onChange(updateState(added, stateId, {category: draft.category, type: draft.type}));
		setEdit((state) => ({...state, stateSel: stateId, transSel: null, graphErr: null}));
		setRailTab("state");
		setAddingState(false);
	};

	const closeAddTransition = () => {
		setAddingTransition(false);
		setEdit((state) => ({...state, draftTransition: {from: null, to: null, actionTypeId: null}, graphErr: null}));
	};

	const commitTransition = (args: {from: string; to: string; actionTypeId: string | null}) => {
		const check = checkTransition(process, args.from, args.to, args.actionTypeId, actions);
		if (!check.ok) {
			// Verbatim from checkTransition(). No surface rewords a refusal.
			setEdit((state) => ({...state, graphErr: check.reason}));
			return;
		}
		const {process: next, transitionId} = addTransition(process, {
			from: args.from,
			to: args.to,
			// checkTransition already refused a null / dangling binding, so this is safe.
			actionTypeId: args.actionTypeId,
		});
		onChange(next);
		setEdit((state) => ({
			...state,
			graphErr: null,
			transSel: transitionId,
			stateSel: null,
			draftTransition: {from: null, to: null, actionTypeId: null},
		}));
		setRailTab("transition");
		setAddingTransition(false);
	};

	/**
	 * The drag-time guards. Probed with a resolvable binding so guards 1 and 4 — the only two a drag
	 * can violate — decide the drop; the binding itself is checked when the form commits.
	 */
	const validateDrag = useCallback(
		(connection: Connection | Edge) => checkTransition(process, connection.source, connection.target, null, actions),
		[process, actions],
	);

	/**
	 * The refusal surface. `isValidConnection` blocks the drop, which means `onConnect` never fires for
	 * a refused edge and the reason would never be read — so the guards run again here, on the pair the
	 * drag actually ended on, and their message lands in the warn banner verbatim. Handles are resolved
	 * by TYPE, not by drag direction, so dragging target→source refuses for the same reason as
	 * source→target rather than for a spurious one.
	 */
	const onConnectEnd = useCallback(
		(_event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
			const {fromHandle, toHandle} = state;
			if (!fromHandle || !toHandle) return;
			const source = fromHandle.type === "source" ? fromHandle : toHandle;
			const target = fromHandle.type === "source" ? toHandle : fromHandle;
			if (!source.nodeId || !target.nodeId) return;
			const check = checkTransition(process, source.nodeId, target.nodeId, null, actions);
			setEdit((edited) => ({
				...edited,
				graphErr: check.ok ? null : check.reason,
			}));
		},
		[process, actions, setEdit],
	);

	/**
	 * A LEGAL drop COMMITS, unbound.
	 *
	 * The drag supplies both endpoints; addTransition derives the key and the kind; the binding is
	 * left null and rule L7 carries it from there. Then the new edge is SELECTED and its inspector
	 * opened, so the field the drop could not fill is the field under the cursor — draw the line,
	 * finish it in place. One onChange, so undo drops the edge and nothing else.
	 */
	const onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return;
			const {process: next, transitionId} = addTransition(process, {
				from: connection.source,
				to: connection.target,
				actionTypeId: null,
			});
			onChange(next);
			setRailTab("transition");
			setAddingTransition(false);
			setEdit((state) => ({
				...state,
				graphErr: null,
				stateSel: null,
				transSel: transitionId,
				draftTransition: {from: null, to: null, actionTypeId: null},
			}));
		},
		[process, onChange, setEdit],
	);

	const requestDeleteState = (stateId: string) => {
		// Blocked BEFORE the dialog: a state holding live tokens cannot be deleted at all, so asking
		// "are you sure?" would be asking about something that will not happen.
		const reason = stateDeleteBlockReason(process, stateId, rows);
		if (reason) {
			setEdit((state) => ({...state, graphErr: reason}));
			return;
		}
		setPending({kind: "state", id: stateId});
	};

	const confirmPending = () => {
		if (!pending) return;
		if (pending.kind === "state") {
			// Cascades: deleteState drops every transition touching the state, so the canvas can never
			// keep a stub edge.
			onChange(deleteState(process, pending.id));
			setEdit((state) => ({...state, stateSel: null, graphErr: null}));
		} else {
			onChange(deleteTransition(process, pending.id));
			setEdit((state) => ({...state, transSel: null, graphErr: null}));
		}
		setPending(null);
	};

	const pendingState = pending?.kind === "state" ? process.states.find((s) => s.id === pending.id) : undefined;
	const pendingTransition =
		pending?.kind === "transition" ? process.transitions.find((t) => t.id === pending.id) : undefined;

	/*
	 * Height strategy (A): the canvas owns the height, the builder does not scroll, and the right
	 * panel scrolls inside itself. min-h-0 all the way down — this grid, the canvas column, the
	 * GraphCanvas wrapper — or the canvas collapses to a 0px strip.
	 *
	 * No gap and no Card. The canvas is the work; a rounded, bordered box floating inside a padded
	 * well made it a picture OF the work, and every rule and gutter around it took width the graph
	 * wanted. The editing rail is the shell's LEFT panel mirrored — same bg-card, same one-pixel
	 * border, same full height, its own scroll — so the middle is nothing but canvas.
	 */
	const workflowStage = (
		<div
			className={cn(
				"wwc:grid wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:overflow-hidden",
				editing && "wwc:lg:grid-cols-[minmax(0,1fr)_22rem]",
			)}
		>
			<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:overflow-hidden wwc:bg-card">
				{edit.graphErr && (
					<div className="wwc:flex wwc:shrink-0 wwc:items-start wwc:gap-2 wwc:border-b wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
						<XCircle className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
						{/* Verbatim from checkTransition() / stateDeleteBlockReason(). No surface rewords a
						    refusal. */}
						<span>
							<b>Edit refused:</b> {edit.graphErr}
						</span>
					</div>
				)}

				<div className="wwc:min-h-0 wwc:flex-1">
					{process.states.length === 0 ? (
						// Only reachable by deleting every state: createProcess() seeds two.
						<Empty
							title="No states"
							description="This process has no states left. Add one in the rail on the right — a graph needs one initial state, one terminal state and at least one active state to pass rules L1–L3."
						/>
					) : (
						<GraphCanvas
							// "free", not the "layered" default, so the canvas keeps React Flow's OWN edge
							// type — the default bezier — instead of GraphCanvas's smoothstep wiring. A state
							// machine is not the layered DAG that default was written for: it runs backwards
							// and loops onto itself, and the orthogonal segments turned every one of those
							// into a staircase. The fit padding is passed back explicitly; only the edge
							// default was in the way.
							layout="free"
							fitViewOptions={{padding: 0.12}}
							nodes={nodes}
							edges={edges}
							onNodesChange={onNodesChange}
							onEdgesChange={onEdgesChange}
							nodeTypes={PROCESS_NODE_TYPES}
							// No rail means nowhere to give a dragged connection its action binding, so the
							// `canvas` variant refuses the gesture outright rather than opening a dead end.
							nodesConnectable={editing}
							// Read-only pins the layout too. A viewer nudging a box would otherwise commit a
							// moveState through onChange and write to a record they are not editing.
							nodesDraggable={!readOnly}
							onConnect={editing ? onConnect : undefined}
							// Refuses an illegal edge during the drag itself, so the guards are the connection
							// rule rather than an after-the-fact rejection.
							isValidConnection={(connection) => editing && validateDrag(connection).ok}
							onConnectStart={() => setEdit((state) => ({...state, graphErr: null}))}
							onConnectEnd={onConnectEnd}
							onNodeClick={(_, node) => {
								setRailTab("state");
								setEdit((state) => ({
									...state,
									stateSel: state.stateSel === node.id ? null : node.id,
									transSel: null,
								}));
							}}
							// React Flow owns the position during the drag; ONE commit lands on drag end.
							onNodeDragStop={
								readOnly
									? undefined
									: (_, node) => onChange(moveState(process, node.id, node.position.x, node.position.y))
							}
							onEdgeClick={(_, edge) => {
								setRailTab("transition");
								setEdit((state) => ({
									...state,
									transSel: state.transSel === edge.id ? null : edge.id,
									stateSel: null,
								}));
							}}
							onPaneClick={() =>
								setEdit((state) => ({
									...state,
									stateSel: null,
									transSel: null,
									graphErr: null,
								}))
							}
						>
							{!readOnly && <TidyLayoutButton onTidy={() => onChange({...process, layout: processLayout(process)})} />}
						</GraphCanvas>
					)}
				</div>

				{/* Centred, because it is the canvas's own readout rather than a caption for something to
				    its left — and centred is where the eye already is when the graph is what changed. */}
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center wwc:border-t wwc:border-border wwc:px-3 wwc:py-2">
					<WorkflowStatus lint={facts.lint} graphKey={graphKey} />
				</div>
			</div>

			{editing && (
				<div className="wwc:flex wwc:min-h-0 wwc:flex-col wwc:gap-4 wwc:overflow-y-auto wwc:border-t wwc:border-border wwc:bg-card wwc:p-4 wwc:lg:border-t-0 wwc:lg:border-l">
					{/*
					 * The rail is split by WHAT IS BEING EDITED, because inspecting and adding are the same
					 * subject twice: the State tab holds the state inspector and the add-state form, the
					 * Transition tab its two counterparts. Before, "Add transition" sat below a card headed
					 * "State" and the pairing had to be inferred from reading order.
					 *
					 * The tab FOLLOWS the canvas rather than being an independent switch — clicking a state,
					 * clicking an edge, or dropping a legal connection all move it, because otherwise the
					 * surface the gesture just filled in would be the hidden one.
					 */}
					<Tabs value={railTab} onValueChange={(value) => setRailTab(value as RailTab)}>
						{/* Icons echo the canvas: a state is a node, a transition is the arrow between two. The
						    base trigger is inline-flex with no gap, so each supplies its own. */}
						<TabsList className="wwc:grid wwc:w-full wwc:grid-cols-2">
							<TabsTrigger value="state" className="wwc:gap-1.5">
								<CircleDot className="wwc:h-3.5 wwc:w-3.5" />
								State
							</TabsTrigger>
							<TabsTrigger value="transition" className="wwc:gap-1.5">
								<ArrowRight className="wwc:h-3.5 wwc:w-3.5" />
								Transition
							</TabsTrigger>
						</TabsList>

						{/*
						 * Each tab is a LIST that expands in place, not a card that shows whatever happens to be
						 * selected. The graph is the thing being authored, so every state and every transition
						 * should be reachable from the rail without hunting for it on the canvas first — and the
						 * open row IS the selection, so expanding one rings its node and clicking a node opens
						 * its row. One value, two ways to set it.
						 */}
						<TabsContent value="state" className="wwc:mt-4 wwc:space-y-4">
							<ProcessRailCard title="States" count={process.states.length}>
								{process.states.length === 0 ? (
									<p className="wwc:text-xs wwc:text-muted-foreground">
										No states yet. Add the first one below — a graph needs an initial state, a terminal state and at
										least one active state to pass rules L1–L3.
									</p>
								) : (
									<Accordion
										type="single"
										collapsible
										// "" is Radix's "nothing open". Mapping it to a null selection is what keeps the
										// accordion and the canvas from disagreeing about what is in scope.
										value={edit.stateSel ?? ""}
										onValueChange={(next) =>
											setEdit((state) => ({...state, stateSel: next || null, transSel: null, graphErr: null}))
										}
									>
										{process.states.map((state) => (
											<AccordionItem key={state.id} value={state.id} className="wwc:last:border-b-0">
												<AccordionTrigger className="wwc:py-2.5 wwc:hover:no-underline">
													<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
														{/* The state's own colour, inline — fixture identity, never chrome. */}
														<span
															className="wwc:size-2 wwc:shrink-0 wwc:rounded-full"
															style={{background: state.color}}
														/>
														<span className="wwc:truncate">{state.name}</span>
														<span className="wwc:shrink-0 wwc:text-[10px] wwc:text-muted-foreground">
															{state.category}
															{state.type === "initial" ? " · initial" : state.type === "terminal" ? " · terminal" : ""}
														</span>
													</span>
												</AccordionTrigger>
												<AccordionContent className="wwc:pb-4">
													<StateInspector
														process={process}
														state={state}
														authoring={authoring}
														onChange={onChange}
														onDelete={() => requestDeleteState(state.id)}
														onSelectTransition={(id) => {
															setEdit((current) => ({...current, transSel: id, stateSel: null, graphErr: null}));
															setRailTab("transition");
														}}
													/>
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								)}

								<div className="wwc:mt-3">
									{addingState ? (
										<AddStateForm onCancel={() => setAddingState(false)} onAdd={addNewState} error={newStateErr} />
									) : (
										<Button variant="outline" size="sm" className="wwc:w-full wwc:gap-1.5" onClick={openAddState}>
											<Plus className="wwc:h-3.5 wwc:w-3.5" />
											Add state
										</Button>
									)}
								</div>
							</ProcessRailCard>
						</TabsContent>

						<TabsContent value="transition" className="wwc:mt-4 wwc:space-y-4">
							<ProcessRailCard title="Transitions" count={facts.transitionCount}>
								{process.transitions.length === 0 ? (
									<p className="wwc:text-xs wwc:text-muted-foreground">
										No transitions yet. Add one below, or drag between two states on the canvas to pre-fill the form.
									</p>
								) : (
									<Accordion
										type="single"
										collapsible
										value={edit.transSel ?? ""}
										onValueChange={(next) =>
											setEdit((state) => ({...state, transSel: next || null, stateSel: null, graphErr: null}))
										}
									>
										{process.transitions.map((transition) => {
											const from = process.states.find((s) => s.id === transition.from);
											const to = process.states.find((s) => s.id === transition.to);
											return (
												<AccordionItem key={transition.id} value={transition.id} className="wwc:last:border-b-0">
													<AccordionTrigger className="wwc:py-2.5 wwc:hover:no-underline">
														<span className="wwc:flex wwc:min-w-0 wwc:flex-col wwc:items-start wwc:gap-0.5">
															<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1.5">
																<span className="wwc:truncate">{transition.key}</span>
																{transition.proposed && <ProposedTag />}
															</span>
															<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1 wwc:text-[10px] wwc:font-normal wwc:text-muted-foreground">
																<span className="wwc:truncate">{from?.name ?? "deleted"}</span>
																<ArrowRight className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
																<span className="wwc:truncate">{to?.name ?? "deleted"}</span>
															</span>
														</span>
													</AccordionTrigger>
													<AccordionContent className="wwc:pb-4">
														<TransitionInspector
															process={process}
															transition={transition}
															onChange={onChange}
															onDelete={() => setPending({kind: "transition", id: transition.id})}
															onNavigate={onNavigate}
														/>
													</AccordionContent>
												</AccordionItem>
											);
										})}
									</Accordion>
								)}

								<div className="wwc:mt-3">
									{addingTransition ? (
										<AddTransitionForm
											process={process}
											draft={edit.draftTransition}
											onDraftChange={(next) => setEdit((state) => ({...state, draftTransition: next}))}
											onAdd={commitTransition}
											onCancel={closeAddTransition}
										/>
									) : (
										<Button
											variant="outline"
											size="sm"
											className="wwc:w-full wwc:gap-1.5"
											onClick={() => setAddingTransition(true)}
										>
											<Plus className="wwc:h-3.5 wwc:w-3.5" />
											Add transition
										</Button>
									)}
								</div>
							</ProcessRailCard>
						</TabsContent>
					</Tabs>

					{/* Outside the tabs: graph validity is a fact about the WHOLE graph, and half of it would
					    be unreachable behind whichever tab it was filed under. */}
					{facts.lint.length > 0 && (
						<ProcessRailCard title="Graph validity" count={facts.lint.length}>
							<div className="wwc:space-y-1">
								{facts.lint.map((error) => (
									<div key={`${error.rule}-${error.msg}`} className="wwc:flex wwc:gap-1.5 wwc:text-xs">
										<GitBranch className="wwc:mt-0.5 wwc:h-3 wwc:w-3 wwc:shrink-0 wwc:text-muted-foreground" />
										<span>
											<b>{error.rule}</b> {error.msg}
										</span>
									</div>
								))}
							</div>
						</ProcessRailCard>
					)}

					{railFooter}
				</div>
			)}
		</div>
	);

	const dialogs = (
		<>
			<ConfirmDialog
				open={pending?.kind === "state"}
				onOpenChange={(next) => {
					if (!next) setPending(null);
				}}
				title="Delete state"
				description={WC3_PROCESS_MESSAGES.deleteState(
					pendingState?.name ?? "",
					process.transitions.filter((t) => t.from === pending?.id || t.to === pending?.id).length,
				)}
				confirmLabel="Delete"
				destructive
				onConfirm={confirmPending}
			/>
			<ConfirmDialog
				open={pending?.kind === "transition"}
				onOpenChange={(next) => {
					if (!next) setPending(null);
				}}
				title="Delete transition"
				description={WC3_PROCESS_MESSAGES.deleteTransition(pendingTransition?.key ?? "")}
				confirmLabel="Delete transition"
				destructive
				onConfirm={confirmPending}
			/>
		</>
	);

	if (!shell) {
		return (
			<StateMachineDataContext.Provider value={data}>
				<div className={cn("wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col", className)}>
					{workflowStage}
					{dialogs}
				</div>
			</StateMachineDataContext.Provider>
		);
	}

	// Authoring drops the two views of live work. Filtered from the SAME trait rows the variant
	// declares rather than a second list, so a variant that adds a section gets it here for free — and
	// an emptied group is dropped whole, so its divider cannot survive as a rule above nothing.
	const visibleGroups = authoring
		? sectionGroups
				.map((group) => ({...group, items: group.items.filter((id) => id !== "instances" && id !== "bottlenecks")}))
				.filter((group) => group.items.length > 0)
		: sectionGroups;

	const railGroups: SideMenuGroup[] = visibleGroups.map((group) => ({
		divider: group.divider,
		items: group.items.map((id) => ({
			id,
			label: sectionLabels?.[id] ?? SECTION_LABEL[id],
			icon: SECTION_ICON[id],
			count:
				id === "canvas"
					? facts.stateCount
					: id === "instances"
						? facts.tokenCount
						: id === "bottlenecks"
							? facts.openCount
							: id === "general" && facts.lint.length > 0
								? facts.lint.length
								: undefined,
		})),
	}));

	const selectState = (stateId: string | null) => setEdit((state) => ({...state, stateSel: stateId, transSel: null}));

	const shellBody = (
		<div className={cn("wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col", className)}>
			{/*
			 * Fixed bar, sized to match PageContentHeader above it (compact density -> min-h-12, px-3) so
			 * the two stacked headers read as one band. The <h1> is legitimate here — the no-in-content-h1
			 * rule is about tab panes, not a drill-in header.
			 */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					{/* No onBack means the builder is mounted standalone — there is nowhere to go back TO, and
					    a button that does nothing is worse than no button. The divider goes with it. */}
					{onBack && (
						<>
							<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
								<ArrowLeft className="wwc:h-4 wwc:w-4" />
								Back
							</Button>
							<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
						</>
					)}
					{/* A permit template has no icon, so authoring shows none. */}
					{!authoring && <ProcessGlyphTile process={process} />}
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{process.name}</h1>
					{/* ProductChip is a plain component; used directly (not as an asChild trigger) it needs no
					    span wrapper. */}
					{!authoring && (
						<ProductChip
							process={process}
							onOpenProduct={onNavigate ? (key) => onNavigate(lineageNav.product(key)) : undefined}
						/>
					)}
					{!authoring && <SlaModelBadge process={process} />}
					{!authoring && facts.lint.length > 0 && (
						// GUIDANCE, not breakage: a process created from scratch is born failing L5 until its
						// first transition lands, and that must read as the next step.
						<HoverTooltip content={facts.lint.map((error) => `${error.rule}: ${error.msg}`).join(" ")}>
							{/* Badge forwards refs; this span is here because the tooltip's asChild trigger needs one
							    that does. */}
							<span>
								<Badge variant="warningSoft" className="wwc:gap-1 wwc:font-normal">
									<TriangleAlert className="wwc:h-3 wwc:w-3" />
									{facts.lint.length} lint
								</Badge>
							</span>
						</HoverTooltip>
					)}
					{!authoring && (
						<span className="wwc:hidden wwc:truncate wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
							{facts.stateCount} states · {facts.transitionCount} transitions · {facts.openCount} open tokens
						</span>
					)}
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3">
					{/* The SLA / bottleneck tint switch stood here. It coloured the state boxes by their
					    share of over-SLA tokens — a paint job on a node that no longer paints anything,
					    now that the canvas is on React Flow's default node. The same reading is still on
					    the page, unlost: the Bottlenecks section ranks states by exactly this measure and
					    the Instances table flags the over-SLA rows. */}
					{/* Last, so the commit actions sit hard against the right edge whatever else is shown. */}
					{headerActions}
				</div>
			</div>

			<RecordDetailShell
				title="Process"
				sections={railGroups}
				activeSectionId={section}
				onSectionChange={(id) => setSection(id as StateMachineSection)}
				// Always flush: the shell's padded well is recreated below (SectionWell) for the sections
				// that want it. This keeps every child a DIRECT child of the shell row, which is what lets
				// the form builder stay MOUNTED (merely display-hidden) when another section is showing —
				// if the tree position changed with `flush`, React would remount the slot and wipe its
				// in-progress state. Canvas and form still run edge to edge, the way a canvas should.
				flush
			>
				{/*
				 * The form builder holds local state (chosen build method, draft questions, selection).
				 * It must survive a trip to another section and back, so it is never unmounted — only
				 * hidden. First child, so its position is stable whatever section renders after it.
				 */}
				{formSlot ? (
					<div
						className={cn(
							"wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col",
							section === "form" ? "wwc:flex" : "wwc:hidden",
						)}
					>
						{formSlot}
					</div>
				) : null}
				{section === "canvas" ? (
					<div className="wwc:flex wwc:min-h-0 wwc:min-w-0 wwc:flex-1 wwc:flex-col">{workflowStage}</div>
				) : section === "general" ? (
					<SectionWell>
						<SettingsSection
							process={process}
							onChange={onChange}
							onNavigate={onNavigate}
							authoring={authoring}
							identityExtra={
								permitFields ? (
									<PermitFields permit={permit} onPermitChange={setPermit} typeOptions={typeOptions} />
								) : undefined
							}
						/>
					</SectionWell>
				) : section === "policy" ? (
					<SectionWell>
						<PermitPolicySection policy={permit.policy} onChange={(policy) => setPermit({...permit, policy})} />
					</SectionWell>
				) : section === "form" ? (
					formSlot ? null : (
						<SectionWell>
							<Empty
								title="Form"
								description="Nothing here yet. This is where the permit's request form goes — the fields an applicant fills in before the workflow has anything to move. Pass `formSlot` to fill it."
							/>
						</SectionWell>
					)
				) : section === "instances" ? (
					<SectionWell>
						<InstancesSection
							process={process}
							selectedStateId={edit.stateSel}
							onSelectState={selectState}
							loading={instancesLoading}
						/>
					</SectionWell>
				) : (
					// Imported, never duplicated: the selection lives in `edit`, so the canvas, the token queue
					// and the bottleneck ranking can never disagree about which state is in scope.
					<SectionWell>
						<ProcessBottlenecksSection
							process={process}
							instances={instances}
							selectedStateId={edit.stateSel}
							onSelectState={selectState}
							onOpenInstances={(stateId) => {
								selectState(stateId);
								setSection("instances");
							}}
						/>
					</SectionWell>
				)}
			</RecordDetailShell>

			{dialogs}
		</div>
	);

	return <StateMachineDataContext.Provider value={data}>{shellBody}</StateMachineDataContext.Provider>;
}
