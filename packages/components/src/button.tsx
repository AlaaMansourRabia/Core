import {Slot} from "@radix-ui/react-slot";
import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

import {Spinner} from "./spinner";
import {HoverTooltip} from "./tooltip";

const buttonVariants = cva(
	// gap-1.5 (6px) matches the nav tabs and suits a 32px control with a 16px icon. The gap is the
	// ONLY spacing between icon and label — icons must not carry their own mr-*/ml-*, or it doubles.
	"wwc:inline-flex wwc:items-center wwc:justify-center wwc:gap-1.5 wwc:whitespace-nowrap wwc:rounded-md wwc:text-sm wwc:font-medium wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring wwc:disabled:pointer-events-none wwc:disabled:opacity-50 wwc:[&_svg]:pointer-events-none wwc:[&_svg]:size-4 wwc:[&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "wwc:bg-primary wwc:text-primary-foreground wwc:shadow wwc:hover:bg-primary/90",
				destructive: "wwc:bg-destructive wwc:text-destructive-foreground wwc:shadow-sm wwc:hover:bg-destructive/90",
				outline:
					"wwc:border wwc:border-border wwc:dark:border-foreground/30 wwc:bg-card wwc:shadow-sm wwc:hover:bg-accent wwc:hover:text-accent-foreground",
				secondary: "wwc:bg-secondary wwc:text-secondary-foreground wwc:shadow-sm wwc:hover:bg-secondary/80",
				ghost: "wwc:hover:bg-accent wwc:hover:text-accent-foreground",
				link: "wwc:text-primary wwc:underline-offset-4 wwc:hover:underline",
			},
			// 32px is the app's control height — table headers, pagination, toolbars and every
			// icon button sit on it. `default` and `sm` share that height and differ in padding
			// and type size; `lg` is the deliberate step up for a prominent CTA.
			size: {
				default: "wwc:h-8 wwc:px-4 wwc:py-2",
				sm: "wwc:h-8 wwc:rounded-md wwc:px-3 wwc:text-xs",
				lg: "wwc:h-10 wwc:rounded-md wwc:px-8",
			},
			icon: {
				true: "wwc:p-0 wwc:gap-0",
				false: "",
			},
		},
		compoundVariants: [
			{icon: true, size: "default", class: "wwc:w-8"},
			{icon: true, size: "sm", class: "wwc:w-8"},
			{icon: true, size: "lg", class: "wwc:w-10"},
		],
		defaultVariants: {
			variant: "default",
			size: "default",
			icon: false,
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	/** Hover/focus hint. Icon-only buttons should always set this — the icon alone is not a label. */
	tooltip?: React.ReactNode;
	/** Which side the tooltip opens on. Defaults to "top". */
	tooltipSide?: "top" | "right" | "bottom" | "left";
}

/** An interactive element that triggers an action when clicked. */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			icon,
			asChild = false,
			loading = false,
			children,
			disabled,
			tooltip,
			tooltipSide = "top",
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : "button";

		const isIconOnly = icon === true || (!children && React.Children.count(children) === 0);

		const button = (
			<Comp
				className={cn(buttonVariants({variant, size, icon, className}))}
				ref={ref}
				disabled={disabled || loading}
				{...props}
			>
				{loading ? (
					isIconOnly ? (
						<Spinner className="wwc:h-4 wwc:w-4" />
					) : (
						<>
							<Spinner className="wwc:h-4 wwc:w-4" />
							{children}
						</>
					)
				) : (
					children
				)}
			</Comp>
		);

		if (tooltip === undefined) return button;

		// Self-contained provider so a tooltip works without the consumer mounting one.
		// Note: when the Button is itself an `asChild` trigger (Popover/Dropdown), wrap the
		// *trigger* in a HoverTooltip instead — the wrapper would swallow the trigger's props here.
		return (
			<HoverTooltip content={tooltip} side={tooltipSide}>
				{button}
			</HoverTooltip>
		);
	},
);
Button.displayName = "Button";

export {Button, buttonVariants};
