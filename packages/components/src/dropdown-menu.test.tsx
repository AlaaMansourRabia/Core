import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page, userEvent} from "vitest/browser";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./dropdown-menu";

// No test in this package imports the compiled CSS, so the harness renders unstyled DOM and
// getComputedStyle would report the UA default whatever the token resolves to. The token's own
// value is gated in scripts/validators/theme-contrast.test.mjs; here we pin the wiring.

function Menu() {
	return (
		<DropdownMenu defaultOpen>
			<DropdownMenuTrigger>Open</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Actions</DropdownMenuLabel>
				<DropdownMenuItem>Edit worker</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem checked>Show archived</DropdownMenuCheckboxItem>
				<DropdownMenuRadioGroup value="all">
					<DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Demobilize</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuItem disabled>Replace photo</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

test("interactive items highlight with the menu token, not the near-invisible accent", async () => {
	await render(<Menu />);

	for (const name of ["Edit worker", "Show archived", "All", "More"]) {
		const item = page.getByText(name).element();
		expect(item.className, name).toContain("wwc:focus:bg-menu-highlight");
		expect(item.className, name).not.toContain("wwc:focus:bg-accent");
	}
});

test("interactive items carry a pointer cursor", async () => {
	await render(<Menu />);

	for (const name of ["Edit worker", "Show archived", "All", "More"]) {
		const item = page.getByText(name).element();
		expect(item.className, name).toContain("wwc:cursor-pointer");
		expect(item.className, name).not.toContain("wwc:cursor-default ");
	}
});

test("the submenu trigger keeps the default cursor when disabled", async () => {
	await render(<Menu />);

	// The trigger carries no data-[disabled]:pointer-events-none of its own, so without this guard
	// a disabled submenu would advertise itself as clickable.
	expect(page.getByText("More").element().className).toContain("wwc:data-[disabled]:cursor-default");
});

test("a disabled item takes no pointer events, so its cursor never applies", async () => {
	await render(<Menu />);

	const disabled = page.getByText("Replace photo").element();
	expect(disabled.className).toContain("wwc:data-[disabled]:pointer-events-none");
	expect(disabled).toHaveAttribute("data-disabled");
});

test("the label and the separator stay non-interactive", async () => {
	const {container} = await render(<Menu />);

	expect(page.getByText("Actions").element().className).not.toContain("wwc:cursor-pointer");
	const separator = container.ownerDocument.querySelector('[role="separator"]');
	expect(separator?.className).not.toContain("wwc:cursor-pointer");
});

test("selecting an item still fires onSelect", async () => {
	const onSelect = vi.fn();
	await render(
		<DropdownMenu defaultOpen>
			<DropdownMenuTrigger>Open</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onSelect={onSelect}>Edit worker</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>,
	);

	await userEvent.click(page.getByText("Edit worker"));
	expect(onSelect).toHaveBeenCalledTimes(1);
});
