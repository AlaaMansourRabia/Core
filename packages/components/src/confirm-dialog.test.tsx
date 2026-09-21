import {useRef, useState} from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Button} from "./button";
import {ConfirmDialog} from "./confirm-dialog";

/**
 * A state-driven confirm — the shape that has no `AlertDialog.Trigger` for Radix to restore focus
 * to, so the host has to say where focus goes on close.
 */
function Host({restoreFocus}: {restoreFocus?: boolean}) {
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);

	return (
		<div>
			<Button ref={triggerRef} onClick={() => setOpen(true)}>
				Demobilize
			</Button>
			<ConfirmDialog
				open={open}
				onOpenChange={setOpen}
				title="Demobilize worker?"
				description="They lose site access immediately."
				confirmLabel="Demobilize"
				destructive
				onConfirm={() => setOpen(false)}
				onCloseAutoFocus={
					restoreFocus
						? (event) => {
								event.preventDefault();
								triggerRef.current?.focus();
							}
						: undefined
				}
			/>
		</div>
	);
}

test("ConfirmDialog forwards content props, so a state-driven confirm can restore focus", async () => {
	await render(<Host restoreFocus />);
	const trigger = page.getByRole("button", {name: "Demobilize"});

	await trigger.click();
	await expect.element(page.getByText("Demobilize worker?")).toBeVisible();

	await page.getByRole("button", {name: "Cancel"}).click();
	await vi.waitFor(() => expect(document.activeElement?.textContent).toBe("Demobilize"));
});

test("ConfirmDialog still runs onConfirm and closes itself", async () => {
	await render(<Host />);
	await page.getByRole("button", {name: "Demobilize"}).click();

	await page.getByRole("alertdialog").getByRole("button", {name: "Demobilize"}).click();
	await vi.waitFor(() => expect(document.body.textContent).not.toContain("Demobilize worker?"));
});
