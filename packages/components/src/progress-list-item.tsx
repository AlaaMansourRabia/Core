import {cn} from "@wakecap/core-utils";
import {ChevronRight, ListTree} from "lucide-react";

import {Badge} from "./badge";
import {Progress} from "./progress";

/**
 * The kind of progress row. All share the same anatomy — the name stacked over its code, with an optional
 * schedule badge, metric strip, progress bar, linked-tool count, and drill affordance. The variant tags
 * the WBS level as it drills down (what actually renders is driven by the props you pass):
 * - `generic`  — a WBS grouping (zone / category / division): name + code, no progress bar.
 * - `task`     — a work item: name + code, a schedule badge, EV strip, and a progress bar.
 * - `object`   — a physical object under a task: name + code + a progress bar.
 *
 * (Operations are no longer list rows — they're reviewed in the Operations Drawer.)
 */
export type ProgressListItemVariant = "generic" | "task" | "object";

export type ProgressMetricTone = "neutral" | "negative" | "positive";

export interface ProgressMetric {
	label: string;
	value: string;
	/** `negative` → destructive, `positive` → success; omit for neutral. */
	tone?: ProgressMetricTone;
}

export interface ProgressListItemBadge {
	label: string;
	/** `deviation` → a filled pill, `within` → a bordered pill. */
	tone: "deviation" | "within";
}

export interface ProgressListItemProps {
	variant: ProgressListItemVariant;
	/** Primary bold identifier — the level's name. */
	title: string;
	/** Secondary muted text — the WBS code, shown beneath the name. */
	subtitle?: string;
	/** Schedule / status badge shown beside the identifier. */
	badge?: ProgressListItemBadge;
	/** Earned-value metric strip (BAC / EV / PV / SV …). */
	metrics?: ProgressMetric[];
	/** Completion percentage → a progress bar + percentage on the right. */
	progress?: number;
	/** Linked-tool count, shown with the tree icon. */
	tools?: number;
	/** When provided, the row is an interactive button that drills into the next level (shows a chevron). */
	onOpen?: () => void;
	className?: string;
}

function Metric({label, value, tone = "neutral"}: ProgressMetric) {
	return (
		<span className="wwc:flex wwc:items-center wwc:gap-1 wwc:text-xs">
			<span className="wwc:text-muted-foreground">{label}</span>
			<span
				className={cn(
					tone === "negative"
						? "wwc:font-semibold wwc:text-destructive"
						: tone === "positive"
							? "wwc:font-semibold wwc:text-emerald-600"
							: "wwc:font-medium wwc:text-foreground",
				)}
			>
				{value}
			</span>
		</span>
	);
}

/** A single progress-details list row — the shared building block for every WBS level. */
export function ProgressListItem({
	title,
	subtitle,
	badge,
	metrics,
	progress,
	tools,
	onOpen,
	className,
}: ProgressListItemProps) {
	const interactive = onOpen !== undefined;

	const content = (
		<>
			<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-1.5">
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">{title}</span>
					{badge && <Badge variant={badge.tone === "deviation" ? "destructive" : "outline"}>{badge.label}</Badge>}
				</div>
				{subtitle && <span className="wwc:text-xs wwc:text-muted-foreground">{subtitle}</span>}
				{metrics && metrics.length > 0 && (
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-x-4 wwc:gap-y-1">
						{metrics.map((metric) => (
							<Metric key={metric.label} {...metric} />
						))}
					</div>
				)}
			</div>

			<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3">
				{progress !== undefined && (
					<>
						<Progress value={progress} className="wwc:h-2 wwc:w-24" />
						<span className="wwc:w-9 wwc:text-right wwc:text-sm wwc:font-bold wwc:text-foreground">{progress}%</span>
					</>
				)}
				{tools !== undefined && (
					<span className="wwc:flex wwc:items-center wwc:gap-1 wwc:text-muted-foreground">
						<span className="wwc:text-xs">{tools}</span>
						<ListTree className="wwc:size-4" />
					</span>
				)}
				{interactive && <ChevronRight className="wwc:size-4 wwc:text-muted-foreground" />}
			</div>
		</>
	);

	const base = "wwc:flex wwc:w-full wwc:items-center wwc:gap-4 wwc:px-4 wwc:py-3 wwc:text-left";
	if (interactive) {
		return (
			<button
				type="button"
				onClick={onOpen}
				className={cn(base, "wwc:transition-colors wwc:hover:bg-muted/50", className)}
			>
				{content}
			</button>
		);
	}
	return <div className={cn(base, className)}>{content}</div>;
}
