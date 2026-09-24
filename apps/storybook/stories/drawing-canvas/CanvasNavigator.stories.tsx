import type {Meta, StoryObj} from "storybook/internal/types";

import {
	CanvasNavigator,
	type CanvasNavigatorNode,
	type CanvasNavigatorSize,
} from "@corensystem/coren-ui/canvas-navigator";
import {Building2, Layers, MapPin, Map as MapIcon, PanelLeft} from "lucide-react";
import {useState} from "react";

// Four-level hierarchy: Site > Building > Level > Zone (leaf).
const siteIcon = <MapIcon className="wwc:h-4 wwc:w-4" />;
const buildingIcon = <Building2 className="wwc:h-4 wwc:w-4" />;
const levelIcon = <Layers className="wwc:h-4 wwc:w-4" />;
const zoneIcon = <MapPin className="wwc:h-4 wwc:w-4" />;

const NODES: CanvasNavigatorNode[] = [
	{
		id: "site-north",
		label: "North Campus",
		icon: siteIcon,
		children: [
			{
				id: "bldg-a",
				label: "Building A",
				icon: buildingIcon,
				children: [
					{
						id: "bldg-a-l1",
						label: "Level 1",
						icon: levelIcon,
						children: [
							{id: "a-l1-z1", label: "Zone A", icon: zoneIcon},
							{id: "a-l1-z2", label: "Zone B", icon: zoneIcon},
						],
					},
					{
						id: "bldg-a-l2",
						label: "Level 2",
						icon: levelIcon,
						children: [
							{id: "a-l2-z1", label: "Zone A", icon: zoneIcon},
							{id: "a-l2-z2", label: "Zone B", icon: zoneIcon},
							{id: "a-l2-z3", label: "Zone C (locked)", icon: zoneIcon, disabled: true},
						],
					},
				],
			},
			{
				id: "bldg-b",
				label: "Building B",
				icon: buildingIcon,
				children: [
					{
						id: "bldg-b-l1",
						label: "Level 1",
						icon: levelIcon,
						children: [
							{id: "b-l1-z1", label: "Zone A", icon: zoneIcon},
							{id: "b-l1-z2", label: "Zone B", icon: zoneIcon},
						],
					},
				],
			},
		],
	},
	{
		id: "site-south",
		label: "South Campus",
		icon: siteIcon,
		children: [
			{
				id: "bldg-c",
				label: "Building C",
				icon: buildingIcon,
				children: [
					{
						id: "bldg-c-l1",
						label: "Level 1",
						icon: levelIcon,
						children: [{id: "c-l1-z1", label: "Zone A", icon: zoneIcon}],
					},
				],
			},
		],
	},
];

// A third-level "Level" with no fourth level (no blueprints).
const NODES_WITH_EMPTY: CanvasNavigatorNode[] = [
	{
		id: "e-north",
		label: "North Campus",
		icon: siteIcon,
		children: [
			{
				id: "e-a",
				label: "Building A",
				icon: buildingIcon,
				children: [
					{
						id: "e-a-l1",
						label: "Level 1",
						icon: levelIcon,
						children: [
							{id: "e-a-l1-z1", label: "Zone A", icon: zoneIcon},
							{id: "e-a-l1-z2", label: "Zone B", icon: zoneIcon},
						],
					},
					{id: "e-a-l2", label: "Level 2", icon: levelIcon, children: []},
				],
			},
		],
	},
];

// Long, filename-style names that overflow the panel.
const NODES_LONG: CanvasNavigatorNode[] = [
	{
		id: "lp-proj",
		label: "Riyadh Metro — Package 3 Elevated Stations Program",
		icon: siteIcon,
		children: [
			{
				id: "lp-b1",
				label: "Terminal Building — North Concourse & Mezzanine Level",
				icon: buildingIcon,
				children: [
					{
						id: "lp-l1",
						label: "Ground Floor — Public Concourse & Retail Spine",
						icon: levelIcon,
						children: [
							{id: "lp-s1", label: "Retail_1__Ground_Floor_Architectural_Plan_Revision_3_Final.svg", icon: zoneIcon},
							{id: "lp-s2", label: "Retail_1__Ground_Floor_MEP_Coordination_Set_Revision_2.svg", icon: zoneIcon},
							{id: "lp-s3", label: "Retail_1__Ground_Floor_Structural_Framing_Plan_Final_Issue.svg", icon: zoneIcon},
						],
					},
				],
			},
		],
	},
];

// Nine-level hierarchy to showcase deep nesting and the horizontal shift past level 4. It branches at
// the top few levels, then continues as a single deep chain so a path is easy to follow all the way down.
const DEEP_LEVELS = ["Region", "Country", "City", "Campus", "Building", "Floor", "Wing", "Room", "Fixture"];
function buildDeep(depth: number, path: string): CanvasNavigatorNode {
	const id = `deep-${path}`;
	const label = `${DEEP_LEVELS[depth]} ${path}`;
	if (depth === DEEP_LEVELS.length - 1) return {id, label};
	const childCount = depth < 2 ? 2 : 1;
	return {id, label, children: Array.from({length: childCount}, (_, i) => buildDeep(depth + 1, `${path}.${i + 1}`))};
}
const NODES_DEEP: CanvasNavigatorNode[] = [buildDeep(0, "A"), buildDeep(0, "B")];

const meta = {
	title: "Widgets/Canvas/Canvas Navigator",
	component: CanvasNavigator,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"A floating panel that navigates a hierarchy of any depth (here: Site → Building → Level → Zone). Built on `TreeRow`. The default view shows the tree expanding in place; clicking a lowest-level item opens the focused level view with a back button. It can **collapse** to a sibling stepper or **go big** to show the full tree.",
			},
		},
	},
} satisfies Meta<typeof CanvasNavigator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DrillCollapseAndGoBig: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState("a-l2-z1");
			const [size, setSize] = useState<CanvasNavigatorSize>("default");
			return (
				<div className="wwc:flex wwc:items-start wwc:gap-6">
					<div className="wwc:flex wwc:min-h-[34rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
						<CanvasNavigator
							title="Locations"
							nodes={NODES}
							value={selected}
							onSelect={setSelected}
							size={size}
							onSizeChange={setSize}
						/>
					</div>
					<div className="wwc:space-y-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						<div>size: {size}</div>
						<div>selected: {selected}</div>
						<div className="wwc:flex wwc:gap-2">
							{(["collapsed", "default", "expanded"] as const).map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => setSize(s)}
									className="wwc:rounded-md wwc:border wwc:px-2 wwc:py-1 wwc:text-xs wwc:hover:bg-accent"
								>
									{s}
								</button>
							))}
						</div>
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
					"Click a branch to expand it, a lowest-level item to open its level, the back arrow to step up, or expand to see every level at once.",
			},
		},
	},
};

export const ManyLevelsShift: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState("deep-A");
			return (
				<div className="wwc:flex wwc:min-h-[34rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Deep tree"
						nodes={NODES_DEEP}
						value={selected}
						onSelect={setSelected}
						shiftAfterLevel={4}
						defaultExpandedIds={[]}
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
					"A nine-level hierarchy (Region → Country → City → Campus → Building → Floor → Wing → Room → Fixture). It starts fully collapsed — expand a branch past the **fourth level** and, with `shiftAfterLevel={4}`, the tree slides left by one indent step (the gap between level 1 and level 2) for every level revealed beyond it, keeping the deep path in view. Collapsing the fourth level shifts it back.",
			},
		},
	},
};

export const Searchable: Story = {
	render: () => (
		<div className="wwc:flex wwc:min-h-[26rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
			<CanvasNavigator title="Locations" nodes={NODES} searchable searchPlaceholder="Search locations…" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Pass `searchable` and the search field becomes the header (with the size controls on the right). Typing filters nodes by label — matches are shown fully expanded with their parent path; clearing the query returns to the normal drill view. Uncontrolled here, so the top-level node starts selected.",
			},
		},
	},
};

export const EmptyLastLevel: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState("e-a-l1-z1");
			return (
				<div className="wwc:flex wwc:min-h-[20rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Sheets"
						nodes={NODES_WITH_EMPTY}
						value={selected}
						onSelect={setSelected}
						emptyLabel="No blueprints"
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
					"A node with an empty `children: []` is a level with nothing under it — expanding it reveals the empty state (`emptyLabel`) inline.",
			},
		},
	},
};

export const LongNamesClamp: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState("lp-s3");
			return (
				<div className="wwc:flex wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Sheets"
						nodes={NODES_LONG}
						value={selected}
						onSelect={setSelected}
						defaultSize="expanded"
						truncate="clamp"
						tailChars={4}
						maxLines={3}
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
					'`truncate="clamp"` middle-truncates each row (keeping the last `tailChars` chars); the selected row wraps to its full name across up to `maxLines` lines.',
			},
		},
	},
};

export const WithoutHeader: Story = {
	render: () => (
		<div className="wwc:flex wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
			<CanvasNavigator header={false} size="expanded" nodes={NODES} defaultExpandedIds={["site-north", "bldg-a"]} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Pass `header={false}` to render just the tree when a host panel supplies its own chrome.",
			},
		},
	},
};

export const CustomCollapseIcon: Story = {
	render: () => {
		function Demo() {
			const [selected, setSelected] = useState("a-l1-z1");
			return (
				<div className="wwc:flex wwc:min-h-[34rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Locations"
						nodes={NODES}
						value={selected}
						onSelect={setSelected}
						searchable
						size="expanded"
						expandable={false}
						collapseIcon={<PanelLeft className="wwc:h-4 wwc:w-4" />}
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
					'`collapseIcon` overrides the header\'s collapse control (default chevron-up). Useful when the navigator is docked as a sidebar and "collapse" reads as "hide the panel" — here it shows a panel icon.',
			},
		},
	},
};
