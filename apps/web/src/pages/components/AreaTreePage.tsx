import {ChevronsDown, ChevronsUp, Paperclip} from "lucide-react";
import {useState} from "react";

import {TreeRow} from "@/components/tree-row";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {SearchFilterBar, type SearchFilterBarFilter} from "@/components/ui/search-filter-bar";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {cn} from "@/lib/utils";

// --- Level color config (used in Variant B) ---

interface LevelStyle {
	bg: string;
	chevron: string;
	label: string;
}

const levelStyles: LevelStyle[] = [
	{bg: "wwc:bg-blue-50", chevron: "wwc:text-blue-700", label: "Level 0"},
	{bg: "wwc:bg-green-50", chevron: "wwc:text-green-700", label: "Level 1"},
	{bg: "wwc:bg-purple-50", chevron: "wwc:text-purple-700", label: "Level 2"},
	{bg: "wwc:bg-orange-50", chevron: "wwc:text-orange-700", label: "Level 3"},
];

// --- Tree data ---

interface TreeNode {
	id: string;
	name: string;
	attachmentCount?: number;
	coverage?: number;
	children?: TreeNode[];
}

const sampleTree: TreeNode[] = [
	{
		id: "r1",
		name: "Region Middle East",
		attachmentCount: 1,
		coverage: 0,
		children: [
			{
				id: "s1",
				name: "Site Alpha",
				attachmentCount: 4,
				coverage: 1,
				children: [
					{
						id: "b1",
						name: "Building A1",
						attachmentCount: 1,
						children: [
							{id: "f1", name: "Floor 1", coverage: 85},
							{id: "f2", name: "Floor 2", attachmentCount: 1},
							{id: "f3", name: "Floor 3"},
						],
					},
					{id: "b2", name: "Building A2"},
				],
			},
			{
				id: "s2",
				name: "Site Beta",
				attachmentCount: 2,
				coverage: 42,
				children: [{id: "b3", name: "Building B1", attachmentCount: 1, coverage: 60}],
			},
		],
	},
	{
		id: "r2",
		name: "Region Asia Pacific",
		coverage: 15,
		children: [
			{id: "s3", name: "Site Gamma", attachmentCount: 1},
			{id: "s4", name: "Site Delta"},
		],
	},
];

// --- Helpers ---

function collectIds(nodes: TreeNode[]): string[] {
	const ids: string[] = [];
	for (const node of nodes) {
		ids.push(node.id);
		if (node.children) ids.push(...collectIds(node.children));
	}
	return ids;
}

function coverageColors(coverage: number): {text: string; track: string; fill: string} {
	if (coverage >= 50) return {text: "wwc:text-green-700", track: "wwc:bg-green-100", fill: "wwc:bg-green-500"};
	if (coverage > 0) return {text: "wwc:text-amber-700", track: "wwc:bg-amber-100", fill: "wwc:bg-amber-500"};
	return {text: "wwc:text-red-600", track: "wwc:bg-red-100", fill: "wwc:bg-red-500"};
}

// --- Tree row inside table ---

function flattenTree(nodes: TreeNode[], expanded: Set<string>, level = 0): {node: TreeNode; level: number}[] {
	const out: {node: TreeNode; level: number}[] = [];
	for (const node of nodes) {
		out.push({node, level});
		if (node.children && expanded.has(node.id)) {
			out.push(...flattenTree(node.children, expanded, level + 1));
		}
	}
	return out;
}

interface AreaTableProps {
	expanded: Set<string>;
	onToggle: (id: string) => void;
	selected: string | null;
	onSelect: (id: string) => void;
	useLevelColors?: boolean;
	presentation?: "table" | "tags";
}

function AreaTable({expanded, onToggle, selected, onSelect, useLevelColors, presentation = "table"}: AreaTableProps) {
	const rows = flattenTree(sampleTree, expanded);
	const isTable = presentation === "table";

	return (
		<div className="wwc:p-1">
			{/* Column headers (table presentation only) */}
			{isTable && (
				<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:px-2 wwc:py-1.5 wwc:text-[10px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
					<span className="wwc:flex-1">Name</span>
					<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center wwc:gap-1">
						<Paperclip className="wwc:h-3 wwc:w-3" />
						Attachments
					</span>
					<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center wwc:gap-1">Coverage</span>
				</div>
			)}

			{rows.map(({node, level}) => {
				const hasChildren = node.children && node.children.length > 0;
				const isSelected = selected === node.id;
				const style = levelStyles[Math.min(level, levelStyles.length - 1)];
				const coverage = node.coverage;
				const cov = coverage !== undefined ? coverageColors(coverage) : null;

				let variant: "default" | "selected" | "muted" = "default";
				let bgClassName: string | undefined;
				let chevronClassName: string | undefined;

				if (useLevelColors) {
					chevronClassName = style.chevron;
					if (isSelected) {
						variant = "selected";
					} else {
						variant = "muted";
						bgClassName = `${style.bg} wwc:hover:opacity-90`;
					}
				} else if (isSelected) {
					variant = "selected";
				}

				const tableTrailing = (
					<>
						<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center wwc:text-muted-foreground">
							{node.attachmentCount !== undefined && (
								<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5">
									<Paperclip className="wwc:h-3.5 wwc:w-3.5" />
									{node.attachmentCount}
								</span>
							)}
						</span>
						<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center">
							{cov && coverage !== undefined && (
								<span className={cn("wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:font-medium", cov.text)}>
									<span className={cn("wwc:h-1.5 wwc:w-10 wwc:overflow-hidden wwc:rounded-full", cov.track)}>
										<span
											className={cn("wwc:block wwc:h-full wwc:rounded-full", cov.fill)}
											style={{width: `${coverage}%`}}
										/>
									</span>
									{coverage}%
								</span>
							)}
						</span>
					</>
				);

				const tagTrailing = (
					<span className="wwc:flex wwc:items-center wwc:gap-1.5">
						{node.attachmentCount !== undefined && (
							<Badge
								variant="outline"
								className="wwc:h-5 wwc:px-1.5 wwc:py-0 wwc:text-[10px] wwc:bg-green-50 wwc:text-green-700 wwc:border-green-200"
							>
								{node.attachmentCount === 1 ? "Has attachment" : `Has attachment (${node.attachmentCount})`}
							</Badge>
						)}
						{coverage !== undefined && cov && (
							<Badge
								variant="outline"
								className={cn(
									"wwc:h-5 wwc:px-1.5 wwc:py-0 wwc:text-[10px]",
									coverage >= 50
										? "wwc:bg-green-50 wwc:text-green-700 wwc:border-green-200"
										: coverage > 0
											? "wwc:bg-amber-50 wwc:text-amber-700 wwc:border-amber-200"
											: "wwc:bg-muted wwc:text-muted-foreground",
								)}
							>
								{coverage}% coverage
							</Badge>
						)}
					</span>
				);

				return (
					<TreeRow
						key={node.id}
						id={node.id}
						level={level}
						expandable={!!hasChildren}
						expanded={expanded.has(node.id)}
						onClick={() => onSelect(node.id)}
						onToggle={() => hasChildren && onToggle(node.id)}
						label={node.name}
						variant={variant}
						bgClassName={bgClassName}
						chevronClassName={chevronClassName}
						indentPx={20}
						trailing={isTable ? tableTrailing : tagTrailing}
					/>
				);
			})}
		</div>
	);
}

// --- Toolbar shared between variants ---

function Toolbar({
	expanded,
	setExpanded,
	search,
	setSearch,
	filters,
	activeFilterId,
	onActiveFilterChange,
}: {
	expanded: Set<string>;
	setExpanded: (s: Set<string>) => void;
	search: string;
	setSearch: (s: string) => void;
	filters?: SearchFilterBarFilter[];
	activeFilterId?: string;
	onActiveFilterChange?: (id: string | undefined) => void;
}) {
	const allIds = collectIds(sampleTree);
	void expanded;

	return (
		<>
			<SearchFilterBar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search areas..."
				filters={filters}
				activeFilterId={activeFilterId}
				onActiveFilterChange={onActiveFilterChange}
			/>
			<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-3 wwc:py-2 wwc:border-b">
				<Button variant="outline" size="sm" onClick={() => setExpanded(new Set(allIds))}>
					<ChevronsDown />
					Expand All
				</Button>
				<Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
					<ChevronsUp />
					Collapse All
				</Button>
			</div>
		</>
	);
}

// --- Filter chip categories ---

const filterCategories: SearchFilterBarFilter[] = [
	{id: "category-a", label: "Category A"},
	{id: "category-b", label: "Category B"},
	{id: "category-c", label: "Category C"},
	{id: "category-d", label: "Category D"},
];

// --- Variant A: Filter Chips ---

function VariantAFilterChips({presentation}: {presentation: "table" | "tags"}) {
	const [selected, setSelected] = useState<string | null>("f1");
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1", "b1"]));
	const [search, setSearch] = useState("");
	const [activeFilterId, setActiveFilterId] = useState<string | undefined>("category-a");

	const toggleNode = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
			<Toolbar
				expanded={expanded}
				setExpanded={setExpanded}
				search={search}
				setSearch={setSearch}
				filters={filterCategories}
				activeFilterId={activeFilterId}
				onActiveFilterChange={setActiveFilterId}
			/>
			<AreaTable
				expanded={expanded}
				onToggle={toggleNode}
				selected={selected}
				onSelect={setSelected}
				presentation={presentation}
			/>
		</div>
	);
}

// --- Variant B: Level Legend ---

function LevelLegendBar() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:border-b wwc:text-xs">
			<span className="wwc:font-semibold wwc:text-foreground">Legend:</span>
			{levelStyles.map((style) => (
				<div key={style.label} className="wwc:flex wwc:items-center wwc:gap-1.5">
					<span className={cn("wwc:inline-block wwc:h-3 wwc:w-3 wwc:rounded-sm wwc:border", style.bg)} />
					<span className={cn("wwc:font-medium", style.chevron)}>{style.label}</span>
				</div>
			))}
		</div>
	);
}

function VariantBLevelLegend({presentation}: {presentation: "table" | "tags"}) {
	const [selected, setSelected] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1", "b1"]));
	const [search, setSearch] = useState("");

	const toggleNode = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
			<Toolbar expanded={expanded} setExpanded={setExpanded} search={search} setSearch={setSearch} />
			<LevelLegendBar />
			<AreaTable
				expanded={expanded}
				onToggle={toggleNode}
				selected={selected}
				onSelect={setSelected}
				useLevelColors
				presentation={presentation}
			/>
		</div>
	);
}

// --- Page ---

export function AreaTreePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Area Tree</h1>
					<CopyButton
						value="Area Tree"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Hierarchical area browser rendered as a table with name, attachments, and coverage columns. Two variants:
					filter chips for interactive filtering, or a level legend for visual hierarchy clarity.
				</p>
			</div>

			<Tabs defaultValue="variant-a">
				<TabsList>
					<TabsTrigger value="variant-a">Variant A — Filter Chips</TabsTrigger>
					<TabsTrigger value="variant-b">Variant B — Level Legend</TabsTrigger>
				</TabsList>

				<TabsContent value="variant-a" className="wwc:mt-6 wwc:space-y-6">
					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Filter Chips — Table</CardTitle>
								<CopyButton
									value="Area Tree - Filter Chips — Table"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>
								Tabular layout with name, attachments, and coverage columns. Filter chips at the top toggle category
								filters; the tree column uses indentation and chevrons to show hierarchy.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VariantAFilterChips presentation="table" />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Filter Chips — Tags</CardTitle>
								<CopyButton
									value="Area Tree - Filter Chips — Tags"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>
								Same tree, but attachments and coverage are rendered as inline badges next to each row instead of
								aligned columns. Use this when the dataset is sparse and you want each row's metadata to read naturally
								rather than as a strict tabular layout.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VariantAFilterChips presentation="tags" />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="variant-b" className="wwc:mt-6 wwc:space-y-6">
					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Level Legend — Table</CardTitle>
								<CopyButton
									value="Area Tree - Level Legend — Table"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>
								Same table layout but rows are tinted by hierarchy level. The legend bar maps each color to its level.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VariantBLevelLegend presentation="table" />
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Level Legend — Tags</CardTitle>
								<CopyButton
									value="Area Tree - Level Legend — Tags"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>
								Level-tinted rows with metadata shown as inline badges instead of aligned columns.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<VariantBLevelLegend presentation="tags" />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>When to Use Each Variant</CardTitle>
						<CopyButton
							value="Area Tree - When to Use Each Variant"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
						<div className="wwc:rounded-lg wwc:border-2 wwc:border-blue-200 wwc:p-4 wwc:space-y-2">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Badge className="wwc:bg-blue-100 wwc:text-blue-800 wwc:hover:bg-blue-100">Variant A</Badge>
								<span className="wwc:font-semibold">Filter Chips</span>
							</div>
							<ul className="wwc:text-sm wwc:text-muted-foreground wwc:space-y-1">
								<li>User needs to filter the tree by category/level</li>
								<li>Multiple filter dimensions (level, status, type)</li>
								<li>Interactive exploration workflows</li>
								<li>Power users who want to narrow down large trees</li>
							</ul>
						</div>
						<div className="wwc:rounded-lg wwc:border-2 wwc:border-purple-200 wwc:p-4 wwc:space-y-2">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Badge className="wwc:bg-purple-100 wwc:text-purple-800 wwc:hover:bg-purple-100">Variant B</Badge>
								<span className="wwc:font-semibold">Level Legend</span>
							</div>
							<ul className="wwc:text-sm wwc:text-muted-foreground wwc:space-y-1">
								<li>Read-only / display-focused views</li>
								<li>First-time users who need to understand the hierarchy</li>
								<li>Simpler interface with fewer interactive elements</li>
								<li>Small-to-medium trees where filtering isn't necessary</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Area Tree - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { TreeRow } from "@/components/tree-row";

// Column headers (aligned with the trailing column widths below)
<div className="flex items-center gap-1.5 px-2 py-1.5">
  <span className="flex-1">Name</span>
  <span className="w-24 text-center">Attachments</span>
  <span className="w-24 text-center">Coverage</span>
</div>

// Each row is a TreeRow with two trailing columns
{flatRows.map(({ node, level }) => (
  <TreeRow
    key={node.id} id={node.id} level={level}
    expandable={hasChildren} expanded={isExpanded}
    label={node.name}
    onClick={() => onSelect(node.id)}
    onToggle={() => onToggle(node.id)}
    variant={isSelected ? "selected" : "default"}
    trailing={
      <>
        <span className="w-24 text-center">{node.attachmentCount}</span>
        <span className="w-24 text-center">{node.coverage}%</span>
      </>
    }
  />
))}`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
