import {useState} from "react";

import {CopyButton} from "@/components/ui/copy-button";
import {Legend, type LegendItem, type LegendTab, TabbedLegend} from "@/components/ui/legend";

const MILESTONES: LegendItem[] = [
	{id: "ms35", label: "M35", description: "Villa milestone", color: "#7C3AED"},
	{id: "ms50", label: "M50", description: "Villa milestone", color: "#2563EB"},
	{id: "ms65", label: "M65", description: "Villa milestone", color: "#38BDF8"},
	{id: "ms80", label: "M80", description: "Villa milestone", color: "#5EEAD4"},
	{id: "ms95", label: "M95", description: "Villa milestone", color: "#01B04A"},
	{id: "ms100", label: "M100", description: "Villa milestone", color: "#73F547"},
	{id: "missing", label: "Missing data", description: "No milestone data", color: "#94a3b8", opacity: 0.5},
];

const CHANGES: LegendItem[] = [
	{id: "added", label: "Added", color: "#16a34a"},
	{id: "changed", label: "Changed", color: "#f59e0b"},
	{id: "removed", label: "Removed", color: "#e11d48"},
];

const PROGRESS: LegendItem[] = [
	{id: "done", label: "Complete", description: "100% cast", color: "#01B04A"},
	{id: "wip", label: "In progress", description: "Active pour", color: "#2563EB"},
	{id: "planned", label: "Planned", description: "Not started", color: "#94a3b8"},
	{id: "delayed", label: "Delayed", description: "Behind plan", color: "#e11d48"},
];

const TRADES: LegendItem[] = [
	{id: "civil", label: "Civil", color: "#7C3AED"},
	{id: "mep", label: "MEP", color: "#f59e0b"},
	{id: "finishing", label: "Finishing", color: "#38BDF8"},
	{id: "structure", label: "Structure", color: "#01B04A"},
];

// Tabs for the tabbed legend — each tab keys a different overlay for the current selection.
const VIEW_TABS: LegendTab[] = [
	{id: "progress", label: "Progress", items: PROGRESS, footnote: "Cast status per villa polygon."},
	{id: "milestones", label: "Milestones", items: MILESTONES},
	{id: "trades", label: "Trades", items: TRADES},
];

// A faint blueprint-grid backdrop for the floating examples.
function Canvas({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:relative wwc:h-72 wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-blue-50 dark:wwc:bg-blue-950/40">
			<svg className="wwc:h-full wwc:w-full" aria-hidden="true">
				<defs>
					<pattern id="legend-grid" width="24" height="24" patternUnits="userSpaceOnUse">
						<path
							d="M 24 0 L 0 0 0 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="0.5"
							className="wwc:text-blue-300/50"
						/>
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#legend-grid)" />
			</svg>
			{children}
		</div>
	);
}

export function LegendPage() {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Legend</h1>
					<CopyButton
						value="Legend"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A compact key that maps swatch colors to labels. Floats over a canvas/map (bottom-right by default) or embeds
					inline (<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">placement="static"</code>),
					and can minimize to a small button. Swatch colors are arbitrary CSS values, so status ramps aren't limited to
					tokens.
				</p>
			</div>

			{/* Floating over a canvas */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Floating over a canvas</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Placed bottom-right over a canvas with a <code className="wwc:text-xs">footnote</code>. Click the minus to
						minimize it to a chip, then the chip to reopen.
					</p>
				</div>
				<Canvas>
					<Legend
						title="Villa milestones"
						items={MILESTONES}
						columns={2}
						collapsed={collapsed}
						onCollapsedChange={setCollapsed}
						footnote="Milestone months appear only on villa/plot polygons with milestone data."
					/>
				</Canvas>
			</section>

			{/* Tabbed legend */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Tabbed (view mode)</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						A collapsible header sits above WakeCore <code className="wwc:text-xs">Tabs</code>. Each tab swaps in its
						own colors and rows, so the legend re-keys itself based on what's selected. The list caps at four rows and
						overflows into extra columns, so it grows sideways instead of getting tall. Click the minus to minimize —
						the tab bar stays so you can switch views while collapsed, then hit the plus to expand and see the swatches.
					</p>
				</div>
				<Canvas>
					<TabbedLegend title="View mode" tabs={VIEW_TABS} defaultValue="milestones" />
				</Canvas>
			</section>

			{/* Variants */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Inline &amp; circle swatches</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						<code className="wwc:text-xs">placement="static"</code> embeds it inline;{" "}
						<code className="wwc:text-xs">shape="circle"</code> rounds the swatches. Set{" "}
						<code className="wwc:text-xs">collapsible=&#123;false&#125;</code> to always show it.
					</p>
				</div>
				<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:gap-6">
					<Legend title="What changed" shape="circle" placement="static" collapsible={false} items={CHANGES} />
					<Legend
						title="Milestones"
						placement="static"
						collapsible={false}
						columns={1}
						items={MILESTONES.slice(0, 4)}
						status="Loading…"
					/>
				</div>
			</section>
		</div>
	);
}
