import type {Meta, StoryObj} from "storybook/internal/types";

import {
	SiteToolbar,
	type LevelId,
	type SiteToolbarLevel,
	type SiteToolbarModeTab,
	type ViewId,
	type ViewMode,
} from "@wakecap/core-ui/site-toolbar";
import {Box, LayoutGrid, Layers, Map as MapIcon} from "lucide-react";
import {useState} from "react";

// A flat 1x1 grey tile so the mode thumbnails render without shipping the real drone/plan images
// (those live in the page package and are not exported). The widget only reads `thumb` as a bg image.
const THUMB =
	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40'%3E%3Crect width='64' height='40' fill='%23cbd5e1'/%3E%3C/svg%3E";

const LEVELS: SiteToolbarLevel[] = [
	{id: "batch", label: "Batch", icon: LayoutGrid},
	{id: "zone", label: "Zone", icon: MapIcon},
	{id: "phase", label: "Phase", icon: Layers},
];

const MODE_TABS: SiteToolbarModeTab[] = [
	{id: "3d", label: "Reality", icon: Box, thumb: THUMB},
	{id: "plan", label: "Plan", icon: MapIcon, thumb: THUMB},
];

// The top-centre canvas toolbar as a controlled Wakecore widget: LEFT level-nav pill (Villa + Batch
// dropdown) and RIGHT view-mode switcher (Reality / Plan). This harness owns the same state the host
// template owns (view / mode / level) and feeds it back through the three semantic callbacks.
const meta = {
	title: "Widgets/SiteToolbar",
	component: SiteToolbar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Top-centre canvas toolbar extracted from the Capture UI Enhanced template. Fully controlled: reads view/mode/level as props and requests changes via onSelectView / onSelectLevel / onSelectMode. The only local state is the Batch-slot hover dropdown.",
			},
		},
	},
} satisfies Meta<typeof SiteToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
	const [view, setView] = useState<ViewId>("villa");
	const [mode, setMode] = useState<ViewMode>("3d");
	const [level, setLevel] = useState<LevelId>("batch");

	const activeLevel = LEVELS.find((l) => l.id === level) ?? LEVELS[0];

	return (
		<div className="wwc:relative wwc:h-screen wwc:w-full wwc:bg-muted">
			{/* faux canvas backdrop so the floating pills read against something */}
			<div className="wwc:absolute wwc:inset-0 wwc:bg-[radial-gradient(circle_at_50%_40%,#e2e8f0,#94a3b8)]" />
			<SiteToolbar
				view={view}
				mode={mode}
				level={level}
				activeLevel={activeLevel}
				levels={LEVELS}
				modeTabs={MODE_TABS}
				hasSatellite={false}
				chromeFade=""
				onSelectView={setView}
				onSelectLevel={(l) => {
					setLevel(l);
					setView("batch");
				}}
				onSelectMode={setMode}
			/>
			<div className="wwc:absolute wwc:bottom-4 wwc:left-1/2 wwc:-translate-x-1/2 wwc:rounded wwc:bg-background/80 wwc:px-3 wwc:py-1 wwc:text-xs wwc:text-muted-foreground">
				view: <b>{view}</b> · mode: <b>{mode}</b> · level: <b>{level}</b>
			</div>
		</div>
	);
}

export const Default: Story = {
	render: () => <Harness />,
};
