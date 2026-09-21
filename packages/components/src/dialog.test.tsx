import * as React from "react";
import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "./dialog";

/**
 * Issue #248: DialogHeader's layout changed between 0.2 and 0.13 with no way for a consumer to
 * choose, and the only workaround left was overriding core-ui's shipped classes. These pin BOTH
 * layouts, so a future change to either has to be a deliberate one.
 *
 * Asserted on the CLASS LIST rather than computed style, deliberately: the tests run without the
 * package stylesheet, so every computed value would be the UA default and the assertions would pass
 * on an unstyled div. The class list is also exactly what the issue reported changing.
 */
const openDialog = (variant?: "banded" | "stacked") => (
	<Dialog open>
		<DialogContent variant={variant}>
			<DialogHeader>
				<DialogTitle>Add certificate</DialogTitle>
				<DialogDescription>Record the certificate name, type and dates.</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<button type="button">Save</button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
);

/** The header is the element wrapping the title, whatever layout it is in. */
const headerClasses = () =>
	document.querySelector("[role=dialog] h2")?.parentElement?.className.split(" ").filter(Boolean) ?? [];

test("Dialog defaults to the banded header", async () => {
	await render(openDialog());
	await expect.element(page.getByText("Add certificate")).toBeVisible();

	// The 40px bg-muted strip WidgetCardHeader and TableHeader also draw.
	const classes = headerClasses();
	expect(classes).toContain("wwc:min-h-10");
	expect(classes).toContain("wwc:bg-muted");
	expect(classes).toContain("wwc:border-b");
	expect(classes).toContain("wwc:flex-row");
});

test("Dialog variant=stacked restores the pre-0.3 header", async () => {
	await render(openDialog("stacked"));
	await expect.element(page.getByText("Add certificate")).toBeVisible();

	// Title over description, and no band: no strip, no fill, no rule.
	const classes = headerClasses();
	expect(classes).toContain("wwc:flex-col");
	expect(classes).toContain("wwc:space-y-1.5");
	expect(classes).not.toContain("wwc:bg-muted");
	expect(classes).not.toContain("wwc:border-b");
	expect(classes).not.toContain("wwc:min-h-10");
});
