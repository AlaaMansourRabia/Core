import {Building2, Layers, MapPin, Map as MapIcon} from "lucide-react";
import {useState} from "react";

import {CanvasNavigator, type CanvasNavigatorNode, type CanvasNavigatorSize} from "@/components/ui/canvas-navigator";
import {CopyButton} from "@/components/ui/copy-button";

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

// Same shape, no icons.
const NODES_NO_ICONS: CanvasNavigatorNode[] = [
	{
		id: "ni-north",
		label: "North Campus",
		children: [
			{
				id: "ni-a",
				label: "Building A",
				children: [
					{
						id: "ni-a-l1",
						label: "Level 1",
						children: [
							{id: "ni-a-l1-z1", label: "Zone A"},
							{id: "ni-a-l1-z2", label: "Zone B"},
						],
					},
					{id: "ni-a-l2", label: "Level 2", children: [{id: "ni-a-l2-z1", label: "Zone A"}]},
				],
			},
			{
				id: "ni-b",
				label: "Building B",
				children: [{id: "ni-b-l1", label: "Level 1", children: [{id: "ni-b-l1-z1", label: "Zone A"}]}],
			},
		],
	},
];

// Four-level hierarchy where one third-level "Level" has no fourth level (no blueprints).
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
					// No blueprints under this level.
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
							{
								id: "lp-s1",
								label: "Retail_1__Ground_Floor_Architectural_Plan_Revision_3_Final.svg",
								icon: zoneIcon,
							},
							{
								id: "lp-s2",
								label: "Retail_1__Ground_Floor_MEP_Coordination_Set_Revision_2.svg",
								icon: zoneIcon,
							},
							{
								id: "lp-s3",
								label: "Retail_1__Ground_Floor_Structural_Framing_Plan_Final_Issue.svg",
								icon: zoneIcon,
							},
						],
					},
				],
			},
		],
	},
];

// Recursively drops icons from a node tree (for the no-icon variant).
function stripIcons(nodes: CanvasNavigatorNode[]): CanvasNavigatorNode[] {
	return nodes.map((node) => {
		const {icon: _icon, children, ...rest} = node;
		return Array.isArray(children) ? {...rest, children: stripIcons(children)} : rest;
	});
}

const NODES_LONG_NO_ICONS: CanvasNavigatorNode[] = stripIcons(NODES_LONG);

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

export function CanvasNavigatorPage() {
	const [selected, setSelected] = useState("a-l2-z1");
	const [size, setSize] = useState<CanvasNavigatorSize>("default");
	const [selectedNoIcons, setSelectedNoIcons] = useState("ni-a-l1-z1");
	const [selectedEmpty, setSelectedEmpty] = useState("e-a-l1-z1");
	const [selectedClamp, setSelectedClamp] = useState("lp-s3");
	const [selectedClampNoIcons, setSelectedClampNoIcons] = useState("lp-s3");
	const [selectedDeep, setSelectedDeep] = useState("deep-A");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Canvas Navigator</h1>
					<CopyButton
						value="Canvas Navigator"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A floating panel that navigates a hierarchy of any depth (here: Site &rarr; Building &rarr; Level &rarr;
					Zone). Built on <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">TreeRow</code>. The
					default view shows the <strong>tree, expanding in place</strong>; clicking a{" "}
					<strong>lowest-level item</strong> opens the focused level view with a <strong>back button</strong>. It can{" "}
					<strong>collapse</strong> to a sibling stepper or <strong>go big</strong> to show the full tree.
				</p>
			</div>

			{/* Interactive */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Drill, collapse &amp; go big</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Click a branch to expand it, a lowest-level item to open its level, the back arrow to step up, or expand to
						see every level at once.
					</p>
				</div>
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
			</section>

			{/* Deep hierarchy — horizontal shift past level 4 */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Many levels — shift left past level 4</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						A nine-level hierarchy (Region &rarr; Country &rarr; City &rarr; Campus &rarr; Building &rarr; Floor &rarr;
						Wing &rarr; Room &rarr; Fixture). It starts fully collapsed — expand a branch down past the{" "}
						<strong>fourth level</strong> and the list slides left by one indent step (the gap between level 1 and level
						2) for every level revealed beyond it, keeping the deep path in view. Collapse the fourth level and it
						shifts back. Enabled with <code className="wwc:text-xs">shiftAfterLevel=&#123;4&#125;</code>.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[34rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Deep tree"
						nodes={NODES_DEEP}
						value={selectedDeep}
						onSelect={setSelectedDeep}
						shiftAfterLevel={4}
						defaultExpandedIds={[]}
					/>
				</div>
			</section>

			{/* Searchable */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">With a search bar</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass <code className="wwc:text-xs">searchable</code> and the search field becomes the header. Typing filters
						nodes by label — matches show as a flat list of locations, each as its full breadcrumb path truncated from
						the start so it stays on one line; picking one jumps to that location. Try searching{" "}
						<strong>&ldquo;Zone 3&rdquo;</strong> or <strong>&ldquo;Level&rdquo;</strong>. Uncontrolled here, so the
						top-level node starts selected.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[26rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator title="Locations" nodes={NODES} searchable searchPlaceholder="Search locations…" />
				</div>
			</section>

			{/* Compact */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Compact</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass <code className="wwc:text-xs">compact</code> for a denser panel with 12px text on rows, the header, the
						search field, and the breadcrumb results — for tight sidebars and canvas overlays.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[26rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator title="Locations" nodes={NODES} searchable searchPlaceholder="Search locations…" compact />
				</div>
			</section>

			{/* Loading state */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Loading state</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass <code className="wwc:text-xs">loading</code> to dock a spinner bar to the bottom of the panel while
						locations stream in. Override the copy with <code className="wwc:text-xs">loadingLabel</code>.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[26rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Locations"
						nodes={NODES}
						searchable
						searchPlaceholder="Search for a location"
						loading
						loadingLabel="Loading locations…"
					/>
				</div>
			</section>

			{/* No icons */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Without icons</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Nodes omit <code className="wwc:text-xs">icon</code> — the rows render label-only, but drill / select /
						collapse / go big behave exactly the same.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[26rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Locations"
						nodes={NODES_NO_ICONS}
						value={selectedNoIcons}
						onSelect={setSelectedNoIcons}
					/>
				</div>
			</section>

			{/* Empty last level */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">A level with nothing under it</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						A third-level node with an empty <code className="wwc:text-xs">children: []</code> is a level with nothing
						under it. Expand <strong>Level 2</strong> and its empty state appears inline. Set the copy via{" "}
						<code className="wwc:text-xs">emptyLabel</code>.
					</p>
				</div>
				<div className="wwc:flex wwc:min-h-[20rem] wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Sheets"
						nodes={NODES_WITH_EMPTY}
						value={selectedEmpty}
						onSelect={setSelectedEmpty}
						emptyLabel="No blueprints"
					/>
				</div>
			</section>

			{/* Long names — wrap to 3 lines */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Long names — wrap to 3 lines</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						<code className="wwc:text-xs">truncate="clamp"</code> middle-truncates each row to a single line (keeping
						the last <code className="wwc:text-xs">tailChars</code> characters), and the <strong>selected</strong> row
						wraps to show its full name across up to <code className="wwc:text-xs">maxLines</code> lines — no horizontal
						scrolling. Click a sheet to expand it; the rest stay truncated. Full name also on hover.
					</p>
				</div>
				<div className="wwc:flex wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Sheets"
						nodes={NODES_LONG}
						value={selectedClamp}
						onSelect={setSelectedClamp}
						defaultSize="expanded"
						truncate="clamp"
						tailChars={4}
						maxLines={3}
					/>
				</div>
			</section>

			{/* Long names — wrap to 3 lines, no icons */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Long names — wrap to 3 lines (no icons)</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						The same <code className="wwc:text-xs">truncate="clamp"</code> behavior with icon-less rows — the selected
						sheet wraps to its full name, the rest stay middle-truncated.
					</p>
				</div>
				<div className="wwc:flex wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator
						title="Sheets"
						nodes={NODES_LONG_NO_ICONS}
						value={selectedClampNoIcons}
						onSelect={setSelectedClampNoIcons}
						defaultSize="expanded"
						truncate="clamp"
						tailChars={4}
						maxLines={3}
					/>
				</div>
			</section>

			{/* Headerless */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Without header</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass <code className="wwc:text-xs">header=&#123;false&#125;</code> to render just the tree (when a host
						panel supplies its own chrome).
					</p>
				</div>
				<div className="wwc:flex wwc:items-start wwc:rounded-md wwc:bg-muted/30 wwc:p-4">
					<CanvasNavigator header={false} size="expanded" nodes={NODES} defaultExpandedIds={["site-north", "bldg-a"]} />
				</div>
			</section>
		</div>
	);
}
