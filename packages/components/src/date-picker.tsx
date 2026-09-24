import {cn} from "@corensystem/coren-utils";
import {addDays, format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {Input} from "./input";
import {Label} from "./label";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {HoverTooltip} from "./tooltip";

/**
 * Shared by every picker here: where the calendar popover is portalled, and whether it is its own
 * modal layer. Both default to the right thing — the popover renders inside the enclosing
 * `DialogContent` when there is one, which is what keeps the calendar clickable inside a dialog
 * (issue #294) — so these exist for the host that needs to override it.
 */
export interface DatePickerPopoverProps {
	/** Portal target. Defaults to the enclosing `DialogContent`, else `document.body`. `null` forces `document.body`. */
	container?: HTMLElement | null;
	/** Makes the popover its own modal layer (takes pointer events from below and traps focus). */
	modal?: boolean;
}

export interface DatePickerProps extends DatePickerPopoverProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

/** Date picker with multiple variants including presets, date-time, and range selection. */
function DatePicker({
	date,
	onDateChange,
	placeholder = "Pick a date",
	className,
	disabled = false,
	container,
	modal,
}: DatePickerProps) {
	return (
		<Popover modal={modal}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"wwc:h-9 wwc:w-[280px] wwc:justify-start wwc:text-left wwc:font-normal",
						!date && "wwc:text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<CalendarIcon />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className="wwc:w-auto wwc:p-0">
				<Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
			</PopoverContent>
		</Popover>
	);
}

// Date Picker with Presets
export interface DatePickerWithPresetsProps extends DatePickerPopoverProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	className?: string;
}

function DatePickerWithPresets({date, onDateChange, className, container, modal}: DatePickerWithPresetsProps) {
	return (
		<Popover modal={modal}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"wwc:h-9 wwc:w-[280px] wwc:justify-start wwc:text-left wwc:font-normal",
						!date && "wwc:text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon />
					{date ? format(date, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className="wwc:flex wwc:w-auto wwc:flex-col wwc:space-y-2 wwc:p-2">
				<Select onValueChange={(value) => onDateChange?.(addDays(new Date(), Number.parseInt(value)))}>
					<SelectTrigger>
						<SelectValue placeholder="Select" />
					</SelectTrigger>
					<SelectContent position="popper">
						<SelectItem value="0">Today</SelectItem>
						<SelectItem value="1">Tomorrow</SelectItem>
						<SelectItem value="3">In 3 days</SelectItem>
						<SelectItem value="7">In a week</SelectItem>
					</SelectContent>
				</Select>
				<div className="wwc:rounded-md wwc:border">
					<Calendar mode="single" selected={date} onSelect={onDateChange} />
				</div>
			</PopoverContent>
		</Popover>
	);
}

// Date Picker for Form (Date of Birth style with dropdowns)
export interface DatePickerFormProps extends DatePickerPopoverProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	label?: string;
	description?: string;
	className?: string;
}

function DatePickerForm({
	date,
	onDateChange,
	label = "Date of birth",
	description,
	className,
	container,
	modal,
}: DatePickerFormProps) {
	return (
		<div className={cn("wwc:space-y-2", className)}>
			<Label>{label}</Label>
			<Popover modal={modal}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"wwc:h-9 wwc:w-[280px] wwc:justify-start wwc:text-left wwc:font-normal",
							!date && "wwc:text-muted-foreground",
						)}
					>
						<CalendarIcon />
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent container={container} className="wwc:w-auto wwc:p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={onDateChange}
						captionLayout="dropdown"
						startMonth={new Date(1900, 0)}
						endMonth={new Date()}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
			{description && <p className="wwc:text-sm wwc:text-muted-foreground">{description}</p>}
		</div>
	);
}

// Date Picker with Input
export interface DatePickerWithInputProps extends DatePickerPopoverProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	className?: string;
}

function DatePickerWithInput({date, onDateChange, className, container, modal}: DatePickerWithInputProps) {
	const [inputValue, setInputValue] = React.useState("");

	React.useEffect(() => {
		if (date) {
			setInputValue(format(date, "MM/dd/yyyy"));
		}
	}, [date]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		// Try to parse the date
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			onDateChange?.(parsed);
		}
	};

	return (
		<div className={cn("wwc:flex wwc:gap-2", className)}>
			<Input
				type="text"
				placeholder="MM/DD/YYYY"
				value={inputValue}
				onChange={handleInputChange}
				className="wwc:w-[150px]"
			/>
			<Popover modal={modal}>
				<PopoverTrigger asChild>
					{/* h-9/w-9 so the trigger squares up with the Input beside it. */}
					<Button variant="outline" icon className="wwc:h-9 wwc:w-9">
						<CalendarIcon className="wwc:h-4 wwc:w-4" />
					</Button>
				</PopoverTrigger>
				<PopoverContent container={container} className="wwc:w-auto wwc:p-0" align="start">
					<Calendar
						mode="single"
						selected={date}
						onSelect={(newDate) => {
							onDateChange?.(newDate);
							if (newDate) {
								setInputValue(format(newDate, "MM/dd/yyyy"));
							}
						}}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}

// Date and Time Picker
export interface DateTimePickerProps extends DatePickerPopoverProps {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	/**
	 * `"split"` (default) renders a date button beside a separate time select — two controls.
	 * `"unified"` renders a single trigger whose popover holds the calendar, the time row, and
	 * Cancel/Apply, mirroring `DateRangeTimePicker`. Prefer `"unified"` inside forms, where two
	 * side-by-side controls under one label read as two fields.
	 */
	variant?: "split" | "unified";
	/** Trigger text before a date is picked. Unified variant only. */
	placeholder?: string;
	className?: string;
}

function DateTimePicker({
	date,
	onDateChange,
	variant = "split",
	placeholder,
	className,
	container,
	modal,
}: DateTimePickerProps) {
	if (variant === "unified") {
		return (
			<UnifiedDateTimePicker
				date={date}
				onDateChange={onDateChange}
				placeholder={placeholder}
				className={className}
				container={container}
				modal={modal}
			/>
		);
	}
	return (
		<SplitDateTimePicker
			date={date}
			onDateChange={onDateChange}
			className={className}
			container={container}
			modal={modal}
		/>
	);
}

/**
 * Single trigger + popover (calendar, time row, Cancel/Apply). Edits are staged locally and only
 * committed on Apply, matching DateRangeTimePicker — so dismissing the popover discards.
 */
function UnifiedDateTimePicker({
	date,
	onDateChange,
	placeholder = "Pick date & time",
	className,
	container,
	modal,
}: DatePickerPopoverProps & {
	date?: Date;
	onDateChange?: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
}) {
	const [open, setOpen] = React.useState(false);
	const [localDate, setLocalDate] = React.useState<Date | undefined>(date);
	const [timeValue, setTimeValue] = React.useState(date ? format(date, "hh:mm a") : "12:00 AM");

	React.useEffect(() => {
		if (date) {
			setLocalDate(date);
			setTimeValue(format(date, "hh:mm a"));
		}
	}, [date]);

	const handleApply = () => {
		onDateChange?.(applyTimeToDate(localDate, timeValue));
		setOpen(false);
	};

	const handleCancel = () => {
		setLocalDate(date);
		setTimeValue(date ? format(date, "hh:mm a") : "12:00 AM");
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen} modal={modal}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"wwc:h-9 wwc:w-full wwc:justify-start wwc:text-left wwc:font-normal",
						!date && "wwc:text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon />
					<span className="wwc:truncate">{date ? format(date, "PPP p") : placeholder}</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className="wwc:w-auto wwc:p-0" align="start">
				<div className="wwc:px-3 wwc:pt-3 wwc:pb-1">
					<Calendar
						initialFocus
						mode="single"
						defaultMonth={localDate}
						selected={localDate}
						onSelect={setLocalDate}
						className="wwc:p-0"
					/>
				</div>
				<div className="wwc:border-t wwc:border-border wwc:px-3 wwc:py-3">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Label className="wwc:w-10 wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
							Time
						</Label>
						<TimeSelect value={timeValue} onChange={setTimeValue} />
					</div>
				</div>
				<div className="wwc:flex wwc:justify-end wwc:gap-2 wwc:border-t wwc:border-border wwc:px-3 wwc:py-3">
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleApply} disabled={!localDate}>
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function SplitDateTimePicker({date, onDateChange, className, container, modal}: DateTimePickerProps) {
	const [timeValue, setTimeValue] = React.useState("12:00 AM");

	const parseTime = (val: string) => {
		const [time, period] = val.split(" ");
		const [h, m] = time.split(":").map(Number);
		let hours = h;
		if (period === "PM" && hours !== 12) hours += 12;
		if (period === "AM" && hours === 12) hours = 0;
		return {hours, minutes: m};
	};

	const handleDateSelect = (newDate: Date | undefined) => {
		if (newDate) {
			const {hours, minutes} = parseTime(timeValue);
			newDate.setHours(hours, minutes);
			onDateChange?.(newDate);
		} else {
			onDateChange?.(undefined);
		}
	};

	const handleTimeSelect = (value: string) => {
		setTimeValue(value);
		if (date) {
			const {hours, minutes} = parseTime(value);
			const newDate = new Date(date);
			newDate.setHours(hours, minutes);
			onDateChange?.(newDate);
		}
	};

	// Generate time options in 15-min intervals
	const timeOptions: string[] = [];
	for (const period of ["AM", "PM"]) {
		for (let h = 12; h < 24; h++) {
			const displayH = h === 12 ? 12 : h - 12;
			for (let m = 0; m < 60; m += 15) {
				timeOptions.push(`${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`);
			}
		}
	}

	return (
		<div className={cn("wwc:flex wwc:gap-2", className)}>
			<Popover modal={modal}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"wwc:h-9 wwc:w-[200px] wwc:justify-start wwc:text-left wwc:font-normal",
							!date && "wwc:text-muted-foreground",
						)}
					>
						<CalendarIcon />
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent container={container} className="wwc:w-auto wwc:p-0">
					<Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
				</PopoverContent>
			</Popover>
			<Select value={timeValue} onValueChange={handleTimeSelect}>
				<SelectTrigger className="wwc:w-[130px]">
					<SelectValue placeholder="Select time" />
				</SelectTrigger>
				<SelectContent>
					{timeOptions.map((t) => (
						<SelectItem key={t} value={t}>
							{t}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export interface DateRangePickerProps extends DatePickerPopoverProps {
	dateRange?: {from: Date | undefined; to: Date | undefined};
	onDateRangeChange?: (range: {from: Date | undefined; to: Date | undefined}) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

function DateRangePicker({
	dateRange,
	onDateRangeChange,
	placeholder = "Pick a date range",
	className,
	disabled = false,
	container,
	modal,
}: DateRangePickerProps) {
	return (
		<Popover modal={modal}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn(
						"wwc:w-[300px] wwc:justify-start wwc:text-left wwc:font-normal",
						!dateRange?.from && "wwc:text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<CalendarIcon />
					{dateRange?.from ? (
						dateRange.to ? (
							<>
								{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
							</>
						) : (
							format(dateRange.from, "LLL dd, y")
						)
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent container={container} className="wwc:w-auto wwc:p-0" align="start">
				<Calendar
					initialFocus
					mode="range"
					defaultMonth={dateRange?.from}
					selected={dateRange}
					onSelect={(range) => onDateRangeChange?.({from: range?.from, to: range?.to})}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}

// Date Range with Time Picker
export interface DateRangeTimePickerProps extends DatePickerPopoverProps {
	dateRange?: {from: Date | undefined; to: Date | undefined};
	onDateRangeChange?: (range: {from: Date | undefined; to: Date | undefined}) => void;
	placeholder?: string;
	className?: string;
	/** Render as a square icon-only trigger (for toolbars sitting next to other icon buttons). */
	iconOnly?: boolean;
	/** Accessible name for the icon-only trigger. Defaults to the placeholder. */
	"aria-label"?: string;
	/** Hover/focus hint on the icon-only trigger. Defaults to the aria-label; pass `null` to suppress. */
	tooltip?: React.ReactNode;
}

export interface TimePickerProps {
	/** 12-hour time string, e.g. `"06:30 PM"`. Empty string means nothing picked yet. */
	value?: string;
	onValueChange?: (value: string) => void;
	/** Minutes between options. 15 by default; use 5 or 1 for finer control. */
	step?: number;
	placeholder?: string;
	disabled?: boolean;
	id?: string;
	"aria-label"?: string;
	className?: string;
}

/** Builds `hh:mm AM/PM` options across the full day at `step`-minute intervals. */
function buildTimeOptions(step: number) {
	const options: string[] = [];
	for (const period of ["AM", "PM"]) {
		for (let h = 12; h < 24; h++) {
			const displayH = h === 12 ? 12 : h - 12;
			for (let m = 0; m < 60; m += step) {
				options.push(`${String(displayH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`);
			}
		}
	}
	return options;
}

/**
 * Time-of-day dropdown. Use this instead of `<input type="time">`, whose picker is rendered by the
 * OS and so ignores the design system entirely.
 */
function TimePicker({
	value,
	onValueChange,
	step = 15,
	placeholder = "Select time",
	disabled,
	id,
	"aria-label": ariaLabel,
	className,
}: TimePickerProps) {
	const timeOptions = React.useMemo(() => buildTimeOptions(step), [step]);
	return (
		<Select value={value} onValueChange={onValueChange} disabled={disabled}>
			<SelectTrigger id={id} aria-label={ariaLabel} className={cn("wwc:h-9 wwc:w-[130px]", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{timeOptions.map((t) => (
					<SelectItem key={t} value={t}>
						{t}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function TimeSelect({value, onChange}: {value: string; onChange: (v: string) => void}) {
	return <TimePicker value={value} onValueChange={onChange} />;
}

function applyTimeToDate(d: Date | undefined, timeStr: string): Date | undefined {
	if (!d) return undefined;
	const [time, period] = timeStr.split(" ");
	const [h, m] = time.split(":").map(Number);
	let hours = h;
	if (period === "PM" && hours !== 12) hours += 12;
	if (period === "AM" && hours === 12) hours = 0;
	const newDate = new Date(d);
	newDate.setHours(hours, m, 0, 0);
	return newDate;
}

function DateRangeTimePicker({
	dateRange,
	onDateRangeChange,
	placeholder = "Pick date & time range",
	className,
	iconOnly = false,
	"aria-label": ariaLabel,
	tooltip,
	container,
	modal,
}: DateRangeTimePickerProps) {
	const [fromTime, setFromTime] = React.useState("12:00 AM");
	const [toTime, setToTime] = React.useState("12:00 AM");
	const [open, setOpen] = React.useState(false);
	const [localRange, setLocalRange] = React.useState<{from: Date | undefined; to: Date | undefined}>(
		dateRange ?? {from: undefined, to: undefined},
	);

	React.useEffect(() => {
		if (dateRange) setLocalRange(dateRange);
	}, [dateRange]);

	const handleApply = () => {
		const from = applyTimeToDate(localRange.from, fromTime);
		const to = applyTimeToDate(localRange.to, toTime);
		onDateRangeChange?.({from, to});
		setOpen(false);
	};

	const handleCancel = () => {
		setLocalRange(dateRange ?? {from: undefined, to: undefined});
		setOpen(false);
	};

	const formatDisplay = () => {
		if (!dateRange?.from) return placeholder;
		const fromStr = `${format(dateRange.from, "MMM dd")} ${fromTime}`;
		if (!dateRange.to) return fromStr;
		return `${fromStr} — ${format(dateRange.to, "MMM dd")} ${toTime}`;
	};

	const hint = tooltip === undefined ? (ariaLabel ?? placeholder) : tooltip;
	const trigger = (
		<PopoverTrigger asChild>
			<Button
				variant="outline"
				icon={iconOnly}
				aria-label={iconOnly ? (ariaLabel ?? placeholder) : ariaLabel}
				className={cn(
					!iconOnly && "wwc:h-9 wwc:w-[380px] wwc:justify-start wwc:text-left wwc:font-normal",
					!dateRange?.from && "wwc:text-muted-foreground",
					className,
				)}
			>
				<CalendarIcon />
				{!iconOnly && <span className="wwc:truncate">{formatDisplay()}</span>}
			</Button>
		</PopoverTrigger>
	);

	return (
		<Popover open={open} onOpenChange={setOpen} modal={modal}>
			{/* Icon-only has no visible label, so it carries the tooltip; the wide form already reads its range. */}
			{iconOnly && hint !== null ? <HoverTooltip content={hint}>{trigger}</HoverTooltip> : trigger}
			<PopoverContent container={container} className="wwc:w-auto wwc:p-0" align="start">
				<div className="wwc:px-3 wwc:pt-3 wwc:pb-1">
					<Calendar
						initialFocus
						mode="range"
						defaultMonth={localRange?.from}
						selected={localRange}
						onSelect={(range) => setLocalRange({from: range?.from, to: range?.to})}
						numberOfMonths={1}
						className="wwc:p-0"
					/>
				</div>
				<div className="wwc:border-t wwc:border-border wwc:px-3 wwc:py-3 wwc:space-y-3">
					{/* From */}
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Label className="wwc:text-[11px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:font-semibold wwc:w-10">
							From
						</Label>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:flex-1">
							<Input
								readOnly
								value={localRange.from ? format(localRange.from, "MM/dd") : "— —"}
								className="wwc:w-[70px] wwc:h-9 wwc:text-center wwc:text-[13px]"
							/>
							<TimeSelect value={fromTime} onChange={setFromTime} />
						</div>
					</div>
					{/* To */}
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<Label className="wwc:text-[11px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground wwc:font-semibold wwc:w-10">
							To
						</Label>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:flex-1">
							<Input
								readOnly
								value={localRange.to ? format(localRange.to, "MM/dd") : "— —"}
								className="wwc:w-[70px] wwc:h-9 wwc:text-center wwc:text-[13px]"
							/>
							<TimeSelect value={toTime} onChange={setToTime} />
						</div>
					</div>
				</div>
				{/* Actions */}
				<div className="wwc:border-t wwc:border-border wwc:px-3 wwc:py-3 wwc:flex wwc:justify-end wwc:gap-2">
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						Cancel
					</Button>
					<Button size="sm" onClick={handleApply}>
						Apply
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export {
	TimePicker,
	DatePicker,
	DatePickerWithPresets,
	DatePickerForm,
	DatePickerWithInput,
	DateTimePicker,
	DateRangePicker,
	DateRangeTimePicker,
};
