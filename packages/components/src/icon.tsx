import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {type LucideIcon, type LucideProps} from "lucide-react";
import * as React from "react";

const iconVariants = cva("wwc:shrink-0", {
	variants: {
		size: {
			xs: "wwc:size-3",
			sm: "wwc:size-4",
			md: "wwc:size-5",
			lg: "wwc:size-6",
			xl: "wwc:size-8",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export interface IconProps extends Omit<LucideProps, "size">, VariantProps<typeof iconVariants> {
	/** The Lucide icon component to render */
	icon: LucideIcon;
}

/** A wrapper component for Lucide icons with consistent sizing. */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(({className, size, icon: IconComponent, ...props}, ref) => {
	return <IconComponent ref={ref} className={cn(iconVariants({size, className}))} {...props} />;
});
Icon.displayName = "Icon";

export {Icon, iconVariants};
