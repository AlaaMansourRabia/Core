import * as React from "react";

import type {
	FragmentMarker,
	FragmentSelection,
	FragmentStorey,
	FragmentViewport,
	FragmentViewportStatus,
	InteractionMode,
	NavigationMode,
	ProjectionMode,
} from "./runtime";

/**
 * Shared state between FragmentViewer (the canvas) and ViewerToolbar (the chrome).
 *
 * A context rather than an imperative ref because the toolbar has to *reflect* engine state — which
 * projection is active, which tool is armed — not just fire at it. Both components mount under one
 * FragmentViewerProvider; the template composes them however it likes.
 */

export interface FragmentViewerState {
	status: FragmentViewportStatus;
	error: Error | null;
	/** True once a viewport has mounted and registered itself. */
	ready: boolean;
	selection: FragmentSelection | null;
	modelIds: string[];
	navigation: NavigationMode;
	projection: ProjectionMode;
	/** Armed tool: what a double-click will do. */
	interaction: InteractionMode;
	/** Whether existing clipping planes are active (they persist while disabled). */
	clippingEnabled: boolean;
	/** Whole model faded back so selections and sections read clearly. */
	ghost: boolean;
	/** Cinematic mode (shadows + AO + bloom + beams + tone mapping) is on. Full navigation stays live. */
	cinematic: boolean;
	storeys: FragmentStorey[];
	activeStorey: string | null;
	/** Camera yaw (azimuth) in degrees, updated as the model is orbited. Lets chrome like the site
	 * minimap rotate to stay aligned with the view. */
	heading: number;
}

export interface FragmentViewerApi {
	fit(): Promise<void>;
	setNavigation(mode: NavigationMode): void;
	toggleProjection(): Promise<void>;
	/** Arm a tool, or pass null to return to plain selection. Re-arming the same tool disarms it. */
	setInteraction(mode: InteractionMode): void;
	toggleClipping(): void;
	clearSections(): void;
	clearMeasurements(): void;
	hideSelection(): Promise<void>;
	isolateSelection(): Promise<void>;
	showAll(): Promise<void>;
	setPostproduction(enabled: boolean): void;
	/** Fade the model back (or restore it). */
	setGhost(enabled: boolean): Promise<void>;
	/** Toggle cinematic mode (shadows + AO + bloom + beams + tone mapping). */
	setCinematic(enabled: boolean): void;
	/** Derive storey views from the IFC spatial structure. Cached in state afterwards. */
	loadStoreys(): Promise<void>;
	openStorey(id: string): Promise<void>;
	closeStorey(): Promise<void>;
	/** Draw point markers (workers, sensors…) — one InstancedMesh, so thousands stay cheap. */
	setMarkers(markers: FragmentMarker[], options?: {radius?: number; color?: string; occluded?: boolean}): void;
	clearMarkers(): void;
	/** The whole model's world-space bounding box, for placing markers across the footprint. */
	bounds(): {min: [number, number, number]; max: [number, number, number]} | null;
	/** Each storey's world-space box (real footprint + height), keyed by storey id. */
	storeyFootprints(): Promise<Record<string, {min: [number, number, number]; max: [number, number, number]}>>;
	/** The underlying viewport, for callers that need the raw SDK. */
	viewport(): FragmentViewport | null;
}

interface ContextValue {
	state: FragmentViewerState;
	api: FragmentViewerApi;
	/** Called by FragmentViewer on mount/unmount. Not for application code. */
	register: (viewport: FragmentViewport | null) => void;
	patch: (next: Partial<FragmentViewerState>) => void;
}

const FragmentViewerContext = React.createContext<ContextValue | null>(null);

const INITIAL: FragmentViewerState = {
	status: "idle",
	error: null,
	ready: false,
	selection: null,
	modelIds: [],
	navigation: "Orbit",
	projection: "Perspective",
	interaction: null,
	clippingEnabled: true,
	ghost: false,
	cinematic: false,
	storeys: [],
	activeStorey: null,
	heading: 0,
};

export function FragmentViewerProvider({children}: {children: React.ReactNode}) {
	const [state, setState] = React.useState<FragmentViewerState>(INITIAL);
	const viewportRef = React.useRef<FragmentViewport | null>(null);

	const patch = React.useCallback((next: Partial<FragmentViewerState>) => {
		setState((prev) => ({...prev, ...next}));
	}, []);

	const register = React.useCallback((viewport: FragmentViewport | null) => {
		viewportRef.current = viewport;
		setState((prev) => (viewport ? {...prev, ready: true} : {...INITIAL}));
	}, []);

	const api = React.useMemo<FragmentViewerApi>(() => {
		const of = () => viewportRef.current;
		return {
			viewport: of,
			async fit() {
				await of()?.fit();
			},
			setNavigation(mode) {
				of()?.setNavigation(mode);
				patch({navigation: mode});
			},
			async toggleProjection() {
				const next = await of()?.toggleProjection();
				if (next) patch({projection: next});
			},
			setInteraction(mode) {
				setState((prev) => {
					// Clicking the armed tool again disarms it — how every BIM viewer behaves.
					const next = prev.interaction === mode ? null : mode;
					of()?.setInteraction(next);
					return {...prev, interaction: next};
				});
			},
			toggleClipping() {
				const enabled = of()?.toggleClipping();
				if (enabled !== undefined) patch({clippingEnabled: enabled});
			},
			clearSections() {
				of()?.clearSections();
			},
			clearMeasurements() {
				of()?.clearMeasurements();
			},
			async hideSelection() {
				await of()?.hideSelection();
			},
			async isolateSelection() {
				await of()?.isolateSelection();
			},
			async showAll() {
				await of()?.showAll();
				patch({activeStorey: null});
			},
			setPostproduction(enabled) {
				of()?.setPostproduction(enabled);
			},
			async setGhost(enabled) {
				await of()?.setGhost(enabled);
				patch({ghost: enabled});
			},
			setCinematic(enabled) {
				const active = of()?.setCinematic(enabled);
				patch({cinematic: active ?? false});
			},
			async loadStoreys() {
				const storeys = (await of()?.storeys()) ?? [];
				patch({storeys});
			},
			async openStorey(id) {
				patch({activeStorey: id});
				await of()?.openStorey(id);
			},
			async closeStorey() {
				patch({activeStorey: null});
				await of()?.closeStorey();
			},
			setMarkers(markers, options) {
				of()?.setMarkers(markers, options);
			},
			clearMarkers() {
				of()?.clearMarkers();
			},
			bounds() {
				return of()?.bounds() ?? null;
			},
			async storeyFootprints() {
				return (await of()?.storeyFootprints()) ?? {};
			},
		};
	}, [patch]);

	const value = React.useMemo<ContextValue>(() => ({state, api, register, patch}), [state, api, register, patch]);

	return <FragmentViewerContext.Provider value={value}>{children}</FragmentViewerContext.Provider>;
}

/** Read viewer state and drive the engine. Must be called under a FragmentViewerProvider. */
export function useFragmentViewer(): {state: FragmentViewerState; api: FragmentViewerApi} {
	const context = React.useContext(FragmentViewerContext);
	if (!context) throw new Error("useFragmentViewer must be used within a FragmentViewerProvider");
	return {state: context.state, api: context.api};
}

/**
 * Viewer state and engine when there is a provider, or `null` when there is not.
 *
 * The null-tolerant twin of {@link useFragmentViewer}, for a surface whose stage may or may not be a
 * FragmentViewer — Workforce Map View renders a placeholder plan when it is not. Callers used to get
 * this by wrapping `useFragmentViewer()` in a try/catch, which reads as a conditional hook call (and
 * oxlint's `react-hooks(rules-of-hooks)` rejects it), besides swallowing every other error the hook
 * might raise. Reading the context directly is both honest and unconditional.
 */
export function useOptionalFragmentViewer(): {state: FragmentViewerState; api: FragmentViewerApi} | null {
	const context = React.useContext(FragmentViewerContext);
	if (!context) return null;
	return {state: context.state, api: context.api};
}

/** Internal wiring for FragmentViewer. Returns null outside a provider so the viewer can stand alone. */
export function useFragmentViewerRegistration(): Pick<ContextValue, "register" | "patch"> | null {
	return React.useContext(FragmentViewerContext);
}
