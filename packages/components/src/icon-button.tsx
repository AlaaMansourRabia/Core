import {Slot} from "@radix-ui/react-slot";
import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

import {Spinner} from "./spinner";
import {HoverTooltip} from "./tooltip";

const iconButtonVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:whitespace-nowrap wwc:rounded-md wwc:text-sm wwc:font-medium wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:pointer-events-none wwc:disabled:opacity-50 wwc:[&_svg]:pointer-events-none wwc:[&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "wwc:bg-primary wwc:text-primary-foreground wwc:shadow wwc:hover:bg-primary/90",
				destructive: "wwc:bg-destructive wwc:text-destructive-foreground wwc:shadow-sm wwc:hover:bg-destructive/90",
				outline:
					"wwc:border wwc:border-border wwc:dark:border-foreground/30 wwc:bg-card wwc:shadow-sm wwc:hover:bg-accent wwc:hover:text-accent-foreground",
				secondary: "wwc:bg-secondary wwc:text-secondary-foreground wwc:shadow-sm wwc:hover:bg-secondary/80",
				ghost: "wwc:hover:bg-accent wwc:hover:text-accent-foreground",
			},
			size: {
				sm: "wwc:h-7 wwc:w-7 wwc:[&_svg]:size-3.5",
				md: "wwc:h-8 wwc:w-8 wwc:[&_svg]:size-4",
				lg: "wwc:h-10 wwc:w-10 wwc:[&_svg]:size-5",
			},
		},
		defaultVariants: {
			variant: "ghost",
			size: "md",
		},
	},
);

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	asChild?: boolean;
	loading?: boolean;
	/** Hover/focus hint. Icon-only buttons must always set this for accessibility. */
	tooltip: React.ReactNode;
	/** Which side the tooltip opens on. Defaults to "top". */
	tooltipSide?: "top" | "right" | "bottom" | "left";
}

/** A button that displays only an icon. Requires a tooltip for accessibility. */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({className, variant, size, asChild = false, loading = false, children, disabled, tooltip, tooltipSide = "top", ...props}, ref) => {
		const Comp = asChild ? Slot : "button";

		const button = (
			<Comp className={cn(iconButtonVariants({variant, size, className}))} ref={ref} disabled={disabled || loading} {...props}>
				{loading ? <Spinner className="wwc:h-4 wwc:w-4" /> : children}
			</Comp>
		);

		return (
			<HoverTooltip content={tooltip} side={tooltipSide}>
				{button}
			</HoverTooltip>
		);
	},
);
IconButton.displayName = "IconButton";

export {IconButton, iconButtonVariants};
