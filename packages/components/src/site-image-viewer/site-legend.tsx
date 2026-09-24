import {cn} from "@corensystem/coren-utils";
import {ChevronDown} from "lucide-react";
import {useState} from "react";

import {type LegendItem} from "../legend";
import {PROGRESS_LEGEND_ITEMS, VARIANCE_LEGEND_ITEMS} from "./legend-items";
import type {MapMode} from "./types";

/** The non-ramp states rendered as footnotes rather than ramp segments. */
const FOOTNOTE_IDS = new Set(["missing", "unlinked"]);

interface Mode {
	id: MapMode;
	/** Segmented-toggle label. */
	label: string;
	/** Uppercase header, left. */
	title: string;
	/** Muted caption, right. */
	caption: string;
	items: LegendItem[];
}

const MODES: Mode[] = [
	{
		id: "progress",
		label: "SPA",
		title: "Approved progress",
		caption: "milestone buckets",
		items: PROGRESS_LEGEND_ITEMS,
	},
	{id: "variance", label: "Progress", title: "Variance", caption: "vs plan (±2.5%)", items: VARIANCE_LEGEND_ITEMS},
];

export interface SiteLegendProps {
	value: MapMode;
	onValueChange: (mode: MapMode) => void;
	className?: string;
	/** Start collapsed to a small "Legend" pill (click to expand). Default true. */
	defaultCollapsed?: boolean;
	/** Show the SPA/Construction segmented toggle inside the legend. Default true. */
	showModeToggle?: boolean;
}

/**
 * The Site Image Viewer legend: a SPA/Construction segmented toggle, a header (title · caption), the
 * colour ramp laid out horizontally with a label under each bucket, and the non-ramp states as footnotes.
 * Built from Core semantic tokens; the swatch colours come from the milestone/variance ramp data.
 * Collapsible — collapsed by default to a small "Legend" pill; click to expand.
 */
export function SiteLegend({
	value,
	onValueChange,
	className,
	defaultCollapsed = true,
	showModeToggle = true,
}: SiteLegendProps) {
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const mode = MODES.find((m) => m.id === value) ?? MODES[0];
	const ramp = mode.items.filter((i) => !FOOTNOTE_IDS.has(i.id));
	const footnotes = mode.items.filter((i) => FOOTNOTE_IDS.has(i.id));

	if (collapsed) {
		return (
			<button
				type="button"
				aria-expanded={false}
				onClick={() => setCollapsed(false)}
				className={cn(
					"wwc:flex wwc:items-center wwc:gap-2 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:px-3 wwc:py-2 wwc:text-sm wwc:font-medium wwc:shadow-lg wwc:backdrop-blur-sm wwc:transition-colors wwc:hover:bg-accent",
					className,
				)}
			>
				Legend
			</button>
		);
	}

	return (
		<div
			className={cn(
				"wwc:w-[320px] wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:p-3 wwc:shadow-lg wwc:backdrop-blur-sm",
				className,
			)}
		>
			{/* Collapse control */}
			<div className="wwc:mb-2 wwc:flex wwc:items-center wwc:justify-between">
				<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					Legend
				</span>
				<button
					type="button"
					aria-label="Collapse legend"
					onClick={() => setCollapsed(true)}
					className="wwc:rounded wwc:p-0.5 wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground"
				>
					<ChevronDown className="wwc:size-4" />
				</button>
			</div>

			{/* Segmented mode toggle */}
			{showModeToggle ? (
				<div className="wwc:flex wwc:w-full wwc:gap-1 wwc:rounded-md wwc:bg-muted wwc:p-1">
					{MODES.map((m) => (
						<button
							key={m.id}
							type="button"
							aria-pressed={m.id === value}
							onClick={() => onValueChange(m.id)}
							className={cn(
								"wwc:flex-1 wwc:rounded wwc:px-2 wwc:py-1 wwc:text-sm wwc:font-medium wwc:transition-colors",
								m.id === value
									? "wwc:bg-background wwc:text-foreground wwc:shadow-sm"
									: "wwc:text-muted-foreground wwc:hover:text-foreground",
							)}
						>
							{m.label}
						</button>
					))}
				</div>
			) : null}

			{/* Header row */}
			<div className="wwc:mt-3 wwc:flex wwc:items-center wwc:justify-between">
				<span className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					{mode.title}
				</span>
				<span className="wwc:text-xs wwc:text-muted-foreground">{mode.caption}</span>
			</div>

			{/* Colour ramp — a bucket per segment with its label underneath. Segments keep a hair gap, but the
			    corners are square except the outer ends (left of the first, right of the last). */}
			<div className="wwc:mt-2 wwc:flex wwc:w-full wwc:gap-0.5">
				{ramp.map((b, i) => (
					<div key={b.id} className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:items-center wwc:gap-1">
						<span
							className={cn(
								"wwc:h-3 wwc:w-full",
								i === 0 && "wwc:rounded-l-sm",
								i === ramp.length - 1 && "wwc:rounded-r-sm",
							)}
							style={{backgroundColor: b.color, opacity: b.opacity}}
						/>
						<span className="wwc:w-full wwc:truncate wwc:text-center wwc:text-[11px] wwc:font-medium wwc:text-foreground">
							{b.label}
						</span>
					</div>
				))}
			</div>

			{/* Separator */}
			<div className="wwc:my-3 wwc:h-px wwc:w-full wwc:bg-border" />

			{/* Footnotes — the non-ramp states */}
			<div className="wwc:flex wwc:flex-row wwc:flex-wrap wwc:gap-x-4 wwc:gap-y-1.5">
				{footnotes.map((f) => (
					<span key={f.id} className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:text-muted-foreground">
						<span
							className="wwc:size-2.5 wwc:rounded-sm"
							style={{
								backgroundColor: f.color,
								opacity: f.opacity,
								border: f.borderColor ? `1px solid ${f.borderColor}` : undefined,
							}}
						/>
						{f.label}
					</span>
				))}
			</div>
		</div>
	);
}
