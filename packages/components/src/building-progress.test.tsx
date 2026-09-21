import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {BuildingProgress} from "./building-progress";

const FLOORS = [
	{id: "rf", label: "RF", value: 81},
	{id: "gf", label: "GF", value: 41},
	{id: "sub", label: "SUB", value: 96},
];

test("renders a row per floor with its label and percentage", async () => {
	await render(<BuildingProgress floors={FLOORS} />);
	await expect.element(page.getByText("RF")).toBeVisible();
	await expect.element(page.getByText("81%")).toBeVisible();
	await expect.element(page.getByText("96%")).toBeVisible();
});

test("renders rows as buttons and marks the active floor as pressed when interactive", async () => {
	await render(<BuildingProgress floors={FLOORS} activeId="gf" onFloorSelect={() => {}} />);
	const active = page.getByRole("button", {name: /GF/});
	await expect.element(active).toHaveAttribute("aria-pressed", "true");
});

test("calls onFloorSelect with the clicked floor id", async () => {
	const onFloorSelect = vi.fn();
	await render(<BuildingProgress floors={FLOORS} activeId="gf" onFloorSelect={onFloorSelect} />);
	await page.getByRole("button", {name: /SUB/}).click();
	expect(onFloorSelect).toHaveBeenCalledWith("sub");
});

test("clamps out-of-range values to 0–100", async () => {
	await render(<BuildingProgress floors={[{id: "x", label: "X", value: 140}]} />);
	await expect.element(page.getByText("100%")).toBeVisible();
});
