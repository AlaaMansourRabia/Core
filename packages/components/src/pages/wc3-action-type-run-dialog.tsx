import {CircleCheck, Play, Plus, RotateCw, TriangleAlert, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {Input} from "../input";
import {Label} from "../label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Switch} from "../switch";
import {HoverTooltip} from "../tooltip";
import {
	actionMissingTypeRefs,
	criteriaOf,
	declRulesOf,
	effectiveParam,
	evaluateCriteria,
	fnRuleOf,
	layoutOf,
	paramsOf,
	type ActFormSection,
	type ActParam,
} from "./wc3-action-type-detail";
import {WC3_USER_GROUPS, type Wc3ActionType, getObjectType, linkTypeLabel, WC3_LINK_TYPES} from "./wc3-ontology-data";

// RunActionDialog — the prototype's "Run action" modal. It renders the action's OWN form layout
// (sections, descriptions, 1- or 2-column grids, stored parameter order), applies defaults,
// re-evaluates conditional overrides live, and reports pass/blocked against the submission criteria
// and the run permission before anything is submitted.
//
// The repo fixture ships instance COUNTS (WC3_INSTANCE_COUNTS) and link SAMPLES, but no per-object
// instance rows, so objectRef pickers take an injected `instancesFor` provider and degrade to a text
// input rather than invent rows. Running is simulated for the same reason: there is no store to write.

type Args = Record<string, unknown>;

export interface RunActionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	actionType: Wc3ActionType | null;
	actingUser?: {name: string; groups: string[]};
	/** Values preset by another surface (`openRunModal(atId, preset)`); shows the "prefilled" chip. */
	preset?: Args;
	/** Instance picker source. Omit and objectRef parameters fall back to a free-text input. */
	instancesFor?: (objectTypeId: string) => {value: string; label: string}[];
}

/** Static defaults are applied on open; fromObjectProperty defaults refill when their source changes. */
function staticDefaults(params: ActParam[], preset: Args | undefined): Args {
	const out: Args = {};
	for (const p of params) if (p.default?.kind === "static") out[p.apiName] = p.default.value;
	return {...out, ...preset};
}

function controlFor(
	p: ActParam,
	value: unknown,
	set: (v: unknown) => void,
	disabled: boolean,
	instancesFor: RunActionDialogProps["instancesFor"],
) {
	if (p.type === "objectRef") {
		const options = p.objectTypeId && instancesFor ? instancesFor(p.objectTypeId) : [];
		const ot = p.objectTypeId ? getObjectType(p.objectTypeId) : undefined;
		if (options.length === 0) {
			// No instance rows exist in the fixture — degrade to text rather than fake a picker.
			return (
				<Input
					disabled={disabled}
					placeholder={ot ? `${ot.displayName} id…` : "Object id…"}
					value={String(value ?? "")}
					onChange={(e) => set(e.target.value)}
				/>
			);
		}
		return (
			<Select value={String(value ?? "")} onValueChange={set} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder={ot ? `Pick a ${ot.displayName}…` : "Pick…"} />
				</SelectTrigger>
				<SelectContent>
					{options.map((o) => (
						<SelectItem key={o.value} value={o.value}>
							{o.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	if (p.allowedValues?.length) {
		return (
			<Select value={String(value ?? "")} onValueChange={set} disabled={disabled}>
				<SelectTrigger>
					<SelectValue placeholder="Select…" />
				</SelectTrigger>
				<SelectContent>
					{p.allowedValues.map((v) => (
						<SelectItem key={v} value={v}>
							{v}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

	if (p.type === "boolean") return <Switch checked={value === true} onCheckedChange={set} disabled={disabled} />;

	if (p.type === "integer" || p.type === "long" || p.type === "double")
		return (
			<Input
				type="number"
				disabled={disabled}
				value={value === undefined || value === null ? "" : String(value)}
				onChange={(e) => set(e.target.value === "" ? undefined : Number(e.target.value))}
			/>
		);

	if (p.type === "date")
		return <Input type="date" disabled={disabled} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />;

	return <Input disabled={disabled} value={String(value ?? "")} onChange={(e) => set(e.target.value)} />;
}

export function RunActionDialog({
	open,
	onOpenChange,
	actionType: at,
	actingUser = {name: "Ontology Admin", groups: WC3_USER_GROUPS},
	preset,
	instancesFor,
}: RunActionDialogProps) {
	const params = useMemo(() => (at ? paramsOf(at) : []), [at]);
	const [args, setArgs] = useState<Args>({});
	const [tableMode, setTableMode] = useState(false);
	// Table-entry rows carry ids of their own so a React key never falls back to an array index.
	const [rows, setRows] = useState<{id: string; args: Args}[]>([{id: "row-1", args: {}}]);
	const rowCounter = useRef(1);
	const [result, setResult] = useState<{ok: boolean; lines: string[]} | null>(null);

	// `preset` is read through a ref: a host that passes a fresh object literal on every render would
	// otherwise make it a new dependency each pass and spin the reset effect forever.
	const presetRef = useRef(preset);
	useEffect(() => {
		presetRef.current = preset;
	}, [preset]);

	// Reset every time a different action is opened; a stale form on a new action is worse than none.
	useEffect(() => {
		if (!open || !at) return;
		setArgs(staticDefaults(paramsOf(at), presetRef.current));
		rowCounter.current = 1;
		setRows([{id: "row-1", args: {}}]);
		setTableMode(false);
		setResult(null);
	}, [open, at]);

	if (!at) return null;

	const layout = layoutOf(at);
	const fn = fnRuleOf(at);
	const rules = declRulesOf(at);
	const missingRefs = actionMissingTypeRefs(at);
	const canRun = at.permissions.run.some((g) => actingUser.groups.includes(g));
	const criteria = evaluateCriteria(criteriaOf(at), args, actingUser);
	const blockers = [...(canRun ? [] : ["You are not in a user group that may run this action."]), ...criteria.errors];

	// A `fromObjectProperty` default follows its source parameter, so it refills the moment that
	// parameter changes rather than only on open.
	const setArg = (apiName: string, value: unknown) =>
		setArgs((prev) => {
			const next = {...prev, [apiName]: value};
			for (const p of params) {
				if (p.default?.kind !== "fromObjectProperty") continue;
				if (p.default.param !== apiName) continue;
				// There are no instance rows to read the property off, so the prefill names its source.
				next[p.apiName] = value ? `${String(value)}.${p.default.property}` : undefined;
			}
			return next;
		});

	const sections: ActFormSection[] =
		layout.sections.length > 0
			? layout.sections
			: [{id: "flat", title: "Parameters", description: "", columns: 2, parameterIds: params.map((p) => p.id)}];

	const submit = () => {
		if (blockers.length > 0) {
			setResult({ok: false, lines: blockers});
			return;
		}
		const missing = params
			.filter((p) => {
				const eff = effectiveParam(at, p, args);
				return eff.visible && eff.required && (args[p.apiName] === undefined || args[p.apiName] === "");
			})
			.map((p) => `${p.displayName} is required.`);
		if (missing.length > 0) {
			setResult({ok: false, lines: missing});
			return;
		}
		// Simulated: the fixture has no instance store, so the effects list describes what WOULD happen.
		const effects = fn
			? [`ƒ ${fn.functionName} — ${fn.description}`]
			: rules.map((r) => {
					if (r.kind === "createLink" || r.kind === "deleteLink") {
						const lt = WC3_LINK_TYPES.find((l) => l.id === r.linkTypeId);
						return `${r.kind} ${lt ? linkTypeLabel(lt) : (r.linkTypeId ?? "?")} (${r.aParam ?? "?"} ↔ ${r.bParam ?? "?"})`;
					}
					const ot = r.objectTypeId ? getObjectType(r.objectTypeId) : undefined;
					return `${r.kind} ${ot?.displayName ?? r.objectTypeId ?? "?"}${r.set?.length ? ` · ${r.set.length} property mapping${r.set.length === 1 ? "" : "s"}` : ""}`;
				});
		const notifications = (at.sideEffects.notifications as {recipients: string}[]).map((n) => `notify ${n.recipients}`);
		if (tableMode) {
			setResult({
				ok: true,
				lines: rows.map((row, i) => `Row ${i + 1} (${row.id}): ${effects.join(" · ") || "no rules"}`),
			});
			return;
		}
		setResult({ok: true, lines: [...effects, ...notifications]});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-3xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>{at.displayName}</DialogTitle>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
						<Badge variant="neutralSoft" className="wwc:font-normal">
							Acting as: {actingUser.name} ({actingUser.groups.join(", ")})
						</Badge>
						<Badge variant={blockers.length === 0 ? "successSoft" : "warningSoft"}>
							{blockers.length === 0
								? "criteria pass live"
								: `${blockers.length} gate${blockers.length === 1 ? "" : "s"} failing live`}
						</Badge>
						{layout.inlineEdits && <Badge variant="infoSoft">inline-edit enabled</Badge>}
						{preset && Object.keys(preset).length > 0 && <Badge variant="infoSoft">prefilled</Badge>}
						{layout.tableEntry && (
							<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs">
								<Switch id="run-table-mode" checked={tableMode} onCheckedChange={setTableMode} />
								<Label htmlFor="run-table-mode" className="wwc:text-xs">
									Table entry mode
								</Label>
							</div>
						)}
					</div>
				</DialogHeader>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-4 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					{missingRefs.length > 0 && (
						<div className="wwc:flex wwc:items-start wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-red-600/30 wwc:bg-red-500/5 wwc:p-3 wwc:text-sm">
							<TriangleAlert className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:text-red-600" />
							<span>
								This action references <span className="wwc:font-mono">{missingRefs.join(", ")}</span>, which no longer
								exists — it is blocked from running until repaired.
							</span>
						</div>
					)}

					{blockers.length > 0 && (
						<div className="wwc:space-y-1 wwc:rounded-lg wwc:border wwc:border-amber-600/30 wwc:bg-amber-500/5 wwc:p-3 wwc:text-sm">
							<b className="wwc:flex wwc:items-center wwc:gap-2">
								<TriangleAlert className="wwc:h-4 wwc:w-4 wwc:text-amber-600" />
								Blocked
							</b>
							<ul className="wwc:ml-6 wwc:list-disc wwc:text-muted-foreground">
								{blockers.map((b) => (
									<li key={b}>{b}</li>
								))}
							</ul>
						</div>
					)}

					{tableMode ? (
						<div className="wwc:space-y-2">
							<div className="wwc:overflow-x-auto">
								<table className="wwc:w-full wwc:text-sm">
									<thead>
										<tr className="wwc:border-b wwc:border-border">
											{params.map((p) => (
												<th key={p.id} className="wwc:px-2 wwc:py-1.5 wwc:text-left wwc:font-medium">
													{p.displayName}
												</th>
											))}
											<th className="wwc:w-10">
												<span className="wwc:sr-only">Remove row</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{rows.map((row, index) => (
											<tr key={row.id} className="wwc:border-b wwc:border-border">
												{params.map((p) => (
													<td key={p.id} className="wwc:px-2 wwc:py-1.5">
														{controlFor(
															p,
															row.args[p.apiName],
															(v) =>
																setRows((prev) =>
																	prev.map((r) => (r.id === row.id ? {...r, args: {...r.args, [p.apiName]: v}} : r)),
																),
															false,
															instancesFor,
														)}
													</td>
												))}
												<td className="wwc:px-1">
													<Button
														variant="ghost"
														icon
														aria-label={`Remove row ${index + 1}`}
														className="wwc:h-7 wwc:w-7 wwc:text-destructive"
														disabled={rows.length === 1}
														onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
													>
														<X className="wwc:h-4 wwc:w-4" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									rowCounter.current += 1;
									setRows((prev) => [...prev, {id: `row-${rowCounter.current}`, args: {}}]);
								}}
							>
								<Plus className="wwc:h-3.5 wwc:w-3.5" />
								Add row
							</Button>
						</div>
					) : (
						sections.map((section) => {
							const inSection = section.parameterIds
								.map((id) => params.find((p) => p.id === id))
								.filter((p): p is ActParam => Boolean(p));
							if (inSection.length === 0) return null;
							return (
								<div key={section.id} className="wwc:space-y-3">
									<div>
										<h3 className="wwc:text-sm wwc:font-semibold">{section.title}</h3>
										{section.description && (
											<p className="wwc:text-xs wwc:text-muted-foreground">{section.description}</p>
										)}
									</div>
									<div
										className={
											section.columns === 1
												? "wwc:grid wwc:grid-cols-1 wwc:gap-3"
												: "wwc:grid wwc:grid-cols-1 wwc:gap-3 wwc:sm:grid-cols-2"
										}
									>
										{inSection.map((p) => {
											const eff = effectiveParam(at, p, args);
											if (!eff.visible) return null;
											const hints: string[] = [];
											if (p.validation && (p.validation.min !== undefined || p.validation.max !== undefined))
												hints.push(`range ${p.validation.min ?? "−∞"}–${p.validation.max ?? "∞"}`);
											if (p.default?.kind === "fromObjectProperty")
												hints.push(`defaults from ${p.default.param}.${p.default.property}`);
											return (
												<div key={p.id} className="wwc:space-y-1.5">
													<Label className="wwc:flex wwc:items-center wwc:gap-1.5">
														{p.displayName}
														{eff.required && <span className="wwc:text-destructive">*</span>}
														{eff.overrideNote && (
															<HoverTooltip content={eff.overrideNote}>
																<span className="wwc:cursor-default wwc:text-amber-600">↻</span>
															</HoverTooltip>
														)}
													</Label>
													{eff.editable ? (
														controlFor(p, args[p.apiName], (v) => setArg(p.apiName, v), false, instancesFor)
													) : (
														<Badge variant="neutralSoft" className="wwc:font-normal">
															{String(args[p.apiName] ?? "—")} · locked
														</Badge>
													)}
													{hints.length > 0 && (
														<p className="wwc:text-xs wwc:text-muted-foreground">{hints.join(" · ")}</p>
													)}
												</div>
											);
										})}
									</div>
								</div>
							);
						})
					)}

					{result && (
						<div
							className={
								result.ok
									? "wwc:space-y-1 wwc:rounded-lg wwc:border wwc:border-green-600/30 wwc:bg-green-500/5 wwc:p-3 wwc:text-sm"
									: "wwc:space-y-1 wwc:rounded-lg wwc:border wwc:border-red-600/30 wwc:bg-red-500/5 wwc:p-3 wwc:text-sm"
							}
						>
							<b className="wwc:flex wwc:items-center wwc:gap-2">
								{result.ok ? (
									<CircleCheck className="wwc:h-4 wwc:w-4 wwc:text-green-600" />
								) : (
									<TriangleAlert className="wwc:h-4 wwc:w-4 wwc:text-red-600" />
								)}
								{result.ok ? "Effects" : "Submission blocked"}
							</b>
							<ul className="wwc:ml-6 wwc:list-disc wwc:text-muted-foreground">
								{result.lines.map((line) => (
									<li key={line}>{line}</li>
								))}
							</ul>
						</div>
					)}
				</div>

				<DialogFooter>
					<span className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-xs wwc:text-muted-foreground">
						<RotateCw className="wwc:h-3.5 wwc:w-3.5" />
						{fn ? `ƒ ${fn.functionName}` : `Rules: ${[...new Set(rules.map((r) => r.kind))].join(", ") || "none"}`}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={submit}>
							<Play className="wwc:h-4 wwc:w-4" />
							{tableMode ? `Submit ${rows.length} row${rows.length === 1 ? "" : "s"}` : "Run action"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Re-exported so a caller types its `actionType` without reaching into the ontology fixture. */
export type {Wc3ActionType} from "./wc3-ontology-data";
