import {type LegendItem} from "../legend";
import {
	MILESTONE_COLOR_RAMP,
	MILESTONE_LABELS,
	MILESTONE_RANGES,
	MISSING_STYLE,
	OVERLAY_OPACITY,
	UNLINKED_STYLE,
	VARIANCE_STYLES,
} from "./milestone-ramp";

// Legend rows, sourced from the same ramp/state colours as the polygon fills. Swatch `opacity` mirrors
// each state's overlay opacity so the key reads like the villas on the plan.
export const PROGRESS_LEGEND_ITEMS: LegendItem[] = [
	{
		id: "ms35",
		label: MILESTONE_LABELS.ms35,
		description: MILESTONE_RANGES.ms35,
		color: MILESTONE_COLOR_RAMP.ms35,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "ms50",
		label: MILESTONE_LABELS.ms50,
		description: MILESTONE_RANGES.ms50,
		color: MILESTONE_COLOR_RAMP.ms50,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "ms65",
		label: MILESTONE_LABELS.ms65,
		description: MILESTONE_RANGES.ms65,
		color: MILESTONE_COLOR_RAMP.ms65,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "ms80",
		label: MILESTONE_LABELS.ms80,
		description: MILESTONE_RANGES.ms80,
		color: MILESTONE_COLOR_RAMP.ms80,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "ms95",
		label: MILESTONE_LABELS.ms95,
		description: MILESTONE_RANGES.ms95,
		color: MILESTONE_COLOR_RAMP.ms95,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "ms100",
		label: MILESTONE_LABELS.ms100,
		description: MILESTONE_RANGES.ms100,
		color: MILESTONE_COLOR_RAMP.ms100,
		opacity: OVERLAY_OPACITY,
	},
	{
		id: "missing",
		label: "Missing data",
		description: "Linked, no progress",
		color: MISSING_STYLE.fill,
		borderColor: MISSING_STYLE.stroke,
		opacity: MISSING_STYLE.opacity,
	},
	{
		id: "unlinked",
		label: "Unlinked",
		description: "No LBS link",
		color: UNLINKED_STYLE.fill,
		borderColor: UNLINKED_STYLE.stroke,
		opacity: UNLINKED_STYLE.opacity,
	},
];

export const VARIANCE_LEGEND_ITEMS: LegendItem[] = [
	{
		id: "behind",
		label: "Behind",
		description: "> 2.5% behind plan",
		color: VARIANCE_STYLES.behind.fill,
		opacity: VARIANCE_STYLES.behind.opacity,
	},
	{
		id: "onTrack",
		label: "On track",
		description: "within ±2.5%",
		color: VARIANCE_STYLES.onTrack.fill,
		opacity: VARIANCE_STYLES.onTrack.opacity,
	},
	{
		id: "ahead",
		label: "Ahead",
		description: "> 2.5% ahead",
		color: VARIANCE_STYLES.ahead.fill,
		opacity: VARIANCE_STYLES.ahead.opacity,
	},
	{
		id: "missing",
		label: "Missing data",
		description: "No approved/planned",
		color: VARIANCE_STYLES.missingData.fill,
		opacity: VARIANCE_STYLES.missingData.opacity,
	},
	{
		id: "unlinked",
		label: "Unlinked",
		description: "No LBS link",
		color: UNLINKED_STYLE.fill,
		borderColor: UNLINKED_STYLE.stroke,
		opacity: UNLINKED_STYLE.opacity,
	},
];
