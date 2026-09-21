import type {
	FieldProps,
	FieldTemplateProps,
	ObjectFieldTemplateProps,
	RegistryFieldsType,
	RegistryWidgetsType,
	RJSFSchema,
	SubmitButtonProps,
	TemplatesType,
	UiSchema,
	WidgetProps,
} from "@rjsf/utils";

import {getSubmitButtonOptions} from "@rjsf/utils";
// FillerRJSF — the react-jsonschema-form (RJSF v5) implementation of the shared preview filler. It
// renders the user-built FormSchema by first compiling it to JSON Schema + uiSchema (schemaToJsonSchema)
// and letting RJSF drive the form via the Core RJSF theme (CoreForm). It validates on submit and
// shows the shared result summary (FillerEnding). Its RHF sibling (FillerRHF) renders the SAME FormSchema
// via react-hook-form, so the two are swappable behind the identical FillerProps interface.
import validator from "@rjsf/validator-ajv8";
import {useMemo, useState} from "react";

import {Button} from "../../button";
import {Card, CardContent} from "../../card";
import {Checkbox} from "../../checkbox";
import {Label} from "../../label";
import {AttachmentInput} from "./AttachmentInput";
import {deriveAllValues} from "./dataSources";
import {DataSourceSelect} from "./DataSourceSelect";
import {DerivedCountDisplay} from "./DerivedCountDisplay";
import {FillerEnding, FillerShell} from "./fillerShared";
import {evaluateForm} from "./logic";
import type {QuestionState} from "./logic";
import type {CellType, FormSchema, TableColumn, TableRow} from "./model";
import {RatingInput} from "./RatingInput";
import {schemaToJsonSchema} from "./schemaToJsonSchema";
import {SignaturePad} from "./SignaturePad";
import {TableInput} from "./TableInput";
import {CoreForm} from "./coreRjsfTheme";

// ── Conditional logic → JSON Schema ───────────────────────────────────────────
// RJSF renders whatever JSON Schema it's given, so we make it logic-aware by rebuilding the schema on
// every change from the evaluated per-question state: hidden questions are OMITTED, required[] reflects
// the live requiredness, non-editable questions are ui:disabled, and restricted choice options are
// filtered out. Mirrors what FillerRHF does imperatively.
function isCustomFieldType(type: FormSchema["questions"][number]["type"]): boolean {
	return (
		type === "signature" ||
		type === "attachment" ||
		type === "data_source_select" ||
		type === "derived_count" ||
		type === "matrix" ||
		type === "gas_test_table"
	);
}

function applyLogic(
	baseSchema: RJSFSchema,
	baseUi: UiSchema,
	form: FormSchema,
	states: Record<string, QuestionState>,
): {schema: RJSFSchema; uiSchema: UiSchema} {
	const baseProps = (baseSchema.properties ?? {}) as Record<string, RJSFSchema>;
	const properties: Record<string, RJSFSchema> = {};
	const required: string[] = [];
	const uiSchema: UiSchema = {};
	const order: string[] = [];

	for (const q of form.questions) {
		const st = states[q.id];
		if (!st?.visible) continue; // hidden → omit entirely
		const base = baseProps[q.id];
		if (!base) continue;
		const prop: RJSFSchema = {...base};
		let ui = {...(baseUi[q.id] as Record<string, unknown> | undefined)};

		// Restrict a single/multi choice's options to the allowed set.
		if (st.allowedValues && q.type === "multiple_choice") {
			const allow = new Set(st.allowedValues);
			if (Array.isArray(prop.oneOf)) {
				prop.oneOf = (prop.oneOf as Array<{const?: unknown}>).filter((o) => allow.has(String(o.const)));
			}
			if (prop.items && typeof prop.items === "object" && !Array.isArray(prop.items)) {
				const items = {...(prop.items as RJSFSchema)};
				if (Array.isArray(items.oneOf)) {
					items.oneOf = (items.oneOf as Array<{const?: unknown}>).filter((o) => allow.has(String(o.const)));
				}
				prop.items = items;
			}
		}

		if (!st.editable) ui = {...ui, "ui:disabled": true};

		properties[q.id] = prop;
		if (Object.keys(ui).length > 0) uiSchema[q.id] = ui;
		order.push(q.id);
		if (st.required && !isCustomFieldType(q.type)) required.push(q.id);
	}

	const schema: RJSFSchema = {type: "object", properties};
	if (required.length > 0) schema.required = required;
	uiSchema["ui:order"] = order;
	return {schema, uiSchema};
}

export interface FillerProps {
	schema: FormSchema;
	onExit: () => void;
	onComplete?: (values: Record<string, unknown>) => void;
}

// ── CheckboxesWidget → Core Checkbox list (multi-choice) ───────────────────
// The base theme themes single Checkbox/Select/Text/Textarea but not the multi-select CheckboxesWidget
// that RJSF picks for `ui:widget: "checkboxes"` (multiple_choice + allowMultiple). Provide a Core
// one so multi-choice questions render as a styled list. Value is string[]; toggle add/remove.
function CoreCheckboxesWidget(props: WidgetProps) {
	const {id, value, disabled, readonly, onChange, options} = props;
	const enumOptions = options.enumOptions ?? [];
	const selected: unknown[] = Array.isArray(value) ? value : [];

	const toggle = (optionValue: unknown, checked: boolean) => {
		const next = checked ? [...selected, optionValue] : selected.filter((v) => v !== optionValue);
		onChange(next);
	};

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-2">
			{enumOptions.map((opt, index) => {
				const optionId = `${id}-${index}`;
				const checked = selected.includes(opt.value);
				return (
					<div key={optionId} className="wwc:flex wwc:items-center wwc:gap-2">
						<Checkbox
							id={optionId}
							checked={checked}
							disabled={disabled || readonly}
							onCheckedChange={(state) => toggle(opt.value, state === true)}
						/>
						<Label htmlFor={optionId} className="wwc:font-normal">
							{opt.label}
						</Label>
					</div>
				);
			})}
		</div>
	);
}

// ── rating → Core star RatingInput ────────────────────────────────────────
// The builder authors ratings as stars, so the preview should match. schemaToJsonSchema tags rating
// fields with `ui:widget: "rating"`; RJSF then renders them with this widget instead of a number input.
function CoreRatingWidget(props: WidgetProps) {
	const {id, value, disabled, readonly, onChange, schema, rawErrors} = props;
	const min = typeof schema.minimum === "number" ? schema.minimum : 1;
	const max = typeof schema.maximum === "number" ? schema.maximum : 5;
	return (
		<RatingInput
			id={id}
			value={typeof value === "number" ? value : undefined}
			min={min}
			max={max}
			disabled={disabled || readonly}
			aria-invalid={Array.isArray(rawErrors) && rawErrors.length > 0}
			onChange={(n) => onChange(n)}
		/>
	);
}

const extraWidgets: RegistryWidgetsType = {
	CheckboxesWidget: CoreCheckboxesWidget,
	rating: CoreRatingWidget,
};

// ── Rich question types → RJSF custom FIELDS ──────────────────────────────────
// Widgets only handle scalars; matrix/gas carry object values, so ALL six rich types are rendered
// as custom fields (ui:field) for uniformity. Each reads its config from the uiSchema's ui:options
// (populated by schemaToJsonSchema) and owns its whole value via props.formData / props.onChange.
function fieldOptions(props: FieldProps): Record<string, unknown> {
	return (props.uiSchema?.["ui:options"] ?? {}) as Record<string, unknown>;
}

function SignatureField(props: FieldProps) {
	return (
		<SignaturePad
			value={typeof props.formData === "string" ? props.formData : undefined}
			onChange={(v) => props.onChange(v)}
			disabled={props.disabled || props.readonly}
			id={props.idSchema?.$id}
		/>
	);
}

function AttachmentField(props: FieldProps) {
	return (
		<AttachmentInput
			value={typeof props.formData === "string" ? props.formData : undefined}
			onChange={(v) => props.onChange(v)}
			disabled={props.disabled || props.readonly}
			id={props.idSchema?.$id}
		/>
	);
}

function DataSourceSelectField(props: FieldProps) {
	const opts = fieldOptions(props);
	return (
		<DataSourceSelect
			source={opts.dataSource as string | undefined}
			value={typeof props.formData === "string" ? props.formData : undefined}
			onChange={(v) => props.onChange(v)}
			disabled={props.disabled || props.readonly}
			id={props.idSchema?.$id}
		/>
	);
}

function DerivedCountField(props: FieldProps) {
	const opts = fieldOptions(props);
	return (
		<DerivedCountDisplay
			value={typeof props.formData === "number" ? props.formData : undefined}
			source={opts.countSource as string | undefined}
		/>
	);
}

function MatrixField(props: FieldProps) {
	const opts = fieldOptions(props);
	return (
		<TableInput
			rows={(opts.rows ?? []) as TableRow[]}
			columns={(opts.columns ?? []) as TableColumn[]}
			cellType={opts.cellType as CellType | undefined}
			value={props.formData as Record<string, Record<string, unknown>> | undefined}
			onChange={(v) => props.onChange(v)}
			disabled={props.disabled || props.readonly}
		/>
	);
}

function GasTableField(props: FieldProps) {
	const opts = fieldOptions(props);
	return (
		<TableInput
			rows={(opts.rows ?? []) as TableRow[]}
			columns={(opts.columns ?? []) as TableColumn[]}
			value={props.formData as Record<string, Record<string, unknown>> | undefined}
			onChange={(v) => props.onChange(v)}
			disabled={props.disabled || props.readonly}
		/>
	);
}

const extraFields: RegistryFieldsType = {
	signature: SignatureField,
	attachment: AttachmentField,
	dataSourceSelect: DataSourceSelectField,
	derivedCount: DerivedCountField,
	matrix: MatrixField,
	gasTable: GasTableField,
};

// ── Per-question Card container ───────────────────────────────────────────────
// Match the template's full-form preview (FormListView), which wraps every question in a Card. Applied
// only in this filler via the Form's `templates` prop, so the shared Core RJSF theme (and the
// static FormWidgetRJSF) keep their plain layout. The root object renders its stacked cards as-is.
function CardFieldTemplate(props: FieldTemplateProps) {
	const {id, label, required, children, description, rawErrors, schema} = props;
	if (id === "root") return <>{children}</>;
	const isBoolean = schema.type === "boolean";
	return (
		<Card>
			<CardContent className="wwc:flex wwc:flex-col wwc:gap-3 wwc:p-6">
				{!isBoolean && label ? (
					<Label htmlFor={id} required={required}>
						{label}
					</Label>
				) : null}
				{children}
				{description}
				{rawErrors && rawErrors.length > 0 ? (
					<ul className="wwc:space-y-1">
						{rawErrors.map((error) => (
							<li key={error} className="wwc:text-sm wwc:text-destructive">
								{error}
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	);
}

// ── Section headers in the preview ────────────────────────────────────────────
// RJSF renders a flat property list; the builder groups questions into sections. This root
// ObjectFieldTemplate walks the (section-ordered) properties and drops a heading in above the first
// visible question of each section, so the preview mirrors the builder's section structure.
function makeSectionObjectTemplate(form: FormSchema) {
	const sections = form.sections ?? [];
	const byId = new Map(sections.map((s) => [s.id, s]));
	const firstId = sections[0]?.id;
	const sectionOf = (qid: string) => {
		const q = form.questions.find((x) => x.id === qid);
		if (!q) return undefined;
		const sid = q.sectionId && byId.has(q.sectionId) ? q.sectionId : firstId;
		return sid ? byId.get(sid) : undefined;
	};
	return function SectionObjectFieldTemplate(props: ObjectFieldTemplateProps) {
		// Only the root object carries sections; nested objects (tables) keep the plain stacked layout.
		if (props.idSchema?.$id !== "root" || sections.length === 0) {
			return <div className="wwc:flex wwc:flex-col wwc:gap-5">{props.properties.map((p) => p.content)}</div>;
		}
		let last: string | undefined;
		return (
			<div className="wwc:flex wwc:flex-col wwc:gap-4">
				{props.properties.map((p) => {
					const sec = sectionOf(p.name);
					const showHeader = sec && sec.id !== last;
					if (sec) last = sec.id;
					return (
						<div key={p.name} className="wwc:flex wwc:flex-col wwc:gap-4">
							{showHeader ? (
								<div className="wwc:flex wwc:flex-col wwc:gap-1 wwc:pt-2">
									<h2 className="wwc:text-lg wwc:font-semibold wwc:text-foreground">
										{sec.title || "Untitled section"}
									</h2>
									{sec.description ? <p className="wwc:text-sm wwc:text-muted-foreground">{sec.description}</p> : null}
								</div>
							) : null}
							{p.content}
						</div>
					);
				})}
			</div>
		);
	};
}

// Give the Submit button breathing room from the last question card.
function SpacedSubmitButton(props: SubmitButtonProps) {
	const options = getSubmitButtonOptions(props.uiSchema);
	if (options.norender) return null;
	return (
		<div className="wwc:pt-4">
			<Button type="submit" {...options.props}>
				{options.submitText || "Submit"}
			</Button>
		</div>
	);
}

export function FillerRJSF({schema, onExit, onComplete}: FillerProps): JSX.Element {
	const base = useMemo(() => schemaToJsonSchema(schema), [schema]);
	const templates = useMemo<Partial<TemplatesType>>(
		() => ({
			FieldTemplate: CardFieldTemplate,
			ObjectFieldTemplate: makeSectionObjectTemplate(schema),
			// Only these are overridden; RJSF merges the rest from the theme defaults.
			ButtonTemplates: {SubmitButton: SpacedSubmitButton} as TemplatesType["ButtonTemplates"],
		}),
		[schema],
	);
	const [formData, setFormData] = useState<Record<string, unknown>>({});
	const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

	// Rebuild the JSON Schema from the live logic state so visibility/requiredness/editable/options
	// track the current answers (RJSF only renders what the schema declares).
	const derived = deriveAllValues(schema, formData);
	const states = evaluateForm(schema, derived);
	const {schema: jsonSchema, uiSchema} = applyLogic(base.schema, base.uiSchema, schema, states);

	if (submitted) {
		return (
			<FillerEnding
				schema={schema}
				values={submitted}
				engine="RJSF"
				onExit={onExit}
				onRestart={() => {
					setSubmitted(null);
					setFormData({});
				}}
			/>
		);
	}

	return (
		<FillerShell engine="RJSF" onExit={onExit}>
			<div className="wwc:flex wwc:flex-col wwc:gap-8">
				<div className="wwc:flex wwc:flex-col wwc:gap-2">
					<h1 className="wwc:text-3xl wwc:font-semibold wwc:text-foreground">{schema.title}</h1>
					{schema.description && <p className="wwc:text-base wwc:text-muted-foreground">{schema.description}</p>}
				</div>

				<CoreForm
					schema={jsonSchema}
					uiSchema={uiSchema}
					validator={validator}
					widgets={extraWidgets}
					fields={extraFields}
					templates={templates}
					// Don't let RJSF auto-select a single-choice oneOf's first option; a conditional
					// trigger must start unanswered so dependent questions stay hidden until chosen.
					experimental_defaultFormStateBehavior={{constAsDefaults: "never"}}
					formData={formData}
					onChange={(e) => {
						// Recompute every derived_count so it tracks its data_source_select dependency live.
						const withDerived = deriveAllValues(schema, (e.formData ?? {}) as Record<string, unknown>);
						setFormData(withDerived);
					}}
					onSubmit={(e) => {
						const v = deriveAllValues(schema, (e.formData ?? {}) as Record<string, unknown>);
						setSubmitted(v);
						onComplete?.(v);
					}}
				/>
			</div>
		</FillerShell>
	);
}
