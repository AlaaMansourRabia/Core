import type {ReactNode} from "react";

// The right-panel "question inspector" — the ENTIRE settings surface for the selected question,
// organized natively for a narrow (~300px) side aside. It replaces the old centered settings modal:
// no Dialog here, just a vertically scrollable stack of collapsible groups. Basic field settings and
// conditional logic (visibility / requiredness / editable / restricted options) live side by side.
//
// Every mutation routes through the FormBuilder hook — this file is pure UI over the frozen model.
// Rule editors may ONLY reference questions that appear EARLIER in the form (forward-reference guard,
// enforced via `earlierQuestions`); when there are none, "Add rule" is disabled with a hint.
import {ChevronDown, ChevronUp, Plus, TriangleAlert, Trash2, X} from "lucide-react";

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "../../accordion";
import {Badge} from "../../badge";
import {Button} from "../../button";
import {Checkbox} from "../../checkbox";
import {Input} from "../../input";
import {Label} from "../../label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../select";
import {Switch} from "../../switch";
import {Textarea} from "../../textarea";
import {DATA_SOURCE_OPTIONS, PERMIT_COLUMN_OPTIONS} from "./dataSources";
import {isRuleBroken} from "./logic";
import {
	QUESTION_TYPES,
	earlierQuestions,
	makeQuestion,
	makeRuleGroup,
	makeTableColumn,
	makeTableRow,
	questionTypeMeta,
	uid,
} from "./model";
import type {CellType, OptionRestriction, Question, QuestionType, RuleGroup, TableColumn} from "./model";
import {RuleGroupEditor} from "./RuleGroupEditor";
import type {FormBuilder} from "./useFormBuilder";

/** Sentinel Select value — Radix Select forbids empty-string item values. */
const NONE = "__none__";

/** Cell/column input types offered by matrix (uniform) and gas_test_table (per-column). */
const CELL_TYPE_OPTIONS: {value: CellType; label: string}[] = [
	{value: "yes_no", label: "Yes / No"},
	{value: "text", label: "Text"},
	{value: "number", label: "Number"},
	{value: "rating", label: "Rating"},
];

/**
 * Reusable row/column list editor: each item is a label Input (rename) with move up/down + remove,
 * and an "Add" button that appends. When `withTypeSelect` is set, each item also gets a per-column
 * `type` Select (used by gas_test_table reading columns). All edits go back through `onChange` with a
 * fresh array so the caller can persist immutably. Typed on `TableColumn` (a superset of `TableRow`).
 */
function TableListEditor({
	items,
	addLabel,
	makeItem,
	withTypeSelect = false,
	onChange,
}: {
	items: TableColumn[];
	addLabel: string;
	makeItem: (count: number) => TableColumn;
	withTypeSelect?: boolean;
	onChange: (next: TableColumn[]) => void;
}): JSX.Element {
	function updateItem(id: string, up: (item: TableColumn) => TableColumn) {
		onChange(items.map((it) => (it.id === id ? up(it) : it)));
	}
	function move(index: number, dir: -1 | 1) {
		const target = index + dir;
		if (target < 0 || target >= items.length) return;
		const next = items.slice();
		const [moved] = next.splice(index, 1);
		next.splice(target, 0, moved);
		onChange(next);
	}
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			{items.map((item, i) => (
				<div key={item.id} className="wwc:flex wwc:items-center wwc:gap-1.5">
					<Input
						className="wwc:h-8 wwc:min-w-0 wwc:flex-1"
						aria-label="Label"
						value={item.label}
						onChange={(e) => updateItem(item.id, (it) => ({...it, label: e.target.value}))}
					/>
					{withTypeSelect ? (
						<Select
							value={item.type ?? "text"}
							onValueChange={(v) => updateItem(item.id, (it) => ({...it, type: v as CellType}))}
						>
							<SelectTrigger className="wwc:h-8 wwc:w-28 wwc:shrink-0">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{CELL_TYPE_OPTIONS.map((o) => (
									<SelectItem key={o.value} value={o.value}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : null}
					<Button
						icon
						size="sm"
						variant="ghost"
						tooltip="Move up"
						aria-label="Move up"
						disabled={i === 0}
						onClick={() => move(i, -1)}
					>
						<ChevronUp />
					</Button>
					<Button
						icon
						size="sm"
						variant="ghost"
						tooltip="Move down"
						aria-label="Move down"
						disabled={i === items.length - 1}
						onClick={() => move(i, 1)}
					>
						<ChevronDown />
					</Button>
					<Button
						icon
						size="sm"
						variant="ghost"
						tooltip="Remove"
						aria-label="Remove"
						onClick={() => onChange(items.filter((it) => it.id !== item.id))}
					>
						<X />
					</Button>
				</div>
			))}
			<Button
				variant="outline"
				size="sm"
				className="wwc:h-7 wwc:self-start"
				onClick={() => onChange([...items, makeItem(items.length)])}
			>
				<Plus />
				{addLabel}
			</Button>
		</div>
	);
}

/** A small "logic active" chip shown on a group whose rule/restriction is set. */
function ActiveBadge(): JSX.Element {
	return (
		<Badge variant="infoSoft" className="wwc:shrink-0">
			active
		</Badge>
	);
}

/** A destructive chip flagging a rule that references a question no longer earlier in the form. */
function BrokenBadge(): JSX.Element {
	return (
		<Badge variant="destructive" className="wwc:shrink-0 wwc:gap-1">
			<TriangleAlert className="wwc:size-3" />
			Broken
		</Badge>
	);
}

/** The muted explanation shown under a broken rule. */
function BrokenNote(): JSX.Element {
	return (
		<p className="wwc:text-xs wwc:text-destructive">References a question that is no longer earlier in the form.</p>
	);
}

/** A labelled control block inside an accordion section. */
function Field({label, subtext, children}: {label: string; subtext?: string; children: ReactNode}): JSX.Element {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>{label}</Label>
			{subtext ? <p className="wwc:text-xs wwc:text-muted-foreground">{subtext}</p> : null}
			{children}
		</div>
	);
}

/** A logic-rule block: undefined ⇒ muted default + add button; present ⇒ editor + remove. */
function RuleField({
	subtext,
	rule,
	broken = false,
	earlier,
	emptyLabel,
	addLabel,
	onCreate,
	onChange,
	onRemove,
}: {
	subtext?: string;
	rule: RuleGroup | undefined;
	broken?: boolean;
	earlier: Question[];
	emptyLabel: string;
	addLabel: string;
	onCreate: () => void;
	onChange: (r: RuleGroup) => void;
	onRemove: () => void;
}): JSX.Element {
	const noEarlier = earlier.length === 0;
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			{subtext ? <p className="wwc:text-xs wwc:text-muted-foreground">{subtext}</p> : null}
			{rule ? (
				<>
					<RuleGroupEditor rule={rule} earlier={earlier} onChange={onChange} />
					{broken ? <BrokenNote /> : null}
					<Button variant="ghost" size="sm" className="wwc:h-7 wwc:self-start wwc:text-destructive" onClick={onRemove}>
						<Trash2 />
						Remove rule
					</Button>
				</>
			) : (
				<>
					<p className="wwc:text-sm wwc:text-muted-foreground">{emptyLabel}</p>
					<Button
						variant="outline"
						size="sm"
						className="wwc:h-7 wwc:self-start"
						onClick={onCreate}
						disabled={noEarlier}
					>
						<Plus />
						{addLabel}
					</Button>
					{noEarlier ? (
						<p className="wwc:text-xs wwc:text-muted-foreground">
							No earlier questions to reference — this is the first question, so there is nothing to test against.
						</p>
					) : null}
				</>
			)}
		</div>
	);
}

export function QuestionInspector({builder}: {builder: FormBuilder}): JSX.Element {
	const q = builder.selected;

	if (!q) {
		return (
			<div className="wwc:flex wwc:h-full wwc:items-center wwc:justify-center wwc:p-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
				Select a question to edit its settings.
			</div>
		);
	}

	// Re-mount the body on selection change so uncontrolled bits reset cleanly per question.
	return <InspectorBody key={q.id} builder={builder} question={q} />;
}

function InspectorBody({builder, question: q}: {builder: FormBuilder; question: Question}): JSX.Element {
	const earlier = earlierQuestions(builder.schema, q.id);
	const firstEarlierId = earlier[0]?.id;
	const sections = builder.schema.sections ?? [];
	const isChoice = q.type === "multiple_choice";
	const restrictions = q.optionRestrictions ?? [];

	function patch<K extends keyof Question>(key: K, value: Question[K]) {
		builder.updateQuestion(q.id, {[key]: value} as Partial<Question>);
	}

	// Switching type resets type-specific fields to the fresh defaults for the new type
	// (placeholder / options / min / max / allowMultiple), and clears the now-mismatched default.
	function changeType(next: QuestionType) {
		if (next === q.type) return;
		const fresh = makeQuestion(next);
		builder.updateQuestion(q.id, {
			type: next,
			placeholder: fresh.placeholder,
			options: fresh.options,
			allowMultiple: fresh.allowMultiple,
			min: fresh.min,
			max: fresh.max,
			defaultValue: undefined,
		});
	}

	// ── Restricted-options helpers ──
	const allOptionValues = (q.options ?? []).map((o) => o.value);

	function setRestrictions(next: OptionRestriction[]) {
		builder.updateQuestion(q.id, {optionRestrictions: next.length ? next : undefined});
	}

	function updateRestriction(id: string, up: (r: OptionRestriction) => OptionRestriction) {
		setRestrictions(restrictions.map((r) => (r.id === id ? up(r) : r)));
	}

	function toggleAllowed(restriction: OptionRestriction, value: string) {
		const allowed = restriction.allowedValues.includes(value)
			? restriction.allowedValues.filter((v) => v !== value)
			: [...restriction.allowedValues, value];
		updateRestriction(restriction.id, (r) => ({...r, allowedValues: allowed}));
	}

	// Which type-specific basics apply.
	const hasPlaceholder = q.type === "short_text" || q.type === "email" || q.type === "long_text";
	const hasMinMax = q.type === "rating" || q.type === "long_text";

	// Richer question types with their own config surface in the Field group.
	const isMatrix = q.type === "matrix";
	const isGasTable = q.type === "gas_test_table";
	const isDataSource = q.type === "data_source_select";
	const isDerived = q.type === "derived_count";
	// derived_count may only depend on an EARLIER data_source_select question.
	const earlierSources = earlier.filter((e) => e.type === "data_source_select");

	// "logic active" flags for the group headers.
	const requirednessActive = !!q.requirednessRule;
	const visibilityActive = !!q.visibilityRule;
	const editableActive = !!q.editableRule;
	const restrictionsActive = restrictions.length > 0;

	// "broken rule" flags — recomputed from the live schema each render (cheap + pure). A rule is
	// broken when a condition references a question that is no longer earlier (e.g. after reorder).
	const requirednessBroken = isRuleBroken(builder.schema, q.id, q.requirednessRule);
	const visibilityBroken = isRuleBroken(builder.schema, q.id, q.visibilityRule);
	const editableBroken = isRuleBroken(builder.schema, q.id, q.editableRule);
	const restrictionsBroken = restrictions.some((r) => isRuleBroken(builder.schema, q.id, r.rule));

	return (
		<div className="wwc:flex wwc:h-full wwc:flex-col wwc:overflow-y-auto">
			{/* Header — the question type. The label is editable here (Field group) and on the canvas. */}
			<div className="wwc:flex wwc:flex-col wwc:gap-0.5 wwc:border-b wwc:border-border wwc:px-3 wwc:py-3">
				<span className="wwc:text-sm wwc:font-semibold">Question settings</span>
				<span className="wwc:text-xs wwc:text-muted-foreground">{questionTypeMeta(q.type).label}</span>
			</div>

			<Accordion type="multiple" defaultValue={["field"]} className="wwc:px-3">
				{/* ── Field ── */}
				<AccordionItem value="field">
					<AccordionTrigger>Field</AccordionTrigger>
					<AccordionContent className="wwc:flex wwc:flex-col wwc:gap-4">
						<Field label="Label" subtext="The question text shown to respondents.">
							<Input
								value={q.label}
								placeholder="Your question here..."
								onChange={(e) => patch("label", e.target.value)}
							/>
						</Field>

						<Field label="Description" subtext="Optional subtext shown under the label.">
							<Textarea
								rows={2}
								value={q.description ?? ""}
								placeholder="Add a description (optional)"
								onChange={(e) => patch("description", e.target.value || undefined)}
							/>
						</Field>

						<Field label="Type" subtext="Changing type resets type-specific settings.">
							<Select value={q.type} onValueChange={(v) => changeType(v as QuestionType)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{QUESTION_TYPES.map((t) => (
										<SelectItem key={t.type} value={t.type}>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<label className="wwc:flex wwc:cursor-pointer wwc:items-center wwc:justify-between wwc:gap-2">
							<span className="wwc:text-sm">Required</span>
							<Switch checked={q.required} onCheckedChange={(v) => patch("required", v)} />
						</label>

						{hasPlaceholder ? (
							<Field label="Placeholder">
								<Input
									value={q.placeholder ?? ""}
									placeholder="Shown in the empty control"
									onChange={(e) => patch("placeholder", e.target.value)}
								/>
							</Field>
						) : null}

						{isChoice ? (
							<Field label="Options">
								<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
									{(q.options ?? []).map((opt) => (
										<div key={opt.id} className="wwc:flex wwc:items-center wwc:gap-1.5">
											<Input
												className="wwc:h-8 wwc:min-w-0 wwc:flex-1"
												aria-label="Option label"
												value={opt.label}
												onChange={(e) => builder.updateOption(q.id, opt.id, {label: e.target.value})}
											/>
											<Button
												icon
												size="sm"
												variant="ghost"
												tooltip="Remove option"
												aria-label="Remove option"
												onClick={() => builder.removeOption(q.id, opt.id)}
											>
												<Trash2 />
											</Button>
										</div>
									))}
									<Button
										variant="outline"
										size="sm"
										className="wwc:h-7 wwc:self-start"
										onClick={() => builder.addOption(q.id)}
									>
										<Plus />
										Add option
									</Button>
								</div>
								<label className="wwc:mt-1 wwc:flex wwc:cursor-pointer wwc:items-center wwc:justify-between wwc:gap-2">
									<span className="wwc:text-sm">Allow multiple</span>
									<Switch checked={q.allowMultiple ?? false} onCheckedChange={(v) => patch("allowMultiple", v)} />
								</label>
							</Field>
						) : null}

						{hasMinMax ? (
							<Field label={q.type === "rating" ? "Scale (min / max)" : "Length (min / max chars)"}>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Input
										type="number"
										className="wwc:min-w-0 wwc:flex-1"
										aria-label="Minimum"
										placeholder="min"
										value={q.min ?? ""}
										onChange={(e) => patch("min", e.target.value === "" ? undefined : Number(e.target.value))}
									/>
									<span className="wwc:text-muted-foreground">–</span>
									<Input
										type="number"
										className="wwc:min-w-0 wwc:flex-1"
										aria-label="Maximum"
										placeholder="max"
										value={q.max ?? ""}
										onChange={(e) => patch("max", e.target.value === "" ? undefined : Number(e.target.value))}
									/>
								</div>
							</Field>
						) : null}

						{isMatrix ? (
							<>
								<Field label="Matrix rows">
									<TableListEditor
										items={q.tableRows ?? []}
										addLabel="Add row"
										makeItem={(n) => makeTableRow(`New row ${n + 1}`)}
										onChange={(next) => patch("tableRows", next)}
									/>
								</Field>
								<Field label="Matrix columns">
									<TableListEditor
										items={q.tableColumns ?? []}
										addLabel="Add column"
										makeItem={(n) => makeTableColumn(`New column ${n + 1}`)}
										onChange={(next) => patch("tableColumns", next)}
									/>
								</Field>
								<Field label="Cell type">
									<Select value={q.cellType ?? "yes_no"} onValueChange={(v) => patch("cellType", v as CellType)}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{CELL_TYPE_OPTIONS.map((o) => (
												<SelectItem key={o.value} value={o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</>
						) : null}

						{isGasTable ? (
							<>
								<Field label="Gases (rows)">
									<TableListEditor
										items={q.tableRows ?? []}
										addLabel="Add row"
										makeItem={(n) => makeTableRow(`New row ${n + 1}`)}
										onChange={(next) => patch("tableRows", next)}
									/>
								</Field>
								<Field label="Reading columns">
									<TableListEditor
										items={q.tableColumns ?? []}
										addLabel="Add column"
										withTypeSelect
										makeItem={(n) => makeTableColumn(`New column ${n + 1}`, "text")}
										onChange={(next) => patch("tableColumns", next)}
									/>
								</Field>
							</>
						) : null}

						{isDataSource ? (
							<Field label="Data source">
								<Select
									value={q.dataSource ?? NONE}
									onValueChange={(v) => patch("dataSource", v === NONE ? undefined : v)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a data source" />
									</SelectTrigger>
									<SelectContent>
										{DATA_SOURCE_OPTIONS.map((o) => (
											<SelectItem key={o.value} value={o.value}>
												{o.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						) : null}

						{isDerived ? (
							<>
								<Field label="Depends on">
									{earlierSources.length === 0 ? (
										<p className="wwc:text-sm wwc:text-muted-foreground">
											Add a data source select question earlier in the form.
										</p>
									) : (
										<Select
											value={q.dependsOn ?? NONE}
											onValueChange={(v) => patch("dependsOn", v === NONE ? undefined : v)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a question" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={NONE}>None</SelectItem>
												{earlierSources.map((s) => (
													<SelectItem key={s.id} value={s.id}>
														{s.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</Field>
								<Field label="Column binding (optional)">
									<Select
										value={q.columnBinding ? q.columnBinding : NONE}
										onValueChange={(v) => patch("columnBinding", v === NONE ? undefined : v)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{PERMIT_COLUMN_OPTIONS.map((o) => (
												<SelectItem key={o.value || NONE} value={o.value === "" ? NONE : o.value}>
													{o.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<p className="wwc:text-xs wwc:text-muted-foreground">
										Binds the answer to a permit column on submit.
									</p>
								</Field>
							</>
						) : null}

						<Field label="Help text">
							<Input
								value={q.helpText ?? ""}
								placeholder="Extra guidance shown under the control"
								onChange={(e) => patch("helpText", e.target.value)}
							/>
						</Field>

						<Field label="Section">
							<Select value={q.sectionId ?? NONE} onValueChange={(v) => patch("sectionId", v === NONE ? undefined : v)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={NONE}>No section</SelectItem>
									{sections.map((s) => (
										<SelectItem key={s.id} value={s.id}>
											{s.title || "Untitled section"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</AccordionContent>
				</AccordionItem>

				{/* ── Requiredness logic ── */}
				<AccordionItem value="requiredness">
					<AccordionTrigger>
						<GroupHeading label="Requiredness logic" active={requirednessActive} broken={requirednessBroken} />
					</AccordionTrigger>
					<AccordionContent className="wwc:flex wwc:flex-col wwc:gap-3">
						<RuleField
							subtext="Required only when… — this rule makes the question required IN ADDITION to the Required toggle (required if the toggle is on OR this rule passes)."
							rule={q.requirednessRule}
							broken={requirednessBroken}
							earlier={earlier}
							emptyLabel="Requiredness follows the Required toggle in the Field group."
							addLabel="Add requiredness rule"
							onCreate={() => firstEarlierId && patch("requirednessRule", makeRuleGroup(firstEarlierId))}
							onChange={(r) => patch("requirednessRule", r)}
							onRemove={() => patch("requirednessRule", undefined)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* ── Visibility ── */}
				<AccordionItem value="visibility">
					<AccordionTrigger>
						<GroupHeading label="Visibility" active={visibilityActive} broken={visibilityBroken} />
					</AccordionTrigger>
					<AccordionContent>
						<RuleField
							rule={q.visibilityRule}
							broken={visibilityBroken}
							earlier={earlier}
							emptyLabel="Always visible."
							addLabel="Add visibility rule"
							onCreate={() => firstEarlierId && patch("visibilityRule", makeRuleGroup(firstEarlierId))}
							onChange={(r) => patch("visibilityRule", r)}
							onRemove={() => patch("visibilityRule", undefined)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* ── Editable ── */}
				<AccordionItem value="editable">
					<AccordionTrigger>
						<GroupHeading label="Editable" active={editableActive} broken={editableBroken} />
					</AccordionTrigger>
					<AccordionContent>
						<RuleField
							subtext="A non-editable question is still shown, but its control is locked."
							rule={q.editableRule}
							broken={editableBroken}
							earlier={earlier}
							emptyLabel="Always editable."
							addLabel="Add editable rule"
							onCreate={() => firstEarlierId && patch("editableRule", makeRuleGroup(firstEarlierId))}
							onChange={(r) => patch("editableRule", r)}
							onRemove={() => patch("editableRule", undefined)}
						/>
					</AccordionContent>
				</AccordionItem>

				{/* ── Default value ── */}
				<AccordionItem value="default">
					<AccordionTrigger>Default value</AccordionTrigger>
					<AccordionContent>
						<Field
							subtext="Pre-filled when the question first appears; never satisfies Required."
							label="Default value"
						>
							<DefaultValueControl question={q} onChange={(v) => patch("defaultValue", v)} />
						</Field>
					</AccordionContent>
				</AccordionItem>

				{/* ── Restricted options (multiple_choice only) ── */}
				{isChoice ? (
					<AccordionItem value="restricted">
						<AccordionTrigger>
							<GroupHeading label="Restricted options" active={restrictionsActive} broken={restrictionsBroken} />
						</AccordionTrigger>
						<AccordionContent className="wwc:flex wwc:flex-col wwc:gap-3">
							<p className="wwc:text-xs wwc:text-muted-foreground">
								Narrows which options may be answered. Several restrictions INTERSECT.
							</p>
							{restrictions.map((restriction, i) => {
								const restrictionBroken = isRuleBroken(builder.schema, q.id, restriction.rule);
								return (
									<div
										key={restriction.id}
										className="wwc:flex wwc:flex-col wwc:gap-2 wwc:rounded-md wwc:border wwc:border-border wwc:p-2"
									>
										<div className="wwc:flex wwc:items-center wwc:justify-between">
											<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
												<span className="wwc:truncate">Restriction {i + 1}</span>
												{restrictionBroken ? <BrokenBadge /> : null}
											</span>
											<Button
												icon
												size="sm"
												variant="ghost"
												tooltip="Remove restriction"
												aria-label="Remove restriction"
												onClick={() => setRestrictions(restrictions.filter((r) => r.id !== restriction.id))}
											>
												<Trash2 />
											</Button>
										</div>
										<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
											{(q.options ?? []).map((opt) => {
												const checked = restriction.allowedValues.includes(opt.value);
												return (
													<label
														key={opt.id}
														className="wwc:flex wwc:cursor-pointer wwc:items-center wwc:gap-2 wwc:text-sm"
													>
														<Checkbox checked={checked} onCheckedChange={() => toggleAllowed(restriction, opt.value)} />
														<span className="wwc:min-w-0 wwc:truncate">{opt.label}</span>
													</label>
												);
											})}
										</div>
										{restriction.rule ? (
											<div className="wwc:flex wwc:flex-col wwc:gap-2">
												<RuleGroupEditor
													rule={restriction.rule}
													earlier={earlier}
													onChange={(r) => updateRestriction(restriction.id, (rr) => ({...rr, rule: r}))}
												/>
												{restrictionBroken ? <BrokenNote /> : null}
												<Button
													variant="ghost"
													size="sm"
													className="wwc:h-7 wwc:self-start wwc:text-destructive"
													onClick={() => updateRestriction(restriction.id, (rr) => ({...rr, rule: undefined}))}
												>
													<X />
													Make always-on
												</Button>
											</div>
										) : (
											<Button
												variant="outline"
												size="sm"
												className="wwc:h-7 wwc:self-start"
												disabled={!firstEarlierId}
												onClick={() =>
													firstEarlierId &&
													updateRestriction(restriction.id, (rr) => ({
														...rr,
														rule: makeRuleGroup(firstEarlierId),
													}))
												}
											>
												<Plus />
												Only when…
											</Button>
										)}
									</div>
								);
							})}
							<Button
								variant="outline"
								size="sm"
								className="wwc:h-7 wwc:self-start"
								onClick={() => setRestrictions([...restrictions, {id: uid(), allowedValues: allOptionValues}])}
							>
								<Plus />
								Add restriction
							</Button>
						</AccordionContent>
					</AccordionItem>
				) : null}
			</Accordion>
		</div>
	);
}

/**
 * An accordion trigger label with an optional badge pushed to the right of the text.
 * A broken rule takes precedence (destructive); otherwise a set rule shows the "active" chip.
 */
function GroupHeading({
	label,
	active,
	broken = false,
}: {
	label: string;
	active: boolean;
	broken?: boolean;
}): JSX.Element {
	return (
		<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
			<span className="wwc:truncate">{label}</span>
			{broken ? <BrokenBadge /> : active ? <ActiveBadge /> : null}
		</span>
	);
}

/** A type-appropriate control for the question's default value. */
function DefaultValueControl({
	question: q,
	onChange,
}: {
	question: Question;
	onChange: (value: unknown) => void;
}): JSX.Element {
	const asString = q.defaultValue === undefined || q.defaultValue === null ? "" : String(q.defaultValue);

	if (q.type === "multiple_choice") {
		return (
			<div className="wwc:flex wwc:items-center wwc:gap-1.5">
				<Select value={asString === "" ? NONE : asString} onValueChange={(v) => onChange(v === NONE ? undefined : v)}>
					<SelectTrigger className="wwc:min-w-0 wwc:flex-1">
						<SelectValue placeholder="No default" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE}>No default</SelectItem>
						{(q.options ?? []).map((opt) => (
							<SelectItem key={opt.id} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{asString !== "" ? (
					<Button
						icon
						size="sm"
						variant="ghost"
						tooltip="Clear default"
						aria-label="Clear default"
						onClick={() => onChange(undefined)}
					>
						<X />
					</Button>
				) : null}
			</div>
		);
	}

	if (q.type === "rating") {
		return (
			<Input
				type="number"
				value={asString}
				placeholder="e.g. 3"
				onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
			/>
		);
	}

	if (q.type === "date") {
		return (
			<Input
				type="date"
				value={asString}
				onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
			/>
		);
	}

	// short_text / long_text / email
	return (
		<Input
			value={asString}
			placeholder="Pre-filled answer"
			onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
		/>
	);
}
