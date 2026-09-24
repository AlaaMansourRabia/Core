import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {CoreAppTopBar} from "@corensystem/coren-ui/navigation/core-app-top-bar";
import {LifeBuoy, Share2} from "lucide-react";

const PROJECTS = [
	"Fadhili GIP PKG 1",
	"ISSD_BI-10-13202",
	"Jafurah-JFGP-PKG-03",
	"Jafurah-Phase 2",
	"Jazan Refinery-Boiler Pkg.",
	"JC3C4",
];

const meta = {
	title: "Widgets/Navigation/App Top Bar",
	component: CoreAppTopBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: "A reusable top bar with project switcher, active page title, and feedback menu.",
			},
		},
	},
} satisfies Meta<typeof CoreAppTopBar>;

export default meta;
type Story = StoryObj<typeof CoreAppTopBar>;

export const Default: Story = {
	render: () => (
		<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
			<CoreAppTopBar
				activeLabel="Dashboard"
				selectedProject="Fadhili GIP PKG 1"
				projects={PROJECTS}
				onSelectProject={() => {}}
			/>
		</div>
	),
};

export const Compact: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`density="compact"` renders the top bar at 36px (h-9) with smaller controls and 12px text. Pair with `CoreAppSidebar density="compact"` for a matching dense app shell.',
			},
		},
	},
	render: () => (
		<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
			<CoreAppTopBar
				activeLabel="Dashboard"
				selectedProject="Fadhili GIP PKG 1"
				projects={PROJECTS}
				onSelectProject={() => {}}
				density="compact"
			/>
		</div>
	),
};

export const ComfortableVsCompact: Story = {
	parameters: {
		docs: {
			description: {
				story: "Side-by-side: comfortable (44px) on top, compact (36px) below.",
			},
		},
	},
	render: () => (
		<div className="wwc:space-y-4">
			<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
				<CoreAppTopBar
					activeLabel="Dashboard"
					selectedProject="Fadhili GIP PKG 1"
					projects={PROJECTS}
					onSelectProject={() => {}}
				/>
			</div>
			<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
				<CoreAppTopBar
					activeLabel="Dashboard"
					selectedProject="Fadhili GIP PKG 1"
					projects={PROJECTS}
					onSelectProject={() => {}}
					density="compact"
				/>
			</div>
		</div>
	),
};

export const WithBreadcrumb: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
				<CoreAppTopBar
					activeLabel="Settings / General"
					selectedProject="Fadhili GIP PKG 1"
					projects={PROJECTS}
					onSelectProject={() => {}}
				/>
			</div>
			<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
				<CoreAppTopBar
					activeLabel="Settings / Members"
					selectedProject="Jafurah-Phase 2"
					projects={PROJECTS}
					onSelectProject={() => {}}
				/>
			</div>
		</div>
	),
};

export const WithNotifications: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`showNotifications` renders a notification bell beside the overflow (three-dots) menu. `notificationCount` adds an unread badge (capped at 99+); `onNotificationsClick` handles the click.",
			},
		},
	},
	render: () => (
		<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
			<CoreAppTopBar
				activeLabel="Safety Manager"
				showProjectSwitcher={false}
				showNotifications
				notificationCount={3}
				onNotificationsClick={() => {}}
			/>
		</div>
	),
};

export const WithCustomRightContent: Story = {
	render: () => (
		<div className="wwc:overflow-hidden wwc:rounded-lg wwc:bg-background">
			<CoreAppTopBar
				activeLabel="Settings"
				selectedProject="Jafurah-Phase 2"
				projects={PROJECTS}
				onSelectProject={() => {}}
				rightContent={
					<div className="wwc:ml-auto wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:text-[12px] wwc:text-muted-foreground">Last saved 2m ago</span>
						<Button size="sm">Save</Button>
					</div>
				}
			/>
		</div>
	),
};

// ── Responsive (#205) ────────────────────────────────────────────────────────
// The bar used to place its breadcrumb `absolute left-1/2`, so the switcher and the actions reserved
// no space for it and the three groups overlapped once the bar got narrow — most visibly in the
// 768–820px band. It is now a 3-column grid: equal 1fr side columns keep the middle genuinely
// centred, `min-w-0` lets the sides truncate rather than shove, and ancestor breadcrumb segments fold
// away (narrowest first) so the ROUTE identity is the last thing to go.
//
// The widths below are container widths, not viewport widths — that is the point of the container
// query. A 1024px window with a 260px sidebar leaves the bar ~764px, squarely in the failing band.
const WIDTHS = [
	{w: 1200, label: "Desktop — 1200px"},
	{w: 820, label: "Compact audit — 820px"},
	{w: 768, label: "Storybook inspection — 768px"},
	{w: 520, label: "Narrow — 520px"},
	{w: 375, label: "Mobile — 375px"},
];

const LONG_PROJECT = "Falcon Heights Medical Tower — Phase 2 Podium & Basement";
const LONG_ROUTE = "Ontology / Object types / Built Element / Shared properties / Verification history";

function WidthMatrix({activeLabel, project}: {activeLabel: string; project: string}) {
	return (
		<div className="wwc:space-y-6 wwc:p-4">
			{WIDTHS.map(({w, label}) => (
				<div key={w} className="wwc:space-y-1">
					<div className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						{label}
					</div>
					<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border" style={{width: w}}>
						<CoreAppTopBar
							activeLabel={activeLabel}
							selectedProject={project}
							projects={[project, "Uptown Tower", "Marina Heights"]}
							showNotifications
							notificationCount={3}
							overflowActions={[
								{id: "help", label: "Help & support", icon: LifeBuoy},
								{id: "share", label: "Share this view", icon: Share2},
							]}
						/>
					</div>
				</div>
			))}
		</div>
	);
}

export const Responsive: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The same bar at five container widths. Nothing overlaps and nothing overflows at any of them: the project name truncates, ancestor breadcrumb segments fold away behind an ellipsis, and the low-priority actions collapse into a **More actions** menu. The current route stays readable throughout — it is the segment that never folds.",
			},
		},
	},
	render: () => <WidthMatrix activeLabel="Ontology / Object types" project="Falcon Heights Medical Tower" />,
};

export const ResponsiveLongLabels: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The same matrix with a deliberately long project name and a five-segment route. This is the case that used to collide: identity degrades by truncating and folding rather than by overlapping, and the deepest segment — the one that says where you actually are — survives to the narrowest width.",
			},
		},
	},
	render: () => <WidthMatrix activeLabel={LONG_ROUTE} project={LONG_PROJECT} />,
};
