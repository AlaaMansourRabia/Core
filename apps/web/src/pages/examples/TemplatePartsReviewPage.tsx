// TEMP REVIEW PAGE — the pieces of Blueprint Viewer #3 and the 3D Model Viewer that were promoted into
// the design system, each rendered in isolation via the REAL new component. Pieces 4 & 5 remain
// hand-rolled (not part of this extraction) and are shown for context.
import {ChevronDown, Maximize2, PanelRight, X} from "lucide-react";
import {useState} from "react";

import {BlueprintSegment} from "@/components/ui/blueprint-segment";
import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {BuildingModelPlaceholder} from "@/components/ui/building-model-placeholder";
import {type BuildingFloor, BuildingProgress} from "@/components/ui/building-progress";
import {Button} from "@/components/ui/button";
import {CanvasHeader} from "@/components/ui/canvas-header";
import {CompareBars} from "@/components/ui/compare-bars";
import {type MilestoneRow, MilestoneTable} from "@/components/ui/milestone-table";
import {type WeekSelectorWeek} from "@/components/ui/week-selector";

const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

const HOUSE = {label: "HOUSE-A01", zoneLabel: "Zone A — Waterfront", approved: 83, planned: 89};

type Floor = BuildingFloor & {name: string; hasBlueprint: boolean};
const FLOORS: Floor[] = [
	{id: "rf", label: "RF", name: "Roof", value: 55, hasBlueprint: true},
	{id: "l8", label: "L8", name: "Level 8", value: 62, hasBlueprint: true},
	{id: "l7", label: "L7", name: "Level 7", value: 68, hasBlueprint: false},
	{id: "l6", label: "L6", name: "Level 6", value: 73, hasBlueprint: true},
	{id: "l3", label: "L3", name: "Level 3", value: 90, hasBlueprint: true},
	{id: "gf", label: "GF", name: "Ground Floor", value: 100, hasBlueprint: true},
	{id: "b1", label: "B1", name: "Basement", value: 100, hasBlueprint: true},
];

const MILESTONES: MilestoneRow[] = [
	{id: "M35", color: "#7c3aed", actual: "Aug-26", planned: "Sep-26"},
	{id: "M50", color: "#2563eb", actual: "Nov-26", planned: "Dec-26"},
	{id: "M65", color: "#38bdf8", actual: "Jan-27", planned: "Feb-27"},
	{id: "M80", color: "#5eead4", actual: null, planned: "May-27"},
	{id: "M95", color: "#01b04a", actual: null, planned: "Nov-27"},
	{id: "M100", color: "#42ff01", actual: null, planned: "Dec-27"},
];

const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

// A mock architectural floor plan (the "plan" content passed into a BlueprintSegment).
function FloorPlan() {
	return (
		<svg
			viewBox="0 0 1000 680"
			preserveAspectRatio="xMidYMid meet"
			className="wwc:h-full wwc:w-full"
			role="img"
			aria-label="Floor plan"
		>
			<rect x="0" y="0" width="1000" height="680" fill="#ffffff" />
			<rect x="60" y="60" width="880" height="560" fill="none" stroke="#3f3f46" strokeWidth="4" />
			<g fill="none" stroke="#52525b" strokeWidth="2">
				<rect x="60" y="320" width="880" height="60" />
				<rect x="240" y="60" width="220" height="260" />
				<rect x="460" y="60" width="300" height="130" />
				<rect x="760" y="380" width="180" height="240" />
				<line x1="350" y1="60" x2="350" y2="320" />
			</g>
		</svg>
	);
}

// 1 · Canvas header → now the CanvasHeader widget (with its built-in weekSelector).
function CanvasHeaderDemo() {
	const [week, setWeek] = useState("W112");
	return (
		<CanvasHeader
			className="wwc:rounded-lg wwc:border"
			left={
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="#">Riverside Compound</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbEllipsis items={[{label: HOUSE.zoneLabel}]} />
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbLink href="#">{HOUSE.label}</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Ground Floor</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			}
			weekSelector={{weeks: WEEKS, value: week, onValueChange: setWeek, visibleCount: 4}}
			right={
				<Button type="button" variant="outline" icon size="sm" aria-label="Full screen" className="wwc:shrink-0">
					<Maximize2 className="wwc:h-4 wwc:w-4" />
				</Button>
			}
		/>
	);
}

// 4 · "Progress by floor" collapsible (NOT extracted — hand-rolled toggle wrapping BuildingProgress).
function ProgressByFloor() {
	const [open, setOpen] = useState(true);
	const [active, setActive] = useState("gf");
	return (
		<div className="wwc:flex wwc:w-72 wwc:flex-col wwc:gap-2.5 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
			<button
				type="button"
				aria-expanded={open}
				onClick={() => setOpen((v) => !v)}
				className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:text-left wwc:focus-visible:outline-none"
			>
				<span className="wwc:text-[13px] wwc:font-semibold wwc:text-foreground">Progress by floor</span>
				<ChevronDown
					className={`wwc:size-3.5 wwc:text-muted-foreground wwc:transition-transform ${open ? "" : "wwc:-rotate-90"}`}
				/>
			</button>
			{open && <BuildingProgress floors={FLOORS} activeId={active} onFloorSelect={setActive} size="compact" />}
		</div>
	);
}

// 5 · Details-panel shell (NOT extracted — the closable right <aside> chrome).
function DetailsPanelShell() {
	const [open, setOpen] = useState(true);
	if (!open) {
		return (
			<Button
				type="button"
				variant="outline"
				size="sm"
				className={`wwc:gap-1.5 ${FLOAT_SHADOW}`}
				onClick={() => setOpen(true)}
			>
				<PanelRight className="wwc:size-4" />
				Show details
			</Button>
		);
	}
	return (
		<aside
			className={`wwc:flex wwc:h-[300px] wwc:w-72 wwc:shrink-0 wwc:flex-col wwc:rounded-lg wwc:border wwc:border-border wwc:bg-white dark:wwc:bg-zinc-950 ${FLOAT_SHADOW}`}
		>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:p-3">
				<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">{HOUSE.label}</span>
				<button
					type="button"
					aria-label="Close panel"
					className="wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:focus-visible:outline-none"
					onClick={() => setOpen(false)}
				>
					<X className="wwc:size-3.5" />
				</button>
			</div>
			<div className="wwc:h-px wwc:w-full wwc:bg-border" />
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:overflow-y-auto wwc:p-3 wwc:text-center wwc:text-xs wwc:text-muted-foreground">
				<span className="wwc:my-auto">Scrollable body — holds CompareBars + MilestoneTable + Progress by floor.</span>
			</div>
		</aside>
	);
}

function Section({tag, title, note, children}: {tag: string; title: string; note: string; children: React.ReactNode}) {
	const shared = tag === "SHARED";
	const extracted = !tag.includes("NOT");
	return (
		<section className="wwc:rounded-xl wwc:border wwc:border-border wwc:bg-card wwc:p-5">
			<div className="wwc:mb-3 wwc:flex wwc:items-center wwc:gap-2">
				<span
					className={`wwc:rounded wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-bold wwc:uppercase wwc:tracking-wide ${
						!extracted
							? "wwc:bg-muted wwc:text-muted-foreground"
							: shared
								? "wwc:bg-emerald-500/15 wwc:text-emerald-700"
								: "wwc:bg-sky-500/15 wwc:text-sky-700"
					}`}
				>
					{tag}
				</span>
				<h3 className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{title}</h3>
			</div>
			<p className="wwc:mb-4 wwc:text-xs wwc:text-muted-foreground">{note}</p>
			<div className="wwc:rounded-lg wwc:bg-muted/30 wwc:p-4">{children}</div>
		</section>
	);
}

export function TemplatePartsReviewPage() {
	const [activeFloor, setActiveFloor] = useState("gf");
	return (
		<div className="wwc:space-y-6">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Template Parts — Now Components</h1>
				<p className="wwc:mt-2 wwc:max-w-3xl wwc:text-muted-foreground">
					The extracted pieces of Blueprint Viewer #3 and the 3D Model Viewer, each rendered via its{" "}
					<span className="wwc:font-semibold wwc:text-emerald-700">real new @core/core-ui component</span>. Pieces 4
					&amp; 5 were <span className="wwc:font-semibold wwc:text-muted-foreground">not part of this extraction</span>{" "}
					and stay hand-rolled (shown for context).
				</p>
			</div>

			<Section
				tag="CanvasHeader"
				title="1 · Metric-bar header"
				note="Now `CanvasHeader` — left / center / right clusters on a 3-column grid."
			>
				<CanvasHeaderDemo />
			</Section>

			<div className="wwc:grid wwc:gap-6 wwc:lg:grid-cols-2">
				<Section
					tag="CompareBars"
					title="2 · Progress-comparison block"
					note="Now the `CompareBars` primitive; `ProgressComparison` composes it for its hero."
				>
					<div className="wwc:w-72 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
						<CompareBars
							primary={{label: "Approved", value: HOUSE.approved}}
							secondary={{label: "Planned", value: HOUSE.planned}}
						/>
					</div>
				</Section>
				<Section
					tag="MilestoneTable"
					title="3 · Milestones collapsible table"
					note="Now the `MilestoneTable` component (collapsible; swatch / actual / planned)."
				>
					<div className="wwc:w-72 wwc:rounded-lg wwc:border wwc:border-border wwc:p-3">
						<MilestoneTable milestones={MILESTONES} />
					</div>
				</Section>
				<Section
					tag="NOT EXTRACTED"
					title="4 · “Progress by floor” collapsible"
					note="Hand-rolled toggle wrapping the real BuildingProgress — not part of this extraction."
				>
					<ProgressByFloor />
				</Section>
				<Section
					tag="NOT EXTRACTED"
					title="5 · Details-panel shell"
					note="The closable right aside chrome — not part of this extraction."
				>
					<DetailsPanelShell />
				</Section>
			</div>

			<Section
				tag="BlueprintSegment"
				title="7 · Blueprint segment"
				note="Now the `BlueprintSegment` widget — plan (or “No blueprint”) + label chip + walk-through button."
			>
				<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-3">
					<BlueprintSegment className="wwc:h-56" label="GF" value={100} plan={<FloorPlan />} onWalkthrough={() => {}} />
					<BlueprintSegment className="wwc:h-56" label="L6" value={73} plan={<FloorPlan />} onWalkthrough={() => {}} />
					<BlueprintSegment className="wwc:h-56" label="L7" value={68} />
				</div>
			</Section>

			<Section
				tag="BuildingModelPlaceholder"
				title="8 · 3D building placeholder"
				note="Now the `BuildingModelPlaceholder` component — drag to orbit, click a floor to select. The fallback when no BIM model is available."
			>
				<div className="wwc:h-80 wwc:overflow-hidden wwc:rounded-lg wwc:border">
					<BuildingModelPlaceholder floors={FLOORS} activeId={activeFloor} onFloorSelect={setActiveFloor} />
				</div>
			</Section>
		</div>
	);
}
