// Deterministic, dependency-free placeholder for template PREVIEW stories — used in place of live
// Mapbox tiles so Chromatic snapshots stay stable. Pure CSS, no network, timers, or animation.
// (Charts use the real ChartContainer with animation:false, not a placeholder.)

import {MapPin} from "lucide-react";

/** A static stand-in for a live map region (no Mapbox). */
export function MapPlaceholder({label = "Map preview (static)"}: {label?: string}) {
	return (
		<div className="wwc:relative wwc:flex-1 wwc:min-h-0 wwc:bg-muted wwc:flex wwc:items-center wwc:justify-center wwc:overflow-hidden">
			<div
				aria-hidden
				className="wwc:absolute wwc:inset-0 wwc:opacity-60"
				style={{
					backgroundImage:
						"linear-gradient(#e7e5e4 1px, transparent 1px), linear-gradient(90deg, #e7e5e4 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div className="wwc:relative wwc:flex wwc:flex-col wwc:items-center wwc:gap-2 wwc:text-muted-foreground">
				<MapPin className="wwc:h-6 wwc:w-6" />
				<span className="wwc:text-xs">{label}</span>
			</div>
		</div>
	);
}
