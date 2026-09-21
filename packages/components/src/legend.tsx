import {cn} from "@core/core-utils";
import {ChevronDown, ChevronUp} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./tabs";

/** One row in the legend: a colored swatch mapped to a label (+ optional description). */
export interface LegendItem {
	id: string;
	label: string;
	description?: React.ReactNode;
	/** Swatch fill — any CSS color. */
	color: string;
	/** Swatch border color. Defaults to `color`. */
	borderColor?: string;
	/** Swatch opacity, 0–1. Default 1. */
	opacity?: number;
}

export type LegendShape = "square" | "circle";
export type LegendPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "static";

export interface LegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: string;
	items: LegendItem[];
	/** Swatch shape. Default `"square"`. */
	shape?: LegendShape;
	/** Grid columns. Default 2. */
	columns?: 1 | 2 | 3;
	/** Floating position over a canvas, or `"static"` to render inline. Default `"bottom-right"`. */
	placement?: LegendPlacement;
	/** Small status text beside the title (e.g. "Loading"). */
	status?: React.ReactNode;
	/** Explanatory note under the grid. */
	footnote?: React.ReactNode;
	/** Show the minimize control + collapsed reopen button. Default true. */
	collapsible?: boolean;
	collapsed?: boolean;
	defaultCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Label on the collapsed reopen button. Default "Legend". */
	collapsedLabel?: string;
}

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
	const [internal, setInternal] = React.useState<T>(fallback);
	const value = controlled !== undefined ? controlled : internal;
	const set = React.useCallback(
		(next: T) => {
			if (controlled === undefined) setInternal(next);
			onChange?.(next);
		},
		[controlled, onChange],
	);
	return [value, set] as const;
}

const PLACEMENT: Record<Exclude<LegendPlacement, "static">, string> = {
	"bottom-right": "wwc:absolute wwc:bottom-3 wwc:right-3",
	"bottom-left": "wwc:absolute wwc:bottom-3 wwc:left-3",
	"top-right": "wwc:absolute wwc:top-3 wwc:right-3",
	"top-left": "wwc:absolute wwc:top-3 wwc:left-3",
};

const COLUMNS: Record<1 | 2 | 3, string> = {
	1: "wwc:grid-cols-1",
	2: "wwc:grid-cols-2",
	3: "wwc:grid-cols-3",
};

/** The swatch + label grid shared by {@link Legend} and {@link TabbedLegend}. */
function LegendItemGrid({
	items,
	shape = "square",
	columns = 2,
	maxRows,
}: {
	items: LegendItem[];
	shape?: LegendShape;
	columns?: 1 | 2 | 3;
	/**
	 * Cap the grid at this many rows and flow overflow into new columns (grows horizontally).
	 * Overrides `columns` when set.
	 */
	maxRows?: number;
}) {
	// When capped, fill top-to-bottom into `maxRows` rows, then wrap into extra columns.
	const rowCapped = maxRows != null;
	const rows = rowCapped ? Math.min(maxRows, Math.max(items.length, 1)) : undefined;
	return (
		<div
			className={cn(
				"wwc:grid wwc:gap-y-1.5",
				rowCapped ? "wwc:grid-flow-col wwc:gap-x-5" : cn("wwc:gap-x-3", COLUMNS[columns]),
			)}
			style={rowCapped ? {gridTemplateRows: `repeat(${rows}, minmax(0, auto))`} : undefined}
		>
			{items.map((item) => (
				<div key={item.id} className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
					<span
						className={cn(
							"wwc:h-2.5 wwc:w-2.5 wwc:shrink-0 wwc:border",
							shape === "circle" ? "wwc:rounded-full" : "wwc:rounded-sm",
						)}
						style={{
							backgroundColor: item.color,
							borderColor: item.borderColor ?? item.color,
							opacity: item.opacity ?? 1,
						}}
					/>
					<div className="wwc:min-w-0">
						<p className="wwc:truncate wwc:text-sm wwc:font-medium wwc:text-foreground">{item.label}</p>
						{item.description ? (
							<p className="wwc:truncate wwc:text-sm wwc:text-muted-foreground">{item.description}</p>
						) : null}
					</div>
				</div>
			))}
		</div>
	);
}

/**
 * A compact key mapping swatch colors to labels. Floats over a canvas/map (bottom-right by default)
 * or embeds inline (`placement="static"`), and can minimize to a small button to get out of the way.
 */
const Legend = React.forwardRef<HTMLDivElement, LegendProps>(
	(
		{
			className,
			title,
			items,
			shape = "square",
			columns = 2,
			placement = "bottom-right",
			status,
			footnote,
			collapsible = true,
			collapsed: collapsedProp,
			defaultCollapsed = false,
			onCollapsedChange,
			collapsedLabel = "Legend",
			...rest
		},
		ref,
	) => {
		const [collapsed, setCollapsed] = useControllable<boolean>(collapsedProp, defaultCollapsed, onCollapsedChange);
		const floating = placement !== "static";
		const positionClass = placement === "static" ? "" : PLACEMENT[placement];

		if (collapsible && collapsed) {
			return (
				<button
					ref={ref as unknown as React.Ref<HTMLButtonElement>}
					type="button"
					onClick={() => setCollapsed(false)}
					className={cn(
						"wwc:pointer-events-auto wwc:z-10 wwc:rounded-lg wwc:border wwc:bg-card/95 wwc:px-2 wwc:py-1 wwc:text-sm wwc:font-medium wwc:shadow-sm wwc:hover:bg-accent",
						positionClass,
						className,
					)}
					{...(rest as React.HTMLAttributes<HTMLButtonElement>)}
				>
					{collapsedLabel}
				</button>
			);
		}

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:z-10 wwc:max-w-[18rem] wwc:rounded-lg wwc:border wwc:bg-card/95 wwc:p-2 wwc:text-sm wwc:shadow-sm",
					floating && "wwc:pointer-events-auto",
					positionClass,
					className,
				)}
				{...rest}
			>
				<div className="wwc:mb-1 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
					<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
						<p className="wwc:font-medium wwc:text-foreground">{title}</p>
						{status ? <span className="wwc:text-sm wwc:text-muted-foreground">{status}</span> : null}
					</div>
					{collapsible ? (
						<Button
							type="button"
							variant="ghost"
							icon
							size="sm"
							className="wwc:h-6 wwc:w-6 wwc:shrink-0"
							aria-label="Minimize legend"
							onClick={() => setCollapsed(true)}
						>
							<ChevronUp className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
					) : null}
				</div>

				<LegendItemGrid items={items} shape={shape} columns={columns} />

				{footnote ? (
					<p className="wwc:mt-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">{footnote}</p>
				) : null}
			</div>
		);
	},
);
Legend.displayName = "Legend";

/* -----------------------------------------------------------------------------
 * TabbedLegend
 * -------------------------------------------------------------------------- */

/** One tab in a {@link TabbedLegend}: a label + its own set of legend items. */
export interface LegendTab {
	id: string;
	/** Tab label. */
	label: React.ReactNode;
	/** This tab's swatch/label rows. */
	items: LegendItem[];
	/** Optional note under this tab's grid. */
	footnote?: React.ReactNode;
}

export interface TabbedLegendProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Header title (the "view mode" heading). */
	title: string;
	/** Tabs, each showing a different legend for what's selected. */
	tabs: LegendTab[];
	/** Active tab id (controlled). */
	value?: string;
	/** Initial active tab id. Defaults to the first tab. */
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	/** Swatch shape. Default `"square"`. */
	shape?: LegendShape;
	/** Cap each tab at this many rows; extra items flow into new columns (grows horizontally). Default 4. */
	maxRows?: number;
	/** Floating position over a canvas, or `"static"` to render inline. Default `"bottom-right"`. */
	placement?: LegendPlacement;
	/** Small status text beside the title. */
	status?: React.ReactNode;
	/** Show the minimize control + collapsed reopen button. Default true. */
	collapsible?: boolean;
	collapsed?: boolean;
	defaultCollapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/** Accessible label for the collapsed tab bar. Default = `title`. */
	collapsedLabel?: string;
}

/**
 * A {@link Legend} whose body is split across tabs. The header ("view mode") can collapse to a chip,
 * and each tab swaps in its own colors and rows — use it to key different overlays depending on
 * what's selected on the canvas/map.
 */
const TabbedLegend = React.forwardRef<HTMLDivElement, TabbedLegendProps>(
	(
		{
			className,
			title,
			tabs,
			value,
			defaultValue,
			onValueChange,
			shape = "square",
			maxRows = 4,
			placement = "bottom-right",
			status,
			collapsible = true,
			collapsed: collapsedProp,
			defaultCollapsed = false,
			onCollapsedChange,
			collapsedLabel,
			...rest
		},
		ref,
	) => {
		const [collapsed, setCollapsed] = useControllable<boolean>(collapsedProp, defaultCollapsed, onCollapsedChange);
		const floating = placement !== "static";
		const positionClass = placement === "static" ? "" : PLACEMENT[placement];
		const firstTab = tabs[0]?.id;
		// Active tab is owned here so switching tabs works while collapsed and persists when expanded.
		const [activeTab, setActiveTab] = useControllable<string>(value, defaultValue ?? firstTab ?? "", onValueChange);

		// Collapsed: keep the tab bar interactive (switch the active view) plus an expand control — the
		// tab content (swatch grids) is hidden until expanded.
		if (collapsible && collapsed) {
			return (
				<div
					ref={ref}
					aria-label={collapsedLabel ?? title}
					className={cn(
						"wwc:pointer-events-auto wwc:z-10 wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:border wwc:bg-card/95 wwc:px-2 wwc:py-1 wwc:shadow-sm",
						positionClass,
						className,
					)}
					{...rest}
				>
					{/* Collapsed keeps the underline tabs but drops the underline itself (list border + active
					    indicator) — the active view reads via its bold/dark label instead. */}
					<Tabs variant="underline" size="sm" value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="wwc:border-b-0">
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab.id}
									value={tab.id}
									className="wwc:text-sm wwc:data-[state=active]:border-transparent"
								>
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
					<Button
						type="button"
						variant="ghost"
						icon
						size="sm"
						className="wwc:h-6 wwc:w-6 wwc:shrink-0"
						aria-label="Expand legend"
						onClick={() => setCollapsed(false)}
					>
						<ChevronDown className="wwc:h-3.5 wwc:w-3.5" />
					</Button>
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={cn(
					// Grow horizontally as tabs overflow past `maxRows`, up to a sane cap.
					"wwc:z-10 wwc:w-max wwc:max-w-[34rem] wwc:rounded-lg wwc:border wwc:bg-card/95 wwc:p-2 wwc:text-sm wwc:shadow-sm",
					floating && "wwc:pointer-events-auto",
					positionClass,
					className,
				)}
				{...rest}
			>
				<div className="wwc:mb-1.5 wwc:flex wwc:items-center wwc:justify-between wwc:gap-3">
					<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-2">
						<p className="wwc:font-medium wwc:text-foreground">{title}</p>
						{status ? <span className="wwc:text-sm wwc:text-muted-foreground">{status}</span> : null}
					</div>
					{collapsible ? (
						<Button
							type="button"
							variant="ghost"
							icon
							size="sm"
							className="wwc:h-6 wwc:w-6 wwc:shrink-0"
							aria-label="Minimize legend"
							onClick={() => setCollapsed(true)}
						>
							<ChevronUp className="wwc:h-3.5 wwc:w-3.5" />
						</Button>
					) : null}
				</div>

				<Tabs variant="underline" size="sm" value={activeTab} onValueChange={setActiveTab}>
					<div className="wwc:mb-2 wwc:flex wwc:items-center wwc:gap-1">
						<TabsList>
							{tabs.map((tab) => (
								<TabsTrigger key={tab.id} value={tab.id} className="wwc:text-sm">
									{tab.label}
								</TabsTrigger>
							))}
						</TabsList>
						{/* Invisible stand-in for the collapsed view's expand toggle, so the tab row — and thus the
						    panel — stays at least as wide when expanded as it is when collapsed. */}
						{collapsible ? <span aria-hidden="true" className="wwc:h-6 wwc:w-6 wwc:shrink-0" /> : null}
					</div>
					{tabs.map((tab) => (
						<TabsContent key={tab.id} value={tab.id} className="wwc:mt-0">
							<LegendItemGrid items={tab.items} shape={shape} maxRows={maxRows} />
							{tab.footnote ? (
								<p className="wwc:mt-2 wwc:text-sm wwc:leading-snug wwc:text-muted-foreground">{tab.footnote}</p>
							) : null}
						</TabsContent>
					))}
				</Tabs>
			</div>
		);
	},
);
TabbedLegend.displayName = "TabbedLegend";

export {Legend, TabbedLegend};
