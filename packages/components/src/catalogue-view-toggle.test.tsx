import {useState} from "react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {CatalogueCardGrid, CatalogueViewToggle, type CatalogueViewMode} from "./catalogue-view-toggle";

function Toggle({initial = "cards"}: {initial?: CatalogueViewMode}) {
	const [mode, setMode] = useState<CatalogueViewMode>(initial);
	return (
		<>
			<CatalogueViewToggle value={mode} onValueChange={setMode} />
			<output>{mode}</output>
		</>
	);
}

test("CatalogueViewToggle switches between table and cards", async () => {
	await render(<Toggle />);
	await expect.element(page.getByRole("status")).toHaveTextContent("cards");

	await page.getByRole("radio", {name: "Table view"}).click();
	await expect.element(page.getByRole("status")).toHaveTextContent("table");
});

test("CatalogueViewToggle swallows a de-select — a catalogue always has a mode", async () => {
	await render(<Toggle initial="table" />);

	// Radix emits "" when the active item is pressed again; pressing the live mode must not clear it.
	await page.getByRole("radio", {name: "Table view"}).click();
	await expect.element(page.getByRole("status")).toHaveTextContent("table");
});

test("CatalogueViewToggle labels both options for assistive tech", async () => {
	await render(<Toggle />);
	await expect.element(page.getByRole("radio", {name: "Table view"})).toBeVisible();
	await expect.element(page.getByRole("radio", {name: "Card view"})).toBeVisible();
});

test("CatalogueCardGrid keeps the shared responsive tracks and forwards data attributes", async () => {
	const {container} = await render(
		<CatalogueCardGrid data-processes-catalogue={2}>
			<div>one</div>
			<div>two</div>
		</CatalogueCardGrid>,
	);
	const grid = container.querySelector("[data-processes-catalogue]");
	expect(grid?.className).toContain("wwc:sm:grid-cols-2");
	expect(grid?.className).toContain("wwc:xl:grid-cols-3");
	expect(grid?.getAttribute("data-processes-catalogue")).toBe("2");
});
