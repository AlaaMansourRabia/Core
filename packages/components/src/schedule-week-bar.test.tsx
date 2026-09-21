import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {ScheduleWeekBar} from "./schedule-week-bar";

const META = {projectStart: "2026-06-01", totalDays: 180};

test("ScheduleWeekBar renders its paging controls", async () => {
	await render(<ScheduleWeekBar meta={META} />);
	await expect.element(page.getByRole("button", {name: "Previous week"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Next week"})).toBeVisible();
});

test("ScheduleWeekBar disables Previous on the first week", async () => {
	await render(<ScheduleWeekBar meta={{projectStart: "2026-06-01", totalDays: 3}} />);
	await expect.element(page.getByRole("button", {name: "Previous week"})).toBeDisabled();
});

test("ScheduleWeekBar calls onPlay with the visible week's start day", async () => {
	const onPlay = vi.fn();
	await render(<ScheduleWeekBar meta={{projectStart: "2026-06-01", totalDays: 3}} onPlay={onPlay} />);
	await userEvent.click(page.getByRole("button", {name: /Play 4D timeline/}).element());
	expect(onPlay).toHaveBeenCalledWith(0);
});

test("ScheduleWeekBar renders the plain variant", async () => {
	await render(<ScheduleWeekBar meta={META} variant="plain" />);
	await expect.element(page.getByRole("button", {name: "Next week"})).toBeVisible();
});
