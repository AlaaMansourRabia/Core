import {cn} from "@core/core-utils";
import * as React from "react";

export type KPIBarDot = "success" | "warning" | "danger" | "neutral";

/** One metric in a KPIBar — a compact value + label with an optional leading icon or status dot. */
export interface KPIBarItem {
	/** The metric value (pre-formatted by the caller). */
	value: React.ReactNode;
	/** Short label shown after the value. */
	label?: string;
	/** Leading icon (lucide or any component type). Takes precedence over `dot`. */
	icon?: React.ElementType;
	/** Leading status dot color (used when no `icon` is given). */
	dot?: KPIBarDot;
	/** Tone the value (and icon) — "danger" turns them red (e.g. active alerts). */
	tone?: "default" | "danger";
	/** Hide the label below this breakpoint (the value always stays). */
	hideLabelBelow?: "sm" | "md";
}

export interface KPIBarProps {
	/** Border-separated groups of items. Items within a group share one section (no inner border). */
	groups: KPIBarItem[][];
	className?: string;
}

const dotColor: Record<KPIBarDot, string> = {
	success: "wwc:bg-green-500",
	warning: "wwc:bg-amber-500",
	danger: "wwc:bg-red-500",
	neutral: "wwc:bg-muted-foreground",
};

const hideLabel = {
	sm: "wwc:hidden wwc:sm:inline",
	md: "wwc:hidden wwc:md:inline",
} as const;

function Item({value, label, icon: Icon, dot, tone, hideLabelBelow}: KPIBarItem) {
	const danger = tone === "danger";
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-1.5">
			{Icon ? (
				<Icon className={cn("wwc:h-4 wwc:w-4", danger ? "wwc:text-red-500" : "wwc:text-muted-foreground")} />
			) : dot ? (
				<div className={cn("wwc:h-2 wwc:w-2 wwc:rounded-full", dotColor[dot])} />
			) : null}
			<span className={cn("wwc:text-sm wwc:font-semibold", danger && "wwc:text-red-500")}>{value}</span>
			{label && (
				<span className={cn("wwc:text-xs wwc:text-muted-foreground", hideLabelBelow && hideLabel[hideLabelBelow])}>
					{label}
				</span>
			)}
		</div>
	);
}

/** A compact horizontal bar of headline metrics (value + label, optional icon or status dot),
 * border-separated into groups — the stat strip above a dashboard. */
const KPIBar = React.forwardRef<HTMLDivElement, KPIBarProps>(({groups, className}, ref) => (
	<div
		ref={ref}
		className={cn(
			"wwc:flex wwc:items-center wwc:gap-4 wwc:border-b wwc:bg-card wwc:px-4 wwc:h-14 wwc:shrink-0",
			className,
		)}
	>
		{groups.map((items, gi) => (
			<div
				key={gi}
				className={cn("wwc:flex wwc:items-center wwc:gap-4", gi < groups.length - 1 && "wwc:pr-4 wwc:border-r")}
			>
				{items.map((item, ii) => (
					<Item key={ii} {...item} />
				))}
			</div>
		))}
	</div>
));
KPIBar.displayName = "KPIBar";

export {KPIBar};
