import type {ComponentType, ReactElement, SVGProps} from "react";

import {cn} from "@core/core-utils";
import {ClipboardList, FileText, Flag, Search, Workflow} from "lucide-react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Empty} from "../empty";
import {LineageGlyph, type Wc3LineageNavTarget, type Wc3FsLinkProps} from "./wc3-lineage-shared";
import {getObjectType} from "./wc3-ontology-data";
import {
	WC3_PROCESSES,
	type Wc3Process,
	type Wc3ProcessBottleneck,
	type Wc3ProcessInstanceRow,
	type Wc3ProcessLintError,
	type Wc3ProcessState,
	type Wc3ProcessTransition,
	type Wc3ProcessTransitionKind,
	WC3_PROCESS_KIND_COLOR,
	processBottlenecks,
	demoInstances,
	processLint,
	processOpenRows,
	processProductKey,
	processRowOverSla,
	processTokens,
} from "./wc3-process-data";
import {type Wc3Product, getProduct} from "./wc3-product-data";

// The one module the three Processes surfaces share — the list/card catalogue, the single-process
// page (canvas + instances + settings) and the bottleneck section. Same rule as
// wc3-pipeline-shared.tsx and wc3-product-shared.tsx: it imports nothing from them, so there is no
// cycle and no helper has to be pasted three times.
//
// It owns four things that MUST NOT be restated anywhere else:
//   · the LIVE record shape (the frozen fixture plus the canvas layout the fixture has no field for)
//     and the layout pass that seeds it,
//   · every user-readable refusal / confirm string (checkTransition, stateDeleteBlockReason,
//     WC3_PROCESS_MESSAGES),
//   · every mutation — each one pure, process in → NEW process out, never an in-place write,
//   · the product-for-a-process resolution, which is DERIVED and not stored.
//
// What is deliberately NOT here, because it has exactly one consumer: the Create-process dialog and
// the list's column defs (list view); the React Flow node component, the handle geometry, the
// state/transition inspectors and the instances queue columns (detail); the aging histogram bars and
// the ranked bottleneck table (bottlenecks section). Keeping single-consumer code out is what keeps
// this module small enough to freeze while three agents build against it.

// ─── Props ───────────────────────────────────────────────────────────────────

export type Wc3ProcessViewProps = {
	/** The LIVE process array, owned by the workspace shell. Never read WC3_PROCESSES in a surface. */
	processes: Wc3ProcessRecord[];
	/** Commit a whole new array. Every mutation goes through this. */
	onProcessesChange: (next: Wc3ProcessRecord[]) => void;
	/** Reports the drill-in segment for the shell's breadcrumb. */
	onDetailChange?: (label: string | null) => void;
	/** Cross-perspective navigation. Carries a record id when the arrival names one — see `openRecordId`. */
	onNavigate?: (target: Wc3LineageNavTarget) => void;
} & Wc3FsLinkProps;

// Like Wc3PipelineViewProps and unlike Wc3ProductViewProps, the first two props are REQUIRED and
// there is no `= {}` default: a frozen fixture cannot be the fallback source of truth for an
// editable perspective.

// ─── The live record ─────────────────────────────────────────────────────────

/** Canvas position per state id. Seeded by {@link processLayout}, committed by {@link moveState}. */
export type Wc3ProcessLayout = Record<string, {x: number; y: number}>;

/**
 * A process as the session holds it: the frozen fixture shape plus the canvas layout the fixture has
 * no field for.
 *
 * `Wc3ProcessState` carries no x/y (unlike `Wc3PipelineNode`, whose fixture ships hand-placed
 * coordinates) because the prototype recomputes every position on every render via `procLayout`
 * (06-unified-workspace.html:7160-7183). Recomputing is fine for a read-only SVG and impossible for a
 * draggable canvas, so the layout is computed once at seed time and a drag commits into it.
 *
 * `layout` is UI geometry, not process semantics — which is exactly why the fixture type is left
 * untouched.
 */
export type Wc3ProcessRecord = Wc3Process & {layout: Wc3ProcessLayout};

// ─── Types ───────────────────────────────────────────────────────────────────

/** The catalogue's table⇄card toggle. One DataTable is mounted either way. */
export type Wc3ProcessViewMode = "table" | "cards";

/** A section of the single-process page — the four surfaces the shell used to declare as tabs. */
export type Wc3ProcessSection = "canvas" | "instances" | "bottlenecks" | "settings";

export const WC3_PROCESS_SECTIONS: readonly Wc3ProcessSection[] = ["canvas", "instances", "bottlenecks", "settings"];

/** Where a process came from — the list's one facet that becomes useful purely through use. */
export type Wc3ProcessOrigin = "seeded" | "session";

/** What the "Create process" dialog hands back. The record is built by {@link createProcess}. */
export type Wc3ProcessDraft = {name: string; icon: string; objectTypeId: string; statusProp: string};

/** The result of checking one proposed transition. `reason` is rendered verbatim. */
export type Wc3ProcessTransitionCheck =
	| {ok: true; kind: Wc3ProcessTransitionKind; note?: string}
	| {ok: false; reason: string};

/** Everything the list, the process header and the settings section derive from one record. */
export type Wc3ProcessFacts = {
	stateCount: number;
	transitionCount: number;
	terminalCount: number;
	/** Every token row of the backing object type. */
	tokenCount: number;
	/** Tokens in a non-terminal state — the live work. */
	openCount: number;
	overSlaCount: number;
	/** States flagged `custom:true` (added on top of core-standard-v1). */
	customStateCount: number;
	/** States + transitions flagged `proposed:true`. */
	proposedCount: number;
	/** DERIVED via objectTypeId -> installedBy.productKey. undefined = no product provenance. */
	productKey: string | undefined;
	productName: string | undefined;
	objectTypeName: string | undefined;
	/** alsoTouches resolved to {otId, displayName, productKey} — the cross-product story. */
	alsoTouches: {otId: string; displayName: string; productKey: string | undefined}[];
	/** Worst non-terminal state by {@link processBottlenecks} order, or undefined when nothing is open. */
	worstBottleneck: Wc3ProcessBottleneck | undefined;
	/** L1–L7. `[]` means the graph is publishable. */
	lint: Wc3ProcessLintError[];
	slaModel: "severity" | "per-state" | "none";
	origin: Wc3ProcessOrigin;
};

/** The transient page state. UI-only: never committed, never persisted, never undoable. */
export type Wc3ProcessEditState = {
	/** Selected state id — drives the canvas ring, the inspector and the bottleneck scope. */
	stateSel: string | null;
	/** Selected transition id. Mutually exclusive with `stateSel`, as in the prototype. */
	transSel: string | null;
	/** Last refused edit, shown as a warn banner. Verbatim from {@link checkTransition}. */
	graphErr: string | null;
	/** Add-transition form, pre-filled by a canvas drag. */
	draftTransition: {from: string | null; to: string | null; actionTypeId: string | null};
};

export const WC3_PROCESS_EDIT_INITIAL: Wc3ProcessEditState = {
	stateSel: null,
	transSel: null,
	graphErr: null,
	draftTransition: {from: null, to: null, actionTypeId: null},
};

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * The prototype's state colour swatches, in its order.
 *
 * Hex is legal here for the same reason WC3_PORT_COLORS is: these are FIXTURE IDENTITY colours,
 * applied INLINE (`style={{background}}`), never as a Tailwind class. The "always var(--wwc-color-*),
 * never hex" rule governs CHROME — node borders, backgrounds, edge stroke defaults — and still holds.
 */
export const WC3_PROCESS_STATE_COLORS: string[] = [
	"#0ea5e9",
	"#16a34a",
	"#d97706",
	"#dc2626",
	"#7c3aed",
	"#334155",
	"#64748b",
];

/** Edge kind -> readable label for the legend and the transition inspector. */
export const WC3_PROCESS_KIND_LABEL: Record<Wc3ProcessTransitionKind, string> = {
	forward: "Forward",
	reject_loop: "Reject loop",
	reopen: "Reopen",
	branch: "Branch",
	extension_loop: "Extension loop",
	close_out: "Close out",
};

/** Legend order — the prototype's own `kindColor` key order. */
export const WC3_PROCESS_TRANSITION_KINDS: readonly Wc3ProcessTransitionKind[] = [
	"forward",
	"reject_loop",
	"reopen",
	"branch",
	"extension_loop",
	"close_out",
];

/**
 * Create-process icon picker. Every name resolves through {@link ProcessGlyph}.
 *
 * Four of these eight — workflow / clipboard / file / flag — are in neither the ontology GLYPHS map
 * nor wc3-lineage-shared's LINEAGE_GLYPHS patch, so they would silently fall back to a generic Box
 * and the picker would show four identical squares. They are patched in PROCESS_GLYPHS below rather
 * than renamed, which is exactly what wc3-lineage-shared.tsx already does for its own ten missing
 * fixture icons. The other four (wrench / shield / bolt / process) resolve unaided.
 */
export const WC3_PROCESS_ICONS: string[] = [
	"workflow",
	"wrench",
	"shield",
	"clipboard",
	"bolt",
	"file",
	"flag",
	"process",
];

/**
 * Layout geometry for {@link processLayout} and the column/row arithmetic that reads its output back.
 *
 * `width` and `height` are React Flow's default node box, which is what the canvas draws now — the
 * node no longer sets a size of its own, so these describe it rather than dictate it. The gaps are
 * the prototype's and are unchanged: shrinking them to match the smaller box would re-space every
 * saved layout in every fixture.
 */
export const WC3_PROCESS_NODE = {width: 150, height: 36, colGap: 240, rowGap: 108} as const;

/** SLA thresholds, ported from the prototype's `stateBox()`: >0.5 over → danger, >0 → warn, else ok. */
export const WC3_PROCESS_TINT = {danger: 0.5} as const;

// ─── Record / layout ─────────────────────────────────────────────────────────

/**
 * Ported verbatim from the prototype's `procLayout` (06-unified-workspace.html:7160-7183): longest-path
 * depth from the initial state, cycle-guarded, with reopen edges and self-loops excluded from the walk
 * so they do not stretch the graph.
 *
 * Geometry: `x = 36 + depth * colGap`, `y = 34 + row * rowGap + (depth % 2) * 14`.
 *
 * DOCUMENTED FIDELITY NOTE: the prototype's own comment claims "reopen/reject edges don't stretch the
 * layout", but its code excludes only `kind === "reopen"`. The CODE is what is ported, so a
 * reject_loop still contributes depth exactly as it does in the prototype.
 */
export function processLayout(proc: Wc3Process): Wc3ProcessLayout {
	const depth: Record<string, number> = {};
	for (const s of proc.states) depth[s.id] = 0;

	const init = proc.states.find((s) => s.type === "initial") ?? proc.states[0];
	if (init) {
		const walk = (id: string, d: number, path: Set<string>) => {
			if (path.has(id)) return;
			depth[id] = Math.max(depth[id] ?? 0, d);
			const next = new Set(path);
			next.add(id);
			for (const t of proc.transitions) {
				if (t.from === id && t.kind !== "reopen" && t.to !== id) walk(t.to, d + 1, next);
			}
		};
		walk(init.id, 0, new Set());
	}

	const cols = new Map<number, Wc3ProcessState[]>();
	for (const s of proc.states) {
		const d = depth[s.id] ?? 0;
		const list = cols.get(d);
		if (list) list.push(s);
		else cols.set(d, [s]);
	}

	const pos: Wc3ProcessLayout = {};
	for (const d of [...cols.keys()].sort((a, b) => a - b)) {
		(cols.get(d) ?? []).forEach((s, i) => {
			pos[s.id] = {
				x: 36 + d * WC3_PROCESS_NODE.colGap,
				y: 34 + i * WC3_PROCESS_NODE.rowGap + (d % 2) * 14,
			};
		});
	}
	return pos;
}

/** Deep clone of the FIXTURE shape. Internal — every public path returns a record with a layout. */
function cloneProcessBase(p: Wc3Process): Wc3Process {
	return {
		...p,
		alsoTouches: [...p.alsoTouches],
		slaBySeverity: p.slaBySeverity ? {...p.slaBySeverity} : null,
		states: p.states.map((s) => ({...s, flags: [...s.flags]})),
		transitions: p.transitions.map((t) => ({...t, guards: [...t.guards]})),
	};
}

/**
 * Fixture -> live record. Deep clone + {@link processLayout}. Never aliases the frozen arrays: one
 * accidental in-place `proc.states.push` on WC3_PROCESSES would corrupt it for the whole app.
 */
export function seedProcessRecord(proc: Wc3Process): Wc3ProcessRecord {
	const base = cloneProcessBase(proc);
	return {...base, layout: processLayout(base)};
}

/** Deep enough that states, transitions, flags, guards and layout are freshly created. */
export function cloneProcess(p: Wc3ProcessRecord): Wc3ProcessRecord {
	const layout: Wc3ProcessLayout = {};
	for (const [id, pos] of Object.entries(p.layout)) layout[id] = {...pos};
	return {...cloneProcessBase(p), layout};
}

/** Commit one edited process back into the shell's live array. */
export function replaceProcess(list: Wc3ProcessRecord[], next: Wc3ProcessRecord): Wc3ProcessRecord[] {
	return list.map((p) => (p.id === next.id ? next : p));
}

export function uid(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Derivation ──────────────────────────────────────────────────────────────
//
// Every function below is pure and takes a LIVE record. None of them resolves a process THROUGH the
// frozen fixture: getProcess / processesForProduct close over WC3_PROCESSES and start lying the
// instant the session creates or renames one — the trap wc3-pipeline-list-view.tsx:46-49 documents
// for getPipeline. They are deliberately not re-exported.

/**
 * Which ids the fixture ships. This is the ONE thing WC3_PROCESSES is read for here, and it cannot go
 * stale the way a record lookup would: whether `proc_permit` was seeded is a permanent fact about the
 * fixture, not a claim about the current array.
 */
const SEEDED_PROCESS_IDS: ReadonlySet<string> = new Set(WC3_PROCESSES.map((p) => p.id));

/**
 * One entry in the vocabulary a transition may bind to.
 *
 * A bare `{id, label}` rather than the fixture's `Wc3ActionType`, because a consumer's action types
 * come out of its own ontology and it should not have to shape them like this repo's demo data to
 * be allowed to use the widget.
 */
export type StateMachineAction = {id: string; label: string};

/**
 * Bound action for a transition, resolved against the vocabulary the CALLER supplied.
 *
 * `actions` is a parameter, not a module lookup. It used to read a 24-entry demo fixture compiled
 * into the package, which meant a consumer's real ids came back undefined and were then reported as
 * "not in the ontology" — the ontology being one this repo made up.
 *
 * Undefined covers TWO different things and the callers that care tell them apart by reading
 * `actionTypeId` themselves: `null` is an edge that has been drawn but not bound yet, a non-null id
 * that misses is a dangling binding. Both are rule L7 — see {@link processGraphLint}.
 */
export function transitionAction(
	t: Wc3ProcessTransition,
	actions: readonly StateMachineAction[],
): StateMachineAction | undefined {
	return t.actionTypeId === null ? undefined : actions.find((a) => a.id === t.actionTypeId);
}

export function processSlaModel(p: Wc3Process): "severity" | "per-state" | "none" {
	if (p.slaBySeverity) return "severity";
	if (p.states.some((s) => s.slaHours !== null)) return "per-state";
	return "none";
}

/** The product a process belongs to, resolved through the object type's install record. */
export function processProduct(p: Wc3Process): Wc3Product | undefined {
	const key = processProductKey(p);
	return key ? getProduct(key) : undefined;
}

/**
 * {@link processLint} (L1–L6) PLUS the L7 rule the fixture deliberately omitted: a transition whose
 * binding does not resolve in the vocabulary the caller passed.
 *
 * L7 lives here and not in the fixture because with static bindings all 18 transitions resolve and it
 * can never fire — it becomes reachable the moment {@link rebindTransition} ships, and again the
 * moment a canvas drag creates an edge with no binding at all.
 *
 * TWO messages, one rule. An edge dropped on the canvas is not "bound to something wrong", it is not
 * bound yet, and telling an author their brand-new edge points at a missing action type would send
 * them looking for a bug. The rule id is the same because the consequence is: the graph does not
 * publish until it resolves.
 */
export function processGraphLint(p: Wc3Process, actions: readonly StateMachineAction[]): Wc3ProcessLintError[] {
	const errs = processLint(p);
	// NO VOCABULARY, NO RULE. With `actions` empty the caller has not told the widget what a
	// transition may bind to, so "this edge is not bound" is a statement about nothing. L7 would
	// otherwise fire on every edge and hold the graph back from publishing forever — which is
	// exactly the wall a consumer hits the moment it stops using this repo's demo actions.
	if (actions.length === 0) return errs;
	for (const t of p.transitions) {
		if (transitionAction(t, actions)) continue;
		errs.push({
			rule: "L7",
			msg:
				t.actionTypeId === null
					? `Transition “${t.key}” has no bound action type yet — bind it before publishing.`
					: `Transition “${t.key}” is bound to action type ${t.actionTypeId}, which is not in the ontology.`,
		});
	}
	return errs;
}

export function processFacts(
	p: Wc3ProcessRecord,
	instances: readonly Wc3ProcessInstanceRow[] = [],
	actions: readonly StateMachineAction[] = [],
): Wc3ProcessFacts {
	const rows = [...instances];
	const open = processOpenRows(p, rows);
	const productKey = processProductKey(p);
	const product = productKey ? getProduct(productKey) : undefined;
	const objectType = getObjectType(p.objectTypeId);

	const proposedStates = p.states.filter((s) => s.proposed === true).length;
	const proposedTransitions = p.transitions.filter((t) => t.proposed === true).length;

	// A state with zero tokens sorts last in processBottlenecks (overShare 0, maxAge 0), so the first
	// entry that actually holds a token is the honest headline.
	const worst = open.length === 0 ? undefined : processBottlenecks(p, rows).find((b) => b.tokens > 0);

	return {
		stateCount: p.states.length,
		transitionCount: p.transitions.length,
		terminalCount: p.states.filter((s) => s.type === "terminal").length,
		tokenCount: rows.length,
		openCount: open.length,
		overSlaCount: rows.filter((r) => processRowOverSla(p, r)).length,
		customStateCount: p.states.filter((s) => s.custom === true).length,
		proposedCount: proposedStates + proposedTransitions,
		productKey,
		productName: product?.displayName,
		objectTypeName: objectType?.displayName,
		alsoTouches: p.alsoTouches.map((otId) => {
			const ot = getObjectType(otId);
			return {
				otId,
				// The raw id rather than an invented name when the type is gone — the same honest
				// degradation TypeGlyphLabel makes with its italic "deleted".
				displayName: ot?.displayName ?? otId,
				productKey: ot?.installedBy?.productKey,
			};
		}),
		worstBottleneck: worst,
		lint: processGraphLint(p, actions),
		slaModel: processSlaModel(p),
		origin: SEEDED_PROCESS_IDS.has(p.id) ? "seeded" : "session",
	};
}

/**
 * The blob the list's "process" column matches on — ONE column filter, so it behaves identically in
 * table mode and card mode: the toggle only changes what DataTable renders, never what it filters.
 *
 * A column that ships hidden (evidence, SLA model) still participates through this.
 */
export function processSearchText(p: Wc3ProcessRecord): string {
	const ot = getObjectType(p.objectTypeId);
	const product = processProduct(p);
	return [
		p.name,
		p.id,
		p.statusProp,
		p.evidenceNote,
		p.slaNote,
		p.states.map((s) => s.name).join(" "),
		p.states.map((s) => s.value).join(" "),
		p.transitions.map((t) => t.key).join(" "),
		p.transitions.map((t) => t.actorRole).join(" "),
		ot?.displayName ?? "",
		product?.displayName ?? "",
	].join(" ");
}

/**
 * ONE PRODUCT, MANY PROCESSES — the user's requirement, made computable. Reads the LIVE array, so a
 * process created this session counts. Returns every process sharing this one's productKey, INCLUDING
 * itself, in array order.
 *
 * A process with NO product provenance is its own only sibling: an absent productKey is not a value
 * two processes can share.
 */
export function processSiblings(list: Wc3ProcessRecord[], p: Wc3ProcessRecord): Wc3ProcessRecord[] {
	const key = processProductKey(p);
	if (!key) return [p];
	return list.filter((other) => processProductKey(other) === key);
}

/**
 * productKey -> processes, off the LIVE array. Drives the list's product facet counts and the sibling
 * chip. Products with no processes are ABSENT rather than zero-valued — at n=2 every one of the 17
 * products except `safety` would otherwise be a dead option in the popover.
 *
 * A process with no product provenance is absent too, for the same reason: there is no key to file it
 * under, and inventing one ("unknown") would claim provenance the data does not have.
 */
export function processesByProduct(list: Wc3ProcessRecord[]): Map<string, Wc3ProcessRecord[]> {
	const out = new Map<string, Wc3ProcessRecord[]>();
	for (const p of list) {
		const key = processProductKey(p);
		if (!key) continue;
		const bucket = out.get(key);
		if (bucket) bucket.push(p);
		else out.set(key, [p]);
	}
	return out;
}

/**
 * apiNames of the backing object type's primary key and title property, resolved off
 * WC3_OBJECT_TYPES (`ot.primaryKey[0]` / `ot.titleKey` are PROPERTY IDS, which are then mapped to
 * `properties[].apiName`). Never hardcoded — a process created on any object type gets the right two
 * columns.
 */
export function processRowKeys(p: Wc3Process): {pk: string; title: string} {
	const ot = getObjectType(p.objectTypeId);
	if (!ot) return {pk: "", title: ""};
	const apiNameById = new Map(ot.properties.map((prop) => [prop.id, prop.apiName]));
	const pkId = ot.primaryKey[0] ?? "";
	return {
		pk: apiNameById.get(pkId) ?? pkId,
		title: apiNameById.get(ot.titleKey) ?? ot.titleKey,
	};
}

const cellString = (value: unknown): string => (value === null || value === undefined ? "" : String(value));

export function processRowPk(p: Wc3Process, row: Wc3ProcessInstanceRow): string {
	return cellString(row[processRowKeys(p).pk]);
}

export function processRowTitle(p: Wc3Process, row: Wc3ProcessInstanceRow): string {
	return cellString(row[processRowKeys(p).title]);
}

/**
 * "3 h" / "1.9 d" against the FROZEN clock. Never Date.now() — every age reaching this function was
 * computed by {@link processRowAgeHours}, which measures against WC3_PROCESS_FIXTURE_NOW. A surface
 * that formats an age any other way is wrong by years.
 */
export function formatHours(hours: number): string {
	if (!Number.isFinite(hours) || hours <= 0) return "0 h";
	if (hours < 1) return "<1 h";
	if (hours < 24) return `${Math.round(hours)} h`;
	return `${(hours / 24).toFixed(1)} d`;
}

// ─── Presentational ──────────────────────────────────────────────────────────

/**
 * Four of the eight WC3_PROCESS_ICONS names have no glyph anywhere in the port and would render as a
 * generic Box. Patched here rather than renamed, exactly as wc3-lineage-shared.tsx patches its ten.
 */
const PROCESS_GLYPHS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
	workflow: Workflow,
	clipboard: ClipboardList,
	file: FileText,
	flag: Flag,
};

/** A process's own glyph — `process.icon`, through LineageGlyph like every other fixture icon. */
export function ProcessGlyph({process, className}: {process: Wc3Process; className?: string}): ReactElement {
	const Patch = PROCESS_GLYPHS[process.icon];
	if (Patch) return <Patch className={className ?? "wwc:h-3.5 wwc:w-3.5 wwc:shrink-0"} />;
	return <LineageGlyph name={process.icon} className={className} />;
}

/** The 28px square identity tile — the card's, the table cell's and the detail header's avatar. */
export function ProcessGlyphTile({process, className}: {process: Wc3Process; className?: string}): ReactElement {
	return (
		<span
			className={cn(
				"wwc:flex wwc:size-7 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted wwc:text-muted-foreground",
				className,
			)}
		>
			<ProcessGlyph process={process} className="wwc:h-4 wwc:w-4 wwc:shrink-0" />
		</span>
	);
}

/** A state rendered inline: its identity colour dot plus its name. */
export function StateChip({state}: {state: Wc3ProcessState}): ReactElement {
	return (
		<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap">
			<span
				className="wwc:inline-block wwc:size-2 wwc:shrink-0 wwc:rounded-full"
				style={{background: state.color}}
				title={state.category}
			/>
			{state.name}
		</span>
	);
}

const FLAG_LABEL: Record<string, string> = {
	editableAnswers: "editable answers",
	mutableReceiver: "mutable receiver",
	authorizesWork: "authorizes work",
	monitored: "monitored",
	reopenable: "reopenable",
};

/** The behavioural markers the prototype paints on a state box. Nothing when the state has none. */
export function StateFlagBadges({state}: {state: Wc3ProcessState}): ReactElement {
	if (state.flags.length === 0) return <span className="wwc:text-muted-foreground">—</span>;
	return (
		<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1">
			{state.flags.map((flag) => (
				<Badge key={flag} variant="neutralSoft">
					{FLAG_LABEL[flag] ?? flag}
				</Badge>
			))}
		</span>
	);
}

/**
 * "PROPOSED" — a state or transition that does not exist in the as-built product yet. Dropping this
 * marker would make the port claim shipped behaviour it does not have.
 */
export function ProposedTag(): ReactElement {
	return <Badge variant="warningSoft">PROPOSED</Badge>;
}

/** "custom state" — added on top of the vendor default graph (not in core-standard-v1). */
export function CustomTag(): ReactElement {
	return <Badge variant="infoSoft">custom state</Badge>;
}

const KIND_VARIANT: Record<
	Wc3ProcessTransitionKind,
	"infoSoft" | "warningSoft" | "dangerSoft" | "successSoft" | "neutralSoft"
> = {
	forward: "infoSoft",
	reject_loop: "dangerSoft",
	reopen: "neutralSoft",
	branch: "warningSoft",
	extension_loop: "successSoft",
	close_out: "neutralSoft",
};

/** The edge kind as a badge, carrying its canvas colour so the two can never read as different edges. */
export function TransitionKindBadge({kind}: {kind: Wc3ProcessTransitionKind}): ReactElement {
	return (
		<Badge variant={KIND_VARIANT[kind] ?? "neutralSoft"}>
			<span
				className="wwc:inline-block wwc:size-2 wwc:shrink-0 wwc:rounded-full"
				style={{background: WC3_PROCESS_KIND_COLOR[kind]}}
			/>
			{WC3_PROCESS_KIND_LABEL[kind] ?? kind}
		</Badge>
	);
}

/**
 * The transition-kind key: which kinds exist, and the colour each one carries.
 *
 * A DOT, not a line swatch. The swatch used to be a short rule because these colours were the canvas
 * edge strokes — read the legend, then read the graph. The canvas is on React Flow's default edge
 * now, one `#b1b1b7` for every transition, so a rule here would key a colour coding the graph no
 * longer has. The colours are still real: {@link TransitionKindBadge} carries them wherever a kind is
 * named, in the transitions table and the rail, and the dot matches that badge exactly.
 */
export function KindLegend({className}: {className?: string}): ReactElement {
	return (
		<div className={cn("wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-3 wwc:gap-y-1 wwc:text-xs", className)}>
			{WC3_PROCESS_TRANSITION_KINDS.map((kind) => (
				<span key={kind} className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-muted-foreground">
					<span
						className="wwc:inline-block wwc:size-2 wwc:shrink-0 wwc:rounded-full"
						style={{background: WC3_PROCESS_KIND_COLOR[kind]}}
					/>
					{WC3_PROCESS_KIND_LABEL[kind]}
				</span>
			))}
		</div>
	);
}

/**
 * Which SLA model applies. "severity-driven" is the one that silently overrides every per-state
 * slaHours value, so it is worth stating wherever an SLA number is shown.
 */
export function SlaModelBadge({process}: {process: Wc3Process}): ReactElement {
	const model = processSlaModel(process);
	if (model === "severity") return <Badge variant="warningSoft">severity-driven</Badge>;
	if (model === "per-state") return <Badge variant="infoSoft">per-state</Badge>;
	return <Badge variant="neutralSoft">no SLA</Badge>;
}

/** "4 of 21 over SLA". Zero is stated rather than hidden — a process can legitimately have none. */
export function OverSlaBadge({over, total}: {over: number; total: number}): ReactElement {
	if (total === 0) return <Badge variant="neutralSoft">no open tokens</Badge>;
	return <Badge variant={over > 0 ? "dangerSoft" : "neutralSoft"}>{`${over} of ${total} over SLA`}</Badge>;
}

/**
 * The product a process belongs to, with its sibling count — the user's "one product might have more
 * than one process" requirement, made visible on the row AND the card.
 *
 * Provenance is DERIVED (objectTypeId -> installedBy.productKey), never stored, so a process whose
 * object type was never installed by a product says exactly that instead of borrowing one.
 */
export function ProductChip({
	process,
	siblingCount,
	onOpenProduct,
}: {
	process: Wc3Process;
	siblingCount?: number;
	onOpenProduct?: (productKey: string) => void;
}): ReactElement {
	const product = processProduct(process);
	if (!product) return <Badge variant="neutralSoft">no product provenance</Badge>;
	const label =
		siblingCount && siblingCount > 1 ? `${product.displayName} · ${siblingCount} processes` : product.displayName;
	if (!onOpenProduct) return <Badge variant="infoSoft">{label}</Badge>;
	return (
		<button
			type="button"
			className="wwc:cursor-pointer wwc:rounded-md wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
			title={`Open ${product.displayName}`}
			onClick={(e) => {
				e.stopPropagation();
				onOpenProduct(product.productKey);
			}}
		>
			<Badge variant="infoSoft">{label}</Badge>
		</button>
	);
}

/**
 * `evidenceNote` and `slaNote`, QUOTED VERBATIM — never paraphrased, never dropped.
 *
 * Both processes carry them, and both say the same load-bearing thing: the whole SLA layer is
 * PROPOSED, not as-built. Without this panel the port starts claiming shipped behaviour it does not
 * have.
 */
export function ProcessProvenanceNote({process}: {process: Wc3Process}): ReactElement {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-3 wwc:text-xs">
			<p className="wwc:flex wwc:flex-col wwc:gap-0.5">
				<span className="wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">Evidence</span>
				<span className="wwc:text-foreground">{process.evidenceNote}</span>
			</p>
			<p className="wwc:flex wwc:flex-col wwc:gap-0.5">
				<span className="wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">SLA</span>
				<span className="wwc:text-foreground">{process.slaNote}</span>
			</p>
		</div>
	);
}

/**
 * ONE definition, passed to the DataTable's `emptyMessage` AND returned from the card grid's empty
 * branch, so the two view modes cannot drift apart.
 *
 * Two readings, because there are two ways to reach zero rows: a filter that matches nothing, and a
 * catalogue a user has genuinely emptied. Only the second offers "Create process".
 */
export function ProcessesEmptyState({
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
				icon={<Workflow className="wwc:h-6 wwc:w-6" />}
				title="No processes yet"
				description="A process is a state machine bound to one ontology object type: its rows are the tokens, and each transition binds to a real action type. Create one and it opens on a worked example — Draft, In review, Active, Closed, Rejected — with every edge waiting for its binding."
				action={
					<Button onClick={onNew}>
						<Workflow />
						Create process
					</Button>
				}
			/>
		);
	}
	return (
		<Empty
			icon={<Search className="wwc:h-6 wwc:w-6" />}
			title="No processes match"
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

/** The drill-in route's 404 — an open id that survived a reload while the process array did not. */
export function ProcessNotFound({processId, onBack}: {processId: string; onBack: () => void}): ReactElement {
	return (
		<Empty
			icon={<Workflow className="wwc:h-6 wwc:w-6" />}
			title="No such process"
			description={`There is no process with id “${processId}” in this workspace. Processes created in a session are not persisted — a reload restores the seeded catalogue.`}
			action={<Button onClick={onBack}>Back to the catalogue</Button>}
		/>
	);
}

// ─── Guards and every user-readable string ───────────────────────────────────

export const WC3_PROCESS_MESSAGES = {
	nameRequired: "Name required.",
	stateNameTaken: "A state with that name already exists in this process.",
	slaPositive: "SLA must be a positive number of hours.",
	deleteState: (name: string, edges: number) =>
		`Delete state “${name}” and its ${edges} transition(s)? Validity rules L1–L6 re-check live.`,
	deleteTransition: (key: string) =>
		`Remove transition “${key}”? Non-terminal states must keep an outgoing edge (rule L5).`,
	sessionEvidence: "Created in this session — no product provenance and no as-built lifecycle behind it.",
	sessionSla:
		"No SLA layer. Add per-state SLA hours in the state inspector; they are a proposed governance layer, not as-built.",
	severitySlaOverride:
		"This process is severity-driven: slaBySeverity wins for every token, so a per-state SLA here has no effect.",
	sharedTokens: (otName: string, other: string) =>
		`Tokens are the live ${otName} rows, which “${other}” also claims. A row sits in whichever state's value matches its status field — a state whose value matches nothing shows 0 tokens.`,
} as const;

/** The layout column a state sits in — the only ordering the kind derivation has. */
function columnOf(p: Wc3ProcessRecord, stateId: string): number {
	const pos = p.layout[stateId];
	if (!pos) return 0;
	return Math.round((pos.x - 36) / WC3_PROCESS_NODE.colGap);
}

/**
 * The kind of a proposed edge, derived and never asked of the user:
 *   from === to                          → extension_loop
 *   source state is terminal             → reopen  (rule L6 leaves no other option)
 *   target's layout column < source's    → reject_loop
 *   otherwise                            → forward
 */
function transitionKindFor(p: Wc3ProcessRecord, from: string, to: string): Wc3ProcessTransitionKind {
	if (from === to) return "extension_loop";
	const fromState = p.states.find((s) => s.id === from);
	if (fromState?.type === "terminal") return "reopen";
	if (columnOf(p, to) < columnOf(p, from)) return "reject_loop";
	return "forward";
}

/**
 * THE transition guards, in this exact order and with these exact strings. Single source of truth for
 * every refusal a user can read — no surface may reword one.
 *
 * DELIBERATE DIVERGENCE FROM checkWire: a process graph is NOT a DAG.
 *   · a SELF-TRANSITION is legal — proc_permit ships one (`extend`, an extension_loop) — so there is
 *     no "a node cannot feed itself" rule,
 *   · CYCLES are legal — reject_loop and reopen are cycles by construction — so there is no
 *     acyclicity rule.
 * Porting either guard would refuse edges the shipped fixture already contains.
 *
 * The terminal case is a HINT, not a refusal: the edge is created, as kind=reopen, and the note says
 * so. Rule L6 would otherwise flag it the moment it landed.
 */
export function checkTransition(
	p: Wc3ProcessRecord,
	from: string,
	to: string,
	actionTypeId: string | null,
	actions: readonly StateMachineAction[] = [],
): Wc3ProcessTransitionCheck {
	const fromState = p.states.find((s) => s.id === from);
	const toState = p.states.find((s) => s.id === to);

	// 1 — an endpoint that no longer resolves. Checked before anything reads a name off it.
	if (!fromState || !toState) {
		return {ok: false, reason: "That state no longer exists — it was deleted while the edge was being drawn."};
	}

	// 2 — NO GUARD on a missing binding. An unbound transition is representable: actionTypeId is
	// nullable, a canvas drop creates one, and the rule that a graph cannot publish unbound is
	// enforced where it belongs — processGraphLint's L7 and the publish gate. Refusing it here
	// refused the DROP, which threw away a gesture the author had already made for the sake of a
	// field they were about to fill in.

	// 3 — a binding that IS supplied must resolve in the vocabulary the CALLER passed (the live half
	// of rule L7). Checked against `actions`, never against a fixture: an empty vocabulary means the
	// caller has not declared one, so there is nothing to check against and any id is accepted.
	if (actionTypeId !== null && actions.length > 0 && !actions.some((a) => a.id === actionTypeId)) {
		return {ok: false, reason: "That action is not in the list this process can bind to — pick one that exists."};
	}

	// 4 — one edge per ordered pair. Rebinding is an edit, not a second edge.
	const existing = p.transitions.find((t) => t.from === from && t.to === to);
	if (existing) {
		return {
			ok: false,
			reason: `“${existing.key}” already goes ${fromState.name} → ${toState.name}. Rebind or delete it instead of adding a second edge.`,
		};
	}

	const kind = transitionKindFor(p, from, to);
	if (fromState.type === "terminal") {
		return {
			ok: true,
			kind: "reopen",
			note: "Rule L6: terminal states may only have reopen transitions — this one will be created as kind=reopen.",
		};
	}
	return {ok: true, kind};
}

/**
 * null when the state can be deleted; otherwise the verbatim refusal.
 *
 * Tokens are rows of the backing object type, and deleting a state does not move them — a row whose
 * status value no longer matches any state would simply vanish from the canvas.
 */
export function stateDeleteBlockReason(
	p: Wc3ProcessRecord,
	stateId: string,
	instances: readonly Wc3ProcessInstanceRow[] = [],
): string | null {
	const state = p.states.find((s) => s.id === stateId);
	if (!state) return null;
	const held = processTokens(p, stateId, [...instances]).length;
	if (held === 0) return null;
	return `Cannot delete “${state.name}” — ${held} live token(s) sit in it. Transition them out first.`;
}

// ─── Mutations ───────────────────────────────────────────────────────────────
//
// Pure, process in → NEW process out. No in-place writes, ever: WC3_PROCESSES is a frozen module
// fixture and one accidental `proc.states.push` would corrupt it for the whole app. Every helper
// clones first and edits the CLONE's own arrays, so the caller can keep rendering the old record.

/**
 * A process from scratch — seeded with a WORKED EXAMPLE, not an empty canvas.
 *
 * It used to open on two states and no edges, which failed L3, L4 and L5 on sight: a brand-new
 * process greeted its author with three red rules and a blank middle, and the first thing they had
 * to do was invent a lifecycle from nothing. Every state machine anyone draws here has the same
 * spine — something is drafted, someone looks at it, work happens, it ends one way or the other — so
 * the canvas starts with that spine and the author edits it down to their own.
 *
 * The example is structurally COMPLETE: exactly one initial state (L1), a terminal (L2), an active
 * work-authorizing state (L3), everything reachable (L4), an outgoing edge on every non-terminal
 * (L5), and the only edge leaving a terminal is the reopen (L6).
 *
 * Its edges are UNBOUND on purpose, and that is the one thing left to do. A generic process cannot
 * know which ontology action fires "submit" in someone else's product, and binding them to a permit
 * action to make the footer green would be a lie the author would have to find and undo. So they
 * ship as `actionTypeId: null` — real edges, drawn dashed, each one an L7 that says "bind this
 * before publishing". The footer reads as a checklist over a working graph rather than a diagnosis
 * of a broken one.
 *
 * `evidenceNote` / `slaNote` are honest session strings, not borrowed prose: a created process has no
 * product provenance and no as-built lifecycle behind it.
 */
export function createProcess(draft: Wc3ProcessDraft): Wc3ProcessRecord {
	// Named up front so the transitions can point at them without re-finding by value.
	const [drafted, review, active, closed, rejected] = [
		{
			id: uid("pst"),
			value: "draft",
			name: "Draft",
			category: "draft",
			type: "initial",
			flags: [],
			slaHours: null,
			color: WC3_PROCESS_STATE_COLORS[0],
			custom: true,
		},
		{
			id: uid("pst"),
			value: "in_review",
			name: "In review",
			category: "pending",
			type: "intermediate",
			flags: ["editableAnswers"],
			slaHours: null,
			color: WC3_PROCESS_STATE_COLORS[2],
			custom: true,
		},
		{
			// The state that satisfies L3. `authorizesWork` is what "active" MEANS here — a token
			// sitting in it is work someone is allowed to be doing — so the flag ships with it rather
			// than being left for the author to discover in the inspector.
			id: uid("pst"),
			value: "active",
			name: "Active",
			category: "active",
			type: "intermediate",
			flags: ["authorizesWork", "monitored"],
			slaHours: null,
			color: WC3_PROCESS_STATE_COLORS[1],
			custom: true,
		},
		{
			id: uid("pst"),
			value: "closed",
			name: "Closed",
			category: "terminal",
			type: "terminal",
			flags: [],
			slaHours: null,
			color: WC3_PROCESS_STATE_COLORS[5],
			outcome: "completed",
			custom: true,
		},
		{
			id: uid("pst"),
			value: "rejected",
			name: "Rejected",
			category: "terminal",
			type: "terminal",
			flags: ["reopenable"],
			slaHours: null,
			color: WC3_PROCESS_STATE_COLORS[3],
			outcome: "rejected",
			custom: true,
		},
	] satisfies Wc3ProcessState[];

	const states: Wc3ProcessState[] = [drafted, review, active, closed, rejected];

	// `kind` is stated rather than derived because transitionKindFor reads the LAYOUT, and the layout
	// is computed from these edges two lines below. The values are exactly what it would return:
	// forward for anything advancing a column, reopen for the one edge leaving a terminal state.
	const transitions: Wc3ProcessTransition[] = [
		{
			id: uid("ptr"),
			key: "submit",
			from: drafted.id,
			to: review.id,
			actionTypeId: null,
			kind: "forward",
			actorRole: "all",
			guards: [],
		},
		{
			id: uid("ptr"),
			key: "approve",
			from: review.id,
			to: active.id,
			actionTypeId: null,
			kind: "forward",
			actorRole: "all",
			guards: [],
		},
		{
			id: uid("ptr"),
			key: "reject",
			from: review.id,
			to: rejected.id,
			actionTypeId: null,
			kind: "forward",
			actorRole: "all",
			guards: [],
		},
		{
			id: uid("ptr"),
			key: "close",
			from: active.id,
			to: closed.id,
			actionTypeId: null,
			kind: "forward",
			actorRole: "all",
			guards: [],
		},
		{
			id: uid("ptr"),
			key: "reopen",
			from: rejected.id,
			to: drafted.id,
			actionTypeId: null,
			kind: "reopen",
			actorRole: "all",
			guards: [],
		},
	];

	const base: Wc3Process = {
		id: uid("proc"),
		name: draft.name,
		icon: draft.icon,
		objectTypeId: draft.objectTypeId,
		statusProp: draft.statusProp,
		alsoTouches: [],
		evidenceNote: WC3_PROCESS_MESSAGES.sessionEvidence,
		slaBySeverity: null,
		slaNote: WC3_PROCESS_MESSAGES.sessionSla,
		states,
		transitions,
	};
	return {...base, layout: processLayout(base)};
}

export function updateProcessMeta(
	p: Wc3ProcessRecord,
	patch: Partial<Pick<Wc3ProcessRecord, "name" | "icon" | "slaNote">>,
): Wc3ProcessRecord {
	return {...cloneProcess(p), ...patch};
}

/**
 * Adds a state, mirroring the prototype's `newState` — and, unlike the prototype, it also writes a
 * LAYOUT entry (first free row of the last column). Without it React Flow drops the state at 0,0 on
 * top of Draft and the drag has nothing to commit to.
 */
export function addState(p: Wc3ProcessRecord, name: string): {process: Wc3ProcessRecord; stateId: string} {
	const state: Wc3ProcessState = {
		id: uid("pst"),
		value: name,
		name,
		category: "pending",
		type: "intermediate",
		flags: [],
		slaHours: null,
		color: "#0ea5e9",
		custom: true,
	};

	const positions = Object.values(p.layout);
	const maxX = positions.length ? Math.max(...positions.map((pos) => pos.x)) : 36;
	const column = Math.round((maxX - 36) / WC3_PROCESS_NODE.colGap);
	const offset = 34 + (column % 2) * 14;
	const taken = new Set(
		positions.filter((pos) => pos.x === maxX).map((pos) => Math.round((pos.y - offset) / WC3_PROCESS_NODE.rowGap)),
	);
	let row = 0;
	while (taken.has(row)) row++;

	const next = cloneProcess(p);
	next.states = [...next.states, state];
	next.layout = {...next.layout, [state.id]: {x: maxX, y: offset + row * WC3_PROCESS_NODE.rowGap}};
	return {process: next, stateId: state.id};
}

/**
 * Patches one state. A `flags` patch REPLACES the array, it does not merge.
 *
 * NOTE for the state inspector: on a severity-driven process (proc_obs) an `slaHours` patch is
 * committed but has NO EFFECT — processRowSlaHours consults slaBySeverity first. The field must be
 * disabled or annotated with WC3_PROCESS_MESSAGES.severitySlaOverride rather than silently accepted.
 */
export function updateState(
	p: Wc3ProcessRecord,
	stateId: string,
	patch: Partial<
		Pick<
			Wc3ProcessState,
			"name" | "slaHours" | "color" | "category" | "type" | "flags" | "entryRequirements" | "entryEffects"
		>
	>,
): Wc3ProcessRecord {
	const next = cloneProcess(p);
	next.states = next.states.map((s) =>
		s.id === stateId ? {...s, ...patch, flags: patch.flags ? [...patch.flags] : s.flags} : s,
	);
	return next;
}

/** Commits a dragged position. React Flow hands back floats; they are rounded to keep the grid readable. */
export function moveState(p: Wc3ProcessRecord, stateId: string, x: number, y: number): Wc3ProcessRecord {
	const next = cloneProcess(p);
	next.layout = {...next.layout, [stateId]: {x: Math.round(x), y: Math.round(y)}};
	return next;
}

/** Deletes a state and CASCADES: every transition touching it, plus its layout entry, goes with it. */
export function deleteState(p: Wc3ProcessRecord, stateId: string): Wc3ProcessRecord {
	const next = cloneProcess(p);
	next.states = next.states.filter((s) => s.id !== stateId);
	next.transitions = next.transitions.filter((t) => t.from !== stateId && t.to !== stateId);
	const layout: Wc3ProcessLayout = {};
	for (const [id, pos] of Object.entries(next.layout)) {
		if (id !== stateId) layout[id] = pos;
	}
	next.layout = layout;
	return next;
}

/**
 * Adds a transition. The caller must have passed {@link checkTransition} first — this does not
 * re-check. `kind` is DERIVED (see {@link transitionKindFor}) and never asked of the user.
 *
 * `key` follows the prototype's `custom_${n}`; keys are not unique within a process, by design (the
 * same verb legitimately leaves several states).
 */
export function addTransition(
	p: Wc3ProcessRecord,
	args: {from: string; to: string; actionTypeId: string | null},
): {process: Wc3ProcessRecord; transitionId: string} {
	const transition: Wc3ProcessTransition = {
		id: uid("ptr"),
		key: `custom_${p.transitions.length + 1}`,
		from: args.from,
		to: args.to,
		actionTypeId: args.actionTypeId,
		kind: transitionKindFor(p, args.from, args.to),
		actorRole: "all",
		guards: [],
	};
	const next = cloneProcess(p);
	next.transitions = [...next.transitions, transition];
	return {process: next, transitionId: transition.id};
}

/** Rebinds a transition to a different action type. This is what makes lint rule L7 reachable. */
export function rebindTransition(p: Wc3ProcessRecord, transitionId: string, actionTypeId: string): Wc3ProcessRecord {
	const next = cloneProcess(p);
	next.transitions = next.transitions.map((t) => (t.id === transitionId ? {...t, actionTypeId} : t));
	return next;
}

export function deleteTransition(p: Wc3ProcessRecord, transitionId: string): Wc3ProcessRecord {
	const next = cloneProcess(p);
	next.transitions = next.transitions.filter((t) => t.id !== transitionId);
	return next;
}

// ─── Re-exports ──────────────────────────────────────────────────────────────

// The fixture already owns the SLA / token / bottleneck arithmetic; it is re-exported rather than
// restated so the three surfaces have ONE import line and never reach into wc3-process-data.ts.
//
// Two SLA facts the surfaces must respect, and that these functions encode:
//   · processRowSlaHours lets slaBySeverity WIN over per-state slaHours — on proc_obs every per-state
//     SLA is dead weight,
//   · processRowOverSla returns false for a terminal state unconditionally.
//
// DELIBERATELY NOT RE-EXPORTED: getProcess, processesForProduct, WC3_PROCESSES. They close over the
// frozen module array and start lying the instant the session creates or edits a process — the same
// trap wc3-pipeline-list-view.tsx:46-49 documents for getPipeline. Only wc3-process-views.ts may
// import WC3_PROCESSES, once, to seed.
export {
	WC3_PROCESS_AGING_BUCKETS,
	WC3_PROCESS_FIXTURE_NOW,
	WC3_PROCESS_FIXTURE_NOW_MS,
	WC3_PROCESS_KIND_COLOR,
	processAgingBuckets,
	processBottlenecks,
	demoInstances,
	processOpenRows,
	processRowAgeHours,
	processRowOverSla,
	processRowSlaHours,
	processStateOf,
	processTokens,
} from "./wc3-process-data";
export type {
	Wc3ObservationRow,
	Wc3PermitRow,
	Wc3Process,
	Wc3ProcessAgingBucket,
	Wc3ProcessBottleneck,
	Wc3ProcessInstanceRow,
	Wc3ProcessLintError,
	Wc3ProcessState,
	Wc3ProcessStateCategory,
	Wc3ProcessStateFlag,
	Wc3ProcessTransition,
	Wc3ProcessTransitionKind,
} from "./wc3-process-data";

// Re-exported, not restated: the Processes surfaces use the same pane, mono span, object-type chip,
// nav-target builders and breadcrumb effect the Lineage tabs already ship.
export {Mono, Pane, TypeGlyphLabel, lineageNav, useDetailLabel} from "./wc3-lineage-shared";
export type {Wc3LineageNavTarget} from "./wc3-lineage-shared";
