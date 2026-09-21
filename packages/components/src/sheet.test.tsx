import {expect, test} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger, sheetVariants} from "./sheet";

/** The default scrim is the only node carrying this class. */
const SCRIM = ".wwc\\:backdrop-blur-sm";

function Host(props: React.ComponentProps<typeof SheetContent>) {
	return (
		<Sheet defaultOpen>
			<SheetTrigger>Open</SheetTrigger>
			<SheetContent {...props}>
				<SheetTitle>Worker profile</SheetTitle>
				<SheetDescription>Everything about this worker.</SheetDescription>
			</SheetContent>
		</Sheet>
	);
}

test("SheetContent ships a close button and a scrim by default", async () => {
	await render(<Host />);
	await expect.element(page.getByRole("button", {name: "Close"})).toBeVisible();
	expect(document.querySelector(SCRIM)).not.toBeNull();
});

test("SheetContent can be told not to render its close button", async () => {
	// A panel whose own header already carries a close control must not get a second one.
	await render(<Host showCloseButton={false} />);
	await expect.element(page.getByText("Worker profile")).toBeVisible();
	expect(document.body.textContent).not.toContain("Close");
});

test("SheetContent lets a consumer restyle the scrim rather than fork the component", async () => {
	// e.g. a scrim that starts below the app topbar instead of at inset-0.
	await render(<Host overlayProps={{className: "wwc:top-14"}} />);
	const scrim = document.querySelector(SCRIM);
	expect(scrim).not.toBeNull();
	expect(scrim!.className).toContain("wwc:top-14");
});

test("SheetContent renders no scrim when the consumer supplies none", async () => {
	await render(<Host overlay={null} />);
	await expect.element(page.getByText("Worker profile")).toBeVisible();
	expect(document.querySelector(SCRIM)).toBeNull();
});

test("sheetVariants is exported, so the skin can be taken without the composition", () => {
	// The utilities named here are the ones the shipped stylesheet has to define.
	expect(sheetVariants({side: "left"})).toContain("wwc:data-[state=open]:slide-in-from-left");
	expect(sheetVariants({side: "right"})).toContain("wwc:data-[state=open]:slide-in-from-right");
});
