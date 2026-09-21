import type {WeekSelectorWeek} from "@core/core-ui/week-selector";
import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@core/core-ui/button";
import {ViewTabBar, type ViewTabItem} from "@core/core-ui/view-tab-bar";
import {LayoutGrid, Plus, Table, Workflow} from "lucide-react";
import {useState} from "react";

const meta = {
	title: "Components/Navigation/View Tab Bar",
	component: ViewTabBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Generic underline-style tab bar. Type-parameterized over the tab id union so `activeTab`/`onTabChange` stay type-safe. Each tab can carry an icon, a trailing badge, and a hover tooltip. Tabs sit bottom-flush on the parent row's `border-b`.",
			},
		},
	},
} satisfies Meta<typeof ViewTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

type BasicTab = "assign" | "table";
const BASIC_TABS: readonly ViewTabItem<BasicTab>[] = [
	{id: "assign", label: "Assign", icon: Workflow, description: "Link items to locations."},
	{id: "table", label: "Table", icon: Table},
];

export const Default: Story = {
	render: () => {
		function Demo() {
			const [tab, setTab] = useState<BasicTab>("assign");
			return (
				<div className="wwc:w-[520px]">
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:justify-between wwc:border-b wwc:px-3">
						<ViewTabBar tabs={BASIC_TABS} activeTab={tab} onTabChange={setTab} />
						<Button size="sm" variant="outline" className="wwc:mb-1.5">
							<Plus /> New
						</Button>
					</div>
				</div>
			);
		}
		return <Demo />;
	},
};

type CountTab = "all" | "open" | "done";
const COUNT_TABS: readonly ViewTabItem<CountTab>[] = [
	{id: "all", label: "All", badge: 24},
	{id: "open", label: "Open", badge: 18, description: "Items still in progress."},
	{id: "done", label: "Done", badge: 6},
];

export const WithBadges: Story = {
	render: () => {
		function Demo() {
			const [tab, setTab] = useState<CountTab>("all");
			return (
				<div className="wwc:w-[520px]">
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:border-b wwc:px-3">
						<ViewTabBar tabs={COUNT_TABS} activeTab={tab} onTabChange={setTab} />
					</div>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "Pass `badge` to render a muted count after the label."}},
	},
};

export const CardContained: Story = {
	render: () => {
		function Demo() {
			const [tab, setTab] = useState<CountTab>("all");
			return (
				<div className="wwc:w-[520px] wwc:rounded-lg wwc:border wwc:border-border">
					<ViewTabBar tabs={COUNT_TABS} activeTab={tab} onTabChange={setTab} surface="card" />
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "Use the explicit card surface only when the tab bar owns a contained surface."}},
	},
};

type ViewTab = "board" | "table" | "flow";
const VIEW_TABS: readonly ViewTabItem<ViewTab>[] = [
	{id: "board", label: "Board", icon: LayoutGrid, description: "Kanban-style grouped cards."},
	{id: "table", label: "Table", icon: Table, description: "Dense rows with sortable columns."},
	{id: "flow", label: "Flow", icon: Workflow, description: "Dependency graph view."},
];

export const ViewSwitcher: Story = {
	render: () => {
		function Demo() {
			const [tab, setTab] = useState<ViewTab>("board");
			return (
				<div className="wwc:w-[520px]">
					<div className="wwc:flex wwc:min-h-12 wwc:items-end wwc:border-b wwc:px-3">
						<ViewTabBar tabs={VIEW_TABS} activeTab={tab} onTabChange={setTab} />
					</div>
					<div className="wwc:mt-4 wwc:rounded-lg wwc:border wwc:border-dashed wwc:p-6 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
						{tab} view content
					</div>
				</div>
			);
		}
		return <Demo />;
	},
	parameters: {
		docs: {description: {story: "Every tab has a tooltip describing the view it switches to."}},
	},
};

type ModeTab = "collection" | "comparison";
const MODE_TABS: readonly ViewTabItem<ModeTab>[] = [
	{id: "collection", label: "Collection"},
	{id: "comparison", label: "Comparison"},
];

const MODE_WEEKS: readonly WeekSelectorWeek[] = [
	{value: "W111", label: "111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", label: "112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", label: "113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", label: "114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", label: "115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

export const SegmentedToolbar: Story = {
	render: () => {
		function Demo() {
			const [tab, setTab] = useState<ModeTab>("collection");
			const [period, setPeriod] = useState("W113");
			return (
				<div className="wwc:w-[820px] wwc:overflow-hidden wwc:rounded-lg wwc:border">
					<div className="wwc:border-b wwc:bg-background wwc:px-4 wwc:py-2">
						<ViewTabBar
							variant="segmented"
							tabs={MODE_TABS}
							activeTab={tab}
							onTabChange={setTab}
							weekSelector={{weeks: MODE_WEEKS, value: period, onValueChange: setPeriod, visibleCount: 5}}
						/>
					</div>
					<div className="wwc:flex wwc:h-44 wwc:items-center wwc:justify-center wwc:bg-muted/30 wwc:text-sm wwc:text-muted-foreground">
						{tab === "collection" ? "Collection" : "Comparison"} content for {period}
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
					'`variant="segmented"` is a full-width toolbar heading the content below it: a pill view-switcher on the left, and a built-in `weekSelector` (period navigation) on the right — the two are paired frequently. Pass `trailing` for extra right-side actions.',
			},
		},
	},
};
