import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {WeekSelector, type WeekSelectorWeek} from "./week-selector";

const WEEKS: WeekSelectorWeek[] = [
	{value: "W110", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W111", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
];

test("renders week tabs and the selected week's date range", async () => {
	await render(<WeekSelector weeks={WEEKS} value="W112" />);
	await expect.element(page.getByRole("tab", {name: "W110"})).toBeVisible();
	await expect.element(page.getByRole("tab", {name: "W112"})).toBeVisible();
	// W112 = Jul 3–9, 2026
	await expect.element(page.getByText("Jul 3, 2026 – Jul 9, 2026")).toBeVisible();
});

test("fires onValueChange when a week tab is clicked", async () => {
	const onValueChange = vi.fn();
	await render(<WeekSelector weeks={WEEKS} value="W112" onValueChange={onValueChange} />);
	await userEvent.click(page.getByRole("tab", {name: "W110"}));
	expect(onValueChange).toHaveBeenCalledWith("W110");
});

test("clicking the date opens the calendar popover", async () => {
	await render(<WeekSelector weeks={WEEKS} value="W112" onDateSelect={() => {}} />);
	await userEvent.click(page.getByText("Jul 3, 2026 – Jul 9, 2026"));
	await expect.element(page.getByRole("grid")).toBeVisible();
});

test("chevrons step the selected week", async () => {
	const onValueChange = vi.fn();
	// Middle week selected so both chevrons are enabled.
	await render(<WeekSelector weeks={WEEKS} value="W111" onValueChange={onValueChange} />);
	await userEvent.click(page.getByRole("button", {name: "Previous week"}));
	expect(onValueChange).toHaveBeenCalledWith("W110");
	await userEvent.click(page.getByRole("button", {name: "Next week"}));
	expect(onValueChange).toHaveBeenCalledWith("W112");
});

test("previous chevron is disabled on the first week", async () => {
	await render(<WeekSelector weeks={WEEKS} value="W110" />);
	await expect.element(page.getByRole("button", {name: "Previous week"})).toBeDisabled();
});
