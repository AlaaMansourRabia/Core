import {cn} from "@corensystem/core-utils";
import * as React from "react";

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
	/** Section title */
	title?: React.ReactNode;
	/** Section description */
	description?: React.ReactNode;
	/** Actions to display in the header */
	actions?: React.ReactNode;
}

/** A semantic section component with optional title, description, and actions. */
const Section = React.forwardRef<HTMLElement, SectionProps>(
	({className, title, description, actions, children, ...props}, ref) => {
		const hasHeader = title || description || actions;

		return (
			<section ref={ref} className={cn("wwc:space-y-4", className)} {...props}>
				{hasHeader && (
					<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-4">
						<div className="wwc:space-y-1">
							{title && <h3 className="wwc:text-lg wwc:font-semibold wwc:leading-none wwc:tracking-tight">{title}</h3>}
							{description && <p className="wwc:text-sm wwc:text-muted-foreground">{description}</p>}
						</div>
						{actions && <div className="wwc:flex wwc:items-center wwc:gap-2">{actions}</div>}
					</div>
				)}
				{children}
			</section>
		);
	},
);
Section.displayName = "Section";

export {Section};
