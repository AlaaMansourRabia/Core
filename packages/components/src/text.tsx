import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const textVariants = cva("", {
	variants: {
		size: {
			xs: "wwc:text-xs",
			sm: "wwc:text-sm",
			md: "wwc:text-base",
			lg: "wwc:text-lg",
			xl: "wwc:text-xl",
		},
		weight: {
			normal: "wwc:font-normal",
			medium: "wwc:font-medium",
			semibold: "wwc:font-semibold",
			bold: "wwc:font-bold",
		},
		variant: {
			default: "wwc:text-foreground",
			muted: "wwc:text-muted-foreground",
			accent: "wwc:text-primary",
			error: "wwc:text-destructive",
			success: "wwc:text-green-600 dark:wwc:text-green-400",
		},
		align: {
			left: "wwc:text-left",
			center: "wwc:text-center",
			right: "wwc:text-right",
			justify: "wwc:text-justify",
		},
	},
	defaultVariants: {
		size: "md",
		weight: "normal",
		variant: "default",
		align: "left",
	},
});

export interface TextProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
	/** Render as a different HTML element */
	as?: "p" | "span" | "div" | "label";
}

/** Styled text element with consistent typography. */
const Text = React.forwardRef<HTMLElement, TextProps>(
	({className, size, weight, variant, align, as: Component = "p", ...props}, ref) => {
		return (
			<Component
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				ref={ref as any}
				className={cn(textVariants({size, weight, variant, align, className}))}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export {Text, textVariants};
