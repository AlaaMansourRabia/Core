import {cn} from "@core/core-utils";
import * as React from "react";

export interface ActivityLogProps extends React.HTMLAttributes<HTMLOListElement> {}

/**
 * Vertical chronological feed of activity / history entries. Renders as an <ol>
 * with a continuous connector line passing through each item's icon badge.
 * Pair with ActivityItem children.
 */
const ActivityLog = React.forwardRef<HTMLOListElement, ActivityLogProps>(({className, children, ...props}, ref) => (
	<ol ref={ref} className={cn("wwc:relative wwc:flex wwc:flex-col", className)} {...props}>
		{/* Connector: a vertical line from the center of the first icon to the center
		    of the last, sitting behind the icon badges. Each icon's solid background
		    masks the line at its row. */}
		<span
			aria-hidden="true"
			className="wwc:absolute wwc:left-4 wwc:top-4 wwc:bottom-4 wwc:w-px wwc:bg-muted-foreground/30"
		/>
		{children}
	</ol>
));
ActivityLog.displayName = "ActivityLog";

export interface ActivityItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
	/** Leading icon rendered inside the circular badge. */
	icon?: React.ReactNode;
	/** Relative timestamp displayed after the message (e.g. "about 12 hours ago"). */
	timestamp?: React.ReactNode;
}

const ActivityItem = React.forwardRef<HTMLLIElement, ActivityItemProps>(
	({icon, timestamp, className, children, ...props}, ref) => (
		<li ref={ref} className={cn("wwc:relative wwc:flex wwc:items-center wwc:gap-3 wwc:py-2", className)} {...props}>
			<span className="wwc:relative wwc:z-10 wwc:flex wwc:h-8 wwc:w-8 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:text-muted-foreground">
				{icon}
			</span>
			<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-wrap wwc:items-baseline wwc:gap-x-1.5 wwc:text-sm wwc:text-foreground">
				<span className="wwc:min-w-0">{children}</span>
				{timestamp && <span className="wwc:text-muted-foreground">{timestamp}</span>}
			</div>
		</li>
	),
);
ActivityItem.displayName = "ActivityItem";

/** Inline emphasis for the actor name in an activity message. */
function ActivityActor({className, children, ...props}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span className={cn("wwc:font-semibold wwc:text-foreground", className)} {...props}>
			{children}
		</span>
	);
}
ActivityActor.displayName = "ActivityActor";

/** Inline emphasis for a noun referenced in an activity message (link, work item key, etc.). */
function ActivityRef({className, children, ...props}: React.HTMLAttributes<HTMLSpanElement>) {
	return (
		<span className={cn("wwc:font-semibold wwc:text-foreground", className)} {...props}>
			{children}
		</span>
	);
}
ActivityRef.displayName = "ActivityRef";

export {ActivityActor, ActivityItem, ActivityLog, ActivityRef};
