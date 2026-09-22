import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const tabListVariants = cva("wwc:inline-flex wwc:items-center wwc:gap-1", {
	variants: {
		variant: {
			default: "wwc:bg-muted wwc:p-1 wwc:rounded-lg",
			underline: "wwc:border-b wwc:border-border wwc:pb-px",
			pills: "wwc:gap-2",
		},
		size: {
			sm: "",
			md: "",
			lg: "",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "md",
	},
});

const tabItemVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:whitespace-nowrap wwc:font-medium wwc:transition-all wwc:cursor-pointer wwc:select-none",
	{
		variants: {
			variant: {
				default: "wwc:rounded-md data-[state=active]:wwc:bg-background data-[state=active]:wwc:shadow-sm",
				underline:
					"wwc:border-b-2 wwc:border-transparent wwc:pb-2 data-[state=active]:wwc:border-primary data-[state=active]:wwc:text-foreground",
				pills:
					"wwc:rounded-full wwc:border wwc:border-border data-[state=active]:wwc:border-primary data-[state=active]:wwc:bg-primary data-[state=active]:wwc:text-primary-foreground",
			},
			size: {
				sm: "wwc:text-xs wwc:px-2 wwc:py-1",
				md: "wwc:text-sm wwc:px-3 wwc:py-1.5",
				lg: "wwc:text-base wwc:px-4 wwc:py-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

export interface TabItem {
	value: string;
	label: React.ReactNode;
	icon?: React.ReactNode;
	disabled?: boolean;
	count?: number;
}

export interface TabListProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
		VariantProps<typeof tabListVariants> {
	/** Tab items */
	items: TabItem[];
	/** Currently active tab value */
	value?: string;
	/** Default active tab value */
	defaultValue?: string;
	/** Callback when tab changes */
	onChange?: (value: string) => void;
}

/** Standalone tab list component for simple tab navigation. */
const TabList = React.forwardRef<HTMLDivElement, TabListProps>(
	({className, variant, size, items, value: controlledValue, defaultValue, onChange, ...props}, ref) => {
		const [internalValue, setInternalValue] = React.useState(defaultValue || items[0]?.value);
		const value = controlledValue ?? internalValue;

		const handleSelect = (itemValue: string) => {
			if (controlledValue === undefined) {
				setInternalValue(itemValue);
			}
			onChange?.(itemValue);
		};

		return (
			<div
				ref={ref}
				role="tablist"
				className={cn(tabListVariants({variant, size}), className)}
				{...props}
			>
				{items.map((item) => (
					<button
						key={item.value}
						type="button"
						role="tab"
						aria-selected={value === item.value}
						aria-disabled={item.disabled}
						data-state={value === item.value ? "active" : "inactive"}
						disabled={item.disabled}
						onClick={() => {
							if (!item.disabled) {
								handleSelect(item.value);
							}
						}}
						className={cn(
							tabItemVariants({variant, size}),
							item.disabled && "wwc:opacity-50 wwc:cursor-not-allowed",
							value !== item.value && !item.disabled && "wwc:text-muted-foreground hover:wwc:text-foreground",
						)}
					>
						{item.icon && <span className="wwc:mr-2">{item.icon}</span>}
						{item.label}
						{typeof item.count === "number" && (
							<span className="wwc:ml-2 wwc:rounded-full wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:text-xs wwc:tabular-nums">
								{item.count}
							</span>
						)}
					</button>
				))}
			</div>
		);
	},
);
TabList.displayName = "TabList";

export {TabList, tabListVariants, tabItemVariants};
