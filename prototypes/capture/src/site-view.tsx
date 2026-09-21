import type {CSSProperties} from "react";

import {cn} from "@core/core-utils";
import {Button} from "@core/core-ui/button";
import {WeekSelector, type WeekSelectorWeek} from "@core/core-ui/week-selector";
import {ArrowLeft, Expand, MonitorPlay, X} from "lucide-react";
import {useEffect, useRef, useState} from "react";

import {villaColorMap} from "./data/villa-progress";
import {SiteModelFrame} from "./site-model-frame";
import {getFloorByLevel} from "./floor-panel";
import {SingleHouseView} from "./house-view";
import {TvKiosk} from "./tv-kiosk";

type Phase = "idle" | "loading" | "revealing" | "exit-start" | "exit";

// Villa header content (Capture Admin redesign). The site path + villa name mirror the villa inspector;
// the weeks feed the header's date-range label + week navigator (W112 is the active program week).
const VILLA_NAME = "Villa 1234";
const SITE_BREADCRUMB = "ALMANAR – Phase 1 – Zone 1 | Phase 1 | Zone 1-A";
const HEADER_WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
];

/**
 * The Site workspace: the site model (map) with a click-into-a-part → house-level BIM transition.
 *
 * Clicking a model part in the site view posts its floor up to us (see public/site/index.html);
 * we mount the house-level 3D underneath, zoom + fade the map toward the clicked point while the 3D
 * loads, then dissolve into it — the same motion the old neighborhood used — with the clicked floor
 * preselected. A back button reverses the transition.
 *
 * `representation` chooses how the site map draws the villas: "assets" (the detailed walls/slabs model,
 * the default) or "blocks" (each villa as a single massing block — the "No Assets" view). Drilling into
 * a villa always opens the full house-level BIM regardless.
 */
export function SiteView({representation = "assets"}: {representation?: "assets" | "blocks"} = {}) {
	const [view, setView] = useState<"map" | "house">("map");
	const [phase, setPhase] = useState<Phase>("idle");
	const [floorId, setFloorId] = useState<string | null>(null);
	const [origin, setOrigin] = useState<{x: number; y: number} | null>(null);
	// Header week navigator (Capture Admin redesign) — drives the date-range label shown in the header.
	const [week, setWeek] = useState("W112");

	// The villa header's expand button toggles browser full-screen on the whole Site workspace.
	const rootRef = useRef<HTMLDivElement>(null);
	const toggleFullscreen = () => {
		const el = rootRef.current;
		if (!el) return;
		if (document.fullscreenElement) void document.exitFullscreen();
		else void el.requestFullscreen?.();
	};

	// Site-level TV mode: full-screen the workspace, drop a cinematic vignette over the map, spotlight one
	// house (shifted left) on the map, and play the auto-cycling villa kiosk panel on the right. The kiosk
	// loops through the site's houses — advancing when a house's overview→tasks cycle finishes.
	const [tvMode, setTvMode] = useState(false);
	const [houses, setHouses] = useState<string[]>([]); // house codes reported by the site iframe
	const [kioskIndex, setKioskIndex] = useState(0);
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const postToSite = (message: Record<string, unknown>) => iframeRef.current?.contentWindow?.postMessage(message, "*");

	// Colour mode: "normal" = the model's real materials + hover; "progress" = each villa tinted by its
	// construction progress (bundled offline colours). The site iframe applies/clears the tint on toggle.
	const [colorMode, setColorMode] = useState<"normal" | "progress">("normal");
	useEffect(() => {
		if (colorMode === "progress") postToSite({type: "site-progress-colors", colors: villaColorMap()});
		else postToSite({type: "site-progress-clear"});
	}, [colorMode]);

	// The iframe posts its list of house codes once the site model's house index has loaded.
	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as {type?: string; houses?: string[]} | null;
			if (data?.type === "site-houses" && Array.isArray(data.houses)) setHouses(data.houses);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	// Spotlight the current kiosk house on the map (shifted left) whenever TV mode is on and the index or
	// house list changes. The iframe greys every other house and flies the camera onto this one.
	useEffect(() => {
		if (!tvMode || houses.length === 0) return;
		postToSite({type: "site-tv-focus", house: houses[kioskIndex % houses.length]});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tvMode, houses, kioskIndex]);

	const currentHouse = houses.length ? houses[kioskIndex % houses.length] : null;
	const advanceHouse = () => setKioskIndex((i) => (houses.length ? (i + 1) % houses.length : 0));

	const enterTv = () => {
		setTvMode(true);
		setKioskIndex(0);
		const el = rootRef.current;
		if (el && !document.fullscreenElement) void el.requestFullscreen?.();
		// The spotlight effect above fires the first focus once the house list is present.
	};
	const exitTv = () => {
		setTvMode(false);
		postToSite({type: "site-tv-exit"});
		if (document.fullscreenElement) void document.exitFullscreen();
	};

	// Leaving browser full-screen (Esc / the OS chrome) while in TV mode also exits TV mode, so the two
	// never drift apart. Guarded on `tvMode` so a normal header-fullscreen exit doesn't reset the camera.
	useEffect(() => {
		const onFullscreenChange = () => {
			if (!document.fullscreenElement && tvMode) {
				setTvMode(false);
				postToSite({type: "site-tv-exit"});
			}
		};
		document.addEventListener("fullscreenchange", onFullscreenChange);
		return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
	}, [tvMode]);

	const revealingRef = useRef(false);
	const minHeldRef = useRef(false); // the slow zoom has read for a beat
	const settledRef = useRef(false); // the 3D has loaded (or errored)
	const minTimer = useRef<number | undefined>(undefined);
	const safetyTimer = useRef<number | undefined>(undefined);
	const settleTimer = useRef<number | undefined>(undefined);

	// Finish the zoom and fade the map out in one motion, then commit to the house view.
	const beginReveal = () => {
		if (revealingRef.current) return;
		revealingRef.current = true;
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		setPhase("revealing");
		settleTimer.current = window.setTimeout(() => {
			setView("house");
			setPhase("idle");
			revealingRef.current = false;
		}, 650);
	};
	const maybeReveal = () => {
		if (minHeldRef.current && settledRef.current) beginReveal();
	};

	// A part was clicked: mount the house 3D underneath (it starts loading at once) and begin the slow
	// zoom toward the clicked point. A safety net reveals anyway if the model never reports back.
	const enterHouse = (nextFloorId: string | null, point: {x: number; y: number} | null) => {
		setFloorId(nextFloorId);
		setOrigin(point);
		revealingRef.current = false;
		minHeldRef.current = false;
		settledRef.current = false;
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		window.clearTimeout(settleTimer.current);
		setPhase("loading");
		minTimer.current = window.setTimeout(() => {
			minHeldRef.current = true;
			maybeReveal();
		}, 420);
		safetyTimer.current = window.setTimeout(beginReveal, 8000);
	};

	const handleHouseSettled = () => {
		settledRef.current = true;
		maybeReveal();
	};

	// Mirror of enter: put the map back on top zoomed-in + transparent, then zoom it out and fade it in
	// over the house, pivoting on the same point. The house stays mounted underneath until it settles.
	const exitHouse = () => {
		window.clearTimeout(minTimer.current);
		window.clearTimeout(safetyTimer.current);
		window.clearTimeout(settleTimer.current);
		revealingRef.current = false;
		minHeldRef.current = false;
		settledRef.current = false;
		setView("map");
		setPhase("exit-start");
		safetyTimer.current = window.setTimeout(() => setPhase("exit"), 30);
		settleTimer.current = window.setTimeout(() => {
			setPhase("idle");
			setOrigin(null);
		}, 700);
	};

	// A part-click arrives from the site-model iframe with the clicked floor (levelName) + point.
	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as {type?: string; level?: string; point?: {x: number; y: number}} | null;
			if (!data || data.type !== "ue22-part-click") return;
			if (view === "house" || phase !== "idle") return; // ignore mid-transition / already inside
			enterHouse(getFloorByLevel(data.level)?.id ?? null, data.point ?? null);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [view, phase]);

	useEffect(
		() => () => {
			window.clearTimeout(minTimer.current);
			window.clearTimeout(safetyTimer.current);
			window.clearTimeout(settleTimer.current);
		},
		[],
	);

	// Zoom the map toward the clicked point while it fades — ramps up through loading → revealing, and
	// mirrors on exit. (Scaling the iframe wrapper reads as a push-in toward the part you clicked.)
	const scale = phase === "revealing" || phase === "exit-start" ? 2.4 : phase === "loading" ? 1.8 : 1;
	const mapStyle: CSSProperties = {
		transformOrigin: origin ? `${origin.x}px ${origin.y}px` : "center",
		transform: `scale(${scale})`,
		opacity: phase === "revealing" || phase === "exit-start" ? 0 : 1,
		transition:
			phase === "loading"
				? "transform 3000ms ease-in"
				: phase === "revealing"
					? "transform 650ms ease-out, opacity 650ms ease-out"
					: phase === "exit"
						? "transform 650ms ease-in, opacity 650ms ease-in"
						: undefined,
	};

	return (
		<div
			ref={rootRef}
			className="wwc:relative wwc:h-full wwc:min-h-0 wwc:w-full wwc:overflow-hidden wwc:bg-background"
		>
			{/* House-level BIM view — mounted underneath as soon as a part is clicked, so its 3D loads during
			    the zoom and the map dissolves straight into it, with the clicked floor preselected. */}
			{(view === "house" || phase !== "idle") && (
				<div
					className={cn(
						"wwc:absolute wwc:inset-0 wwc:overflow-hidden",
						view === "house" ? "wwc:z-10" : "wwc:z-0",
					)}
				>
					<SingleHouseView initialFloorId={floorId} onSettled={handleHouseSettled} />
				</div>
			)}

			{/* Site model layer — always mounted (so it never reloads); zooms + fades during the transition. */}
			<div
				className={cn(
					"wwc:absolute wwc:inset-0 wwc:overflow-hidden",
					view === "house" ? "wwc:z-0" : "wwc:z-10",
				)}
				style={mapStyle}
				aria-hidden={view === "house"}
			>
				<SiteModelFrame iframeRef={iframeRef} representation={representation} />
			</div>

			{/* TV-mode vignette — a cinematic radial fade darkening the edges of the map, focusing the eye on
			    the framed hero house. Pointer-events-none so map drags/hover fall through; sits above the map
			    layer but below the TV controls. Only shown on the site (map) view. */}
			{tvMode && view === "map" && (
				<div
					className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-20 wwc:transition-opacity wwc:duration-700"
					style={{
						// Alphas are ~25% stronger than the initial vignette (0.5→0.63, 0.82→1.0, 0.65→0.81).
						background:
							"radial-gradient(ellipse 78% 78% at 50% 48%, transparent 42%, rgba(0,0,0,0.63) 76%, rgba(0,0,0,1) 100%)",
						boxShadow: "inset 0 0 220px 70px rgba(0,0,0,0.81)",
					}}
				/>
			)}

			{/* TV-mode kiosk — the auto-cycling villa panel docked on the right (map view only). It loops
			    through the site's houses; each finished house advances the spotlight to the next. */}
			{view === "map" && <TvKiosk active={tvMode} house={currentHouse} onAdvanceHouse={advanceHouse} />}

			{/* Site-level TV-mode toggle. Off: top-right. On: top-LEFT, clear of the kiosk panel, above it. */}
			{view === "map" && phase === "idle" && (
				<div className={cn("wwc:absolute wwc:top-3 wwc:z-50", tvMode ? "wwc:left-3" : "wwc:right-3")}>
					<Button
						variant={tvMode ? "default" : "outline"}
						size="sm"
						onClick={tvMode ? exitTv : enterTv}
						aria-pressed={tvMode}
						className={cn(
							"wwc:shadow-sm wwc:backdrop-blur",
							tvMode ? "wwc:bg-foreground wwc:text-background" : "wwc:border-border wwc:bg-background/80",
						)}
					>
						{tvMode ? <X className="wwc:h-4 wwc:w-4" /> : <MonitorPlay className="wwc:h-4 wwc:w-4" />}
						{tvMode ? "Exit TV mode" : "TV mode"}
					</Button>
				</div>
			)}

			{/* Colour-mode toggle (bottom-right): swap the villas between their normal materials and a
			    progress tint (each villa coloured by its construction progress, from bundled offline data).
			    Map view only, and hidden during TV mode so it never covers the kiosk. */}
			{view === "map" && phase === "idle" && !tvMode && (
				<div className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-40 wwc:inline-flex wwc:items-center wwc:gap-0.5 wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background/80 wwc:p-0.5 wwc:shadow-sm wwc:backdrop-blur">
					{(["normal", "progress"] as const).map((mode) => (
						<button
							key={mode}
							type="button"
							onClick={() => setColorMode(mode)}
							aria-pressed={colorMode === mode}
							className={cn(
								"wwc:rounded-md wwc:px-3 wwc:py-1.5 wwc:text-[13px] wwc:font-medium wwc:capitalize wwc:transition-colors",
								colorMode === mode
									? "wwc:bg-foreground wwc:text-background"
									: "wwc:text-muted-foreground wwc:hover:text-foreground",
							)}
						>
							{mode}
						</button>
					))}
				</div>
			)}

			{/* Villa viewer header (Capture Admin redesign) — a full-width glass bar over the 3D house view.
			    Left: a "Back to Site" pill (back to the map), the muted site breadcrumb, and the centered
			    villa title. Right: the week selector (date range + week navigator) and a full-screen expand
			    button. The scrim is pointer-events-none so canvas drags fall through; only the chips catch
			    clicks. The floor list / inspector panels below are offset to clear this bar. */}
			{view === "house" && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-x-0 wwc:top-0 wwc:z-30 wwc:bg-gradient-to-b wwc:from-black/5 wwc:to-transparent wwc:px-3 wwc:py-4">
					<div className="wwc:pointer-events-auto wwc:flex wwc:items-center wwc:justify-between wwc:gap-4">
						<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-6">
							<button
								type="button"
								onClick={exitHouse}
								className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1.5 wwc:rounded wwc:border wwc:border-border wwc:bg-background/80 wwc:px-3 wwc:py-2 wwc:text-[13px] wwc:font-medium wwc:text-foreground wwc:shadow-sm wwc:backdrop-blur wwc:transition-colors wwc:hover:bg-background"
							>
								<ArrowLeft className="wwc:h-4 wwc:w-4 wwc:opacity-50" />
								Back to Site
							</button>
							<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-6">
								<span className="wwc:shrink-0 wwc:whitespace-nowrap wwc:text-[13px] wwc:font-medium wwc:text-foreground/40">
									{SITE_BREADCRUMB}
								</span>
								<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-center wwc:text-base wwc:font-semibold wwc:leading-tight wwc:text-foreground">
									{VILLA_NAME}
								</span>
							</div>
						</div>
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-1">
							<WeekSelector
								bare
								className="wwc:rounded wwc:border wwc:border-border wwc:bg-background/80 wwc:px-3 wwc:py-1.5 wwc:shadow-sm wwc:backdrop-blur"
								weeks={HEADER_WEEKS}
								value={week}
								onValueChange={setWeek}
								visibleCount={4}
							/>
							<Button
								type="button"
								variant="outline"
								icon
								aria-label="Full screen"
								className="wwc:h-[46px] wwc:w-[46px] wwc:shrink-0 wwc:border-border wwc:bg-background/80 wwc:shadow-sm wwc:backdrop-blur"
								onClick={toggleFullscreen}
							>
								<Expand className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
