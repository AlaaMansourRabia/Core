import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Combobox} from "@corensystem/coren-ui/combobox";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@corensystem/coren-ui/dialog";
import * as React from "react";
import {expect, screen, userEvent, waitFor, within} from "storybook/test";

const frameworks = [
	{value: "react", label: "React"},
	{value: "vue", label: "Vue"},
	{value: "angular", label: "Angular"},
	{value: "svelte", label: "Svelte"},
	{value: "solid", label: "SolidJS"},
	{value: "qwik", label: "Qwik"},
];

const countries = [
	{value: "us", label: "United States"},
	{value: "ca", label: "Canada"},
	{value: "uk", label: "United Kingdom"},
	{value: "de", label: "Germany"},
	{value: "fr", label: "France"},
	{value: "jp", label: "Japan"},
	{value: "au", label: "Australia"},
	{value: "br", label: "Brazil", disabled: true},
	{value: "cn", label: "China", disabled: true},
];

const meta = {
	title: "Components/Forms/Combobox",
	component: Combobox,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A searchable dropdown combining a Popover, Command palette, and Button. Supports search filtering, disabled options, and controlled selection.",
			},
		},
	},
	args: {
		options: frameworks,
		placeholder: "Select framework...",
		searchPlaceholder: "Search frameworks...",
		emptyMessage: "No framework found.",
	},
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
	args: {
		value: "react",
	},
};

export const WithDisabledOptions: Story = {
	args: {
		options: countries,
		placeholder: "Select country...",
		searchPlaceholder: "Search countries...",
		emptyMessage: "No country found.",
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
	},
};

export const CustomPlaceholders: Story = {
	args: {
		options: countries,
		placeholder: "Pick a country...",
		searchPlaceholder: "Type to filter...",
		emptyMessage: "Nothing matches your search.",
	},
};

export const SelectInteraction: Story = {
	render: () => {
		const [value, setValue] = React.useState<string>("");
		return (
			<Combobox
				options={frameworks}
				value={value}
				onValueChange={setValue}
				placeholder="Select framework..."
				searchPlaceholder="Search frameworks..."
				emptyMessage="No framework found."
			/>
		);
	},
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("combobox");

		await userEvent.click(trigger);
		const option = await screen.findByRole("option", {name: /vue/i});
		await userEvent.click(option);

		await waitFor(() => expect(trigger).toHaveTextContent("Vue"));
	},
};

// ── Inside a Dialog ───────────────────────────────────────────────────────────

/**
 * A Combobox in a modal Dialog — the Edit/Add worker form's shape. The popover portals into the
 * dialog rather than to `document.body`, so it stays clickable under the modal's pointer-events
 * lock and inside its focus scope (issue #294). Pass `container={null}` to opt back out.
 */
export const InsideDialog: Story = {
	render: () => {
		const [trade, setTrade] = React.useState<string>("");
		return (
			<Dialog open>
				<DialogContent aria-describedby={undefined}>
					<DialogHeader>
						<DialogTitle>Edit worker</DialogTitle>
					</DialogHeader>
					<div className="wwc:space-y-2 wwc:p-4">
						<Combobox
							options={frameworks}
							value={trade}
							onValueChange={setTrade}
							placeholder="Select framework..."
							searchPlaceholder="Search frameworks..."
							emptyMessage="No framework found."
						/>
					</div>
					<DialogFooter>
						<Button>Save</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	},
	play: async () => {
		// The dialog portals out of canvasElement, so query the whole screen.
		const trigger = await screen.findByRole("combobox");
		await userEvent.click(trigger);

		// Typing in the search box must not dismiss the popover.
		const search = await screen.findByPlaceholderText("Search frameworks...");
		await userEvent.click(search);
		await userEvent.type(search, "vu");

		const option = await screen.findByRole("option", {name: /vue/i});
		await userEvent.click(option);

		await waitFor(() => expect(trigger).toHaveTextContent("Vue"));
		// Picking an option must not take the dialog down with the popover.
		// Named, because the Combobox popover is itself role="dialog" and lingers in the DOM through its
		// exit animation — a bare getByRole("dialog") matches both and throws.
		expect(screen.getByRole("dialog", {name: "Edit worker"})).toBeInTheDocument();
	},
};

// ── Async data source ─────────────────────────────────────────────────────────

const TRADES = [
	"Carpenter",
	"Electrician",
	"Welder",
	"Plumber",
	"Mason",
	"Painter",
	"Steel Fixer",
	"Scaffolder",
	"Rigger",
	"Surveyor",
	"Crane Operator",
	"Concrete Finisher",
	"Glazier",
	"Roofer",
	"HVAC Technician",
	"Insulation Installer",
	"Drywall Installer",
	"Heavy Equipment Operator",
	"Site Foreman",
	"Safety Officer",
	"Pipefitter",
	"Ironworker",
	"Millwright",
	"Boilermaker",
];

const PAGE_SIZE = 6;

/** Stands in for the API: matches on the term, answers one page at a time, after a delay. */
function fetchTrades(term: string, page: number): Promise<{items: {value: string; label: string}[]; hasMore: boolean}> {
	const matches = TRADES.filter((t) => t.toLowerCase().includes(term.trim().toLowerCase()));
	const slice = matches.slice(0, page * PAGE_SIZE);
	return new Promise((resolve) =>
		setTimeout(
			() =>
				resolve({
					items: slice.map((label) => ({value: label.toLowerCase().replaceAll(" ", "-"), label})),
					hasMore: slice.length < matches.length,
				}),
			400,
		),
	);
}

/**
 * The shape a consumer whose options live behind an API needs: the server searches and pages, the
 * combobox displays what comes back. `onSearch` debounces the term and turns client-side filtering
 * off; `onLoadMore` fires when the list is scrolled to its end; `hasMore` stops it at the last page.
 */
export const AsyncDataSource: Story = {
	render: () => {
		const [term, setTerm] = React.useState("");
		const [page, setPage] = React.useState(1);
		const [options, setOptions] = React.useState<{value: string; label: string}[]>([]);
		const [hasMore, setHasMore] = React.useState(true);
		const [loading, setLoading] = React.useState(true);
		const [value, setValue] = React.useState("");

		React.useEffect(() => {
			let cancelled = false;
			setLoading(true);
			fetchTrades(term, page).then((result) => {
				if (cancelled) return;
				setOptions(result.items);
				setHasMore(result.hasMore);
				setLoading(false);
			});
			return () => {
				cancelled = true;
			};
		}, [term, page]);

		return (
			<Combobox
				options={options}
				value={value}
				onValueChange={setValue}
				loading={loading}
				hasMore={hasMore}
				onSearch={(next) => {
					// A new term is a new result set — back to page one.
					setPage(1);
					setTerm(next);
				}}
				onLoadMore={() => setPage((p) => p + 1)}
				placeholder="Select trade..."
				searchPlaceholder="Search trades..."
				emptyMessage="No trade found."
				className="wwc:w-[260px]"
				popoverClassName="wwc:w-[260px]"
			/>
		);
	},
};
