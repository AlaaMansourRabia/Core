import {cn} from "@core/core-utils";

// Thin progress bar anchored to the bottom edge of a relatively-positioned floor row.
export function FloorProgressBar({pct, showTrack, className}: {pct: number; showTrack?: boolean; className?: string}) {
	const width = Math.min(100, Math.max(0, Math.round(pct)));

	return (
		<div className={cn("wwc:absolute wwc:inset-x-0 wwc:bottom-0 wwc:flex wwc:items-center wwc:gap-px", className)}>
			<div className="wwc:h-0.5 wwc:shrink-0 wwc:bg-[#6b7280]" style={{width: `${width}%`}} />
			<div className="wwc:h-1 wwc:w-px wwc:shrink-0 wwc:rounded-full wwc:bg-[#6b7280]" />
			<div className={cn("wwc:h-0.5 wwc:min-w-px wwc:flex-1 wwc:bg-[#e5e7eb]", showTrack ? "" : "wwc:opacity-0")} />
		</div>
	);
}
