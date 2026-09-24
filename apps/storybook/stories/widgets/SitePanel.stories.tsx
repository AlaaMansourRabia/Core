import type {Meta, StoryObj} from "storybook/internal/types";

import {
	SitePanel,
	type CanvasNavigatorNode,
	type CaptureDetailVilla,
	type LevelId,
	type MapMode,
	type SitePanelDistributionBucket,
	type SitePanelVilla,
	type ViewId,
	type ViewMode,
} from "@corensystem/coren-ui/site-panel";
import {LayoutGrid} from "lucide-react";
import {useState} from "react";

// ~42 villas so the list scrolls like the real rail
const VILLAS: SitePanelVilla[] = Array.from({length: 42}, (_, i) => {
	const approved = Math.round((Math.sin(i * 1.3) * 0.5 + 0.5) * 100);
	return {
		id: String(2001 + i),
		name: `${2001 + i} DP1-L`,
		meta: `Zone 1 – A · Batch ${1 + (i % 4)}`,
		approved,
		planned: Math.min(100, approved + 8),
	};
});

const DISTRIBUTION: SitePanelDistributionBucket[] = [
	{id: "m35", label: "M35", color: "#93c5fd", count: 12},
	{id: "m50", label: "M50", color: "#3b82f6", count: 10},
	{id: "m65", label: "M65", color: "#f59e0b", count: 8},
	{id: "m80", label: "M80", color: "#84cc16", count: 6},
	{id: "m95", label: "M95", color: "#22c55e", count: 4},
	{id: "m100", label: "M100", color: "#15803d", count: 2},
];

const NAV_NODES: CanvasNavigatorNode[] = [
	{
		id: "almanar",
		label: "ALMANAR – PHASE1",
		children: [
			{id: "zone-1-a", label: "Zone 1 – A", children: VILLAS.slice(0, 6).map((v) => ({id: v.id, label: v.name}))},
			{id: "zone-1-b", label: "Zone 1 – B"},
		],
	},
];

const ACTIVE_LEVEL = {id: "batch" as LevelId, label: "Batch", icon: LayoutGrid};

// The left rail as a controlled Core widget: search + villa list + zone progress + distribution, and the
// villa detail rail on selection. This harness owns the same state the host template owns and feeds it back
// through the semantic callbacks.
const meta = {
	title: "Widgets/SitePanel",
	component: SitePanel,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Left rail extracted from the Capture UI Enhanced template. Fully controlled: reads the view/level axes, rows, selection, and searchOpen as props and requests changes via onSelectVilla / onCloseDetail / onStepLocation / onNavigate / onMapModeChange / onSearchOpenChange. Local state is only the search query, sort, and navigator-open flags. Click a villa to open its detail rail.",
			},
		},
	},
} satisfies Meta<typeof SitePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
	const [mapMode, setMapMode] = useState<MapMode>("progress");
	const [selectedId, setSelectedId] = useState("");
	const [detailOpen, setDetailOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [locationIndex, setLocationIndex] = useState(0);

	const view: ViewId = "villa";
	const mode: ViewMode = "plan";
	const level: LevelId = "batch";
	const selected = VILLAS.find((v) => v.id === selectedId) ?? VILLAS[0];
	const detailVilla: CaptureDetailVilla = {
		id: selected.id,
		lbsItemId: Number(selected.id),
		name: selected.name,
		plotNumber: selected.id,
	};

	return (
		<div className="wwc:relative wwc:h-screen wwc:w-full wwc:overflow-hidden wwc:bg-muted">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-[radial-gradient(circle_at_60%_40%,#e2e8f0,#94a3b8)]" />
			<SitePanel
				view={view}
				mode={mode}
				level={level}
				activeLevel={ACTIVE_LEVEL}
				currentLocation="zone-1-a"
				locationLabel="Zone 1 – A"
				locationIndex={locationIndex}
				isParent={false}
				activeRows={VILLAS}
				unitNoun="villas"
				unitNounSingular="villa"
				countNoun={VILLAS.length === 1 ? "villa" : "villas"}
				selectedId={selectedId}
				detailOpen={detailOpen}
				detailVilla={detailVilla}
				selected={selected}
				selectedNumber={selected.name.match(/^\d+/)?.[0] ?? selected.name}
				selectedPath={`Phase 1 / Zone 1 – A / ${selected.name}`}
				mapMode={mapMode}
				distribution={DISTRIBUTION}
				navNodes={NAV_NODES}
				chromeFade=""
				searchOpen={searchOpen}
				captureId="2026-W38"
				rangeLabel="Sep 15 – 21"
				onSelectVilla={(id) => {
					setSelectedId(id);
					setDetailOpen(true);
				}}
				onCloseDetail={() => setDetailOpen(false)}
				onStepLocation={(dir) => setLocationIndex((i) => Math.max(0, i + dir))}
				onNavigate={(node) => {
					if (VILLAS.some((v) => v.id === node.id)) {
						setSelectedId(node.id);
						setDetailOpen(true);
					}
				}}
				onMapModeChange={setMapMode}
				onSearchOpenChange={setSearchOpen}
			/>
		</div>
	);
}

export const Default: Story = {
	render: () => <Harness />,
};
