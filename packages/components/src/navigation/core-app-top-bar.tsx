import {Bell, ChevronRight, Menu, MoreHorizontal, Smile} from "lucide-react";

import {Button} from "../button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "../dropdown-menu";
import {Switcher} from "./switcher";

export type CoreAppTopBarDensity = "comfortable" | "compact";

export type CoreAppTopBarProjectGroup = {
	org: string;
	projects: string[];
};

export interface CoreAppTopBarProps {
	activeLabel: string;
	/**
	 * Structured breadcrumb, taking precedence over `activeLabel`. A segment carrying `onSelect`
	 * renders as a link — the way a group name in the breadcrumb should open that group's page.
	 */
	breadcrumb?: {label: string; onSelect?: () => void}[];
	/**
	 * Lower-priority actions. They sit inline beside `actions` while the bar is wide enough, and
	 * collapse into a single "More actions" menu once it is not — so project and route identity keep
	 * the room rather than competing with secondary controls. `label` is both the menu item's text and
	 * the inline control's accessible name, so an icon-only action is still named.
	 */
	overflowActions?: {
		id: string;
		label: string;
		icon?: React.ComponentType<{className?: string}>;
		onSelect?: () => void;
	}[];
	/**
	 * When `false`, the project switcher dropdown is hidden entirely — for apps or
	 * surfaces that aren't scoped to a project. The centered breadcrumb and
	 * `rightContent` still render. Applies to both densities. Defaults to `true`.
	 */
	showProjectSwitcher?: boolean;
	/** Current project shown in the switcher. Optional when `showProjectSwitcher` is `false`. */
	selectedProject?: string;
	/**
	 * Flat list of projects shown in the switcher popover. Used only when
	 * `projectGroups` is not provided. Optional when `showProjectSwitcher` is `false`.
	 */
	projects?: readonly string[];
	/**
	 * Grouped list of projects organized by organization. When provided, the
	 * switcher renders org headers with their projects nested below, and the
	 * search input matches both org names and project names.
	 */
	projectGroups?: CoreAppTopBarProjectGroup[];
	/** Optional when `showProjectSwitcher` is `false`. */
	onSelectProject?: (project: string) => void;
	/** @deprecated The sidebar collapse toggle was removed from the top bar; this prop is ignored. */
	isPinned?: boolean;
	/** @deprecated The sidebar collapse toggle was removed from the top bar; this prop is ignored. */
	onToggleSidebar?: () => void;
	/** @deprecated The sidebar collapse toggle was removed from the top bar; this prop is ignored. */
	onHoverSidebar?: () => void;
	/**
	 * When provided, a hamburger button is shown at the far left of the bar on mobile (`md:hidden`) and
	 * calls this on click — pair it with `CoreAppSidebar`'s `mobileOpen`/`onMobileOpenChange` so the sidebar
	 * opens as a left sheet. Hidden from `md` up, where the inline sidebar is visible.
	 */
	onMenuClick?: () => void;
	rightContent?: React.ReactNode;
	/**
	 * Show a notification bell button beside the overflow (three-dots) menu. Defaults to `false`.
	 * Ignored when `rightContent` is provided (that fully replaces the default right cluster).
	 */
	/** Extra icon buttons placed before the notifications bell, e.g. a changeset button. */
	actions?: React.ReactNode;
	showNotifications?: boolean;
	/** Unread count shown as a badge on the bell. `0`/undefined shows the bell with no badge; capped display at 99+. */
	notificationCount?: number;
	/** Fires when the notification bell is clicked. */
	onNotificationsClick?: () => void;
	/**
	 * `"comfortable"` (default) renders the bar at 44px (h-11) to match the
	 * default `CoreAppSidebar`. `"compact"` renders at 36px (h-9) with smaller
	 * controls and text — pair with `CoreAppSidebar density="compact"` for a
	 * matching dense app shell.
	 */
	density?: CoreAppTopBarDensity;
	/**
	 * Overrides for the bar's own built-in copy — control aria-labels, the project-search placeholder and
	 * empty states, and the feedback item. English defaults fill in any key left unset.
	 */
	labels?: Partial<CoreAppTopBarLabels>;
}

const TOP_BAR_DENSITY = {
	comfortable: {
		root: "wwc:h-11 wwc:px-4",
		iconButton: "wwc:h-7 wwc:w-7",
		projectButton: "wwc:h-7 wwc:px-2 wwc:gap-1.5 wwc:text-[13px]",
		breadcrumb: "wwc:text-[13px]",
		popoverHeader: "wwc:px-3 wwc:pt-3 wwc:pb-2",
		popoverList: "wwc:px-3 wwc:py-2 wwc:space-y-0.5",
		popoverInput: "wwc:h-8 wwc:text-[13px]",
		popoverItem: "wwc:gap-3 wwc:px-3 wwc:py-2.5",
		popoverItemText: "wwc:text-[13px]",
		popoverEmpty: "wwc:text-[13px] wwc:py-4",
	},
	compact: {
		root: "wwc:h-9 wwc:px-3",
		iconButton: "wwc:h-6 wwc:w-6",
		projectButton: "wwc:h-6 wwc:px-1.5 wwc:gap-1 wwc:text-[12px]",
		breadcrumb: "wwc:text-[12px]",
		popoverHeader: "wwc:px-2 wwc:pt-2 wwc:pb-1",
		popoverList: "wwc:px-2 wwc:py-1.5 wwc:space-y-0",
		popoverInput: "wwc:h-7 wwc:text-[12px]",
		popoverItem: "wwc:gap-2 wwc:px-2 wwc:py-1.5",
		popoverItemText: "wwc:text-[12px]",
		popoverEmpty: "wwc:text-[12px] wwc:py-3",
	},
} as const;

/**
 * Overridable copy for `CoreAppTopBar`'s own built-in controls. Every key has an English default, so a
 * consumer supplies only the strings it wants to translate. Consumer-provided data — `activeLabel`,
 * `breadcrumb`, project names, `overflowActions[].label` — is never part of this.
 */
export type CoreAppTopBarLabels = {
	/** Aria label for the mobile hamburger button. */
	openNavigation: string;
	/** Project switcher placeholder when a flat `projects` list is used. */
	findProject: string;
	/** Project switcher placeholder when `projectGroups` is used (matches orgs and projects). */
	searchProjectOrOrg: string;
	/** Project switcher empty state for a flat `projects` list. */
	noProjectsFound: string;
	/** Project switcher empty state when `projectGroups` is used. */
	noResults: string;
	/** Aria label for the collapsed overflow-actions trigger. */
	moreActions: string;
	/** Aria label for the notifications bell. */
	notifications: string;
	/** Aria label for the right-hand overflow (three-dots) menu. */
	moreTopBarActions: string;
	/** The feedback menu item's text. */
	giveFeedback: string;
};

const DEFAULT_TOP_BAR_LABELS: CoreAppTopBarLabels = {
	openNavigation: "Open navigation",
	findProject: "Find Project...",
	searchProjectOrOrg: "Search project or organization...",
	noProjectsFound: "No projects found",
	noResults: "No results",
	moreActions: "More actions",
	notifications: "Notifications",
	moreTopBarActions: "More top bar actions",
	giveFeedback: "Give Feedback",
};

/**
 * App top bar with project switcher, breadcrumb, and feedback menu.
 * Owns its height, card background, horizontal padding, and bottom divider. Consumers should place
 * it directly in the shell and must not add a second border or surface wrapper around it.
 */
/**
 * Breadcrumb segments with de-duplicated keys — a trail can legitimately repeat a label
 * ("Link types / Link / Link"), and a bare label would collide.
 */
/**
 * When an ancestor breadcrumb segment folds away as the bar narrows — the deepest ancestor first, so
 * the LAST segment (the route identity) is the one that survives longest. Container widths, not
 * viewport: the bar's width depends on the sidebar beside it.
 */
function segmentFoldClass(index: number, total: number) {
	const depthFromEnd = total - 1 - index;
	if (depthFromEnd >= 3) return "wwc:hidden wwc:@3xl:flex";
	if (depthFromEnd === 2) return "wwc:hidden wwc:@2xl:flex";
	if (depthFromEnd === 1) return "wwc:hidden wwc:@lg:flex";
	return "wwc:flex";
}

function breadcrumbSegments(activeLabel: string) {
	const seen = new Map<string, number>();
	return activeLabel.split(" / ").map((part) => {
		const n = (seen.get(part) ?? 0) + 1;
		seen.set(part, n);
		return {part, key: n === 1 ? part : `${part}~${n}`};
	});
}

export function CoreAppTopBar({
	activeLabel,
	breadcrumb,
	showProjectSwitcher = true,
	selectedProject = "",
	projects = [],
	projectGroups,
	onSelectProject,
	onMenuClick,
	rightContent,
	actions,
	overflowActions,
	showNotifications = false,
	notificationCount,
	onNotificationsClick,
	density = "comfortable",
	labels,
}: CoreAppTopBarProps) {
	const t = TOP_BAR_DENSITY[density];
	const L = {...DEFAULT_TOP_BAR_LABELS, ...labels};
	const iconSize = density === "compact" ? "wwc:h-3.5 wwc:w-3.5" : "wwc:h-4 wwc:w-4";

	return (
		<div
			data-core-artifact="core-app-top-bar"
			data-core-surface-owner="artifact"
			data-core-border-owner="bottom"
			data-core-density={density}
			className={`${t.root} wwc:@container wwc:bg-card wwc:text-card-foreground wwc:border-b wwc:border-border wwc:grid wwc:grid-cols-[minmax(0,1fr)_minmax(0,auto)_minmax(0,1fr)] wwc:items-center wwc:gap-2 wwc:flex-shrink-0 wwc:relative`}
		>
			{/* Left. min-w-0 so a long project name truncates instead of shoving the breadcrumb. */}
			<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
				{onMenuClick ? (
					<Button
						variant="ghost"
						icon
						aria-label={L.openNavigation}
						onClick={onMenuClick}
						className={`${t.iconButton} wwc:mr-1 wwc:shrink-0 wwc:text-muted-foreground wwc:md:hidden`}
					>
						<Menu className={iconSize} />
					</Button>
				) : null}

				{showProjectSwitcher && (
					<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-1">
						<Switcher
							density={density}
							selected={selectedProject}
							items={projectGroups ? undefined : projects}
							groups={projectGroups ? projectGroups.map((g) => ({label: g.org, items: g.projects})) : undefined}
							onSelect={(p) => onSelectProject?.(p)}
							placeholder={projectGroups ? L.searchProjectOrOrg : L.findProject}
							emptyLabel={projectGroups ? L.noResults : L.noProjectsFound}
							triggerClassName={`${t.projectButton} wwc:min-w-0 wwc:max-w-full wwc:overflow-hidden wwc:font-medium wwc:text-foreground/70`}
						>
							{/* A long project name truncates rather than widening the cell — without this it pushed
							    the whole row past the bar at narrow widths. */}
							<span className="wwc:min-w-0 wwc:truncate">{selectedProject}</span>
						</Switcher>
					</div>
				)}
			</div>

			{/* Centre. In flow now: it was `absolute left-1/2`, so the columns either side reserved no
			    space for it and the three groups overlapped once the bar got narrow. */}
			<span
				className={`wwc:flex wwc:min-w-0 wwc:items-center wwc:justify-center wwc:gap-1 wwc:font-medium wwc:pointer-events-none ${t.breadcrumb}`}
			>
				{breadcrumb ? (
					breadcrumb.map((seg, i, arr) => {
						const isLast = i === arr.length - 1;
						return (
							<span
								key={`${seg.label}~${i}`}
								className={`${isLast ? "wwc:flex wwc:min-w-0" : segmentFoldClass(i, arr.length)} wwc:items-center wwc:gap-1`}
							>
								{i > 0 && <ChevronRight className="wwc:h-3 wwc:w-3 wwc:shrink-0 wwc:text-muted-foreground" />}
								{seg.onSelect ? (
									// The row is pointer-events-none so it never blocks the bar behind it; a link has
									// to opt back in.
									<button
										type="button"
										onClick={seg.onSelect}
										className="wwc:pointer-events-auto wwc:truncate wwc:text-muted-foreground wwc:transition-colors wwc:hover:text-foreground wwc:hover:underline"
									>
										{seg.label}
									</button>
								) : (
									<span className={`wwc:truncate ${isLast ? "wwc:text-foreground" : "wwc:text-muted-foreground"}`}>
										{seg.label}
									</span>
								)}
							</span>
						);
					})
				) : activeLabel.includes(" / ") ? (
					breadcrumbSegments(activeLabel).map(({part, key}, i, arr) => {
						const isLast = i === arr.length - 1;
						return (
							<span
								key={key}
								className={`${isLast ? "wwc:flex wwc:min-w-0" : segmentFoldClass(i, arr.length)} wwc:items-center wwc:gap-1`}
							>
								{i > 0 && <ChevronRight className="wwc:h-3 wwc:w-3 wwc:shrink-0 wwc:text-muted-foreground" />}
								<span className={`wwc:truncate ${isLast ? "wwc:text-foreground" : "wwc:text-muted-foreground"}`}>
									{part}
								</span>
							</span>
						);
					})
				) : (
					<span className="wwc:truncate wwc:text-foreground">{activeLabel}</span>
				)}
				{/* Stands in for whatever folded away, so a truncated trail still reads as one. Applies to
				    both breadcrumb sources — a structured trail folds exactly as a string one does. */}
				{(breadcrumb ? breadcrumb.length > 1 : activeLabel.includes(" / ")) && (
					<span aria-hidden className="wwc:order-first wwc:shrink-0 wwc:text-muted-foreground wwc:@lg:hidden">
						…
					</span>
				)}
			</span>

			{rightContent ?? (
				<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:justify-end wwc:gap-0.5">
					{overflowActions && overflowActions.length > 0 && (
						<>
							{/* Inline while there is room... */}
							<div className="wwc:hidden wwc:items-center wwc:gap-0.5 wwc:@2xl:flex">
								{overflowActions.map((item) => (
									<Button
										key={item.id}
										variant="ghost"
										icon
										aria-label={item.label}
										onClick={item.onSelect}
										className={`${t.iconButton} wwc:text-muted-foreground`}
									>
										{item.icon ? <item.icon className={iconSize} /> : <MoreHorizontal className={iconSize} />}
									</Button>
								))}
							</div>
							{/* ...and behind one owner once there is not. */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										icon
										aria-label={L.moreActions}
										className={`${t.iconButton} wwc:text-muted-foreground wwc:@2xl:hidden`}
									>
										<MoreHorizontal className={iconSize} />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="wwc:w-48">
									{overflowActions.map((item) => (
										<DropdownMenuItem key={item.id} onSelect={() => item.onSelect?.()}>
											{item.icon && <item.icon className="wwc:mr-2 wwc:h-4 wwc:w-4" />}
											{item.label}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</>
					)}
					{actions}
					{showNotifications && (
						<Button
							variant="ghost"
							icon
							aria-label={L.notifications}
							onClick={onNotificationsClick}
							className={`${t.iconButton} wwc:relative wwc:text-muted-foreground`}
						>
							<Bell className={iconSize} />
							{notificationCount ? (
								<span className="wwc:absolute wwc:-top-0.5 wwc:-right-0.5 wwc:flex wwc:h-4 wwc:min-w-4 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-destructive wwc:px-1 wwc:text-[9px] wwc:font-semibold wwc:text-destructive-foreground wwc:tabular-nums">
									{notificationCount > 99 ? "99+" : notificationCount}
								</span>
							) : null}
						</Button>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								icon
								aria-label={L.moreTopBarActions}
								className={`${t.iconButton} wwc:text-muted-foreground`}
							>
								<MoreHorizontal className={iconSize} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="wwc:w-[220px] wwc:rounded-xl">
							<DropdownMenuItem className="wwc:flex wwc:items-center wwc:justify-between wwc:py-3">
								<span className="wwc:text-[13px]">{L.giveFeedback}</span>
								<Smile className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
		</div>
	);
}
