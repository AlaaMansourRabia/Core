import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {SingleHouseView} from "./single-house-view";

test("SingleHouseView renders the building header", async () => {
	await render(<SingleHouseView />);
	await expect.element(page.getByText("Villa A-12")).toBeVisible();
});

test("SingleHouseView renders the Floors rail heading", async () => {
	await render(<SingleHouseView />);
	await expect.element(page.getByText("Floors")).toBeVisible();
});

test("SingleHouseView renders the fragment model", async () => {
	await render(<SingleHouseView />);
	await expect.element(page.getByRole("img", {name: "Single house fragment model"})).toBeVisible();
});

test("SingleHouseView lists floor levels", async () => {
	await render(<SingleHouseView />);
	await expect.element(page.getByText("Ground Floor")).toBeVisible();
});

test("SingleHouseView shows the streaming loading veil initially", async () => {
	await render(<SingleHouseView />);
	await expect.element(page.getByText("Streaming fragments…")).toBeVisible();
});
