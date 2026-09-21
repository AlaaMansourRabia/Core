import {cn} from "@core/core-utils";
import {SlidersHorizontal} from "lucide-react";
import * as React from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Chip} from "@/components/ui/chip";
import {Toolbar, ToolbarSeparator} from "@/components/ui/toolbar";

/** A single quick-filter chip. */
export interface FilterChip {
	id: string;
	label: string;
}

export interface MapFilterBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** The quick-filter chips shown after the Filters button. */
	filters: FilterChip[];
	/** Selected chip ids (controlled). */
	value?: string[];
	/** Initial selected chip ids (uncontrolled). Default none. */
	defaultValue?: string[];
	/** Called with the next selected chip ids when a chip is toggled. */
	onValueChange?: (selected: string[]) => void;
	/**
	 * Count shown in the Filters button badge (e.g. active advanced filters from the panel). When > 0 a
	 * badge appears. Defaults to the number of selected chips.
	 */
	filterCount?: number;
	/** Label for the leading Filters button. Default "Filters". */
	filtersLabel?: string;
	/** Fires when the Filters button is pressed — e.g. open the full filter panel. */
	onOpenFilters?: () => void;
}

/**
 * A horizontal, Airbnb-style filter bar for a map, composed from stock Core components: a `Button`
 * (the Filters trigger) with a `Badge` active-count, a `ToolbarSeparator` divider, and a scrollable
 * row of `Chip` (variant `filter`) toggles — inside the bare `Toolbar` shell used by the Object
 * Drawing Toolbar. Each part is used as-is (no restyling); only layout classes are applied.
 */
export const MapFilterBar = React.forwardRef<HTMLDivElement, MapFilterBarProps>(
	(
		{
			className,
			filters,
			value,
			defaultValue = [],
			onValueChange,
			filterCount,
			filtersLabel = "Filters",
			onOpenFilters,
			...rest
		},
		ref,
	) => {
		const [internal, setInternal] = React.useState<string[]>(defaultValue);
		const selected = value ?? internal;
		const setSelected = (next: string[]) => {
			if (value === undefined) setInternal(next);
			onValueChange?.(next);
		};
		const toggle = (id: string, on: boolean) => setSelected(on ? [...selected, id] : selected.filter((x) => x !== id));
		const count = filterCount ?? selected.length;

		return (
			<Toolbar
				ref={ref}
				variant="bare"
				aria-label="Map filters"
				fullWidth
				className={cn("wwc:gap-2", className)}
				{...rest}
			>
				{/* Leading Filters button (Button) with an active-count Badge. */}
				<Button variant="outline" className="wwc:shrink-0" onClick={onOpenFilters}>
					<SlidersHorizontal className="wwc:h-4 wwc:w-4" />
					{filtersLabel}
					{count > 0 && <Badge>{count}</Badge>}
				</Button>

				<ToolbarSeparator className="wwc:shrink-0" />

				{/* Quick-filter chips (Chip variant="filter"); the row scrolls when it overflows. */}
				<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2 wwc:overflow-x-auto wwc:[scrollbar-width:none] wwc:[&::-webkit-scrollbar]:hidden">
					{filters.map((chip) => (
						<Chip
							key={chip.id}
							variant="filter"
							size="lg"
							pressed={selected.includes(chip.id)}
							onPressedChange={(on) => toggle(chip.id, on)}
							className="wwc:shrink-0"
						>
							{chip.label}
						</Chip>
					))}
				</div>
			</Toolbar>
		);
	},
);
MapFilterBar.displayName = "MapFilterBar";
