import {cn} from "@core/core-utils";
import * as React from "react";

export interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
	/** Callback when time value changes */
	onChange?: (value: string) => void;
	/** Current time value in HH:MM format */
	value?: string;
	/** Show seconds input */
	showSeconds?: boolean;
}

/** A time input component for selecting time values. */
const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
	({className, onChange, value, showSeconds = false, ...props}, ref) => {
		return (
			<input
				type="time"
				ref={ref}
				className={cn(
					"wwc:flex wwc:h-9 wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:py-1 wwc:text-sm wwc:shadow-sm wwc:transition-colors wwc:file:border-0 wwc:file:bg-transparent wwc:file:text-sm wwc:file:font-medium wwc:file:text-foreground wwc:placeholder:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
					className,
				)}
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				step={showSeconds ? 1 : undefined}
				{...props}
			/>
		);
	},
);
TimeInput.displayName = "TimeInput";

export {TimeInput};
