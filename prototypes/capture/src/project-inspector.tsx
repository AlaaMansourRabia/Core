import {cn} from "@core/core-utils";
import {HardHat, type LucideIcon, Ruler, X} from "lucide-react";

// The frosted-glass card shell shared by the inspector's sections (matches the floor inspector).
const CARD =
	"wwc:rounded wwc:border wwc:border-[rgba(255,255,255,0.5)] wwc:bg-[rgba(255,255,255,0.8)] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg";

interface Milestone {
	id: string;
	color: string;
	actual: string | null;
	planned: string;
}

// Project-level info for the build currently being viewed (mock, like the floor/schedule data).
const PROJECT = {
	name: "Villa 1234",
	updatedAgo: "7m ago",
	approved: 43,
	planned: 32,
	variance: -11,
	area: "540",
	workers: 28,
	week: "W34",
	milestones: [
		{id: "M35", color: "#93c5fd", actual: "Jun-26", planned: "Jan-26"},
		{id: "M50", color: "#3b82f6", actual: null, planned: "May-26"},
		{id: "M65", color: "#eab308", actual: null, planned: "Aug-26"},
		{id: "M80", color: "#84cc16", actual: null, planned: "Dec-26"},
		{id: "M95", color: "#22c55e", actual: null, planned: "May-27"},
		{id: "M100", color: "#15803d", actual: null, planned: "Jun-27"},
	] satisfies Milestone[],
	summary:
		"34 weeks into the villa construction, the project is on track with 55 weeks left. The foundation is set, and framing is nearly done. The team is currently focused on roof installation and plumbing. Despite some weather delays, the crew is working hard to meet the next milestone: completing the exterior by week 40 for a grand opening in 89 weeks.",
};

function StatCard({icon: Icon, value, unit}: {icon: LucideIcon; value: string | number; unit: string}) {
	return (
		<div className={cn(CARD, "wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-1 wwc:p-3")}>
			<Icon className="wwc:size-4 wwc:shrink-0 wwc:text-[#6b7280]" />
			<span className="wwc:truncate wwc:text-[13px]">
				<span className="wwc:font-semibold wwc:text-[#111827]">{value}</span>{" "}
				<span className="wwc:font-medium wwc:text-[#6b7280]">{unit}</span>
			</span>
		</div>
	);
}

// The outline action buttons under the summary (Ask Capture / Play Timeline / Review Progress).
function SummaryButton({
	children,
	className,
	onClick,
}: {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"wwc:flex wwc:h-8 wwc:items-center wwc:justify-center wwc:rounded wwc:border wwc:border-[#e5e7eb] wwc:px-2.5 wwc:text-[13px] wwc:font-semibold wwc:text-[#374151] wwc:transition-colors wwc:hover:bg-[rgba(255,255,255,0.6)] wwc:focus-visible:outline-none",
				className,
			)}
		>
			{children}
		</button>
	);
}

/**
 * Right-side project inspector — the project-level overview for the build currently being viewed, shown
 * when nothing (no floor, no object) is selected (Figma node 1863:7821): header, an approved-vs-planned
 * progress visual with a variance badge, a project summary with quick actions (Ask Capture, Play Timeline,
 * Review Progress), area + workers, and a milestone table (actual vs planned).
 */
export function ProjectInspector({
	onClose,
	onPlayTimeline,
	onReviewProgress,
}: {
	onClose: () => void;
	onPlayTimeline?: () => void;
	onReviewProgress?: () => void;
}) {
	const p = PROJECT;
	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:gap-1 wwc:text-foreground">
			{/* Combined header + progress card (fixed). The villa name now lives in the viewer header, so
			    this container only carries the "updated" timestamp, the close control, and the approved-vs-
			    planned progress visual — the two former containers merged into one (Figma node 1892:2804). */}
			<div className={cn(CARD, "wwc:flex wwc:shrink-0 wwc:flex-col wwc:overflow-hidden")}>
				{/* Header row: updated timestamp + close */}
				<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:pt-3">
					<span className="wwc:min-w-0 wwc:flex-1 wwc:text-[10px] wwc:text-[#6b7280]">Updated {p.updatedAgo}</span>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="wwc:shrink-0 wwc:text-[#111827] wwc:opacity-50 wwc:transition-opacity wwc:hover:opacity-100 wwc:focus-visible:outline-none"
					>
						<X className="wwc:size-4" />
					</button>
				</div>

				{/* Approved vs planned progress visual (two fills growing toward the centre) + variance badge */}
				<div className="wwc:relative wwc:flex wwc:items-start wwc:gap-1 wwc:overflow-hidden">
					{/* Approved (left) */}
					<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:p-3">
						<div className="wwc:absolute wwc:bottom-0 wwc:left-1/2 wwc:right-0 wwc:h-[23px] wwc:border-t wwc:border-[#4ade80] wwc:bg-gradient-to-b wwc:from-[rgba(74,222,128,0.1)] wwc:to-transparent" />
						<div className="wwc:relative wwc:flex wwc:h-16 wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-start">
							<span className="wwc:text-[20px] wwc:leading-[1.5] wwc:text-[#111827]">{p.approved}%</span>
							<span className="wwc:text-[10px] wwc:leading-[1.5] wwc:text-[#6b7280] wwc:opacity-90">Approved</span>
						</div>
					</div>
					{/* Planned (right) */}
					<div className="wwc:relative wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:overflow-hidden wwc:p-3">
						<div className="wwc:absolute wwc:bottom-0 wwc:left-0 wwc:right-1/2 wwc:h-[18px] wwc:border-t wwc:border-[#d1d5db] wwc:bg-gradient-to-b wwc:from-[#e5e7eb] wwc:to-transparent" />
						<div className="wwc:relative wwc:flex wwc:h-16 wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-end">
							<span className="wwc:text-[20px] wwc:leading-[1.5] wwc:text-[#111827]">{p.planned}%</span>
							<span className="wwc:text-[10px] wwc:leading-[1.5] wwc:text-[#6b7280] wwc:opacity-90">Planned</span>
						</div>
					</div>
					{/* Variance badge — centred near the top, green when ahead of plan */}
					<div className="wwc:absolute wwc:left-1/2 wwc:top-[17px] wwc:-translate-x-1/2 wwc:whitespace-nowrap wwc:text-[12px] wwc:text-[#166534]">
						{p.variance}% variance
					</div>
				</div>
			</div>

			{/* Body (scrolls) */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-1 wwc:overflow-y-auto">
				{/* Project summary + quick actions */}
				<div className={cn(CARD, "wwc:flex wwc:shrink-0 wwc:flex-col wwc:gap-2 wwc:p-3")}>
					<div className="wwc:flex wwc:flex-col wwc:gap-1">
						<div className="wwc:flex wwc:items-center wwc:gap-1">
							<span className="wwc:text-[13px] wwc:font-semibold wwc:text-[#111827]">Project Summary</span>
							<span className="wwc:flex-1 wwc:text-right wwc:text-[10px] wwc:text-[#6b7280]">{p.week}</span>
						</div>
						<p className="wwc:line-clamp-3 wwc:text-[13px] wwc:font-medium wwc:leading-[1.5] wwc:text-[#6b7280]">
							{p.summary}
						</p>
					</div>
					<SummaryButton className="wwc:w-full">Ask Capture</SummaryButton>
					<div className="wwc:flex wwc:gap-2">
						<SummaryButton className="wwc:flex-1" onClick={onPlayTimeline}>
							Play Timeline
						</SummaryButton>
						<SummaryButton className="wwc:flex-1" onClick={onReviewProgress}>
							Review Progress
						</SummaryButton>
					</div>
				</div>

				{/* Area + workers */}
				<div className="wwc:flex wwc:shrink-0 wwc:items-stretch wwc:gap-1">
					<StatCard icon={Ruler} value={p.area} unit="m²" />
					<StatCard icon={HardHat} value={p.workers} unit="workers" />
				</div>

				{/* Milestones */}
				<div className={cn(CARD, "wwc:flex wwc:shrink-0 wwc:flex-col wwc:overflow-hidden wwc:p-0")}>
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:border-b wwc:border-[#f3f4f6] wwc:bg-[#f9fafb] wwc:px-3 wwc:py-2 wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-[#9ca3af]">
						<span className="wwc:min-w-0 wwc:flex-1">Milestone</span>
						<span className="wwc:w-16 wwc:shrink-0">Actual</span>
						<span className="wwc:w-16 wwc:shrink-0">Planned</span>
					</div>
					{p.milestones.map((m, i) => (
						<div
							key={m.id}
							className={cn("wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2 wwc:text-[13px]", i % 2 === 1 && "wwc:bg-[#f9fafb]")}
						>
							<span className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2">
								<span className="wwc:size-2.5 wwc:shrink-0 wwc:rounded-full" style={{backgroundColor: m.color}} />
								<span className="wwc:font-semibold wwc:text-[#111827]">{m.id}</span>
							</span>
							<span className="wwc:w-16 wwc:shrink-0 wwc:tabular-nums wwc:text-[#9ca3af]">{m.actual ?? "—"}</span>
							<span className="wwc:w-16 wwc:shrink-0 wwc:tabular-nums wwc:text-[#111827]">{m.planned}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
