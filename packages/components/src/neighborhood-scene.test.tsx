import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {NeighborhoodScene} from "./neighborhood-scene";

test("NeighborhoodScene renders the scene", async () => {
	await render(<NeighborhoodScene />);
	await expect.element(page.getByRole("img", {name: "Neighborhood map"})).toBeVisible();
});

test("NeighborhoodScene renders interactive house hit-shapes", async () => {
	const {container} = await render(<NeighborhoodScene />);
	await expect.element(page.getByRole("button", {name: "Unit A1"})).toBeVisible();
	expect(container.querySelectorAll('[role="button"]').length).toBe(16);
});

test("NeighborhoodScene marks the selected house as pressed", async () => {
	await render(<NeighborhoodScene selectedId="house-1-1" />);
	await expect.element(page.getByRole("button", {name: "Unit A1"})).toHaveAttribute("aria-pressed", "true");
});

test("NeighborhoodScene renders the full fit variant", async () => {
	const {container} = await render(<NeighborhoodScene fit="full" />);
	await expect.element(page.getByRole("img", {name: "Neighborhood map"})).toBeVisible();
	expect(container.querySelector("div")?.className).toContain("wwc:w-full");
});
