import {cn} from "@core/core-utils";
import {format, parse, setHours, setMinutes} from "date-fns";
import {CalendarIcon, Clock} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Calendar} from "./calendar";
import {Input} from "./input";
import {Popover, PopoverContent, PopoverTrigger} from "./popover";

export interface DateTimeInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Current datetime value */
	value?: Date;
	/** Callback when datetime changes */
	onChange?: (date: Date | undefined) => void;
	/** Placeholder text */
	placeholder?: string;
	/** Date format string */
	dateFormat?: string;
	/** Time format (12h or 24h) */
	timeFormat?: "12h" | "24h";
	/** Disable the input */
	disabled?: boolean;
	/** Minimum selectable date */
	minDate?: Date;
	/** Maximum selectable date */
	maxDate?: Date;
	/** Step for minutes (e.g., 15 for 15-minute intervals) */
	minuteStep?: number;
}

/** Combined date and time picker input. */
const DateTimeInput = React.forwardRef<HTMLDivElement, DateTimeInputProps>(
	(
		{
			className,
			value,
			onChange,
			placeholder = "Select date and time",
			dateFormat = "PPP",
			timeFormat = "24h",
			disabled = false,
			minDate,
			maxDate,
			minuteStep = 1,
			...props
		},
		ref,
	) => {
		const [open, setOpen] = React.useState(false);
		const [timeValue, setTimeValue] = React.useState(() => {
			if (!value) return "";
			const hours = value.getHours();
			const minutes = value.getMinutes();
			if (timeFormat === "12h") {
				const period = hours >= 12 ? "PM" : "AM";
				const h12 = hours % 12 || 12;
				return `${h12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
			}
			return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
		});

		const handleDateSelect = (date: Date | undefined) => {
			if (!date) {
				onChange?.(undefined);
				return;
			}

			// Preserve existing time if we have a value
			if (value) {
				const newDate = new Date(date);
				newDate.setHours(value.getHours());
				newDate.setMinutes(value.getMinutes());
				onChange?.(newDate);
			} else {
				onChange?.(date);
			}
		};

		const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newTimeValue = e.target.value;
			setTimeValue(newTimeValue);

			if (!value) return;

			// Parse time value
			let hours = 0;
			let minutes = 0;

			if (timeFormat === "24h") {
				const match = newTimeValue.match(/^(\d{1,2}):(\d{2})$/);
				if (match) {
					hours = parseInt(match[1], 10);
					minutes = parseInt(match[2], 10);
				}
			} else {
				const match = newTimeValue.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
				if (match) {
					hours = parseInt(match[1], 10);
					minutes = parseInt(match[2], 10);
					const period = match[3].toUpperCase();
					if (period === "PM" && hours !== 12) hours += 12;
					if (period === "AM" && hours === 12) hours = 0;
				}
			}

			const newDate = setMinutes(setHours(value, hours), minutes);
			onChange?.(newDate);
		};

		const displayValue = value ? format(value, `${dateFormat} ${timeFormat === "12h" ? "h:mm a" : "HH:mm"}`) : placeholder;

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
							mode="single"
							selected={value}
							onSelect={handleDateSelect}
							disabled={(date) => {
								if (minDate && date < minDate) return true;
								if (maxDate && date > maxDate) return true;
								return false;
							}}
						/>
						<div className="wwc:border-t wwc:border-border wwc:p-3">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Clock className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<Input
									type="time"
									value={timeValue}
									onChange={handleTimeChange}
									step={minuteStep * 60}
									className="wwc:w-auto"
								/>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		);
	},
);
DateTimeInput.displayName = "DateTimeInput";

export {DateTimeInput};
