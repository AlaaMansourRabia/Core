import {expect, test} from "vitest";
import {render} from "vitest-browser-react";

import {Calendar} from "./calendar";

/*
 * Tests run without Tailwind, so `wwc:` utilities are inert and every element here would be
 * position:static — the overlap this file guards against could not happen, and a hit-test would pass
 * on broken code. This maps exactly the utilities that decide the header's stacking and geometry to
 * their Tailwind 4 output, keyed on the real class names the component emits. Remove a class from
 * calendar.tsx and its rule stops matching; the order below mirrors Tailwind's (variants last).
 */
const LAYOUT_UTILITIES: [string, string][] = [
	["wwc:flex", "display:flex"],
	["wwc:inline-flex", "display:inline-flex"],
	["wwc:flex-col", "flex-direction:column"],
	["wwc:items-center", "align-items:center"],
	["wwc:justify-center", "justify-content:center"],
	["wwc:justify-between", "justify-content:space-between"],
	["wwc:relative", "position:relative"],
	["wwc:absolute", "position:absolute"],
	["wwc:inset-x-0", "left:0;right:0"],
	["wwc:top-0", "top:0"],
	["wwc:z-10", "z-index:10"],
	["wwc:p-0", "padding:0"],
	["wwc:p-2", "padding:8px"],
	["wwc:p-3", "padding:12px"],
	["wwc:px-1", "padding-left:4px;padding-right:4px"],
	["wwc:pt-1", "padding-top:4px"],
	["wwc:gap-2", "gap:8px"],
	["wwc:gap-4", "gap:16px"],
	["wwc:h-6", "height:24px"],
	["wwc:w-6", "width:24px"],
	["wwc:h-7", "height:28px"],
	["wwc:w-7", "width:28px"],
	["wwc:h-8", "height:32px"],
	["wwc:w-8", "width:32px"],
	["wwc:h-9", "height:36px"],
	["wwc:w-9", "width:36px"],
	["wwc:pointer-events-none", "pointer-events:none"],
	["wwc:pointer-events-auto", "pointer-events:auto"],
];

function injectLayoutUtilities() {
	if (document.getElementById("calendar-test-layout")) return;
	const style = document.createElement("style");
	style.id = "calendar-test-layout";
	style.textContent = [
		...LAYOUT_UTILITIES.map(([cls, decl]) => `.${CSS.escape(cls)}{${decl}}`),
		`.${CSS.escape("wwc:disabled:pointer-events-none")}:disabled{pointer-events:none}`,
	].join("\n");
	document.head.appendChild(style);
}

/** Every point of a 5x5 grid inset 2px from the button's edges must land on the button itself. */
function missedPoints(button: HTMLElement) {
	const r = button.getBoundingClientRect();
	const misses: string[] = [];
	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 5; j++) {
			const x = r.left + 2 + ((r.width - 4) * i) / 4;
			const y = r.top + 2 + ((r.height - 4) * j) / 4;
			const hit = document.elementFromPoint(x, y);
			if (!hit || !button.contains(hit)) {
				misses.push(`(${Math.round(x - r.left)},${Math.round(y - r.top)})→${hit?.tagName ?? "null"}`);
			}
		}
	}
	return misses;
}

const september2026 = new Date(2026, 8, 1);

for (const size of ["default", "compact"] as const) {
	test(`${size}: the whole month-nav chevron is clickable, not just its bottom edge (SAF-1748)`, async () => {
		injectLayoutUtilities();
		const screen = await render(<Calendar size={size} defaultMonth={september2026} />);
		const root = screen.container;

		for (const name of ["Go to the Previous Month", "Go to the Next Month"]) {
			const button = root.querySelector<HTMLElement>(`button[aria-label="${name}"]`);
			if (!button) throw new Error(`missing chevron: ${name}`);
			expect(missedPoints(button), name).toEqual([]);
		}
	});
}

test("a click near the top of the next chevron changes the month (SAF-1748)", async () => {
	injectLayoutUtilities();
	const screen = await render(<Calendar defaultMonth={september2026} />);
	const root = screen.container;
	expect(root.textContent).toContain("September 2026");

	const next = root.querySelector<HTMLElement>('button[aria-label="Go to the Next Month"]');
	if (!next) throw new Error("missing next chevron");
	const r = next.getBoundingClientRect();
	// 6px below the top edge: inside the band the month caption used to cover.
	// Dispatch on whatever is under the pointer (often the chevron <svg>, which has no .click()), the way a
	// real tap would: it bubbles to the button only if the button is what the point actually hits.
	const target = document.elementFromPoint(r.left + r.width / 2, r.top + 6);
	if (!target) throw new Error("nothing under the chevron");
	target.dispatchEvent(new MouseEvent("click", {bubbles: true, cancelable: true}));

	await expect.poll(() => root.textContent).toContain("October 2026");
});

test("the raised nav does not swallow clicks meant for the caption dropdowns", async () => {
	injectLayoutUtilities();
	const screen = await render(<Calendar captionLayout="dropdown" defaultMonth={september2026} />);
	const triggers = screen.container.querySelectorAll<HTMLElement>('[role="combobox"]');
	expect(triggers.length).toBeGreaterThan(0);

	for (const trigger of triggers) {
		const r = trigger.getBoundingClientRect();
		const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
		expect(hit && trigger.contains(hit), trigger.textContent ?? "").toBe(true);
	}
});
