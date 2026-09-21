import {
	AlertTriangle,
	BarChart3,
	Bell,
	Building2,
	Camera,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ClipboardCheck,
	Clock,
	Cloud,
	Eye,
	Globe,
	Home,
	LayoutGrid,
	LifeBuoy,
	LogOut,
	Moon,
	MoreHorizontal,
	Package,
	PanelLeftOpen,
	PanelRightOpen,
	Plus,
	Search,
	Settings,
	Sparkles,
	Sun,
	TrendingUp,
	Users,
	Video,
} from "lucide-react";
import {Fragment, forwardRef, useState, useEffect, useRef} from "react";

import {Avatar, AvatarFallback, AvatarImage} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {FLOAT_SHADOW} from "../float-shadow";
import {Popover, PopoverContent, PopoverTrigger} from "../popover";
import {ScrollArea} from "../scroll-area";
import {Separator} from "../separator";
import {Sheet, SheetContent} from "../sheet";
import {HoverTooltip, TooltipProvider} from "../tooltip";
import {useDocumentDir} from "../use-document-dir";
import {Switcher} from "./switcher";

// ─── Types ──────────────────────────────────────────────────────────────────

export type SidebarSubItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	badge?: string;
};

export type SidebarSubMenuGroup = {
	label?: string;
	items: SidebarSubItem[];
};

export type SidebarSubMenu = {
	title: string;
	groups: SidebarSubMenuGroup[];
};

export type SidebarNavItem = {
	id: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	/** Optional route used for semantic navigation links and runtime route continuity checks. */
	href?: string;
	badge?: string;
	/** Small status dot on the icon — pass one of your app's bg-* classes (e.g. `"bg-green-500"`). */
	dot?: string;
	/**
	 * A soft tint behind the item's icon, as a class string — the library's `bg-{hue}-500/10
	 * text-{hue}-700 dark:text-{hue}-400` formula, the same one the file system's file types and
	 * Badge's `*Soft` variants use, so a hue means the same thing wherever the reader meets it. Use it
	 * where the items in a group are KINDS of thing worth telling apart at a glance (the apps under a
	 * lifecycle stage, say); omit it and the icon keeps the muted treatment every nav row has, which is
	 * every existing consumer. Tint a whole group or none of it — one tinted row among plain ones reads
	 * as a status, not a kind.
	 */
	tone?: string;
	expandable?: boolean;
	subMenu?: SidebarSubMenu;
};

/** One row of the built-in notifications panel. */
export type SidebarNotification = {
	id: string;
	title: string;
	/** Optional supporting line under the title — a title-only notification renders without it. */
	body?: string;
	/** Already-formatted, because only the caller knows the reader's locale and timezone. */
	time: string;
	unread?: boolean;
};

export type SidebarNavGroup = {
	label?: string;
	/**
	 * Icon standing for the group as a whole. Shown beside the label in the expanded sidebar — where it
	 * also marks the group as a TREE (parent-sized header, a spine down to the last item, an elbow into
	 * each) — and, in the collapsed rail, it REPLACES the group's individual icons with a single button
	 * whose flyout lists the items, exactly as an `expandable` item with a `subMenu` behaves. One
	 * drill-in mechanism for both, so a group and an item never behave differently in the rail. The icon
	 * is what the rail has to show once the labels are gone, so a tree group needs one.
	 *
	 * Requires `label` (the flyout is titled by it). Groups without an icon keep the default rail
	 * behaviour: every item rendered as its own icon.
	 */
	icon?: React.ComponentType<{className?: string}>;
	/**
	 * Give the group header a chevron on its far right that collapses and expands the items beneath it.
	 * Expanded sidebar only — the collapsed rail has no headers, and a group with an `icon` already
	 * folds into a single flyout there. Groups start expanded. Requires `label`.
	 */
	collapsible?: boolean;
	/**
	 * Force a divider above this group — in the expanded nav AND the collapsed rail — for a group that
	 * starts a genuinely different section rather than continuing the run above it. Independent of
	 * `showGroupDividers`: it stands when the automatic rules between groups are switched off, which is
	 * how a break survives `variant="tree"`. In the rail it also overrides the rule that consecutive
	 * icon-groups run together (each already being a single icon, so rules between them are noise).
	 */
	dividerBefore?: boolean;
	/**
	 * Identifies the group. `activeGroupId` marks it (and its rail icon) as the active section, and the
	 * collapsed rail's flyout title fires `onGroupSelect` with it. The EXPANDED header does not
	 * navigate: name, icon and chevron all fold the group, so nothing there is a link. Requires
	 * `label`.
	 */
	id?: string;
	items: SidebarNavItem[];
};

type ThemeMode = "light" | "dark";

/**
 * Overridable copy for `CoreAppSidebar`'s own built-in controls — search, empty state, collapse/expand,
 * the profile menu, notifications, and the org switcher — plus their aria-labels. Every key has an
 * English default, so a consumer supplies only the strings it wants to translate. Nav-item labels, the
 * org/user names, and other consumer-provided data are not part of this (they arrive already-localized
 * via their own props); `homeLabel`, `marketplaceLabel`, and `brandName` keep their dedicated props.
 */
export type CoreAppSidebarLabels = {
	/** Search input placeholder and the collapsed rail's search tooltip. */
	find: string;
	/** Aria label for the search field's clear button. */
	clearSearch: string;
	/** Heading of the "no matches" empty state. */
	noResults: string;
	/** Sub-heading of the empty state, given the current query. */
	noResultsHint: (query: string) => string;
	/** Tooltip on the fold-all control while at least one group is open. */
	collapseAll: string;
	/** Tooltip on the fold-all control while every group is folded. */
	expandAll: string;
	/** Aria label for the fold-all control while at least one group is open. */
	collapseAllGroups: string;
	/** Aria label for the fold-all control while every group is folded. */
	expandAllGroups: string;
	/** Aria label for a group header's chevron while the group is open, given its name. */
	collapseGroup: (group: string) => string;
	/** Shown when there are no notifications at all. */
	notificationsEmpty: string;
	/** The action at the foot of the notifications panel. */
	viewAllNotifications: string;
	/** Screen-reader text for the unread count, given the number. */
	unreadCount: (count: number) => string;
	/** Aria label for a group header's chevron while the group is folded, given its name. */
	expandGroup: (group: string) => string;
	/** Aria label for the collapsed rail's expand button. */
	expandSidebar: string;
	/** Aria label for the expanded sidebar's collapse button. */
	collapseSidebar: string;
	/** Aria label for the pin button. */
	pinSidebar: string;
	/** Label beside the light/dark toggle in the profile menu. */
	theme: string;
	/** Aria label for each theme toggle button, given the mode it selects. */
	themeToggle: (mode: ThemeMode) => string;
	/** The profile menu's log-out item. */
	logOut: string;
	/** Heading of the build/version "Source" section in the profile menu. */
	source: string;
	/** Aria label for the footer notifications button. */
	openNotifications: string;
	/** Tooltip for the collapsed rail's notifications icon. */
	notifications: string;
	/** The notifications panel's "all" tab. */
	notificationsAll: string;
	/** The notifications panel's "projects" tab. */
	notificationsProjects: string;
	/** The notifications panel's "system" tab. */
	notificationsSystem: string;
	/** Aria label for the profile trigger, given the signed-in name. */
	profileMenu: (name: string) => string;
	/** Placeholder for the org switcher's search field. */
	orgSearchPlaceholder: string;
	/** Empty state for the org switcher. */
	orgEmpty: string;
	/** The org switcher's "view all organizations" action. */
	orgViewAll: string;
};

const DEFAULT_SIDEBAR_LABELS: CoreAppSidebarLabels = {
	find: "Find...",
	clearSearch: "Clear search",
	noResults: "No results",
	noResultsHint: (query) => `No nav items match "${query}"`,
	collapseAll: "Collapse all",
	expandAll: "Expand all",
	collapseAllGroups: "Collapse all groups",
	expandAllGroups: "Expand all groups",
	notificationsEmpty: "You're all caught up",
	viewAllNotifications: "View all notifications",
	unreadCount: (count) => `${count} unread`,
	collapseGroup: (group) => `Collapse ${group}`,
	expandGroup: (group) => `Expand ${group}`,
	expandSidebar: "Expand sidebar",
	collapseSidebar: "Collapse sidebar",
	pinSidebar: "Pin sidebar",
	theme: "Theme",
	themeToggle: (mode) => `Use ${mode} theme`,
	logOut: "Log Out",
	source: "Source",
	openNotifications: "Open notifications",
	notifications: "Notifications",
	notificationsAll: "All",
	notificationsProjects: "Projects",
	notificationsSystem: "System",
	profileMenu: (name) => `Open ${name} profile menu`,
	orgSearchPlaceholder: "Find organization…",
	orgEmpty: "No organizations",
	orgViewAll: "View all organizations",
};

// localStorage keys — theme and sidebar collapse persist across reloads for every app on this shell.
const THEME_KEY = "wc3.theme";
const COLLAPSE_KEY = "wc3.sidebar.collapsed";
type View = "main" | "sub";

// ─── Data ────────────────────────────────────────────────────────────────────

export const DEFAULT_PROJECT_GROUPS: SidebarNavGroup[] = [
	{
		items: [{id: "proj-dashboard", label: "Dashboard", icon: LayoutGrid}],
	},
	{
		label: "Workforce",
		items: [
			{id: "proj-verify-time", label: "Verify Time", icon: Clock},
			{id: "proj-site-workforce", label: "Site Workforce", icon: Users},
			{id: "proj-reports", label: "Reports", icon: ClipboardCheck},
		],
	},
	{
		label: "Site Operations",
		items: [
			{id: "proj-network-admin", label: "Network Administrator", icon: Globe},
			{id: "proj-map", label: "Map", icon: Globe},
			{id: "proj-vision-ai", label: "Vision AI", icon: Eye},
			{id: "proj-observation-mgr", label: "Observation Manager", icon: AlertTriangle},
		],
	},
	{
		label: "Tools",
		items: [
			{id: "proj-verify-response", label: "Verify Response", icon: Check},
			{id: "proj-weather", label: "Weather Station", icon: Cloud},
			{id: "proj-equipment", label: "Equipments", icon: Settings},
			{id: "proj-wecare", label: "Wecare", icon: LifeBuoy},
			{id: "proj-capture", label: "Capture", icon: Camera},
		],
	},
];

// ─── Org-level nav ────────────────────────────────────────────────────────────

export const DEFAULT_ORG_GROUPS: SidebarNavGroup[] = [
	{
		items: [
			{id: "org-overview", label: "Overview", icon: LayoutGrid},
			{id: "org-projects", label: "Projects", icon: Package},
		],
	},
	{
		label: "Monitoring",
		items: [
			{id: "org-compliance", label: "Compliance Forms", icon: ClipboardCheck},
			{id: "org-observations", label: "Observations", icon: Eye},
			{id: "org-cctv", label: "CCTV", icon: Video},
			{id: "org-progress", label: "Progress", icon: TrendingUp},
		],
	},
	{
		label: "Intelligence",
		items: [
			{id: "org-reality-capture", label: "Reality Capture", icon: Camera},
			{id: "org-ai-reports", label: "AI Reports", icon: Sparkles},
			{id: "org-workforce", label: "Workforce Intelligence", icon: Users},
			{id: "org-performance", label: "Performance", icon: BarChart3},
		],
	},
	{
		items: [
			{
				id: "org-settings",
				label: "Settings",
				icon: Settings,
				expandable: true,
				subMenu: {
					title: "Settings",
					groups: [
						{
							items: [
								{id: "os-general", label: "General", icon: Settings},
								{id: "os-members", label: "Members", icon: Users},
								{id: "os-billing", label: "Billing", icon: Clock},
								{id: "os-integrations", label: "Integrations", icon: Building2},
							],
						},
					],
				},
			},
		],
	},
];

/** Demo data for prototypes. Real callers pass `notifications`. */
const SAMPLE_NOTIFICATIONS: SidebarNotification[] = [
	{
		id: "n1",
		title: "Deployment succeeded",
		body: "owner-dashboard deployed to production",
		time: "2m ago",
		unread: true,
	},
	{id: "n2", title: "Build failed", body: "modon-prototype build #42 failed", time: "1h ago", unread: true},
	{id: "n3", title: "New team member", body: "ali@wakecap.com joined Organization Name", time: "3h ago", unread: false},
	{id: "n4", title: "Usage alert", body: "You've reached 80% of your monthly limit", time: "1d ago", unread: false},
	{id: "n5", title: "Pipeline finished", body: "BIM intake processed 1,204 records", time: "1d ago", unread: false},
	{id: "n6", title: "Permit approved", body: "Hot work permit HW-2291 was approved", time: "2d ago", unread: false},
	{id: "n7", title: "Report ready", body: "Weekly workforce summary is ready to read", time: "2d ago", unread: false},
	{id: "n8", title: "Device offline", body: "Gateway GW-17 stopped reporting", time: "3d ago", unread: false},
	{id: "n9", title: "Process published", body: "Inspection routing v4 is live", time: "4d ago", unread: false},
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WakecapWLogo({className}: {className?: string}) {
	return (
		<svg
			viewBox="0 0 278.78 176.15"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			fill="currentColor"
			className={className}
		>
			<path d="M65.58,4.66l21.91,30.92,20.8-31.16,62.09-.03,21.5,31.2s21.05-31.2,21.21-31.2h62.08v62.09s-52.28,105.07-52.28,105.07l-62.09-.05-21.48-30.97-21.05,31.02h-62.09S3.49,66.77,3.49,66.77V4.67h62.09Z" />
		</svg>
	);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export type CoreAppSidebarDensity = "comfortable" | "compact";

/**
 * The overall shape of the nav.
 *
 * `"list"` (default) is the flat shape every existing consumer gets: groups are headings over a
 * run of rows, separated by rules, all open on first paint.
 *
 * `"tree"` is the grouped-sections shape — groups carrying an `icon` render as a tree (parent-sized
 * header, a spine down to the last item, an elbow into each), the rules between them drop away
 * because the headers and spines already mark every boundary, and the sidebar opens as a short list
 * of section headers that expand on demand. Use it when the nav is long enough that a flat list
 * buries things, and its sections are destinations in their own right.
 *
 * The variant only supplies DEFAULTS for `showGroupDividers` and `groupsCollapsedByDefault`; pass
 * either explicitly to override it. Search is orthogonal — set `showSearch` yourself in both shapes.
 */
export type CoreAppSidebarVariant = "list" | "tree";

export interface CoreAppSidebarProps {
	onNavigate?: (label: string, keepOpen?: boolean, parentLabel?: string) => void;
	/**
	 * Fires with the selected item itself (and, for a sub-menu row, its parent), so a consumer can track
	 * selection by the stable `id` — `onNavigateItem={(item) => setActiveItemId(item.id)}` — instead of
	 * reverse-mapping the `label` string that `onNavigate` reports. Fires alongside `onNavigate` for every
	 * selection: top-level items, sub-menu rows, and the auto-selected first item on a view-level switch.
	 */
	onNavigateItem?: (item: SidebarNavItem | SidebarSubItem, parent?: SidebarNavItem) => void;
	/**
	 * Overrides for the sidebar's own built-in copy — search, empty state, collapse/expand controls, the
	 * profile menu, notifications, and the org switcher, plus their aria-labels. English defaults fill in
	 * any key left unset. See {@link CoreAppSidebarLabels}.
	 */
	labels?: Partial<CoreAppSidebarLabels>;
	seamless?: boolean;
	onPin?: () => void;
	/**
	 * Mobile behavior: below `md` the inline sidebar is hidden and instead opens as a left sheet driven
	 * by these. Pair with `CoreAppTopBar`'s `onMenuClick` (the hamburger) to open it. Omit on surfaces
	 * that don't need a mobile drawer.
	 */
	mobileOpen?: boolean;
	onMobileOpenChange?: (open: boolean) => void;
	viewLevel?: "org" | "project";
	/** Custom org-level navigation groups. Defaults to DEFAULT_ORG_GROUPS. */
	orgGroups?: SidebarNavGroup[];
	/** Custom project-level navigation groups. Defaults to DEFAULT_PROJECT_GROUPS. */
	projectGroups?: SidebarNavGroup[];
	/**
	 * Density of nav items, group labels, and sub-nav rows.
	 * `"comfortable"` (default) keeps the current sizing; `"compact"` shrinks
	 * padding, text, and icons so a long list of menu items fits more vertical
	 * space.
	 */
	density?: CoreAppSidebarDensity;
	/**
	 * The shape of the nav: `"list"` (default) for the flat, ruled, all-open list, `"tree"` for
	 * grouped sections that fold to their icon. See {@link CoreAppSidebarVariant}. Sets the defaults
	 * for `showGroupDividers` and `groupsCollapsedByDefault`, both of which still override it.
	 */
	variant?: CoreAppSidebarVariant;
	/**
	 * When `true`, the sidebar renders as a narrow icon-only rail: labels, the
	 * org name, search field, and notification/profile text are hidden, leaving
	 * just the icons with hover tooltips. Works for both densities. Defaults to
	 * `false` (full-width sidebar).
	 */
	collapsed?: boolean;
	/**
	 * Called whenever the user toggles collapse from inside the sidebar (the
	 * header collapse button or the rail's expand button). Lets a parent react —
	 * e.g. animate the sidebar container's width to match the rail. The
	 * component still owns its `isCollapsed` state; treat this as a notification.
	 */
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * Controlled active item. Pass the id of the active top-level item OR a
	 * sub-menu item; the sidebar highlights it and (for a sub-item) opens its
	 * owning sub-menu. Keeps selection in sync with a host app's route in BOTH
	 * densities — the expanded sub-view and the collapsed icon rail / flyout.
	 * Omit to keep the current uncontrolled behavior.
	 */
	activeItemId?: string;
	/**
	 * Build/version metadata shown in the footer dropdowns under a "Source"
	 * section. Pass `commit` and/or `branch` to surface the deployed version.
	 * Consumers typically wire these from build-time env vars (e.g. Vite's
	 * `import.meta.env.VITE_COMMIT_SHA`). The section is omitted when both
	 * fields are empty.
	 */
	platformStatus?: {
		commit?: string;
		branch?: string;
	};
	/**
	 * Show the find/search input. Defaults to `true`. Set `false` for sidebars
	 * with only a handful of nav items where search adds no value. Applies to both
	 * the expanded sidebar and the collapsed icon rail.
	 */
	showSearch?: boolean;
	/**
	 * Show the notifications control in the footer (comfortable density) and the
	 * collapsed rail. Defaults to `true`. Set `false` for surfaces that don't have
	 * notifications.
	 */
	showNotifications?: boolean;
	/**
	 * Show the footer profile bar (avatar, name, account menu, and notifications).
	 * Defaults to `true`. Set `false` for embedded/kiosk surfaces that don't need a
	 * user/account area. Applies to both the expanded sidebar and the collapsed rail.
	 */
	showFooter?: boolean;
	/**
	 * Current theme for the footer light/dark toggle. When provided, the sidebar is CONTROLLED — it reflects
	 * this value and calls `onThemeChange` on toggle without touching the DOM (the host owns applying it).
	 * When omitted, the sidebar is uncontrolled: it seeds from the document's `.dark` class and toggles that
	 * class on `document.documentElement` itself, so the footer toggle works out of the box.
	 */
	theme?: ThemeMode;
	/** Fires when the footer theme toggle is used. Always called; pair with `theme` for controlled mode. */
	onThemeChange?: (theme: ThemeMode) => void;
	/**
	 * Optional custom node pinned to the bottom of the EXPANDED sidebar (below the nav, above the profile
	 * bar). Not shown in the collapsed rail. Use it for a brand/news/updates card or similar.
	 */
	footerContent?: React.ReactNode;
	/**
	 * Brand shown in the expanded sidebar header, replacing the default mark + name.
	 * Pass a sized element (e.g. `<img className="h-6 w-auto" />`); it should
	 * keep its own aspect ratio and fit the header height.
	 */
	logo?: React.ReactNode;
	/**
	 * Brand shown at the top of the collapsed icon rail. Hovering it reveals an
	 * expand affordance, and clicking expands the sidebar.
	 */
	logoCollapsed?: React.ReactNode;
	/**
	 * Turn the expanded header brand into an ORG SWITCHER. The header renders the WakeCap mark, a `/`
	 * separator, then a dropdown showing the selected org's logo + name + chevron that opens a searchable
	 * list of organizations. Pass the org names; `activeOrg` is the current selection and `onOrgChange`
	 * fires on pick. When omitted, the header shows the static brand. Ignored when a custom `logo` is provided.
	 */
	orgs?: string[];
	/** The currently selected organization (defaults to the first of `orgs`). */
	activeOrg?: string;
	/** Logo node for the selected org, shown in the switcher trigger before its name (e.g. a small `<img>`). */
	activeOrgLogo?: React.ReactNode;
	/** Fires when an organization is picked from the switcher. */
	onOrgChange?: (org: string) => void;
	/** When set, adds a "View all organizations" action to the bottom of the org switcher dropdown. */
	onOrgViewAll?: () => void;
	/**
	 * The signed-in user shown in the footer profile bar (expanded drawer, collapsed rail, and the
	 * account menu). When omitted, a placeholder is shown so existing callers are unaffected.
	 * `avatarUrl` renders via `AvatarImage`, falling back to the name's initials over the gradient.
	 */
	user?: {name: string; email?: string; avatarUrl?: string};
	/**
	 * Fires when the footer "Log Out" item is chosen. Wires the otherwise-inert Log Out control; when
	 * omitted the item stays inert (unchanged legacy behavior).
	 */
	onLogout?: () => void;
	/**
	 * Show the "Home" entry pinned at the very top of the nav (above the app items). Defaults to `true`, so
	 * every app built on this shell exposes a Home affordance. Wire `onHome` to navigate; `homeActive`
	 * highlights it.
	 */
	showHome?: boolean;
	/** Label for the Home entry (expanded sidebar and rail tooltip). Defaults to `"Home"`. */
	homeLabel?: string;
	/**
	 * Draw a divider between the Home entry and the nav groups below it. Defaults to `true`. Set to
	 * `false` when Home reads as the head of the first group rather than a section of its own — for
	 * example a Home that lands on the installed apps listed directly beneath it. Only governs Home
	 * standing ALONE: with a `pinnedTop`, Home joins that pinned block and the block's own divider
	 * applies instead.
	 */
	showHomeDivider?: boolean;
	/**
	 * Draw the automatic divider between every pair of consecutive nav groups. Defaults to `true` under
	 * `variant="list"` and `false` under `variant="tree"`, where the headers and spines already read as
	 * separate and the extra rules would only add noise. Set it explicitly to override the variant. A
	 * group's own `dividerBefore` is independent and still stands when this is `false`.
	 */
	showGroupDividers?: boolean;
	/**
	 * Start every `collapsible` group folded, so the sidebar opens as a short list of section headers
	 * rather than the full tree. Defaults to `false` under `variant="list"` and `true` under
	 * `variant="tree"`; set it explicitly to override the variant. Individual groups still remember
	 * whatever the user does to them afterwards.
	 */
	groupsCollapsedByDefault?: boolean;
	/** Fires when the Home entry is chosen. */
	onHome?: () => void;
	/** Highlight the Home entry as the active surface. */
	homeActive?: boolean;
	/**
	 * Show the "Marketplace" action — a plus button pinned directly under the app nav items. In the
	 * collapsed rail it's just the plus icon; expanded it's plus + label. Defaults to `true`, so every
	 * app built on this shell exposes the marketplace/app-installer entry.
	 */
	showMarketplace?: boolean;
	/** Label for the marketplace action (expanded sidebar and rail tooltip). Defaults to `"Marketplace"`. */
	marketplaceLabel?: string;
	/** Fires when the marketplace action is chosen. */
	onMarketplace?: () => void;
	/** Highlight the marketplace action as the active surface (e.g. the App Installer template). */
	marketplaceActive?: boolean;
	/** Label for the Search row. Defaults to `"Search"`. */
	searchLabel?: string;
	/**
	 * Fires when the Search row is chosen. The row is a plain nav entry, not an input — wire this to
	 * whatever surface does the searching (a command palette or modal). Omit and the row is inert.
	 */
	onSearch?: () => void;
	/** Highlight the Search row as the active surface. */
	searchActive?: boolean;
	/**
	 * A single key that, with the platform's command modifier, opens search — `"j"` binds ⌘J on a Mac
	 * and Ctrl+J elsewhere. It does two jobs at once: the sidebar listens for the combination while it
	 * is mounted and calls `onSearch`, and the Search row shows the hint, so the shortcut is
	 * discoverable rather than folklore. Needs `onSearch`; omit it and there is no binding and no hint.
	 */
	searchShortcut?: string;
	/** Label for the Notifications row. Defaults to `"Notifications"`. */
	notificationsLabel?: string;
	/**
	 * Fires when the Notifications row is chosen. Omit and the row opens the built-in notifications
	 * panel instead, the same one the footer bell used to open.
	 */
	onNotifications?: () => void;
	/** Highlight the Notifications row as the active surface. */
	notificationsActive?: boolean;
	/**
	 * The notifications the built-in panel lists. Pass your own and the panel renders them; omit it and
	 * a small built-in SAMPLE is shown so the shell looks alive in a prototype. Production callers
	 * should always pass this — the sample is demo data, not a default worth shipping.
	 *
	 * `unread` drives the row's emphasis; the count beside the entry comes from `unreadNotifications`
	 * so a caller whose unread total is bigger than the page it loaded can still say so.
	 */
	notifications?: SidebarNotification[];
	/** Fires when a notification in the panel is chosen, with the notification itself. */
	onNotificationSelect?: (notification: SidebarNotification) => void;
	/**
	 * How many notifications are unread. Shown as a count beside the Notifications entry — a number in
	 * the expanded row, and the same number on the collapsed rail's icon, so the rail never hides what
	 * the open sidebar would have told you. `0` or omitted shows nothing at all: a zero badge is a
	 * a claim that something needs attention when nothing does. Counts above 99 render as `99+`.
	 */
	unreadNotifications?: number;
	/**
	 * Fires when "View all notifications" at the foot of the notifications panel is chosen. The panel
	 * only ever shows the most recent few, so this is the way out to the full surface. Omit it and the
	 * action is not rendered.
	 */
	onViewAllNotifications?: () => void;
	/**
	 * An entry pinned directly under the search field, at the head of the pinned block it shares with
	 * Home: the two run together and ONE divider falls beneath the pair, so the nav groups below read
	 * as the separate section. For a surface that sits outside the app hierarchy rather than inside it
	 * — a file system over every app's records, say, beside the Home that launches those apps. A pinned
	 * entry always takes that divider, whatever `showHomeDivider` says. Omit and nothing renders, which
	 * is every existing consumer.
	 */
	pinnedTop?: {
		id: string;
		label: string;
		icon: React.ComponentType<{className?: string}>;
		onSelect?: () => void;
		active?: boolean;
	};
	/**
	 * Product name shown beside the logo when no org switcher is present. Defaults to `"WC3"`.
	 */
	brandName?: string;
	/**
	 * Fires when a group is chosen from the COLLAPSED rail's flyout title. The expanded header no
	 * longer navigates — its name folds the group, the same as its chevron — so this is the only
	 * gesture that reports a group. Only groups carrying an `id` can fire it.
	 */
	onGroupSelect?: (groupId: string) => void;
	/**
	 * Mark a group as the active surface, by its `id` — the header takes full-strength foreground and
	 * its rail icon lights. A mark, not a link: the header does not navigate.
	 */
	activeGroupId?: string;
}

// `inert` as an ATTRIBUTE rather than a boolean prop: React 18 rejects `inert={true}` as a non-boolean
// attribute, and this component ships to consumers on both 18 and 19.
const INERT = {inert: ""} as unknown as {inert?: string};

const SIDEBAR_DENSITY = {
	comfortable: {
		container: "wwc:pl-2 wwc:pr-3 wwc:py-2",
		row: "wwc:gap-3 wwc:px-3 wwc:py-[7px] wwc:text-[13px]",
		iconSize: "wwc:h-[15px] wwc:w-[15px]",
		// The pinned block (Search / pinned entry / Home / Notifications) is already at row size here —
		// there is nothing above it to sit between.
		pinnedRow: "wwc:gap-3 wwc:px-3 wwc:py-[7px] wwc:text-[13px]",
		pinnedIconSize: "wwc:h-[15px] wwc:w-[15px]",
		spacing: "wwc:space-y-0.5",
		// The pinned block's rows are the taller ones, so they carry their own gap.
		pinnedSpacing: "wwc:space-y-0.5",
		// The WakeCap mark, ONE size for both states. It used to be h-5 expanded and the nav icon size
		// collapsed, so toggling the sidebar resized the brand — and the collapsed rule set an explicit
		// width, squashing a mark that is wider than it is tall. This sits between the two and keeps
		// `w-auto`, so the mark holds its shape and its size whatever the sidebar is doing.
		brandMark: "wwc:h-[18px] wwc:w-auto",
		// A tinted item icon sits in a rounded square slightly larger than the bare icon it replaces, the
		// way the file system's rows carry theirs.
		toneChip: "wwc:h-[22px] wwc:w-[22px]",
		toneIconSize: "wwc:h-[13px] wwc:w-[13px]",
		// Between GROUPS. Folded, a group is one header row, so without this the section headers stack
		// flush and read as a solid block — the same problem the rows had. A notch wider than the row
		// gap, since a group is a bigger unit than a row.
		groupGap: "wwc:mt-1",
		separator: "wwc:my-2",
		groupLabel: "wwc:px-3 wwc:pt-2 wwc:pb-1 wwc:text-[10px]",
		// An icon-group renders as a TREE: the header reads like a parent row (same metrics as `row`),
		// and its items hang off a vertical guide with a short elbow into each one.
		// Guide x = the group icon's centre (px-3 = 12px + half of the 15px icon). It starts below the
		// icon so the two never touch, and stops at the LAST item's elbow rather than running past it —
		// `bottom` is half a row, measured from the items container's bottom edge.
		groupGuide: "wwc:left-[19px] wwc:top-[26px] wwc:bottom-[16px]",
		// Items begin to the RIGHT of the spine — row, hover fill and active fill all start clear of it,
		// so the line never runs through a tab. 20px is the spine's right edge; 28 leaves the elbow room.
		groupGuideIndent: "wwc:pl-[28px]",
		// Elbow from the spine into an item, at the row's vertical middle. Measured from the item row's
		// own left edge, so it reaches back across the gap the indent just created.
		groupElbow: "wwc:left-[-8px] wwc:w-[8px]",
		subGroupLabel: "wwc:px-3 wwc:py-1.5 wwc:text-[10px]",
		backButton: "wwc:px-3 wwc:py-2 wwc:mb-1 wwc:text-[13px]",
		header: "wwc:h-11 wwc:px-3",
		footer: "wwc:px-3 wwc:py-2 wwc:gap-2",
	},
	compact: {
		container: "wwc:pl-1.5 wwc:pr-2.5 wwc:py-1.5",
		row: "wwc:gap-2 wwc:px-2 wwc:py-1 wwc:text-[12px]",
		iconSize: "wwc:h-[14px] wwc:w-[14px]",
		// Between the two: 6px of vertical padding against compact's 4 and comfortable's 7, a 12.5px
		// label against 12 and 13, a 15px icon against 14 and 15. `px` deliberately stays at compact's
		// 8px — growing it would push these icons out of line with the group rows beneath them, and the
		// shared icon column is what makes the block read as the same nav.
		pinnedRow: "wwc:gap-2.5 wwc:px-2 wwc:py-[6px] wwc:text-[12.5px]",
		pinnedIconSize: "wwc:h-[15px] wwc:w-[15px]",
		// Compact used to run its rows flush (space-y-0), which read as a solid block rather than a list.
		// 2px is enough to separate them without costing the density anything meaningful.
		spacing: "wwc:space-y-0.5",
		// The pinned rows are bigger than the nav rows here, so they get a proportionally bigger gap —
		// the block breathes a little more than the groups beneath it, which is what marks it as its own.
		pinnedSpacing: "wwc:space-y-1",
		// A touch smaller than comfortable's 18px, landing on the same 14px the compact nav icons use —
		// so the mark sits in the header at the density the rest of the rail is drawn at.
		brandMark: "wwc:h-[14px] wwc:w-auto",
		toneChip: "wwc:h-5 wwc:w-5",
		toneIconSize: "wwc:h-3 wwc:w-3",
		groupGap: "wwc:mt-1",
		separator: "wwc:my-1",
		groupLabel: "wwc:px-2 wwc:pt-1.5 wwc:pb-0.5 wwc:text-[9px]",
		groupGuide: "wwc:left-[15px] wwc:top-[21px] wwc:bottom-[12px]",
		groupGuideIndent: "wwc:pl-[22px]",
		groupElbow: "wwc:left-[-6px] wwc:w-[6px]",
		subGroupLabel: "wwc:px-2 wwc:py-1 wwc:text-[9px]",
		backButton: "wwc:px-2 wwc:py-1 wwc:mb-0.5 wwc:text-[12px]",
		header: "wwc:h-9 wwc:px-2",
		footer: "wwc:px-2 wwc:py-1 wwc:gap-1.5",
	},
} as const;

/** App sidebar with org switcher, search, grouped navigation, profile, and notifications. */
/** The sidebar body. `CoreAppSidebar` renders this inline on desktop and inside a left sheet on mobile. */
function SidebarShell({
	onNavigate,
	onNavigateItem,
	labels,
	seamless = false,
	onPin,
	viewLevel = "project",
	orgGroups,
	projectGroups,
	density = "comfortable",
	collapsed = false,
	onCollapsedChange,
	activeItemId,
	platformStatus,
	showSearch = true,
	showNotifications = true,
	showFooter = true,
	theme: themeProp,
	onThemeChange,
	footerContent,
	logo,
	logoCollapsed,
	orgs,
	activeOrg,
	activeOrgLogo,
	onOrgChange,
	onOrgViewAll,
	user,
	onLogout,
	showHome = true,
	homeLabel = "Home",
	searchLabel = "Search",
	onSearch,
	searchActive = false,
	searchShortcut,
	notificationsLabel = "Notifications",
	onNotifications,
	notificationsActive = false,
	unreadNotifications = 0,
	onViewAllNotifications,
	notifications,
	onNotificationSelect,
	showHomeDivider = true,
	variant = "list",
	showGroupDividers: showGroupDividersProp,
	groupsCollapsedByDefault: groupsCollapsedByDefaultProp,
	onHome,
	homeActive = false,
	showMarketplace = true,
	marketplaceLabel = "Marketplace",
	onMarketplace,
	marketplaceActive = false,
	pinnedTop,
	brandName = "WC3",
	onGroupSelect,
	activeGroupId,
	hideCollapse = false,
}: CoreAppSidebarProps & {hideCollapse?: boolean} = {}) {
	// The variant supplies the DEFAULT for each chrome prop it owns; an explicit prop always wins, so
	// a caller can take the tree shape and still keep its rules (or the list shape folded).
	// Not `tree`: the group map below binds that name per group (an icon-group renders as a tree), and
	// shadowing it there would make two different questions look like one.
	const treeVariant = variant === "tree";
	const showGroupDividers = showGroupDividersProp ?? !treeVariant;
	const groupsCollapsedByDefault = groupsCollapsedByDefaultProp ?? treeVariant;
	// Is there a pinned block at all, and does it take a rule under it? A pinned entry always earns the
	// rule — it is the whole point of pinning something above the nav — so `showHomeDivider` decides
	// only the case it is named for: Home standing alone above the groups.
	// ⌘ on Apple platforms, Ctrl everywhere else. Read from the UA at render rather than at module
	// load, so a server render and the browser that hydrates it agree.
	const isApple =
		typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
	const searchHint = searchShortcut ? `${isApple ? "⌘" : "Ctrl+"}${searchShortcut.toUpperCase()}` : undefined;
	// The shortcut lives with the row it opens, so a consumer gets the binding AND the hint from one
	// prop instead of wiring a listener itself and hoping the two stay in step. Bound on the document,
	// because the point of a command shortcut is that it works wherever focus happens to be.
	const onSearchRef = useRef(onSearch);
	onSearchRef.current = onSearch;
	useEffect(() => {
		if (!searchShortcut) return;
		const key = searchShortcut.toLowerCase();
		const handle = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
			if (event.key.toLowerCase() !== key) return;
			// Only claim the combination when there is somewhere for it to go.
			if (!onSearchRef.current) return;
			event.preventDefault();
			onSearchRef.current();
		};
		document.addEventListener("keydown", handle);
		return () => document.removeEventListener("keydown", handle);
	}, [searchShortcut]);

	// Caller's list when given, the sample only as a prototype convenience.
	const panelNotifications = notifications ?? SAMPLE_NOTIFICATIONS;
	// One derivation for both surfaces. Above 99 the exact number stops being useful and starts
	// stretching the row, so it caps — the point is "a lot", not the arithmetic.
	const unreadBadge = unreadNotifications > 0 ? (unreadNotifications > 99 ? "99+" : String(unreadNotifications)) : null;
	// Search, the pinned entry, Home and Notifications are all shell surfaces standing outside the app
	// hierarchy below, so they render as one block of peer rows — expanded and in the rail — rather than
	// four separately-placed affordances. `notifications` has no handler when the consumer wants the
	// built-in panel; the renderer wraps that one in its popover.
	const pinnedEntries: {
		key: string;
		label: string;
		icon: React.ComponentType<{className?: string}>;
		onSelect?: () => void;
		active?: boolean;
		/** A count shown beside the label (expanded) and on the icon (collapsed). */
		badge?: string | null;
		/** A keyboard hint shown at the end of the row. Expanded only — the rail has no room for it. */
		hint?: string;
		builtInNotifications?: boolean;
	}[] = [
		...(showSearch
			? [
					{
						key: "search",
						label: searchLabel,
						icon: Search,
						onSelect: onSearch,
						active: searchActive,
						hint: searchHint,
					},
				]
			: []),
		...(pinnedTop
			? [
					{
						key: "pinned",
						label: pinnedTop.label,
						icon: pinnedTop.icon,
						onSelect: pinnedTop.onSelect,
						active: pinnedTop.active,
					},
				]
			: []),
		...(showHome ? [{key: "home", label: homeLabel, icon: Home, onSelect: onHome, active: homeActive}] : []),
		...(showNotifications
			? [
					{
						key: "notifications",
						label: notificationsLabel,
						icon: Bell,
						onSelect: onNotifications,
						active: notificationsActive,
						badge: unreadBadge,
						builtInNotifications: !onNotifications,
					},
				]
			: []),
	];
	const pinnedBlock = pinnedEntries.length > 0;
	// A pinned entry always earns the rule beneath the block — it is the whole point of pinning a
	// surface above the nav — so `showHomeDivider` decides only the case it is named for: a block that
	// is nothing but Home.
	const pinnedBlockDivider = pinnedEntries.some((e) => e.key !== "home") || showHomeDivider;
	const d = SIDEBAR_DENSITY[density];
	// Built-in copy, consumer overrides layered over the English defaults (WC-GAP-03).
	const L = {...DEFAULT_SIDEBAR_LABELS, ...labels};
	// Ambient direction, threaded into the nav ScrollAreas so they mirror under an RTL host (WC-GAP-01).
	const navDir = useDocumentDir();
	// Footer profile — real user when provided, else the legacy placeholder (backward compatible).
	const profileName = user?.name ?? "Abdullah Alzahrani";
	// Placeholder email only in the no-user legacy case; a real user with no email shows no email line.
	const profileEmail = user ? user.email : "abdullah@wakecap.com";
	const profileAvatar = user?.avatarUrl;
	const profileInitials = user
		? profileName
				.split(/\s+/)
				.map((w) => w[0])
				.filter(Boolean)
				.slice(0, 2)
				.join("")
				.toUpperCase()
		: "";
	const selectedOrgName = activeOrg ?? orgs?.[0] ?? "";
	const statusCommit = platformStatus?.commit;
	const statusBranch = platformStatus?.branch;
	// Dropdown-item sizing — shrinks in compact mode to match the sidebar's nav rows.
	const ddItemClass =
		density === "compact"
			? "wwc:flex wwc:items-center wwc:justify-between wwc:py-1.5"
			: "wwc:flex wwc:items-center wwc:justify-between wwc:py-2.5";
	const ddRowClass =
		density === "compact"
			? "wwc:flex wwc:items-center wwc:justify-between wwc:px-2 wwc:py-1.5"
			: "wwc:flex wwc:items-center wwc:justify-between wwc:px-2 wwc:py-2.5";
	const ddTextClass = density === "compact" ? "wwc:text-[12px]" : "wwc:text-[13px]";
	const ddIconClass = density === "compact" ? "wwc:h-3.5 wwc:w-3.5" : "wwc:h-4 wwc:w-4";
	const [view, setView] = useState<View>("main");
	const [activeSubMenuId, setActiveSubMenuId] = useState<string | null>(null);
	const [activeItem, setActiveItem] = useState("projects");
	const [notifOpen, setNotifOpen] = useState(false);
	// Footer theme toggle. Uncontrolled by default: restore the last choice from localStorage (falling back
	// to the document's `.dark` class), persist it on toggle, and apply it to `document.documentElement` — so
	// the theme survives a reload. Controlled when a `theme` prop is passed (host applies it via onThemeChange).
	const [themeState, setThemeState] = useState<ThemeMode>(() => {
		try {
			const saved = typeof window !== "undefined" ? window.localStorage.getItem(THEME_KEY) : null;
			if (saved === "dark" || saved === "light") return saved;
		} catch {
			// storage unavailable — fall through to the DOM class
		}
		return typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light";
	});
	// Apply the restored theme to the DOM once on mount (uncontrolled only), so a reload shows it.
	useEffect(() => {
		if (themeProp === undefined && typeof document !== "undefined")
			document.documentElement.classList.toggle("dark", themeState === "dark");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const theme = themeProp ?? themeState;
	const applyTheme = (m: ThemeMode) => {
		if (themeProp === undefined) {
			setThemeState(m);
			if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", m === "dark");
			try {
				window.localStorage.setItem(THEME_KEY, m);
			} catch {
				// ignore
			}
		}
		onThemeChange?.(m);
	};

	// The profile menu is rendered by BOTH the expanded footer (from the "..." button) and the
	// collapsed rail (from the avatar), so it lives here once — two copies would drift apart.
	const renderProfileMenu = (side: "top" | "right" = "top", align: "start" | "end" = "start") => (
		<DropdownMenuContent side={side} align={align} className="wwc:w-[280px] wwc:rounded-xl">
			<DropdownMenuLabel className="wwc:font-normal">
				<div className="wwc:min-w-0">
					<div
						className={`wwc:font-semibold wwc:text-foreground wwc:truncate ${density === "compact" ? "wwc:text-[12px]" : "wwc:text-[13px]"}`}
					>
						{profileName}
					</div>
					{profileEmail && (
						<div
							className={`wwc:text-muted-foreground wwc:truncate ${density === "compact" ? "wwc:text-[11px]" : "wwc:text-[12px]"}`}
						>
							{profileEmail}
						</div>
					)}
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<div className={ddRowClass}>
				<span className={`${ddTextClass} wwc:text-foreground/80`}>{L.theme}</span>
				<div className="wwc:flex wwc:items-center wwc:gap-0.5 wwc:border wwc:rounded-lg wwc:p-0.5">
					{(["light", "dark"] as ThemeMode[]).map((m) => {
						const Icon = m === "light" ? Sun : Moon;
						return (
							<Button
								key={m}
								variant="ghost"
								icon
								aria-label={L.themeToggle(m)}
								onClick={(e) => {
									e.preventDefault();
									applyTheme(m);
								}}
								className={`${density === "compact" ? "wwc:h-6 wwc:w-6" : "wwc:h-7 wwc:w-7"} ${theme === m ? "wwc:bg-muted wwc:text-foreground" : "wwc:text-muted-foreground/70 wwc:hover:text-foreground"}`}
							>
								<Icon className={density === "compact" ? "wwc:h-3 wwc:w-3" : "wwc:h-3.5 wwc:w-3.5"} />
							</Button>
						);
					})}
				</div>
			</div>
			<DropdownMenuSeparator />
			<DropdownMenuItem className={ddItemClass} onClick={onLogout}>
				<span className={ddTextClass}>{L.logOut}</span>
				<LogOut className={`${ddIconClass} wwc:text-muted-foreground`} />
			</DropdownMenuItem>
			{(statusBranch || statusCommit) && (
				<>
					<DropdownMenuSeparator />
					<div className="wwc:px-2 wwc:py-3">
						<div className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:uppercase wwc:tracking-wide wwc:mb-0.5">
							{L.source}
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-[12px] wwc:text-muted-foreground wwc:font-mono">
							{statusBranch && <span className="wwc:truncate">{statusBranch}</span>}
							{statusBranch && statusCommit && <span aria-hidden>·</span>}
							{statusCommit && <span>{statusCommit}</span>}
						</div>
					</div>
				</>
			)}
		</DropdownMenuContent>
	);

	// Which collapsed-rail nav item currently has its sub-tab flyout open.
	const [railFlyoutId, setRailFlyoutId] = useState<string | null>(null);
	// Which collapsible groups the user has folded shut, keyed by label. Absent = expanded, so a group
	// only ever needs recording once the user acts on it.
	const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
	// Internal collapse state, restored from localStorage (so it survives a reload), else seeded from the
	// `collapsed` prop. Kept in sync with the prop when the parent drives it.
	const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
		try {
			const saved = typeof window !== "undefined" ? window.localStorage.getItem(COLLAPSE_KEY) : null;
			if (saved === "1") return true;
			if (saved === "0") return false;
		} catch {
			// storage unavailable
		}
		return collapsed;
	});
	// Sync from the prop only when the parent actually changes it — keep the restored value on mount.
	const firstCollapseSync = useRef(true);
	useEffect(() => {
		if (firstCollapseSync.current) {
			firstCollapseSync.current = false;
			return;
		}
		setIsCollapsed(collapsed);
	}, [collapsed]);
	// Toggle collapse from inside the sidebar, persist it, AND notify the parent so it can reflow the layout.
	const setCollapsed = (next: boolean) => {
		setIsCollapsed(next);
		try {
			window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
		} catch {
			// ignore
		}
		onCollapsedChange?.(next);
	};
	/** The built-in notifications panel. Opened from the Notifications row in the pinned block, and
	 *  from the rail's notifications icon when collapsed — it used to hang off a bell in the footer. */
	function renderNotificationsPanel(side: "top" | "right", align: "end" | "start") {
		return (
			<PopoverContent
				side={side}
				align={align}
				className={`wwc:w-[300px] wwc:p-0 wwc:rounded-xl wwc:flex wwc:flex-col wwc:h-[340px] ${FLOAT_SHADOW}`}
			>
				<ScrollArea className="wwc:flex-1 wwc:min-h-0" scrollbarClassName="wwc:w-1.5" thumbClassName="wwc:bg-border/60">
					{panelNotifications.length === 0 && (
						<div className="wwc:px-4 wwc:py-8 wwc:text-center wwc:text-[12px] wwc:text-muted-foreground">
							{L.notificationsEmpty}
						</div>
					)}
					{panelNotifications.map((n) => {
						const rowClass = `wwc:w-full wwc:text-start wwc:px-4 wwc:py-3 wwc:border-b wwc:last:border-b-0 wwc:transition-colors ${
							onNotificationSelect ? "wwc:cursor-pointer wwc:hover:bg-muted" : ""
						} ${n.unread ? "wwc:bg-accent/40" : ""}`;
						// A real <button> when it is selectable, a plain <div> when it is not — rather than a
						// div wearing role="button", which has to reimplement focus and Enter/Space by hand and
						// gets them subtly wrong.
						const Row = onNotificationSelect ? "button" : "div";
						return (
							<Row
								key={n.id}
								{...(onNotificationSelect ? {type: "button" as const, onClick: () => onNotificationSelect(n)} : {})}
								className={rowClass}
							>
								<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-2">
									<div className="wwc:min-w-0">
										<div className="wwc:flex wwc:items-center wwc:gap-1.5">
											{n.unread && (
												<div className="wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-blue-500 wwc:flex-shrink-0 wwc:mt-0.5" />
											)}
											<span className="wwc:text-[12px] wwc:font-medium wwc:text-foreground">{n.title}</span>
										</div>
										{n.body && <div className="wwc:text-[11px] wwc:text-muted-foreground wwc:mt-0.5">{n.body}</div>}
									</div>
									<span className="wwc:text-[11px] wwc:text-muted-foreground/70 wwc:flex-shrink-0">{n.time}</span>
								</div>
							</Row>
						);
					})}
				</ScrollArea>
				{onViewAllNotifications && (
					<div className="wwc:flex-shrink-0 wwc:border-t wwc:border-border wwc:p-1">
						<button
							type="button"
							onClick={() => {
								setNotifOpen(false);
								onViewAllNotifications();
							}}
							className="wwc:w-full wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-[12px] wwc:font-medium wwc:text-foreground/80 wwc:transition-colors wwc:hover:bg-muted/50 wwc:hover:text-foreground"
						>
							{L.viewAllNotifications}
						</button>
					</div>
				)}
			</PopoverContent>
		);
	}

	const resolvedOrgGroups = orgGroups ?? DEFAULT_ORG_GROUPS;
	const resolvedProjectGroups = projectGroups ?? DEFAULT_PROJECT_GROUPS;
	const baseGroups = viewLevel === "org" ? resolvedOrgGroups : resolvedProjectGroups;
	// Search is a nav ROW that hands off to a surface of the consumer's choosing, not an inline filter,
	// so the nav always renders every group.
	const groups = baseGroups;
	const allNavItems = baseGroups.flatMap((g) => g.items);
	const activeSubMenu = allNavItems.find((n) => n.id === activeSubMenuId)?.subMenu ?? null;

	// Reset to main view when level switches and navigate to the first tab
	const onNavigateRef = useRef(onNavigate);
	onNavigateRef.current = onNavigate;
	const onNavigateItemRef = useRef(onNavigateItem);
	onNavigateItemRef.current = onNavigateItem;
	const prevViewLevel = useRef(viewLevel);
	useEffect(() => {
		setView("main");
		setActiveSubMenuId(null);
		const firstItem = viewLevel === "org" ? resolvedOrgGroups[0]?.items[0] : resolvedProjectGroups[0]?.items[0];
		if (firstItem) {
			setActiveItem(firstItem.id);
			// Only navigate when viewLevel actually changes, not on initial mount
			if (prevViewLevel.current !== viewLevel) {
				onNavigateRef.current?.(firstItem.label);
				onNavigateItemRef.current?.(firstItem);
			}
			prevViewLevel.current = viewLevel;
		}
	}, [viewLevel, resolvedOrgGroups, resolvedProjectGroups]);

	// Controlled selection: resolve activeItemId to the matching top-level item
	// or sub-menu item and open the right view. Lets a parent drive the
	// highlight from its route without synthetic DOM clicks — works in the
	// collapsed rail/flyout too, where there are no text labels to match.
	useEffect(() => {
		if (!activeItemId) return;
		if (baseGroups.some((g) => g.items.some((i) => i.id === activeItemId))) {
			setView("main");
			setActiveSubMenuId(null);
			setActiveItem(activeItemId);
			return;
		}
		for (const g of baseGroups) {
			for (const item of g.items) {
				if (item.subMenu?.groups.some((sg) => sg.items.some((s) => s.id === activeItemId))) {
					setView("sub");
					setActiveSubMenuId(item.id);
					setActiveItem(activeItemId);
					return;
				}
			}
		}
	}, [activeItemId, baseGroups]);

	/** Choosing a group — from the expanded header's name or the collapsed rail's flyout title. Opens
	 *  the group's page, and expands it, so the nav never contradicts the surface it just opened. */
	function selectGroup(group: SidebarNavGroup) {
		if (!group.id) return;
		if (group.collapsible && group.label) {
			const label = group.label;
			setCollapsedGroups((prev) => ({...prev, [label]: false}));
		}
		onGroupSelect?.(group.id);
	}

	function openSub(item: SidebarNavItem) {
		if (item.expandable && item.subMenu) {
			setActiveSubMenuId(item.id);
			setView("sub");
			const firstSubItem = item.subMenu.groups[0]?.items[0];
			if (firstSubItem) {
				setActiveItem(firstSubItem.id);
				onNavigate?.(firstSubItem.label, true, item.label);
				onNavigateItem?.(firstSubItem, item);
			} else {
				onNavigate?.(item.label, true);
				onNavigateItem?.(item);
			}
		} else {
			setActiveItem(item.id);
			onNavigate?.(item.label);
			onNavigateItem?.(item);
		}
	}

	function closeSub() {
		setView("main");
		setActiveSubMenuId(null);
	}

	// ── Nav item renderer ──
	/** An item inside a group. In a tree it carries the elbow that ties it to the group's spine. */
	function renderGroupItem(item: SidebarNavItem, tree: boolean) {
		if (!tree) return <NavRow key={item.id} item={item} />;
		return (
			<div key={item.id} className="wwc:relative">
				<span
					aria-hidden
					className={`wwc:pointer-events-none wwc:absolute wwc:top-1/2 wwc:h-px wwc:bg-border ${SIDEBAR_DENSITY[density].groupElbow}`}
				/>
				<NavRow item={item} />
			</div>
		);
	}

	function NavRow({item}: {item: SidebarNavItem}) {
		// When a PINNED entry (Files, Home, the Marketplace) or a GROUP PAGE owns the selection, no app
		// nav item reads as active — that entry carries the mark instead, and a stale item highlight
		// underneath it would claim the surface belongs to two places at once.
		const isActive =
			!marketplaceActive &&
			!homeActive &&
			!pinnedTop?.active &&
			activeGroupId === undefined &&
			(activeItem === item.id || (item.subMenu?.groups.some((g) => g.items.some((i) => i.id === activeItem)) ?? false));
		const className = `wwc:w-full wwc:flex wwc:items-center ${d.row} wwc:rounded-lg wwc:transition-colors wwc:group ${
			isActive
				? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
				: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground"
		}`;
		const content = (
			<>
				<span className="wwc:relative wwc:flex wwc:flex-shrink-0 wwc:items-center">
					{item.tone ? (
						// The tint owns the icon's colour, so it deliberately does NOT take the row's hover or
						// active foreground — that would wash the hue out exactly when the reader points at it.
						<span className={`wwc:flex wwc:items-center wwc:justify-center wwc:rounded-md ${d.toneChip} ${item.tone}`}>
							<item.icon className={d.toneIconSize} />
						</span>
					) : (
						<item.icon className={`${d.iconSize} wwc:text-muted-foreground wwc:group-hover:text-foreground`} />
					)}
					{item.dot && (
						<span
							className={`wwc:absolute wwc:-right-0.5 wwc:-top-0.5 wwc:h-2 wwc:w-2 wwc:rounded-full wwc:ring-2 wwc:ring-card ${item.dot}`}
						/>
					)}
				</span>
				<span className="wwc:flex-1 wwc:text-start wwc:truncate wwc:min-w-0">{item.label}</span>
				{item.badge && (
					<Badge
						variant="secondary"
						className="wwc:ml-1 wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded-full wwc:leading-none wwc:h-auto wwc:font-medium"
					>
						{item.badge}
					</Badge>
				)}
				{item.expandable && (
					<ChevronRight className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground wwc:flex-shrink-0" />
				)}
			</>
		);
		if (item.href) {
			return (
				<a
					href={item.href}
					data-wakecore-route-link
					onClick={(event) => {
						event.preventDefault();
						openSub(item);
					}}
					className={className}
				>
					{content}
				</a>
			);
		}
		return (
			<button type="button" onClick={() => openSub(item)} className={className}>
				{content}
			</button>
		);
	}

	// ── Collapsed icon-only rail ──
	if (isCollapsed) {
		const railWidth = density === "compact" ? "wwc:w-[52px]" : "wwc:w-16";
		const railHeader = density === "compact" ? "wwc:h-9" : "wwc:h-11";
		const iconBtn = density === "compact" ? "wwc:h-8 wwc:w-8" : "wwc:h-9 wwc:w-9";
		// Empty groups are dropped so a group with nothing in it (installed apps, before the first
		// install) cannot leave a divider floating with no icons under it.
		const railGroups = baseGroups.filter((g) => g.items.length > 0);
		// forwardRef + a rest spread so this can serve as a Radix `asChild` trigger. Without them the
		// notifications entry in the rail was inert: Radix hands its handlers and ref to the element it
		// is given, and a plain function component that declares a fixed prop list silently drops both,
		// so the icon rendered but nothing opened.
		const RailIconButton = forwardRef<
			HTMLButtonElement,
			{
				label: string;
				isActive?: boolean;
				hasBadge?: boolean;
				href?: string;
				children: React.ReactNode;
			} & Omit<React.ComponentPropsWithoutRef<"button">, "children">
		>(({label, isActive, hasBadge, href, onClick, children, ...rest}, ref) => {
			const className = `wwc:relative wwc:flex wwc:items-center wwc:justify-center wwc:rounded-lg wwc:transition-colors ${iconBtn} ${
				isActive
					? "wwc:bg-muted wwc:text-foreground"
					: "wwc:text-muted-foreground wwc:hover:bg-muted/50 wwc:hover:text-foreground"
			}`;
			const content = (
				<>
					{children}
					{hasBadge && (
						<span className="wwc:absolute wwc:top-1 wwc:right-1 wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-blue-500" />
					)}
				</>
			);
			return (
				<HoverTooltip content={label} side="right">
					{href ? (
						<a
							href={href}
							data-wakecore-route-link
							onClick={(event) => {
								event.preventDefault();
								// `onClick` is now a real mouse handler (so Radix can compose onto it); the anchor
								// branch hands it the same event after suppressing navigation.
								onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
							}}
							aria-label={label}
							className={className}
						>
							{content}
						</a>
					) : (
						<button type="button" ref={ref} aria-label={label} className={className} onClick={onClick} {...rest}>
							{content}
						</button>
					)}
				</HoverTooltip>
			);
		});
		RailIconButton.displayName = "RailIconButton";

		// The rail's drill-in flyout: one icon that opens a titled list. Used by BOTH an `expandable` item
		// with a `subMenu` and a group carrying an `icon`, so the two can never diverge into different
		// behaviours for what is, to the user, the same gesture.
		const RailFlyout = ({
			flyoutId,
			label,
			title,
			icon: Icon,
			isActive,
			hasBadge,
			rows,
			onSelect,
			onTitleSelect,
			titleActive,
		}: {
			flyoutId: string;
			label: string;
			title: string;
			icon: React.ComponentType<{className?: string}>;
			isActive: boolean;
			hasBadge?: boolean;
			rows: {
				id: string;
				label: string;
				icon: React.ComponentType<{className?: string}>;
				badge?: string;
				tone?: string;
			}[];
			onSelect: (rowId: string) => void;
			/** Makes the flyout's TITLE a link, the way a group's name is in the expanded sidebar. Omitted
			 *  for an item's sub-menu, which has no page of its own to open. */
			onTitleSelect?: () => void;
			/** Underlines the title while that group's page is the open surface — the same mark the
			 *  expanded sidebar puts on the group name. */
			titleActive?: boolean;
		}) => {
			const flyoutOpen = railFlyoutId === flyoutId;
			return (
				<Popover
					open={railFlyoutId === flyoutId}
					// Closing only ever clears the slot if THIS flyout still holds it. One shared piece of
					// state serves every rail flyout, and clicking straight from one group's icon to
					// another's makes the two overlap: the new flyout claims the slot on click, and the old
					// one is dismissed a moment later when focus lands outside it. An unconditional
					// `setRailFlyoutId(null)` on that dismissal wiped the claim the click had just made, so
					// the click was spent closing rather than switching and the switch took two. Comparing
					// against the current value makes the late close a no-op instead.
					onOpenChange={(open) =>
						setRailFlyoutId((current) => (open ? flyoutId : current === flyoutId ? null : current))
					}
				>
					{/* While the flyout is open the icon drops its hover treatment entirely — no fill, and no
				    tooltip. The open menu already names the group and sits right beside it, so a hover
				    fill under it and a tooltip over it are both just noise. A genuinely active surface
				    still keeps its fill. */}
					{(() => {
						const trigger = (
							<PopoverTrigger asChild>
								<button
									type="button"
									aria-label={label}
									data-rail-flyout={flyoutId}
									// Decide on POINTERDOWN, not on click. `RailFlyout` is defined inside this render
									// body, so every state change gives it a new component identity and React remounts
									// each flyout — which means a decision made on `click` has to survive both that
									// remount and the old flyout's dismissal. Pressing is the first thing that happens,
									// so the assignment lands before anything can undo it, and the guarded
									// `onOpenChange` below stops the old flyout's later close from clearing it.
									onPointerDown={() => setRailFlyoutId(flyoutOpen ? null : flyoutId)}
									// Keyboard never fires pointerdown, so Enter/Space toggle here instead.
									onKeyDown={(event) => {
										if (event.key !== "Enter" && event.key !== " ") return;
										event.preventDefault();
										setRailFlyoutId(flyoutOpen ? null : flyoutId);
									}}
									// The pointer path has already decided; this only stops Radix's own toggle from
									// running afterwards and flipping it straight back (it composes handlers and skips
									// its own once the default is prevented).
									onClick={(event) => event.preventDefault()}
									className={`wwc:relative wwc:flex wwc:items-center wwc:justify-center wwc:rounded-lg wwc:transition-colors ${iconBtn} ${
										isActive
											? "wwc:bg-muted wwc:text-foreground"
											: flyoutOpen
												? "wwc:text-foreground"
												: "wwc:text-muted-foreground wwc:hover:bg-muted/50 wwc:hover:text-foreground"
									}`}
								>
									<Icon className={d.iconSize} />
									{hasBadge && (
										<span className="wwc:absolute wwc:top-1 wwc:right-1 wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:bg-blue-500" />
									)}
								</button>
							</PopoverTrigger>
						);
						return flyoutOpen ? (
							trigger
						) : (
							<HoverTooltip content={label} side="right">
								{trigger}
							</HoverTooltip>
						);
					})()}
					<PopoverContent
						side="right"
						align="start"
						className={`wwc:w-[220px] wwc:p-1 wwc:rounded-xl ${FLOAT_SHADOW}`}
						// A pointer-down on another rail icon must SWITCH to that flyout, not merely dismiss this
						// one and leave the click spent. Handle it here and let that icon's own click finish the
						// job; everything else dismisses normally.
						onPointerDownOutside={(event) => {
							const target = event.target as HTMLElement | null;
							if (target?.closest("[data-rail-flyout]")) event.preventDefault();
						}}
					>
						{onTitleSelect ? (
							<button
								type="button"
								onClick={() => {
									onTitleSelect();
									setRailFlyoutId(null);
								}}
								className={`wwc:w-full wwc:rounded-md wwc:px-2 wwc:py-1.5 wwc:text-left wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:transition-colors wwc:hover:underline wwc:hover:text-foreground ${
									titleActive ? "wwc:text-foreground wwc:underline" : "wwc:text-muted-foreground/70"
								}`}
							>
								{title}
							</button>
						) : (
							<div className="wwc:px-2 wwc:py-1.5 wwc:text-[11px] wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground/70">
								{title}
							</div>
						)}
						{rows.map((row) => {
							const RowIcon = row.icon;
							const rowActive = activeItem === row.id;
							return (
								<button
									key={row.id}
									type="button"
									onClick={() => {
										onSelect(row.id);
										setRailFlyoutId(null);
									}}
									className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded-lg wwc:px-2 wwc:py-1.5 wwc:text-[13px] wwc:transition-colors ${
										rowActive
											? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
											: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground"
									}`}
								>
									{row.tone ? (
										// The same tinted chip the expanded nav gives this item: collapsing the sidebar
										// must not change what an app looks like, or the colour stops being an identity.
										<span
											className={`wwc:flex wwc:flex-shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md wwc:h-[22px] wwc:w-[22px] ${row.tone}`}
										>
											<RowIcon className="wwc:h-[13px] wwc:w-[13px]" />
										</span>
									) : (
										<RowIcon className="wwc:h-4 wwc:w-4 wwc:flex-shrink-0 wwc:text-muted-foreground" />
									)}
									<span className="wwc:flex-1 wwc:text-left wwc:truncate">{row.label}</span>
									{row.badge && (
										<Badge
											variant="secondary"
											className="wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded-full wwc:leading-none wwc:h-auto"
										>
											{row.badge}
										</Badge>
									)}
								</button>
							);
						})}
					</PopoverContent>
				</Popover>
			);
		};

		// One rail icon. Pulled out of the nav loop so the loop can walk GROUPS rather than a flat item
		// list — the rail needs the group boundaries to draw dividers, exactly as the expanded sidebar does.
		const renderRailItem = (item: SidebarNavItem) => {
			const isActive =
				!marketplaceActive &&
				!homeActive &&
				!pinnedTop?.active &&
				activeGroupId === undefined &&
				(activeItem === item.id ||
					(item.subMenu?.groups.some((g) => g.items.some((i) => i.id === activeItem)) ?? false));

			// Items with a sub-menu open a small flyout to pick a tab; the rest navigate directly.
			if (item.expandable && item.subMenu) {
				const subItems = item.subMenu.groups.flatMap((g) => g.items);
				return (
					<RailFlyout
						key={item.id}
						flyoutId={item.id}
						label={item.label}
						title={item.subMenu.title}
						icon={item.icon}
						isActive={isActive}
						hasBadge={Boolean(item.badge)}
						rows={subItems}
						onSelect={(rowId) => {
							const sub = subItems.find((s) => s.id === rowId);
							if (!sub) return;
							setActiveItem(sub.id);
							onNavigate?.(sub.label, false, item.label);
							onNavigateItem?.(sub, item);
						}}
					/>
				);
			}

			return (
				<RailIconButton
					key={item.id}
					label={item.label}
					isActive={isActive}
					hasBadge={Boolean(item.badge)}
					href={item.href}
					onClick={() => openSub(item)}
				>
					<span className="wwc:relative wwc:flex wwc:items-center wwc:justify-center">
						<item.icon className={d.iconSize} />
						{item.dot && (
							<span
								className={`wwc:absolute wwc:-right-1 wwc:-top-1 wwc:h-2 wwc:w-2 wwc:rounded-full wwc:ring-2 wwc:ring-card ${item.dot}`}
							/>
						)}
					</span>
				</RailIconButton>
			);
		};

		// A group carrying an icon collapses to that ONE icon, whose flyout lists its items — the same
		// gesture and the same flyout an `expandable` item uses. Selecting a row navigates exactly as
		// clicking that item in the expanded sidebar does.
		const renderRailGroup = (group: SidebarNavGroup) => {
			if (!group.icon || !group.label) return group.items.map(renderRailItem);
			const label = group.label;
			return (
				<RailFlyout
					key={`group-${label}`}
					flyoutId={`group-${label}`}
					label={label}
					title={label}
					icon={group.icon}
					// A group page owns the selection outright: exactly that group's icon lights, and no
					// sibling may borrow the highlight from a stale item. Otherwise fall back to lighting
					// whichever group holds the active item.
					isActive={
						!marketplaceActive &&
						!homeActive &&
						!pinnedTop?.active &&
						(activeGroupId !== undefined ? activeGroupId === group.id : group.items.some((i) => i.id === activeItem))
					}
					titleActive={group.id !== undefined && activeGroupId === group.id}
					hasBadge={group.items.some((i) => Boolean(i.dot))}
					rows={group.items}
					onSelect={(rowId) => {
						const item = group.items.find((i) => i.id === rowId);
						if (item) openSub(item);
					}}
					onTitleSelect={group.id ? () => selectGroup(group) : undefined}
				/>
			);
		};

		return (
			<div
				className={`wwc:relative wwc:h-full wwc:select-none wwc:flex-shrink-0 wwc:overflow-hidden wwc:bg-card wwc:text-card-foreground wwc:transition-[width] wwc:duration-200 wwc:ease-linear ${seamless ? "" : "wwc:border-r wwc:shadow-sm"} ${railWidth}`}
			>
				<TooltipProvider delayDuration={0} disableHoverableContent>
					<div className={`wwc:absolute wwc:inset-y-0 wwc:left-0 ${railWidth} wwc:flex wwc:flex-col wwc:items-center`}>
						{/* Expand toggle — restores the full sidebar */}
						<div
							className={`wwc:flex wwc:items-center wwc:justify-center wwc:border-b wwc:w-full wwc:flex-shrink-0 ${railHeader}`}
						>
							{/* Collapsed brand: show the logo (custom `logoCollapsed`, or the WakeCap mark by default),
							    and reveal the expand affordance on hover. */}
							<button
								type="button"
								onClick={() => setCollapsed(false)}
								aria-label={L.expandSidebar}
								className={`wwc:group wwc:relative wwc:flex wwc:items-center wwc:justify-center wwc:rounded-lg wwc:transition-colors wwc:hover:bg-muted/50 ${iconBtn}`}
							>
								<span className="wwc:flex wwc:items-center wwc:transition-opacity wwc:group-hover:opacity-0">
									{logoCollapsed ?? <WakecapWLogo className={`${d.brandMark} wwc:text-primary`} />}
								</span>
								<PanelLeftOpen
									className={`${d.iconSize} wwc:absolute wwc:text-foreground wwc:opacity-0 wwc:transition-opacity wwc:group-hover:opacity-100`}
								/>
							</button>
						</div>

						{/* Nav icons */}
						<ScrollArea
							dir={navDir}
							className="wwc:flex-1 wwc:w-full"
							scrollbarClassName="wwc:w-1.5"
							thumbClassName="wwc:bg-border/60"
						>
							<div className={`wwc:flex wwc:flex-col wwc:items-center wwc:py-1 ${d.spacing}`}>
								{/* The same pinned block the expanded nav shows, in the same order, divided from the group
								    icons the way the expanded sidebar divides it from the groups. */}
								{pinnedEntries.map((entry) => {
									const railRow = (
										<RailIconButton label={entry.label} isActive={entry.active} onClick={entry.onSelect}>
											<entry.icon className={d.pinnedIconSize} />
											{entry.badge && (
												<span
													aria-label={L.unreadCount(unreadNotifications)}
													className="wwc:absolute wwc:right-0.5 wwc:top-0.5 wwc:flex wwc:h-[13px] wwc:min-w-[13px] wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-muted wwc:px-1 wwc:text-[8px] wwc:font-medium wwc:leading-none wwc:text-foreground wwc:ring-2 wwc:ring-card wwc:tabular-nums"
												>
													{entry.badge}
												</span>
											)}
										</RailIconButton>
									);
									return entry.builtInNotifications ? (
										<Popover key={entry.key} open={notifOpen} onOpenChange={setNotifOpen}>
											<PopoverTrigger asChild>{railRow}</PopoverTrigger>
											{renderNotificationsPanel("right", "start")}
										</Popover>
									) : (
										<Fragment key={entry.key}>{railRow}</Fragment>
									);
								})}
								{pinnedBlock && pinnedBlockDivider && railGroups.length > 0 && (
									<Separator className="wwc:my-1 wwc:w-6" />
								)}

								{/* One block per nav group, divided the way the expanded sidebar divides them. The rail
								    used to flatten every group into a single run of icons, so collapsing the sidebar lost
								    the boundaries (installed apps / workspace / settings) the expanded one shows. */}
								{railGroups.map((group, gi) => (
									<Fragment key={group.label ?? `rail-group-${gi}`}>
										{/* Two icon-groups are already visually distinct — each is one icon standing for a
										    whole group — so a divider between them would just be noise. A divider still
										    separates them from any group that spells its items out, and `dividerBefore`
									    lets a group starting a different SECTION ask for one regardless. */}
										{gi > 0 &&
											(group.dividerBefore || (showGroupDividers && !(group.icon && railGroups[gi - 1].icon))) && (
												<Separator className="wwc:my-1 wwc:w-6" />
											)}
										{renderRailGroup(group)}
									</Fragment>
								))}

								{/* Marketplace / app-installer entry — pinned under the app icons. */}
								{showMarketplace && (
									<>
										{allNavItems.length > 0 && <Separator className="wwc:my-1 wwc:w-6" />}
										<RailIconButton label={marketplaceLabel} isActive={marketplaceActive} onClick={onMarketplace}>
											<Plus className={d.iconSize} />
										</RailIconButton>
									</>
								)}
							</div>
						</ScrollArea>

						{/* Footer: profile (+ notifications, comfortable only — compact omits notifications like the compact sidebar) */}
						{showFooter && (
							<div className="wwc:border-t wwc:w-full wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:py-2 wwc:flex-shrink-0">
								{/* Same profile menu as the expanded footer's "..." button — on the rail the avatar
								    IS the trigger, since there is no room for a separate action button. */}
								<DropdownMenu>
									<HoverTooltip content={profileName} side="right">
										<DropdownMenuTrigger asChild>
											<button
												type="button"
												aria-label={L.profileMenu(profileName)}
												className={`wwc:flex wwc:items-center wwc:justify-center wwc:rounded-full wwc:transition-colors wwc:hover:bg-muted ${iconBtn}`}
											>
												<Avatar className="wwc:h-6 wwc:w-6">
													{profileAvatar && <AvatarImage src={profileAvatar} alt={profileName} />}
													<AvatarFallback
														className="wwc:text-white wwc:text-[9px] wwc:font-bold"
														style={{background: "radial-gradient(circle at 35% 35%, #a855f7, #6366f1, #1e40af)"}}
													>
														{profileInitials}
													</AvatarFallback>
												</Avatar>
											</button>
										</DropdownMenuTrigger>
									</HoverTooltip>
									{renderProfileMenu("right", "end")}
								</DropdownMenu>
							</div>
						)}
					</div>
				</TooltipProvider>
			</div>
		);
	}

	// ── Render ──
	return (
		<div
			className={`wwc:relative wwc:h-full wwc:select-none wwc:flex-shrink-0 wwc:overflow-hidden wwc:bg-card wwc:text-card-foreground wwc:transition-[width] wwc:duration-200 wwc:ease-linear ${seamless ? "" : "wwc:border-r wwc:shadow-sm"} wwc:w-[260px]`}
		>
			{/* ── Inner sidebar ── */}
			<div className="wwc:absolute wwc:inset-y-0 wwc:left-0 wwc:w-[260px] wwc:flex wwc:flex-col">
				{/* ── Header: Brand + collapse toggle ── */}
				<div className={`wwc:flex wwc:items-center wwc:border-b wwc:flex-shrink-0 ${d.header}`}>
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-2 wwc:w-full wwc:min-w-0">
						{density === "compact" && onPin && (
							<Button
								variant="ghost"
								icon
								onClick={onPin}
								aria-label={L.pinSidebar}
								className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground wwc:hover:text-foreground wwc:flex-shrink-0"
							>
								<PanelRightOpen className="wwc:h-3.5 wwc:w-3.5" />
							</Button>
						)}
						{density !== "compact" && onPin && (
							<Button
								variant="ghost"
								icon
								onClick={onPin}
								aria-label={L.pinSidebar}
								className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground wwc:hover:text-foreground wwc:flex-shrink-0"
							>
								<PanelRightOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
						{/* Brand — a custom `logo`, an org switcher (when `orgs` provided), or the default mark + name. */}
						{logo ? (
							<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:overflow-hidden">{logo}</div>
						) : orgs && orgs.length > 0 ? (
							<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
								{/* WakeCap brand mark, separated from the org selector by a slash */}
								<WakecapWLogo className={`${d.brandMark} wwc:shrink-0 wwc:text-foreground`} />
								<span className="wwc:shrink-0 wwc:text-muted-foreground/50">/</span>
								<Switcher
									density={density}
									items={orgs}
									selected={selectedOrgName}
									onSelect={(o) => onOrgChange?.(o)}
									placeholder={L.orgSearchPlaceholder}
									emptyLabel={L.orgEmpty}
									onViewAll={onOrgViewAll}
									viewAllLabel={L.orgViewAll}
									triggerClassName={`wwc:h-8 wwc:min-w-0 wwc:gap-2 wwc:px-1.5 wwc:font-semibold wwc:text-foreground ${density === "compact" ? "wwc:text-[13px]" : "wwc:text-[14px]"}`}
								>
									{activeOrgLogo && <span className="wwc:flex wwc:shrink-0 wwc:items-center">{activeOrgLogo}</span>}
									<span className="wwc:truncate">{selectedOrgName}</span>
								</Switcher>
							</div>
						) : (
							<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:text-foreground wwc:min-w-0">
								<WakecapWLogo className={d.brandMark} />
								<span
									className={`wwc:font-semibold wwc:truncate ${density === "compact" ? "wwc:text-[13px]" : "wwc:text-[14px]"}`}
								>
									{brandName}
								</span>
							</div>
						)}
						<div className="wwc:flex-1" />
						{/* Collapse toggle — far right, beside the brand. Hidden in the mobile sheet, where the
						    sheet's own close button is the single dismiss control. */}
						{!hideCollapse && (
							<Button
								variant="ghost"
								icon
								onClick={() => setCollapsed(true)}
								aria-label={L.collapseSidebar}
								className={`wwc:text-muted-foreground wwc:hover:text-foreground wwc:flex-shrink-0 ${density === "compact" ? "wwc:h-6 wwc:w-6" : "wwc:h-7 wwc:w-7"}`}
							>
								<PanelRightOpen className={density === "compact" ? "wwc:h-3.5 wwc:w-3.5" : "wwc:h-4 wwc:w-4"} />
							</Button>
						)}
					</div>
				</div>

				{/* ── Nav ── */}
				<ScrollArea
					dir={navDir}
					className="wwc:flex-1"
					scrollbarClassName="wwc:w-1.5"
					thumbClassName="wwc:bg-border/60"
				>
					{view === "main" ? (
						<div className={d.container}>
							{/* The pinned block: the pinned entry and Home sit TOGETHER above one rule, rather than
							    being divided from each other. Both are surfaces that stand outside the app hierarchy
							    below — Files addresses every app's records, Home launches them — so the boundary that
							    matters is the one under the pair, not between them. Hidden while searching, since a
							    query is asking about the nav items below. */}
							{pinnedBlock && (
								<>
									<div className={d.pinnedSpacing}>
										{pinnedEntries.map((entry) => {
											const row = (
												<button
													type="button"
													onClick={entry.onSelect}
													className={`wwc:w-full wwc:flex wwc:items-center ${d.pinnedRow} wwc:rounded-lg wwc:transition-colors wwc:group ${
														entry.active
															? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
															: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground"
													}`}
												>
													<entry.icon
														className={`${d.pinnedIconSize} wwc:flex-shrink-0 wwc:text-muted-foreground wwc:group-hover:text-foreground`}
													/>
													<span className="wwc:flex-1 wwc:text-start wwc:truncate wwc:min-w-0">{entry.label}</span>
													{entry.hint && (
														<kbd className="wwc:ml-1 wwc:flex-shrink-0 wwc:rounded wwc:border wwc:border-border wwc:bg-muted/60 wwc:px-1 wwc:py-px wwc:font-sans wwc:text-[10px] wwc:leading-none wwc:text-muted-foreground">
															{entry.hint}
														</kbd>
													)}
													{entry.badge && (
														<span
															aria-label={L.unreadCount(unreadNotifications)}
															className="wwc:ml-1 wwc:flex-shrink-0 wwc:text-[11px] wwc:font-medium wwc:leading-none wwc:text-muted-foreground wwc:tabular-nums"
														>
															{entry.badge}
														</span>
													)}
												</button>
											);
											// The built-in panel opens off the row itself, so the notifications feature survives
											// the footer bell it used to hang from.
											return entry.builtInNotifications ? (
												<Popover key={entry.key} open={notifOpen} onOpenChange={setNotifOpen}>
													<PopoverTrigger asChild>{row}</PopoverTrigger>
													{renderNotificationsPanel("right", "start")}
												</Popover>
											) : (
												<Fragment key={entry.key}>{row}</Fragment>
											);
										})}
									</div>
									{pinnedBlockDivider && groups.length > 0 && <Separator className={d.separator} />}
								</>
							)}

							{groups.map((group, gi) => {
								// A collapsible group folds shut on the chevron; searching forces every group open so a
								// match can never hide behind a collapsed header.
								// Absent from `collapsedGroups` = untouched, so the default decides. A live query always
								// forces every group open, so a match can never hide behind a folded header.
								const folded = Boolean(
									group.collapsible && group.label && (collapsedGroups[group.label] ?? groupsCollapsedByDefault),
								);
								// An icon-group is a TREE: the header reads as the parent row (same metrics as an item)
								// and the items hang off a guide beneath it. Everything else keeps the small uppercase
								// caption this sidebar has always used for group labels — at FULL muted-foreground, since the 10px
								// caption is "small text" and WCAG 1.4.3 wants ≥4.5:1; the old `/40` opacity fell to ~1.69:1. (WC-GAP-02)
								const tree = Boolean(group.icon);
								// Does a rule already stand between this group and the one above it?
								const ruled = (showGroupDividers || Boolean(group.dividerBefore)) && gi > 0;
								const headerClass = tree
									? `${d.row} wwc:flex wwc:items-center wwc:font-medium wwc:text-foreground/80`
									: `${d.groupLabel} wwc:flex wwc:items-center wwc:gap-1.5 wwc:font-semibold wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground`;
								// No `flex-1`: the name sizes to its text so the chevron can sit right beside it rather
								// than being pushed to the far edge. `min-w-0` still lets a long name truncate.
								const nameClass = tree
									? "wwc:min-w-0 wwc:truncate wwc:text-start wwc:transition-colors"
									: "wwc:min-w-0 wwc:truncate wwc:text-start wwc:uppercase wwc:tracking-widest wwc:transition-colors";
								// The header is ONE control: name, icon and chevron all fold the group, so the whole row
								// carries the row hover the nav items use rather than the chevron lighting on its own.
								const headerFoldClass = `${headerClass} wwc:w-full wwc:rounded-lg wwc:transition-colors wwc:hover:bg-muted/50 wwc:hover:text-foreground`;
								return (
									<Fragment key={group.label ?? gi}>
										{/* `showGroupDividers` draws the automatic rule between every pair of groups;
										    `dividerBefore` is an explicit request from ONE group that starts a genuinely
										    different section, and it stands whether or not the automatic rules are on. The
										    tree shape turns the automatic ones off, so this is how a break survives there. */}
										{ruled && <Separator className={d.separator} />}
										{/* The guide line below is positioned from this element's top, so the wrapper must
										    start at the HEADER — a separator inside it would push every group but the first
										    out of alignment. */}
										{/* The gap goes on the wrapper, not between every child, so it cannot land inside a
										    group and push its items away from their own header. Skipped where a rule already
										    separates the two — the rule carries its own margins, and stacking both would open
										    a gulf where the tree shape wants a quiet break. */}
										<div className={`wwc:relative ${gi > 0 && !ruled ? d.groupGap : ""}`}>
											{group.label &&
												(group.collapsible ? (
													/* ONE target, not two: the whole header folds the group — the name does exactly what
													   the chevron does. The name used to be a second, separate target that opened a page
													   about the group; it no longer navigates anywhere, so nothing here is a link and
													   nothing underlines. `activeGroupId` still MARKS the active section, but as weight
													   and colour rather than a rule under a name that is not clickable-to-navigate. */
													<button
														type="button"
														onClick={() =>
															setCollapsedGroups((prev) => ({
																...prev,
																// Negate the EFFECTIVE fold state, not the stored one. A group the user has
																// never touched is absent from this map, so `!prev[label]` read `!undefined`
																// = "fold it" — which, under `groupsCollapsedByDefault`, wrote back the
																// state it was already in and cost a second click to open every group the
																// first time.
																[group.label as string]: !(prev[group.label as string] ?? groupsCollapsedByDefault),
															}))
														}
														aria-expanded={!folded}
														aria-label={
															folded ? L.expandGroup(group.label as string) : L.collapseGroup(group.label as string)
														}
														className={`${headerFoldClass} ${activeGroupId === group.id ? "wwc:text-foreground" : ""}`}
													>
														{group.icon && (
															<group.icon
																className={`${tree ? d.iconSize : "wwc:h-3 wwc:w-3"} wwc:flex-shrink-0 wwc:text-muted-foreground`}
															/>
														)}
														{/* Name and chevron are ONE pair with their own tight gap. Left as siblings they
														    inherited the row's gap — the same space that separates the group icon from the
														    label — which read as the arrow drifting away from the word it belongs to. */}
														<span className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-0.5">
															<span className={nameClass}>{group.label}</span>
															{/* Decoration, not a control: the button around it already carries the label and
															    `aria-expanded`, so a second focus stop would announce the same thing twice.
															    Right while shut, down while open — the disclosure points at what opening it
															    would reveal, the same way every other tree in the product reads. */}
															<span
																aria-hidden
																className="wwc:flex wwc:h-4 wwc:w-4 wwc:flex-shrink-0 wwc:items-center wwc:justify-center wwc:text-muted-foreground"
															>
																{folded ? (
																	<ChevronRight className="wwc:h-3.5 wwc:w-3.5" />
																) : (
																	<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
																)}
															</span>
														</span>
														{/* Absorbs the rest of the row, so the header still fills its width while the name
														    and chevron stay together on the left. */}
														<span aria-hidden className="wwc:flex-1" />
													</button>
												) : (
													/* Nothing to fold and nowhere to navigate: a plain caption. */
													<div className={`${headerClass} ${activeGroupId === group.id ? "wwc:text-foreground" : ""}`}>
														{group.icon && (
															<group.icon
																className={`${tree ? d.iconSize : "wwc:h-3 wwc:w-3"} wwc:flex-shrink-0 wwc:text-muted-foreground`}
															/>
														)}
														<span className={nameClass}>{group.label}</span>
													</div>
												))}
											{/* Expanding and folding animate: the row area is a grid whose single track goes
										    0fr -> 1fr, which transitions to the items' natural height without measuring it.
										    The spine is absolutely placed against the group wrapper, so it shrinks with the
										    wrapper on its own — no second animation to keep in step. */}
											{tree && (
												<span
													aria-hidden
													className={`wwc:pointer-events-none wwc:absolute wwc:w-px wwc:bg-border ${d.groupGuide}`}
												/>
											)}
											{group.collapsible ? (
												<div
													className={`wwc:grid wwc:transition-[grid-template-rows] wwc:duration-200 wwc:ease-out ${
														folded ? "wwc:grid-rows-[0fr]" : "wwc:grid-rows-[1fr]"
													}`}
												>
													{/* Folded content stays mounted so the height can animate, so it must be taken out
											    of the tab order and the a11y tree explicitly — otherwise focus lands on rows
											    nobody can see. */}
													<div className="wwc:overflow-hidden" {...(folded ? INERT : undefined)}>
														<div className={`${d.spacing} ${tree ? d.groupGuideIndent : ""}`}>
															{group.items.map((item) => renderGroupItem(item, tree))}
														</div>
													</div>
												</div>
											) : (
												<div className={`${d.spacing} ${tree ? d.groupGuideIndent : ""}`}>
													{group.items.map((item) => renderGroupItem(item, tree))}
												</div>
											)}
										</div>
									</Fragment>
								);
							})}

							{/* Marketplace / app-installer entry — pinned under the apps (hidden while searching). */}
							{showMarketplace && (
								<>
									{groups.length > 0 && <Separator className={d.separator} />}
									<div className={d.spacing}>
										<button
											type="button"
											onClick={onMarketplace}
											className={`wwc:w-full wwc:flex wwc:items-center ${d.row} wwc:rounded-lg wwc:transition-colors wwc:group ${
												marketplaceActive
													? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
													: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground"
											}`}
										>
											<Plus
												className={`${d.iconSize} wwc:flex-shrink-0 wwc:text-muted-foreground wwc:group-hover:text-foreground`}
											/>
											<span className="wwc:flex-1 wwc:text-start wwc:truncate wwc:min-w-0">{marketplaceLabel}</span>
										</button>
									</div>
								</>
							)}
						</div>
					) : (
						/* Sub-nav view */
						<div className={d.container}>
							{/* Back + Title */}
							<button
								type="button"
								onClick={closeSub}
								className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-2 ${d.backButton} wwc:hover:bg-muted/50 wwc:rounded-lg wwc:transition-colors`}
							>
								<ChevronLeft className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<span className="wwc:font-semibold wwc:text-foreground">{activeSubMenu?.title}</span>
							</button>
							{activeSubMenu?.groups.map((group, gi) => (
								<div key={gi} className="wwc:mb-1">
									{group.label && (
										<div
											className={`${d.subGroupLabel} wwc:font-semibold wwc:text-muted-foreground/70 wwc:uppercase wwc:tracking-widest`}
										>
											{group.label}
										</div>
									)}
									{group.items.map((item) => {
										const isActive = activeItem === item.id;
										return (
											<button
												key={item.id}
												type="button"
												onClick={() => {
													setActiveItem(item.id);
													const parentItem = allNavItems.find((n) => n.id === activeSubMenuId);
													onNavigate?.(item.label, false, parentItem?.label);
													onNavigateItem?.(item, parentItem);
												}}
												className={`wwc:w-full wwc:flex wwc:items-center ${d.row} wwc:rounded-lg wwc:transition-colors ${
													isActive
														? "wwc:bg-muted wwc:font-medium wwc:text-foreground"
														: "wwc:text-foreground/80 wwc:hover:bg-muted/50 wwc:hover:text-foreground"
												}`}
											>
												<item.icon className={`${d.iconSize} wwc:flex-shrink-0 wwc:text-muted-foreground`} />
												<span className="wwc:flex-1 wwc:text-start wwc:truncate wwc:min-w-0">{item.label}</span>
												{item.badge && (
													<Badge
														variant="secondary"
														className="wwc:ml-1 wwc:text-[10px] wwc:px-1.5 wwc:py-0.5 wwc:rounded-full wwc:leading-none wwc:h-auto wwc:font-medium"
													>
														{item.badge}
													</Badge>
												)}
											</button>
										);
									})}
								</div>
							))}
						</div>
					)}
				</ScrollArea>

				{/* ── Custom footer content (e.g. a brand / updates card) — expanded only ── */}
				{footerContent && <div className={`wwc:border-t ${d.footer}`}>{footerContent}</div>}

				{/* ── Footer: Profile bar ── */}
				{showFooter && (
					<div className={`wwc:border-t wwc:flex wwc:items-center ${d.footer}`}>
						<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:flex-1 wwc:min-w-0 wwc:px-2 wwc:py-1.5">
							<Avatar className="wwc:h-6 wwc:w-6">
								{profileAvatar && <AvatarImage src={profileAvatar} alt={profileName} />}
								<AvatarFallback
									className="wwc:text-white wwc:text-[9px] wwc:font-bold"
									style={{background: "radial-gradient(circle at 35% 35%, #a855f7, #6366f1, #1e40af)"}}
								>
									{profileInitials}
								</AvatarFallback>
							</Avatar>
							<span className="wwc:text-[12px] wwc:font-medium wwc:text-foreground/80 wwc:truncate wwc:min-w-0">
								{profileName}
							</span>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									icon
									aria-label={L.profileMenu(profileName)}
									className="wwc:h-7 wwc:w-7 wwc:text-muted-foreground"
								>
									<MoreHorizontal className="wwc:h-4 wwc:w-4" />
								</Button>
							</DropdownMenuTrigger>
							{renderProfileMenu()}
						</DropdownMenu>
					</div>
				)}
			</div>
			{/* end inner sidebar */}
		</div>
	);
}

/**
 * App shell sidebar. On desktop it renders inline (a rail or expanded column). On mobile (below `md`) the
 * inline column is hidden and the same sidebar opens as a left sheet, driven by `mobileOpen` /
 * `onMobileOpenChange` — wire those to `CoreAppTopBar`'s `onMenuClick` hamburger.
 */
export function CoreAppSidebar(props: CoreAppSidebarProps = {}) {
	const {mobileOpen = false, onMobileOpenChange, ...shellProps} = props;

	// Opt-in: without a mobile handler the sidebar stays inline at every width (unchanged behavior).
	if (!onMobileOpenChange) return <SidebarShell {...shellProps} />;

	return (
		<>
			{/* Desktop: inline sidebar. `md:contents` lets the shell's own root participate in the app-shell
			    flex row directly; hidden below md, where the sheet takes over. */}
			<div className="wwc:hidden wwc:md:contents">
				<SidebarShell {...shellProps} />
			</div>
			{/* Mobile: the same sidebar as a left drawer. */}
			<Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
				<SheetContent
					side="left"
					className="wwc:w-auto wwc:max-w-[85vw] wwc:border-0 wwc:p-0 wwc:md:hidden [&>button]:wwc:z-10"
				>
					<SidebarShell {...shellProps} seamless hideCollapse />
				</SheetContent>
			</Sheet>
		</>
	);
}
