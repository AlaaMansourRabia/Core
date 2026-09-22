import type {Meta, StoryObj} from "storybook/internal/types";

import {
	CoreAppSidebar,
	DEFAULT_PROJECT_GROUPS,
	type SidebarNavGroup,
} from "@corensystem/core-ui/navigation/core-app-sidebar";
import {toneFor} from "@corensystem/core-ui/tones";
import {
	Blocks,
	Building2,
	CalendarRange,
	Camera,
	Clock,
	Eye,
	FolderTree,
	HardHat,
	Layers,
	Map,
	Network,
	PenTool,
	Settings,
	TrendingUp,
	Users,
	Video,
	Wallet,
} from "lucide-react";
import {useState} from "react";

// Project nav with an item that owns a set of tabs (Settings) — so the
// collapsed rail can demonstrate the sub-tab flyout.
const PROJECT_GROUPS_WITH_SETTINGS: SidebarNavGroup[] = [
	...DEFAULT_PROJECT_GROUPS,
	{
		items: [
			{
				id: "proj-settings",
				label: "Settings",
				icon: Settings,
				expandable: true,
				subMenu: {
					title: "Settings",
					groups: [
						{
							items: [
								{id: "ps-general", label: "General", icon: Settings},
								{id: "ps-members", label: "Members", icon: Users},
								{id: "ps-billing", label: "Billing", icon: Clock},
								{id: "ps-integrations", label: "Integrations", icon: Building2},
							],
						},
					],
				},
			},
		],
	},
];

const meta = {
	title: "Widgets/Navigation/Sidebar",
	component: CoreAppSidebar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"App sidebar with org switcher, search, grouped navigation, profile, and notifications. Driven by the published CoreAppSidebar component.",
			},
		},
	},
} satisfies Meta<typeof CoreAppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── App Sidebar (uses the published CoreAppSidebar component) ──
// Each story pairs a sidebar with its own collapsed icon-only rail, side by side.

export const AppSidebar: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The default (comfortable) App Sidebar next to its collapsed icon-only rail. Collapsing hides labels, the org name, search field, and profile text — each icon shows its label on hover via a tooltip, and items with a badge get a small dot indicator.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			<CoreAppSidebar viewLevel="project" density="comfortable" />
			<CoreAppSidebar viewLevel="project" density="comfortable" collapsed />
		</div>
	),
};

export const AppSidebarCompact: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The compact App Sidebar next to its collapsed icon-only rail. `density="compact"` shrinks padding, text, and icons; the rail follows the compact identity (Core mark instead of the org avatar, no notifications). The nav includes a **Settings** item with sub-tabs — click it on the collapsed rail to open the sub-tab flyout (General / Members / Billing / Integrations). `platformStatus` is wired on the expanded sidebar to show the current branch + commit under the footer dropdowns.',
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			<CoreAppSidebar
				viewLevel="project"
				density="compact"
				projectGroups={PROJECT_GROUPS_WITH_SETTINGS}
				platformStatus={{branch: "main", commit: "c4458d8"}}
			/>
			<CoreAppSidebar viewLevel="project" density="compact" projectGroups={PROJECT_GROUPS_WITH_SETTINGS} collapsed />
		</div>
	),
};

export const CompactCollapsedSubmenu: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Compact collapsed rail at the org level. A nav item that owns a set of tabs (e.g. **Settings**, with General / Members / Billing / Integrations) opens a small flyout on click so you can pick which tab to navigate to — rather than expanding the whole sidebar. Items without sub-tabs navigate directly. The comfortable rail (right) behaves the same way.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			<CoreAppSidebar viewLevel="org" density="compact" collapsed />
			<CoreAppSidebar viewLevel="org" density="comfortable" collapsed />
		</div>
	),
};

// Demonstrates the controlled `activeItemId` prop: a simulated "route" drives
// the highlight in both the expanded sidebar and the compact collapsed rail —
// including a sub-menu item (Settings → Members) which opens the right sub-view
// and lights up the owning rail icon.
function ControlledSelectionDemo() {
	const [activeItemId, setActiveItemId] = useState("org-overview");
	const routes = [
		{id: "org-overview", label: "Overview (top-level)"},
		{id: "org-cctv", label: "CCTV (top-level)"},
		{id: "os-members", label: "Settings → Members (sub-item)"},
		{id: "os-billing", label: "Settings → Billing (sub-item)"},
	];
	return (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			<CoreAppSidebar viewLevel="org" activeItemId={activeItemId} />
			<CoreAppSidebar viewLevel="org" density="compact" collapsed activeItemId={activeItemId} />
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:p-4 wwc:min-w-[240px]">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Simulated route → activeItemId</span>
				{routes.map((r) => (
					<button
						key={r.id}
						type="button"
						onClick={() => setActiveItemId(r.id)}
						className={`wwc:text-left wwc:text-[13px] wwc:px-3 wwc:py-1.5 wwc:rounded-md wwc:border wwc:transition-colors ${
							activeItemId === r.id
								? "wwc:bg-muted wwc:border-foreground/30 wwc:font-medium"
								: "wwc:border-border wwc:hover:bg-muted/50"
						}`}
					>
						{r.label}
					</button>
				))}
				<code className="wwc:mt-2 wwc:text-[11px] wwc:text-muted-foreground">activeItemId = "{activeItemId}"</code>
			</div>
		</div>
	);
}

export const ControlledSelection: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"The controlled `activeItemId` prop keeps the sidebar's highlight in sync with a host app's route. Click a simulated route on the right: a top-level id highlights that item; a sub-menu id (e.g. `os-members`) opens the owning sub-menu in the expanded sidebar and lights up the Settings icon in the collapsed compact rail — no synthetic clicks needed. Omit the prop to fall back to uncontrolled behavior.",
			},
		},
	},
	render: () => <ControlledSelectionDemo />,
};

// ── Grouped sections (tree) ──────────────────────────────────────────────────
// Everything below is plain `CoreAppSidebar` API — no template-side code. A group carrying an `icon`
// renders as a TREE: a parent-sized header, a spine down to the last item, and an elbow into each one.
// Collapsed, that same icon stands for the whole section and its items move into a flyout — the same
// flyout an `expandable` item's `subMenu` uses. `id` makes the header name a link, `collapsible` adds
// the fold chevron.
// Tones come from the library's one palette (`@corensystem/core-ui/tones`) rather than being written out
// here. `toneFor(index, offset)` walks it in hand-out order, which is a golden-angle walk around the
// hue wheel — so consecutive items in a section are never neighbouring hues, and the `offset` keeps
// two sections from opening on the same one.

const SECTION_GROUPS: SidebarNavGroup[] = [
	{
		id: "stage-design",
		label: "Design",
		icon: PenTool,
		collapsible: true,
		items: [
			{id: "app-site-reality", label: "Site Reality", icon: Map, tone: toneFor(0, 0)},
			{id: "app-equipment", label: "Equipment", icon: Blocks, tone: toneFor(1, 0)},
		],
	},
	{
		id: "stage-plan",
		label: "Plan",
		icon: CalendarRange,
		collapsible: true,
		items: [
			{id: "app-progress", label: "Progress", icon: TrendingUp, tone: toneFor(0, 5)},
			{id: "app-analytics", label: "Analytics", icon: Layers, tone: toneFor(1, 5)},
		],
	},
	{
		id: "stage-capture",
		label: "Capture",
		icon: Camera,
		collapsible: true,
		items: [
			{id: "app-safety", label: "Safety Manager", icon: HardHat, tone: toneFor(0, 10)},
			{id: "app-vision", label: "Vision AI", icon: Eye, tone: toneFor(1, 10)},
			{id: "app-cctv", label: "CCTV", icon: Video, tone: toneFor(2, 10)},
		],
	},
	{
		id: "stage-pay",
		label: "Pay",
		icon: Wallet,
		collapsible: true,
		items: [{id: "app-workforce", label: "Workforce", icon: Users, tone: toneFor(0, 15)}],
	},
	{
		id: "studio",
		label: "Studio",
		icon: Network,
		collapsible: true,
		// The four lifecycle stages are one run; Studio is a different section, so it asks for the break
		// itself rather than relying on the automatic rules the tree shape switches off. Mirrors V3.
		dividerBefore: true,
		items: [
			{id: "studio-analysis", label: "Analysis", icon: TrendingUp, tone: toneFor(0, 20)},
			{id: "studio-ontology", label: "Ontology", icon: Layers, tone: toneFor(1, 20)},
		],
	},
];

function GroupedSectionsDemo() {
	const [activeGroupId, setActiveGroupId] = useState<string | undefined>(undefined);
	return (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={SECTION_GROUPS}
				brandName="Connect"
				variant="tree"
				showHome
				showHomeDivider={false}
				showMarketplace={false}
				activeGroupId={activeGroupId}
				onGroupSelect={setActiveGroupId}
			/>
			<CoreAppSidebar
				viewLevel="org"
				orgGroups={SECTION_GROUPS}
				variant="tree"
				showHome
				showHomeDivider={false}
				showMarketplace={false}
				collapsed
				activeGroupId={activeGroupId}
				onGroupSelect={setActiveGroupId}
			/>
			<div className="wwc:flex wwc:flex-col wwc:gap-2 wwc:p-4 wwc:min-w-[260px]">
				<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
					Collapse the sidebar, then click a flyout title
				</span>
				<code className="wwc:text-[11px] wwc:text-muted-foreground">
					activeGroupId = {activeGroupId ? `"${activeGroupId}"` : "undefined"}
				</code>
			</div>
		</div>
	);
}

export const GroupedSections: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Groups as navigable sections, all via `SidebarNavGroup` fields. `icon` turns a group into a tree — parent-sized header, a spine to the last item, an elbow into each — sits beside the group name, and makes the collapsed rail show ONE icon per group whose flyout lists its items, reusing the same flyout an `expandable` item's `subMenu` gets. `collapsible` makes the WHOLE header fold the group: name, icon and chevron are one control, so nothing in the header is a link and nothing underlines. `groupsCollapsedByDefault` starts them shut. `activeGroupId` marks a group as the active surface — full-strength foreground on its header, and its rail icon lights — while `onGroupSelect` fires only from the COLLAPSED rail's flyout title, the one gesture that still reports a group rather than folding one. `showGroupDividers={false}` drops the rules between sections, `dividerBefore` puts one back where a section genuinely starts (see Studio), independently of `showGroupDividers`. Expanding and folding animate.",
			},
		},
	},
	render: () => <GroupedSectionsDemo />,
};

// The two nav shapes over IDENTICAL groups, so the only difference on screen is the variant.
//
// Rail contents mirror Core Connect V3's — the Files entry pinned above Home, the four lifecycle
// stages, Studio — because that is where the tree shape is actually used, and a comparison against a
// made-up nav would not tell you whether it holds up under the real one. Files is `pinnedTop` rather
// than a group: it sits OUTSIDE the app hierarchy (it addresses records belonging to every app below
// it), and a group cannot express that. It is deliberately on BOTH sides — the variant does not own
// it, and holding it constant keeps the only visible difference the variant itself.
function VariantsDemo() {
	return (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			{(["list", "tree"] as const).map((variant) => (
				<div key={variant} className="wwc:flex wwc:flex-col wwc:gap-2">
					<code className="wwc:px-2 wwc:text-[11px] wwc:text-muted-foreground">variant="{variant}"</code>
					<CoreAppSidebar
						viewLevel="org"
						orgGroups={SECTION_GROUPS}
						brandName="Connect"
						variant={variant}
						pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
						showHome
						showHomeDivider={false}
						showMarketplace={false}
						unreadNotifications={3}
						onViewAllNotifications={() => {}}
					/>
				</div>
			))}
		</div>
	);
}

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The nav\'s two shapes, over the same groups. `variant="list"` (the default, and what every existing consumer gets) is the flat shape: groups are headings over a run of rows, ruled apart, all open on first paint. `variant="tree"` is the grouped-sections shape: groups carrying an `icon` render as a tree — parent-sized header, a spine to the last item, an elbow into each — the rules drop away because the headers and spines already mark every boundary, and the rail opens as a short list of section headers that expand on demand. The variant only supplies DEFAULTS for `showGroupDividers` and `groupsCollapsedByDefault`, so pass either explicitly to override it (tree shape, rules kept). Search is deliberately NOT part of the variant — set `showSearch` yourself in both shapes. The rail here is Core Connect V3\'s, Files included, since that is where the tree shape is used; Files is `pinnedTop` (it sits outside the app hierarchy and addresses records belonging to every app below it), is not owned by the variant, and is held constant on both sides so the only visible difference is the shape itself.',
			},
		},
	},
	render: () => <VariantsDemo />,
};

// The tree shape at both densities, over the same V3 rail. `density` is a separate axis from `variant`:
// the variant decides the SHAPE of the nav, density decides how tightly it is packed, and every
// combination is valid. Compact shrinks row padding, text and icons, tightens the rules, and pulls the
// tree's spine and elbows in to match — so a long nav fits without the shape changing at all.
function TreeDensityDemo() {
	return (
		<div className="wwc:flex wwc:h-screen wwc:gap-6">
			{(["comfortable", "compact"] as const).map((density) => (
				<div key={density} className="wwc:flex wwc:flex-col wwc:gap-2">
					<code className="wwc:px-2 wwc:text-[11px] wwc:text-muted-foreground">variant="tree" density="{density}"</code>
					<CoreAppSidebar
						viewLevel="org"
						orgGroups={SECTION_GROUPS}
						brandName="Connect"
						variant="tree"
						density={density}
						pinnedTop={{id: "files", label: "Files", icon: FolderTree}}
						showHome
						showHomeDivider={false}
						showMarketplace={false}
						unreadNotifications={3}
						onViewAllNotifications={() => {}}
					/>
				</div>
			))}
		</div>
	);
}

export const TreeCompact: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The tree shape at `density="compact"`, beside the comfortable default for comparison. Density is a separate axis from `variant`: the variant sets the SHAPE (tree vs list), density sets how tightly it packs, and the two compose freely. Compact shrinks row padding, label and icon sizes, drops the gap between rows and halves the rule margins; the tree\'s spine and elbows move in with it, so the parent/child geometry reads the same, just denser. Use it where the nav is long enough that the comfortable rhythm costs a scroll — the pinned block (Search, Files, Home, Notifications), the group headers and the collapsed rail all follow the same density.',
			},
		},
	},
	render: () => <TreeDensityDemo />,
};
