import type {KeyboardEvent as ReactKeyboardEvent, ReactElement} from "react";

import {cn} from "@wakecap/core-utils";

// Renders a single question's answer input from Wakecore primitives. Shared by BOTH the builder
// canvas preview and the Typeform filler, so what an author sees is exactly what a respondent gets.
// Each control's value-change wiring follows the Wakecore inventory (native onChange vs Radix
// onValueChange vs onCheckedChange vs onDateChange).
import {Checkbox} from "../../checkbox";
import {DatePicker} from "../../date-picker";
import {Input} from "../../input";
import {Label} from "../../label";
import {RadioGroup, RadioGroupItem} from "../../radio-group";
import {Textarea} from "../../textarea";
import {AttachmentInput} from "./AttachmentInput";
import {DataSourceSelect} from "./DataSourceSelect";
import {DerivedCountDisplay} from "./DerivedCountDisplay";
import type {Question} from "./model";
import {RatingInput} from "./RatingInput";
import {SignaturePad} from "./SignaturePad";
import {TableInput} from "./TableInput";

export interface QuestionRendererProps {
	question: Question;
	value: unknown;
	onChange: (value: unknown) => void;
	/** Filler advances when the respondent presses Enter (except inside long text). */
	onEnter?: () => void;
	autoFocus?: boolean;
	invalid?: boolean;
	/** Namespacing so builder-preview and filler can render the same question without id clashes. */
	idPrefix?: string;
	/** When true, the control shows its value but cannot be changed (non-editable per the logic engine). */
	disabled?: boolean;
	/**
	 * multiple_choice only: render ONLY the options whose `value` is in this list (from the logic
	 * engine's active option restrictions). undefined ⇒ all options are offered.
	 */
	allowedValues?: string[];
}

export function QuestionRenderer({
	question: q,
	value,
	onChange,
	onEnter,
	autoFocus,
	invalid,
	idPrefix = "q",
	disabled,
	allowedValues,
}: QuestionRendererProps) {
	const id = `${idPrefix}-${q.id}`;

	function handleEnterKey(e: ReactKeyboardEvent) {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onEnter?.();
		}
	}

	// Small muted helper text shown under the control (from the model's `helpText`).
	const help = q.helpText ? <p className="wwc:text-xs wwc:text-muted-foreground">{q.helpText}</p> : null;

	// Wrap a rendered control with its optional helpText so every branch gets it.
	const withHelp = (control: ReactElement) =>
		help ? (
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
				{control}
				{help}
			</div>
		) : (
			control
		);

	switch (q.type) {
		case "short_text":
		case "email":
			return withHelp(
				<Input
					id={id}
					type={q.type === "email" ? "email" : "text"}
					autoFocus={autoFocus}
					aria-invalid={invalid}
					disabled={disabled}
					value={(value as string) ?? ""}
					placeholder={q.placeholder}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={onEnter ? handleEnterKey : undefined}
				/>,
			);

		case "long_text":
			return withHelp(
				<Textarea
					id={id}
					autoFocus={autoFocus}
					aria-invalid={invalid}
					disabled={disabled}
					rows={4}
					value={(value as string) ?? ""}
					placeholder={q.placeholder}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={
						onEnter
							? (e) => {
									// Cmd/Ctrl+Enter advances; plain Enter inserts a newline.
									if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
										e.preventDefault();
										onEnter();
									}
								}
							: undefined
					}
				/>,
			);

		case "date":
			return withHelp(
				<DatePicker
					date={value instanceof Date ? value : undefined}
					onDateChange={(d) => onChange(d)}
					placeholder={q.placeholder ?? "Pick a date"}
					disabled={disabled}
					className="wwc:w-full"
				/>,
			);

		case "rating":
			return withHelp(
				<RatingInput
					id={id}
					autoFocus={autoFocus}
					aria-invalid={invalid}
					disabled={disabled}
					min={q.min ?? 1}
					max={q.max ?? 5}
					value={typeof value === "number" ? value : undefined}
					onChange={(n) => onChange(n)}
				/>,
			);

		case "multiple_choice": {
			// When the logic engine narrows the choices, render only the allowed options.
			const options = (q.options ?? []).filter(
				(opt) => allowedValues === undefined || allowedValues.includes(opt.value),
			);
			if (q.allowMultiple) {
				const selected = Array.isArray(value) ? (value as string[]) : [];
				return withHelp(
					<div role="group" aria-invalid={invalid} className="wwc:flex wwc:flex-col wwc:gap-2">
						{options.map((opt) => {
							const optId = `${id}-${opt.id}`;
							const checked = selected.includes(opt.value);
							return (
								<Label
									key={opt.id}
									htmlFor={optId}
									className={cn(
										"wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-md",
										"wwc:border wwc:border-border wwc:px-4 wwc:py-3 wwc:font-normal",
										disabled
											? "wwc:cursor-not-allowed wwc:opacity-60"
											: "wwc:cursor-pointer wwc:hover:bg-accent wwc:has-[:checked]:border-primary wwc:has-[:checked]:bg-accent",
									)}
								>
									<Checkbox
										id={optId}
										checked={checked}
										disabled={disabled}
										onCheckedChange={(c) => {
											const next = c === true ? [...selected, opt.value] : selected.filter((v) => v !== opt.value);
											onChange(next);
										}}
									/>
									<span className="wwc:text-sm wwc:text-foreground">{opt.label}</span>
								</Label>
							);
						})}
					</div>,
				);
			}
			return withHelp(
				<RadioGroup
					aria-invalid={invalid}
					value={(value as string) ?? ""}
					onValueChange={(v) => onChange(v)}
					disabled={disabled}
					className="wwc:gap-2"
				>
					{options.map((opt) => {
						const optId = `${id}-${opt.id}`;
						return (
							<Label
								key={opt.id}
								htmlFor={optId}
								className={cn(
									"wwc:flex wwc:items-center wwc:gap-3 wwc:rounded-md",
									"wwc:border wwc:border-border wwc:px-4 wwc:py-3 wwc:font-normal",
									disabled
										? "wwc:cursor-not-allowed wwc:opacity-60"
										: "wwc:cursor-pointer wwc:hover:bg-accent wwc:has-[:checked]:border-primary wwc:has-[:checked]:bg-accent",
								)}
							>
								<RadioGroupItem id={optId} value={opt.value} disabled={disabled} />
								<span className="wwc:text-sm wwc:text-foreground">{opt.label}</span>
							</Label>
						);
					})}
				</RadioGroup>,
			);
		}

		case "signature":
			return withHelp(<SignaturePad value={value as string} onChange={onChange} disabled={disabled} id={id} />);

		case "attachment":
			return withHelp(<AttachmentInput value={value as string} onChange={onChange} disabled={disabled} id={id} />);

		case "matrix":
			return withHelp(
				<TableInput
					rows={q.tableRows ?? []}
					columns={q.tableColumns ?? []}
					cellType={q.cellType}
					value={value as Record<string, Record<string, unknown>> | undefined}
					onChange={onChange}
					disabled={disabled}
				/>,
			);

		case "gas_test_table":
			return withHelp(
				<TableInput
					rows={q.tableRows ?? []}
					columns={q.tableColumns ?? []}
					value={value as Record<string, Record<string, unknown>> | undefined}
					onChange={onChange}
					disabled={disabled}
				/>,
			);

		case "data_source_select":
			return withHelp(
				<DataSourceSelect
					source={q.dataSource}
					value={value as string}
					onChange={onChange}
					disabled={disabled}
					id={id}
				/>,
			);

		case "derived_count":
			return withHelp(<DerivedCountDisplay value={typeof value === "number" ? value : undefined} />);
	}
}
