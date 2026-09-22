import {cn} from "@corensystem/core-utils";
import {ChevronLeft, ChevronRight, Columns2, LocateFixed, MoveHorizontal, X} from "lucide-react";
import * as React from "react";

import {HoverCard, HoverCardContent, HoverCardTrigger} from "./hover-card";
import {MapCompass} from "./map-compass";
import {Toolbar, ToolbarButton} from "./toolbar";
import {HoverTooltip, TooltipProvider} from "./tooltip";
import {VerticalZoomTools} from "./vertical-zoom-tools";

/** Compare mode for the split-view control. */
export type SplitMode = "side-by-side" | "swipe";

const SPLIT_OPTIONS: {mode: SplitMode; label: string; description: string; icon: React.ReactNode}[] = [
	{
		mode: "side-by-side",
		label: "Side-by-side",
		icon: <Columns2 className="wwc:h-4 wwc:w-4" />,
		description: "See and navigate two versions at the same time.",
	},
	{
		mode: "swipe",
		label: "Swipe",
		icon: <MoveHorizontal className="wwc:h-4 wwc:w-4" />,
		description: "Drag a divider to reveal each source — spot precise changes.",
	},
];

export interface MapToolbarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** Active compare mode. Renders the split-view control when `onSplitModeChange` is set. */
	splitMode?: SplitMode | null;
	/** Called with the chosen compare mode when one is picked from the split-view hover menu. */
	onSplitModeChange?: (mode: SplitMode) => void;
	/**
	 * Called when "Exit compare view" is picked. That row appears in the split-view menu only while a
	 * compare mode is active and this handler is set — letting the user leave compare from the same menu.
	 */
	onExitCompare?: () => void;

	/** Renders the "my location" button when set; called when it is pressed. */
	onLocate?: () => void;

	/** Current zoom multiplier (1 = 100%), used to auto-derive the zoom buttons' enabled state. */
	zoomLevel?: number;
	minZoom?: number;
	maxZoom?: number;
	canZoomIn?: boolean;
	canZoomOut?: boolean;
	/** Renders the zoom control when either zoom handler is set. */
	onZoomIn?: () => void;
	onZoomOut?: () => void;

	/** Current map bearing in degrees (0 = north) for the compass needle. */
	bearing?: number;
	/** Renders the compass button (a separate pill below zoom) when set; realign to north on press. */
	onResetNorth?: () => void;
}

// A single-button pill: 40×40 square. The border is drawn as an inset ring (box-shadow) rather than
// a layout `border`, so it doesn't add 2px to the height — the 32px button + 8px padding fill 40px.
const PILL = "wwc:w-10 wwc:py-1 wwc:border-0 wwc:ring-1 wwc:ring-inset wwc:ring-border";

/** A single icon button in its own bordered pill — one section of the vertical toolbar. */
function ToolbarPill({
	label,
	active,
	onClick,
	children,
}: {
	label: string;
	active?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
}) {
	return (
		<Toolbar orientation="vertical" className={PILL}>
			<HoverTooltip content={label} side="left">
				<ToolbarButton icon label={label} active={active} onClick={onClick}>
					{children}
				</ToolbarButton>
			</HoverTooltip>
		</Toolbar>
	);
}

/**
 * The split-view control: a pill whose button opens a hover menu of compare modes (side-by-side vs.
 * swipe). The hover menu replaces a tooltip — it's self-describing. Picking a mode calls
 * `onSplitModeChange`; the button reads active while a mode is set and the chosen row is highlighted.
 * Once a mode is active, the menu also offers an "Exit compare view" row (when `onExitCompare` is set).
 */
function SplitModeButton({
	splitMode,
	onSplitModeChange,
	onExitCompare,
}: {
	splitMode?: SplitMode | null;
	onSplitModeChange: (mode: SplitMode) => void;
	onExitCompare?: () => void;
}) {
	return (
		<Toolbar orientation="vertical" className={PILL}>
			<HoverCard openDelay={80} closeDelay={120}>
				<HoverCardTrigger asChild>
					<ToolbarButton icon label="Compare mode" active={Boolean(splitMode)}>
						<Columns2 className="wwc:h-4 wwc:w-4" />
					</ToolbarButton>
				</HoverCardTrigger>
				<HoverCardContent side="left" align="start" className="wwc:w-72 wwc:p-1">
					<p className="wwc:px-2 wwc:pb-1 wwc:pt-1.5 wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
						Compare mode
					</p>
					{SPLIT_OPTIONS.map((opt) => (
						<button
							key={opt.mode}
							type="button"
							onClick={() => onSplitModeChange(opt.mode)}
							className={cn(
								"wwc:flex wwc:w-full wwc:items-start wwc:gap-2.5 wwc:rounded-md wwc:p-2 wwc:text-left wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:bg-accent wwc:focus-visible:outline-none",
								splitMode === opt.mode && "wwc:bg-accent",
							)}
						>
							<span className="wwc:mt-0.5 wwc:flex wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-muted wwc:text-foreground">
								{opt.icon}
							</span>
							<span className="wwc:min-w-0">
								<span className="wwc:block wwc:text-sm wwc:font-medium wwc:text-foreground">{opt.label}</span>
								<span className="wwc:mt-0.5 wwc:block wwc:text-xs wwc:leading-snug wwc:text-muted-foreground">
									{opt.description}
								</span>
							</span>
						</button>
					))}
					{/* Once a compare mode is active, offer a way out of compare from the same menu. */}
					{Boolean(splitMode) && onExitCompare && (
						<>
							<div className="wwc:my-1 wwc:h-px wwc:bg-border" />
							<button
								type="button"
								onClick={onExitCompare}
								className="wwc:flex wwc:w-full wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:p-2 wwc:text-left wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:bg-accent wwc:focus-visible:outline-none"
							>
								<span className="wwc:flex wwc:h-6 wwc:w-6 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:bg-muted wwc:text-foreground">
									<X className="wwc:h-4 wwc:w-4" />
								</span>
								<span className="wwc:text-sm wwc:font-medium wwc:text-foreground">Exit compare view</span>
							</button>
						</>
					)}
				</HoverCardContent>
			</HoverCard>
		</Toolbar>
	);
}

export interface MapViewNavProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Go to the previous map view (e.g. step back along a path, or the previous layer/sheet). */
	onPrev?: () => void;
	/** Go to the next map view. */
	onNext?: () => void;
	/** Enable the previous button. Default true; set false at the start of the sequence. */
	canPrev?: boolean;
	/** Enable the next button. Default true; set false at the end of the sequence. */
	canNext?: boolean;
	/** Accessible label + tooltip for the previous button. Default "Previous view". */
	prevLabel?: string;
	/** Accessible label + tooltip for the next button. Default "Next view". */
	nextLabel?: string;
}

/** A single icon button in its own pill, tooltip above — one map-view nav arrow. */
function NavPill({
	label,
	disabled,
	onClick,
	children,
}: {
	label: string;
	disabled?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
}) {
	return (
		<Toolbar orientation="vertical" className={PILL}>
			<HoverTooltip content={label} side="top">
				<ToolbarButton icon label={label} disabled={disabled} onClick={onClick}>
					{children}
				</ToolbarButton>
			</HoverTooltip>
		</Toolbar>
	);
}

/**
 * Previous / next arrows for stepping between map views — two individual floating buttons (the same
 * pill + `ToolbarButton` used by the rest of the map toolbar). Intended to sit at the bottom-center
 * of a map to page along a path, cycle layers, or switch sheets. Both handlers are optional.
 */
const MapViewNav = React.forwardRef<HTMLDivElement, MapViewNavProps>(
	(
		{
			className,
			onPrev,
			onNext,
			canPrev = true,
			canNext = true,
			prevLabel = "Previous view",
			nextLabel = "Next view",
			...rest
		},
		ref,
	) => (
		<TooltipProvider delayDuration={200}>
			<div ref={ref} className={cn("wwc:inline-flex wwc:items-center wwc:gap-2", className)} {...rest}>
				<NavPill label={prevLabel} disabled={!canPrev} onClick={onPrev}>
					<ChevronLeft className="wwc:h-4 wwc:w-4" />
				</NavPill>
				<NavPill label={nextLabel} disabled={!canNext} onClick={onNext}>
					<ChevronRight className="wwc:h-4 wwc:w-4" />
				</NavPill>
			</div>
		</TooltipProvider>
	),
);
MapViewNav.displayName = "MapViewNav";

/**
 * A vertical floating toolbar for a map: split-view toggle, "my location", zoom (`VerticalZoomTools`),
 * and a compass — each rendered as its own pill in the shared vertical-zoom-tools style. The compass
 * is a separate pill below the zoom control. Every section is optional and appears only when its
 * handler is provided, so the toolbar grows with the features you wire up.
 */
const MapToolbar = React.forwardRef<HTMLDivElement, MapToolbarProps>(
	(
		{
			className,
			splitMode,
			onSplitModeChange,
			onExitCompare,
			onLocate,
			zoomLevel,
			minZoom,
			maxZoom,
			canZoomIn,
			canZoomOut,
			onZoomIn,
			onZoomOut,
			bearing,
			onResetNorth,
			...rest
		},
		ref,
	) => {
		const showZoom = Boolean(onZoomIn || onZoomOut);

		return (
			<TooltipProvider delayDuration={200}>
				<div ref={ref} className={cn("wwc:inline-flex wwc:flex-col wwc:items-center wwc:gap-2", className)} {...rest}>
					{onSplitModeChange && (
						<SplitModeButton
							splitMode={splitMode}
							onSplitModeChange={onSplitModeChange}
							onExitCompare={onExitCompare}
						/>
					)}

					{onLocate && (
						<ToolbarPill label="My location" onClick={onLocate}>
							<LocateFixed className="wwc:h-4 wwc:w-4" />
						</ToolbarPill>
					)}

					{showZoom && (
						<VerticalZoomTools
							zoomLevel={zoomLevel}
							minZoom={minZoom}
							maxZoom={maxZoom}
							canZoomIn={canZoomIn}
							canZoomOut={canZoomOut}
							onZoomIn={onZoomIn}
							onZoomOut={onZoomOut}
						/>
					)}

					{onResetNorth && <MapCompass bearing={bearing} onResetNorth={onResetNorth} />}
				</div>
			</TooltipProvider>
		);
	},
);
MapToolbar.displayName = "MapToolbar";

export {MapToolbar, MapViewNav};
