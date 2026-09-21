import {useState} from "react";
import {expect, test, vi} from "vitest";
import {render} from "vitest-browser-react";
import {page} from "vitest/browser";

import {Combobox, type ComboboxOption} from "./combobox";

interface Trade {
	id: string;
	name: string;
}

const TRADES: ComboboxOption<Trade>[] = [
	{value: "1", label: "Carpenter", data: {id: "1", name: "Carpenter"}},
	{value: "2", label: "Electrician", data: {id: "2", name: "Electrician"}},
	{value: "3", label: "Welder", data: {id: "3", name: "Welder"}},
];

/**
 * Opens the popover and returns the search input. The trigger is queried without a name:
 * `combobox` takes no name from content, so the button's label is not its accessible name.
 */
async function open() {
	await page.getByRole("combobox").click();
	return page.getByPlaceholder("Search...");
}

test("Combobox filters client-side when no data source is given", async () => {
	await render(<Combobox options={TRADES} />);
	const search = await open();

	await search.fill("weld");
	await expect.element(page.getByText("Welder")).toBeVisible();
	expect(document.body.textContent).not.toContain("Carpenter");
});

test("Combobox in async mode shows the server's result set as-is, unfiltered", async () => {
	// A server that has already answered "we" with these three: the combobox must not second-guess it.
	await render(<Combobox options={TRADES} onSearch={() => {}} searchDebounce={0} />);
	const search = await open();

	await search.fill("no-such-trade");
	await expect.element(page.getByText("Carpenter")).toBeVisible();
	await expect.element(page.getByText("Electrician")).toBeVisible();
	await expect.element(page.getByText("Welder")).toBeVisible();
});

test("Combobox debounces the search term before calling onSearch", async () => {
	const onSearch = vi.fn();
	await render(<Combobox options={TRADES} onSearch={onSearch} searchDebounce={500} />);
	const search = await open();

	await search.fill("wel");
	await search.fill("weld");
	await search.fill("welde");

	await vi.waitFor(() => expect(onSearch).toHaveBeenCalledWith("welde"));
	// The intermediate terms never reached the server.
	expect(onSearch.mock.calls).toEqual([["welde"]]);
});

test("Combobox pages when the list is scrolled to its end, once per answer", async () => {
	const onLoadMore = vi.fn();
	const many = Array.from({length: 40}, (_, i) => ({value: String(i), label: `Trade ${i}`}));
	await render(<Combobox options={many} onSearch={() => {}} onLoadMore={onLoadMore} />);
	await open();

	// No stylesheet is loaded in this environment, so give the list the scroll box it ships with.
	const list = document.querySelector<HTMLElement>("[cmdk-list]");
	expect(list).not.toBeNull();
	list!.style.maxHeight = "100px";
	list!.style.overflowY = "auto";

	list!.scrollTop = list!.scrollHeight;
	await vi.waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));

	// A second scroll before the caller answers must not stack a duplicate request.
	list!.scrollTop = list!.scrollHeight - 1;
	list!.scrollTop = list!.scrollHeight;
	await new Promise((resolve) => setTimeout(resolve, 50));
	expect(onLoadMore).toHaveBeenCalledTimes(1);
});

test("Combobox stops paging once the caller reports there is no more", async () => {
	const onLoadMore = vi.fn();
	const many = Array.from({length: 40}, (_, i) => ({value: String(i), label: `Trade ${i}`}));
	await render(<Combobox options={many} onSearch={() => {}} onLoadMore={onLoadMore} hasMore={false} />);
	await open();

	const list = document.querySelector<HTMLElement>("[cmdk-list]")!;
	list.style.maxHeight = "100px";
	list.style.overflowY = "auto";
	list.scrollTop = list.scrollHeight;

	await new Promise((resolve) => setTimeout(resolve, 50));
	expect(onLoadMore).not.toHaveBeenCalled();
});

test("Combobox hands the whole option back so a caller can round-trip its own record", async () => {
	const onValueChange = vi.fn();
	await render(<Combobox options={TRADES} onValueChange={onValueChange} />);
	await open();

	await page.getByText("Electrician").click();
	expect(onValueChange).toHaveBeenCalledWith("2", TRADES[1]);
	expect(onValueChange.mock.calls[0][1].data).toEqual({id: "2", name: "Electrician"});
});

test("Combobox labels a selection the current page no longer holds", async () => {
	// Searched past the selection: the trigger still names it rather than falling back to placeholder.
	function Host() {
		const [value] = useState("2");
		return (
			<Combobox
				options={[TRADES[0]]}
				value={value}
				selectedOption={TRADES[1]}
				onSearch={() => {}}
				placeholder="Select option..."
			/>
		);
	}
	await render(<Host />);
	await expect.element(page.getByRole("combobox")).toHaveTextContent("Electrician");
});

// ─── Controlled popover ──────────────────────────────────────────────────────

test("Combobox reports and follows the caller's open state", async () => {
	const onOpenChange = vi.fn();
	function Controlled() {
		const [open, setOpen] = useState(true);
		return (
			<Combobox
				options={TRADES}
				open={open}
				onOpenChange={(next) => {
					onOpenChange(next);
					setOpen(next);
				}}
			/>
		);
	}
	await render(<Controlled />);

	// Open on mount, because the caller said so.
	await expect.element(page.getByPlaceholder("Search...")).toBeVisible();

	await page.getByRole("option", {name: "Welder"}).click();
	expect(onOpenChange).toHaveBeenCalledWith(false);
	await vi.waitFor(() => expect(page.getByPlaceholder("Search...").elements()).toHaveLength(0));
});
