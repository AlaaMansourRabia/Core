import {cn} from "@wakecap/core-utils";
import {Minus} from "lucide-react";
import * as React from "react";

/** The currently-viewed region, expressed as fractions (0–1) of the whole map. */
export interface MapMinimapViewport {
	/** Left edge of the viewed region (0–1). */
	x: number;
	/** Top edge of the viewed region (0–1). */
	y: number;
	/** Width of the viewed region (0–1). */
	width: number;
	/** Height of the viewed region (0–1). */
	height: number;
}

export interface MapMinimapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
	/** The whole-map thumbnail. Fills the preview; use the same content as the main map. */
	children: React.ReactNode;
	/** The region currently visible in the main view, as fractions of the whole map. */
	viewport: MapMinimapViewport;
	/** When set, clicking/dragging the preview recenters the view — called with the new center (0–1). */
	onNavigate?: (center: {x: number; y: number}) => void;
	/** Label shown in the header above the preview (and on the collapsed chip). */
	label?: React.ReactNode;
	/** Show a minimize control in the header; collapses to a compact reopen chip (like the Legend). */
	minimizable?: boolean;
	/** Controlled collapsed state. */
	minimized?: boolean;
	/** Uncontrolled initial collapsed state. Default false. */
	defaultMinimized?: boolean;
	onMinimizedChange?: (minimized: boolean) => void;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * A minimap / overview: a header (label + optional minimize) above a thumbnail of the whole map,
 * with a box marking the region the main view is currently showing. Pass the current `viewport`
 * (fractions of the full map). With `onNavigate`, dragging or clicking the preview recenters the main
 * view. When `minimizable`, minimizing collapses it to a compact reopen chip — the same behavior as
 * the Legend. Set the width (and ideally the map's aspect) via `className`.
 */
const MapMinimap = React.forwardRef<HTMLDivElement, MapMinimapProps>(
	(
		{
			className,
			children,
			viewport,
			onNavigate,
			label,
			minimizable = false,
			minimized: minimizedProp,
			defaultMinimized = false,
			onMinimizedChange,
			...rest
		},
		ref,
	) => {
		const thumbRef = React.useRef<HTMLDivElement | null>(null);
		const dragging = React.useRef(false);
		const vp = React.useRef(viewport);
		vp.current = viewport;

		const [minInternal, setMinInternal] = React.useState(defaultMinimized);
		const minimized = minimizedProp ?? minInternal;
		const setMinimized = (m: boolean) => {
			if (minimizedProp === undefined) setMinInternal(m);
			onMinimizedChange?.(m);
		};

		const navigateTo = React.useCallback(
			(clientX: number, clientY: number) => {
				const el = thumbRef.current;
				if (!el || !onNavigate) return;
				const rect = el.getBoundingClientRect();
				const fx = clamp01((clientX - rect.left) / rect.width);
				const fy = clamp01((clientY - rect.top) / rect.height);
				const hw = vp.current.width / 2;
				const hh = vp.current.height / 2;
				onNavigate({x: Math.min(1 - hw, Math.max(hw, fx)), y: Math.min(1 - hh, Math.max(hh, fy))});
			},
			[onNavigate],
		);

		React.useEffect(() => {
			if (!onNavigate) return;
			const move = (e: PointerEvent) => {
				if (dragging.current) navigateTo(e.clientX, e.clientY);
			};
			const up = () => {
				dragging.current = false;
			};
			window.addEventListener("pointermove", move);
			window.addEventListener("pointerup", up);
			window.addEventListener("pointercancel", up);
			return () => {
				window.removeEventListener("pointermove", move);
				window.removeEventListener("pointerup", up);
				window.removeEventListener("pointercancel", up);
			};
		}, [onNavigate, navigateTo]);

		// Collapsed → a compact reopen chip (matches the Legend's minimized behavior).
		if (minimizable && minimized) {
			return (
				<button
					ref={ref as unknown as React.Ref<HTMLButtonElement>}
					type="button"
					onClick={() => setMinimized(false)}
					aria-label="Show overview"
					className={cn(
						"wwc:pointer-events-auto wwc:z-10 wwc:rounded-md wwc:border wwc:bg-card/95 wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:shadow-sm wwc:hover:bg-accent",
						className,
					)}
					{...(rest as React.HTMLAttributes<HTMLButtonElement>)}
				>
					{label ?? "Overview"}
				</button>
			);
		}

		const interactive = Boolean(onNavigate);
		const showHeader = label != null || minimizable;

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:relative wwc:flex wwc:w-44 wwc:flex-col wwc:overflow-hidden wwc:rounded-md wwc:border wwc:border-border wwc:bg-card wwc:shadow-md",
					className,
				)}
				{...rest}
			>
				{showHeader && (
					<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-2 wwc:py-1">
						<span className="wwc:min-w-0 wwc:truncate wwc:text-[11px] wwc:font-medium wwc:text-foreground">
							{label}
						</span>
						{minimizable && (
							<button
								type="button"
								onClick={() => setMinimized(true)}
								aria-label="Minimize overview"
								className="wwc:flex wwc:h-5 wwc:w-5 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded wwc:text-muted-foreground wwc:transition-colors wwc:hover:bg-accent wwc:hover:text-foreground wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring"
							>
								<Minus className="wwc:h-3.5 wwc:w-3.5" />
							</button>
						)}
					</div>
				)}

				<div
					ref={thumbRef}
					onPointerDown={
						interactive
							? (e) => {
									dragging.current = true;
									navigateTo(e.clientX, e.clientY);
								}
							: undefined
					}
					className={cn(
						"wwc:relative wwc:aspect-[16/10] wwc:w-full wwc:overflow-hidden",
						showHeader && "wwc:border-t wwc:border-border",
						interactive && "wwc:cursor-pointer wwc:touch-none",
					)}
				>
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0">{children}</div>
					<div
						className="wwc:pointer-events-none wwc:absolute wwc:rounded-[2px] wwc:border-2 wwc:border-primary wwc:bg-primary/10 wwc:shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]"
						style={{
							left: `${clamp01(viewport.x) * 100}%`,
							top: `${clamp01(viewport.y) * 100}%`,
							width: `${clamp01(viewport.width) * 100}%`,
							height: `${clamp01(viewport.height) * 100}%`,
						}}
					/>
				</div>
			</div>
		);
	},
);
MapMinimap.displayName = "MapMinimap";

export {MapMinimap};
