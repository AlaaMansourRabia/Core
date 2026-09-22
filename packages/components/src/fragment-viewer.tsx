import {cn} from "@corensystem/core-utils";
import {Box, TriangleAlert} from "lucide-react";
import * as React from "react";

import {Empty} from "./empty";
import {useFragmentViewerRegistration} from "./fragment-viewer/context";
import {
	FragmentViewport,
	type FragmentMarker,
	type FragmentSelection,
	type FragmentViewportStatus,
} from "./fragment-viewer/runtime";
import {Skeleton} from "./skeleton";

export type {FragmentMarker, FragmentSelection, FragmentViewportStatus};
export {
	FragmentViewerProvider,
	useFragmentViewer,
	useOptionalFragmentViewer,
	type FragmentViewerApi,
	type FragmentViewerState,
} from "./fragment-viewer/context";
export type {
	FragmentStorey,
	InteractionMode,
	MeasurementKind,
	NavigationMode,
	ProjectionMode,
} from "./fragment-viewer/runtime";

export interface FragmentViewerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
	/** URL of the `.frag` model to display. */
	src: string;
	/** Optional model URL used when `src` cannot be loaded. */
	fallbackSrc?: string;
	/** Stable id for the model within the viewport. Defaults to `src`. */
	modelId?: string;
	/**
	 * URL of the Fragments web worker — required, because a bundled library cannot resolve the
	 * `@thatopen/fragments/worker` specifier to a runtime URL. In a Vite app:
	 * `import workerUrl from "@thatopen/fragments/worker?url"`.
	 */
	workerUrl: string;
	/** Scene background. `null` leaves the canvas transparent. */
	background?: string | null;
	/** Highlight colour for picked elements. */
	selectionColor?: string;
	/** Show the underlying SDK logo over the canvas. Defaults to false. */
	showLogo?: boolean;
	/** Animate the camera when first framing the model on load. Default true. Set false to jump to the
	 * framed position instantly (e.g. when an outer transition already zooms the viewer in). */
	fitAnimation?: boolean;
	/** Frame only the elements whose IFC category matches one of these patterns (e.g. the building
	 * shell) instead of the whole model. Pass a stable (module-level) array — a new array each render
	 * reloads the model. */
	fitCategories?: RegExp[];
	/** Multiply the fit distance. Default 1; below 1 frames tighter (closer). */
	fitFactor?: number;
	/** Point markers drawn in the model — workers, sensors, anything with a position. */
	markers?: FragmentMarker[];
	/** Marker radius in model units. Defaults to ~1/300th of the model diagonal. */
	markerRadius?: number;
	/** Let geometry hide markers behind it. Default false — markers read through the model, like pins. */
	markersOccluded?: boolean;
	/** Fires on every pick; `null` means the selection was cleared. */
	onSelectionChange?: (selection: FragmentSelection | null) => void;
	/**
	 * Floor-only picking: a click selects (isolates) the storey the element belongs to instead of the
	 * element itself, so individual elements aren't selectable. Requires the IFC to have storeys.
	 */
	selectFloorsOnly?: boolean;
	/** Fires as the model moves through loading → ready, or on failure. */
	onStatusChange?: (status: FragmentViewportStatus, error?: Error) => void;
}

/**
 * Renders a That Open Fragments (`.frag`) model with orbit, zoom and click-to-select — the same
 * runtime the WC3 engineering viewers use. Fills its parent, so give that parent a bounded height.
 *
 * Wrap it in `FragmentViewerProvider` and it publishes state to `ViewerToolbar` and to any panel
 * calling `useFragmentViewer()`. Without a provider it still works as a plain viewer.
 *
 * `three`, `@thatopen/fragments`, `@thatopen/components` and `@thatopen/components-front` are
 * optional peer dependencies: install them in the consuming app.
 */
const FragmentViewer = React.forwardRef<HTMLDivElement, FragmentViewerProps>(
	(
		{
			src,
			fallbackSrc,
			modelId,
			workerUrl,
			background = null,
			selectionColor,
			showLogo = false,
			fitAnimation,
			fitCategories,
			fitFactor,
			markers,
			markerRadius,
			markersOccluded,
			onSelectionChange,
			selectFloorsOnly,
			onStatusChange,
			className,
			...props
		},
		ref,
	) => {
		const hostRef = React.useRef<HTMLDivElement>(null);
		const [status, setStatus] = React.useState<FragmentViewportStatus>("idle");
		const [error, setError] = React.useState<Error | null>(null);
		const [activeSrc, setActiveSrc] = React.useState(src);
		const registration = useFragmentViewerRegistration();

		React.useEffect(() => setActiveSrc(src), [src]);

		React.useImperativeHandle(ref, () => hostRef.current as HTMLDivElement);

		// Hold callbacks and context wiring in refs so a changed inline handler doesn't tear the WebGL
		// context down — recreating the viewport reloads the whole model.
		const selectionHandler = React.useRef(onSelectionChange);
		const statusHandler = React.useRef(onStatusChange);
		const registrationRef = React.useRef(registration);
		React.useEffect(() => {
			selectionHandler.current = onSelectionChange;
			statusHandler.current = onStatusChange;
			registrationRef.current = registration;
		}, [onSelectionChange, onStatusChange, registration]);

		React.useEffect(() => {
			const host = hostRef.current;
			if (!host) return;

			const viewport = new FragmentViewport(host, {
				workerUrl,
				background,
				selectionColor,
				showLogo,
				selectFloorsOnly,
				fitAnimation,
				fitCategories,
				fitFactor,
				onStatusChange: (next, failure) => {
					if (next === "error" && fallbackSrc && activeSrc !== fallbackSrc) {
						setStatus("loading");
						setError(null);
						setActiveSrc(fallbackSrc);
						return;
					}
					setStatus(next);
					setError(failure ?? null);
					registrationRef.current?.patch({status: next, error: failure ?? null});
					statusHandler.current?.(next, failure);
				},
				onSelectionChange: (selection) => {
					registrationRef.current?.patch({selection});
					selectionHandler.current?.(selection);
				},
				// A floor pick isolates that storey and syncs the context so panels react to activeStorey.
				onStoreyPick: (storeyId) => {
					registrationRef.current?.patch({activeStorey: storeyId});
					void viewportRef.current?.openStorey(storeyId);
				},
				onModelsChange: (modelIds) => registrationRef.current?.patch({modelIds}),
				onHeadingChange: (heading) => registrationRef.current?.patch({heading}),
			});

			viewportRef.current = viewport;
			registrationRef.current?.register(viewport);
			void viewport.load(activeSrc, modelId ?? activeSrc);

			return () => {
				viewportRef.current = null;
				registrationRef.current?.register(null);
				void viewport.dispose();
			};
		}, [
			activeSrc,
			fallbackSrc,
			modelId,
			workerUrl,
			background,
			selectionColor,
			showLogo,
			selectFloorsOnly,
			fitAnimation,
			fitCategories,
			fitFactor,
		]);

		const viewportRef = React.useRef<FragmentViewport | null>(null);
		React.useEffect(() => {
			// Applied separately from construction so changing the marker set never tears down the
			// WebGL context or reloads the model.
			if (status !== "ready") return;
			viewportRef.current?.setMarkers(markers ?? [], {radius: markerRadius, occluded: markersOccluded});
		}, [markers, markerRadius, markersOccluded, status]);

		return (
			<div ref={hostRef} className={cn("wwc:relative wwc:h-full wwc:w-full", className)} {...props}>
				{status === "loading" && (
					<div className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:items-center wwc:justify-center">
						<Skeleton className="wwc:h-24 wwc:w-48" />
					</div>
				)}

				{status === "error" && (
					<div className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:items-center wwc:justify-center wwc:bg-background/80 wwc:p-6">
						<Empty
							icon={<TriangleAlert className="wwc:h-6 wwc:w-6" />}
							title="Model failed to load"
							description={error?.message ?? "The Fragments model could not be read."}
						/>
					</div>
				)}

				{status === "idle" && (
					<div className="wwc:absolute wwc:inset-0 wwc:z-10 wwc:flex wwc:items-center wwc:justify-center">
						<Empty icon={<Box className="wwc:h-6 wwc:w-6" />} title="No model" description="Provide a .frag source." />
					</div>
				)}
			</div>
		);
	},
);
FragmentViewer.displayName = "FragmentViewer";

export {FragmentViewer};
