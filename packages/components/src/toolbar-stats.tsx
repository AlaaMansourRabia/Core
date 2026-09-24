import {cn} from "@corensystem/coren-utils";
import * as React from "react";

import {Card} from "./card";

/** A single labeled metric shown in the toolbar. */
export interface ToolbarStat {
	/** Short caption above the value, e.g. "APPROVED" (rendered uppercase). */
	label: string;
	/** Formatted value, e.g. "26.48%" or "$551,117,394". */
	value: string;
	/** Render the value in the destructive/negative color (e.g. a negative variance). */
	negative?: boolean;
}

export interface ToolbarStatsProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Groups of stat tiles. Tiles within a group sit side by side and share the row width equally; a
	 * vertical divider separates one group from the next (e.g. percentage metrics from currency ones).
	 */
	groups: ToolbarStat[][];
	/**
	 * `cards` (default): each metric is its own bordered tile with gaps between them and a divider
	 * between groups. `table`: a bare row of full-height cells split by full-height internal dividers —
	 * no gaps, no per-tile borders, and no outer outline.
	 */
	variant?: "cards" | "table";
}

/** The label + value pair rendered inside each metric cell (shared by both variants). */
function StatContent({stat}: {stat: ToolbarStat}) {
	return (
		<>
			<span className="wwc:whitespace-nowrap wwc:text-xs wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
				{stat.label}
			</span>
			<span
				className={cn(
					"wwc:whitespace-nowrap wwc:text-sm wwc:font-bold wwc:leading-tight",
					stat.negative ? "wwc:text-destructive" : "wwc:text-foreground",
				)}
			>
				{stat.value}
			</span>
		</>
	);
}

/**
 * A full-width toolbar of labeled metric tiles — a caption over a bold value, spread to equal widths.
 * Pass `groups` to split the row into divider-separated sections; values flagged `negative` render in
 * the destructive color. `variant="cards"` (default) draws separate bordered tiles; `variant="table"`
 * draws a bare row of full-height cells split by full-height internal dividers (no outer outline).
 */
const ToolbarStats = React.forwardRef<HTMLDivElement, ToolbarStatsProps>(
	({className, groups, variant = "cards", ...props}, ref) => {
		if (variant === "table") {
			// Bare table: no outer outline or background, just full-height cells split by full-height
			// internal dividers (items-stretch makes the cells — and their left borders — span the full
			// row height, so the dividers reach top and bottom). Group boundaries read as ordinary cell
			// dividers here.
			const cells = groups.flat();
			return (
				<div ref={ref} className={cn("wwc:flex wwc:w-full wwc:items-stretch", className)} {...props}>
					{cells.map((stat, index) => (
						<div
							key={stat.label}
							className={cn(
								"wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:justify-center wwc:gap-0.5 wwc:px-3 wwc:py-2",
								index > 0 && "wwc:border-l wwc:border-border",
							)}
						>
							<StatContent stat={stat} />
						</div>
					))}
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={cn("wwc:flex wwc:w-full wwc:items-stretch wwc:gap-1 wwc:overflow-x-auto", className)}
				{...props}
			>
				{groups.map((group, groupIndex) => (
					<React.Fragment key={group.map((stat) => stat.label).join("|")}>
						{groupIndex > 0 && (
							<div className="wwc:w-px wwc:shrink-0 wwc:self-stretch wwc:bg-border" aria-hidden="true" />
						)}
						{group.map((stat) => (
							// flex-1 fills the row equally when there's room; content min-width keeps values whole
							// (the row scrolls instead of truncating numbers when space is tight).
							<Card
								key={stat.label}
								variant="stat"
								className="wwc:flex wwc:flex-1 wwc:flex-col wwc:gap-0.5 wwc:px-3 wwc:py-2"
							>
								<StatContent stat={stat} />
							</Card>
						))}
					</React.Fragment>
				))}
			</div>
		);
	},
);
ToolbarStats.displayName = "ToolbarStats";

export {ToolbarStats};
