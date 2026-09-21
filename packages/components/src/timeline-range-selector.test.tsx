import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {TimelineRangeSelector, type TimelineDay} from "./timeline-range-selector";

function makeDays(n: number): TimelineDay[] {
	const base = new Date(2025, 5, 1);
	return Array.from({length: n}, (_, i) => ({
		date: new Date(base.getFullYear(), base.getMonth(), base.getDate() + i),
		count: (i % 5) + 1,
	}));
}

test("renders the title and both range handles", async () => {
	await render(<TimelineRangeSelector data={makeDays(30)} period="all" title="Activity" />);
	await expect.element(page.getByText("Activity")).toBeVisible();
	await expect.element(page.getByRole("slider", {name: "Range start"})).toBeInTheDocument();
	await expect.element(page.getByRole("slider", {name: "Range end"})).toBeInTheDocument();
});

test("shows the active period label on the dropdown trigger", async () => {
	await render(<TimelineRangeSelector data={makeDays(30)} period="3m" />);
	await expect.element(page.getByRole("button", {name: /3 Months/})).toBeVisible();
});

test("fires onPeriodChange when a period is selected", async () => {
	const onPeriodChange = vi.fn();
	await render(<TimelineRangeSelector data={makeDays(30)} period="3m" onPeriodChange={onPeriodChange} />);
	await userEvent.click(page.getByRole("button", {name: /3 Months/}));
	await userEvent.click(page.getByRole("menuitem", {name: "1 Month"}));
	expect(onPeriodChange).toHaveBeenCalledWith("1m");
});

test("dot variant renders the midpoint axis label", async () => {
	const days = makeDays(15);
	await render(<TimelineRangeSelector data={days} period="all" variant="dot" />);
	// 15 days from Jun 1 → midpoint index 7 = Jun 8.
	await expect.element(page.getByText("Jun 8", {exact: true})).toBeVisible();
});
