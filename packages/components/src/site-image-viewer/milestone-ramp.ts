// SHA-1036 milestone colour ramp + variance classification — the load-bearing design decision for the
// site view. These exact hexes + strict-`>` breakpoints are duplicated across the shape fill, the
// hover-card status chip, and the legend, and MUST stay identical.

export const MILESTONE_COLOR_RAMP = {
	ms35: "#93C5FD", // light blue   (0–35%)
	ms50: "#3B82F6", // blue         (>35–50%)
	ms65: "#FACC15", // yellow       (>50–65%)
	ms80: "#84CC16", // lime         (>65–80%)
	ms95: "#22C55E", // green        (>80–95%)
	ms100: "#15803D", // dark green  (>95%)
} as const;

export type MilestoneBucket = keyof typeof MILESTONE_COLOR_RAMP;

/** Progress % → ramp bucket. Strict `>` comparisons: exactly 35 → ms35, 35.1 → ms50, 100 → ms100. */
export function approvedProgressToBucket(percent: number): MilestoneBucket {
	if (percent > 95) return "ms100";
	if (percent > 80) return "ms95";
	if (percent > 65) return "ms80";
	if (percent > 50) return "ms65";
	if (percent > 35) return "ms50";
	return "ms35";
}

/**
 * Label shown for each bucket — the milestone the villa has REACHED, not the bucket ceiling. A villa in the
 * >35–50% band has passed the M35 milestone (but not M50), so it reads "M35"; anything below the first
 * milestone reads "<M35". This is the single source of truth for the legend, distribution, filter and hover.
 */
export const MILESTONE_LABELS: Record<MilestoneBucket, string> = {
	ms35: "<M35",
	ms50: "M35",
	ms65: "M50",
	ms80: "M65",
	ms95: "M80",
	ms100: "M95",
};

/** The progress range each bucket covers (paired with MILESTONE_LABELS). */
export const MILESTONE_RANGES: Record<MilestoneBucket, string> = {
	ms35: "<35%",
	ms50: "35–50%",
	ms65: "50–65%",
	ms80: "65–80%",
	ms95: "80–95%",
	ms100: "95–100%",
};

/** Human label for a bucket, e.g. "M65". */
export function bucketLabel(b: MilestoneBucket): string {
	return MILESTONE_LABELS[b];
}

// Non-ramp states.
export const UNLINKED_STYLE = {
	fill: "#e5e7eb",
	stroke: "#71717a",
	opacity: 0.32,
} as const;
export const MISSING_STYLE = {
	fill: "#94a3b8",
	stroke: "#475569",
	opacity: 0.5,
} as const;

/** Overlay opacity for a coloured (linked, has-progress) villa. */
export const OVERLAY_OPACITY = 0.7;

/**
 * Uniform neutral fill used to HIDE progress colouring (e.g. on the parent grouping levels — phase / zone /
 * batch / block) while the underlying progress values stay intact. Every polygon renders this one grey
 * regardless of progress or link state.
 */
export const MONOCHROME_STYLE = {
	fill: "#9ca3af", // zinc-400
	stroke: "#6b7280", // zinc-500
	opacity: OVERLAY_OPACITY,
} as const;

// ---- Variance mode (mapMode === "variance") ----
export const VARIANCE_ON_TRACK_THRESHOLD_PERCENT = 2.5;
export const VARIANCE_STYLES = {
	behind: {fill: "#ef4444", stroke: "#b91c1c", opacity: 0.7},
	onTrack: {fill: "#0ea5e9", stroke: "#0369a1", opacity: 0.68},
	ahead: {fill: "#22c55e", stroke: "#15803d", opacity: 0.7},
	missingData: {fill: "#94a3b8", stroke: "#475569", opacity: 0.5},
} as const;

export function classifyVariance(
	approved: number | null | undefined,
	planned: number | null | undefined,
): keyof typeof VARIANCE_STYLES {
	if (approved == null || planned == null) return "missingData";
	const variance = approved - planned;
	if (variance < -VARIANCE_ON_TRACK_THRESHOLD_PERCENT) return "behind";
	if (variance > VARIANCE_ON_TRACK_THRESHOLD_PERCENT) return "ahead";
	return "onTrack";
}

export type ShapeStyle = {fill: string; stroke: string; opacity: number};

/** The single resolver a villa polygon uses for its fill/stroke/opacity. */
export function styleForVilla(
	villa: {
		linkedLbsItemId: number | null;
		approvedProgressPercent: number | null;
		plannedProgressPercent?: number | null;
	},
	mapMode: "progress" | "variance" = "progress",
): ShapeStyle {
	if (villa.linkedLbsItemId == null) return {...UNLINKED_STYLE};
	if (mapMode === "variance") {
		return {
			...VARIANCE_STYLES[classifyVariance(villa.approvedProgressPercent, villa.plannedProgressPercent)],
		};
	}
	if (villa.approvedProgressPercent == null) return {...MISSING_STYLE};
	const hex = MILESTONE_COLOR_RAMP[approvedProgressToBucket(villa.approvedProgressPercent)];
	return {fill: hex, stroke: hex, opacity: OVERLAY_OPACITY};
}
