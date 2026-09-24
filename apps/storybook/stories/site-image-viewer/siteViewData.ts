import type {LegendItem} from "@corensystem/coren-ui/legend";

import {MILESTONE_COLOR_RAMP, MISSING_STYLE, OVERLAY_OPACITY, UNLINKED_STYLE, VARIANCE_STYLES} from "./milestone-ramp";
import villasRaw from "./villas.json";

export type MapMode = "progress" | "variance";

export type Villa = {
	id: number;
	linkedLbsItemId: number | null;
	name: string;
	plotNumber: string;
	type: "Polygon";
	/** Polygon vertices in image-pixel space (0..imageWidth × 0..imageHeight). */
	points: {x: number; y: number}[];
	/** Bounding box, image-pixel space — used to place the hover label. */
	x: number;
	y: number;
	width: number;
	height: number;
	approvedProgressPercent: number | null;
	plannedProgressPercent: number | null;
};

export type SiteMeta = {imageWidth: number; imageHeight: number; count: number};

const data = villasRaw as unknown as {villas: Villa[]; meta: SiteMeta};
export const VILLAS: Villa[] = data.villas;
export const SITE_META: SiteMeta = data.meta;

// Legend rows, sourced from the same ramp/state colours as the polygon fills (§5). Swatch `opacity`
// mirrors each state's overlay opacity so the key reads like the villas on the plan.
export const PROGRESS_LEGEND_ITEMS: LegendItem[] = [
	{id: "ms35", label: "M35", description: "0–35%", color: MILESTONE_COLOR_RAMP.ms35, opacity: OVERLAY_OPACITY},
	{id: "ms50", label: "M50", description: ">35–50%", color: MILESTONE_COLOR_RAMP.ms50, opacity: OVERLAY_OPACITY},
	{id: "ms65", label: "M65", description: ">50–65%", color: MILESTONE_COLOR_RAMP.ms65, opacity: OVERLAY_OPACITY},
	{id: "ms80", label: "M80", description: ">65–80%", color: MILESTONE_COLOR_RAMP.ms80, opacity: OVERLAY_OPACITY},
	{id: "ms95", label: "M95", description: ">80–95%", color: MILESTONE_COLOR_RAMP.ms95, opacity: OVERLAY_OPACITY},
	{id: "ms100", label: "M100", description: ">95%", color: MILESTONE_COLOR_RAMP.ms100, opacity: OVERLAY_OPACITY},
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
