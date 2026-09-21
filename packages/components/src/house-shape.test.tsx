import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {HouseShape} from "./house-shape";

test("HouseShape renders with an accessible label", async () => {
	await render(<HouseShape name="Block A" />);
	await expect.element(page.getByRole("img", {name: "Block A"})).toBeVisible();
});

test("HouseShape renders the roof and wall polygons", async () => {
	const {container} = await render(<HouseShape name="Block B" />);
	expect(container.querySelectorAll("polygon")).toHaveLength(6);
});

test("HouseShape shows the apex marker only when selected", async () => {
	const {container, rerender} = await render(<HouseShape name="Block C" state="idle" />);
	expect(container.querySelector("circle")).toBeNull();
	await rerender(<HouseShape name="Block C" state="selected" />);
	expect(container.querySelector("circle")).not.toBeNull();
});

for (const variant of ["primary", "secondary", "accent", "muted", "destructive"] as const) {
	test(`HouseShape renders the ${variant} palette`, async () => {
		await render(<HouseShape name={`House ${variant}`} variant={variant} />);
		await expect.element(page.getByRole("img", {name: `House ${variant}`})).toBeVisible();
	});
}
