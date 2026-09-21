import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {ToolbarStats, type ToolbarStat} from "./toolbar-stats";

const GROUPS: ToolbarStat[][] = [
	[
		{label: "APPROVED", value: "0%"},
		{label: "PLANNED", value: "26.48%"},
		{label: "VARIANCE", value: "-26.48%", negative: true},
	],
	[
		{label: "BAC", value: "$551,117,394"},
		{label: "EV", value: "$0"},
		{label: "PV", value: "$145,921,414"},
		{label: "SV", value: "-$145,921,414", negative: true},
	],
];

test("renders every stat label and value", async () => {
	await render(<ToolbarStats groups={GROUPS} />);
	await expect.element(page.getByText("APPROVED")).toBeVisible();
	await expect.element(page.getByText("VARIANCE")).toBeVisible();
	await expect.element(page.getByText("BAC")).toBeVisible();
	await expect.element(page.getByText("SV")).toBeVisible();
	await expect.element(page.getByText("0%")).toBeVisible();
	await expect.element(page.getByText("-26.48%")).toBeVisible();
	await expect.element(page.getByText("$551,117,394")).toBeVisible();
});

test("renders negative values in the destructive color", async () => {
	await render(<ToolbarStats groups={GROUPS} />);
	const variance = page.getByText("-26.48%");
	await expect.element(variance).toBeVisible();
	expect(variance.element().className).toContain("wwc:text-destructive");
});
