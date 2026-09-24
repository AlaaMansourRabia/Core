import {cn} from "@corensystem/coren-utils";
import {ArrowRight, Check, ChevronDown, ChevronUp, Flag} from "lucide-react";
import * as React from "react";

import {CompareBars} from "./compare-bars";

// ============================================================================
// Types
// ============================================================================

/** One source in the comparison (e.g. Approved / Planned, actual / baseline). */
export interface ProgressComparisonSource {
	/** Legend label shown beneath the hero number, e.g. "Approved". */
	label: string;
	/** Percentage 0–100. */
	value: number;
}

/** A single stat cell in the table grid. */
export interface ProgressComparisonStat {
	/** Short caption, e.g. "PV". */
	label: string;
	/** Formatted value, e.g. "$160,604". */
	value: string;
	/** Render the value in the destructive/negative color. */
	negative?: boolean;
}

/** A milestone node on the stepper (milestone variant). */
export interface ProgressComparisonMilestone {
	/** Short date caption, e.g. "Jan-27". */
	date: string;
	/** Milestone label, e.g. "M35". */
	label: string;
	/** Completed milestones render filled with a check; the track fills up to the last completed one. */
	complete?: boolean;
	/** Marker inside a pending circle (e.g. "80"). Ignored when `complete` or `flag`. */
	marker?: string | number;
	/** Show a flag icon instead of a marker — typically the final milestone. */
	flag?: boolean;
}

/** Small status indicator: a colored dot + label. */
export interface ProgressComparisonStatus {
	label: string;
	/** Dot color (any CSS color). Defaults to a blue. */
	color?: string;
}

/** Full-width action button shown in the `preview` variant. */
export interface ProgressComparisonAction {
	/** Button label, e.g. "View Walkthrough". */
	label: string;
	/** Trailing icon. Defaults to an arrow-right. Pass `null` to hide it. */
	icon?: React.ReactNode;
	onClick?: () => void;
}

export interface ProgressComparisonProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Panel title, e.g. "Ground Floor". Omit to hide the title line (e.g. when shown elsewhere). */
	title?: string;
	/** Secondary line under the title, e.g. "Floor | HOUSE-12-F0". */
	subtitle?: string;
	/** Left/primary source, rendered dark — most commonly the actual / approved value. */
	primary: ProgressComparisonSource;
	/** Right/secondary source, rendered lighter — most commonly the planned / baseline value. */
	secondary: ProgressComparisonSource;
	/** Variance shown in the pill. Defaults to `primary.value - secondary.value`. */
	variance?: number;
	/** Stat cells. Rendered as a 2-column table with edge-to-edge dividers; expands to any count. */
	stats: ProgressComparisonStat[];
	/**
	 * `progress` shows a status chip; `milestone` shows a stepper timeline; `preview` shows an image
	 * preview + an action button (pass `image` / `action`). Default `progress`.
	 */
	variant?: "progress" | "milestone" | "preview";
	/** Preview media for the `preview` variant (e.g. an `<img>` or map). Rendered letterboxed on a muted backdrop. */
	image?: React.ReactNode;
	/** Action button for the `preview` variant. */
	action?: ProgressComparisonAction;
	/** Status chip (progress variant) or the label to the right of "Milestones" (milestone variant). */
	status?: ProgressComparisonStatus;
	/** Milestones for the stepper (milestone variant). */
	milestones?: ProgressComparisonMilestone[];
	/** Heading shown above the stepper in the milestone variant. Default "Milestones". */
	stepperTitle?: string;
	/** Called when the header button is clicked — wire this to close the modal. Takes precedence over `collapsible`. */
	onClose?: () => void;
	/**
	 * Show a working collapse button that minimizes the panel to its header (self-managed).
	 * Ignored when `onClose` is set. The button is hidden unless `onClose` or `collapsible` is provided.
	 */
	collapsible?: boolean;
	/**
	 * When collapsed, also show a summary row beneath the header — the status chip on the left and the
	 * primary value on the right — instead of collapsing to the title alone. Default false.
	 */
	collapsedSummary?: boolean;
	/** Start in the collapsed state (self-managed collapse only; ignored when `onClose` is set). Default false. */
	defaultCollapsed?: boolean;
}

// ============================================================================
// Size scale
// ============================================================================

interface SizeConfig {
	sectionPad: string;
	headerGap: string;
	title: string;
	subtitle: string;
	closeIcon: string;
	stepperGap: string;
	stepperTitle: string;
	progressGap: string;
	hero: string;
	pill: string;
	pillText: string;
	pillIcon: string;
	legendText: string;
	legendDot: string;
	barGap: string;
	bar: string;
	cellPad: string;
	cellGap: string;
	statLabel: string;
	statValue: string;
	statusDot: string;
	statusText: string;
	circle: number;
	circleIcon: string;
	marker: string;
	stepLabel: string;
	stepGap: string;
	previewHeight: number;
	actionBtn: string;
	actionText: string;
	actionIcon: string;
}

/** Single compact density used everywhere — padding, gaps, fonts, circles and bars are kept dense. */
const SIZE: SizeConfig = {
	sectionPad: "wwc:p-3",
	headerGap: "wwc:gap-2.5",
	title: "wwc:text-sm",
	subtitle: "wwc:text-[11px]",
	closeIcon: "wwc:size-3.5",
	stepperGap: "wwc:gap-2",
	stepperTitle: "wwc:text-[11px]",
	progressGap: "wwc:gap-2",
	hero: "wwc:text-xl",
	pill: "wwc:gap-0.5 wwc:rounded wwc:px-1.5 wwc:py-0.5",
	pillText: "wwc:text-[11px]",
	pillIcon: "wwc:size-3",
	legendText: "wwc:text-[10px]",
	legendDot: "wwc:size-1.5",
	barGap: "wwc:gap-0.5",
	bar: "wwc:h-2",
	cellPad: "wwc:p-3",
	cellGap: "wwc:gap-0",
	statLabel: "wwc:text-[9px]",
	statValue: "wwc:text-sm",
	statusDot: "wwc:size-1.5",
	statusText: "wwc:text-[11px]",
	circle: 28,
	circleIcon: "wwc:size-3",
	marker: "wwc:text-[10px]",
	stepLabel: "wwc:text-[8px]",
	stepGap: "wwc:gap-0.5",
	previewHeight: 140,
	actionBtn: "wwc:h-8 wwc:gap-1 wwc:rounded-md",
	actionText: "wwc:text-[11px]",
	actionIcon: "wwc:size-3",
};

// ============================================================================
// Sub-parts
// ============================================================================

function StatusChip({status, sz, className}: {status: ProgressComparisonStatus; sz: SizeConfig; className?: string}) {
	return (
		<div className={cn("wwc:flex wwc:items-center wwc:gap-1.5", className)}>
			<span className={cn("wwc:rounded-sm", sz.statusDot)} style={{backgroundColor: status.color ?? "#2563eb"}} />
			<span className={cn("wwc:text-muted-foreground", sz.statusText)}>{status.label}</span>
		</div>
	);
}

function Step({milestone, sz}: {milestone: ProgressComparisonMilestone; sz: SizeConfig}) {
	const {date, label, complete, marker, flag} = milestone;
	const labelClass = cn(
		sz.stepLabel,
		"wwc:whitespace-nowrap",
		complete ? "wwc:font-semibold wwc:text-zinc-500" : "wwc:text-muted-foreground",
	);
	return (
		<div
			className={cn("wwc:relative wwc:z-10 wwc:flex wwc:flex-col wwc:items-center", sz.stepGap)}
			style={{width: sz.circle}}
		>
			<div
				className={cn(
					"wwc:flex wwc:items-center wwc:justify-center wwc:rounded-full",
					complete
						? "wwc:bg-primary wwc:text-primary-foreground"
						: "wwc:border-2 wwc:border-border wwc:bg-white wwc:text-muted-foreground",
				)}
				style={{width: sz.circle, height: sz.circle}}
			>
				{complete ? (
					<Check className={sz.circleIcon} strokeWidth={3} />
				) : flag ? (
					<Flag className={sz.circleIcon} />
				) : (
					<span className={cn("wwc:font-semibold", sz.marker)}>{marker}</span>
				)}
			</div>
			<span className={labelClass}>{date}</span>
			<span className={labelClass}>{label}</span>
		</div>
	);
}

function Stepper({milestones, sz}: {milestones: ProgressComparisonMilestone[]; sz: SizeConfig}) {
	const n = milestones.length;
	const completed = milestones.filter((m) => m.complete).length;
	// Fill reaches the center of the last completed circle.
	const frac = n > 1 && completed > 0 ? (completed - 1) / (n - 1) : 0;
	const inset = sz.circle / 2;
	const top = inset - 2;
	return (
		<div className="wwc:relative wwc:w-full">
			{/* track sits at the vertical center of the circles, inset by half a circle each side */}
			<div className="wwc:absolute wwc:h-1 wwc:rounded-full wwc:bg-muted" style={{top, left: inset, right: inset}} />
			<div
				className="wwc:absolute wwc:h-1 wwc:rounded-full wwc:bg-primary"
				style={{top, left: inset, width: `calc((100% - ${sz.circle}px) * ${frac})`}}
			/>
			<div className="wwc:flex wwc:items-start wwc:justify-between">
				{milestones.map((m) => (
					<Step key={`${m.label}-${m.date}`} milestone={m} sz={sz} />
				))}
			</div>
		</div>
	);
}

function StatCell({stat, sz}: {stat?: ProgressComparisonStat; sz: SizeConfig}) {
	return (
		<div className={cn("wwc:flex wwc:flex-1 wwc:flex-col", sz.cellPad, sz.cellGap)}>
			{stat && (
				<>
					<span className={cn("wwc:font-medium wwc:tracking-wide wwc:text-muted-foreground", sz.statLabel)}>
						{stat.label}
					</span>
					<span
						className={cn(
							"wwc:font-bold",
							sz.statValue,
							stat.negative ? "wwc:text-destructive" : "wwc:text-foreground",
						)}
					>
						{stat.value}
					</span>
				</>
			)}
		</div>
	);
}

// ============================================================================
// Component
// ============================================================================

/** A progress comparison panel (two sources, e.g. actual vs planned) with an expandable stat grid. Designed to sit in a modal. */
const ProgressComparison = React.forwardRef<HTMLDivElement, ProgressComparisonProps>(
	(
		{
			className,
			title,
			subtitle,
			primary,
			secondary,
			variance,
			stats,
			variant = "progress",
			status,
			milestones = [],
			stepperTitle = "Milestones",
			image,
			action,
			onClose,
			collapsible = false,
			collapsedSummary = false,
			defaultCollapsed = false,
			...props
		},
		ref,
	) => {
		const sz = SIZE;
		const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
		// The button closes (modal) when `onClose` is set, otherwise minimizes the panel in place.
		const showButton = Boolean(onClose) || collapsible;
		const handleButton = () => (onClose ? onClose() : setCollapsed((c) => !c));
		const ButtonIcon = !onClose && collapsed ? ChevronDown : ChevronUp;
		const buttonLabel = !onClose && collapsed ? "Expand" : "Collapse";
		// Chunk stats into rows of two for the grid.
		const rows: ProgressComparisonStat[][] = [];
		for (let i = 0; i < stats.length; i += 2) {
			rows.push(stats.slice(i, i + 2));
		}

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-xl wwc:border wwc:border-border wwc:bg-white wwc:text-zinc-900",
					// A fixed 288px card by default; override with `style={{width: "100%"}}`, which beats this.
					"wwc:w-72",
					className,
				)}
				{...props}
			>
				{/* Header + status / stepper */}
				<div className={cn("wwc:flex wwc:flex-col", sz.sectionPad, sz.headerGap)}>
					<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2">
						<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
							{title && <span className={cn("wwc:font-bold wwc:text-foreground", sz.title)}>{title}</span>}
							{subtitle && <span className={cn("wwc:text-muted-foreground", sz.subtitle)}>{subtitle}</span>}
						</div>
						{showButton && (
							<button
								type="button"
								onClick={handleButton}
								aria-label={buttonLabel}
								className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none"
							>
								<ButtonIcon className={sz.closeIcon} />
							</button>
						)}
					</div>

					{!collapsed && variant === "milestone" && (
						<div className={cn("wwc:flex wwc:flex-col", sz.stepperGap)}>
							<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
								<span className={cn("wwc:font-semibold wwc:text-foreground", sz.stepperTitle)}>{stepperTitle}</span>
								{status && <StatusChip status={status} sz={sz} />}
							</div>
							{milestones.length > 0 && <Stepper milestones={milestones} sz={sz} />}
						</div>
					)}

					{!collapsed && variant === "preview" && (
						<div className={cn("wwc:flex wwc:flex-col", sz.stepperGap)}>
							{image && (
								<div
									className="wwc:flex wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-zinc-400 wwc:[&_img]:h-full wwc:[&_img]:w-full wwc:[&_img]:object-contain"
									style={{height: sz.previewHeight}}
								>
									{image}
								</div>
							)}
							{action && (
								<button
									type="button"
									onClick={action.onClick}
									className={cn(
										"wwc:flex wwc:w-full wwc:items-center wwc:justify-center wwc:bg-primary wwc:font-semibold wwc:text-primary-foreground wwc:transition-opacity wwc:hover:opacity-90 wwc:focus-visible:outline-none",
										sz.actionBtn,
										sz.actionText,
									)}
								>
									<span>{action.label}</span>
									{action.icon === undefined ? <ArrowRight className={sz.actionIcon} /> : action.icon}
								</button>
							)}
						</div>
					)}

					{!collapsed && variant === "progress" && status && <StatusChip status={status} sz={sz} />}

					{/* Collapsed summary: status chip (left) + primary value (right). Sits inside the header
						    block (no divider), spaced by the header gap so there's no ghost-divider gap. */}
					{collapsed && collapsedSummary && (
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
							{status ? (
								<div className="wwc:flex wwc:items-center wwc:gap-1.5">
									<span className="wwc:size-2.5 wwc:rounded-sm" style={{backgroundColor: status.color ?? "#2563eb"}} />
									<span className="wwc:text-xs wwc:text-muted-foreground">{status.label}</span>
								</div>
							) : (
								<span />
							)}
							<span className="wwc:text-base wwc:font-semibold wwc:text-foreground">{primary.value}%</span>
						</div>
					)}
				</div>

				{!collapsed && <div className="wwc:h-px wwc:w-full wwc:bg-border" />}

				{/* Hero comparison — the shared dual-bar primitive. */}
				{!collapsed && (
					<CompareBars
						primary={primary}
						secondary={secondary}
						variance={variance}
						size="compact"
						className={sz.sectionPad}
					/>
				)}

				{!collapsed && <div className="wwc:h-px wwc:w-full wwc:bg-border" />}

				{/* Stats grid */}
				{!collapsed && (
					<div className="wwc:flex wwc:flex-col">
						{rows.map((row, r) => (
							<React.Fragment key={row.map((s) => s.label).join("-")}>
								{r > 0 && <div className="wwc:h-px wwc:w-full wwc:bg-border" />}
								<div className="wwc:flex wwc:items-stretch">
									<StatCell stat={row[0]} sz={sz} />
									<div className="wwc:w-px wwc:self-stretch wwc:bg-border" />
									<StatCell stat={row[1]} sz={sz} />
								</div>
							</React.Fragment>
						))}
					</div>
				)}
			</div>
		);
	},
);
ProgressComparison.displayName = "ProgressComparison";

export {ProgressComparison};
