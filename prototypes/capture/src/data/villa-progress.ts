// Villa progress → colour assignment (data + lookup only; no map/3D/overlay rendering here).
//
// OFFLINE BY DESIGN: colours must render with the network fully off. The dataset is a
// STATIC IMPORT baked into the bundle (below), and `progressToColor()` is a pure ramp
// lookup with no I/O. Never `fetch()` colours at runtime — the bundled snapshot is the
// source of truth. (Optional online refresh is described at the bottom of this file.)
//
// SNAPSHOT: point-in-time data, not live — period 111, ending 2026-07-03. Exported from the
// Core Capture owner dashboard for all 733 villas, keyed by `{model}-{plot}` (e.g. VL4-2275).

import rawData from "./villa-progress-colors.json";

/** Core official milestone colour band. */
export type ProgressBand = "<M35" | "M35" | "M50" | "M65" | "M80" | "M95";

/** A ramp stop: villas with actual% in `[prevUpTo, upToPercent)` get this band/colour. */
export interface RampStop {
	label: ProgressBand;
	upToPercent: number;
	color: string;
}

/** One villa's progress record, keyed by `{model}-{plot}` (e.g. "VL4-2275"). */
export interface VillaProgress {
	code: string;
	plot: string;
	model: string;
	unitCode: string;
	/** Actual construction progress, 0–100. */
	actual: number;
	/** Planned progress, 0–100. */
	planned: number;
	band: ProgressBand;
	color: string;
	contractor: string;
	zone: string;
}

interface VillaProgressDataset {
	meta: {metric: string; matchKey: string; ramp: RampStop[]};
	houses: Record<string, VillaProgress>;
}

// Cast the bundled JSON to its typed shape. The import (not a fetch) is what makes this
// work offline; the cast keeps the giant inferred literal from leaking into call sites.
const DATA = rawData as unknown as VillaProgressDataset;

/** Neutral grey for villas with no progress entry ("Unassigned"). Never guessed. */
export const UNASSIGNED_COLOR = "#9ca3af";

/**
 * Authoritative milestone colour ramp — copied verbatim from the Capture owner dashboard
 * (`PropertyBlueprintCanvas.tsx` → `PROPERTY_MILESTONE_COLOR_RAMP`). Do NOT invent your own.
 * Buckets ACTUAL %: each stop covers `[prev.upToPercent, upToPercent)`; the final stop is
 * inclusive of 100 (95–100 → M95).
 */
export const PROGRESS_RAMP: RampStop[] = [
	{label: "<M35", upToPercent: 35, color: "#93C5FD"},
	{label: "M35", upToPercent: 50, color: "#3B82F6"},
	{label: "M50", upToPercent: 65, color: "#FACC15"},
	{label: "M65", upToPercent: 80, color: "#84CC16"},
	{label: "M80", upToPercent: 95, color: "#22C55E"},
	{label: "M95", upToPercent: 100, color: "#15803D"},
];

/** Pure: bucket an actual-progress percentage (0–100) to its ramp stop. No I/O. */
export function progressToBand(actualPercent: number): RampStop {
	const pct = Number.isFinite(actualPercent) ? Math.min(100, Math.max(0, actualPercent)) : 0;
	return PROGRESS_RAMP.find((stop) => pct < stop.upToPercent) ?? PROGRESS_RAMP[PROGRESS_RAMP.length - 1];
}

/** Pure: actual-progress percentage → ramp colour (hex). Works for progress computed elsewhere too. */
export function progressToColor(actualPercent: number): string {
	return progressToBand(actualPercent).color;
}

/** Normalise a villa code to the dataset key form `{MODEL}-{plot}` (e.g. "VL4-2275"). */
function normalizeCode(code: string): string {
	return code.trim().toUpperCase();
}

/**
 * Look up a villa's bundled progress record by its `{model}-{plot}` code. Returns `undefined`
 * for villas with no entry — treat those as "Unassigned" ({@link UNASSIGNED_COLOR}), never a guess.
 *
 * `band`/`color` are (re)derived from the authoritative ramp via {@link progressToColor}, so the
 * result is always ramp-consistent even where the snapshot mis-bucketed a boundary value — e.g.
 * C10-2256 at actual 50.0 is stored M35 in the snapshot but is corrected to M50 here.
 */
export function getVillaProgress(code: string): VillaProgress | undefined {
	const entry = DATA.houses[normalizeCode(code)];
	if (!entry) return undefined;
	const stop = progressToBand(entry.actual);
	return {...entry, band: stop.label, color: stop.color};
}

/** Snapshot metadata (metric, matchKey, ramp) — e.g. for building a legend later. */
export const villaProgressMeta = DATA.meta;

/**
 * `{model}-{plot}` → authoritative ramp colour for every bundled villa. Handy for driving a bulk
 * overlay (e.g. posting the whole map to the site model to colour villas by progress). Built from
 * the offline snapshot; each colour is `progressToColor(actual)` so it matches the ramp exactly.
 */
export function villaColorMap(metric: "actual" | "planned" = "actual"): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [code, entry] of Object.entries(DATA.houses)) {
		out[code] = progressToColor(metric === "planned" ? entry.planned : entry.actual);
	}
	return out;
}

// ── Optional online refresh (NOT used for rendering) ─────────────────────────────────────
// The bundled snapshot above always renders offline. To freshen data when online you MAY
// fetch the live source and cache it (localStorage/IndexedDB), but colours must still resolve
// from the bundle first — an online refresh only *updates* a cache, it is never *required*.
// Live source: GET {API}/project/926c85f7-b5b5-450b-b12e-d1a5dd744109/reports/
//   updated-progress-by-villa/data?periodId=7752&page=N&pageSize=200
//   ({API} = https://test.services.core.com/capture/api; bearer token; paginate 733 rows).
// Bucket each row's `actualProgress` through progressToColor().
