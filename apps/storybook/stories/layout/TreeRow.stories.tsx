import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@wakecap/core-ui/badge";
import {TreeRow, TreeRowContent} from "@wakecap/core-ui/tree-row";
import {File, Folder, Globe, MapPin} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Layout/TreeRow",
	component: TreeRow,
	tags: ["autodocs"],
	argTypes: {
		level: {control: {type: "number", min: 0, max: 5}},
		expandable: {control: "boolean"},
		expanded: {control: "boolean"},
		variant: {
			control: "select",
			options: ["default", "active", "selected", "muted"],
		},
		groupPosition: {
			control: "select",
			options: [undefined, "first", "middle", "last"],
		},
		indentPx: {control: {type: "number", min: 0, max: 40}},
	},
	args: {
		id: "row-1",
		level: 0,
		label: "Tree Row",
		variant: "default",
	},
} satisfies Meta<typeof TreeRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
	args: {
		label: "Building A1",
		icon: <Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />,
	},
};

export const Expandable: Story = {
	args: {
		label: "Region Middle East",
		expandable: true,
		expanded: true,
		icon: <Globe className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />,
	},
};

export const WithTrailing: Story = {
	args: {
		label: "Building A1",
		expandable: true,
		expanded: true,
		icon: <Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />,
		trailing: <span className="wwc:text-[10px] wwc:text-muted-foreground">3 shapes</span>,
	},
};

export const Active: Story = {
	args: {
		label: "Active row",
		variant: "active",
		icon: <File className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />,
	},
};

export const Selected: Story = {
	args: {
		label: "Selected row",
		variant: "selected",
		icon: <Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />,
	},
};

export const Muted: Story = {
	args: {
		label: "Muted row",
		variant: "muted",
		icon: <File className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />,
	},
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
			<TreeRow
				id="v-default"
				level={0}
				label="Default row"
				icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
			/>
			<TreeRow
				id="v-active"
				level={0}
				label="Active row"
				variant="active"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />}
			/>
			<TreeRow
				id="v-selected"
				level={0}
				label="Selected row"
				variant="selected"
				icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
			/>
			<TreeRow
				id="v-muted"
				level={0}
				label="Muted row"
				variant="muted"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />}
			/>
		</div>
	),
};

export const IndentationLevels: Story = {
	render: () => (
		<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
			<TreeRow
				id="l0"
				level={0}
				expandable
				expanded
				label="Level 0 — Root"
				icon={<Globe className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />}
			/>
			<TreeRow
				id="l1"
				level={1}
				expandable
				expanded
				label="Level 1 — Site"
				icon={<MapPin className="wwc:h-3.5 wwc:w-3.5 wwc:text-green-500" />}
			/>
			<TreeRow
				id="l2"
				level={2}
				expandable
				label="Level 2 — Building"
				icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
			/>
			<TreeRow
				id="l3"
				level={3}
				label="Level 3 — Floor (leaf)"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />}
			/>
		</div>
	),
};

export const TrailingContent: Story = {
	render: () => (
		<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
			<TreeRow
				id="t1"
				level={0}
				expandable
				expanded
				label="Building A1"
				icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
				trailing={<span className="wwc:text-[10px] wwc:text-muted-foreground">3 shapes</span>}
			/>
			<TreeRow
				id="t2"
				level={1}
				label="Floor 1"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />}
				trailing={
					<Badge
						variant="outline"
						className="wwc:h-5 wwc:px-1.5 wwc:py-0 wwc:text-[10px] wwc:bg-green-50 wwc:text-green-700 wwc:border-green-200"
					>
						85% coverage
					</Badge>
				}
			/>
			<TreeRow
				id="t3"
				level={1}
				label="Floor 2"
				variant="active"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />}
				trailing={
					<Badge
						variant="outline"
						className="wwc:h-5 wwc:px-1.5 wwc:py-0 wwc:text-[10px] wwc:bg-emerald-50 wwc:text-emerald-700 wwc:border-emerald-200"
					>
						Active
					</Badge>
				}
			/>
		</div>
	),
};

export const SharedSelectionGroup: Story = {
	render: () => (
		<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
			<TreeRow
				id="g1"
				level={0}
				label="Polygon 1"
				variant="selected"
				groupPosition="first"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-orange-500" />}
			/>
			<TreeRow
				id="g2"
				level={0}
				label="Polygon 2"
				variant="selected"
				groupPosition="middle"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-orange-500" />}
			/>
			<TreeRow
				id="g3"
				level={0}
				label="Polygon 3"
				variant="selected"
				groupPosition="last"
				icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-orange-500" />}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"When multiple selected rows are adjacent, set `groupPosition` on each to collapse internal borders into a single shared blue outline around the group.",
			},
		},
	},
};

interface DemoNode {
	id: string;
	name: string;
	children?: DemoNode[];
}

const demoTree: DemoNode[] = [
	{
		id: "r1",
		name: "Region Middle East",
		children: [
			{
				id: "s1",
				name: "Site Alpha",
				children: [
					{id: "b1", name: "Building A1"},
					{id: "b2", name: "Building A2"},
				],
			},
			{id: "s2", name: "Site Beta"},
		],
	},
	{
		id: "r2",
		name: "Region Asia Pacific",
		children: [{id: "s3", name: "Site Gamma"}],
	},
];

const levelIcons = [
	<Globe key="globe" className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-blue-500" />,
	<MapPin key="pin" className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-green-500" />,
	<Folder key="folder" className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-amber-500" />,
];

function InteractiveTreeNode({
	node,
	level,
	selected,
	onSelect,
	expanded,
	onToggle,
}: {
	node: DemoNode;
	level: number;
	selected: string | null;
	onSelect: (id: string) => void;
	expanded: Set<string>;
	onToggle: (id: string) => void;
}) {
	const hasChildren = node.children && node.children.length > 0;
	const isExpanded = expanded.has(node.id);
	const isSelected = selected === node.id;

	return (
		<>
			<TreeRow
				id={node.id}
				level={level}
				expandable={!!hasChildren}
				expanded={isExpanded}
				onClick={() => onSelect(node.id)}
				onToggle={() => hasChildren && onToggle(node.id)}
				icon={levelIcons[Math.min(level, levelIcons.length - 1)]}
				label={node.name}
				variant={isSelected ? "selected" : "default"}
			/>
			{hasChildren &&
				isExpanded &&
				node.children!.map((child) => (
					<InteractiveTreeNode
						key={child.id}
						node={child}
						level={level + 1}
						selected={selected}
						onSelect={onSelect}
						expanded={expanded}
						onToggle={onToggle}
					/>
				))}
		</>
	);
}

export const Interactive: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState<string | null>(null);
			const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1"]));
			const toggle = (id: string) =>
				setExpanded((prev) => {
					const next = new Set(prev);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					return next;
				});
			return (
				<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
					{demoTree.map((node) => (
						<InteractiveTreeNode
							key={node.id}
							node={node}
							level={0}
							selected={selected}
							onSelect={setSelected}
							expanded={expanded}
							onToggle={toggle}
						/>
					))}
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {
			description: {
				story:
					"Click a row body to select. Click the chevron or label to expand/collapse. The split makes selection and expansion independent.",
			},
		},
	},
};

export const TreeRowContentInTable: Story = {
	render: () => (
		<table className="wwc:w-full wwc:max-w-md wwc:border wwc:rounded-lg wwc:overflow-hidden">
			<thead className="wwc:bg-muted/50">
				<tr>
					<th className="wwc:text-left wwc:p-2 wwc:text-[10px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
						Name
					</th>
					<th className="wwc:text-left wwc:p-2 wwc:text-[10px] wwc:uppercase wwc:tracking-wider wwc:text-muted-foreground">
						Type
					</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td className="wwc:p-2">
						<TreeRowContent
							level={0}
							expandable
							expanded
							label="Region Middle East"
							icon={<Globe className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />}
						/>
					</td>
					<td className="wwc:p-2 wwc:text-sm wwc:text-muted-foreground">Region</td>
				</tr>
				<tr>
					<td className="wwc:p-2">
						<TreeRowContent
							level={1}
							expandable
							expanded
							label="Site Alpha"
							icon={<MapPin className="wwc:h-3.5 wwc:w-3.5 wwc:text-green-500" />}
						/>
					</td>
					<td className="wwc:p-2 wwc:text-sm wwc:text-muted-foreground">Site</td>
				</tr>
				<tr>
					<td className="wwc:p-2">
						<TreeRowContent
							level={2}
							label="Building A1"
							icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
						/>
					</td>
					<td className="wwc:p-2 wwc:text-sm wwc:text-muted-foreground">Building</td>
				</tr>
			</tbody>
		</table>
	),
	parameters: {
		docs: {
			description: {
				story:
					"`TreeRowContent` is the inner part of TreeRow without the row chrome (background, padding, click handlers). Use it to embed tree-row layout inside a custom container like a TableCell.",
			},
		},
	},
};
