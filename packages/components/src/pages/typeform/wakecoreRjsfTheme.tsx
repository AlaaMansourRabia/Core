import type {ThemeProps} from "@rjsf/core";
import type {
	BaseInputTemplateProps,
	FieldTemplateProps,
	ObjectFieldTemplateProps,
	RegistryWidgetsType,
	SubmitButtonProps,
	WidgetProps,
} from "@rjsf/utils";

// A custom RJSF (react-jsonschema-form v5) theme that renders Wakecore design-system components.
// It maps RJSF's widget/template slots onto Wakecore Input/Select/Textarea/Checkbox/Label/Button so a
// JSON-Schema-driven form looks and behaves like a hand-built Wakecore form. Consumed by FormWidgetRJSF.
import {withTheme} from "@rjsf/core";
import {getSubmitButtonOptions} from "@rjsf/utils";

import {Button} from "../../button";
import {Checkbox} from "../../checkbox";
import {Input} from "../../input";
import {Label} from "../../label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../select";
import {Textarea} from "../../textarea";

// ── BaseInputTemplate / TextWidget → Wakecore Input ───────────────────────────
// RJSF routes plain string/number widgets through BaseInputTemplate. We honour the `type`/`inputmode`
// RJSF supplies (e.g. type="number" for integer fields) and parse numeric inputs back to numbers.
function WakecoreBaseInput(props: BaseInputTemplateProps) {
	const {
		id,
		value,
		type,
		placeholder,
		disabled,
		readonly,
		autofocus,
		onChange,
		onBlur,
		onFocus,
		options,
		schema,
		rawErrors,
	} = props;

	const isNumeric = schema.type === "number" || schema.type === "integer";

	return (
		<Input
			id={id}
			type={type}
			value={value ?? ""}
			placeholder={placeholder}
			disabled={disabled || readonly}
			autoFocus={autofocus}
			aria-invalid={rawErrors && rawErrors.length > 0 ? true : undefined}
			onChange={(e) => {
				const raw = e.target.value;
				if (raw === "") {
					onChange(options.emptyValue);
					return;
				}
				onChange(isNumeric ? Number(raw) : raw);
			}}
			onBlur={(e) => onBlur(id, e.target.value)}
			onFocus={(e) => onFocus(id, e.target.value)}
		/>
	);
}

// ── SelectWidget → Wakecore Select ────────────────────────────────────────────
function WakecoreSelectWidget(props: WidgetProps) {
	const {id, value, disabled, readonly, onChange, onBlur, onFocus, options, placeholder, rawErrors} = props;
	const enumOptions = options.enumOptions ?? [];

	return (
		<Select
			value={value ?? ""}
			disabled={disabled || readonly}
			onValueChange={(v) => onChange(v === "" ? options.emptyValue : v)}
		>
			<SelectTrigger
				id={id}
				aria-invalid={rawErrors && rawErrors.length > 0 ? true : undefined}
				onBlur={() => onBlur(id, value)}
				onFocus={() => onFocus(id, value)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{enumOptions.map((opt) => (
					<SelectItem key={String(opt.value)} value={String(opt.value)}>
						{opt.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

// ── TextareaWidget → Wakecore Textarea ────────────────────────────────────────
function WakecoreTextareaWidget(props: WidgetProps) {
	const {id, value, placeholder, disabled, readonly, autofocus, onChange, onBlur, onFocus, options, rawErrors} = props;

	return (
		<Textarea
			id={id}
			value={value ?? ""}
			placeholder={placeholder}
			disabled={disabled || readonly}
			autoFocus={autofocus}
			rows={typeof options.rows === "number" ? options.rows : undefined}
			aria-invalid={rawErrors && rawErrors.length > 0 ? true : undefined}
			onChange={(e) => onChange(e.target.value === "" ? options.emptyValue : e.target.value)}
			onBlur={(e) => onBlur(id, e.target.value)}
			onFocus={(e) => onFocus(id, e.target.value)}
		/>
	);
}

// ── CheckboxWidget → Wakecore Checkbox (renders its own inline label) ──────────
function WakecoreCheckboxWidget(props: WidgetProps) {
	const {id, value, disabled, readonly, onChange, onBlur, onFocus, label} = props;

	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Checkbox
				id={id}
				checked={value ?? false}
				disabled={disabled || readonly}
				onCheckedChange={(checked) => onChange(checked === true)}
				onBlur={() => onBlur(id, value)}
				onFocus={() => onFocus(id, value)}
			/>
			{label ? (
				<Label htmlFor={id} className="wwc:font-normal">
					{label}
				</Label>
			) : null}
		</div>
	);
}

const widgets: RegistryWidgetsType = {
	TextWidget: WakecoreBaseInput,
	SelectWidget: WakecoreSelectWidget,
	TextareaWidget: WakecoreTextareaWidget,
	CheckboxWidget: WakecoreCheckboxWidget,
};

// ── FieldTemplate → Label + widget + description + destructive errors ──────────
function WakecoreFieldTemplate(props: FieldTemplateProps) {
	const {id, label, required, children, description, rawErrors, schema} = props;
	// The checkbox widget renders its own inline label, so skip the top Label for booleans.
	const isBoolean = schema.type === "boolean";

	return (
		<div className="wwc:space-y-2">
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
		</div>
	);
}

// ── ObjectFieldTemplate → stack the fields ────────────────────────────────────
// The widget file owns the title/heading, so we only render the field rows here.
function WakecoreObjectFieldTemplate(props: ObjectFieldTemplateProps) {
	return <div className="wwc:flex wwc:flex-col wwc:gap-5">{props.properties.map((prop) => prop.content)}</div>;
}

// ── SubmitButton → Wakecore Button ────────────────────────────────────────────
function WakecoreSubmitButton(props: SubmitButtonProps) {
	const options = getSubmitButtonOptions(props.uiSchema);
	if (options.norender) return null;

	return (
		<Button type="submit" {...options.props}>
			{options.submitText || "Submit"}
		</Button>
	);
}

const wakecoreTheme: ThemeProps = {
	widgets,
	templates: {
		FieldTemplate: WakecoreFieldTemplate,
		ObjectFieldTemplate: WakecoreObjectFieldTemplate,
		ButtonTemplates: {SubmitButton: WakecoreSubmitButton},
		// Route the base text/number input path through our Wakecore Input.
		BaseInputTemplate: WakecoreBaseInput,
	},
};

export const WakecoreForm = withTheme(wakecoreTheme);
