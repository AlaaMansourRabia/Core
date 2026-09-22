import {cn} from "@core/core-utils";
import {ChevronDown, ChevronUp} from "lucide-react";
import * as React from "react";

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
	/** Minimum value */
	min?: number;
	/** Maximum value */
	max?: number;
	/** Step increment/decrement value */
	step?: number;
	/** Number of decimal places to show */
	precision?: number;
	/** Callback when value changes */
	onChange?: (value: number | undefined) => void;
	/** Current value */
	value?: number;
	/** Show increment/decrement buttons */
	showControls?: boolean;
}

/** A numeric input with optional stepper controls. */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
	({className, min, max, step = 1, precision, onChange, value, showControls = true, disabled, ...props}, ref) => {
		const [internalValue, setInternalValue] = React.useState<string>(value?.toString() || "");

		React.useEffect(() => {
			setInternalValue(value?.toString() || "");
		}, [value]);

		const formatValue = (val: number): number => {
			if (precision !== undefined) {
				return Number(val.toFixed(precision));
			}
			return val;
		};

		const clampValue = (val: number): number => {
			let clamped = val;
			if (min !== undefined && clamped < min) clamped = min;
			if (max !== undefined && clamped > max) clamped = max;
			return formatValue(clamped);
		};

		const handleChange = (newValue: string) => {
			setInternalValue(newValue);
			const num = parseFloat(newValue);
			if (!isNaN(num)) {
				const clamped = clampValue(num);
				onChange?.(clamped);
			} else if (newValue === "") {
				onChange?.(undefined);
			}
		};

		const increment = () => {
			const current = parseFloat(internalValue) || 0;
			const newValue = clampValue(current + step);
			setInternalValue(newValue.toString());
			onChange?.(newValue);
		};

		const decrement = () => {
			const current = parseFloat(internalValue) || 0;
			const newValue = clampValue(current - step);
			setInternalValue(newValue.toString());
			onChange?.(newValue);
		};

		const canIncrement = max === undefined || (parseFloat(internalValue) || 0) < max;
		const canDecrement = min === undefined || (parseFloat(internalValue) || 0) > min;

		return (
			<div className="wwc:relative wwc:inline-flex wwc:items-center">
				<input
					type="number"
					ref={ref}
					className={cn(
						"wwc:flex wwc:h-9 wwc:w-full wwc:rounded-md wwc:border wwc:border-input wwc:bg-transparent wwc:px-3 wwc:py-1 wwc:text-sm wwc:shadow-sm wwc:transition-colors wwc:file:border-0 wwc:file:bg-transparent wwc:file:text-sm wwc:file:font-medium wwc:file:text-foreground wwc:placeholder:text-muted-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50",
						showControls && "wwc:pr-8",
						className,
					)}
					value={internalValue}
					onChange={(e) => handleChange(e.target.value)}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					{...props}
				/>
				{showControls && (
					<div className="wwc:absolute wwc:right-0 wwc:flex wwc:h-full wwc:flex-col wwc:border-l wwc:border-input">
						<button
							type="button"
							onClick={increment}
							disabled={disabled || !canIncrement}
							className="wwc:flex wwc:h-1/2 wwc:w-6 wwc:items-center wwc:justify-center wwc:border-b wwc:border-input wwc:bg-background wwc:hover:bg-accent wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50"
							tabIndex={-1}
						>
							<ChevronUp className="wwc:h-3 wwc:w-3" />
						</button>
						<button
							type="button"
							onClick={decrement}
							disabled={disabled || !canDecrement}
							className="wwc:flex wwc:h-1/2 wwc:w-6 wwc:items-center wwc:justify-center wwc:bg-background wwc:hover:bg-accent wwc:disabled:cursor-not-allowed wwc:disabled:opacity-50"
							tabIndex={-1}
						>
							<ChevronDown className="wwc:h-3 wwc:w-3" />
						</button>
					</div>
				)}
			</div>
		);
	},
);
NumberInput.displayName = "NumberInput";

export {NumberInput};
