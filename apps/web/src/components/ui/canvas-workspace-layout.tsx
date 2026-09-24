import {cn} from "@corensystem/coren-utils";
import {ChevronLeft, ChevronRight, Minimize2, PanelRightClose, Tags, X} from "lucide-react";
import * as React from "react";

import {Button} from "./button";

/** App Bar slot (region 1): host-owned strip framing the canvas view. */
export interface CanvasWorkspaceAppBarSlot {
	/**
	 * Mode switch node. The layout renders this node but places it into the App Bar's
	 * left slot (the portal target). Data stays with the view; the chrome stays with the shell.
	 */
	modeSwitch?: React.ReactNode;
	/** Global view actions rendered on the right of the App Bar (period selector, present, etc.). */
	actions?: React.ReactNode;
}

/** View Header slot (region 2): thin chrome strip above the canvas. */
export interface CanvasWorkspaceHeaderSlot {
	/** Navigator toggle control (left). */
	navigatorToggle?: React.ReactNode;
	/** Breadcrumb / location trail. */
	breadcrumb?: React.ReactNode;
	/** Centered context label for the current selection. */
	contextLabel?: React.ReactNode;
	/** Viewport controls (zoom in/out/reset, refresh) rendered on the right. */
	viewportControls?: React.ReactNode;
}

/** A collapsible floating overlay panel (navigator / inspector / legend). */
export interface CanvasWorkspaceOverlaySlot {
	/** Panel content rendered in the expanded form. */
	content?: React.ReactNode;
	/** Whether the panel is collapsed to its single small affordance. */
	collapsed?: boolean;
	/** Called when the user toggles between expanded and collapsed forms. */
	onToggle?: () => void;
	/**
	 * Render the content directly in the dock, without the layout's own panel surface,
	 * header, or collapse chip. Use when `content` is a self-contained panel that owns its
	 * own chrome and collapse/expand behavior (e.g. `CanvasNavigator`).
	 */
	bare?: boolean;
}

/** Bottom-center stepper for paging between sibling artifacts. Hidden when count <= 1. */
export interface CanvasWorkspaceStepperSlot {
	/** 1-based index of the current sibling. */
	index: number;
	/** Total number of siblings. */
	count: number;
	/** Go to the previous sibling. */
	onPrev?: () => void;
	/** Go to the next sibling. */
	onNext?: () => void;
}

/**
 * Viewport state emitted upward by the canvas (state-up half of the lifted-controls pattern).
 * The canvas owns the zoom math; the layout just forwards this handle to the host.
 */
export interface CanvasWorkspaceViewportState {
	/** Current zoom level as a multiplier (1 = 100%). */
	zoom: number;
	/** Whether the canvas can zoom in further. */
	canZoomIn?: boolean;
	/** Whether the canvas can zoom out further. */
	canZoomOut?: boolean;
}

/**
 * Imperative viewport actions exposed by the canvas (actions-down half of the lifted-controls
 * pattern). Header buttons call down into this handle so chrome can render anywhere while the
 * canvas stays the single source of truth.
 */
export interface CanvasWorkspaceViewportActions {
	zoomIn: () => void;
	zoomOut: () => void;
	reset: () => void;
	fit?: () => void;
}

export interface CanvasWorkspaceLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
	/** App Bar slot (region 1): mode switch (left) + global actions (right). */
	appBar?: CanvasWorkspaceAppBarSlot;
	/** View Header slot (region 2): navigator toggle, breadcrumb, context label, viewport controls. */
	header?: CanvasWorkspaceHeaderSlot;
	/** Metric Bar (region 3): summarized KPIs strip. Hidden entirely when omitted. */
	metricBar?: React.ReactNode;
	/**
	 * Keep the Metric Bar (region 3) visible in presentation mode. Off by default: presentation is a
	 * minimal kiosk shell that hides the metric bar. Set this when the metric bar carries content that
	 * should persist full-screen (e.g. a stats toolbar acting as the primary header).
	 */
	metricBarInPresentation?: boolean;
	/** Canvas Stage (region 4, REQUIRED): the pan/zoom surface filling the remaining space. */
	canvas: React.ReactNode;
	/** Top-left overlay dock: expanded tree/list panel <-> compact stepper affordance. */
	navigator?: CanvasWorkspaceOverlaySlot;
	/** Top-right overlay dock: expanded detail card <-> chip. */
	inspector?: CanvasWorkspaceOverlaySlot;
	/** Bottom-right overlay dock: expanded legend <-> chip. */
	legend?: CanvasWorkspaceOverlaySlot;
	/** Bottom-center pager for sibling artifacts. Hidden when count <= 1. */
	stepper?: CanvasWorkspaceStepperSlot;
	/** Promote the layout to a fixed full-viewport presentation shell. */
	isPresentation?: boolean;
	/** Called when the user activates the Exit control in presentation mode. */
	onExitPresentation?: () => void;
	/**
	 * State-up handle: forwarded for callers that wire the canvas's emitted viewport state
	 * to header chrome. The layout does not compute zoom; it only passes this through.
	 */
	onViewportStateChange?: (state: CanvasWorkspaceViewportState) => void;
	/**
	 * Actions-down handle: a ref the canvas populates with imperative viewport actions so
	 * header buttons can drive zoom without owning the math.
	 */
	viewportActionsRef?: React.Ref<CanvasWorkspaceViewportActions>;
	/** Accessible label for the navigator panel / its toggle affordance. */
	navigatorLabel?: string;
	/** Accessible label for the inspector panel / its toggle affordance. */
	inspectorLabel?: string;
	/** Accessible label for the legend panel / its toggle affordance. */
	legendLabel?: string;
}

const PANEL_SURFACE =
	"wwc:rounded-lg wwc:border wwc:bg-card/95 wwc:text-card-foreground wwc:shadow-lg wwc:backdrop-blur";

/** A floating dock wrapper that re-enables pointer events over the pass-through overlay layer. */
function OverlayDock({className, children}: {className?: string; children: React.ReactNode}) {
	return <div className={cn("wwc:pointer-events-auto wwc:self-start", className)}>{children}</div>;
}

const CanvasWorkspaceLayout = React.forwardRef<HTMLDivElement, CanvasWorkspaceLayoutProps>(
	(
		{
			className,
			appBar,
			header,
			metricBar,
			metricBarInPresentation = false,
			canvas,
			navigator,
			inspector,
			legend,
			stepper,
			isPresentation = false,
			onExitPresentation,
			// Pass-through lifted-control handles; documented but not consumed by the shell.
			onViewportStateChange: _onViewportStateChange,
			viewportActionsRef: _viewportActionsRef,
			navigatorLabel = "Navigator",
			inspectorLabel = "Inspector",
			legendLabel = "Legend",
			...rest
		},
		ref,
	) => {
		const showMetricBar = metricBar !== undefined && metricBar !== null;
		const showStepper = stepper !== undefined && stepper.count > 1;

		const navigatorCollapsed = navigator?.collapsed ?? false;
		const inspectorCollapsed = inspector?.collapsed ?? false;
		const legendCollapsed = legend?.collapsed ?? false;

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:flex wwc:min-h-0 wwc:flex-col wwc:overflow-hidden wwc:bg-background wwc:text-foreground",
					isPresentation ? "wwc:fixed wwc:inset-0 wwc:z-50" : "wwc:relative wwc:h-full wwc:w-full",
					className,
				)}
				{...rest}
			>
				{/* Region 1: App Bar. Rendered only when an app bar is provided, or in presentation mode
				    (where it hosts the Exit control). The mode switch goes into the left slot. */}
				{(appBar || isPresentation) && (
					<div className="wwc:z-20 wwc:flex wwc:h-12 wwc:shrink-0 wwc:items-center wwc:gap-2 wwc:border-b wwc:bg-background wwc:px-3">
						<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2">{appBar?.modeSwitch}</div>
						<div className="wwc:flex wwc:shrink-0 wwc:items-center wwc:gap-2">
							{!isPresentation && appBar?.actions}
							{isPresentation && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onExitPresentation}
									aria-label="Exit presentation mode"
									className="wwc:gap-1.5"
								>
									<Minimize2 className="wwc:h-3.5 wwc:w-3.5" />
									<span className="wwc:text-sm wwc:font-medium">Exit</span>
								</Button>
							)}
						</div>
					</div>
				)}

				{/* Region 2: View Header. Hidden in presentation mode (non-essential chrome). */}
				{!isPresentation && header && (
					<div className="wwc:z-20 wwc:flex wwc:h-11 wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:border-b wwc:bg-background wwc:px-3">
						<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:items-center wwc:gap-2">
							{header.navigatorToggle}
							{header.breadcrumb}
						</div>
						{header.contextLabel && (
							<div className="wwc:flex wwc:min-w-0 wwc:shrink-0 wwc:items-center wwc:justify-center wwc:text-sm wwc:font-medium">
								{header.contextLabel}
							</div>
						)}
						<div className="wwc:flex wwc:flex-1 wwc:items-center wwc:justify-end wwc:gap-2">
							{header.viewportControls}
						</div>
					</div>
				)}

				{/* Region 3: Metric Bar. Hidden when omitted, or in presentation mode unless the caller opts
				    to keep it (e.g. a stats toolbar serving as the full-screen header). */}
				{showMetricBar && (!isPresentation || metricBarInPresentation) && (
					<div className="wwc:z-20 wwc:flex wwc:min-h-12 wwc:shrink-0 wwc:items-center wwc:gap-3 wwc:overflow-x-auto wwc:border-b wwc:bg-background wwc:px-3">
						{metricBar}
					</div>
				)}

				{/* Region 4: Canvas Stage. Fills remaining space and hosts the overlay layer. */}
				<div className="wwc:relative wwc:z-0 wwc:flex wwc:min-h-0 wwc:flex-1">
					<div className="wwc:absolute wwc:inset-0 wwc:overflow-hidden">{canvas}</div>

					{/* Overlay Layer: pointer-transparent; each child re-enables pointer events. */}
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-3 wwc:z-10 wwc:flex wwc:flex-col">
						<div className="wwc:flex wwc:items-start wwc:justify-between wwc:gap-3">
							{/* Navigator dock (top-left): expanded panel <-> compact stepper affordance. */}
							{navigator ? (
								navigator.bare ? (
									<OverlayDock>{navigator.content}</OverlayDock>
								) : navigatorCollapsed ? (
									<OverlayDock>
										<button
											type="button"
											aria-pressed={false}
											aria-label={`Show ${navigatorLabel}`}
											onClick={navigator.onToggle}
											className={cn(
												PANEL_SURFACE,
												"wwc:inline-flex wwc:items-center wwc:gap-1 wwc:rounded-md wwc:px-1.5 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
											)}
										>
											<ChevronLeft className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
											<span className="wwc:truncate">{navigatorLabel}</span>
											<ChevronRight className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
										</button>
									</OverlayDock>
								) : (
									<OverlayDock className={cn(PANEL_SURFACE, "wwc:flex wwc:w-72 wwc:max-w-[80%] wwc:flex-col")}>
										<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2">
											<span className="wwc:truncate wwc:text-sm wwc:font-medium">{navigatorLabel}</span>
											<Button
												type="button"
												variant="ghost"
												icon
												size="sm"
												aria-pressed={true}
												aria-label={`Hide ${navigatorLabel}`}
												onClick={navigator.onToggle}
											>
												<ChevronLeft className="wwc:h-4 wwc:w-4" />
											</Button>
										</div>
										<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-2">{navigator.content}</div>
									</OverlayDock>
								)
							) : (
								<span />
							)}

							{/* Inspector dock (top-right): expanded card <-> chip. */}
							{inspector ? (
								inspectorCollapsed ? (
									<OverlayDock>
										<button
											type="button"
											aria-pressed={false}
											aria-label={`Show ${inspectorLabel}`}
											onClick={inspector.onToggle}
											className={cn(
												PANEL_SURFACE,
												"wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
											)}
										>
											<PanelRightClose className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
											<span className="wwc:truncate">{inspectorLabel}</span>
										</button>
									</OverlayDock>
								) : (
									<OverlayDock className={cn(PANEL_SURFACE, "wwc:flex wwc:w-72 wwc:max-w-[80%] wwc:flex-col")}>
										<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2">
											<span className="wwc:truncate wwc:text-sm wwc:font-medium">{inspectorLabel}</span>
											<Button
												type="button"
												variant="ghost"
												icon
												size="sm"
												aria-pressed={true}
												aria-label={`Hide ${inspectorLabel}`}
												onClick={inspector.onToggle}
											>
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</div>
										<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:p-2">{inspector.content}</div>
									</OverlayDock>
								)
							) : (
								<span />
							)}
						</div>

						{/* Bottom edge: stepper (center) + legend (right). */}
						<div className="wwc:mt-auto wwc:flex wwc:items-end wwc:justify-between wwc:gap-3">
							<span />

							{/* Bottom-center stepper / pager for sibling artifacts. */}
							{showStepper && stepper ? (
								<div
									className={cn(
										PANEL_SURFACE,
										"wwc:pointer-events-auto wwc:flex wwc:items-center wwc:gap-1 wwc:rounded-lg wwc:px-1.5 wwc:py-1",
									)}
								>
									<Button
										type="button"
										variant="ghost"
										icon
										size="sm"
										onClick={stepper.onPrev}
										disabled={stepper.index <= 1}
										aria-label="Previous item"
									>
										<ChevronLeft className="wwc:h-4 wwc:w-4" />
									</Button>
									<span className="wwc:min-w-12 wwc:text-center wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
										{stepper.index} / {stepper.count}
									</span>
									<Button
										type="button"
										variant="ghost"
										icon
										size="sm"
										onClick={stepper.onNext}
										disabled={stepper.index >= stepper.count}
										aria-label="Next item"
									>
										<ChevronRight className="wwc:h-4 wwc:w-4" />
									</Button>
								</div>
							) : (
								<span />
							)}

							{/* Legend dock (bottom-right): expanded legend <-> chip. */}
							{legend ? (
								legendCollapsed ? (
									<button
										type="button"
										aria-pressed={false}
										aria-label={`Show ${legendLabel}`}
										onClick={legend.onToggle}
										className={cn(
											PANEL_SURFACE,
											"wwc:pointer-events-auto wwc:inline-flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:px-2 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-1 wwc:focus-visible:ring-ring",
										)}
									>
										<Tags className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
										<span className="wwc:truncate">{legendLabel}</span>
									</button>
								) : (
									<div className={cn(PANEL_SURFACE, "wwc:pointer-events-auto wwc:flex wwc:max-w-[80%] wwc:flex-col")}>
										<div className="wwc:flex wwc:h-9 wwc:shrink-0 wwc:items-center wwc:justify-between wwc:gap-2 wwc:border-b wwc:px-2">
											<span className="wwc:truncate wwc:text-sm wwc:font-medium">{legendLabel}</span>
											<Button
												type="button"
												variant="ghost"
												icon
												size="sm"
												aria-pressed={true}
												aria-label={`Hide ${legendLabel}`}
												onClick={legend.onToggle}
											>
												<X className="wwc:h-4 wwc:w-4" />
											</Button>
										</div>
										<div className="wwc:min-h-0 wwc:overflow-auto wwc:p-2">{legend.content}</div>
									</div>
								)
							) : (
								<span />
							)}
						</div>
					</div>
				</div>
			</div>
		);
	},
);
CanvasWorkspaceLayout.displayName = "CanvasWorkspaceLayout";

export {CanvasWorkspaceLayout};
