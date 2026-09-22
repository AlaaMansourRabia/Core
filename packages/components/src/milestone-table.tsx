import {cn} from "@corensystem/core-utils";
import {ChevronDown} from "lucide-react";
import * as React from "react";

/** One milestone row: a colored swatch + id, an actual date (or none), and a planned date. */
export interface MilestoneRow {
	/** Milestone id / label, e.g. "M35". */
	id: string;
	/** Swatch color (any CSS color). */
	color: string;
	/** Actual date, e.g. "Aug-26"; `null` when not yet reached (renders "—"). */
	actual: string | null;
	/** Planned date, e.g. "Sep-26". */
	planned: string;
}

export interface MilestoneTableProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** The milestone rows, in order. */
	milestones: MilestoneRow[];
	/** Section title. Default "Milestones". */
	title?: React.ReactNode;
	/** Wrap the table in a collapsible section with a toggle header. Default true. */
	collapsible?: boolean;
	/** Initial open state (collapsible only). Default true. */
	defaultOpen?: boolean;
	/** Column headers. Default `["Milestone", "Actual", "Planned"]`. */
	columns?: [string, string, string];
}

/**
 * A milestones table: one row per milestone with a colored swatch + id, its actual date (or "—"), and
 * its planned date, with zebra striping. Collapsible by default — a toggle header (with a chevron) shows
 * / hides the table; pass `collapsible={false}` for a static title + table. Complements
 * `ProgressComparison` (which shows milestones as a stepper) when a dated table reads better.
 */
const MilestoneTable = React.forwardRef<HTMLDivElement, MilestoneTableProps>(
	(
		{
			className,
			milestones,
			title = "Milestones",
			collapsible = true,
			defaultOpen = true,
			columns = ["Milestone", "Actual", "Planned"],
			...props
		},
		ref,
	) => {
		const [open, setOpen] = React.useState(defaultOpen);
		const show = collapsible ? open : true;

		const table = (
			<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border">
				<div className="wwc:flex wwc:items-center wwc:bg-muted wwc:px-3 wwc:py-2">
					<span className="wwc:w-[86px] wwc:shrink-0 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						{columns[0]}
					</span>
					<span className="wwc:flex-1 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						{columns[1]}
					</span>
					<span className="wwc:flex-1 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						{columns[2]}
					</span>
				</div>
				{milestones.map((m, i) => (
					<div
						key={m.id}
						className={cn(
							"wwc:flex wwc:items-center wwc:border-t wwc:border-border wwc:px-3 wwc:py-2.5",
							i % 2 === 1 && "wwc:bg-muted",
						)}
					>
						<div className="wwc:flex wwc:w-[86px] wwc:shrink-0 wwc:items-center wwc:gap-1.5">
							<span className="wwc:size-2.5 wwc:shrink-0 wwc:rounded-sm" style={{backgroundColor: m.color}} />
							<span className="wwc:text-xs wwc:font-semibold wwc:text-foreground">{m.id}</span>
						</div>
						<span className="wwc:flex-1 wwc:text-xs wwc:text-muted-foreground">{m.actual ?? "—"}</span>
						<span className="wwc:flex-1 wwc:text-xs wwc:text-foreground">{m.planned}</span>
					</div>
				))}
			</div>
		);

		return (
			<div ref={ref} className={cn("wwc:flex wwc:flex-col wwc:gap-2.5", className)} {...props}>
				{collapsible ? (
					<button
						type="button"
						aria-expanded={open}
						onClick={() => setOpen((v) => !v)}
						className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:text-left wwc:focus-visible:outline-none"
					>
						<span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">{title}</span>
						<ChevronDown
							className={cn(
								"wwc:size-3.5 wwc:text-muted-foreground wwc:transition-transform",
								!open && "wwc:-rotate-90",
							)}
						/>
					</button>
				) : (
					title != null && <span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">{title}</span>
				)}
				{show && table}
			</div>
		);
	},
);
MilestoneTable.displayName = "MilestoneTable";

export {MilestoneTable};
