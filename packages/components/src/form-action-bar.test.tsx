import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Button} from "./button";
import {FormActionBar} from "./form-action-bar";

test("FormActionBar renders status and actions", async () => {
	await render(
		<FormActionBar status="3 unsaved changes">
			<Button>Save changes</Button>
		</FormActionBar>,
	);
	await expect.element(page.getByText("3 unsaved changes")).toBeVisible();
	await expect.element(page.getByRole("button", {name: "Save changes"})).toBeVisible();
});

test("FormActionBar is sticky by default and static when opted out", async () => {
	const sticky = await render(<FormActionBar status="x" />);
	expect(sticky.container.querySelector("[data-core-artifact='form-action-bar']")?.className).toContain("wwc:sticky");

	const flow = await render(<FormActionBar status="x" sticky={false} />);
	expect(flow.container.querySelector("[data-core-artifact='form-action-bar']")?.className).not.toContain("wwc:sticky");
});

test("FormActionBar renders without a status", async () => {
	await render(
		<FormActionBar>
			<Button>Discard</Button>
		</FormActionBar>,
	);
	await expect.element(page.getByRole("button", {name: "Discard"})).toBeVisible();
});
