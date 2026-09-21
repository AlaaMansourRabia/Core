import {describe, expect, test} from "vitest";

import {
	getVillaProgress,
	PROGRESS_RAMP,
	progressToBand,
	progressToColor,
	UNASSIGNED_COLOR,
	villaProgressMeta,
} from "./villa-progress";
import rawData from "./villa-progress-colors.json";

describe("progressToColor ramp bucketing", () => {
	// The boundary cases called out in the spec, plus each band's colour.
	test.each([
		[34.9, "<M35", "#93C5FD"],
		[35, "M35", "#3B82F6"],
		[49.9, "M35", "#3B82F6"],
		[50, "M50", "#FACC15"],
		[64.9, "M50", "#FACC15"],
		[65, "M65", "#84CC16"],
		[79.9, "M65", "#84CC16"],
		[80, "M80", "#22C55E"],
		[94.9, "M80", "#22C55E"],
		[95, "M95", "#15803D"],
		[100, "M95", "#15803D"],
	])("%d%% → %s (%s)", (pct, band, color) => {
		expect(progressToBand(pct).label).toBe(band);
		expect(progressToColor(pct)).toBe(color);
	});

	test("clamps out-of-range / non-finite values", () => {
		expect(progressToColor(-5)).toBe("#93C5FD");
		expect(progressToColor(150)).toBe("#15803D");
		expect(progressToColor(Number.NaN)).toBe("#93C5FD");
	});

	test("exposes the six authoritative bands for legends", () => {
		expect(PROGRESS_RAMP.map((s) => s.label)).toEqual(["<M35", "M35", "M50", "M65", "M80", "M95"]);
	});

	test("the code ramp's bands + colours match the bundled dataset", () => {
		// Compare the authoritative content (labels + colours); the final band's open-ended
		// threshold is represented as 100 here vs 101 in the dataset — same bucketing either way.
		expect(PROGRESS_RAMP.map((s) => [s.label, s.color])).toEqual(
			villaProgressMeta.ramp.map((s) => [s.label, s.color]),
		);
	});
});

describe("getVillaProgress lookup", () => {
	test("returns a bundled villa record by code", () => {
		const villa = getVillaProgress("VL4-1555");
		expect(villa).toBeDefined();
		expect(villa?.model).toBe("VL4");
		expect(villa?.plot).toBe("1555");
	});

	test("is case- and whitespace-insensitive on the code", () => {
		expect(getVillaProgress("  vl4-1555 ")?.code).toBe("VL4-1555");
	});

	test("returns undefined for an unknown villa (Unassigned)", () => {
		expect(getVillaProgress("ZZ9-0000")).toBeUndefined();
	});

	test("Unassigned colour is neutral grey", () => {
		expect(UNASSIGNED_COLOR).toBe("#9ca3af");
	});

	test("corrects the snapshot's boundary mis-bucket (C10-2256 actual 50.0 → M50)", () => {
		// The raw snapshot stored M35/#3B82F6 for actual 50.0; the authoritative ramp buckets 50 → M50.
		const villa = getVillaProgress("C10-2256");
		expect(villa?.actual).toBe(50);
		expect(villa?.band).toBe("M50");
		expect(villa?.color).toBe("#FACC15");
	});
});

describe("assignment layer is ramp-consistent across all villas", () => {
	const codes = Object.keys((rawData as {houses: Record<string, unknown>}).houses);

	test("every villa's assigned colour equals progressToColor(actual)", () => {
		const bad = codes.filter((code) => {
			const villa = getVillaProgress(code);
			return !villa || villa.color !== progressToColor(villa.actual);
		});
		expect(bad).toHaveLength(0);
	});
});
