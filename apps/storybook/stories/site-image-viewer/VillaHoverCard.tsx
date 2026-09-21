import type {CSSProperties} from "react";

import {ProgressComparison} from "@wakecap/core-ui/progress-comparison";

import {approvedProgressToBucket, bucketLabel, classifyVariance, styleForVilla} from "./milestone-ramp";
import type {MapMode, Villa} from "./siteViewData";

const VARIANCE_LABELS: Record<ReturnType<typeof classifyVariance>, string> = {
	behind: "Behind",
	onTrack: "On track",
	ahead: "Ahead",
	missingData: "Missing data",
};

/**
 * The floating progress card shown while hovering a villa. Wraps the design-system `ProgressComparison`
 * (the same component the origin's card wraps) — Approved vs Planned with a variance pill and a status
 * chip filled with the villa's ramp colour. `pointer-events-none` so it never steals the hover.
 */
export function VillaHoverCard({villa, mapMode, style}: {villa: Villa; mapMode: MapMode; style: CSSProperties}) {
	const approved = villa.approvedProgressPercent ?? 0;
	const planned = villa.plannedProgressPercent ?? 0;
	const swatch = styleForVilla(villa, mapMode);

	const statusLabel =
		mapMode === "progress"
			? villa.approvedProgressPercent == null
				? "Missing data"
				: bucketLabel(approvedProgressToBucket(approved))
			: VARIANCE_LABELS[classifyVariance(villa.approvedProgressPercent, villa.plannedProgressPercent)];

	return (
		<div className="wwc:pointer-events-none wwc:absolute wwc:z-20" style={style}>
			<ProgressComparison
				className="wwc:w-96 wwc:shadow-lg"
				title={villa.name}
				subtitle={`Plot ${villa.plotNumber}`}
				primary={{label: "Approved", value: approved}}
				secondary={{label: "Planned", value: planned}}
				variance={Math.round((approved - planned) * 10) / 10}
				status={{label: statusLabel, color: swatch.fill}}
				stats={[]}
			/>
		</div>
	);
}
