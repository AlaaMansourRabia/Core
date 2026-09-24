import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {Check} from "lucide-react";
import * as React from "react";

const selectableCardVariants = cva(
	"wwc:relative wwc:rounded-lg wwc:border wwc:p-4 wwc:transition-all wwc:cursor-pointer wwc:select-none",
	{
		variants: {
			variant: {
				default: "wwc:border-border wwc:bg-card hover:wwc:border-primary/50",
				outline: "wwc:border-border wwc:bg-transparent hover:wwc:border-primary/50",
			},
			selected: {
				true: "wwc:border-primary wwc:ring-2 wwc:ring-primary/20",
				false: "",
			},
			disabled: {
				true: "wwc:opacity-50 wwc:cursor-not-allowed wwc:pointer-events-none",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			selected: false,
			disabled: false,
		},
	},
);

export interface SelectableCardProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">, VariantProps<typeof selectableCardVariants> {
	/** Whether the card is selected */
	selected?: boolean;
	/** Callback when selection changes */
	onSelect?: (selected: boolean) => void;
	/** Show checkmark indicator when selected */
	showCheckmark?: boolean;
	/** Position of the checkmark */
	checkmarkPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
	/** Value associated with this card (for form usage) */
	value?: string;
	/** Disable the card */
	disabled?: boolean;
}

/** A card that can be selected/deselected, useful for multi-select UIs. */
const SelectableCard = React.forwardRef<HTMLDivElement, SelectableCardProps>(
	(
		{
			className,
			variant,
			selected = false,
			disabled = false,
			onSelect,
			showCheckmark = true,
			checkmarkPosition = "top-right",
			value,
			children,
			onClick,
			...props
		},
		ref,
	) => {
		const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
			if (disabled) return;
			onSelect?.(!selected);
			onClick?.(e);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (disabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onSelect?.(!selected);
			}
		};

		const checkmarkPositionClasses = {
			"top-left": "wwc:top-2 wwc:left-2",
			"top-right": "wwc:top-2 wwc:right-2",
			"bottom-left": "wwc:bottom-2 wwc:left-2",
			"bottom-right": "wwc:bottom-2 wwc:right-2",
		};

		return (
			<div
				ref={ref}
				role="checkbox"
				aria-checked={selected}
				aria-disabled={disabled}
				tabIndex={disabled ? -1 : 0}
				data-value={value}
				data-selected={selected}
				className={cn(selectableCardVariants({variant, selected, disabled}), className)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				{...props}
			>
				{showCheckmark && selected && (
					<div
						className={cn(
							"wwc:absolute wwc:flex wwc:h-5 wwc:w-5 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-primary wwc:text-primary-foreground",
							checkmarkPositionClasses[checkmarkPosition],
						)}
					>
						<Check className="wwc:h-3 wwc:w-3" />
					</div>
				)}
				{children}
			</div>
		);
	},
);
SelectableCard.displayName = "SelectableCard";

export interface SelectableCardGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Allow multiple selections */
	multiple?: boolean;
	/** Currently selected values */
	value?: string[];
	/** Callback when selection changes */
	onValueChange?: (value: string[]) => void;
	/** Disable all cards in the group */
	disabled?: boolean;
}

/** Container for multiple SelectableCards with managed selection state. */
const SelectableCardGroup = React.forwardRef<HTMLDivElement, SelectableCardGroupProps>(
	({className, multiple = false, value = [], onValueChange, disabled = false, children, ...props}, ref) => {
		const handleSelect = (cardValue: string, selected: boolean) => {
			if (disabled) return;

			let newValue: string[];
			if (multiple) {
				newValue = selected ? [...value, cardValue] : value.filter((v) => v !== cardValue);
			} else {
				newValue = selected ? [cardValue] : [];
			}
			onValueChange?.(newValue);
		};

		return (
			<div ref={ref} role="group" className={cn("wwc:grid wwc:gap-4", className)} {...props}>
				{React.Children.map(children, (child) => {
					if (React.isValidElement<SelectableCardProps>(child) && child.type === SelectableCard) {
						const cardValue = child.props.value;
						return React.cloneElement(child, {
							selected: cardValue ? value.includes(cardValue) : child.props.selected,
							onSelect: cardValue ? (sel: boolean) => handleSelect(cardValue, sel) : child.props.onSelect,
							disabled: disabled || child.props.disabled,
						});
					}
					return child;
				})}
			</div>
		);
	},
);
SelectableCardGroup.displayName = "SelectableCardGroup";

export {SelectableCard, SelectableCardGroup, selectableCardVariants};
