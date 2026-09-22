import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {ChevronRight} from "lucide-react";
import * as React from "react";

const clickableCardVariants = cva(
	"wwc:relative wwc:flex wwc:items-center wwc:rounded-lg wwc:border wwc:p-4 wwc:transition-all wwc:cursor-pointer wwc:select-none",
	{
		variants: {
			variant: {
				default:
					"wwc:border-border wwc:bg-card hover:wwc:bg-accent hover:wwc:border-accent-foreground/20 active:wwc:scale-[0.99]",
				ghost: "wwc:border-transparent wwc:bg-transparent hover:wwc:bg-accent",
				outline: "wwc:border-border wwc:bg-transparent hover:wwc:border-primary/50 hover:wwc:bg-accent/50",
			},
			disabled: {
				true: "wwc:opacity-50 wwc:cursor-not-allowed wwc:pointer-events-none",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			disabled: false,
		},
	},
);

export interface ClickableCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof clickableCardVariants> {
	/** Disable the card */
	disabled?: boolean;
	/** Show a chevron indicator */
	showChevron?: boolean;
	/** Render as a link */
	href?: string;
	/** Link target */
	target?: string;
	/** Link rel attribute */
	rel?: string;
	/** Icon or element shown on the left */
	leftSlot?: React.ReactNode;
	/** Icon or element shown on the right (before chevron) */
	rightSlot?: React.ReactNode;
}

/** A card that acts as a clickable/tappable surface, similar to a large button or link. */
const ClickableCard = React.forwardRef<HTMLDivElement, ClickableCardProps>(
	(
		{
			className,
			variant,
			disabled = false,
			showChevron = false,
			href,
			target,
			rel,
			leftSlot,
			rightSlot,
			children,
			onClick,
			...props
		},
		ref,
	) => {
		const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
			if (disabled) return;
			onClick?.(e);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
			if (disabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				if (href) {
					window.open(href, target || "_self");
				} else {
					onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
				}
			}
		};

		const content = (
			<>
				{leftSlot && <div className="wwc:mr-3 wwc:flex-shrink-0">{leftSlot}</div>}
				<div className="wwc:flex-1 wwc:min-w-0">{children}</div>
				{rightSlot && <div className="wwc:ml-3 wwc:flex-shrink-0">{rightSlot}</div>}
				{showChevron && (
					<ChevronRight className="wwc:ml-2 wwc:h-5 wwc:w-5 wwc:flex-shrink-0 wwc:text-muted-foreground" />
				)}
			</>
		);

		if (href && !disabled) {
			// Filter out div-specific props that don't apply to anchor
			const {role, tabIndex, "aria-disabled": ariaDisabled, ...anchorProps} = props as any;
			return (
				<a
					ref={ref as React.Ref<HTMLAnchorElement>}
					href={href}
					target={target}
					rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
					className={cn(clickableCardVariants({variant, disabled}), className)}
					{...anchorProps}
				>
					{content}
				</a>
			);
		}

		return (
			<div
				ref={ref}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-disabled={disabled}
				className={cn(clickableCardVariants({variant, disabled}), className)}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				{...props}
			>
				{content}
			</div>
		);
	},
);
ClickableCard.displayName = "ClickableCard";

export {ClickableCard, clickableCardVariants};
