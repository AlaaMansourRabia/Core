import {useState} from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Combobox, type ComboboxOption, type ComboboxProps} from "./combobox";
import {DatePicker} from "./date-picker";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "./dialog";

/**
 * Issue #294 — a Combobox inside a Dialog could not be searched or selected.
 *
 * A modal Dialog sets `pointer-events: none` on <body> and hands `auto` back only to the overlay
 * layers it knows about. A popover portalled to document.body is normally one of them — but not when
 * the host app carries a SECOND copy of @radix-ui/react-dismissable-layer (its own
 * @radix-ui/react-popover beside core-ui's, say), because the two copies keep separate layer stacks.
 * The popover then renders but is dead to the mouse: every click lands on the overlay instead, which
 * reads as an outside interaction and dismisses it, so Trade and Company could not be filled in at
 * all. Portalling into the dialog sidesteps the negotiation.
 *
 * These live apart from combobox.test.tsx deliberately: mounting modal dialogs and a calendar is a
 * far heavier page than that file's plain-combobox tests, and it shares one browser page per file.
 */

const TRADES: ComboboxOption[] = [
	{value: "1", label: "Carpenter"},
	{value: "2", label: "Electrician"},
	{value: "3", label: "Welder"},
];

/** Hit-tests an element's centre — what the mouse would actually land on, not what the DOM claims. */
function hitTest(el: Element) {
	const rect = el.getBoundingClientRect();
	const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
	return {reached: el === hit || el.contains(hit), pointerEvents: getComputedStyle(el).pointerEvents};
}

function DialogCombobox(props: Partial<ComboboxProps> = {}) {
	const [value, setValue] = useState("");
	return (
		<Dialog open>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Edit worker</DialogTitle>
				</DialogHeader>
				<Combobox options={TRADES} value={value} onValueChange={setValue} {...props} />
			</DialogContent>
		</Dialog>
	);
}

/** Opens the popover and returns the search input. */
async function open() {
	await page.getByRole("combobox").click();
	return page.getByPlaceholder("Search...");
}

test("Combobox inside a Dialog renders its popover within the dialog", async () => {
	await render(<DialogCombobox />);
	const search = await open();
	await expect.element(search).toBeVisible();

	const dialog = document.querySelector("[role=dialog]") as HTMLElement;
	expect(dialog.contains(search.element())).toBe(true);
});

test("Combobox inside a Dialog stays clickable under the modal's pointer-events lock", async () => {
	await render(<DialogCombobox />);
	const search = await open();
	await expect.element(search).toBeVisible();

	// The dialog really is modal — this is the condition that used to kill the popover.
	expect(document.body.style.pointerEvents).toBe("none");
	const searchHit = hitTest(search.element());
	expect(searchHit.pointerEvents).toBe("auto");
	expect(searchHit.reached).toBe(true);
});

test("Combobox inside a Dialog commits a selection and leaves the dialog open", async () => {
	const onValueChange = vi.fn();
	await render(<DialogCombobox onValueChange={onValueChange} />);
	const search = await open();

	await search.fill("elec");
	const option = page.getByRole("option", {name: "Electrician"});
	await expect.element(option).toBeVisible();
	expect(hitTest(option.element()).reached).toBe(true);

	await option.click();
	expect(onValueChange).toHaveBeenCalledWith("2", expect.objectContaining({value: "2"}));
	// Picking an option must not take the dialog down with the popover.
	await expect.element(page.getByRole("dialog")).toBeVisible();
});

test("Combobox portals to the body when a caller opts out of the dialog container", async () => {
	await render(<DialogCombobox container={null} />);
	const search = await open();
	await expect.element(search).toBeVisible();

	const dialog = document.querySelector("[role=dialog]") as HTMLElement;
	expect(dialog.contains(search.element())).toBe(false);
});

test("DatePicker inside a Dialog renders its calendar within the dialog", async () => {
	await render(
		<Dialog open>
			<DialogContent aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>Edit worker</DialogTitle>
				</DialogHeader>
				<DatePicker />
			</DialogContent>
		</Dialog>,
	);

	await page.getByText("Pick a date").click();
	const grid = page.getByRole("grid");
	await expect.element(grid).toBeVisible();

	const dialog = document.querySelector("[role=dialog]") as HTMLElement;
	expect(dialog.contains(grid.element())).toBe(true);
	expect(hitTest(grid.element()).pointerEvents).toBe("auto");
});
