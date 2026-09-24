import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

// gap-1 owns the icon/label spacing so call sites never need a margin on the leading icon.
const badgeVariants = cva(
	"wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:border wwc:px-2.5 wwc:py-0.5 wwc:text-xs wwc:font-semibold wwc:transition-colors wwc:focus:outline-none wwc:focus:ring-2 wwc:focus:ring-ring wwc:focus:ring-offset-2 wwc:[&_svg]:pointer-events-none wwc:[&_svg]:size-3 wwc:[&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "wwc:border-transparent wwc:bg-primary wwc:text-primary-foreground wwc:shadow wwc:hover:bg-primary/80",
				secondary: "wwc:border-transparent wwc:bg-secondary wwc:text-secondary-foreground wwc:hover:bg-secondary/80",
				destructive:
					"wwc:border-transparent wwc:bg-destructive wwc:text-destructive-foreground wwc:shadow wwc:hover:bg-destructive/80",
				outline: "wwc:text-foreground",
				// ── Filled semantic colors ──
				success: "wwc:border-transparent wwc:bg-green-600 wwc:text-white wwc:shadow wwc:hover:bg-green-600/80",
				warning: "wwc:border-transparent wwc:bg-amber-500 wwc:text-white wwc:shadow wwc:hover:bg-amber-500/80",
				info: "wwc:border-transparent wwc:bg-blue-600 wwc:text-white wwc:shadow wwc:hover:bg-blue-600/80",
				// ── Soft: light tinted bg + colored stroke + colored text (the subtle "indicator" look) ──
				successSoft:
					"wwc:border-green-600/25 wwc:bg-green-500/10 wwc:text-green-700 wwc:dark:text-green-400 wwc:hover:bg-green-500/15",
				warningSoft:
					"wwc:border-amber-600/25 wwc:bg-amber-500/10 wwc:text-amber-700 wwc:dark:text-amber-400 wwc:hover:bg-amber-500/15",
				dangerSoft:
					"wwc:border-red-600/25 wwc:bg-red-500/10 wwc:text-red-700 wwc:dark:text-red-400 wwc:hover:bg-red-500/15",
				infoSoft:
					"wwc:border-blue-600/25 wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400 wwc:hover:bg-blue-500/15",
				neutralSoft: "wwc:border-border wwc:bg-muted wwc:text-muted-foreground wwc:hover:bg-muted/70",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

/**
 * Displays a small status descriptor or label.
 *
 * forwardRef because a Badge is routinely the child of an `asChild` wrapper — HoverTooltip, a
 * DropdownMenuTrigger — and Radix hands those a ref. As a plain function component it triggered
 * "Function components cannot be given refs" and the tooltip silently never bound.
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(({className, variant, ...props}, ref) => (
	<div ref={ref} className={cn(badgeVariants({variant}), className)} {...props} />
));
Badge.displayName = "Badge";

export {Badge, badgeVariants};
