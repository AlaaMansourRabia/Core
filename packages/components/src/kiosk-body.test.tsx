import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {KioskBody} from "./kiosk-body";

test("renders the current house title", async () => {
	await render(<KioskBody house="Villa 12" />);
	await expect.element(page.getByText("Villa 12")).toBeVisible();
});

test("shows the weekly overview label", async () => {
	await render(<KioskBody house="Villa 12" />);
	await expect.element(page.getByText("Week 14")).toBeVisible();
});

test("shows the activities and milestones headings", async () => {
	await render(<KioskBody house="Villa 12" />);
	await expect.element(page.getByText("This week's activities")).toBeVisible();
	await expect.element(page.getByText("Milestones")).toBeVisible();
});

test("renders the Next villa button", async () => {
	await render(<KioskBody house="Villa 12" />);
	await expect.element(page.getByRole("button", {name: "Next villa"})).toBeVisible();
});
