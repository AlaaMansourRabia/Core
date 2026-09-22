import {cn} from "@corensystem/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

/**
 * Size-aware status indicator dot that scales proportionally with avatar size.
 * Each variant pairs a colour with a distinct shape (WCAG 1.4.1 - status not conveyed by color alone).
 */

const avatarStatusDotVariants = cva("wwc:absolute wwc:rounded-full wwc:border-2 wwc:border-background", {
	variants: {
		variant: {
			online: "wwc:bg-green-500",
			offline: "wwc:bg-muted-foreground/50",
			busy: "wwc:bg-red-500",
			away: "wwc:bg-amber-500",
			dnd: "wwc:bg-red-500", // Do not disturb - uses minus shape
		},
		/** Avatar size context - determines dot size and position */
		avatarSize: {
			xs: "wwc:h-1.5 wwc:w-1.5 wwc:bottom-0 wwc:right-0",
			sm: "wwc:h-2 wwc:w-2 wwc:bottom-0 wwc:right-0",
			md: "wwc:h-2.5 wwc:w-2.5 wwc:bottom-0 wwc:right-0",
			lg: "wwc:h-3 wwc:w-3 wwc:bottom-0.5 wwc:right-0.5",
			xl: "wwc:h-3.5 wwc:w-3.5 wwc:bottom-1 wwc:right-1",
		},
		/** Position of the status dot relative to avatar */
		position: {
			"bottom-right": "wwc:bottom-0 wwc:right-0",
			"bottom-left": "wwc:bottom-0 wwc:left-0",
			"top-right": "wwc:top-0 wwc:right-0",
			"top-left": "wwc:top-0 wwc:left-0",
		},
		pulse: {
			true: "wwc:animate-pulse",
			false: "",
		},
	},
	compoundVariants: [
		// DND has a minus line through it
		{
			variant: "dnd",
			class:
				"wwc:relative after:wwc:absolute after:wwc:inset-x-[2px] after:wwc:top-1/2 after:wwc:-translate-y-1/2 after:wwc:h-0.5 after:wwc:bg-background after:wwc:rounded-full",
		},
		// Offline has a ring shape instead of filled
		{
			variant: "offline",
			class: "wwc:bg-transparent wwc:border-muted-foreground/50",
		},
	],
	defaultVariants: {
		variant: "online",
		avatarSize: "md",
		position: "bottom-right",
		pulse: false,
	},
});

export interface AvatarStatusDotProps
	extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof avatarStatusDotVariants> {
	/** Accessible label describing the status */
	label?: string;
}

/** Status indicator overlay for Avatar components. Position absolutely within a relative Avatar container. */
const AvatarStatusDot = React.forwardRef<HTMLSpanElement, AvatarStatusDotProps>(
	({className, variant, avatarSize, position, pulse, label, ...props}, ref) => {
		const statusLabel = label || variant || "status";
		return (
			<span
				ref={ref}
				role="status"
				aria-label={statusLabel}
				className={cn(avatarStatusDotVariants({variant, avatarSize, position, pulse}), className)}
				{...props}
			/>
		);
	},
);
AvatarStatusDot.displayName = "AvatarStatusDot";

export {AvatarStatusDot, avatarStatusDotVariants};
