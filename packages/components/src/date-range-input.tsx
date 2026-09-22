import type {DateRange} from "react-day-picker";

import {cn} from "@corensystem/core-utils";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

export interface DateRangeInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Current date range value */
	value?: DateRange;
	/** Callback when date range changes */
	onChange?: (range: DateRange | undefined) => void;
	/** Placeholder text */
	placeholder?: string;
	/** Date format string */
	dateFormat?: string;
	/** Disable the input */
	disabled?: boolean;
	/** Minimum selectable date */
	minDate?: Date;
	/** Maximum selectable date */
	maxDate?: Date;
	/** Number of months to show */
	numberOfMonths?: number;
}

/** Date range picker input for selecting start and end dates. */
const DateRangeInput = React.forwardRef<HTMLDivElement, DateRangeInputProps>(
	(
		{
			className,
			value,
			onChange,
			placeholder = "Select date range",
			dateFormat = "LLL dd, y",
			disabled = false,
			minDate,
			maxDate,
			numberOfMonths = 2,
			...props
		},
		ref,
	) => {
		const [open, setOpen] = React.useState(false);

		const displayValue = React.useMemo(() => {
			if (!value?.from) return placeholder;
			if (!value.to) return format(value.from, dateFormat);
			return `${format(value.from, dateFormat)} - ${format(value.to, dateFormat)}`;
		}, [value, dateFormat, placeholder]);

		return (
			<div ref={ref} className={cn("wwc:grid wwc:gap-2", className)} {...props}>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							disabled={disabled}
							className={cn(
								"wwc:w-full wwc:justify-start wwc:text-left wwc:font-normal",
								!value && "wwc:text-muted-foreground",
							)}
						>
							<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
							{displayValue}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="wwc:w-auto wwc:p-0" align="start">
						<Calendar
							mode="range"
							defaultMonth={value?.from}
							selected={value}
							onSelect={onChange}
							numberOfMonths={numberOfMonths}
							disabled={(date) => {
								if (minDate && date < minDate) return true;
								if (maxDate && date > maxDate) return true;
								return false;
							}}
						/>
					</PopoverContent>
				</Popover>
			</div>
		);
	},
);
DateRangeInput.displayName = "DateRangeInput";

export {DateRangeInput};
export type {DateRange} from "react-day-picker";
