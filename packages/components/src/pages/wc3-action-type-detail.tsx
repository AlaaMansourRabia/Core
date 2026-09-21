import type {ColumnDef} from "@tanstack/react-table";

import {
	ArrowLeft,
	Bell,
	CircleCheck,
	CircleX,
	Info,
	LayoutGrid,
	List,
	Lock,
	Play,
	Plus,
	RotateCw,
	ShieldCheck,
	Trash2,
	TriangleAlert,
	Workflow,
	X,
} from "lucide-react";
import {useMemo, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ConfirmDialog} from "../confirm-dialog";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Empty} from "../empty";
import {Input} from "../input";
import {Label} from "../label";
import {PropertyList, PropertyRow} from "../property-list";
import {RecordDetailShell} from "../record-detail-shell";
import {RuleList, RuleRow} from "../rule-row";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Sheet, SheetContent, SheetTitle} from "../sheet";
import {type SideMenuGroup} from "../side-menu";
import {Switch} from "../switch";
import {Textarea} from "../textarea";
import {HoverTooltip} from "../tooltip";
import {ACTION_PARAM_TYPES, ACTION_RULE_PARAM_SENTINELS} from "./wc3-action-type-wizard";
import {
	WC3_LINK_TYPES,
	WC3_OBJECT_TYPES,
	WC3_STATUSES,
	WC3_USER_GROUPS,
	type Wc3ActionType,
	type Wc3Status,
	getObjectType,
	linkTypeLabel,
} from "./wc3-ontology-data";
import {OntologyGlyph} from "./wc3-ontology-glyphs";

// The action-type drill-in, ported from the prototype's ActionTypeDetail. An action is the richest
// record in this ontology — the prototype itself splits it into seven tabs — so the sections live in
// the left SideMenu, one at a time, exactly as wc3-object-type-detail.tsx does.
//
// Edits apply immediately through `onChange` rather than staging, matching the object-type sibling:
// two save models on the same surface would be the real inconsistency.

// ─── Narrow views over the fixture's loose shapes ────────────────────────────
//
// Wc3ActionType keeps `submissionCriteria`/`formLayout` as `unknown` and its parameters/rules behind
// index signatures, because the prototype's store is untyped JSON. These aliases are the shapes that
// data actually has, verified against every one of the 24 fixture rows. They are `type` (not
// `interface`) so they keep an implicit index signature and remain assignable back into Wc3ActionType.

export type ActParamDefault =
	| {kind: "static"; value: unknown}
	| {kind: "fromObjectProperty"; param: string; property: string}
	| null;

export type ActParamOverride = {
	when: {param: string; op: string; value: unknown};
	set: {required?: boolean; visible?: boolean; editable?: boolean};
	note?: string;
};

export type ActParam = {
	id: string;
	apiName: string;
	displayName: string;
	type: string;
	objectTypeId?: string | null;
	visible?: boolean;
	editable?: boolean;
	required?: boolean;
	default?: ActParamDefault;
	allowedValues?: string[] | null;
	validation?: {min?: number; max?: number; error?: string} | null;
	overrides?: ActParamOverride[];
	description?: string;
};

export type ActMappingSource =
	| {kind: "param"; param: string}
	| {kind: "static"; value: unknown}
	| {kind: "now"}
	| {kind: "template"; value: string};

export type ActMapping = {property: string; from: ActMappingSource};

export type ActDeclRule = {
	kind: string;
	objectTypeId?: string;
	linkTypeId?: string;
	targetParam?: string;
	aParam?: string;
	bParam?: string;
	set?: ActMapping[];
};

export type ActFnRule = {kind: "function"; functionName: string; description: string};

export type ActCriteria =
	| {op: "AND" | "OR"; children: ActCriteria[]; error?: string}
	| {kind: "param"; param: string; op: string; value: unknown; error?: string}
	| {kind: "userGroup"; groups: string[]; error?: string}
	| {kind: "fn"; name: string; states?: string[]; error?: string | null};

export type ActFormSection = {
	id: string;
	title: string;
	description: string;
	columns: number;
	parameterIds: string[];
};

export type ActFormLayout = {sections: ActFormSection[]; tableEntry: boolean; inlineEdits: boolean};

export type ActNotification = {message: string; recipients: string};
export type ActWebhook = {url: string; method: string; note: string};

export const paramsOf = (at: Wc3ActionType) => at.parameters as ActParam[];
export const fnRuleOf = (at: Wc3ActionType) => (Array.isArray(at.rules) ? null : (at.rules as ActFnRule));
export const declRulesOf = (at: Wc3ActionType) => (Array.isArray(at.rules) ? (at.rules as ActDeclRule[]) : []);
export const criteriaOf = (at: Wc3ActionType) => (at.submissionCriteria as ActCriteria | null) ?? null;
export const layoutOf = (at: Wc3ActionType): ActFormLayout =>
	(at.formLayout as ActFormLayout | null) ?? {sections: [], tableEntry: false, inlineEdits: false};
export const notificationsOf = (at: Wc3ActionType) => at.sideEffects.notifications as ActNotification[];
export const webhooksOf = (at: Wc3ActionType) => at.sideEffects.webhooks as ActWebhook[];

const isGroup = (node: ActCriteria): node is Extract<ActCriteria, {op: "AND" | "OR"}> =>
	typeof node === "object" && node !== null && "children" in node;

const {createdObject: CREATED_OBJECT, anyObject: ANY_OBJECT} = ACTION_RULE_PARAM_SENTINELS;

const CRIT_OPS = ["==", "!=", ">", ">=", "<", "<=", "lengthGte"];
const RULE_KIND_LABEL: Record<string, string> = {
	createObject: "Create object",
	modifyObject: "Modify object",
	deleteObject: "Delete object",
	createLink: "Create link",
	deleteLink: "Delete link",
};
const MAPPING_KINDS = ["param", "static", "now", "template"] as const;
const HTTP_METHODS = ["POST", "PUT", "PATCH"];
/** Every backing function the fixture names, so the Rules select offers real options. */
const KNOWN_FUNCTIONS = [
	"applyActivityDelay",
	"computeZoneRiskScores",
	"extendPermitFn",
	"suspendPermitGate",
	"verifyElementQty",
];

// ─── Shared bits (mirrors of the list view's, kept local while that file is off-limits) ──────────

const STATUS_VARIANT: Record<Wc3Status, "successSoft" | "warningSoft" | "dangerSoft" | "infoSoft"> = {
	Active: "successSoft",
	Endorsed: "infoSoft",
	Experimental: "warningSoft",
	Deprecated: "dangerSoft",
};

function StatusPill({status}: {status: Wc3Status}) {
	return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

function RidChip({rid}: {rid: string}) {
	const short = rid.split(".").slice(-1)[0];
	return (
		<HoverTooltip content={rid}>
			<span className="wwc:cursor-default wwc:font-mono wwc:text-[11px] wwc:text-muted-foreground">{short}</span>
		</HoverTooltip>
	);
}

/**
 * Values repeat — an action can carry two `createLink` rules — so a bare value is not a unique key.
 * Suffix each repeat with its occurrence number: `createLink`, `createLink~2`, …
 */
function keyed(items: string[]) {
	const seen = new Map<string, number>();
	return items.map((label) => {
		const n = (seen.get(label) ?? 0) + 1;
		seen.set(label, n);
		return {label, key: n === 1 ? label : `${label}~${n}`};
	});
}

/**
 * Pairs each item with a repeat-disambiguated key derived from `label`, so a list whose entries carry
 * no id of their own (rules, mappings, overrides, side effects) never falls back to an array index.
 */
function withKeys<T>(items: T[], label: (item: T) => string) {
	return keyed(items.map(label)).map((k, i) => ({key: k.key, item: items[i], index: i}));
}

// ─── Pure helpers, shared with the run dialog ────────────────────────────────

function compare(op: string, left: unknown, right: unknown): boolean {
	switch (op) {
		case "==":
			return left === right;
		case "!=":
			return left !== right;
		case ">":
			return Number(left) > Number(right);
		case ">=":
			return Number(left) >= Number(right);
		case "<":
			return Number(left) < Number(right);
		case "<=":
			return Number(left) <= Number(right);
		case "lengthGte":
			return String(left ?? "").trim().length >= Number(right);
		case "in":
			return Array.isArray(right) && (right as unknown[]).includes(left);
		default:
			return false;
	}
}

/**
 * Walks a submission-criteria tree for one acting persona and one set of parameter values.
 *
 * `kind: "fn"` guards are server-side state checks (permitStateIn, permitFormComplete, …) with no
 * client-evaluable input, so they PASS here rather than block: reporting a gate as failing when we
 * simply cannot see it would make every permit action look broken in the live preview.
 */
export function evaluateCriteria(
	node: unknown,
	args: Record<string, unknown>,
	user: {groups: string[]},
): {ok: boolean; errors: string[]} {
	if (!node || typeof node !== "object") return {ok: true, errors: []};
	const n = node as ActCriteria;

	if ("kind" in n && n.kind === "fn") return {ok: true, errors: []};

	if ("kind" in n && n.kind === "param") {
		const ok = compare(n.op, args[n.param], n.value);
		return {ok, errors: ok ? [] : [n.error ?? `Condition on ${n.param} not met.`]};
	}

	if ("kind" in n && n.kind === "userGroup") {
		const ok = n.groups.some((g) => user.groups.includes(g));
		return {ok, errors: ok ? [] : [n.error ?? "You are not in a permitted user group."]};
	}

	if (isGroup(n)) {
		const results = n.children.map((child) => evaluateCriteria(child, args, user));
		if (n.op === "OR") {
			const ok = results.length === 0 || results.some((r) => r.ok);
			return {ok, errors: ok ? [] : n.error ? [n.error] : results.flatMap((r) => r.errors)};
		}
		const failing = results.filter((r) => !r.ok);
		return {ok: failing.length === 0, errors: failing.flatMap((r) => r.errors)};
	}

	return {ok: true, errors: []};
}

/**
 * A parameter's live visible/editable/required, after conditional overrides are applied against the
 * current argument values. `at_record_observation` uses this to flip `corrective_action` to required
 * the moment severity becomes High or Critical.
 */
export function effectiveParam(
	_at: Wc3ActionType,
	p: ActParam,
	args: Record<string, unknown>,
): {visible: boolean; editable: boolean; required: boolean; overrideNote?: string} {
	let state = {
		visible: p.visible !== false,
		editable: p.editable !== false,
		required: p.required === true,
		overrideNote: undefined as string | undefined,
	};
	for (const o of p.overrides ?? []) {
		if (!compare(o.when.op, args[o.when.param], o.when.value)) continue;
		state = {...state, ...o.set, overrideNote: o.note};
	}
	return state;
}

/** Object-type ids an action points at that no longer resolve — the prototype's `actionMissingTypeRefs`. */
export function actionMissingTypeRefs(at: Wc3ActionType): string[] {
	const ids = new Set<string>();
	for (const p of paramsOf(at)) if (p.type === "objectRef" && p.objectTypeId) ids.add(p.objectTypeId);
	for (const r of declRulesOf(at)) if (r.objectTypeId) ids.add(r.objectTypeId);
	return [...ids].filter((id) => !getObjectType(id));
}

const ruleSummary = (at: Wc3ActionType) => {
	const fn = fnRuleOf(at);
	if (fn) return `ƒ ${fn.functionName}`;
	const kinds = declRulesOf(at).map((r) => r.kind);
	return kinds.length ? `Rules: ${[...new Set(kinds)].join(", ")}` : "No rules";
};

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewSection({
	at,
	takenApiNames,
	onChange,
	onDelete,
}: {
	at: Wc3ActionType;
	takenApiNames: string[];
	onChange: (next: Wc3ActionType) => void;
	onDelete: (id: string) => void;
}) {
	const [apiError, setApiError] = useState<string | null>(null);
	const [confirm, setConfirm] = useState<"deprecate" | "delete" | null>(null);

	return (
		<div className="wwc:space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="wwc:text-sm">About</CardTitle>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<Label htmlFor="at-dn">Display name</Label>
							<Input
								id="at-dn"
								value={at.displayName}
								onChange={(e) => onChange({...at, displayName: e.target.value})}
							/>
						</div>
						<div className="wwc:space-y-1.5">
							<Label htmlFor="at-api">API name</Label>
							<Input
								id="at-api"
								className="wwc:font-mono"
								value={at.apiName}
								onChange={(e) => {
									const v = e.target.value.trim();
									// Same two guards as the prototype: non-empty, and unique across action types.
									if (!v) setApiError("API name cannot be empty.");
									else if (takenApiNames.includes(v))
										setApiError(`API name “${v}” is already used by another action type.`);
									else setApiError(null);
									onChange({...at, apiName: e.target.value});
								}}
							/>
							{apiError && <p className="wwc:text-xs wwc:text-destructive">{apiError}</p>}
						</div>
						<div className="wwc:space-y-1.5">
							<Label>Status</Label>
							<Select value={at.status} onValueChange={(v) => onChange({...at, status: v as Wc3Status})}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{WC3_STATUSES.map((s) => (
										<SelectItem key={s} value={s}>
											{s}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="wwc:space-y-1.5">
						<Label htmlFor="at-desc">Description</Label>
						<Textarea
							id="at-desc"
							value={at.description}
							onChange={(e) => onChange({...at, description: e.target.value})}
						/>
					</div>

					<PropertyList>
						<PropertyRow label="RID">
							<span className="wwc:font-mono wwc:text-xs">{at.rid}</span>
						</PropertyRow>
						<PropertyRow label="Rules">{ruleSummary(at)}</PropertyRow>
						<PropertyRow label="Provenance">
							{at.installedBy ? (
								<span className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									<Badge variant="infoSoft">product · {at.installedBy.productKey}</Badge>
									<span className="wwc:text-xs wwc:text-muted-foreground">
										install <span className="wwc:font-mono">{at.installedBy.installId}</span> — roll that install back
										and this action leaves the store with it.
									</span>
								</span>
							) : (
								<Badge variant="neutralSoft">authored locally</Badge>
							)}
						</PropertyRow>
					</PropertyList>
				</CardContent>
			</Card>

			<Card className="wwc:border-destructive/30">
				<CardHeader>
					<CardTitle className="wwc:text-sm wwc:text-destructive">Danger zone</CardTitle>
				</CardHeader>
				<CardContent className="wwc:flex wwc:flex-wrap wwc:items-center wwc:justify-between wwc:gap-3">
					{at.status === "Deprecated" ? (
						<>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								This action is deprecated and can now be removed from the ontology.
							</p>
							<Button variant="destructive" size="sm" onClick={() => setConfirm("delete")}>
								<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
								Delete…
							</Button>
						</>
					) : (
						<>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								Deprecating hides the action from new surfaces without breaking anything already wired to it.
							</p>
							<Button variant="outline" size="sm" onClick={() => setConfirm("deprecate")}>
								Deprecate…
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			<ConfirmDialog
				open={confirm === "deprecate"}
				onOpenChange={(o) => !o && setConfirm(null)}
				title={`Deprecate “${at.displayName}”?`}
				description="Existing forms keep working; new surfaces hide it."
				confirmLabel="Deprecate"
				onConfirm={() => {
					onChange({...at, status: "Deprecated"});
					setConfirm(null);
				}}
			/>
			<ConfirmDialog
				open={confirm === "delete"}
				onOpenChange={(o) => !o && setConfirm(null)}
				title={`Delete “${at.displayName}”?`}
				description="The action type and everything configured on it are removed from the ontology. This cannot be undone."
				confirmLabel="Delete action type"
				destructive
				onConfirm={() => {
					setConfirm(null);
					onDelete(at.id);
				}}
			/>
		</div>
	);
}

// ─── Parameters ──────────────────────────────────────────────────────────────

function describeDefault(d: ActParamDefault): React.ReactNode {
	if (!d) return <span className="wwc:text-muted-foreground">—</span>;
	if (d.kind === "static") return <span className="wwc:font-mono wwc:text-xs">{String(d.value)}</span>;
	return (
		<span className="wwc:font-mono wwc:text-xs">
			{d.param}.{d.property}
		</span>
	);
}

function describeConstraints(p: ActParam): React.ReactNode {
	const bits: string[] = [];
	if (p.allowedValues?.length) bits.push(p.allowedValues.join(" | "));
	if (p.validation && (p.validation.min !== undefined || p.validation.max !== undefined))
		bits.push(`${p.validation.min ?? "−∞"}–${p.validation.max ?? "∞"}`);
	if (!bits.length) return <span className="wwc:text-muted-foreground">—</span>;
	return <span className="wwc:text-xs wwc:text-muted-foreground">{bits.join(" · ")}</span>;
}

const yesNo = (v: boolean) => (v ? "Yes" : <span className="wwc:text-muted-foreground">No</span>);

function ParametersSection({
	at,
	onChange,
	onOpenParam,
}: {
	at: Wc3ActionType;
	onChange: (next: Wc3ActionType) => void;
	onOpenParam: (id: string) => void;
}) {
	const params = paramsOf(at);

	const addParameter = () => {
		const n = params.length + 1;
		const next: ActParam = {
			id: `${at.id}_p_new_${Date.now()}`,
			apiName: `parameter_${n}`,
			displayName: `Parameter ${n}`,
			type: "string",
			objectTypeId: null,
			visible: true,
			editable: true,
			required: false,
			default: null,
			allowedValues: null,
			validation: null,
			overrides: [],
			description: "",
		};
		onChange({...at, parameters: [...params, next]});
		onOpenParam(next.id);
	};

	const columns: ColumnDef<ActParam, unknown>[] = useMemo(
		() => [
			{
				accessorKey: "displayName",
				header: ({column}) => <DataTableColumnHeader column={column} title="Parameter" />,
				cell: ({row}) => (
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:font-medium">
						<button
							type="button"
							onClick={() => onOpenParam(row.original.id)}
							className="wwc:text-left wwc:underline wwc:underline-offset-2 wwc:transition-colors wwc:hover:text-primary"
						>
							{row.original.displayName}
						</button>
						{(row.original.overrides?.length ?? 0) > 0 && (
							<Badge variant="warningSoft" className="wwc:font-normal">
								{row.original.overrides?.length} override{row.original.overrides?.length === 1 ? "" : "s"}
							</Badge>
						)}
					</span>
				),
			},
			{
				accessorKey: "apiName",
				header: ({column}) => <DataTableColumnHeader column={column} title="API name" />,
				cell: ({row}) => (
					<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{row.original.apiName}</span>
				),
			},
			{
				accessorKey: "type",
				header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
				cell: ({row}) => {
					const p = row.original;
					const ot = p.objectTypeId ? getObjectType(p.objectTypeId) : undefined;
					return (
						<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:whitespace-nowrap wwc:font-mono wwc:text-xs">
							{p.type}
							{p.type === "objectRef" &&
								(ot ? (
									<>
										→ <OntologyGlyph name={ot.icon} color={ot.color} /> {ot.displayName}
									</>
								) : (
									<Badge variant="dangerSoft">broken ref</Badge>
								))}
						</span>
					);
				},
			},
			{id: "visible", header: "Shown", cell: ({row}) => yesNo(row.original.visible !== false)},
			{id: "editable", header: "Editable", cell: ({row}) => yesNo(row.original.editable !== false)},
			{id: "required", header: "Required", cell: ({row}) => yesNo(row.original.required === true)},
			{id: "default", header: "Default", cell: ({row}) => describeDefault(row.original.default ?? null)},
			{id: "constraints", header: "Constraints", cell: ({row}) => describeConstraints(row.original)},
		],
		[onOpenParam],
	);

	// DataTable's empty row is a 96px-tall cell, so a full Empty with a CTA replaces the table rather
	// than living inside it. `emptyMessage` still covers the "filtered everything out" case.
	if (params.length === 0) {
		return (
			<Empty
				icon={<List className="wwc:h-6 wwc:w-6" />}
				title="No parameters"
				description="Zero-parameter actions are allowed (e.g. function-backed recomputations), but most actions take input."
				action={
					<Button size="sm" onClick={addParameter}>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						Add the first parameter
					</Button>
				}
			/>
		);
	}

	return (
		<DataTable
			columns={columns}
			data={params}
			searchKey="displayName"
			searchPlaceholder="Filter parameters…"
			showColumnToggle
			recordLabel="parameter"
			recordLabelPlural="parameters"
			pageSize={25}
			getRowId={(p) => p.id}
			emptyMessage="No parameters match your filter."
			toolbarExtra={
				<Button size="sm" onClick={addParameter}>
					<Plus className="wwc:h-3.5 wwc:w-3.5" />
					Add parameter
				</Button>
			}
		/>
	);
}

// ─── Parameter drawer ────────────────────────────────────────────────────────

function ParameterSheet({
	at,
	paramId,
	onOpenChange,
	onChange,
}: {
	at: Wc3ActionType;
	paramId: string | null;
	onOpenChange: (open: boolean) => void;
	onChange: (next: Wc3ActionType) => void;
}) {
	const params = paramsOf(at);
	const p = params.find((x) => x.id === paramId) ?? null;
	const [confirmRemove, setConfirmRemove] = useState(false);

	if (!p) return null;

	const patch = (next: Partial<ActParam>) =>
		onChange({...at, parameters: params.map((x) => (x.id === p.id ? {...x, ...next} : x))});

	const nameTaken = params.some((x) => x.id !== p.id && x.apiName.trim() === p.apiName.trim());
	const refParams = params.filter((x) => x.type === "objectRef" && x.objectTypeId);
	const defaultKind = p.default?.kind ?? "none";
	// Narrowed once, so the property select below can scope itself to the source parameter's object type.
	const fromProperty = p.default?.kind === "fromObjectProperty" ? p.default : null;
	const sourceParam = fromProperty ? refParams.find((x) => x.apiName === fromProperty.param) : undefined;
	const sourceType = sourceParam?.objectTypeId ? getObjectType(sourceParam.objectTypeId) : undefined;

	return (
		<Sheet open={paramId !== null} onOpenChange={onOpenChange}>
			<SheetContent className="wwc:w-full wwc:overflow-y-auto wwc:sm:max-w-lg">
				<SheetTitle className="wwc:mb-4 wwc:pr-8">{p.displayName}</SheetTitle>

				<div className="wwc:space-y-4">
					<div className="wwc:space-y-1.5">
						<Label htmlFor="ps-dn">Display name</Label>
						<Input id="ps-dn" value={p.displayName} onChange={(e) => patch({displayName: e.target.value})} />
					</div>

					<div className="wwc:space-y-1.5">
						<Label htmlFor="ps-api">API name</Label>
						<Input
							id="ps-api"
							className="wwc:font-mono"
							value={p.apiName}
							onChange={(e) => patch({apiName: e.target.value})}
						/>
						{!p.apiName.trim() ? (
							<p className="wwc:text-xs wwc:text-destructive">API name cannot be empty.</p>
						) : nameTaken ? (
							<p className="wwc:text-xs wwc:text-destructive">
								API name “{p.apiName}” is already used by another parameter on this action.
							</p>
						) : null}
					</div>

					<div className="wwc:grid wwc:gap-3 wwc:sm:grid-cols-2">
						<div className="wwc:space-y-1.5">
							<Label>Type</Label>
							<Select
								value={p.type}
								onValueChange={(v) =>
									patch({
										type: v,
										// Leaving objectRef must drop the object type, or the parameter keeps a dead id.
										objectTypeId: v === "objectRef" ? (p.objectTypeId ?? WC3_OBJECT_TYPES[0]?.id ?? null) : null,
									})
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{ACTION_PARAM_TYPES.map((t) => (
										<SelectItem key={t} value={t}>
											{t}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{p.type === "objectRef" && (
							<div className="wwc:space-y-1.5">
								<Label>Object type</Label>
								<Select value={p.objectTypeId ?? ""} onValueChange={(v) => patch({objectTypeId: v})}>
									<SelectTrigger>
										<SelectValue placeholder="Object type…" />
									</SelectTrigger>
									<SelectContent>
										{WC3_OBJECT_TYPES.map((o) => (
											<SelectItem key={o.id} value={o.id}>
												{o.displayName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="wwc:space-y-2 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:text-sm">
							<Label htmlFor="ps-visible">Shown in form</Label>
							<Switch id="ps-visible" checked={p.visible !== false} onCheckedChange={(v) => patch({visible: v})} />
						</div>
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:text-sm">
							<Label htmlFor="ps-editable">User-editable</Label>
							<Switch id="ps-editable" checked={p.editable !== false} onCheckedChange={(v) => patch({editable: v})} />
						</div>
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3 wwc:text-sm">
							<Label htmlFor="ps-required">Required</Label>
							<Switch id="ps-required" checked={p.required === true} onCheckedChange={(v) => patch({required: v})} />
						</div>
					</div>

					<div className="wwc:space-y-1.5">
						<Label>Default value</Label>
						<Select
							value={defaultKind}
							onValueChange={(v) =>
								patch({
									default:
										v === "none"
											? null
											: v === "static"
												? {kind: "static", value: ""}
												: {
														kind: "fromObjectProperty",
														param: refParams[0]?.apiName ?? "",
														property: "",
													},
								})
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">No default</SelectItem>
								<SelectItem value="static">Static value</SelectItem>
								<SelectItem value="fromObjectProperty">From selected object&apos;s property</SelectItem>
							</SelectContent>
						</Select>

						{p.default?.kind === "static" && (
							<Input
								aria-label="Static default value"
								value={String(p.default.value ?? "")}
								onChange={(e) => patch({default: {kind: "static", value: e.target.value}})}
							/>
						)}

						{fromProperty && (
							<div className="wwc:grid wwc:gap-2 wwc:sm:grid-cols-2">
								<Select
									value={fromProperty.param}
									onValueChange={(v) => patch({default: {kind: "fromObjectProperty", param: v, property: ""}})}
								>
									<SelectTrigger aria-label="Source parameter">
										<SelectValue placeholder="Parameter…" />
									</SelectTrigger>
									<SelectContent>
										{refParams.map((x) => (
											<SelectItem key={x.id} value={x.apiName}>
												{x.apiName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select
									value={fromProperty.property}
									onValueChange={(v) =>
										patch({default: {kind: "fromObjectProperty", param: fromProperty.param, property: v}})
									}
								>
									<SelectTrigger aria-label="Source property">
										<SelectValue placeholder="Property…" />
									</SelectTrigger>
									<SelectContent>
										{(sourceType?.properties ?? []).map((prop) => (
											<SelectItem key={prop.id} value={prop.apiName}>
												{prop.apiName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="wwc:space-y-1.5">
						<Label htmlFor="ps-allowed">Allowed values</Label>
						<Input
							id="ps-allowed"
							placeholder="Low, Medium, High, Critical"
							value={(p.allowedValues ?? []).join(", ")}
							onChange={(e) => {
								const list = e.target.value
									.split(",")
									.map((s) => s.trim())
									.filter(Boolean);
								patch({allowedValues: list.length ? list : null});
							}}
						/>
						<p className="wwc:text-xs wwc:text-muted-foreground">
							Comma-separated. A parameter with allowed values renders as a select in the run form.
						</p>
					</div>

					<div className="wwc:space-y-2">
						<Label>Validation</Label>
						<div className="wwc:grid wwc:gap-2 wwc:sm:grid-cols-2">
							<Input
								type="number"
								aria-label="Minimum"
								placeholder="min"
								value={p.validation?.min ?? ""}
								onChange={(e) =>
									patch({
										validation: {
											...p.validation,
											min: e.target.value === "" ? undefined : Number(e.target.value),
										},
									})
								}
							/>
							<Input
								type="number"
								aria-label="Maximum"
								placeholder="max"
								value={p.validation?.max ?? ""}
								onChange={(e) =>
									patch({
										validation: {
											...p.validation,
											max: e.target.value === "" ? undefined : Number(e.target.value),
										},
									})
								}
							/>
						</div>
						<Input
							aria-label="Validation error message"
							placeholder="Error message shown when the value is out of range"
							value={p.validation?.error ?? ""}
							onChange={(e) => patch({validation: {...p.validation, error: e.target.value}})}
						/>
					</div>

					<div className="wwc:space-y-2">
						<Label>Conditional overrides</Label>
						{(p.overrides ?? []).length === 0 ? (
							<p className="wwc:text-xs wwc:text-muted-foreground">
								No overrides. An override re-evaluates live while the form is being filled in.
							</p>
						) : (
							<div className="wwc:space-y-2">
								{withKeys(p.overrides ?? [], (o) => `${o.when.param}:${o.when.op}`).map(({key, item: o, index}) => (
									<div
										key={key}
										className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5 wwc:text-xs"
									>
										<span>
											when <span className="wwc:font-mono">{o.when.param}</span> {o.when.op}{" "}
											<span className="wwc:font-mono">
												{Array.isArray(o.when.value) ? (o.when.value as unknown[]).join(", ") : String(o.when.value)}
											</span>{" "}
											→ {Object.keys(o.set).join(", ")}
											{o.note && <span className="wwc:block wwc:text-muted-foreground">{o.note}</span>}
										</span>
										<Button
											variant="ghost"
											icon
											aria-label="Remove override"
											className="wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:text-destructive"
											onClick={() => patch({overrides: (p.overrides ?? []).filter((_, i) => i !== index)})}
										>
											<X className="wwc:h-3.5 wwc:w-3.5" />
										</Button>
									</div>
								))}
							</div>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								patch({
									overrides: [
										...(p.overrides ?? []),
										{
											when: {param: params[0]?.apiName ?? "", op: "in", value: []},
											set: {required: true},
											note: "Required when …",
										},
									],
								})
							}
						>
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							Add override (required-when)
						</Button>
					</div>

					<div className="wwc:border-t wwc:border-border wwc:pt-4">
						<Button variant="outline" size="sm" className="wwc:text-destructive" onClick={() => setConfirmRemove(true)}>
							<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
							Remove parameter…
						</Button>
					</div>
				</div>

				<ConfirmDialog
					open={confirmRemove}
					onOpenChange={setConfirmRemove}
					title={`Remove “${p.displayName}”?`}
					description="The parameter is dropped from the action, from every rule that reads it, and from the form layout."
					confirmLabel="Remove parameter"
					destructive
					onConfirm={() => {
						setConfirmRemove(false);
						const layout = layoutOf(at);
						onChange({
							...at,
							parameters: params.filter((x) => x.id !== p.id),
							formLayout: {
								...layout,
								sections: layout.sections.map((s) => ({
									...s,
									parameterIds: s.parameterIds.filter((id) => id !== p.id),
								})),
							},
						});
						onOpenChange(false);
					}}
				/>
			</SheetContent>
		</Sheet>
	);
}

// ─── Rules ───────────────────────────────────────────────────────────────────

function MappingRow({
	mapping,
	onChange,
	onRemove,
	params,
}: {
	mapping: ActMapping;
	onChange: (next: ActMapping) => void;
	onRemove: () => void;
	params: ActParam[];
}) {
	const from = mapping.from;
	return (
		<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-xs">
			<span className="wwc:font-mono">{mapping.property}</span>
			<span className="wwc:text-muted-foreground">←</span>
			<Select
				value={from.kind}
				onValueChange={(v) =>
					onChange({
						...mapping,
						from:
							v === "param"
								? {kind: "param", param: params[0]?.apiName ?? ""}
								: v === "static"
									? {kind: "static", value: ""}
									: v === "now"
										? {kind: "now"}
										: {kind: "template", value: ""},
					})
				}
			>
				<SelectTrigger className="wwc:h-7 wwc:w-28" aria-label="Mapping source">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{MAPPING_KINDS.map((k) => (
						<SelectItem key={k} value={k}>
							{k}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{from.kind === "param" && (
				<Select value={from.param} onValueChange={(v) => onChange({...mapping, from: {kind: "param", param: v}})}>
					<SelectTrigger className="wwc:h-7 wwc:w-44" aria-label="Source parameter">
						<SelectValue placeholder="Parameter…" />
					</SelectTrigger>
					<SelectContent>
						{params.map((p) => (
							<SelectItem key={p.id} value={p.apiName}>
								{p.apiName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}
			{from.kind === "static" && (
				<Input
					aria-label="Static value"
					className="wwc:h-7 wwc:w-44"
					value={String(from.value ?? "")}
					onChange={(e) => onChange({...mapping, from: {kind: "static", value: e.target.value}})}
				/>
			)}
			{from.kind === "template" && (
				<Input
					aria-label="Template"
					className="wwc:h-7 wwc:w-56 wwc:font-mono"
					value={from.value}
					onChange={(e) => onChange({...mapping, from: {kind: "template", value: e.target.value}})}
				/>
			)}
			{from.kind === "now" && <span className="wwc:font-mono wwc:text-muted-foreground">now()</span>}
			<Button
				variant="ghost"
				icon
				aria-label={`Remove mapping for ${mapping.property}`}
				className="wwc:h-6 wwc:w-6 wwc:text-destructive"
				onClick={onRemove}
			>
				<X className="wwc:h-3.5 wwc:w-3.5" />
			</Button>
		</div>
	);
}

function RulesSection({at, onChange}: {at: Wc3ActionType; onChange: (next: Wc3ActionType) => void}) {
	const fn = fnRuleOf(at);
	const rules = declRulesOf(at);
	const params = paramsOf(at);
	const [confirm, setConfirm] = useState<"toFunction" | "toDeclarative" | null>(null);

	const patchRule = (index: number, next: Partial<ActDeclRule>) =>
		onChange({...at, rules: rules.map((r, i) => (i === index ? {...r, ...next} : r))});

	const addRule = (kind: string) => {
		const isLink = kind === "createLink" || kind === "deleteLink";
		onChange({
			...at,
			rules: [
				...rules,
				{
					kind,
					objectTypeId: isLink ? undefined : WC3_OBJECT_TYPES[0]?.id,
					linkTypeId: isLink ? WC3_LINK_TYPES[0]?.id : undefined,
					aParam: isLink ? CREATED_OBJECT : undefined,
					bParam: isLink ? ANY_OBJECT : undefined,
					set: kind === "createObject" || kind === "modifyObject" ? [] : undefined,
				},
			],
		});
	};

	if (fn) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="wwc:text-sm">Function-backed action</CardTitle>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<div className="wwc:space-y-1.5">
						<Label>Function</Label>
						<Select value={fn.functionName} onValueChange={(v) => onChange({...at, rules: {...fn, functionName: v}})}>
							<SelectTrigger className="wwc:w-72">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{[...new Set([fn.functionName, ...KNOWN_FUNCTIONS])].map((name) => (
									<SelectItem key={name} value={name}>
										{name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<p className="wwc:text-sm wwc:text-muted-foreground">{fn.description}</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">
						A function rule is exclusive — the action runs the function instead of a declarative rule list.
					</p>
					<Button variant="outline" size="sm" onClick={() => setConfirm("toDeclarative")}>
						Use declarative rules instead
					</Button>

					<ConfirmDialog
						open={confirm === "toDeclarative"}
						onOpenChange={(o) => !o && setConfirm(null)}
						title="Replace the function with declarative rules?"
						description={`ƒ ${fn.functionName} will be dropped and the action will start with an empty rule list.`}
						confirmLabel="Use declarative rules"
						destructive
						onConfirm={() => {
							setConfirm(null);
							onChange({...at, rules: []});
						}}
					/>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="wwc:space-y-4">
			<RuleList emptyMessage="No rules. An action with no rules writes nothing when it runs.">
				{withKeys(rules, (r) => r.kind).map(({key: ruleKey, item: r, index}) => {
					const isLink = r.kind === "createLink" || r.kind === "deleteLink";
					const composite = r.kind === "createObject" || r.kind === "modifyObject";
					const target = r.objectTypeId ? getObjectType(r.objectTypeId) : undefined;
					const detail = composite ? (
						<div className="wwc:w-full wwc:space-y-1.5 wwc:border-t wwc:border-border wwc:px-3 wwc:py-2">
							{(r.set ?? []).length === 0 && (
								<p className="wwc:text-xs wwc:text-muted-foreground">No property mappings yet.</p>
							)}
							{withKeys(r.set ?? [], (m) => m.property).map(({key, item: m, index: mi}) => (
								<MappingRow
									key={key}
									mapping={m}
									params={params}
									onChange={(next) => patchRule(index, {set: (r.set ?? []).map((x, xi) => (xi === mi ? next : x))})}
									onRemove={() => patchRule(index, {set: (r.set ?? []).filter((_, xi) => xi !== mi)})}
								/>
							))}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm" className="wwc:h-7">
										<Plus className="wwc:h-3.5 wwc:w-3.5" />
										Set property
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="start" className="wwc:max-h-72 wwc:overflow-auto">
									{(target?.properties ?? []).map((prop) => (
										<DropdownMenuItem
											key={prop.id}
											onSelect={() =>
												patchRule(index, {
													set: [
														...(r.set ?? []),
														{property: prop.apiName, from: {kind: "param", param: params[0]?.apiName ?? ""}},
													],
												})
											}
										>
											{prop.apiName}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					) : null;

					return (
						// RuleRow has no nested-detail slot yet, so the mapping block sits inside a shared
						// border with the row rather than inside it. See the report note on `details`.
						<div key={ruleKey} className="wwc:rounded-lg wwc:border wwc:border-border">
							<RuleRow
								className="wwc:border-0"
								showDragHandle={false}
								onDelete={() => onChange({...at, rules: rules.filter((_, i) => i !== index)})}
							>
								<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{index + 1}.</span>
								<Badge variant="neutralSoft" className="wwc:font-mono wwc:font-normal">
									{r.kind}
								</Badge>
								{isLink ? (
									<Select value={r.linkTypeId ?? ""} onValueChange={(v) => patchRule(index, {linkTypeId: v})}>
										<SelectTrigger className="wwc:w-56" aria-label="Link type">
											<SelectValue placeholder="Link type…" />
										</SelectTrigger>
										<SelectContent>
											{WC3_LINK_TYPES.map((l) => (
												<SelectItem key={l.id} value={l.id}>
													{linkTypeLabel(l)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								) : (
									<Select value={r.objectTypeId ?? ""} onValueChange={(v) => patchRule(index, {objectTypeId: v})}>
										<SelectTrigger className="wwc:w-56" aria-label="Object type">
											<SelectValue placeholder="Object type…" />
										</SelectTrigger>
										<SelectContent>
											{WC3_OBJECT_TYPES.map((o) => (
												<SelectItem key={o.id} value={o.id}>
													{o.displayName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}

								{isLink ? (
									<>
										<span className="wwc:text-sm wwc:text-muted-foreground">A</span>
										<Select value={r.aParam ?? CREATED_OBJECT} onValueChange={(v) => patchRule(index, {aParam: v})}>
											<SelectTrigger className="wwc:w-40" aria-label="Side A parameter">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={CREATED_OBJECT}>(created object)</SelectItem>
												<SelectItem value={ANY_OBJECT}>* (any)</SelectItem>
												{params.map((p) => (
													<SelectItem key={p.id} value={p.apiName}>
														{p.apiName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<span className="wwc:text-sm wwc:text-muted-foreground">B</span>
										<Select value={r.bParam ?? ANY_OBJECT} onValueChange={(v) => patchRule(index, {bParam: v})}>
											<SelectTrigger className="wwc:w-40" aria-label="Side B parameter">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={CREATED_OBJECT}>(created object)</SelectItem>
												<SelectItem value={ANY_OBJECT}>* (any)</SelectItem>
												{params.map((p) => (
													<SelectItem key={p.id} value={p.apiName}>
														{p.apiName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</>
								) : r.kind === "createObject" ? null : (
									<>
										<span className="wwc:text-sm wwc:text-muted-foreground">target</span>
										<Select value={r.targetParam ?? ""} onValueChange={(v) => patchRule(index, {targetParam: v})}>
											<SelectTrigger className="wwc:w-44" aria-label="Target parameter">
												<SelectValue placeholder="Parameter…" />
											</SelectTrigger>
											<SelectContent>
												{params.map((p) => (
													<SelectItem key={p.id} value={p.apiName}>
														{p.apiName}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</>
								)}
							</RuleRow>
							{detail}
						</div>
					);
				})}
			</RuleList>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<Plus className="wwc:h-4 wwc:w-4" />
						Add rule
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{Object.entries(RULE_KIND_LABEL).map(([kind, label]) => (
						<DropdownMenuItem key={kind} onSelect={() => addRule(kind)}>
							{label}
						</DropdownMenuItem>
					))}
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => setConfirm("toFunction")}>
						ƒ Convert to function-backed (exclusive)
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ConfirmDialog
				open={confirm === "toFunction"}
				onOpenChange={(o) => !o && setConfirm(null)}
				title="Convert to a function-backed action?"
				description={`A function rule is exclusive — the ${rules.length} declarative rule${rules.length === 1 ? "" : "s"} on this action will be replaced.`}
				confirmLabel="Convert"
				destructive
				onConfirm={() => {
					setConfirm(null);
					onChange({
						...at,
						rules: {
							kind: "function",
							functionName: KNOWN_FUNCTIONS[0],
							description: "Backing function — describe what it writes.",
						},
					});
				}}
			/>
		</div>
	);
}

// ─── Submission criteria ─────────────────────────────────────────────────────

function CriteriaNode({
	node,
	path,
	params,
	onChange,
	onRemove,
}: {
	node: ActCriteria;
	/** Position in the tree; also the React key, since criteria nodes carry no id in the fixture. */
	path: number[];
	params: ActParam[];
	onChange: (next: ActCriteria) => void;
	onRemove?: () => void;
}) {
	const errorRow = (value: string | null | undefined, set: (v: string) => void) => (
		<Input
			aria-label="Error message when unmet"
			placeholder="Error message when unmet"
			className="wwc:h-8 wwc:text-xs"
			value={value ?? ""}
			onChange={(e) => set(e.target.value)}
		/>
	);

	// `fn` guards have no `children`, so this branch MUST come before the group check below.
	if ("kind" in node && node.kind === "fn") {
		return (
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:rounded-md wwc:border wwc:border-dashed wwc:border-border wwc:p-2.5 wwc:text-xs">
				<Badge variant="infoSoft" className="wwc:font-mono wwc:font-normal">
					ƒ {node.name}
				</Badge>
				{node.states?.length ? (
					<span className="wwc:font-mono wwc:text-muted-foreground">state ∈ {`{${node.states.join(", ")}}`}</span>
				) : null}
				<span className="wwc:text-muted-foreground">server-side guard · read-only</span>
			</div>
		);
	}

	if ("kind" in node && node.kind === "param") {
		return (
			<div className="wwc:space-y-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					<Select value={node.param} onValueChange={(v) => onChange({...node, param: v})}>
						<SelectTrigger className="wwc:h-8 wwc:w-48" aria-label="Parameter">
							<SelectValue placeholder="Parameter…" />
						</SelectTrigger>
						<SelectContent>
							{params.map((p) => (
								<SelectItem key={p.id} value={p.apiName}>
									{p.apiName}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select value={node.op} onValueChange={(v) => onChange({...node, op: v})}>
						<SelectTrigger className="wwc:h-8 wwc:w-32" aria-label="Operator">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CRIT_OPS.map((op) => (
								<SelectItem key={op} value={op}>
									{op}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Input
						aria-label="Value"
						className="wwc:h-8 wwc:w-40"
						value={String(node.value ?? "")}
						onChange={(e) => {
							const raw = e.target.value;
							const asNumber = Number(raw);
							onChange({...node, value: raw !== "" && !Number.isNaN(asNumber) ? asNumber : raw});
						}}
					/>
					{onRemove && (
						<Button
							variant="ghost"
							icon
							aria-label="Remove condition"
							className="wwc:ml-auto wwc:h-7 wwc:w-7 wwc:text-destructive"
							onClick={onRemove}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
						</Button>
					)}
				</div>
				{errorRow(node.error, (v) => onChange({...node, error: v}))}
			</div>
		);
	}

	if ("kind" in node && node.kind === "userGroup") {
		const addable = WC3_USER_GROUPS.filter((g) => !node.groups.includes(g));
		return (
			<div className="wwc:space-y-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2.5">
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
					<span className="wwc:text-xs wwc:text-muted-foreground">acting user in</span>
					{node.groups.map((g) => (
						<Badge key={g} variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
							{g}
							<button
								type="button"
								aria-label={`Remove ${g}`}
								onClick={() => onChange({...node, groups: node.groups.filter((x) => x !== g)})}
								className="wwc:ml-0.5 wwc:rounded wwc:hover:text-foreground"
							>
								<X className="wwc:h-3 wwc:w-3" />
							</button>
						</Badge>
					))}
					{addable.length > 0 && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" icon aria-label="Add user group" className="wwc:h-6 wwc:w-6">
									<Plus className="wwc:h-3 wwc:w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start">
								{addable.map((g) => (
									<DropdownMenuItem key={g} onSelect={() => onChange({...node, groups: [...node.groups, g]})}>
										{g}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
					{onRemove && (
						<Button
							variant="ghost"
							icon
							aria-label="Remove condition"
							className="wwc:ml-auto wwc:h-7 wwc:w-7 wwc:text-destructive"
							onClick={onRemove}
						>
							<Trash2 className="wwc:h-4 wwc:w-4" />
						</Button>
					)}
				</div>
				{errorRow(node.error, (v) => onChange({...node, error: v}))}
			</div>
		);
	}

	if (!isGroup(node)) return null;

	const setChild = (index: number, next: ActCriteria) =>
		onChange({...node, children: node.children.map((c, i) => (i === index ? next : c))});

	const add = (child: ActCriteria) => onChange({...node, children: [...node.children, child]});

	return (
		<div className="wwc:space-y-2 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
			<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
				<Button
					variant="outline"
					size="sm"
					className="wwc:h-7 wwc:font-mono"
					onClick={() => onChange({...node, op: node.op === "AND" ? "OR" : "AND"})}
				>
					{node.op}
				</Button>
				<span className="wwc:text-xs wwc:text-muted-foreground">
					{node.op === "AND" ? "all children must pass" : "any child may pass"}
				</span>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="wwc:h-7">
							<Plus className="wwc:h-3.5 wwc:w-3.5" />
							Add
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuItem
							onSelect={() => add({kind: "param", param: params[0]?.apiName ?? "", op: "==", value: "", error: ""})}
						>
							Parameter condition
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => add({kind: "userGroup", groups: [], error: ""})}>
							User-group condition
						</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => add({op: "AND", children: []})}>Nested AND group</DropdownMenuItem>
						<DropdownMenuItem onSelect={() => add({op: "OR", children: []})}>Nested OR group</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{onRemove && (
					<Button
						variant="ghost"
						icon
						aria-label="Remove group"
						className="wwc:ml-auto wwc:h-7 wwc:w-7 wwc:text-destructive"
						onClick={onRemove}
					>
						<Trash2 className="wwc:h-4 wwc:w-4" />
					</Button>
				)}
			</div>
			{errorRow(node.error, (v) => onChange({...node, error: v}))}
			{node.children.length > 0 && (
				<div className="wwc:space-y-2 wwc:border-l-2 wwc:border-border wwc:pl-3">
					{node.children.map((child, index) => (
						<CriteriaNode
							key={[...path, index].join(".")}
							node={child}
							path={[...path, index]}
							params={params}
							onChange={(next) => setChild(index, next)}
							onRemove={() => onChange({...node, children: node.children.filter((_, i) => i !== index)})}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function CriteriaSection({
	at,
	actingUser,
	onChange,
}: {
	at: Wc3ActionType;
	actingUser: {name: string; groups: string[]};
	onChange: (next: Wc3ActionType) => void;
}) {
	const root = criteriaOf(at) ?? {op: "AND", children: []};
	// The prototype previews with EMPTY parameters, so the banner answers "could this even be opened?"
	const preview = evaluateCriteria(root, {}, actingUser);

	return (
		<div className="wwc:space-y-4">
			<div
				className={
					preview.ok
						? "wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-green-600/30 wwc:bg-green-500/5 wwc:p-3 wwc:text-sm"
						: "wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm"
				}
			>
				{preview.ok ? (
					<CircleCheck className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-green-600" />
				) : (
					<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
				)}
				<span>
					<b>{preview.ok ? "Criteria pass" : "Blocked"}</b> for {actingUser.name} with empty parameters
					{preview.ok ? "." : ` — ${preview.errors[0]}`}
				</span>
			</div>

			<CriteriaNode
				node={root}
				path={[]}
				params={paramsOf(at)}
				onChange={(next) => onChange({...at, submissionCriteria: next})}
			/>
		</div>
	);
}

// ─── Side effects ────────────────────────────────────────────────────────────

function EffectsSection({at, onChange}: {at: Wc3ActionType; onChange: (next: Wc3ActionType) => void}) {
	const notifications = notificationsOf(at);
	const webhooks = webhooksOf(at);

	const setNotifications = (next: ActNotification[]) =>
		onChange({...at, sideEffects: {...at.sideEffects, notifications: next}});
	const setWebhooks = (next: ActWebhook[]) => onChange({...at, sideEffects: {...at.sideEffects, webhooks: next}});

	return (
		<div className="wwc:space-y-4">
			<Card>
				<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
					<CardTitle className="wwc:text-sm">Notification rules ({notifications.length})</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setNotifications([...notifications, {message: "", recipients: WC3_USER_GROUPS[0] ?? ""}])}
					>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						Add notification
					</Button>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					{notifications.length === 0 ? (
						<p className="wwc:text-sm wwc:text-muted-foreground">
							No notifications. Nothing is sent when this action runs.
						</p>
					) : (
						withKeys(notifications, (n) => n.recipients).map(({key, item: n, index}) => (
							<div key={key} className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								<Input
									aria-label="Message template"
									className="wwc:min-w-64 wwc:flex-1"
									placeholder="Crew {crew} assigned to {activity}"
									value={n.message}
									onChange={(e) =>
										setNotifications(notifications.map((x, i) => (i === index ? {...x, message: e.target.value} : x)))
									}
								/>
								<Select
									value={n.recipients}
									onValueChange={(v) =>
										setNotifications(notifications.map((x, i) => (i === index ? {...x, recipients: v} : x)))
									}
								>
									<SelectTrigger className="wwc:w-48" aria-label="Recipients">
										<SelectValue placeholder="Recipients…" />
									</SelectTrigger>
									<SelectContent>
										{WC3_USER_GROUPS.map((g) => (
											<SelectItem key={g} value={g}>
												{g}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									variant="ghost"
									icon
									aria-label="Delete notification"
									className="wwc:h-8 wwc:w-8 wwc:text-destructive"
									onClick={() => setNotifications(notifications.filter((_, i) => i !== index))}
								>
									<Trash2 className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
						))
					)}
					<p className="wwc:text-xs wwc:text-muted-foreground">
						<span className="wwc:font-mono">{"{param}"}</span> placeholders are substituted with the submitted values.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="wwc:flex-row wwc:items-center wwc:justify-between wwc:space-y-0">
					<CardTitle className="wwc:text-sm">Webhooks ({webhooks.length})</CardTitle>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setWebhooks([...webhooks, {url: "", method: "POST", note: ""}])}
					>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						Add webhook
					</Button>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					{webhooks.length === 0 ? (
						<p className="wwc:text-sm wwc:text-muted-foreground">No webhooks. Nothing is pushed downstream.</p>
					) : (
						withKeys(webhooks, (w) => `${w.method} ${w.url}`).map(({key, item: w, index}) => (
							<div key={key} className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
								<Select
									value={w.method}
									onValueChange={(v) => setWebhooks(webhooks.map((x, i) => (i === index ? {...x, method: v} : x)))}
								>
									<SelectTrigger className="wwc:w-28" aria-label="HTTP method">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{HTTP_METHODS.map((m) => (
											<SelectItem key={m} value={m}>
												{m}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									aria-label="Webhook URL"
									className="wwc:min-w-64 wwc:flex-1 wwc:font-mono wwc:text-xs"
									placeholder="https://hooks.example/intake"
									value={w.url}
									onChange={(e) => setWebhooks(webhooks.map((x, i) => (i === index ? {...x, url: e.target.value} : x)))}
								/>
								<Input
									aria-label="Note"
									className="wwc:min-w-48 wwc:flex-1"
									placeholder="What this hook is for"
									value={w.note}
									onChange={(e) =>
										setWebhooks(webhooks.map((x, i) => (i === index ? {...x, note: e.target.value} : x)))
									}
								/>
								<Button
									variant="ghost"
									icon
									aria-label="Delete webhook"
									className="wwc:h-8 wwc:w-8 wwc:text-destructive"
									onClick={() => setWebhooks(webhooks.filter((_, i) => i !== index))}
								>
									<Trash2 className="wwc:h-4 wwc:w-4" />
								</Button>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// ─── Form layout ─────────────────────────────────────────────────────────────

function FormLayoutSection({at, onChange}: {at: Wc3ActionType; onChange: (next: Wc3ActionType) => void}) {
	const layout = layoutOf(at);
	const params = paramsOf(at);
	const assigned = new Set(layout.sections.flatMap((s) => s.parameterIds));
	const unassigned = params.filter((p) => !assigned.has(p.id));

	const setLayout = (next: ActFormLayout) => onChange({...at, formLayout: next});
	const patchSection = (id: string, next: Partial<ActFormSection>) =>
		setLayout({...layout, sections: layout.sections.map((s) => (s.id === id ? {...s, ...next} : s))});

	const move = (index: number, delta: number) => {
		const next = [...layout.sections];
		const target = index + delta;
		if (target < 0 || target >= next.length) return;
		const [moved] = next.splice(index, 1);
		next.splice(target, 0, moved);
		setLayout({...layout, sections: next});
	};

	/** A parameter lives in exactly one section, so assigning it anywhere removes it everywhere else. */
	const assign = (sectionId: string, paramId: string) =>
		setLayout({
			...layout,
			sections: layout.sections.map((s) =>
				s.id === sectionId
					? {
							...s,
							parameterIds: s.parameterIds.includes(paramId)
								? s.parameterIds.filter((x) => x !== paramId)
								: [...s.parameterIds, paramId],
						}
					: {...s, parameterIds: s.parameterIds.filter((x) => x !== paramId)},
			),
		});

	return (
		<div className="wwc:space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="wwc:text-sm">Form behaviour</CardTitle>
				</CardHeader>
				<CardContent className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-6">
					<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:text-sm">
						<Switch
							id="fl-table-entry"
							checked={layout.tableEntry}
							onCheckedChange={(v) => setLayout({...layout, tableEntry: v})}
						/>
						<Label htmlFor="fl-table-entry">Table-entry alternative</Label>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:text-sm">
						<Switch
							id="fl-inline-edits"
							checked={layout.inlineEdits}
							onCheckedChange={(v) => setLayout({...layout, inlineEdits: v})}
						/>
						<Label htmlFor="fl-inline-edits">Inline edits</Label>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="wwc:ml-auto"
						onClick={() =>
							setLayout({
								...layout,
								sections: [
									...layout.sections,
									{
										id: `sec_${at.id}_${layout.sections.length + 1}`,
										title: `Section ${layout.sections.length + 1}`,
										description: "",
										columns: 2,
										parameterIds: [],
									},
								],
							})
						}
					>
						<Plus className="wwc:h-3.5 wwc:w-3.5" />
						Add section
					</Button>
				</CardContent>
			</Card>

			{unassigned.length > 0 && (
				<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
					<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
					<span>
						<b>Unassigned parameters.</b>{" "}
						{keyed(unassigned.map((p) => p.apiName))
							.map((k) => k.label)
							.join(", ")}{" "}
						{unassigned.length === 1 ? "is" : "are"} in no section and will not appear in the form.
					</span>
				</div>
			)}

			{layout.sections.length === 0 ? (
				<Empty
					icon={<LayoutGrid className="wwc:h-6 wwc:w-6" />}
					title="No sections"
					description="Without a section the run form falls back to one flat list of every parameter."
				/>
			) : (
				<div className="wwc:space-y-3">
					{layout.sections.map((s, index) => (
						<div key={s.id} className="wwc:rounded-lg wwc:border wwc:border-border">
							<RuleRow
								className="wwc:border-0"
								showDragHandle={false}
								onMoveUp={() => move(index, -1)}
								onMoveDown={() => move(index, 1)}
								disableMoveUp={index === 0}
								disableMoveDown={index === layout.sections.length - 1}
								onDelete={() => setLayout({...layout, sections: layout.sections.filter((x) => x.id !== s.id)})}
								deleteLabel={`Delete section ${s.title}`}
							>
								<Input
									aria-label="Section title"
									className="wwc:w-48"
									value={s.title}
									onChange={(e) => patchSection(s.id, {title: e.target.value})}
								/>
								<Select value={String(s.columns)} onValueChange={(v) => patchSection(s.id, {columns: Number(v)})}>
									<SelectTrigger className="wwc:w-24" aria-label="Columns">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">1 column</SelectItem>
										<SelectItem value="2">2 columns</SelectItem>
									</SelectContent>
								</Select>
								<Input
									aria-label="Section description"
									className="wwc:min-w-48 wwc:flex-1"
									placeholder="Description"
									value={s.description}
									onChange={(e) => patchSection(s.id, {description: e.target.value})}
								/>
							</RuleRow>

							<div className="wwc:space-y-2 wwc:border-t wwc:border-border wwc:px-3 wwc:py-2.5">
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
									{params.map((p) => {
										const on = s.parameterIds.includes(p.id);
										return (
											<button
												key={p.id}
												type="button"
												onClick={() => assign(s.id, p.id)}
												className={
													on
														? "wwc:rounded-md wwc:border wwc:border-blue-500 wwc:bg-blue-500/10 wwc:px-2 wwc:py-0.5 wwc:font-mono wwc:text-xs wwc:text-blue-600 wwc:dark:text-blue-400"
														: "wwc:rounded-md wwc:border wwc:border-border wwc:px-2 wwc:py-0.5 wwc:font-mono wwc:text-xs wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
												}
											>
												{p.apiName}
											</button>
										);
									})}
								</div>
								{s.parameterIds.length > 1 && (
									<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
										<span>
											Order: {s.parameterIds.map((id) => params.find((p) => p.id === id)?.apiName ?? id).join(" → ")}
										</span>
										<Button
											variant="ghost"
											size="sm"
											className="wwc:h-6"
											aria-label={`Rotate order in ${s.title}`}
											onClick={() =>
												patchSection(s.id, {
													parameterIds: [...s.parameterIds.slice(1), s.parameterIds[0]],
												})
											}
										>
											<RotateCw className="wwc:h-3.5 wwc:w-3.5" />
										</Button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// ─── Permissions ─────────────────────────────────────────────────────────────

function PermissionsSection({
	at,
	actingUser,
	onChange,
}: {
	at: Wc3ActionType;
	actingUser: {name: string; groups: string[]};
	onChange: (next: Wc3ActionType) => void;
}) {
	const roles = [
		{key: "view" as const, label: "Can view"},
		{key: "run" as const, label: "Can run"},
	];
	const canRun = at.permissions.run.some((g) => actingUser.groups.includes(g));

	return (
		<Card>
			<CardHeader>
				<CardTitle className="wwc:text-sm">Permissions</CardTitle>
			</CardHeader>
			<CardContent className="wwc:space-y-4">
				<div
					className={
						canRun
							? "wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-green-600/30 wwc:bg-green-500/5 wwc:p-3 wwc:text-sm"
							: "wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm"
					}
				>
					{canRun ? (
						<CircleCheck className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-green-600" />
					) : (
						<CircleX className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
					)}
					{actingUser.name} {canRun ? "can" : "cannot"} run this action.
				</div>

				{roles.map((role) => {
					const granted = at.permissions[role.key];
					const addable = WC3_USER_GROUPS.filter((g) => !granted.includes(g));
					return (
						<div key={role.key} className="wwc:space-y-1.5">
							<Label>{role.label}</Label>
							<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
								{granted.map((g) => (
									<Badge key={g} variant="neutralSoft" className="wwc:gap-1 wwc:font-normal">
										{g}
										<button
											type="button"
											aria-label={`Remove ${g} from ${role.label}`}
											onClick={() =>
												onChange({
													...at,
													permissions: {...at.permissions, [role.key]: granted.filter((x) => x !== g)},
												})
											}
											className="wwc:ml-0.5 wwc:rounded wwc:hover:text-foreground"
										>
											<X className="wwc:h-3 wwc:w-3" />
										</button>
									</Badge>
								))}
								{addable.length > 0 && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" size="sm" icon aria-label={`Grant ${role.label}`}>
												<Plus className="wwc:h-3.5 wwc:w-3.5" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											{addable.map((g) => (
												<DropdownMenuItem
													key={g}
													onSelect={() =>
														onChange({
															...at,
															permissions: {...at.permissions, [role.key]: [...granted, g]},
														})
													}
												>
													{g}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}

// ─── Surface ─────────────────────────────────────────────────────────────────

export interface ActionTypeDetailProps {
	actionType: Wc3ActionType;
	/** API names held by every OTHER action type, for the uniqueness guard on Overview. */
	takenApiNames: string[];
	onBack: () => void;
	onChange: (next: Wc3ActionType) => void;
	/** Danger zone — the host removes the row and navigates back. */
	onDelete: (id: string) => void;
	/** Opens the run dialog, which the view owns so the list's Run button drives the same one. */
	onRun: () => void;
	actingUser?: {name: string; groups: string[]};
	/** Section to land on. Lets a host deep-link straight to e.g. Permissions. */
	initialSection?: string;
}

export function ActionTypeDetail({
	actionType: at,
	takenApiNames,
	onBack,
	onChange,
	onDelete,
	onRun,
	actingUser = {name: "Ontology Admin", groups: WC3_USER_GROUPS},
	initialSection = "overview",
}: ActionTypeDetailProps) {
	const [tab, setTab] = useState(initialSection);
	const [paramId, setParamId] = useState<string | null>(null);

	const missingRefs = actionMissingTypeRefs(at);
	const ruleTotal = Array.isArray(at.rules) ? at.rules.length : 1;

	const sections: SideMenuGroup[] = [
		{
			items: [
				{id: "overview", label: "Overview", icon: Info},
				{id: "parameters", label: "Parameters", icon: List, count: at.parameters.length},
				{id: "rules", label: "Rules", icon: Workflow, count: ruleTotal},
				{id: "criteria", label: "Submission criteria", icon: ShieldCheck},
				{id: "effects", label: "Side effects", icon: Bell},
				{id: "layout", label: "Form layout", icon: LayoutGrid},
				{id: "permissions", label: "Permissions", icon: Lock},
			],
		},
	];

	return (
		<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col">
			{/*
			 * Fixed bar, sized to match PageContentHeader above it (compact density -> min-h-12, px-3)
			 * so the two stacked headers read as one band.
			 */}
			<div className="wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-3 wwc:border-b wwc:border-border wwc:bg-card wwc:px-3">
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2.5">
					<Button variant="ghost" size="sm" className="wwc:gap-1.5" onClick={onBack}>
						<ArrowLeft className="wwc:h-4 wwc:w-4" />
						Back
					</Button>
					<div className="wwc:h-5 wwc:w-px wwc:shrink-0 wwc:bg-border" />
					<OntologyGlyph name="bolt" className="wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-amber-600" />
					<h1 className="wwc:truncate wwc:text-sm wwc:font-semibold">{at.displayName}</h1>
					<StatusPill status={at.status} />
					<RidChip rid={at.rid} />
					{missingRefs.length > 0 && (
						<HoverTooltip content={`References a deleted object type: ${missingRefs.join(", ")}`}>
							<span>
								<Badge variant="dangerSoft">broken ref</Badge>
							</span>
						</HoverTooltip>
					)}
					<span className="wwc:hidden wwc:truncate wwc:text-[11px] wwc:text-muted-foreground wwc:lg:inline">
						<span className="wwc:font-mono">{at.apiName}</span> · {ruleSummary(at)}
					</span>
				</div>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
					<Button size="sm" className="wwc:gap-1.5" onClick={onRun}>
						<Play className="wwc:h-4 wwc:w-4" />
						Run action
					</Button>
				</div>
			</div>

			<RecordDetailShell title="Action type" sections={sections} activeSectionId={tab} onSectionChange={setTab}>
				{missingRefs.length > 0 && (
					<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-red-600/30 wwc:bg-red-500/5 wwc:p-3 wwc:text-sm">
						<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-red-600" />
						<span>
							<b>Broken object-type reference.</b> This action points at{" "}
							<span className="wwc:font-mono">{missingRefs.join(", ")}</span>, which no longer exists — it is blocked
							from running until repaired.
						</span>
					</div>
				)}

				{tab === "overview" && (
					<OverviewSection at={at} takenApiNames={takenApiNames} onChange={onChange} onDelete={onDelete} />
				)}
				{tab === "parameters" && <ParametersSection at={at} onChange={onChange} onOpenParam={setParamId} />}
				{tab === "rules" && <RulesSection at={at} onChange={onChange} />}
				{tab === "criteria" && <CriteriaSection at={at} actingUser={actingUser} onChange={onChange} />}
				{tab === "effects" && <EffectsSection at={at} onChange={onChange} />}
				{tab === "layout" && <FormLayoutSection at={at} onChange={onChange} />}
				{tab === "permissions" && <PermissionsSection at={at} actingUser={actingUser} onChange={onChange} />}
			</RecordDetailShell>

			<ParameterSheet at={at} paramId={paramId} onOpenChange={(o) => !o && setParamId(null)} onChange={onChange} />
		</div>
	);
}
