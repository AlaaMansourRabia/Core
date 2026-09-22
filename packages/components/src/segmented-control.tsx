import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const segmentedControlVariants = cva("wwc:inline-flex wwc:items-center wwc:rounded-lg wwc:bg-muted wwc:p-1", {
	variants: {
		size: {
			sm: "wwc:h-8 wwc:text-xs",
			md: "wwc:h-9 wwc:text-sm",
			lg: "wwc:h-10 wwc:text-base",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

const segmentVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:whitespace-nowrap wwc:rounded-md wwc:px-3 wwc:transition-all wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:pointer-events-none wwc:disabled:opacity-50",
	{
		variants: {
			size: {
				sm: "wwc:h-6 wwc:text-xs",
				md: "wwc:h-7 wwc:text-sm",
				lg: "wwc:h-8 wwc:text-base",
			},
			active: {
				true: "wwc:bg-background wwc:text-foreground wwc:shadow-sm",
				false: "wwc:text-muted-foreground wwc:hover:text-foreground",
			},
		},
		defaultVariants: {
			size: "md",
			active: false,
		},
	},
);

export interface SegmentedControlOption {
	value: string;
	label: React.ReactNode;
	disabled?: boolean;
}

export interface SegmentedControlProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">, VariantProps<typeof segmentedControlVariants> {
	/** Available options */
	options: SegmentedControlOption[];
	/** Currently selected value */
	value?: string;
	/** Callback when value changes */
	onChange?: (value: string) => void;
	/** Name for the radio group (for forms) */
	name?: string;
}

/** A segmented control for selecting between multiple options. */
const SegmentedControl = React.forwardRef<HTMLDivElement, SegmentedControlProps>(
	({className, size, options, value, onChange, name, ...props}, ref) => {
		return (
			<div ref={ref} role="radiogroup" className={cn(segmentedControlVariants({size, className}))} {...props}>
				{options.map((option) => {
					const isActive = value === option.value;
					return (
						<button
							key={option.value}
							type="button"
							role="radio"
							aria-checked={isActive}
							disabled={option.disabled}
							onClick={() => !option.disabled && onChange?.(option.value)}
							className={cn(segmentVariants({size, active: isActive}))}
						>
							{option.label}
							{name && (
								<input
									type="radio"
									name={name}
									value={option.value}
									checked={isActive}
									onChange={() => onChange?.(option.value)}
									className="wwc:sr-only"
									tabIndex={-1}
								/>
							)}
						</button>
					);
				})}
			</div>
		);
	},
);
SegmentedControl.displayName = "SegmentedControl";

export {SegmentedControl, segmentedControlVariants};
