import {cn} from "@core/core-utils";
import {Check} from "lucide-react";
import * as React from "react";

export interface TypeaheadItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** Item value */
	value: string;
	/** Item label (display text) */
	label?: string;
	/** Item description */
	description?: string;
	/** Leading icon */
	icon?: React.ReactNode;
	/** Whether the item is selected */
	selected?: boolean;
	/** Whether the item is highlighted (keyboard navigation) */
	highlighted?: boolean;
	/** Whether the item is disabled */
	disabled?: boolean;
	/** Callback when item is selected */
	onSelect?: (value: string) => void;
}

/** Individual item for typeahead/autocomplete dropdowns. */
const TypeaheadItem = React.forwardRef<HTMLDivElement, TypeaheadItemProps>(
	(
		{
			className,
			value,
			label,
			description,
			icon,
			selected = false,
			highlighted = false,
			disabled = false,
			onSelect,
			children,
			...props
		},
		ref,
	) => {
		const handleClick = () => {
			if (!disabled) {
				onSelect?.(value);
			}
		};

		const handleKeyDown = (e: React.KeyboardEvent) => {
			if ((e.key === "Enter" || e.key === " ") && !disabled) {
				e.preventDefault();
				onSelect?.(value);
			}
		};

		return (
			<div
				ref={ref}
				role="option"
				aria-selected={selected}
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				data-value={value}
				data-highlighted={highlighted}
				data-selected={selected}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				className={cn(
					"wwc:relative wwc:flex wwc:cursor-pointer wwc:select-none wwc:items-center wwc:gap-2 wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-sm wwc:outline-none",
					"wwc:transition-colors wwc:duration-75",
					highlighted && "wwc:bg-accent wwc:text-accent-foreground",
					selected && !highlighted && "wwc:bg-accent/50",
					disabled && "wwc:pointer-events-none wwc:opacity-50",
					!highlighted && !disabled && "hover:wwc:bg-accent hover:wwc:text-accent-foreground",
					className,
				)}
				{...props}
			>
				{icon && <span className="wwc:flex-shrink-0 wwc:text-muted-foreground">{icon}</span>}
				<div className="wwc:flex-1 wwc:min-w-0">
					{children || (
						<>
							<div className="wwc:truncate">{label || value}</div>
							{description && <div className="wwc:text-xs wwc:text-muted-foreground wwc:truncate">{description}</div>}
						</>
					)}
				</div>
				{selected && <Check className="wwc:h-4 wwc:w-4 wwc:flex-shrink-0" />}
			</div>
		);
	},
);
TypeaheadItem.displayName = "TypeaheadItem";

export interface TypeaheadGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Group label */
	label: string;
}

/** Group header for categorizing typeahead items. */
const TypeaheadGroup = React.forwardRef<HTMLDivElement, TypeaheadGroupProps>(
	({className, label, children, ...props}, ref) => (
		<div ref={ref} role="group" aria-label={label} className={cn("wwc:py-1", className)} {...props}>
			<div className="wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:font-semibold wwc:text-muted-foreground">{label}</div>
			{children}
		</div>
	),
);
TypeaheadGroup.displayName = "TypeaheadGroup";

export interface TypeaheadEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

/** Empty state for typeahead when no results are found. */
const TypeaheadEmpty = React.forwardRef<HTMLDivElement, TypeaheadEmptyProps>(({className, children, ...props}, ref) => (
	<div ref={ref} className={cn("wwc:py-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground", className)} {...props}>
		{children || "No results found."}
	</div>
));
TypeaheadEmpty.displayName = "TypeaheadEmpty";

export {TypeaheadItem, TypeaheadGroup, TypeaheadEmpty};
