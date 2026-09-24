import {cn} from "@corensystem/coren-utils";
import {ChevronLeft, ChevronRight, Lock, LockOpen} from "lucide-react";
import * as React from "react";

/** How the two sources are compared. Mirrors the map toolbar's `SplitMode`. */
export type CompareMode = "side-by-side" | "swipe";

export interface CompareViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** First source (e.g. as-planned / yesterday). Fills the box; the two sources should be geo-aligned. */
	before: React.ReactNode;
	/** Second source (e.g. as-built / today). Omit to show `before` alone as a single pan/zoom map. */
	after?: React.ReactNode;
	/** `swipe` (default) overlays the two with a draggable reveal divider; `side-by-side` shows two panes. */
	mode?: CompareMode;
	/** Divider position as a percentage 0–100 (swipe mode). Controlled when provided. */
	position?: number;
	/** Uncontrolled starting divider position. Default 50. */
	defaultPosition?: number;
	/** Called with the new divider position while dragging. */
	onPositionChange?: (position: number) => void;
	/** Optional chip labels for each source. */
	beforeLabel?: React.ReactNode;
	afterLabel?: React.ReactNode;

	/** Make the content pannable (drag) and zoomable (wheel). The two sources stay geo-aligned. */
	interactive?: boolean;
	/** Initial zoom (only when `interactive`). Default 1 (fit). */
	defaultScale?: number;
	/** Zoom bounds (only when `interactive`). Default 1 → 6. */
	minScale?: number;
	maxScale?: number;
	/**
	 * Side-by-side + interactive: when locked, both panes pan/zoom together in the same coordinates.
	 * Controlled when provided; the lock toggle sits on the dividing line.
	 */
	locked?: boolean;
	defaultLocked?: boolean;
	onLockedChange?: (locked: boolean) => void;

	/** Reports the region currently visible (fractions 0–1 of the content) as it pans/zooms — feed a `MapMinimap`. */
	onViewChange?: (view: {x: number; y: number; width: number; height: number}) => void;
	/**
	 * Side-by-side only: reports the *after* pane's visible region when it moves independently of the
	 * *before* pane (i.e. while the divider lock is open) — feed a second `MapMinimap`.
	 */
	onViewChangeAfter?: (view: {x: number; y: number; width: number; height: number}) => void;
	/** Imperative handle for driving the view (e.g. from a minimap): `.setCenter(x, y)` recenters on a fraction. */
	viewControllerRef?: React.MutableRefObject<CompareViewApi | null>;
}

/** Imperative controls exposed via `viewControllerRef`. */
export interface CompareViewApi {
	/** Recenter the view on a point given as fractions (0–1) of the content. */
	setCenter: (x: number, y: number) => void;
	/** Zoom about the center by a factor (>1 zooms in, <1 zooms out); clamped to the scale bounds. */
	zoomBy: (factor: number) => void;
	/** Side-by-side + unlocked: recenter the *after* pane on a fraction (0–1). Falls back to both panes when synced. */
	setCenterAfter: (x: number, y: number) => void;
	/** Side-by-side + unlocked: zoom the *after* pane about its center. Falls back to both panes when synced. */
	zoomByAfter: (factor: number) => void;
}

interface XForm {
	x: number;
	y: number;
	scale: number;
}

const clampPos = (n: number) => Math.min(100, Math.max(0, n));

function CornerLabel({side, children}: {side: "start" | "end"; children: React.ReactNode}) {
	return (
		<span
			className={cn(
				"wwc:pointer-events-none wwc:absolute wwc:top-2 wwc:z-30 wwc:rounded-md wwc:bg-card/85 wwc:px-2 wwc:py-0.5 wwc:text-xs wwc:font-medium wwc:text-foreground wwc:shadow-sm wwc:backdrop-blur",
				side === "start" ? "wwc:left-2" : "wwc:right-2",
			)}
		>
			{children}
		</span>
	);
}

/**
 * Compares two geo-aligned sources. `swipe` stacks them and reveals more of one as you drag a
 * center divider; `side-by-side` splits the box into two panes. With `interactive`, the content
 * pans (drag) and zooms (wheel); in side-by-side a lock on the divider keeps both panes in sync.
 * Pass any nodes (images, maps, canvases) for `before`/`after`.
 */
const CompareView = React.forwardRef<HTMLDivElement, CompareViewProps>(
	(
		{
			className,
			before,
			after,
			mode = "swipe",
			position: positionProp,
			defaultPosition = 50,
			onPositionChange,
			beforeLabel,
			afterLabel,
			interactive = false,
			defaultScale = 1,
			minScale = 1,
			maxScale = 6,
			locked: lockedProp,
			defaultLocked = true,
			onLockedChange,
			onViewChange,
			onViewChangeAfter,
			viewControllerRef,
			...rest
		},
		ref,
	) => {
		// divider position (controlled/uncontrolled)
		const [posInternal, setPosInternal] = React.useState(defaultPosition);
		const position = positionProp ?? posInternal;
		const setPosition = (p: number) => {
			if (positionProp === undefined) setPosInternal(p);
			onPositionChange?.(p);
		};

		// lock (controlled/uncontrolled)
		const [lockedInternal, setLockedInternal] = React.useState(defaultLocked);
		const locked = lockedProp ?? lockedInternal;
		const setLocked = (l: boolean) => {
			if (lockedProp === undefined) setLockedInternal(l);
			onLockedChange?.(l);
		};

		// pan/zoom transforms per pane
		const init: XForm = {x: 0, y: 0, scale: defaultScale};
		const [tA, setTA] = React.useState<XForm>(init);
		const [tB, setTB] = React.useState<XForm>(init);

		const vpA = React.useRef<HTMLDivElement | null>(null);
		const vpB = React.useRef<HTMLDivElement | null>(null);
		const dividerDrag = React.useRef(false);
		const pan = React.useRef<{side: "a" | "b"; sx: number; sy: number; ox: number; oy: number} | null>(null);

		// Latest values for the once-attached window/native listeners.
		const live = React.useRef({tA, tB, locked, mode, minScale, maxScale, interactive, position});
		live.current = {tA, tB, locked, mode, minScale, maxScale, interactive, position};

		const clampX = React.useCallback((t: XForm, rect: DOMRect): XForm => {
			const {minScale: mn, maxScale: mx} = live.current;
			const scale = Math.min(mx, Math.max(mn, t.scale));
			const minX = Math.min(0, rect.width * (1 - scale));
			const minY = Math.min(0, rect.height * (1 - scale));
			return {scale, x: Math.min(0, Math.max(minX, t.x)), y: Math.min(0, Math.max(minY, t.y))};
		}, []);

		const commit = React.useCallback((side: "a" | "b", t: XForm) => {
			if (live.current.mode === "swipe" || live.current.locked) {
				setTA(t);
				setTB(t);
			} else if (side === "a") setTA(t);
			else setTB(t);
		}, []);

		const updateDivider = React.useCallback((clientX: number) => {
			const rect = vpA.current?.getBoundingClientRect();
			if (rect) setPosition(clampPos(((clientX - rect.left) / rect.width) * 100));
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// window pointer handlers (attached once): divider drag + content pan
		React.useEffect(() => {
			const move = (e: PointerEvent) => {
				if (dividerDrag.current) {
					updateDivider(e.clientX);
					return;
				}
				const p = pan.current;
				if (!p || !live.current.interactive) return;
				const rect = (p.side === "a" ? vpA : vpB).current?.getBoundingClientRect();
				if (!rect) return;
				const cur = p.side === "a" ? live.current.tA : live.current.tB;
				commit(p.side, clampX({x: p.ox + (e.clientX - p.sx), y: p.oy + (e.clientY - p.sy), scale: cur.scale}, rect));
			};
			const up = () => {
				dividerDrag.current = false;
				pan.current = null;
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
			window.addEventListener("pointercancel", up);
			return () => {
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
				window.removeEventListener("pointercancel", up);
			};
		}, [clampX, commit, updateDivider]);

		// native wheel-to-zoom (non-passive so we can preventDefault)
		React.useEffect(() => {
			if (!interactive) return;
			const makeWheel = (side: "a" | "b", el: HTMLDivElement) => (e: WheelEvent) => {
				e.preventDefault();
				const rect = el.getBoundingClientRect();
				const cx = e.clientX - rect.left;
				const cy = e.clientY - rect.top;
				const cur = side === "a" ? live.current.tA : live.current.tB;
				const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
				const scale = Math.min(live.current.maxScale, Math.max(live.current.minScale, cur.scale * factor));
				const k = scale / cur.scale;
				commit(side, clampX({x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k, scale}, rect));
			};
			const attached: Array<[HTMLDivElement, (e: WheelEvent) => void]> = [];
			if (vpA.current) {
				const h = makeWheel("a", vpA.current);
				vpA.current.addEventListener("wheel", h, {passive: false});
				attached.push([vpA.current, h]);
			}
			if (mode === "side-by-side" && vpB.current) {
				const h = makeWheel("b", vpB.current);
				vpB.current.addEventListener("wheel", h, {passive: false});
				attached.push([vpB.current, h]);
			}
			return () => attached.forEach(([el, h]) => el.removeEventListener("wheel", h));
		}, [interactive, mode, clampX, commit]);

		// Report the visible region (fractions of the content) whenever the primary view changes.
		React.useEffect(() => {
			if (!onViewChange) return;
			const rect = vpA.current?.getBoundingClientRect();
			if (!rect || !rect.width || !rect.height) return;
			onViewChange({
				x: -tA.x / (rect.width * tA.scale),
				y: -tA.y / (rect.height * tA.scale),
				width: 1 / tA.scale,
				height: 1 / tA.scale,
			});
		}, [tA, onViewChange]);

		// Report the after pane's region (side-by-side only) so a second minimap can track it independently.
		React.useEffect(() => {
			if (!onViewChangeAfter || mode !== "side-by-side") return;
			const rect = vpB.current?.getBoundingClientRect();
			if (!rect || !rect.width || !rect.height) return;
			onViewChangeAfter({
				x: -tB.x / (rect.width * tB.scale),
				y: -tB.y / (rect.height * tB.scale),
				width: 1 / tB.scale,
				height: 1 / tB.scale,
			});
		}, [tB, onViewChangeAfter, mode]);

		// Imperative handle for external navigation (e.g. a minimap): recenter on a content fraction.
		React.useEffect(() => {
			if (!viewControllerRef) return;
			viewControllerRef.current = {
				setCenter: (cx, cy) => {
					const rect = vpA.current?.getBoundingClientRect();
					if (!rect) return;
					const s = live.current.tA.scale;
					commit(
						"a",
						clampX(
							{x: rect.width / 2 - cx * rect.width * s, y: rect.height / 2 - cy * rect.height * s, scale: s},
							rect,
						),
					);
				},
				zoomBy: (factor) => {
					const rect = vpA.current?.getBoundingClientRect();
					if (!rect) return;
					const cur = live.current.tA;
					const scale = Math.min(live.current.maxScale, Math.max(live.current.minScale, cur.scale * factor));
					const k = scale / cur.scale;
					const cx = rect.width / 2;
					const cy = rect.height / 2;
					commit("a", clampX({x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k, scale}, rect));
				},
				setCenterAfter: (cx, cy) => {
					const rect = vpB.current?.getBoundingClientRect();
					if (!rect) return;
					const s = live.current.tB.scale;
					commit(
						"b",
						clampX(
							{x: rect.width / 2 - cx * rect.width * s, y: rect.height / 2 - cy * rect.height * s, scale: s},
							rect,
						),
					);
				},
				zoomByAfter: (factor) => {
					const rect = vpB.current?.getBoundingClientRect();
					if (!rect) return;
					const cur = live.current.tB;
					const scale = Math.min(live.current.maxScale, Math.max(live.current.minScale, cur.scale * factor));
					const k = scale / cur.scale;
					const cx = rect.width / 2;
					const cy = rect.height / 2;
					commit("b", clampX({x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k, scale}, rect));
				},
			};
			return () => {
				if (viewControllerRef) viewControllerRef.current = null;
			};
		}, [viewControllerRef, clampX, commit]);

		const xf = (t: XForm): React.CSSProperties => ({
			transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
			transformOrigin: "0 0",
		});
		const startPan = (side: "a" | "b") => (e: React.PointerEvent) => {
			if (!interactive) return;
			const cur = side === "a" ? tA : tB;
			pan.current = {side, sx: e.clientX, sy: e.clientY, ox: cur.x, oy: cur.y};
		};
		const paneInteractive = interactive ? "wwc:cursor-grab wwc:touch-none wwc:active:cursor-grabbing" : "";

		// No second source → a single pan/zoom map (no divider, no panes).
		if (after == null) {
			return (
				<div ref={ref} className={cn("wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden", className)} {...rest}>
					<div ref={vpA} onPointerDown={startPan("a")} className={cn("wwc:absolute wwc:inset-0", paneInteractive)}>
						<div className="wwc:absolute wwc:inset-0" style={interactive ? xf(tA) : undefined}>
							{before}
						</div>
					</div>
					{beforeLabel != null && <CornerLabel side="start">{beforeLabel}</CornerLabel>}
				</div>
			);
		}

		if (mode === "side-by-side") {
			return (
				<div
					ref={ref}
					className={cn("wwc:relative wwc:grid wwc:h-full wwc:w-full wwc:grid-cols-2 wwc:overflow-hidden", className)}
					{...rest}
				>
					<div
						ref={vpA}
						onPointerDown={startPan("a")}
						className={cn("wwc:relative wwc:overflow-hidden wwc:border-r wwc:border-border", paneInteractive)}
					>
						<div className="wwc:absolute wwc:inset-0" style={interactive ? xf(tA) : undefined}>
							{before}
						</div>
						{beforeLabel != null && <CornerLabel side="start">{beforeLabel}</CornerLabel>}
					</div>
					<div
						ref={vpB}
						onPointerDown={startPan("b")}
						className={cn("wwc:relative wwc:overflow-hidden", paneInteractive)}
					>
						<div className="wwc:absolute wwc:inset-0" style={interactive ? xf(tB) : undefined}>
							{after}
						</div>
						{afterLabel != null && <CornerLabel side="end">{afterLabel}</CornerLabel>}
					</div>

					{interactive && (
						<button
							type="button"
							onClick={() => setLocked(!locked)}
							aria-pressed={locked}
							title={
								locked ? "Panning & zoom are synced — click to unlock" : "Panes move independently — click to sync"
							}
							className="wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:z-30 wwc:flex wwc:h-8 wwc:w-8 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border wwc:border-border wwc:bg-card wwc:text-foreground wwc:shadow-md wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
						>
							{locked ? (
								<Lock className="wwc:h-4 wwc:w-4" />
							) : (
								<LockOpen className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							)}
						</button>
					)}
				</div>
			);
		}

		return (
			<div
				ref={ref}
				className={cn("wwc:relative wwc:h-full wwc:w-full wwc:select-none wwc:overflow-hidden", className)}
				{...rest}
			>
				{/* base layer: after (revealed on the right of the divider) */}
				<div ref={vpA} onPointerDown={startPan("a")} className={cn("wwc:absolute wwc:inset-0", paneInteractive)}>
					<div className="wwc:absolute wwc:inset-0" style={interactive ? xf(tA) : undefined}>
						{after}
					</div>
				</div>
				{/* top layer: before, clipped to the left of the divider (clip is in screen space) */}
				<div
					className="wwc:pointer-events-none wwc:absolute wwc:inset-0"
					style={{clipPath: `inset(0 ${100 - position}% 0 0)`}}
				>
					<div className="wwc:absolute wwc:inset-0" style={interactive ? xf(tA) : undefined}>
						{before}
					</div>
				</div>

				{beforeLabel != null && <CornerLabel side="start">{beforeLabel}</CornerLabel>}
				{afterLabel != null && <CornerLabel side="end">{afterLabel}</CornerLabel>}

				{/* reveal divider + handle */}
				<div
					className="wwc:absolute wwc:inset-y-0 wwc:z-30 wwc:flex wwc:w-5 wwc:-translate-x-1/2 wwc:cursor-ew-resize wwc:touch-none wwc:items-center wwc:justify-center"
					style={{left: `${position}%`}}
					onPointerDown={(e) => {
						e.stopPropagation();
						dividerDrag.current = true;
						updateDivider(e.clientX);
					}}
				>
					<div className="wwc:h-full wwc:w-0.5 wwc:bg-white wwc:shadow-[0_0_0_1px_rgba(0,0,0,0.25)]" />
					<button
						type="button"
						role="slider"
						aria-label="Drag to compare"
						aria-orientation="vertical"
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(position)}
						onKeyDown={(e) => {
							if (e.key === "ArrowLeft") {
								e.preventDefault();
								setPosition(clampPos(position - 2));
							} else if (e.key === "ArrowRight") {
								e.preventDefault();
								setPosition(clampPos(position + 2));
							}
						}}
						className="wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:flex wwc:h-9 wwc:w-9 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border wwc:border-border wwc:bg-card wwc:text-foreground wwc:shadow-md wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
					>
						<ChevronLeft className="wwc:-mr-1 wwc:h-3.5 wwc:w-3.5" />
						<ChevronRight className="wwc:-ml-1 wwc:h-3.5 wwc:w-3.5" />
					</button>
				</div>
			</div>
		);
	},
);
CompareView.displayName = "CompareView";

export {CompareView};
