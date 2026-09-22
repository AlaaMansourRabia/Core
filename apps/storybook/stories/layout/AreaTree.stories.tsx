import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/core-ui/badge";
import {Button} from "@corensystem/core-ui/button";
import {SearchFilterBar, type SearchFilterBarFilter} from "@corensystem/core-ui/search-filter-bar";
import {TreeRow} from "@corensystem/core-ui/tree-row";
import {cn} from "@corensystem/core-utils";
import {ChevronsDown, ChevronsUp, Paperclip} from "lucide-react";
import {useState} from "react";

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

const levelStyles = [
	{bg: "wwc:bg-blue-50", chevron: "wwc:text-blue-700", label: "Level 0"},
	{bg: "wwc:bg-green-50", chevron: "wwc:text-green-700", label: "Level 1"},
	{bg: "wwc:bg-purple-50", chevron: "wwc:text-purple-700", label: "Level 2"},
	{bg: "wwc:bg-orange-50", chevron: "wwc:text-orange-700", label: "Level 3"},
];

const filterCategories: SearchFilterBarFilter[] = [
	{id: "category-a", label: "Category A"},
	{id: "category-b", label: "Category B"},
	{id: "category-c", label: "Category C"},
	{id: "category-d", label: "Category D"},
];

function collectIds(nodes: TreeNode[]): string[] {
	const ids: string[] = [];
	for (const node of nodes) {
		ids.push(node.id);
		if (node.children) ids.push(...collectIds(node.children));
	}
	return ids;
}

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

function coverageColors(coverage: number): {text: string; track: string; fill: string} {
	if (coverage >= 50) return {text: "wwc:text-green-700", track: "wwc:bg-green-100", fill: "wwc:bg-green-500"};
	if (coverage > 0) return {text: "wwc:text-amber-700", track: "wwc:bg-amber-100", fill: "wwc:bg-amber-500"};
	return {text: "wwc:text-red-600", track: "wwc:bg-red-100", fill: "wwc:bg-red-500"};
}

interface AreaTableProps {
	expanded: Set<string>;
	onToggle: (id: string) => void;
	selected: string | null;
	onSelect: (id: string) => void;
	useLevelColors?: boolean;
}

function AreaTable({expanded, onToggle, selected, onSelect, useLevelColors}: AreaTableProps) {
	const rows = flattenTree(sampleTree, expanded);

	return (
		<div className="wwc:p-1">
			<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:px-2 wwc:py-1.5 wwc:text-[10px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
				<span className="wwc:flex-1">Name</span>
				<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center wwc:gap-1">
					<Paperclip className="wwc:h-3 wwc:w-3" />
					Attachments
				</span>
				<span className="wwc:flex wwc:w-24 wwc:items-center wwc:justify-center">Coverage</span>
			</div>

			{rows.map(({node, level}) => {
				const hasChildren = !!node.children?.length;
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

				return (
					<TreeRow
						key={node.id}
						id={node.id}
						level={level}
						expandable={hasChildren}
						expanded={expanded.has(node.id)}
						onClick={() => onSelect(node.id)}
						onToggle={() => hasChildren && onToggle(node.id)}
						label={node.name}
						variant={variant}
						bgClassName={bgClassName}
						chevronClassName={chevronClassName}
						indentPx={20}
						trailing={
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
						}
					/>
				);
			})}
		</div>
	);
}

function AreaTreeDemo({useLevelColors}: {useLevelColors?: boolean}) {
	const [selected, setSelected] = useState<string | null>("f1");
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1", "b1"]));
	const [search, setSearch] = useState("");
	const [activeFilterId, setActiveFilterId] = useState<string | undefined>("category-a");
	const allIds = collectIds(sampleTree);

	const toggleNode = (id: string) =>
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	return (
		<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
			<SearchFilterBar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search areas..."
				filters={useLevelColors ? undefined : filterCategories}
				activeFilterId={activeFilterId}
				onActiveFilterChange={setActiveFilterId}
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
			{useLevelColors && (
				<div className="wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2 wwc:border-b wwc:text-xs">
					<span className="wwc:font-semibold wwc:text-foreground">Legend:</span>
					{levelStyles.map((style) => (
						<div key={style.label} className="wwc:flex wwc:items-center wwc:gap-1.5">
							<span className={cn("wwc:inline-block wwc:h-3 wwc:w-3 wwc:rounded-sm wwc:border", style.bg)} />
							<span className={cn("wwc:font-medium", style.chevron)}>{style.label}</span>
						</div>
					))}
				</div>
			)}
			<AreaTable
				expanded={expanded}
				onToggle={toggleNode}
				selected={selected}
				onSelect={setSelected}
				useLevelColors={useLevelColors}
			/>
		</div>
	);
}

const meta = {
	title: "Components/Layout/Area Tree",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Hierarchical area browser composed from `TreeRow` + `SearchFilterBar`. Renders an indented tree with name, attachment count, and coverage columns. Pairs filter chips at the top with an inline expand/collapse-all toolbar.",
			},
		},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FilterChips: Story = {
	render: () => <AreaTreeDemo />,
	parameters: {
		docs: {
			description: {
				story: "Default variant: filter chips drive search refinement; selection state highlights one row.",
			},
		},
	},
};

export const LevelLegend: Story = {
	render: () => <AreaTreeDemo useLevelColors />,
	parameters: {
		docs: {
			description: {
				story: "Alternate variant: each tree depth gets its own background tint plus a legend bar.",
			},
		},
	},
};

export const Tags: Story = {
	render: () => {
		function TagsDemo() {
			const [selected, setSelected] = useState<string | null>("f1");
			const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1", "b1"]));
			const [search, setSearch] = useState("");
			const allIds = collectIds(sampleTree);

			const toggleNode = (id: string) =>
				setExpanded((prev) => {
					const next = new Set(prev);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					return next;
				});

			const rows = flattenTree(sampleTree, expanded);

			return (
				<div className="wwc:w-full wwc:max-w-lg wwc:rounded-lg wwc:border wwc:bg-background">
					<SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search areas..." />
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
					<div className="wwc:p-1">
						{rows.map(({node, level}) => {
							const hasChildren = !!node.children?.length;
							const isSelected = selected === node.id;
							const coverage = node.coverage;
							const cov = coverage !== undefined ? coverageColors(coverage) : null;

							return (
								<TreeRow
									key={node.id}
									id={node.id}
									level={level}
									expandable={hasChildren}
									expanded={expanded.has(node.id)}
									onClick={() => setSelected(node.id)}
									onToggle={() => hasChildren && toggleNode(node.id)}
									label={node.name}
									variant={isSelected ? "selected" : "default"}
									indentPx={20}
									trailing={
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
									}
								/>
							);
						})}
					</div>
				</div>
			);
		}
		return <TagsDemo />;
	},
	parameters: {
		docs: {
			description: {
				story: "Trailing metadata as inline tag pills instead of a fixed-column table.",
			},
		},
	},
};
