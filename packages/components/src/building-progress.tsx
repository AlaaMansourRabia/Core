import {cn} from "@wakecap/core-utils";
import * as React from "react";

/** One floor/level row in the building progress stack. */
export interface BuildingFloor {
	/** Stable id, matched against `activeId` to pick the highlighted floor. */
	id: string;
	/** Short floor label, e.g. "GF" or "RF" (rendered uppercase). */
	label: string;
	/** Completion percentage, 0–100. */
	value: number;
}

export interface BuildingProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** Floors ordered top → bottom (roof first, base last), mirroring the building elevation. */
	floors: BuildingFloor[];
	/** Id of the highlighted (currently viewed) floor. */
	activeId?: string;
	/** Fires when a floor is clicked. When provided, the rows render as buttons. */
	onFloorSelect?: (id: string) => void;
	/** Pixels each floor widens toward the base, giving the tapered building silhouette. Default 24. */
	taperStep?: number;
	/** Density. `compact` shrinks the rows, bars and text. Default `default`. */
	size?: "default" | "compact";
}

interface SizeConfig {
	row: string;
	activeRow: string;
	bar: string;
	text: string;
	label: string;
	gap: string;
}

const SIZES: Record<"default" | "compact", SizeConfig> = {
	default: {
		row: "wwc:h-12",
		activeRow: "wwc:h-[52px]",
		bar: "wwc:h-1.5",
		text: "wwc:text-xs",
		label: "wwc:w-9",
		gap: "wwc:gap-[3px]",
	},
	compact: {
		row: "wwc:h-9",
		activeRow: "wwc:h-10",
		bar: "wwc:h-1",
		text: "wwc:text-[11px]",
		label: "wwc:w-8",
		gap: "wwc:gap-0.5",
	},
};

const clamp = (value: number) => Math.min(100, Math.max(0, value));

/**
 * A building elevation progress stack: one row per floor (top → bottom) with a completion bar and
 * percentage, tapering wider toward the base like a building silhouette. The `activeId` floor is
 * highlighted; pass `onFloorSelect` to make the rows interactive.
 */
const BuildingProgress = React.forwardRef<HTMLDivElement, BuildingProgressProps>(
	({className, floors, activeId, onFloorSelect, taperStep = 24, size = "default", ...props}, ref) => {
		const sz = SIZES[size];
		const interactive = Boolean(onFloorSelect);
		const RowTag = (interactive ? "button" : "div") as React.ElementType;

		return (
			<div ref={ref} className={cn("wwc:flex wwc:w-full wwc:flex-col wwc:items-start", sz.gap, className)} {...props}>
				{floors.map((floor, index) => {
					const active = floor.id === activeId;
					const first = index === 0;
					const last = index === floors.length - 1;
					// Widen each row toward the base so the stack reads as a tapered building elevation.
					const fromBottom = floors.length - 1 - index;
					return (
						<RowTag
							key={floor.id}
							type={interactive ? "button" : undefined}
							aria-pressed={interactive ? active : undefined}
							aria-current={!interactive && active ? "true" : undefined}
							onClick={interactive ? () => onFloorSelect?.(floor.id) : undefined}
							style={{width: `calc(100% - ${fromBottom * taperStep}px)`}}
							className={cn(
								"wwc:flex wwc:items-center wwc:gap-2 wwc:border wwc:px-3 wwc:text-left wwc:transition-colors",
								active
									? cn("wwc:rounded-md wwc:border-primary wwc:bg-muted/60", sz.activeRow)
									: cn(
											"wwc:border-border wwc:bg-card",
											sz.row,
											first && "wwc:rounded-t-md",
											last && "wwc:rounded-b-md",
										),
								interactive &&
									"wwc:cursor-pointer wwc:hover:bg-muted/60 wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
							)}
						>
							<span
								className={cn(
									"wwc:shrink-0 wwc:font-semibold wwc:uppercase",
									sz.text,
									sz.label,
									active ? "wwc:font-bold wwc:text-foreground" : "wwc:text-muted-foreground",
								)}
							>
								{floor.label}
							</span>
							<div
								className={cn(
									"wwc:flex-1 wwc:overflow-hidden wwc:rounded-full",
									sz.bar,
									active ? "wwc:bg-primary/15" : "wwc:bg-muted",
								)}
							>
								<div
									className={cn("wwc:h-full wwc:rounded-full", active ? "wwc:bg-primary" : "wwc:bg-muted-foreground")}
									style={{width: `${clamp(floor.value)}%`}}
								/>
							</div>
							<span
								className={cn(
									"wwc:shrink-0 wwc:font-semibold wwc:tabular-nums wwc:text-foreground",
									sz.text,
									active && "wwc:font-bold",
								)}
							>
								{Math.round(clamp(floor.value))}%
							</span>
						</RowTag>
					);
				})}
			</div>
		);
	},
);
BuildingProgress.displayName = "BuildingProgress";

export {BuildingProgress};
