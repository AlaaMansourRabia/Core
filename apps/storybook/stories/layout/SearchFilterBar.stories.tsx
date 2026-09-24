import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@corensystem/coren-ui/filter";
import {SearchFilterBar, type SearchFilterBarFilter} from "@corensystem/coren-ui/search-filter-bar";
import {Plus} from "lucide-react";
import {useState} from "react";

const sampleFilters: SearchFilterBarFilter[] = [
	{id: "category-a", label: "Category A", count: 24},
	{id: "category-b", label: "Category B", count: 8},
	{id: "category-c", label: "Category C"},
	{id: "category-d", label: "Category D"},
];

const meta = {
	title: "Widgets/Data/SearchFilterBar",
	component: SearchFilterBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Combined search input + filter chip strip. Use as the top toolbar of a list, table, or tree view. Search and active filter are controlled state owned by the parent.",
			},
		},
	},
	args: {
		search: "",
		searchPlaceholder: "Search areas...",
	},
} satisfies Meta<typeof SearchFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState(args.search ?? "");
			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar {...args} search={search} onSearchChange={setSearch} />
				</div>
			);
		}
		return <Demo />;
	},
};

export const WithFilters: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState("");
			const [activeFilterId, setActiveFilterId] = useState<string | undefined>("category-a");
			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar
						{...args}
						search={search}
						onSearchChange={setSearch}
						filters={sampleFilters}
						activeFilterId={activeFilterId}
						onActiveFilterChange={setActiveFilterId}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "With a list of filter chips. Clicking the active chip again deselects it (emits `undefined`).",
			},
		},
	},
};

export const WithTrailing: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState("");
			const [activeFilterId, setActiveFilterId] = useState<string | undefined>();
			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar
						{...args}
						search={search}
						onSearchChange={setSearch}
						filters={sampleFilters}
						activeFilterId={activeFilterId}
						onActiveFilterChange={setActiveFilterId}
						trailing={
							<Button size="sm" variant="outline">
								<Plus />
								New
							</Button>
						}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Use the `trailing` slot to render action buttons next to the search input.",
			},
		},
	},
};

export const WithFilterComposite: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState("");
			const [applied, setApplied] = useState<FilterValue>({});
			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar
						{...args}
						search={search}
						onSearchChange={setSearch}
						trailing={
							<Filter value={applied} onChange={setApplied}>
								<FilterTrigger />
								<FilterContent>
									<FilterCategory value="category" label="Category">
										{sampleFilters.map((f) => (
											<FilterOption key={f.id} value={f.id}>
												{f.label}
											</FilterOption>
										))}
									</FilterCategory>
								</FilterContent>
							</Filter>
						}
					/>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Drop the `Filter` composite into the `trailing` slot and omit `filters` — the chip strip is replaced with a popover-driven icon button.",
			},
		},
	},
};

export const SearchOnly: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState("");
			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar {...args} search={search} onSearchChange={setSearch} />
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Omit `filters` to render the search input alone — the chip row is hidden.",
			},
		},
	},
};

export const Controlled: Story = {
	render: (args) => {
		function Demo() {
			const [search, setSearch] = useState("alpha");
			const [activeFilterId, setActiveFilterId] = useState<string | undefined>("category-b");
			return (
				<div className="wwc:flex wwc:flex-col wwc:gap-3 wwc:w-full wwc:max-w-lg">
					<div className="wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar
							{...args}
							search={search}
							onSearchChange={setSearch}
							filters={sampleFilters}
							activeFilterId={activeFilterId}
							onActiveFilterChange={setActiveFilterId}
						/>
					</div>
					<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:text-xs wwc:text-muted-foreground wwc:font-mono">
						<div>search: {JSON.stringify(search)}</div>
						<div>activeFilterId: {JSON.stringify(activeFilterId)}</div>
					</div>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Fully controlled. Both `search` and `activeFilterId` are owned by the parent — the bar is a pure render of that state.",
			},
		},
	},
};
