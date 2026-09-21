/**
 * SiteToolbar — top-centre canvas toolbar (CONTROLLED Core widget).
 *
 * Extracted verbatim from `pages/capture-ui-enhanced.tsx` (the "Canvas toolbar
 * (top-centre)" block, source lines ~3118–3251). Renders ONLY the two floating
 * pill groups pinned to the top-centre of the canvas:
 *   • LEFT  — LBS level navigation: a hardcoded "Villa" button + a "Batch" slot
 *             whose icon/label follow the active grouping level and whose hover
 *             dropdown swaps between Batch / Zone / Phase.
 *   • RIGHT — the view-mode switcher: thumbnail tiles (Reality / Plan, with an
 *             optional disabled Satellite tile).
 *
 * This is a controlled view over the host's navigation state-machine. It reads
 * the view/mode/level axes as props and requests changes through three semantic
 * callbacks (`onSelectView`, `onSelectLevel`, `onSelectMode`); the host runs the
 * reducer (guards, jump-toast, forced `mapMode`, `isZoomedIn` branch, the single
 * `runMapTransition` lock). The ONLY state this widget owns is `levelMenuOpen`,
 * the Batch-slot hover dropdown — purely presentational, read by nothing else.
 *
 * ── INTERACTIONS OWNED (each maps to a prop read and/or a callback) ──
 *  • Villa button click            → onSelectView("villa")      · active tint from `view === "villa"`
 *  • Batch button click            → onSelectView("batch")      · active tint from `view === "batch"`
 *  • Batch-slot mouse enter/leave  → toggles local `levelMenuOpen` (opens/closes the dropdown)
 *  • Dropdown item click           → onSelectLevel(id)          · tick shown when `level===id && view==="batch" && mode!=="3d"`
 *  • Batch-slot icon/label         → reads `activeLevel.icon` / `activeLevel.label`
 *  • Dropdown items                → mapped from `levels` (id/label/icon)
 *  • Reality / Plan tile click     → onSelectMode(id)           · active ring from `mode === id`
 *  • Satellite tile                → disabled + crossed-slash when `!hasSatellite`
 *  • 3D tile filtered out          → when `hide3d` is set (host also excludes it from `modeTabs`)
 *
 * ── ANIMATIONS OWNED ──
 *  • Whole toolbar chrome fade     → `chromeFade` (transition-opacity duration-500 + opacity-0 / pointer-events-none when reportsOpen)
 *  • Level buttons                 → `transition-colors` on hover / active tint
 *  • Dropdown                      → plain conditional render (no transition — matches source)
 *  • Dropdown items                → `transition-colors`
 *  • Mode tiles                    → `transition hover:brightness-105`, active `border-primary ring-2 ring-primary`, focus-visible ring
 *
 * NOTE: the jump toast, loading spinner, and map blur/scale live in BuildingViewer.
 * SiteToolbar only *triggers* those via the callbacks; the host owns the machine.
 * The location stepper is NOT here — it renders inside SitePanel (see docs/WIDGET_DECOMPOSITION.md §3).
 */
import type {ComponentType} from "react";

import {cn} from "@core/core-utils";
import {Check, Home} from "lucide-react";
import {useState} from "react";

/** The LBS level shown on the canvas — Villa (leaf) or Batch (parent grouping, with the level dropdown). */
export type ViewId = "villa" | "batch";
/** How the canvas is rendered, independent of the level: 2D plan, satellite basemap, or the 3D model. */
export type ViewMode = "plan" | "satellite" | "3d";
/** Grouping level under the "Batch" slot. */
export type LevelId = "block" | "batch" | "zone" | "phase";

/** Lucide-style icon component (rendered with a `className`). */
type IconComponent = ComponentType<{className?: string}>;

export type SiteToolbarLevel = {id: LevelId; label: string; icon: IconComponent};
export type SiteToolbarModeTab = {id: ViewMode; label: string; thumb: string; icon: IconComponent};

export type SiteToolbarProps = {
	view: ViewId;
	mode: ViewMode;
	level: LevelId;
	/** The resolved active grouping level (drives the Batch slot's icon + label). */
	activeLevel: SiteToolbarLevel;

	/** Level dropdown items (Batch / Zone / Phase). */
	levels: SiteToolbarLevel[];
	/** Mode tiles (Reality / Plan / Satellite); host filters out 3d when `hide3d`. */
	modeTabs: SiteToolbarModeTab[];

	/** Satellite tile enable/disable (derived by the host from view + level + currentLocation). */
	hasSatellite: boolean;
	/** Drop the 3D (Reality) tile — mirrors the host's `hide3d` prop. */
	hide3d?: boolean;

	/** reportsOpen fade + pointer-events-none (host-computed). */
	chromeFade: string;

	// ================= CALLBACKS OUT =================
	/** Villa / Batch buttons → host `selectView`. */
	onSelectView: (v: ViewId) => void;
	/** Dropdown item → host `selectLevel`. */
	onSelectLevel: (l: LevelId) => void;
	/** Reality / Plan / Satellite tile → host `selectMode` (host runs the isZoomedIn / toVillaLevel / toSiteLevel branch). */
	onSelectMode: (m: ViewMode) => void;
};

/**
 * Top-centre canvas toolbar: LEFT level-nav pill (Villa + Batch dropdown) and
 * RIGHT view-mode switcher (Reality / Plan). Fully controlled — see file header.
 */
export function SiteToolbar({
	view,
	mode,
	level,
	activeLevel,
	levels,
	modeTabs,
	hasSatellite,
	hide3d,
	chromeFade,
	onSelectView,
	onSelectLevel,
	onSelectMode,
}: SiteToolbarProps) {
	// The grouping-level hover dropdown (Batch / Zone / Phase). Local + presentational;
	// nothing else reads it. Opens on mouse-enter of the Batch slot, closes on leave.
	const [levelMenuOpen, setLevelMenuOpen] = useState(false);

	const LevelIcon = activeLevel.icon;

	return (
		// Canvas toolbar (top-centre), split into two groups: the LEFT group navigates the LBS level
		// (Villa / Batch, with the Batch/Zone/Phase dropdown); the RIGHT group picks the view mode
		// (Plan / Satellite / 3D).
		<div
			className={cn(
				"wwc:absolute wwc:left-1/2 wwc:top-4 wwc:z-20 wwc:flex wwc:-translate-x-1/2 wwc:items-stretch wwc:gap-2",
				chromeFade,
			)}
		>
			{/* Left group — level navigation */}
			<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:p-1 wwc:shadow-lg wwc:backdrop-blur-sm">
				<button
					type="button"
					aria-pressed={view === "villa"}
					onClick={() => onSelectView("villa")}
					className={cn(
						"wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:rounded-md wwc:px-4 wwc:py-2 wwc:text-xs wwc:font-medium wwc:transition-colors",
						view === "villa"
							? "wwc:bg-primary/10 wwc:text-primary"
							: "wwc:text-muted-foreground wwc:hover:bg-accent wwc:hover:text-foreground",
					)}
				>
					<Home className="wwc:size-4" />
					Villa
				</button>
				{/* Batch slot — a grouping-level dropdown: its icon/label follow the selected level, and
            hovering it reveals Batch / Zone / Phase. */}
				<div
					className="wwc:relative"
					onMouseEnter={() => setLevelMenuOpen(true)}
					onMouseLeave={() => setLevelMenuOpen(false)}
				>
					<button
						type="button"
						aria-pressed={view === "batch"}
						aria-haspopup="menu"
						aria-expanded={levelMenuOpen}
						onClick={() => onSelectView("batch")}
						className={cn(
							"wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:rounded-md wwc:px-4 wwc:py-2 wwc:text-xs wwc:font-medium wwc:transition-colors",
							view === "batch"
								? "wwc:bg-primary/10 wwc:text-primary"
								: "wwc:text-muted-foreground wwc:hover:bg-accent wwc:hover:text-foreground",
						)}
					>
						<LevelIcon className="wwc:size-4" />
						{activeLevel.label}
					</button>

					{levelMenuOpen ? (
						<div className="wwc:absolute wwc:left-1/2 wwc:top-full wwc:z-30 wwc:-translate-x-1/2 wwc:pt-1.5">
							<div
								role="menu"
								className="wwc:min-w-[180px] wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card wwc:p-1 wwc:shadow-lg"
							>
								{levels.map((l) => {
									const LIcon = l.icon;
									const selected = level === l.id && view === "batch" && mode !== "3d";
									return (
										<button
											key={l.id}
											type="button"
											role="menuitemradio"
											aria-checked={selected}
											onClick={() => {
												setLevelMenuOpen(false);
												onSelectLevel(l.id);
											}}
											className={cn(
												"wwc:flex wwc:w-full wwc:items-center wwc:gap-2.5 wwc:rounded-md wwc:px-2.5 wwc:py-2 wwc:text-sm wwc:font-medium wwc:transition-colors",
												selected ? "wwc:bg-primary/10 wwc:text-primary" : "wwc:text-foreground wwc:hover:bg-accent",
											)}
										>
											<LIcon className="wwc:size-4 wwc:shrink-0" />
											<span className="wwc:flex-1 wwc:text-left">{l.label}</span>
											{selected ? <Check className="wwc:size-4 wwc:shrink-0" /> : null}
										</button>
									);
								})}
							</div>
						</div>
					) : null}
				</div>
			</div>

			{/* Right group — view modes, contained in a pill (matching the left group's height). Each is
          a thumbnail tile (Layers-button visual): a rounded image with a label over a bottom scrim. */}
			<div className="wwc:flex wwc:items-stretch wwc:gap-1 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-card/95 wwc:p-1 wwc:shadow-lg wwc:backdrop-blur-sm">
				{modeTabs
					.filter((m) => !(hide3d && m.id === "3d"))
					.map((m) => {
						const Icon = m.icon;
						const active = mode === m.id;
						const disabled = m.id === "satellite" && !hasSatellite;
						return (
							<button
								key={m.id}
								type="button"
								aria-pressed={active}
								aria-label={m.label}
								disabled={disabled}
								onClick={() => onSelectMode(m.id)}
								className={cn(
									"wwc:group wwc:relative wwc:w-20 wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-transparent wwc:transition wwc:hover:brightness-105 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-primary",
									active && "wwc:border-primary wwc:ring-2 wwc:ring-primary",
									disabled && "wwc:cursor-not-allowed wwc:border-border wwc:bg-muted wwc:hover:brightness-100",
								)}
							>
								{disabled ? (
									// Unavailable view — a muted fill crossed out with a diagonal slash, in place of the image.
									<svg
										className="wwc:absolute wwc:inset-0 wwc:size-full wwc:text-muted-foreground/50"
										viewBox="0 0 100 100"
										preserveAspectRatio="none"
										aria-hidden="true"
									>
										<line
											x1="6"
											y1="94"
											x2="94"
											y2="6"
											stroke="currentColor"
											strokeWidth={2}
											strokeLinecap="round"
											vectorEffect="non-scaling-stroke"
										/>
									</svg>
								) : (
									<img
										src={m.thumb}
										alt=""
										aria-hidden
										className="wwc:absolute wwc:inset-0 wwc:size-full wwc:object-cover"
									/>
								)}
								<span
									className={cn(
										"wwc:absolute wwc:inset-x-0 wwc:bottom-0 wwc:flex wwc:items-center wwc:justify-center wwc:gap-1 wwc:pt-4 wwc:pb-1 wwc:text-[11px] wwc:font-semibold",
										disabled
											? "wwc:text-muted-foreground"
											: "wwc:bg-gradient-to-t wwc:from-black/85 wwc:via-black/40 wwc:to-transparent wwc:text-white",
									)}
								>
									<Icon className="wwc:size-3.5" />
									{m.label}
								</span>
							</button>
						);
					})}
			</div>
		</div>
	);
}

export default SiteToolbar;
