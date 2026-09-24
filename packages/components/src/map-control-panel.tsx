import {cn} from "@corensystem/coren-utils";
import {PanelLeft, PanelLeftClose, SlidersHorizontal} from "lucide-react";
import * as React from "react";

import {Button} from "./button";
import {FLOAT_SHADOW} from "./float-shadow";
import {Label} from "./label";
import {MultiSelect} from "./multi-select";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";
import {Separator} from "./separator";
import {Switch} from "./switch";
import {ToggleGroup, ToggleGroupItem} from "./toggle-group";

/** Dissolves a floating card's top and bottom edges into whatever sits behind it. */
const EDGE_FADE = "linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 14px), transparent 100%)";

export interface MapControlPanelOption {
	value: string;
	label: string;
	/** Swatch colour shown on a chip row — use it to tie the control to a legend. */
	color?: string;
}

export interface MapControlPanelSelect {
	/** Stable id — used for the label association. */
	id: string;
	label: string;
	options: MapControlPanelOption[];
	/** Selected values. A `single` row uses the first entry; an empty array means "no filter". */
	value: string[];
	onValueChange: (value: string[]) => void;
	/** Render a single-choice `Select` instead of a searchable `MultiSelect`. Default false. */
	single?: boolean;
	/** Draw a divider above this row — use it to separate filters from display controls. */
	separatorBefore?: boolean;
	/**
	 * `chips` renders the options as toggle chips instead of a dropdown — right for a handful of
	 * options, where a dropdown hides the choices behind a click and costs more than it saves.
	 * Default `select`.
	 */
	as?: "select" | "chips";
	/**
	 * Columns for a `chips` row. Omitted lays the options out as one equal-width row, which stops
	 * working once they outgrow the panel; set it to wrap them into an even grid instead.
	 */
	chipColumns?: number;
	/** Trigger text when nothing is selected, e.g. "All zones". */
	placeholder?: string;
}

export interface MapControlPanelToggle {
	id: string;
	label: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

export interface MapControlPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	/** Header text. Default "Map". */
	title?: React.ReactNode;
	/** Dropdown rows, in order. */
	selects?: MapControlPanelSelect[];
	/** Switch rows, rendered under the dropdowns. */
	toggles?: MapControlPanelToggle[];
	/** Start collapsed to just the header. Default false. */
	defaultCollapsed?: boolean;
	/** Collapsed state (controlled). */
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;
	/**
	 * Shows a Clear control beside the collapse toggle, for resetting every filter at once. It only
	 * appears while something is actually set — see `hasActiveFilters` — so an untouched panel is not
	 * offering to clear nothing.
	 */
	onClear?: () => void;
	/**
	 * Whether any filter is set. Defaults to reading the rows: any `selects` row with a selection.
	 * Pass it explicitly when a filter lives outside `selects`.
	 */
	hasActiveFilters?: boolean;
	/** Panel width in px. Default `340`, matching the floating detail panels so the two agree. */
	width?: number;
	/**
	 * Width in px while collapsed. The header carries only a title and the toggle, so it has no reason
	 * to hold the full width. Default `160`.
	 */
	collapsedWidth?: number;
	/** Cap on the whole card's height, as a CSS length; the body scrolls beneath it. Default `"60vh"`. */
	maxHeight?: string;
	/**
	 * Fade the whole card out at its top and bottom edges — surface, border and all — so it dissolves
	 * into what is behind it instead of ending on a hard rectangle.
	 */
	fadeEdges?: boolean;
	/** Extra rows below the built-in ones. */
	children?: React.ReactNode;
}

/**
 * A compact, collapsible control card for a map surface: labelled dropdown filters over switch rows,
 * on the standard card surface so it floats legibly over imagery. Built to sit in a map widget's
 * top-left corner — pair it with `ObservationsMap`'s `controls` slot, which positions it.
 *
 * It owns no map state: every row is controlled, so the same panel drives a basemap style, a set of
 * feature filters, and layer visibility without knowing what any of them mean.
 */
const MapControlPanel = React.forwardRef<HTMLDivElement, MapControlPanelProps>(
	(
		{
			className,
			title = "Map",
			selects = [],
			toggles = [],
			defaultCollapsed = false,
			collapsed: collapsedProp,
			onCollapsedChange,
			onClear,
			hasActiveFilters,
			style,
			width = 340,
			collapsedWidth = 160,
			maxHeight = "60vh",
			fadeEdges = false,
			children,
			...props
		},
		ref,
	) => {
		const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed);
		const collapsed = collapsedProp ?? uncontrolled;

		// A single-choice row always has a value, so it never counts as an active filter.
		const filtersActive = hasActiveFilters ?? selects.some((row) => !row.single && row.value.length > 0);

		const toggleCollapsed = () => {
			const next = !collapsed;
			if (collapsedProp == null) setUncontrolled(next);
			onCollapsedChange?.(next);
		};

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:flex-col wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:text-card-foreground",
					FLOAT_SHADOW,
					className,
				)}
				// Width animates so collapsing reads as the panel folding away rather than snapping.
				style={{
					width: collapsed ? collapsedWidth : width,
					maxHeight,
					transition: "width 200ms ease",
					// Masks the card itself, not its contents — the surface and border fade out with them.
					...(fadeEdges ? {maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE} : {}),
					...style,
				}}
				{...props}
			>
				<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-2.5 wwc:py-1.5">
					<span className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:text-xs wwc:font-medium wwc:text-muted-foreground">
						<SlidersHorizontal className="wwc:h-3.5 wwc:w-3.5" />
						{title}
					</span>
					<div className="wwc:flex wwc:items-center wwc:gap-0.5">
						{onClear && !collapsed && filtersActive && (
							<Button
								variant="ghost"
								size="sm"
								className="wwc:h-6 wwc:px-1.5 wwc:text-xs wwc:text-muted-foreground"
								onClick={onClear}
							>
								Clear
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							icon
							aria-label={collapsed ? "Show map controls" : "Hide map controls"}
							aria-expanded={!collapsed}
							className="wwc:h-6 wwc:w-6 wwc:text-muted-foreground"
							onClick={toggleCollapsed}
						>
							{/* Matches the pane toggle in core-ai-chat-header: close when open, panel when hidden. */}
							{collapsed ? (
								<PanelLeft className="wwc:h-3.5 wwc:w-3.5" />
							) : (
								<PanelLeftClose className="wwc:h-3.5 wwc:w-3.5" />
							)}
						</Button>
					</div>
				</div>

				{!collapsed && (
					// Seven filters plus their pills outgrow any map; the body scrolls rather than the card.
					<div className="wwc:min-h-0 wwc:flex-1 wwc:space-y-2.5 wwc:overflow-y-auto wwc:border-t wwc:border-border wwc:px-2.5 wwc:py-2.5">
						{selects.map((row) => (
							<React.Fragment key={row.id}>
								{row.separatorBefore && <Separator />}
								<div className="wwc:space-y-1">
									<Label htmlFor={row.id} className="wwc:text-[11px] wwc:text-muted-foreground">
										{row.label}
									</Label>
									{row.as === "chips" ? (
										// Multi-select segmented control: one row, every option equally wide, no dropdown.
										<ToggleGroup
											{...(row.single
												? // Single-choice chips: one stays pressed, and it cannot be cleared to nothing.
													({
														type: "single",
														value: row.value[0] ?? "",
														onValueChange: (next: string) => next && row.onValueChange([next]),
													} as const)
												: ({type: "multiple", value: row.value, onValueChange: row.onValueChange} as const))}
											variant="outline"
											size="sm"
											className={cn("wwc:w-full wwc:gap-1", row.chipColumns && "wwc:grid")}
											style={
												row.chipColumns
													? {gridTemplateColumns: `repeat(${row.chipColumns}, minmax(0, 1fr))`}
													: undefined
											}
										>
											{row.options.map((option) => (
												<ToggleGroupItem
													key={option.value}
													value={option.value}
													aria-label={option.label}
													// flex-1 on a zero basis is what makes the segments equal regardless of label length.
													className="wwc:min-w-0 wwc:flex-1 wwc:basis-0 wwc:gap-1.5 wwc:px-1.5 wwc:text-xs"
												>
													{option.color && (
														<span
															aria-hidden="true"
															className="wwc:size-2 wwc:shrink-0 wwc:rounded-[2px]"
															style={{backgroundColor: option.color}}
														/>
													)}
													<span className="wwc:truncate">{option.label}</span>
												</ToggleGroupItem>
											))}
										</ToggleGroup>
									) : row.single ? (
										<Select value={row.value[0] ?? ""} onValueChange={(next) => row.onValueChange([next])}>
											<SelectTrigger id={row.id} className="wwc:h-8 wwc:w-full wwc:text-xs">
												<SelectValue placeholder={row.placeholder} />
											</SelectTrigger>
											<SelectContent>
												{row.options.map((option) => (
													<SelectItem key={option.value} value={option.value} className="wwc:text-xs">
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									) : (
										<MultiSelect
											id={row.id}
											options={row.options}
											value={row.value}
											onValueChange={row.onValueChange}
											placeholder={row.placeholder}
											searchPlaceholder={`Search ${row.label.toLowerCase()}...`}
											// Pills below the field say what is being filtered on without reopening the dropdown.
											showPills
											className="wwc:h-8 wwc:text-xs"
											popoverClassName="wwc:w-[260px]"
										/>
									)}
								</div>
							</React.Fragment>
						))}

						{toggles.map((toggle) => (
							<div key={toggle.id} className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2">
								<Label htmlFor={toggle.id} className="wwc:text-xs wwc:font-normal">
									{toggle.label}
								</Label>
								<Switch id={toggle.id} size="sm" checked={toggle.checked} onCheckedChange={toggle.onCheckedChange} />
							</div>
						))}

						{children}
					</div>
				)}
			</div>
		);
	},
);
MapControlPanel.displayName = "MapControlPanel";

export {MapControlPanel};
