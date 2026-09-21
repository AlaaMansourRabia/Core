import {cn} from "@wakecap/core-utils";
import {HardHat, type LucideIcon, Maximize2, Pause, Play, Ruler, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {ActivitiesTable, type Floor} from "./floor-panel";
import {ObjectInspectorCard, type ObjectSelection, useResolvedObject} from "./object-inspector";

// The frosted-glass card shell shared by the inspector's sections (matches the left panel / tabs).
const CARD =
	"wwc:rounded wwc:border wwc:border-[rgba(255,255,255,0.5)] wwc:bg-[rgba(255,255,255,0.8)] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg";
// The softer, borderless tiles (progress + floor plan) sit on a lighter fill.
const TILE =
	"wwc:overflow-hidden wwc:rounded wwc:bg-[rgba(255,255,255,0.6)] wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg";

const clampPct = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

// The floor walkthrough clip (served from public/videos). One clip stands in for every floor for now.
const WALKTHROUGH_SRC = "/videos/360firstfloor.mov";

/**
 * Compact walkthrough video filling the space beside the square progress tile: the site-capture clip
 * (autoplays, muted, looping at 0.5× for slow inspection). A play/pause button appears centred only on
 * hover; an expand-to-fullscreen control sits in the corner.
 */
function WalkthroughTile({className}: {className?: string}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [playing, setPlaying] = useState(false);

	const togglePlay = () => {
		const video = videoRef.current;
		if (!video) return;
		if (video.paused) void video.play();
		else video.pause();
	};

	return (
		<div ref={containerRef} className={cn("wwc:group wwc:relative wwc:overflow-hidden wwc:rounded wwc:bg-black", className)}>
			{/* biome-ignore lint/a11y/useMediaCaption: prototype walkthrough clip has no captions. */}
			<video
				ref={videoRef}
				src={WALKTHROUGH_SRC}
				autoPlay
				loop
				muted
				playsInline
				className="wwc:h-full wwc:w-full wwc:object-cover"
				onPlay={() => setPlaying(true)}
				onPause={() => setPlaying(false)}
				onLoadedMetadata={(event) => {
					// Play at half speed for slow inspection (autoplay otherwise starts at 1×).
					const video = event.currentTarget;
					video.defaultPlaybackRate = 0.5;
					video.playbackRate = 0.5;
				}}
			/>

			{/* Play / pause — centred, revealed only on hover (or keyboard focus). */}
			<button
				type="button"
				onClick={togglePlay}
				aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
				className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:flex wwc:size-9 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-black/55 wwc:text-white wwc:opacity-0 wwc:backdrop-blur wwc:transition-opacity wwc:group-hover:pointer-events-auto wwc:group-hover:opacity-100 wwc:focus-visible:pointer-events-auto wwc:focus-visible:opacity-100 wwc:focus-visible:outline-none"
			>
				{playing ? <Pause className="wwc:size-4" /> : <Play className="wwc:size-4" />}
			</button>

			<button
				type="button"
				onClick={() => void containerRef.current?.requestFullscreen?.()}
				aria-label="View capture fullscreen"
				className="wwc:absolute wwc:bottom-1.5 wwc:right-1.5 wwc:flex wwc:size-6 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-black/50 wwc:text-white wwc:backdrop-blur wwc:transition-colors wwc:hover:bg-black/70 wwc:focus-visible:outline-none"
			>
				<Maximize2 className="wwc:size-3.5" />
			</button>
		</div>
	);
}

/** A small stat tile: icon + bold value + muted unit (area, workers). */
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

/**
 * Right-side inspector. Floor mode (a floor selected, Figma node 1842:6101): floor header, a Floor
 * Progress % tile beside the walkthrough video, area + workers stats, and the schedule. Object mode (an
 * object selected on a non-Schedule tab): the object card replaces the floor top while the construction
 * schedule stays (filtered to the object's storey). On the Schedule tab the object card floats near the
 * object instead (see FloatingObjectCard); its active task is highlighted in the schedule either way.
 */
export function FloorInspector({
	floor,
	objectSel,
	onClose,
	onClearObject,
	onSelectObject,
}: {
	floor?: Floor;
	objectSel?: ObjectSelection | null;
	onClose?: () => void;
	onClearObject?: () => void;
	onSelectObject?: (objectId: string) => void;
}) {
	const objectInfo = useResolvedObject(objectSel ?? null);
	const inObjectMode = Boolean(objectSel && objectInfo);
	// In object mode, filter the schedule to the object's storey; if it didn't resolve (an off-schedule
	// model pick), fall back to the current floor's schedule rather than an empty "—" filter.
	const resolvedStorey = objectInfo && objectInfo.storey !== "—" ? objectInfo.storey : undefined;
	const scheduleStorey = inObjectMode ? (resolvedStorey ?? floor?.label) : floor?.label;
	const pct = floor ? clampPct(floor.value) : 0;

	// In object mode the schedule filters to just that object's activities; the chip's X clears the filter
	// (showing the storey again) without deselecting the object. A new object resets it back to filtered.
	const [filterToObject, setFilterToObject] = useState(true);
	useEffect(() => {
		setFilterToObject(true);
	}, [objectInfo?.id]);
	const scheduleObjectId = inObjectMode && filterToObject ? (objectInfo?.id ?? undefined) : undefined;

	return (
		<div className="wwc:flex wwc:h-full wwc:min-h-0 wwc:w-full wwc:flex-col wwc:gap-1 wwc:text-foreground">
			{/* Pinned top: the object card (object mode), else the floor header (floor mode). */}
			{inObjectMode && objectInfo ? (
				<ObjectInspectorCard info={objectInfo} onClose={onClearObject ?? (() => undefined)} />
			) : floor ? (
				<div className={cn(CARD, "wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:p-3")}>
					<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2">
						<span className="wwc:truncate wwc:text-[16px] wwc:font-semibold wwc:leading-tight wwc:text-[#374151]">
							{floor.label}
						</span>
						<span className="wwc:flex-1 wwc:text-right wwc:text-[10px] wwc:text-[#6b7280]">Updated {floor.updatedAgo}</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close inspector"
						className="wwc:shrink-0 wwc:text-[#111827] wwc:opacity-50 wwc:transition-opacity wwc:hover:opacity-100 wwc:focus-visible:outline-none"
					>
						<X className="wwc:size-4" />
					</button>
				</div>
			) : null}

			{/* Body (scrolls). Floor mode adds progress/video/stats; both modes keep the schedule. */}
			<div className="wwc:flex wwc:min-h-0 wwc:flex-1 wwc:flex-col wwc:gap-1 wwc:overflow-y-auto">
				{!inObjectMode && floor && (
					<>
						{/* Floor progress % (perfect square) + walkthrough video (fills the remaining space) */}
						<div className="wwc:flex wwc:shrink-0 wwc:items-stretch wwc:gap-1">
							<div
								className={cn(TILE, "wwc:relative wwc:flex wwc:size-[136px] wwc:shrink-0 wwc:flex-col wwc:justify-between wwc:p-3")}
							>
								{/* Blurred fill: green at the top fading to transparent, its green top-line at the % height. */}
								<div
									className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:bottom-0 wwc:border-t wwc:border-[#4ade80] wwc:bg-gradient-to-b wwc:from-[rgba(74,222,128,0.35)] wwc:to-transparent wwc:blur-[6px]"
									style={{height: `${pct}%`}}
								/>
								<div className="wwc:relative wwc:flex wwc:flex-col">
									<span className="wwc:text-[12px] wwc:text-[#9ca3af]">Floor Progress</span>
									<span className="wwc:text-[13px] wwc:font-medium wwc:text-[#374151]">Actual</span>
								</div>
								<span className="wwc:relative wwc:text-[29px] wwc:leading-none wwc:text-[#030712]">
									{pct}
									<span className="wwc:text-[#6b7280]">%</span>
								</span>
							</div>
							<WalkthroughTile className="wwc:min-w-0 wwc:flex-1" />
						</div>

						{/* Area + workers */}
						<div className="wwc:flex wwc:shrink-0 wwc:items-stretch wwc:gap-1">
							<StatCard icon={Ruler} value={floor.area.split(/\s+/)[0]} unit="m²" />
							<StatCard icon={HardHat} value={floor.crew} unit="workers on site" />
						</div>
					</>
				)}

				{/* Construction schedule. In object mode a chip filters it to that object's activities (clearable). */}
				<div className="wwc:flex wwc:min-h-0 wwc:shrink-0 wwc:flex-col wwc:gap-1">
					{scheduleObjectId && objectInfo && (
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1.5 wwc:px-0.5">
							<span className="wwc:shrink-0 wwc:text-[11px] wwc:text-[#9ca3af]">Filtered to</span>
							<span className="wwc:inline-flex wwc:min-w-0 wwc:items-center wwc:gap-1 wwc:rounded wwc:border wwc:border-[#e5e7eb] wwc:bg-white wwc:py-0.5 wwc:pl-1.5 wwc:pr-1 wwc:text-[12px] wwc:font-medium wwc:text-[#374151]">
								<span className="wwc:truncate">{objectInfo.category}</span>
								<button
									type="button"
									onClick={() => setFilterToObject(false)}
									aria-label="Clear object filter"
									className="wwc:shrink-0 wwc:text-[#6b7280] wwc:transition-colors wwc:hover:text-[#111827] wwc:focus-visible:outline-none"
								>
									<X className="wwc:size-3" />
								</button>
							</span>
						</div>
					)}
					<ActivitiesTable
						key={scheduleStorey ?? "all"}
						title="Construction Schedule"
						only={scheduleStorey}
						objectId={scheduleObjectId}
						highlightTaskId={objectInfo?.activeTaskId ?? null}
						onSelectObject={onSelectObject}
					/>
				</div>
			</div>
		</div>
	);
}
