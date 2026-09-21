import * as React from "react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {MultiSelect, type MultiSelectOption} from "./multi-select";

const options: MultiSelectOption[] = [
	{value: "8f1d", label: "NEOM"},
	{value: "2c4a", label: "Qiddiya"},
	{value: "7b3e", label: "Diriyah"},
];

function Harness({initial = [], ...rest}: {initial?: string[]; invalid?: boolean; showPills?: boolean}) {
	const [value, setValue] = React.useState<string[]>(initial);
	return (
		<MultiSelect options={options} value={value} onValueChange={setValue} placeholder="Select project(s)" {...rest} />
	);
}

test("MultiSelect shows the placeholder when nothing is selected", async () => {
	await render(<Harness />);
	await expect.element(page.getByRole("combobox")).toHaveTextContent("Select project(s)");
});

test("MultiSelect summarises the selection count on the trigger", async () => {
	await render(<Harness initial={["8f1d", "7b3e"]} />);
	await expect.element(page.getByRole("combobox")).toHaveTextContent("2 selected");
});

test("MultiSelect renders a removable pill per selected option", async () => {
	await render(<Harness initial={["8f1d"]} />);
	const remove = page.getByRole("button", {name: "Remove NEOM"});
	await expect.element(remove).toBeVisible();

	await remove.click();
	await expect.element(page.getByRole("combobox")).toHaveTextContent("Select project(s)");
});

test("MultiSelect hides pills when showPills is false", async () => {
	await render(<Harness initial={["8f1d"]} showPills={false} />);
	await expect.element(page.getByRole("button", {name: "Remove NEOM"})).not.toBeInTheDocument();
});

test("MultiSelect marks the trigger aria-invalid when invalid", async () => {
	await render(<Harness invalid />);
	await expect.element(page.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
});

test("MultiSelect keeps the popover open across multiple selections", async () => {
	await render(<Harness />);
	await page.getByRole("combobox").click();

	// The second click only lands if the popover stayed open after the first.
	await page.getByRole("option", {name: "NEOM"}).click();
	await page.getByRole("option", {name: "Diriyah"}).click();

	await expect.element(page.getByRole("button", {name: "Remove NEOM"})).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Remove Diriyah"})).toBeVisible();
});

test("MultiSelect search filters on the label, not the value", async () => {
	await render(<Harness />);
	await page.getByRole("combobox").click();

	await page.getByPlaceholder("Search...").fill("Diriyah");
	await expect.element(page.getByRole("option", {name: "Diriyah"})).toBeVisible();
	await expect.element(page.getByRole("option", {name: "NEOM"})).not.toBeInTheDocument();
});
