import {cn} from "@wakecap/core-utils";
import * as React from "react";

import {RequiredMark} from "./label";

export interface PropertyListProps extends Omit<React.HTMLAttributes<HTMLDListElement>, "title"> {
	/** Optional section title rendered above the rows (e.g. "Properties"). */
	title?: React.ReactNode;
	/** Width of the label column. Default: 9rem. */
	labelWidth?: string;
}

/**
 * Vertical list of labeled properties, rendered as semantic <dl> markup.
 * Pair with PropertyRow children. Use for issue / work item detail panels,
 * settings summaries, and any "icon + label : value" stack.
 */
const PropertyList = React.forwardRef<HTMLDListElement, PropertyListProps>(
	({title, labelWidth, className, children, style, ...props}, ref) => {
		const mergedStyle = labelWidth ? {...style, ["--wwc-property-label-width" as string]: labelWidth} : style;
		return (
			<dl ref={ref} className={cn("wwc:flex wwc:flex-col", className)} style={mergedStyle} {...props}>
				{title && <div className="wwc:mb-3 wwc:text-base wwc:font-semibold wwc:text-foreground">{title}</div>}
				{children}
			</dl>
		);
	},
);
PropertyList.displayName = "PropertyList";

export interface PropertyRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Leading icon rendered next to the label. */
	icon?: React.ReactNode;
	/** Label text (the property name, e.g. "Assignees"). */
	label: React.ReactNode;
	/**
	 * Vertical alignment of the value relative to the label.
	 * - `center` (default): single-line values
	 * - `start`: multi-line / wrapping values
	 */
	align?: "center" | "start";
	/** Append a required-field asterisk after the label. Decorative — the control carries the semantics. */
	required?: boolean;
}

const PropertyRow = React.forwardRef<HTMLDivElement, PropertyRowProps>(
	({icon, label, align = "center", required = false, className, children, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(
				"wwc:flex wwc:gap-3 wwc:py-2",
				align === "center" ? "wwc:items-center" : "wwc:items-start",
				className,
			)}
			{...props}
		>
			<dt
				className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:text-sm wwc:text-muted-foreground"
				style={{width: "var(--wwc-property-label-width, 9rem)"}}
			>
				{icon && (
					<span className="wwc:flex wwc:h-4 wwc:w-4 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:text-muted-foreground/80">
						{icon}
					</span>
				)}
				<span className="wwc:truncate">
					{label}
					{required && <RequiredMark />}
				</span>
			</dt>
			<dd className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:text-foreground">
				{children}
			</dd>
		</div>
	),
);
PropertyRow.displayName = "PropertyRow";

/** Muted placeholder text for empty values (e.g. "No module"). */
function PropertyEmpty({children, className, ...props}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span className={cn("wwc:text-sm wwc:text-muted-foreground/80", className)} {...props}>
			{children}
		</span>
	);
}
PropertyEmpty.displayName = "PropertyEmpty";

export {PropertyList, PropertyRow, PropertyEmpty};
