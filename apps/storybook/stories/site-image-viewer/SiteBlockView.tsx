import {TabbedLegend} from "@corensystem/core-ui/legend";
import {cn} from "@corensystem/core-utils";
import {type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState} from "react";

import {type ShapeStyle, styleForVilla} from "./milestone-ramp";
import {type MapMode, PROGRESS_LEGEND_ITEMS, type Villa, VARIANCE_LEGEND_ITEMS, VILLAS} from "./siteViewData";
import {VillaHoverCard} from "./VillaHoverCard";

// Floating-card placement — same flip-and-clamp values as the image viewer (the card is 384×320; it
// flips to the other side of the cursor near an edge, then clamps inside the frame with an 8px margin).
const CARD_W = 384;
const CARD_H = 320;
const OFFSET = 14;
const MARGIN = 8;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function cardPosition(point: {x: number; y: number}, frameW: number, frameH: number) {
	const left = point.x + OFFSET + CARD_W + MARGIN > frameW ? point.x - CARD_W - OFFSET : point.x + OFFSET;
	const top = point.y + OFFSET + CARD_H + MARGIN > frameH ? point.y - CARD_H - OFFSET : point.y + OFFSET;
	return {
		left: clamp(left, MARGIN, Math.max(MARGIN, frameW - CARD_W - MARGIN)),
		top: clamp(top, MARGIN, Math.max(MARGIN, frameH - CARD_H - MARGIN)),
	};
}

/** The ramp fill as a translucent tint, so a coloured block reads like its villa on the plan. */
function tint(style: ShapeStyle): string {
	const h = style.fill.replace("#", "");
	const r = parseInt(h.slice(0, 2), 16);
	const g = parseInt(h.slice(2, 4), 16);
	const b = parseInt(h.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${style.opacity})`;
}

type Neighbourhood = {key: string; label: string; range: string; villas: Villa[]};

/**
 * Group the villas into neighbourhood blocks by the leading plot number in the villa name (e.g.
 * "2279 VL6-L" → band 22 → "Block 22", plots 2200–2299). Villas are deduped by their linked LBS item so
 * each real villa is one block, and blocks/villas are sorted for a stable layout.
 */
function toNeighbourhoods(villas: Villa[]): Neighbourhood[] {
	const seen = new Set<string>();
	const groups = new Map<number, Villa[]>();
	for (const villa of villas) {
		const dedupeKey = villa.linkedLbsItemId != null ? `lbs:${villa.linkedLbsItemId}` : `id:${villa.id}`;
		if (seen.has(dedupeKey)) continue;
		seen.add(dedupeKey);
		const lead = villa.name.match(/\d+/);
		const band = lead ? Math.floor(parseInt(lead[0], 10) / 100) : 0;
		let bucket = groups.get(band);
		if (!bucket) {
			bucket = [];
			groups.set(band, bucket);
		}
		bucket.push(villa);
	}
	return [...groups.entries()]
		.sort(([a], [b]) => a - b)
		.map(([band, list]) => ({
			key: String(band),
			label: `Block ${band}`,
			range: `Plots ${band}00–${band}99`,
			villas: list.slice().sort((a, b) => a.name.localeCompare(b.name)),
		}));
}

export interface SiteBlockViewProps {
	/** Villa data. Defaults to the bundled real ROSHN Almanar villas. */
	villas?: Villa[];
	/** Initial colour mode. `progress` = "SPA" ramp; `variance` = "Construction" ±plan. Default `progress`. */
	mapMode?: MapMode;
	/** Fired when a linked villa block is clicked, with its `linkedLbsItemId`. */
	onNavigate?: (lbsItemId: number) => void;
	/** Seed a hovered villa on mount (for the docs/preselected-hover story). */
	initialHoveredId?: number;
	className?: string;
}

/** One villa block tile — a rounded, progress-tinted card with the villa name + approved %. */
function VillaBlock({
	villa,
	mapMode,
	active,
	onHover,
	onLeave,
	onMove,
	onSelect,
}: {
	villa: Villa;
	mapMode: MapMode;
	active: boolean;
	onHover: (event: ReactMouseEvent) => void;
	onLeave: () => void;
	onMove: (event: ReactMouseEvent) => void;
	onSelect: () => void;
}) {
	const s = styleForVilla(villa, mapMode);
	const linked = villa.linkedLbsItemId != null;
	const approved = villa.approvedProgressPercent;
	return (
		<button
			type="button"
			data-villa-id={villa.id}
			onMouseEnter={onHover}
			onMouseMove={onMove}
			onMouseLeave={onLeave}
			onClick={onSelect}
			aria-label={villa.name}
			className={cn(
				"wwc:relative wwc:flex wwc:h-16 wwc:flex-col wwc:justify-end wwc:overflow-hidden wwc:rounded-md wwc:border wwc:p-1.5 wwc:text-left wwc:transition-all wwc:focus-visible:outline-none",
				active ? "wwc:-translate-y-0.5 wwc:ring-2 wwc:ring-foreground wwc:shadow-md" : "wwc:ring-0",
				linked ? "wwc:cursor-pointer" : "wwc:cursor-default",
			)}
			style={{backgroundColor: tint(s), borderColor: s.stroke}}
		>
			<span className="wwc:pointer-events-none wwc:flex wwc:flex-col wwc:gap-0.5 wwc:rounded wwc:bg-background/85 wwc:px-1.5 wwc:py-1 wwc:backdrop-blur-sm">
				<span className="wwc:truncate wwc:text-[11px] wwc:font-semibold wwc:leading-none wwc:text-foreground">
					{villa.name}
				</span>
				<span className="wwc:text-[10px] wwc:leading-none wwc:text-muted-foreground">
					{approved == null ? "No progress" : `${Math.round(approved)}% approved`}
				</span>
			</span>
		</button>
	);
}

/**
 * Site Block Viewer — the "No Assets" representation. Same chrome as the Site Image Viewer (hover
 * progress card + SPA/Construction legend/mode switch + milestone ramp) but with no aerial image and no
 * 3D: each villa is a progress-tinted block, and the blocks are organised into neighbourhood blocks on a
 * flat background. Hovering a villa raises its block and pops the floating progress card.
 */
export function SiteBlockView({
	villas = VILLAS,
	mapMode: mapModeProp = "progress",
	onNavigate,
	initialHoveredId,
	className,
}: SiteBlockViewProps) {
	const frameRef = useRef<HTMLDivElement>(null);
	const [mapMode, setMapMode] = useState<MapMode>(mapModeProp);
	const [hovered, setHovered] = useState<Villa | null>(() => villas.find((v) => v.id === initialHoveredId) ?? null);
	const [point, setPoint] = useState({x: 0, y: 0});
	const [frameSize, setFrameSize] = useState({w: 0, h: 0});

	useEffect(() => setMapMode(mapModeProp), [mapModeProp]);

	const neighbourhoods = useMemo(() => toNeighbourhoods(villas), [villas]);

	// Read the frame rect straight off the mouse event — both the pointer position (for the card) and the
	// frame size (for the clamp) come from the same getBoundingClientRect().
	const track = (event: ReactMouseEvent) => {
		const rect = frameRef.current?.getBoundingClientRect();
		if (!rect) return;
		setPoint({x: event.clientX - rect.left, y: event.clientY - rect.top});
		setFrameSize({w: rect.width, h: rect.height});
	};

	const pos = cardPosition(point, frameSize.w, frameSize.h);

	return (
		<div
			ref={frameRef}
			className={cn("wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden wwc:bg-muted", className)}
			onMouseLeave={() => setHovered(null)}
		>
			{/* Flat "site plan" board: a soft dotted grid, no image and no 3D — just the neighbourhood blocks. */}
			<div
				className="wwc:absolute wwc:inset-0"
				style={{
					backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)",
					backgroundSize: "22px 22px",
				}}
			/>

			<div className="wwc:absolute wwc:inset-0 wwc:overflow-auto wwc:p-6">
				<div className="wwc:mx-auto wwc:flex wwc:max-w-5xl wwc:flex-col wwc:gap-4">
					<div>
						<h2 className="wwc:text-lg wwc:font-semibold wwc:text-foreground">Site — Zone 1-A</h2>
						<p className="wwc:text-sm wwc:text-muted-foreground">
							{neighbourhoods.length} neighbourhood blocks ·{" "}
							{neighbourhoods.reduce((sum, n) => sum + n.villas.length, 0)} villas · progress-tinted, no assets
						</p>
					</div>

					<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-4">
						{neighbourhoods.map((n) => (
							<section key={n.key} className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background/70 wwc:p-3">
								<div className="wwc:mb-2 wwc:flex wwc:items-baseline wwc:justify-between wwc:gap-2">
									<span className="wwc:text-sm wwc:font-semibold wwc:text-foreground">{n.label}</span>
									<span className="wwc:text-[11px] wwc:text-muted-foreground">{n.villas.length}</span>
								</div>
								<div className="wwc:mb-2 wwc:text-[11px] wwc:text-muted-foreground">{n.range}</div>
								<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
									{n.villas.map((villa) => (
										<VillaBlock
											key={villa.id}
											villa={villa}
											mapMode={mapMode}
											active={hovered?.id === villa.id}
											onHover={(event) => {
												setHovered(villa);
												track(event);
											}}
											onMove={track}
											onLeave={() => setHovered(null)}
											onSelect={() => {
												if (villa.linkedLbsItemId != null) onNavigate?.(villa.linkedLbsItemId);
											}}
										/>
									))}
								</div>
							</section>
						))}
					</div>
				</div>
			</div>

			{hovered ? <VillaHoverCard villa={hovered} mapMode={mapMode} style={{left: pos.left, top: pos.top}} /> : null}

			<TabbedLegend
				className="wwc:absolute wwc:right-3 wwc:top-3 wwc:z-10"
				title="View mode"
				placement="static"
				value={mapMode}
				onValueChange={(value) => setMapMode(value as MapMode)}
				maxRows={8}
				tabs={[
					{id: "progress", label: "SPA", items: PROGRESS_LEGEND_ITEMS},
					{id: "variance", label: "Construction", items: VARIANCE_LEGEND_ITEMS},
				]}
			/>
		</div>
	);
}
