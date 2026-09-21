import {expect, test} from "vitest";

import {NEUTRAL_TONE, TONE_BY_ID, TONES, toneFor} from "./tones";

// Approximate OKLCH hue of each Tailwind family at 500 — the wheel the palette's order walks.
const HUE: Record<string, number> = {
	rose: 15,
	red: 25,
	orange: 55,
	amber: 75,
	yellow: 95,
	lime: 125,
	green: 145,
	emerald: 160,
	teal: 180,
	cyan: 195,
	sky: 210,
	blue: 260,
	indigo: 275,
	violet: 290,
	purple: 305,
	fuchsia: 320,
	pink: 345,
};
const apart = (a: string, b: string) => {
	const d = Math.abs(HUE[a] - HUE[b]);
	return Math.min(d, 360 - d);
};

test("the palette holds 25 tones with unique ids", () => {
	expect(TONES.length).toBe(25);
	expect(new Set(TONES.map((t) => t.id)).size).toBe(25);
	expect(new Set(TONES.map((t) => t.chip)).size).toBe(25);
});

// The contract the whole ordering exists for: hand tones out in order and no two items sitting next
// to each other can wear neighbouring hues.
test("consecutive tones are never neighbouring hues", () => {
	for (let i = 1; i < TONES.length; i++) {
		const a = TONES[i - 1].family;
		const b = TONES[i].family;
		if (a === b) continue; // a deep variant of the same family is a deliberate repeat, not a neighbour
		expect(apart(a, b), `${a} and ${b} sit next to each other in TONES`).toBeGreaterThanOrEqual(90);
	}
});

test("a realistic group never lands two neighbouring hues side by side", () => {
	for (const offset of [0, 5, 10, 15, 20]) {
		const picked = [0, 1, 2, 3, 4].map((i) => TONES[(i + offset) % TONES.length]);
		for (let i = 1; i < picked.length; i++) {
			if (picked[i - 1].family === picked[i].family) continue;
			expect(
				apart(picked[i - 1].family, picked[i].family),
				`offset ${offset}: ${picked[i - 1].id} then ${picked[i].id}`,
			).toBeGreaterThanOrEqual(90);
		}
	}
});

test("every chip is a literal class string Tailwind can see", () => {
	for (const t of TONES) {
		expect(t.chip).toMatch(/^wwc:bg-[a-z]+-500\/\d+ wwc:text-[a-z]+-\d+ wwc:dark:text-[a-z]+-\d+$/);
		expect(t.chip).toContain(t.family);
	}
	expect(NEUTRAL_TONE).toBe("wwc:bg-muted wwc:text-foreground/70");
});

test("toneFor wraps, and offset shifts where a set starts", () => {
	expect(toneFor(0)).toBe(TONES[0].chip);
	expect(toneFor(TONES.length)).toBe(TONES[0].chip);
	expect(toneFor(-1)).toBe(TONES[TONES.length - 1].chip);
	expect(toneFor(0, 5)).toBe(TONES[5].chip);
	// Two sections starting at different offsets do not open on the same hue.
	expect(toneFor(0, 0)).not.toBe(toneFor(0, 5));
});

test("TONE_BY_ID reaches the hues that carry a meaning", () => {
	for (const id of ["blue", "violet", "emerald", "cyan", "rose", "teal"]) {
		expect(TONE_BY_ID[id], `${id} must exist — Studio asks for it by name`).toBeDefined();
	}
});
