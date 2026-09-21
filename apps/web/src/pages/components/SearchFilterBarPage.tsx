import {Filter as FilterIcon, MoreVertical, Plus} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
	Filter,
	FilterCategory,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "@/components/ui/filter";
import {SearchFilterBar, type SearchFilterBarFilter} from "@/components/ui/search-filter-bar";

const sampleFilters: SearchFilterBarFilter[] = [
	{id: "all", label: "All", count: 24},
	{id: "open", label: "Open", count: 18},
	{id: "done", label: "Done", count: 6},
];

const tagFilters: SearchFilterBarFilter[] = [
	{id: "category-a", label: "Category A"},
	{id: "category-b", label: "Category B"},
	{id: "category-c", label: "Category C"},
	{id: "category-d", label: "Category D"},
];

export function SearchFilterBarPage() {
	const [searchA, setSearchA] = useState("");
	const [searchB, setSearchB] = useState("");
	const [filterB, setFilterB] = useState<string | undefined>("all");
	const [searchC, setSearchC] = useState("");
	const [filterC, setFilterC] = useState<string | undefined>();
	const [searchD, setSearchD] = useState("alpha");
	const [filterD, setFilterD] = useState<string | undefined>("category-b");
	const [searchE, setSearchE] = useState("");
	const [filterE, setFilterE] = useState<FilterValue>({status: ["open"]});
	const [searchF, setSearchF] = useState("");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Search Filter Bar</h1>
					<CopyButton
						value="Search Filter Bar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Combined search input + filter chip strip. Use as the top toolbar of any list, table, or tree view. Search and
					active filter are controlled state owned by the parent. Composes{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Input</code> and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Chip</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Search Filter Bar - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Search only — omit the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">filters</code> prop
						and the chip row is hidden.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar search={searchA} onSearchChange={setSearchA} searchPlaceholder="Search items..." />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With filters</CardTitle>
						<CopyButton
							value="Search Filter Bar - With filters"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">filters</code> and a controlled{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">activeFilterId</code>. Single-select —
						clicking the active chip again deselects it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar
							search={searchB}
							onSearchChange={setSearchB}
							searchPlaceholder="Search tasks..."
							filters={sampleFilters}
							activeFilterId={filterB}
							onActiveFilterChange={setFilterB}
						/>
					</div>
					<p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">
						Active filter id: <code className="wwc:rounded wwc:bg-muted wwc:px-1">{JSON.stringify(filterB)}</code>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With trailing slot</CardTitle>
						<CopyButton
							value="Search Filter Bar - With trailing slot"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Use <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">trailing</code> to render action buttons
						next to the search input — kebab menus, "New" buttons, advanced-filter triggers, etc.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar
							search={searchC}
							onSearchChange={setSearchC}
							searchPlaceholder="Search areas..."
							filters={tagFilters}
							activeFilterId={filterC}
							onActiveFilterChange={setFilterC}
							trailing={
								<>
									<Button size="sm" variant="outline">
										<Plus />
										New
									</Button>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button icon variant="ghost" className="wwc:h-8 wwc:w-8" aria-label="More actions">
												<MoreVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem>
												<FilterIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
												Advanced filters
											</DropdownMenuItem>
											<DropdownMenuItem>Import…</DropdownMenuItem>
											<DropdownMenuItem>Export…</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</>
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Filter composite in trailing slot</CardTitle>
						<CopyButton
							value="Search Filter Bar - Filter composite in trailing slot"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Drop the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Filter</code> composite into{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">trailing</code> and omit{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">filters</code> — the result is a search
						input with a popover-driven filter button, no chip strip below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar
							search={searchE}
							onSearchChange={setSearchE}
							searchPlaceholder="Search tasks..."
							trailing={
								<Filter value={filterE} onChange={setFilterE}>
									<FilterTrigger />
									<FilterContent>
										<FilterCategory value="status" label="Status">
											<FilterOption value="all">All</FilterOption>
											<FilterOption value="open">Open</FilterOption>
											<FilterOption value="done">Done</FilterOption>
										</FilterCategory>
									</FilterContent>
								</Filter>
							}
						/>
					</div>
					<p className="wwc:mt-3 wwc:text-xs wwc:text-muted-foreground">
						Applied: <code className="wwc:rounded wwc:bg-muted wwc:px-1">{JSON.stringify(filterE)}</code>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Search only — no chips</CardTitle>
						<CopyButton
							value="Search Filter Bar - Search only - no chips"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Omit the <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">filters</code> prop entirely. The
						chip row is hidden and only the search input is rendered — same chrome as the other variants so it lines up
						inside panels and toolbars.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
						<SearchFilterBar search={searchF} onSearchChange={setSearchF} searchPlaceholder="Search items..." />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Search Filter Bar - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Both <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">search</code> and{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">activeFilterId</code> are owned by the
						parent — the bar is a pure render of that state. No internal state.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:max-w-lg wwc:flex-col wwc:gap-3">
						<div className="wwc:rounded-lg wwc:border wwc:bg-background">
							<SearchFilterBar
								search={searchD}
								onSearchChange={setSearchD}
								searchPlaceholder="Search..."
								filters={tagFilters}
								activeFilterId={filterD}
								onActiveFilterChange={setFilterD}
							/>
						</div>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:text-xs wwc:font-mono wwc:text-muted-foreground">
							<div>search: {JSON.stringify(searchD)}</div>
							<div>activeFilterId: {JSON.stringify(filterD)}</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Search Filter Bar - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "search", type: "string", def: "—", desc: "Controlled value of the search input."},
									{
										prop: "onSearchChange",
										type: "(next: string) => void",
										def: "—",
										desc: "Called whenever the user types into the search input.",
									},
									{
										prop: "searchPlaceholder",
										type: "string",
										def: '"Search..."',
										desc: "Placeholder text shown when the search input is empty.",
									},
									{
										prop: "filters",
										type: "SearchFilterBarFilter[]",
										def: "—",
										desc: "Optional list of filter chips. Omit or pass an empty array to hide the chip row entirely.",
									},
									{
										prop: "activeFilterId",
										type: "string | undefined",
										def: "—",
										desc: "Id of the currently active filter, or undefined for no selection.",
									},
									{
										prop: "onActiveFilterChange",
										type: "(id: string | undefined) => void",
										def: "—",
										desc: "Fires when a chip is toggled. Clicking the active chip again emits undefined.",
									},
									{
										prop: "trailing",
										type: "ReactNode",
										def: "—",
										desc: "Content rendered to the right of the search input. Drop the Filter composite here for a popover-style filter button.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="wwc:mt-4">
						<h4 className="wwc:text-sm wwc:font-semibold wwc:mb-2">SearchFilterBarFilter</h4>
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Field</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								<tr className="wwc:border-b wwc:border-border">
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary">id</td>
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">string</td>
									<td className="wwc:py-3 wwc:text-muted-foreground">
										Stable identifier referenced by activeFilterId.
									</td>
								</tr>
								<tr className="wwc:border-b wwc:border-border">
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary">label</td>
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">string</td>
									<td className="wwc:py-3 wwc:text-muted-foreground">Visible chip text.</td>
								</tr>
								<tr className="wwc:last:border-b-0">
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary">count</td>
									<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">number</td>
									<td className="wwc:py-3 wwc:text-muted-foreground">
										Optional count rendered after the label as " 24".
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Search Filter Bar - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-sm">
						{`import { SearchFilterBar, type SearchFilterBarFilter } from "@/components/ui/search-filter-bar";

const filters: SearchFilterBarFilter[] = [
  { id: "all", label: "All", count: 24 },
  { id: "open", label: "Open", count: 18 },
  { id: "done", label: "Done", count: 6 },
];

function Toolbar() {
  const [search, setSearch] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string | undefined>("all");

  return (
    <SearchFilterBar
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search tasks..."
      filters={filters}
      activeFilterId={activeFilterId}
      onActiveFilterChange={setActiveFilterId}
    />
  );
}`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
