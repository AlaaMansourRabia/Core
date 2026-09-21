import {File, Folder, Globe, MapPin} from "lucide-react";
import {useState} from "react";

import {TreeRow} from "@/components/tree-row";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

// --- Interactive tree demo ---

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
	<File key="file" className="wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />,
];

function DemoTreeNode({
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
				fontWeight={level === 0 ? "wwc:font-semibold" : "wwc:font-medium"}
			/>
			{hasChildren &&
				isExpanded &&
				node.children!.map((child) => (
					<DemoTreeNode
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

function InteractiveDemo() {
	const [selected, setSelected] = useState<string | null>(null);
	const [expanded, setExpanded] = useState<Set<string>>(new Set(["r1", "s1"]));

	const toggleNode = (id: string) => {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	return (
		<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
			{demoTree.map((node) => (
				<DemoTreeNode
					key={node.id}
					node={node}
					level={0}
					selected={selected}
					onSelect={setSelected}
					expanded={expanded}
					onToggle={toggleNode}
				/>
			))}
		</div>
	);
}

// --- Page ---

export function TreeRowPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Tree Row</h1>
					<CopyButton
						value="Tree Row"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A single indented row used as the building block for tree and list views. Supports expand/collapse chevrons,
					icons, trailing content, and multiple visual variants. Used by the Area Tree and Floor Plan Editor components.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Interactive Tree</CardTitle>
						<CopyButton
							value="Tree Row - Interactive Tree"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						TreeRow wrapped in a recursive component to build a full interactive tree. Click to select, click expandable
						rows to toggle children.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<InteractiveDemo />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Variants</CardTitle>
						<CopyButton
							value="Tree Row - Variants"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Four built-in visual style variants.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:grid wwc:gap-4 wwc:sm:grid-cols-2">
						<div className="wwc:space-y-1 wwc:rounded-lg wwc:border wwc:p-3">
							<Badge variant="secondary" className="wwc:mb-2 wwc:text-[10px]">
								default
							</Badge>
							<TreeRow
								id="v-default"
								level={0}
								expandable
								expanded
								label="Default row"
								icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
							/>
							<p className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-1">Hover highlight. Standard tree row.</p>
						</div>
						<div className="wwc:space-y-1 wwc:rounded-lg wwc:border wwc:p-3">
							<Badge variant="secondary" className="wwc:mb-2 wwc:text-[10px]">
								active
							</Badge>
							<TreeRow
								id="v-active"
								level={0}
								label="Active row"
								variant="active"
								accentBorder="wwc:border-blue-500"
								icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-blue-500" />}
							/>
							<p className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-1">
								Blue background. Used for the current/active item.
							</p>
						</div>
						<div className="wwc:space-y-1 wwc:rounded-lg wwc:border wwc:p-3">
							<Badge variant="secondary" className="wwc:mb-2 wwc:text-[10px]">
								selected
							</Badge>
							<TreeRow
								id="v-selected"
								level={0}
								expandable
								expanded
								label="Selected row"
								variant="selected"
								icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
							/>
							<p className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-1">
								Blue background with blue ring. Elevated z-index.
							</p>
						</div>
						<div className="wwc:space-y-1 wwc:rounded-lg wwc:border wwc:p-3">
							<Badge variant="secondary" className="wwc:mb-2 wwc:text-[10px]">
								muted
							</Badge>
							<TreeRow
								id="v-muted"
								level={0}
								label="Muted row"
								variant="muted"
								icon={<File className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />}
							/>
							<p className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-1">
								No hover or background. Use with bgClassName for custom colors.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Indentation Levels</CardTitle>
						<CopyButton
							value="Tree Row - Indentation Levels"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Rows indent based on their level prop. Font weight defaults to semibold at level 0.
					</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Trailing Content</CardTitle>
						<CopyButton
							value="Tree Row - Trailing Content"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>The trailing prop renders content pushed to the right side of the row.</CardDescription>
				</CardHeader>
				<CardContent>
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
							accentBorder="wwc:border-blue-500"
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom Colors</CardTitle>
						<CopyButton
							value="Tree Row - Custom Colors"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Use bgClassName, textClassName, and chevronClassName to apply custom color schemes (e.g. level-based
						hierarchy colors).
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full wwc:max-w-md wwc:rounded-lg wwc:border wwc:bg-background wwc:p-1">
						<TreeRow
							id="c0"
							level={0}
							expandable
							expanded
							label="Region (blue)"
							variant="muted"
							bgClassName="wwc:bg-blue-50 wwc:hover:bg-blue-100"
							chevronClassName="wwc:text-blue-700"
							fontWeight="wwc:font-semibold"
						/>
						<TreeRow
							id="c1"
							level={1}
							expandable
							expanded
							label="Site (green)"
							variant="muted"
							bgClassName="wwc:bg-green-50 wwc:hover:bg-green-100"
							chevronClassName="wwc:text-green-700"
						/>
						<TreeRow
							id="c2"
							level={2}
							expandable
							label="Building (purple)"
							variant="muted"
							bgClassName="wwc:bg-purple-50 wwc:hover:bg-purple-100"
							chevronClassName="wwc:text-purple-700"
						/>
						<TreeRow
							id="c3"
							level={3}
							label="Floor (orange)"
							variant="muted"
							bgClassName="wwc:bg-orange-50 wwc:hover:bg-orange-100"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Tree Row - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Props for the TreeRow component.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "id", type: "string", def: "—", desc: "Unique identifier for the row."},
									{prop: "level", type: "number", def: "—", desc: "Indentation depth (0 = root)."},
									{prop: "expandable", type: "boolean", def: "false", desc: "Shows a chevron toggle."},
									{
										prop: "expanded",
										type: "boolean",
										def: "false",
										desc: "Whether the chevron points down (expanded).",
									},
									{prop: "onClick", type: "() => void", def: "—", desc: "Called when the row is clicked."},
									{prop: "icon", type: "ReactNode", def: "—", desc: "Icon element rendered after the chevron."},
									{prop: "label", type: "string", def: "—", desc: "Primary label text."},
									{
										prop: "trailing",
										type: "ReactNode",
										def: "—",
										desc: "Content pushed to the right (badges, counts).",
									},
									{
										prop: "variant",
										type: '"default" | "active" | "selected" | "muted"',
										def: '"default"',
										desc: "Visual style variant.",
									},
									{
										prop: "accentBorder",
										type: "string",
										def: "—",
										desc: 'Left border class (e.g. "wwc:border-blue-500").',
									},
									{prop: "bgClassName", type: "string", def: "—", desc: "Custom background class override."},
									{prop: "textClassName", type: "string", def: "—", desc: "Custom text color class override."},
									{
										prop: "fontWeight",
										type: "string",
										def: "level-based",
										desc: "Font weight class. Defaults to semibold at level 0, medium otherwise.",
									},
									{
										prop: "chevronClassName",
										type: "string",
										def: "wwc:text-muted-foreground",
										desc: "Custom chevron color class.",
									},
									{prop: "indentPx", type: "number", def: "20", desc: "Pixels of indent per level."},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
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
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Tree Row - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import { TreeRow } from "@/components/tree-row";

// Basic expandable row with icon and trailing content
<TreeRow
  id="node-1"
  level={0}
  expandable
  expanded
  icon={<Folder className="wwc:h-3.5 wwc:w-3.5 wwc:text-amber-500" />}
  label="Building A1"
  trailing={<span className="wwc:text-[10px]">3 shapes</span>}
  onClick={() => toggle("node-1")}
/>

// Active leaf with accent border
<TreeRow
  id="leaf-1"
  level={2}
  label="Ground Floor"
  variant="active"
  accentBorder="wwc:border-blue-500"
  trailing={<Badge variant="outline">Active</Badge>}
/>

// Custom level color (no default hover — use variant="muted")
<TreeRow
  id="colored"
  level={0}
  expandable
  label="Region"
  variant="muted"
  bgClassName="wwc:bg-blue-50 wwc:hover:bg-blue-100"
  chevronClassName="wwc:text-blue-700"
/>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
