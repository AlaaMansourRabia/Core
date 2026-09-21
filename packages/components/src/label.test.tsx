import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Label} from "./label";
import {PropertyList, PropertyRow} from "./property-list";

test("Label renders no asterisk by default", async () => {
	await render(<Label>Email</Label>);
	await expect.element(page.getByText("Email")).toBeVisible();
	await expect.element(page.getByText("*")).not.toBeInTheDocument();
});

test("Label appends a required asterisk when required", async () => {
	await render(<Label required>Email</Label>);
	await expect.element(page.getByText("Email")).toBeVisible();
	await expect.element(page.getByText("*")).toBeVisible();
});

test("Label's required asterisk is decorative", async () => {
	const screen = await render(<Label required>Email</Label>);
	// aria-hidden keeps the asterisk out of the accessibility tree — the control carries `required`.
	const asterisk = screen.container.querySelector("span[aria-hidden='true']");
	expect(asterisk?.textContent).toBe("*");
});

test("PropertyRow appends a required asterisk when required", async () => {
	await render(
		<PropertyList>
			<PropertyRow label="Country" required>
				Saudi Arabia
			</PropertyRow>
		</PropertyList>,
	);
	await expect.element(page.getByText("Country")).toBeVisible();
	await expect.element(page.getByText("*")).toBeVisible();
});

test("PropertyRow renders no asterisk by default", async () => {
	await render(
		<PropertyList>
			<PropertyRow label="Country">Saudi Arabia</PropertyRow>
		</PropertyList>,
	);
	await expect.element(page.getByText("*")).not.toBeInTheDocument();
});
