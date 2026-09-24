import {cn} from "@corensystem/coren-utils";
import {Slot} from "@radix-ui/react-slot";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

const linkVariants = cva(
	"wwc:transition-colors wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
	{
		variants: {
			variant: {
				default: "wwc:text-primary wwc:underline-offset-4 wwc:hover:underline",
				subtle: "wwc:text-foreground wwc:hover:text-primary wwc:underline-offset-4 wwc:hover:underline",
				muted: "wwc:text-muted-foreground wwc:hover:text-foreground wwc:underline-offset-4 wwc:hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
	asChild?: boolean;
}

/** A styled anchor element for navigation. */
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({className, variant, asChild = false, ...props}, ref) => {
	const Comp = asChild ? Slot : "a";
	return <Comp className={cn(linkVariants({variant, className}))} ref={ref} {...props} />;
});
Link.displayName = "Link";

export {Link, linkVariants};
