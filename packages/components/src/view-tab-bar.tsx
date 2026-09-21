import type {ComponentType, ReactNode} from "react";

import {cn} from "@wakecap/core-utils";

import {HoverTooltip, TooltipProvider} from "./tooltip";
import {WeekSelector, type WeekSelectorProps} from "./week-selector";

export type ViewTabItem<T extends string = string> = {
	id: T;
	label: string;
	/** Optional leading icon — any component taking a `size`/`className` prop (e.g. a lucide icon). */
	icon?: ComponentType<{size?: number | string; className?: string}>;
	/** Optional count/badge text rendered after the label. */
	badge?: string | number;
	/** Optional helper text shown as a tooltip on hover. */
	description?: string;
};

/**
 * Visual style of the bar:
 * - `underline` (default) — bottom-flush tabs with an underline indicator on the active tab.
 * - `segmented` — a full-width toolbar that heads the content below it: a compact pill switcher on the
 *   left (a muted rounded container with a filled/white active segment) and a right cluster for a
 *   built-in `WeekSelector` (period navigation) and/or `trailing` actions.
 */
export type ViewTabBarVariant = "underline" | "segmented";

export interface ViewTabBarProps<T extends string> {
	tabs: readonly ViewTabItem<T>[];
	activeTab: T;
	onTabChange: (tab: T) => void;
	/** Visual style. Default `underline`. */
	variant?: ViewTabBarVariant;
	/**
	 * `underline` only — background surface. Use `transparent` in page/route headers and `card` in
	 * contained panels.
	 */
	surface?: "transparent" | "card";
	/**
	 * `underline` only — stretch each tab to the full height of the bar's container and vertically
	 * center its label. Use inside a fixed-height header row so the tab text lines up with the header's
	 * other text while the active underline drops to the container's bottom edge (the shared divider).
	 */
	fill?: boolean;
	/**
	 * `segmented` only — a WeekSelector rendered on the right of the toolbar (period navigation). Pass the
	 * WeekSelector's props; it renders `bare` by default so it sits flush in the bar (override with `bare`).
	 * The view switcher and the period selector are paired frequently, so this variant builds them together.
	 */
	weekSelector?: WeekSelectorProps;
	/** `segmented` only — extra content on the right of the toolbar (e.g. action buttons). */
	trailing?: ReactNode;
	/**
	 * How tab labels show alongside their icon:
	 * - `show` (default) — icon + text.
	 * - `hide` — icon only; the label moves to a hover tooltip (requires each tab to have an `icon`).
	 * - `responsive` — text hides below the `@5xl` container breakpoint (icon only when narrow), with a
	 *   tooltip standing in. Use inside a `@container` header so it collapses as the header narrows.
	 */
	labels?: "show" | "hide" | "responsive";
	/** `underline` only — let tabs wrap onto multiple lines instead of overflowing (never scrolls). */
	wrap?: boolean;
	/** Override classes on the outer wrapper (e.g. spacing / borders). */
	className?: string;
}

/**
 * A tab bar, generic over the tab id union so `activeTab` / `onTabChange` stay type-safe. Each tab may
 * carry an icon, a trailing badge, and a hover tooltip (the bar mounts its own TooltipProvider, so no
 * app-root provider is required).
 *
 * The `underline` variant sits bottom-flush — place it inside an `items-end` row whose `border-b`
 * provides the single divider. The `segmented` variant is a full-width toolbar that spans (heads) the
 * content below it: a pill view-switcher on the left, and an optional built-in `WeekSelector` +
 * `trailing` actions on the right.
 */
export function ViewTabBar<T extends string>({
	tabs,
	activeTab,
	onTabChange,
	variant = "underline",
	surface = "transparent",
	fill = false,
	weekSelector,
	trailing,
	labels = "show",
	wrap = false,
	className,
}: ViewTabBarProps<T>) {
	const segmented = variant === "segmented";

	const tabButtons = tabs.map((tab) => {
		const isActive = activeTab === tab.id;
		const Icon = tab.icon;
		// The label may be visible, hidden (icon-only), or collapse responsively. When it isn't always
		// visible, its text stands in as a tooltip so an icon-only tab stays identifiable.
		const labelNode =
			labels === "hide" ? null : labels === "responsive" ? (
				<span className="wwc:hidden wwc:@5xl:inline">{tab.label}</span>
			) : (
				tab.label
			);
		const tooltip = tab.description ?? (labels !== "show" ? tab.label : undefined);
		const button = (
			<button
				type="button"
				onClick={() => onTabChange(tab.id)}
				aria-current={isActive ? "page" : undefined}
				aria-label={tab.label}
				className={cn(
					"wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:font-medium wwc:transition-all",
					segmented
						? cn(
								"wwc:rounded-md wwc:px-3 wwc:py-1",
								isActive
									? "wwc:bg-background wwc:text-foreground wwc:shadow"
									: "wwc:text-muted-foreground wwc:hover:text-foreground",
							)
						: cn(
								"wwc:border-b-2 wwc:px-3 wwc:py-2.5",
								isActive
									? "wwc:border-primary wwc:text-foreground"
									: "wwc:border-transparent wwc:text-muted-foreground wwc:hover:bg-accent/50 wwc:hover:text-foreground",
							),
				)}
			>
				{Icon ? <Icon size={14} /> : null}
				{labelNode}
				{tab.badge != null ? (
					<span className="wwc:ml-1 wwc:text-[10px] wwc:text-muted-foreground wwc:tabular-nums">{tab.badge}</span>
				) : null}
			</button>
		);

		if (!tooltip) {
			return (
				<span key={tab.id} className={cn(!segmented && fill && "wwc:flex")}>
					{button}
				</span>
			);
		}

		return (
			<HoverTooltip key={tab.id} content={tooltip} contentClassName="wwc:max-w-[220px] wwc:text-center">
				{button}
			</HoverTooltip>
		);
	});

	if (segmented) {
		const hasTrailing = trailing != null || weekSelector != null;
		return (
			<TooltipProvider>
				{/* Full-width toolbar heading the content below: pill switcher (left) + period/actions (right). */}
				<div
					className={cn("wwc:flex wwc:w-full wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-4", className)}
				>
					<div className="wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:bg-muted wwc:p-1">
						{tabButtons}
					</div>
					{hasTrailing ? (
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-3">
							{trailing}
							{weekSelector ? <WeekSelector bare {...weekSelector} /> : null}
						</div>
					) : null}
				</div>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<div
				data-wakecore-artifact="view-tab-bar"
				data-wakecore-surface={surface}
				className={cn(
					"wwc:relative wwc:z-20 wwc:shrink-0",
					fill && "wwc:flex wwc:self-stretch",
					surface === "card" ? "wwc:bg-card" : "wwc:bg-transparent",
					className,
				)}
			>
				<div
					className={cn(
						"wwc:flex wwc:gap-1",
						wrap && "wwc:flex-wrap",
						fill ? "wwc:flex-1 wwc:items-stretch" : "wwc:items-center",
					)}
				>
					{tabButtons}
				</div>
			</div>
		</TooltipProvider>
	);
}
