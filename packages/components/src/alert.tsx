import {cn} from "@core/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const alertVariants = cva(
	"wwc:relative wwc:w-full wwc:rounded-lg wwc:border wwc:px-4 wwc:py-3 wwc:text-sm wwc:[&>svg+div]:translate-y-[-3px] wwc:[&>svg]:absolute wwc:[&>svg]:left-4 wwc:[&>svg]:top-4 wwc:[&>svg]:text-foreground wwc:[&>svg~*]:pl-7",
	{
		variants: {
			variant: {
				default: "wwc:bg-card wwc:text-foreground",
				destructive:
					"wwc:border-destructive/50 wwc:text-destructive wwc:dark:border-destructive wwc:[&>svg]:text-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

/** Displays a callout for important information with default and destructive variants. */
const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({className, variant, ...props}, ref) => (
	<div ref={ref} role="alert" className={cn(alertVariants({variant}), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
	({className, ...props}, ref) => (
		<h5
			ref={ref}
			className={cn("wwc:mb-1 wwc:font-medium wwc:leading-none wwc:tracking-tight", className)}
			{...props}
		/>
	),
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
	({className, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:text-sm wwc:[&_p]:leading-relaxed", className)} {...props} />
	),
);
AlertDescription.displayName = "AlertDescription";

export {Alert, AlertTitle, AlertDescription};
