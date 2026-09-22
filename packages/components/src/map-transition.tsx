/**
 * map-transition — the "reload" transition used by the capture canvas, factored into a reusable hook +
 * presentational surface so any swappable content (a map, a 3D canvas, a route, a heavy panel) can get the
 * same zoom-out → blur → spinner → zoom-back-in feel.
 *
 * Two pieces, use either or both:
 *   • useMapTransition() — the STATE MACHINE. `run(apply)` zooms the current content out to a grey frame +
 *     shows a spinner for `outMs` (the "load"), applies your state change so the new content mounts already
 *     zoomed-out + blurred, then returns to idle over `holdMs` while the surface zooms-to-fit and unblurs.
 *     Returns the `{ scaledOut, blurred, showSpinner }` flags to feed a surface.
 *   • <MapTransitionSurface> — the PRESENTATION. Scales its children down to a rounded frame + blurs them
 *     over a 500ms ease, with an optional centered spinner. Drop it around the content that swaps.
 *
 * Extracted from `pages/capture-ui-enhanced.tsx` (the `mapPhase` machine) and `building-viewer.tsx` (the
 * scale/blur wrapper + spinner) — the capture template drives the machine and BuildingViewer renders the
 * visual, but both are now available standalone.
 */
import type {ReactNode} from "react";

import {cn} from "@corensystem/core-utils";
import {useState} from "react";

import {Spinner} from "./spinner";

export type MapTransitionPhase = "idle" | "out" | "in";

export type MapTransitionOptions = {
	/** ms the content stays zoomed-out + blurred with the spinner before the content swaps (the "load"). Default 500. */
	outMs?: number;
	/** ms after the swap before returning to idle — the zoom-in / unblur window. Default 600. */
	holdMs?: number;
};

export type MapTransition = {
	/** idle → out → in → idle. */
	phase: MapTransitionPhase;
	/**
	 * Run the transition around a content swap. No-op if a transition is already in flight. `apply` is your
	 * state change (setLocation / setMode / …); it fires at the zoomed-out midpoint so the new content mounts
	 * already scaled-out + blurred, then the surface animates back to fit.
	 */
	run: (apply: () => void) => void;
	/** Scale the surface down to the grey frame. */
	scaledOut: boolean;
	/** Blur the surface. */
	blurred: boolean;
	/** Show the centre spinner (the load window only). */
	showSpinner: boolean;
};

/**
 * The map/canvas "reload" transition machine. Pure state — pair the returned flags with
 * `<MapTransitionSurface/>` (or your own scale/blur classes). If you have an external loading signal, OR it
 * into the flags at the call site, e.g. `scaledOut={mapTx.scaledOut || props.loading}`.
 */
export function useMapTransition(opts: MapTransitionOptions = {}): MapTransition {
	const {outMs = 500, holdMs = 600} = opts;
	const [phase, setPhase] = useState<MapTransitionPhase>("idle");
	// Holds the incoming content at the zoomed-out start for a frame so the CSS transition to fit/unblur runs.
	const [entering, setEntering] = useState(false);
	const run = (apply: () => void) => {
		if (phase !== "idle") return;
		setPhase("out");
		window.setTimeout(() => {
			apply();
			setEntering(true);
			setPhase("in");
			requestAnimationFrame(() => requestAnimationFrame(() => setEntering(false)));
			window.setTimeout(() => setPhase("idle"), holdMs);
		}, outMs);
	};
	const active = phase === "out" || entering;
	return {phase, run, scaledOut: active, blurred: active, showSpinner: phase === "out"};
}

export type MapTransitionSurfaceProps = {
	/** Scale the content down to the rounded grey frame (from the machine's `scaledOut`). */
	scaledOut: boolean;
	/** Blur the content (from the machine's `blurred`). */
	blurred: boolean;
	/** Show the centre spinner (from the machine's `showSpinner`). */
	showSpinner?: boolean;
	/** Extra classes on the scaled layer (e.g. a custom corner radius). */
	className?: string;
	children: ReactNode;
};

/**
 * Presentational wrapper: scales its children down to a rounded frame (`scaledOut`) + blurs (`blurred`) over
 * a 500ms ease, with an optional centered spinner (`showSpinner`). Matches the capture canvas transition.
 * The scale/blur is applied to a single inner layer, so siblings you render OUTSIDE this (toolbars, chrome)
 * are not pulled by the transform — render those next to `<MapTransitionSurface>`, not inside it.
 */
export function MapTransitionSurface({
	scaledOut,
	blurred,
	showSpinner,
	className,
	children,
}: MapTransitionSurfaceProps) {
	return (
		<div className="wwc:relative wwc:h-full wwc:w-full">
			<div
				className={cn(
					"wwc:h-full wwc:w-full wwc:origin-center wwc:transition-all wwc:duration-500 wwc:ease-in-out",
					scaledOut && "wwc:scale-[0.95] wwc:overflow-hidden wwc:rounded-[25.26px]",
					blurred && "wwc:blur-sm",
					className,
				)}
			>
				{children}
			</div>
			{showSpinner && (
				<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-30 wwc:flex wwc:items-center wwc:justify-center">
					<span className="wwc:flex wwc:size-12 wwc:items-center wwc:justify-center wwc:rounded-full wwc:bg-card/90 wwc:shadow-lg wwc:backdrop-blur-sm">
						<Spinner className="wwc:size-6 wwc:text-primary" />
					</span>
				</div>
			)}
		</div>
	);
}
