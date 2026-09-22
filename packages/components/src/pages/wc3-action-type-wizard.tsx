import {cn} from "@corensystem/core-utils";
import {Plus} from "lucide-react";
import * as React from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "../dialog";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Input} from "../input";
import {Label} from "../label";
import {RuleList, RuleRow} from "../rule-row";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../select";
import {Stepper, StepperIndicator, StepperItem, StepperLabel, StepperList, StepperSeparator} from "../stepper";
import {Switch} from "../switch";
import {Textarea} from "../textarea";
import {ToggleGroup, ToggleGroupItem} from "../toggle-group";

// NewActionTypeDialog — the prototype's four-step "New action type" wizard
// (Metadata → Parameters → Rules → Review), mirroring object-type-wizard.tsx's chrome exactly:
// Stepper rail, header/body/footer split, "Step N of 4", and a Next that is never disabled so
// clicking it reveals the step's inline error instead of silently doing nothing.
//
// Nothing WC3-specific is baked in: object types, link types, functions, parameter types, statuses
// and the verb list all arrive as props, and the host maps the emitted draft onto its own record —
// the same contract link-type-wizard.tsx uses. It lives under pages/ only because of where this
// tab's files are allowed to land; it has no dependency on the WC3 fixture and can move to
// src/action-type-wizard.tsx unchanged.

// ─── Option sets ─────────────────────────────────────────────────────────────

/** The prototype's parameter types, in its order (not alphabetical — scalars first, ref last). */
export const ACTION_PARAM_TYPES = ["string", "integer", "long", "double", "boolean", "date", "timestamp", "objectRef"];

/**
 * The verbs the prototype's create wizard accepts. Deliberately WIDER than the linter's list
 * (it adds add/remove/set/submit/open/start/stop/complete/mark), so "Submit permit" passes creation
 * and is still flagged by the Health tab afterwards. That inconsistency is the prototype's.
 */
export const ACTION_VERB_PREFIXES = [
	"assign",
	"record",
	"report",
	"grant",
	"retire",
	"reassess",
	"reassign",
	"create",
	"update",
	"log",
	"attach",
	"schedule",
	"approve",
	"close",
	"escalate",
	"renew",
	"onboard",
	"link",
	"baseline",
	"delay",
	"inspect",
	"issue",
	"request",
	"add",
	"remove",
	"set",
	"submit",
	"open",
	"start",
	"stop",
	"complete",
	"mark",
	"pour",
];

const DEFAULT_STATUSES = ["Active", "Experimental", "Deprecated", "Endorsed"];
const DEFAULT_FUNCTIONS = ["computeZoneRiskScores"];

const RULE_KINDS = [
	{kind: "createObject", label: "Create object"},
	{kind: "modifyObject", label: "Modify object"},
	{kind: "deleteObject", label: "Delete object"},
	{kind: "createLink", label: "Create link"},
	{kind: "deleteLink", label: "Delete link"},
] as const;

const STEPS = ["Metadata", "Parameters", "Rules", "Review"] as const;

/** Selected-segment tint for ToggleGroup items, matching object-type-wizard.tsx. */
const SEGMENT_ON =
	"wwc:data-[state=on]:border-blue-500 wwc:data-[state=on]:bg-blue-500/10 wwc:data-[state=on]:text-blue-600 wwc:dark:data-[state=on]:text-blue-400";

/** The two synthetic A/B choices a link rule offers beyond the declared parameters. */
const CREATED_OBJECT = "__created__";
const ANY_OBJECT = "*";

// ─── Draft shapes ────────────────────────────────────────────────────────────

export interface ActionTypeParamDraft {
	id: string;
	apiName: string;
	displayName: string;
	type: string;
	/** Only meaningful when `type === "objectRef"`. */
	objectTypeId: string | null;
	required: boolean;
}

export interface ActionTypeRuleDraft {
	id: string;
	kind: "createObject" | "modifyObject" | "deleteObject" | "createLink" | "deleteLink";
	objectTypeId?: string;
	linkTypeId?: string;
	/** Parameter apiName the rule reads/writes, for the object kinds. */
	targetParam?: string;
	aParam?: string;
	bParam?: string;
}

/** The value emitted when the wizard completes. */
export interface NewActionTypeDraft {
	displayName: string;
	apiName: string;
	description: string;
	status: string;
	parameters: ActionTypeParamDraft[];
	/** A function rule is exclusive: when true, `rules` is ignored and `functionName` is the whole action. */
	isFunction: boolean;
	functionName: string;
	rules: ActionTypeRuleDraft[];
}

export interface NewActionTypeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Fired with the assembled draft when "Create action type" is pressed. */
	onCreate?: (draft: NewActionTypeDraft) => void;
	/** Object types offered to objectRef parameters and to the object rules. */
	objectTypes: {id: string; label: string; icon?: React.ComponentType<{className?: string}>}[];
	/** Link types offered to the link rules. */
	linkTypes: {id: string; label: string}[];
	/** Backing functions offered when the action is function-backed. */
	functions?: string[];
	paramTypes?: string[];
	statuses?: string[];
	/** Drives the best-practice #5 naming error. */
	verbPrefixes?: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** "Assign crew to activity" → "assignCrewToActivity". Runs on blur, never while typing. */
function toCamelCase(value: string) {
	return value
		.trim()
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((word, index) =>
			index === 0
				? word.charAt(0).toLowerCase() + word.slice(1)
				: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
		)
		.join("");
}

function startsWithVerb(value: string, verbs: string[]) {
	const first = value.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
	return verbs.some((verb) => first === verb || first.startsWith(verb));
}

/** Uppercase field label, matching object-type-wizard.tsx. */
function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<Label className="wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase">
			{children}
		</Label>
	);
}

function WizardSteps({step}: {step: number}) {
	return (
		<Stepper value={step + 1} orientation="horizontal" className="wwc:w-full">
			<StepperList className="wwc:w-full">
				{STEPS.map((label, index) => (
					<React.Fragment key={label}>
						<StepperItem step={index + 1}>
							<StepperIndicator />
							<StepperLabel>{label}</StepperLabel>
						</StepperItem>
						{index < STEPS.length - 1 ? <StepperSeparator /> : null}
					</React.Fragment>
				))}
			</StepperList>
		</Stepper>
	);
}

// ─── Wizard ──────────────────────────────────────────────────────────────────

/** Four-step "New action type" wizard rendered in a Dialog. */
export function NewActionTypeDialog({
	open,
	onOpenChange,
	onCreate,
	objectTypes,
	linkTypes,
	functions = DEFAULT_FUNCTIONS,
	paramTypes = ACTION_PARAM_TYPES,
	statuses = DEFAULT_STATUSES,
	verbPrefixes = ACTION_VERB_PREFIXES,
}: NewActionTypeDialogProps) {
	const [step, setStep] = React.useState(0);
	// Flips true when Next is pressed on an incomplete step, so required fields validate inline.
	const [attemptedNext, setAttemptedNext] = React.useState(false);

	const [displayName, setDisplayName] = React.useState("");
	const [apiName, setApiName] = React.useState("");
	// Tracks whether the user has typed their own API name; autofill stops interfering once they have.
	const [apiTouched, setApiTouched] = React.useState(false);
	const [description, setDescription] = React.useState("");
	const [status, setStatus] = React.useState(statuses[1] ?? statuses[0] ?? "Experimental");

	const [parameters, setParameters] = React.useState<ActionTypeParamDraft[]>([]);
	const [isFunction, setIsFunction] = React.useState(false);
	const [functionName, setFunctionName] = React.useState(functions[0] ?? "");
	const [rules, setRules] = React.useState<ActionTypeRuleDraft[]>([]);

	// Ids are minted per row so a React key never has to fall back to an array index.
	const paramCounter = React.useRef(0);
	const ruleCounter = React.useRef(0);

	const reset = React.useCallback(() => {
		setStep(0);
		setAttemptedNext(false);
		setDisplayName("");
		setApiName("");
		setApiTouched(false);
		setDescription("");
		setStatus(statuses[1] ?? statuses[0] ?? "Experimental");
		setParameters([]);
		setIsFunction(false);
		setFunctionName(functions[0] ?? "");
		setRules([]);
		paramCounter.current = 0;
		ruleCounter.current = 0;
	}, [functions, statuses]);

	const handleOpenChange = (next: boolean) => {
		if (!next) reset();
		onOpenChange(next);
	};

	const nameMissing = displayName.trim().length === 0;
	const nameNotVerb = !nameMissing && !startsWithVerb(displayName, verbPrefixes);
	const apiMissing = apiName.trim().length === 0;
	const descMissing = description.trim().length === 0;
	const metadataValid = !nameMissing && !nameNotVerb && !apiMissing && !descMissing;
	// Zero parameters is explicitly allowed (function-backed recomputations), so step 2 never blocks.
	const rulesValid = isFunction ? functionName.trim().length > 0 : rules.length > 0;

	const showMetaErrors = attemptedNext && step === 0;
	const showRuleError = attemptedNext && step === 2 && !rulesValid;

	const goNext = () => {
		const invalid = (step === 0 && !metadataValid) || (step === 2 && !rulesValid);
		if (invalid) {
			setAttemptedNext(true);
			return;
		}
		setAttemptedNext(false);
		setStep((value) => value + 1);
	};

	const goBack = () => {
		setAttemptedNext(false);
		setStep((value) => value - 1);
	};

	const addParameter = () => {
		paramCounter.current += 1;
		const n = paramCounter.current;
		setParameters((prev) => [
			...prev,
			{
				id: `p${n}`,
				displayName: `Parameter ${n}`,
				apiName: `parameter_${n}`,
				type: paramTypes[0] ?? "string",
				objectTypeId: null,
				required: true,
			},
		]);
	};

	const patchParameter = (id: string, patch: Partial<ActionTypeParamDraft>) =>
		setParameters((prev) => prev.map((p) => (p.id === id ? {...p, ...patch} : p)));

	const addRule = (kind: ActionTypeRuleDraft["kind"]) => {
		ruleCounter.current += 1;
		const isLink = kind === "createLink" || kind === "deleteLink";
		setRules((prev) => [
			...prev,
			{
				id: `r${ruleCounter.current}`,
				kind,
				objectTypeId: isLink ? undefined : objectTypes[0]?.id,
				linkTypeId: isLink ? linkTypes[0]?.id : undefined,
				targetParam: undefined,
				aParam: isLink ? CREATED_OBJECT : undefined,
				bParam: isLink ? ANY_OBJECT : undefined,
			},
		]);
	};

	const patchRule = (id: string, patch: Partial<ActionTypeRuleDraft>) =>
		setRules((prev) => prev.map((r) => (r.id === id ? {...r, ...patch} : r)));

	const create = () => {
		onCreate?.({
			displayName: displayName.trim(),
			apiName: apiName.trim(),
			description: description.trim(),
			status,
			parameters,
			isFunction,
			functionName: functionName.trim(),
			rules: isFunction ? [] : rules,
		});
		handleOpenChange(false);
	};

	// Object-typed parameters are the only ones a rule can target, so they drive the target selects.
	const paramOptions = parameters.filter((p) => p.apiName.trim().length > 0);
	const objectLabel = (id: string | undefined) => objectTypes.find((o) => o.id === id)?.label ?? "—";
	const linkLabel = (id: string | undefined) => linkTypes.find((l) => l.id === id)?.label ?? "—";

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="wwc:flex wwc:max-h-[92vh] wwc:w-[calc(100vw-2rem)] wwc:max-w-4xl wwc:flex-col wwc:gap-0 wwc:overflow-hidden wwc:p-0">
				<DialogHeader>
					<DialogTitle>New action type</DialogTitle>
				</DialogHeader>

				<div className="wwc:border-b wwc:border-border wwc:px-6 wwc:py-4">
					<WizardSteps step={step} />
				</div>

				<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-y-auto wwc:px-6 wwc:py-5">
					{/* ── Step 1 · Metadata ── */}
					{step === 0 ? (
						<div className="wwc:grid wwc:grid-cols-1 wwc:gap-x-8 wwc:gap-y-5 wwc:md:grid-cols-2">
							<div className="wwc:space-y-1.5">
								<FieldLabel>Display name</FieldLabel>
								<Input
									value={displayName}
									onChange={(event) => setDisplayName(event.target.value)}
									onBlur={() => {
										// API name is derived, not dictated: only fill it while the user has left it alone.
										if (!apiTouched) setApiName(toCamelCase(displayName));
									}}
									aria-invalid={showMetaErrors && (nameMissing || nameNotVerb)}
									className={cn(
										showMetaErrors &&
											(nameMissing || nameNotVerb) &&
											"wwc:border-destructive wwc:focus-visible:ring-destructive",
									)}
								/>
								{showMetaErrors && nameMissing ? (
									<p className="wwc:text-xs wwc:text-destructive">Display name is required.</p>
								) : showMetaErrors && nameNotVerb ? (
									<p className="wwc:text-xs wwc:text-destructive">
										Action names should start with a verb — “Assign crew to activity”, not “Crew record”. (best practice
										#5)
									</p>
								) : (
									<p className="wwc:text-xs wwc:text-muted-foreground">e.g. “Assign crew to activity”</p>
								)}
							</div>

							<div className="wwc:space-y-1.5">
								<FieldLabel>API name</FieldLabel>
								<Input
									className="wwc:font-mono"
									value={apiName}
									onChange={(event) => {
										setApiTouched(true);
										setApiName(event.target.value);
									}}
									aria-invalid={showMetaErrors && apiMissing}
								/>
								{showMetaErrors && apiMissing ? (
									<p className="wwc:text-xs wwc:text-destructive">API name is required.</p>
								) : (
									<p className="wwc:text-xs wwc:text-muted-foreground">camelCase, stable forever</p>
								)}
							</div>

							<div className="wwc:space-y-1.5 wwc:md:col-span-2">
								<FieldLabel>Description</FieldLabel>
								<Textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
								{showMetaErrors && descMissing ? (
									<p className="wwc:text-xs wwc:text-destructive">Description is required.</p>
								) : (
									<p className="wwc:text-xs wwc:text-muted-foreground">
										Every element carries a description (best practice #8)
									</p>
								)}
							</div>

							<div className="wwc:space-y-2 wwc:md:col-span-2">
								<FieldLabel>Status</FieldLabel>
								<ToggleGroup
									type="single"
									value={status}
									onValueChange={(value) => value && setStatus(value)}
									variant="outline"
									size="sm"
									className="wwc:justify-start"
								>
									{statuses.map((option) => (
										<ToggleGroupItem key={option} value={option} className={SEGMENT_ON}>
											{option}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</div>
						</div>
					) : null}

					{/* ── Step 2 · Parameters ── */}
					{step === 1 ? (
						<RuleList
							onAdd={addParameter}
							addLabel="Add parameter"
							emptyMessage="Zero-parameter actions are allowed (e.g. function-backed recomputations)."
						>
							{parameters.map((p) => (
								<RuleRow
									key={p.id}
									showDragHandle={false}
									onDelete={() => setParameters((prev) => prev.filter((x) => x.id !== p.id))}
									deleteLabel={`Remove ${p.displayName}`}
								>
									<Input
										aria-label="Parameter display name"
										className="wwc:w-44"
										value={p.displayName}
										onChange={(event) => patchParameter(p.id, {displayName: event.target.value})}
									/>
									<Input
										aria-label="Parameter API name"
										className="wwc:w-44 wwc:font-mono"
										value={p.apiName}
										onChange={(event) => patchParameter(p.id, {apiName: event.target.value})}
									/>
									<Select
										value={p.type}
										onValueChange={(value) =>
											patchParameter(p.id, {
												type: value,
												// Dropping objectRef must drop the object type with it, or the draft keeps a dead id.
												objectTypeId: value === "objectRef" ? (p.objectTypeId ?? objectTypes[0]?.id ?? null) : null,
											})
										}
									>
										<SelectTrigger className="wwc:w-36" aria-label="Parameter type">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{paramTypes.map((t) => (
												<SelectItem key={t} value={t}>
													{t}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{p.type === "objectRef" && (
										<Select
											value={p.objectTypeId ?? ""}
											onValueChange={(value) => patchParameter(p.id, {objectTypeId: value})}
										>
											<SelectTrigger className="wwc:w-48" aria-label="Object type">
												<SelectValue placeholder="Object type…" />
											</SelectTrigger>
											<SelectContent>
												{objectTypes.map((o) => (
													<SelectItem key={o.id} value={o.id}>
														{o.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
									<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-sm">
										<Switch
											id={`${p.id}-required`}
											checked={p.required}
											onCheckedChange={(checked) => patchParameter(p.id, {required: checked})}
										/>
										<Label htmlFor={`${p.id}-required`}>Required</Label>
									</div>
								</RuleRow>
							))}
						</RuleList>
					) : null}

					{/* ── Step 3 · Rules ── */}
					{step === 2 ? (
						<div className="wwc:space-y-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3 wwc:text-sm">
								<Switch id="at-fn-backed" checked={isFunction} onCheckedChange={setIsFunction} />
								<Label htmlFor="at-fn-backed" className="wwc:font-medium">
									Function-backed action (single exclusive function rule)
								</Label>
							</div>

							{isFunction ? (
								<div className="wwc:space-y-1.5">
									<FieldLabel>Function</FieldLabel>
									<Select value={functionName} onValueChange={setFunctionName}>
										<SelectTrigger className="wwc:w-72">
											<SelectValue placeholder="Pick a function…" />
										</SelectTrigger>
										<SelectContent>
											{functions.map((fn) => (
												<SelectItem key={fn} value={fn}>
													{fn}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="wwc:text-xs wwc:text-muted-foreground">
										A function rule is exclusive — declarative rules are disabled while it is on.
									</p>
								</div>
							) : (
								<>
									<RuleList emptyMessage="No rules yet. An action needs at least one rule unless it is function-backed.">
										{rules.map((r, index) => {
											const isLink = r.kind === "createLink" || r.kind === "deleteLink";
											return (
												<RuleRow
													key={r.id}
													showDragHandle={false}
													meta={
														<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">{index + 1}.</span>
													}
													onDelete={() => setRules((prev) => prev.filter((x) => x.id !== r.id))}
												>
													<Badge variant="neutralSoft" className="wwc:font-mono wwc:font-normal">
														{r.kind}
													</Badge>
													{isLink ? (
														<Select
															value={r.linkTypeId ?? ""}
															onValueChange={(value) => patchRule(r.id, {linkTypeId: value})}
														>
															<SelectTrigger className="wwc:w-56" aria-label="Link type">
																<SelectValue placeholder="Link type…" />
															</SelectTrigger>
															<SelectContent>
																{linkTypes.map((l) => (
																	<SelectItem key={l.id} value={l.id}>
																		{l.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													) : (
														<Select
															value={r.objectTypeId ?? ""}
															onValueChange={(value) => patchRule(r.id, {objectTypeId: value})}
														>
															<SelectTrigger className="wwc:w-56" aria-label="Object type">
																<SelectValue placeholder="Object type…" />
															</SelectTrigger>
															<SelectContent>
																{objectTypes.map((o) => (
																	<SelectItem key={o.id} value={o.id}>
																		{o.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													)}

													{isLink ? (
														<>
															<span className="wwc:text-sm wwc:text-muted-foreground">A</span>
															<Select
																value={r.aParam ?? CREATED_OBJECT}
																onValueChange={(value) => patchRule(r.id, {aParam: value})}
															>
																<SelectTrigger className="wwc:w-44" aria-label="Side A parameter">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value={CREATED_OBJECT}>(created object)</SelectItem>
																	<SelectItem value={ANY_OBJECT}>* (any)</SelectItem>
																	{paramOptions.map((p) => (
																		<SelectItem key={p.id} value={p.apiName}>
																			{p.apiName}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<span className="wwc:text-sm wwc:text-muted-foreground">B</span>
															<Select
																value={r.bParam ?? ANY_OBJECT}
																onValueChange={(value) => patchRule(r.id, {bParam: value})}
															>
																<SelectTrigger className="wwc:w-44" aria-label="Side B parameter">
																	<SelectValue />
																</SelectTrigger>
																<SelectContent>
																	<SelectItem value={CREATED_OBJECT}>(created object)</SelectItem>
																	<SelectItem value={ANY_OBJECT}>* (any)</SelectItem>
																	{paramOptions.map((p) => (
																		<SelectItem key={p.id} value={p.apiName}>
																			{p.apiName}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</>
													) : r.kind === "createObject" ? (
														<span className="wwc:text-xs wwc:text-muted-foreground">
															property mapping is configured on the action page
														</span>
													) : (
														<>
															<span className="wwc:text-sm wwc:text-muted-foreground">target</span>
															<Select
																value={r.targetParam ?? ""}
																onValueChange={(value) => patchRule(r.id, {targetParam: value})}
															>
																<SelectTrigger className="wwc:w-44" aria-label="Target parameter">
																	<SelectValue placeholder="Parameter…" />
																</SelectTrigger>
																<SelectContent>
																	{paramOptions.map((p) => (
																		<SelectItem key={p.id} value={p.apiName}>
																			{p.apiName}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</>
													)}
												</RuleRow>
											);
										})}
									</RuleList>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" className="wwc:self-start">
												<Plus className="wwc:h-4 wwc:w-4" />
												Add rule
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											{RULE_KINDS.map((k) => (
												<DropdownMenuItem key={k.kind} onSelect={() => addRule(k.kind)}>
													{k.label}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>

									{showRuleError && (
										<p className="wwc:text-xs wwc:text-destructive">
											Add at least one rule, or make the action function-backed.
										</p>
									)}
								</>
							)}
						</div>
					) : null}

					{/* ── Step 4 · Review ── */}
					{step === 3 ? (
						<div className="wwc:space-y-5">
							<dl className="wwc:grid wwc:grid-cols-[10rem_1fr] wwc:gap-x-4 wwc:gap-y-3 wwc:text-sm">
								<dt className="wwc:text-muted-foreground">Action</dt>
								<dd className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
									<span className="wwc:font-semibold">{displayName || "—"}</span>
									<Badge variant="secondary" className="wwc:h-5 wwc:text-xs">
										{status}
									</Badge>
								</dd>
								<dt className="wwc:text-muted-foreground">API name</dt>
								<dd className="wwc:font-mono wwc:text-xs">{apiName || "—"}</dd>
								<dt className="wwc:text-muted-foreground">Description</dt>
								<dd>{description || "—"}</dd>
								<dt className="wwc:text-muted-foreground">Parameters</dt>
								<dd>
									{parameters.length === 0 ? (
										<span className="wwc:text-muted-foreground">none — zero-parameter action</span>
									) : (
										<span className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
											{parameters.map((p) => (
												<Badge key={p.id} variant="neutralSoft" className="wwc:font-mono wwc:font-normal">
													{p.apiName} : {p.type}
												</Badge>
											))}
										</span>
									)}
								</dd>
								<dt className="wwc:text-muted-foreground">Rules</dt>
								<dd>
									{isFunction ? (
										<Badge variant="infoSoft" className="wwc:font-mono wwc:font-normal">
											ƒ {functionName || "—"} (exclusive)
										</Badge>
									) : rules.length === 0 ? (
										<span className="wwc:text-muted-foreground">none</span>
									) : (
										<span className="wwc:flex wwc:flex-wrap wwc:gap-1.5">
											{rules.map((r) => (
												<Badge key={r.id} variant="neutralSoft" className="wwc:font-mono wwc:font-normal">
													{r.kind} ·{" "}
													{r.kind === "createLink" || r.kind === "deleteLink"
														? linkLabel(r.linkTypeId)
														: objectLabel(r.objectTypeId)}
												</Badge>
											))}
										</span>
									)}
								</dd>
								<dt className="wwc:text-muted-foreground">RID</dt>
								<dd className="wwc:text-muted-foreground">RID auto-generated on create</dd>
							</dl>

							<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-muted/40 wwc:p-4 wwc:text-sm wwc:text-muted-foreground">
								Submission criteria, side effects, form layout and permissions are configured on the action page after
								creation.
							</div>
						</div>
					) : null}
				</div>

				<DialogFooter>
					<span className="wwc:text-sm wwc:text-muted-foreground">
						Step {step + 1} of {STEPS.length}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{step > 0 ? (
							<Button variant="outline" onClick={goBack}>
								← Back
							</Button>
						) : null}
						{step < STEPS.length - 1 ? (
							<Button onClick={goNext}>Next →</Button>
						) : (
							<Button onClick={create}>Create action type</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/** Exported so a host rendering its own rule rows uses the same synthetic A/B values. */
export const ACTION_RULE_PARAM_SENTINELS = {createdObject: CREATED_OBJECT, anyObject: ANY_OBJECT};
