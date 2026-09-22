import {cn} from "@corensystem/core-utils";
import {LayoutGrid, List} from "lucide-react";
import * as React from "react";

import {ToggleGroup, ToggleGroupItem} from "./toggle-group";
import {usePersistentState} from "./use-persistent-state";

/**
 * The table-or-cards switch every catalogue page grew its own copy of, and the card grid it swaps to.
 *
 * Deliberately NOT a whole "catalogue" component. `DataTable` already owns the search box, the filter
 * chips, the empty state, paging and the toolbar; the only thing four catalogue pages were each
 * re-typing is the mode toggle, the `localStorage` key that persists it, and the grid the cards land
 * in. Wrapping `DataTable` as well would have to reproduce its whole surface, and would break the
 * invariant those pages protect in comments: **one `DataTable` stays mounted for the life of the
 * view** — its sorting, page index and column visibility live in its own state, so any wrapper that
 * conditionally rendered a table or a grid would reset them on every mode change.
 *
 * The intended shape keeps that invariant by construction — `mode` reaches `DataTable` through two
 * props and nothing else:
 *
 * ```tsx
 * const [mode, setMode] = useCatalogueViewMode("wc3.processes.view");
 * <DataTable
 *   showColumnToggle={mode === "table"}
 *   renderGrid={mode === "cards" ? renderGrid : undefined}
 *   toolbarExtra={<CatalogueViewToggle value={mode} onValueChange={setMode} />}
 * />
 * ```
 */

export type CatalogueViewMode = "table" | "cards";

/**
 * Persisted table-or-cards preference. `storageKey` is a `localStorage` key, so it must be unique per
 * catalogue — two pages sharing one key share one preference.
 */
export function useCatalogueViewMode(
	storageKey: string,
	initial: CatalogueViewMode = "cards",
): [CatalogueViewMode, (mode: CatalogueViewMode) => void] {
	return usePersistentState<CatalogueViewMode>(storageKey, initial);
}

export interface CatalogueViewToggleProps {
	value: CatalogueViewMode;
	onValueChange: (mode: CatalogueViewMode) => void;
	/** Accessible name for the table option. Defaults to "Table view". */
	tableLabel?: string;
	/** Accessible name for the cards option. Defaults to "Card view". */
	cardsLabel?: string;
	className?: string;
}

/** Segmented table/cards control, sized for a `DataTable` toolbar. */
export function CatalogueViewToggle({
	value,
	onValueChange,
	tableLabel = "Table view",
	cardsLabel = "Card view",
	className,
}: CatalogueViewToggleProps) {
	return (
		<ToggleGroup
			type="single"
			value={value}
			// Radix emits "" when the active item is pressed again; a segmented control has no "neither"
			// state, so that is swallowed rather than leaving the catalogue with no mode at all.
			onValueChange={(next) => {
				if (next) onValueChange(next as CatalogueViewMode);
			}}
			variant="outline"
			size="sm"
			className={className}
		>
			<ToggleGroupItem value="table" aria-label={tableLabel} title={tableLabel}>
				<List className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
			<ToggleGroupItem value="cards" aria-label={cardsLabel} title={cardsLabel}>
				<LayoutGrid className="wwc:h-3.5 wwc:w-3.5" />
			</ToggleGroupItem>
		</ToggleGroup>
	);
}

export interface CatalogueCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

/**
 * The grid cards land in when the toggle is on `cards` — one column on a phone, two from `sm`, three
 * from `xl`. Return it from `DataTable`'s `renderGrid` so the table's own paging still governs which
 * rows appear.
 */
export const CatalogueCardGrid = React.forwardRef<HTMLDivElement, CatalogueCardGridProps>(
	({className, children, ...props}, ref) => (
		<div ref={ref} className={cn("wwc:grid wwc:gap-3 wwc:sm:grid-cols-2 wwc:xl:grid-cols-3", className)} {...props}>
			{children}
		</div>
	),
);
CatalogueCardGrid.displayName = "CatalogueCardGrid";
