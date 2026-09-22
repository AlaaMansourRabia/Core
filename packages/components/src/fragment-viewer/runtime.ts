import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import * as THREE from "three";

import {Cinematic} from "./cinematic";

/**
 * Fragments viewport: a container in, a navigable BIM model out.
 *
 * Framework-free on purpose — FragmentViewer is a thin React wrapper over this, the same way
 * `map.tsx` wraps mapbox-gl, and ViewerToolbar drives it through these same public methods.
 *
 * Built on @thatopen/components + components-front rather than raw three.js, because every control
 * a BIM viewer needs already exists there: orbit/first-person/plan navigation, ortho projection,
 * clipping planes, four measurement tools, hide/isolate, storey views, item data. Re-deriving those
 * would be weeks of work with worse results. The setup follows WC3's own 3.4.6 viewer.
 *
 * All three That Open packages are optional peer dependencies, reachable only through the
 * `@corensystem/core-ui/fragment-viewer` subpath.
 */

/**
 * Navigation modes offered to the user. Both sit on the SDK's "Orbit" mode: `Pan` simply drags the
 * camera on left-drag instead of rotating it, which is how CAD tools present it. The SDK's other
 * modes (FirstPerson, Plan) are deliberately not exposed — Plan overlaps with Levels, and
 * FirstPerson is a different product decision.
 */
export type NavigationMode = "Orbit" | "Pan";
export type MeasurementKind = "length" | "area" | "angle" | "volume";
/** What a double-click does. `null` leaves clicks to plain selection. */
export type InteractionMode = "section" | MeasurementKind | null;
export type ProjectionMode = "Perspective" | "Orthographic";
export type FragmentViewportStatus = "idle" | "loading" | "ready" | "error";

export interface FragmentSelection {
	/** Number of highlighted elements across all models. */
	itemCount: number;
	/** IFC category of the first picked element, when resolvable. */
	category?: string | null;
	/** IFC GUID of the first picked element, when resolvable. */
	guid?: string | null;
	/** Raw per-item data from Fragments, for callers wanting more than the summary. */
	data: unknown[];
}

/** A point marker drawn in the model — a worker, sensor, or anything else with a position. */
export interface FragmentMarker {
	id: string;
	/** Position in the model's own coordinate frame, metres. */
	position: [number, number, number];
	/** CSS colour. Defaults to the viewport's marker colour. */
	color?: string;
}

/** A storey view derived from the IFC spatial structure, for the Levels control. */
export interface FragmentStorey {
	id: string;
	name: string;
	/** World-space elevation of the floor, metres — lets callers place things on it (e.g. worker markers). */
	elevation: number;
}

export interface FragmentViewportOptions {
	/** URL of the Fragments worker. Vite consumers: `import url from "@thatopen/fragments/worker?url"`. */
	workerUrl: string;
	/** Scene background. `null` leaves the canvas transparent. */
	background?: string | null;
	/** Highlight colour for picked elements. */
	selectionColor?: string;
	/**
	 * Show the underlying SDK logo over the canvas. The React wrapper defaults this to false; direct
	 * runtime consumers may opt in explicitly.
	 */
	showLogo?: boolean;
	/**
	 * Floor-only picking: a click selects the storey the element belongs to instead of the element
	 * itself (no per-element highlight). The resolved storey id is reported via `onStoreyPick`.
	 */
	selectFloorsOnly?: boolean;
	/** Fires when a click resolves to a storey (only in `selectFloorsOnly` mode). */
	onStoreyPick?: (storeyId: string) => void;
	/** Animate the camera when first framing the model on load. Default true. Set false to jump the
	 * camera to the framed position instantly — useful when the viewer is revealed by an outer
	 * transition and its own zoom-in would double up. */
	fitAnimation?: boolean;
	/** Frame only the elements whose IFC category matches one of these patterns (e.g. the building
	 * shell) instead of the whole model. Keeps stray/site/annotation geometry from zooming the camera
	 * out. Falls back to the whole model when nothing matches. */
	fitCategories?: RegExp[];
	/** Multiply the fit distance. Default 1; below 1 frames tighter (closer), above 1 pulls back. */
	fitFactor?: number;
	onStatusChange?: (status: FragmentViewportStatus, error?: Error) => void;
	onSelectionChange?: (selection: FragmentSelection | null) => void;
	onModelsChange?: (modelIds: string[]) => void;
	/** Fires as the camera orbits, reporting its yaw (azimuth) in degrees. Lets external chrome — e.g.
	 * a site minimap — rotate to stay aligned with the view. Throttled to meaningful changes. */
	onHeadingChange?: (headingDeg: number) => void;
}

/** Edge length of a section plane's handle, in metres. The SDK default spans the whole scene. */
const CLIPPER_PLANE_SIZE_M = 20;

/** Ghost-mode face tint — a cool grey, so faded geometry reads as glass rather than glare. */
const GHOST_FACE_COLOR = 0x9aa7b4;
/** Ghost-mode line tint, kept fainter than the faces so edges don't dominate. */
const GHOST_LINE_COLOR = 0x6b7784;

/** Fade applied to the storeys *other* than the selected one, so the level stands out in context. */
const STOREY_GHOST_MATERIAL = {
	color: new THREE.Color(0x9aa7b4),
	renderedFaces: 0,
	opacity: 0.08,
	transparent: true,
} as const;

/** Pointer travel still counted as a click rather than a camera drag. */
const DRAG_TOLERANCE_PX = 4;

/**
 * A hard-hat marker geometry — a domed crown with a small brim — sized to fit the same footprint as a
 * sphere of `radius` (so it reads at the same size as the old sphere markers). Built as a single
 * `LatheGeometry` (a revolved profile) so it works as one instanced geometry, no mesh merging needed.
 */
function createHelmetGeometry(radius: number): THREE.BufferGeometry {
	// Profile in (radiusFromAxis, height), in units of `radius`: dome curving down to a slight brim lip.
	const profile: [number, number][] = [
		[0.02, 0.9],
		[0.3, 0.86],
		[0.52, 0.74],
		[0.68, 0.55],
		[0.76, 0.3],
		[0.78, 0.1],
		[1.0, 0.05],
	];
	const points = profile.map(([x, y]) => new THREE.Vector2(x * radius, y * radius));
	const geometry = new THREE.LatheGeometry(points, 18);
	// Centre it vertically on the marker position, the way the sphere was centred on it.
	geometry.translate(0, -0.475 * radius, 0);
	geometry.computeVertexNormals();
	return geometry;
}

type MeasurementTool = OBF.LengthMeasurement | OBF.AreaMeasurement | OBF.AngleMeasurement | OBF.VolumeMeasurement;

export class FragmentViewport {
	readonly components: OBC.Components;
	readonly world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>;

	private readonly container: HTMLElement;
	private readonly options: FragmentViewportOptions;
	private readonly fragments: OBC.FragmentsManager;
	private readonly highlighter: OBF.Highlighter;
	/** GPU picker used only in floor-only mode (the highlighter is disabled there). */
	private picker: OBC.FastModelPicker | null = null;
	private readonly clipper: OBC.Clipper;
	private readonly grid: OBC.SimpleGrid;
	private readonly measurements: Record<MeasurementKind, MeasurementTool>;

	private readonly resizeObserver: ResizeObserver;
	private readonly originalMaterials = new Map<
		FRAGS.BIMMaterial,
		{color: number; transparent: boolean; opacity: number; depthWrite: boolean}
	>();
	private markers: THREE.InstancedMesh | null = null;
	private markerIds: string[] = [];
	// Kept so the marker mesh can be reused across updates instead of rebuilt (which flickers).
	private markerCapacity = 0;
	private markerRadius = 0;
	private markerOccluded = false;
	private selection: OBC.ModelIdMap = {};
	private interaction: InteractionMode = null;
	private clippingEnabled = true;
	private ghostStyle: OBF.PostproductionAspect | null = null;
	private storeyBands = new Map<string, {min: number; max: number}>();
	private ghostedStorey: OBC.ModelIdMap = {};
	/** Cached per-element storey assignment (modelId → localId → storeyId). Avoids re-scanning geometry
	 *  on every floor switch, and lets openStorey apply only the *delta* in ghosting (no full un-ghost
	 *  flash). Invalidated when storeys are recomputed. */
	private elementStoreys: Map<string, Map<number, string>> | null = null;
	/** Last emitted camera yaw (deg); NaN until the first tick so the initial heading always fires. */
	private lastHeadingDeg = Number.NaN;
	/** Cinematic mode (sun shadows + AO + bloom + beams + tone mapping). Built lazily on first enable. */
	private cinematic: Cinematic | null = null;
	private disposed = false;

	constructor(container: HTMLElement, options: FragmentViewportOptions) {
		this.container = container;
		this.options = options;

		this.components = new OBC.Components();
		this.world = this.components
			.get(OBC.Worlds)
			.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>();

		this.world.scene = new OBC.SimpleScene(this.components);
		this.world.scene.setup();
		if (options.background !== null) {
			this.world.scene.three.background = new THREE.Color(options.background ?? "#e8edf2");
		}
		this.world.renderer = new OBF.PostproductionRenderer(this.components, container);
		// three.js ignores material.clippingPlanes unless this is on. Fragments clips in its own
		// shader, but the shell geometry and the postproduction passes rely on the standard path.
		this.world.renderer.three.localClippingEnabled = true;
		this.world.camera = new OBC.OrthoPerspectiveCamera(this.components);
		void this.world.camera.controls.setLookAt(18, 14, 18, 0, 2, 0);

		// The SDK appends its canvas to the container at its own size. Take it out of flow so the
		// container's height never depends on canvas intrinsics (a 300x150 default otherwise wins).
		const canvas = this.world.renderer.three.domElement;
		canvas.style.position = "absolute";
		canvas.style.inset = "0";
		canvas.style.width = "100%";
		canvas.style.height = "100%";

		if (options.showLogo === false) this.world.renderer.showLogo = false;

		this.components.init();
		this.grid = this.components.get(OBC.Grids).create(this.world);

		this.fragments = this.components.get(OBC.FragmentsManager);
		this.fragments.init(options.workerUrl);

		// Fragments streams geometry against the camera, so every camera change needs an update.
		this.world.camera.controls.addEventListener("update", () => void this.fragments.core.update());

		// Report camera yaw so external chrome (e.g. the site minimap) can rotate to match the view.
		if (options.onHeadingChange) {
			const emitHeading = () => {
				const deg = THREE.MathUtils.radToDeg(this.world.camera.controls.azimuthAngle);
				// Skip sub-degree jitter; NaN on the first tick fails the check, so the initial heading fires.
				if (Math.abs(deg - this.lastHeadingDeg) < 0.5) return;
				this.lastHeadingDeg = deg;
				options.onHeadingChange?.(deg);
			};
			this.world.camera.controls.addEventListener("update", emitHeading);
			emitHeading();
		}
		this.world.onCameraChanged.add((camera: OBC.OrthoPerspectiveCamera) => {
			for (const [, model] of this.fragments.list) model.useCamera(camera.three);
			void this.fragments.core.update(true);
		});

		this.fragments.list.onItemSet.add(({value: model}) => {
			model.useCamera(this.world.camera.three);
			this.world.scene.three.add(model.object);
			// Without this the clipping planes never reach the model and Sections does nothing.
			model.getClippingPlanesEvent = () => Array.from(this.world.renderer?.three.clippingPlanes ?? []);
			void this.fragments.core.update(true);
			options.onModelsChange?.([...this.fragments.list.keys()]);
		});
		this.fragments.list.onItemDeleted.add(() => options.onModelsChange?.([...this.fragments.list.keys()]));

		// Coplanar faces z-fight badly in BIM models; a small polygon offset settles them.
		this.fragments.core.models.materials.list.onItemSet.add(({value: material}) => {
			if ("isLodMaterial" in material && material.isLodMaterial) return;
			material.polygonOffset = true;
			material.polygonOffsetUnits = 1;
			material.polygonOffsetFactor = 1;
		});

		this.components.get(OBC.Raycasters).get(this.world);
		this.highlighter = this.components.get(OBF.Highlighter);
		this.highlighter.setup({
			world: this.world,
			selectMaterialDefinition: {
				color: new THREE.Color(options.selectionColor ?? "#3b82f6"),
				opacity: 1,
				transparent: false,
				renderedFaces: 0,
			},
		});
		this.highlighter.multiple = "shiftKey";
		this.highlighter.events.select.onHighlight.add((map) => void this.publishSelection(map));
		// Floor-only mode never selects individual elements — disable the highlighter entirely and pick the
		// clicked floor with a direct GPU pick instead, so element selection never fights storey ghosting.
		if (options.selectFloorsOnly) {
			this.highlighter.enabled = false;
			this.picker = new OBC.FastModelPicker(this.components, this.world);
		}
		this.highlighter.events.select.onClear.add(() => {
			this.selection = {};
			options.onSelectionChange?.(null);
		});

		this.clipper = this.components.get(OBC.Clipper);
		this.clipper.enabled = true;
		// Re-clip whenever the plane set changes. clipper.create() resolves a frame later, so the
		// event — not a synchronous update after create() — is what guarantees the cut applies.
		const reclip = () => void this.fragments.core.update(true);
		this.clipper.onAfterCreate.add(reclip);
		this.clipper.onAfterDelete.add(reclip);
		this.clipper.onAfterDrag.add(reclip);
		// autoScalePlanes keeps the helper proportional to the camera, which on a tall model means it
		// grows to a scene-sized wall. Fix its size instead, and make the helper a faint tint so the
		// cut geometry — not the plane — is what you look at.
		this.clipper.autoScalePlanes = false;
		this.clipper.size = CLIPPER_PLANE_SIZE_M;
		this.clipper.material.opacity = 0.1;
		this.clipper.material.transparent = true;

		this.measurements = {
			length: this.components.get(OBF.LengthMeasurement),
			area: this.components.get(OBF.AreaMeasurement),
			angle: this.components.get(OBF.AngleMeasurement),
			volume: this.components.get(OBF.VolumeMeasurement),
		};
		for (const tool of Object.values(this.measurements)) {
			tool.world = this.world;
			tool.enabled = false;
		}
		this.measurements.length.snappings = [FRAGS.SnappingClass.POINT, FRAGS.SnappingClass.LINE];

		// A single click uses the armed tool. The SDK's own examples bind this to dblclick, but a
		// "Sections" button that appears to do nothing on click reads as broken — which is exactly the
		// feedback this got. Double-click still works, and a drag guard keeps orbiting from placing
		// planes by accident.
		container.addEventListener("pointerdown", this.onPointerDown);
		container.addEventListener("pointerup", this.onPointerUp);
		container.addEventListener("dblclick", this.onDoubleClick);
		window.addEventListener("keydown", this.onKeyDown);

		// The SDK sizes its renderer once, from the container as it was at construction. In a flex
		// layout that is often before the browser has settled the final height, leaving a canvas
		// stuck at its initial size in the corner. Track the container instead.
		this.resizeObserver = new ResizeObserver(this.resize);
		this.resizeObserver.observe(container);
	}

	// ─── Models ────────────────────────────────────────────────────────────────

	/** Fetch and display a `.frag`, then frame everything loaded. */
	async load(src: string, modelId: string): Promise<void> {
		this.ensureActive();
		this.options.onStatusChange?.("loading");
		try {
			const response = await fetch(src);
			if (!response.ok) throw new Error(`${response.status} ${response.statusText} — ${src}`);
			const buffer = await response.arrayBuffer();
			if (this.disposed) return;
			await this.fragments.core.load(buffer, {modelId});
			if (this.disposed) return;
			this.groundGrid();
			await this.fit();
			this.options.onStatusChange?.("ready");
		} catch (error) {
			if (this.disposed) return;
			this.options.onStatusChange?.("error", error instanceof Error ? error : new Error(String(error)));
		}
	}

	async unload(modelId: string): Promise<void> {
		await this.fragments.core.disposeModel(modelId);
		await this.fragments.core.update(true);
	}

	get modelIds(): string[] {
		return [...this.fragments.list.keys()];
	}

	// ─── Navigation ────────────────────────────────────────────────────────────

	/** Frame the loaded models — or, when `fitCategories` is set, only the elements in those categories
	 * (e.g. the building shell), so stray/site geometry doesn't zoom the camera out. */
	async fit(): Promise<void> {
		if (this.fragments.list.size === 0) return;
		const box = (await this.categoryBox(this.options.fitCategories)) ?? this.wholeModelBox();
		if (box.isEmpty()) return;
		const sphere = new THREE.Sphere();
		box.getBoundingSphere(sphere);
		const factor = this.options.fitFactor ?? 1;
		if (factor > 0 && factor !== 1) sphere.radius *= factor;
		await this.world.camera.controls.fitToSphere(sphere, this.options.fitAnimation ?? true);
		await this.fragments.core.update(true);
	}

	/**
	 * Sit the ground grid at the base of the loaded geometry instead of world Y=0.
	 *
	 * The grid is created at Y=0, but nothing guarantees a model's ground floor lives there: this
	 * building is authored with its origin up near the penthouse, so the whole tower hangs *below*
	 * Y=0 and the grid slices through the top floor. Snapping the grid to the model's own min-Y drops
	 * the reference plane back under the ground floor, where "the ground" belongs. Only the grid moves,
	 * so every coordinate the rest of the viewport works in (storeys, markers, sections) is untouched.
	 */
	private groundGrid(): void {
		const box = this.wholeModelBox();
		if (box.isEmpty()) return;
		this.grid.three.position.y = box.min.y;
	}

	/** Bounding box of all loaded geometry. */
	private wholeModelBox(): THREE.Box3 {
		const boxer = this.components.get(OBC.BoundingBoxer);
		boxer.list.clear();
		boxer.addFromModels();
		const box = boxer.get();
		boxer.list.clear();
		return box;
	}

	/** Union of the bounding boxes of the given categories across every model, or null if none matched
	 * (so the caller falls back to the whole model). */
	private async categoryBox(patterns?: RegExp[]): Promise<THREE.Box3 | null> {
		if (!patterns || patterns.length === 0) return null;
		const union = new THREE.Box3();
		union.makeEmpty();
		let matched = false;
		for (const [, model] of this.fragments.list) {
			const items = await model.getItemsOfCategories(patterns);
			const ids = Object.values(items).flat();
			if (ids.length === 0) continue;
			for (const box of await model.getBoxes(ids)) {
				union.union(box);
				matched = true;
			}
		}
		return matched ? union : null;
	}

	setNavigation(mode: NavigationMode): void {
		this.world.camera.set("Orbit");
		this.setLeftDrag(mode === "Pan" ? "truck" : "rotate");
	}

	/**
	 * Swap what a left-drag does. camera-controls exposes its action enum as a static on the class;
	 * read it off the instance's constructor rather than importing camera-controls directly, which
	 * would add a dependency purely for two constants.
	 */
	private setLeftDrag(action: "rotate" | "truck"): void {
		const controls = this.world.camera.controls;
		const actions = (controls.constructor as unknown as {ACTION?: Record<string, unknown>}).ACTION;
		if (!actions) return;
		const next = action === "truck" ? actions.TRUCK : actions.ROTATE;
		controls.mouseButtons.left = next as typeof controls.mouseButtons.left;
	}

	// ─── Cinematic mode ──────────────────────────────────────────────────────

	/**
	 * Toggle cinematic mode (sun cast-shadows + ambient occlusion + bloom + volumetric beams + ACES tone
	 * mapping) and return the state now active.
	 *
	 * Full navigation stays live while on — orbit, pan and zoom — so you can turn the model in the light.
	 * Turning it off restores every renderer/scene mutation and frees all GPU resources, so it costs
	 * nothing (memory or frame time) while off.
	 */
	setCinematic(enabled: boolean): boolean {
		if (enabled) {
			this.cinematic ??= new Cinematic(this.world);
			const box = this.wholeModelBox();
			this.cinematic.enable(box.isEmpty() ? null : box, this.grid.three);
		} else {
			this.cinematic?.disable();
		}
		return this.cinematic?.active ?? false;
	}

	get cinematicActive(): boolean {
		return this.cinematic?.active ?? false;
	}

	/** Swap perspective <-> orthographic and return the mode now active. */
	async toggleProjection(): Promise<ProjectionMode> {
		await this.world.camera.projection.toggle();
		this.world.renderer?.postproduction.updateCamera();
		return this.world.camera.projection.current as ProjectionMode;
	}

	get projection(): ProjectionMode {
		return this.world.camera.projection.current as ProjectionMode;
	}

	// ─── Sections and measurements ─────────────────────────────────────────────

	/**
	 * Choose what a double-click does: place a clipping plane, start a measurement, or nothing
	 * (leaving clicks to selection). Only one at a time, mirroring the toolbar's radio behaviour.
	 */
	setInteraction(mode: InteractionMode): void {
		this.interaction = mode;
		// Otherwise a click both places a section and re-selects whatever is behind it.
		this.highlighter.enabled = mode === null;
		for (const [kind, tool] of Object.entries(this.measurements)) {
			tool.enabled = mode !== null && mode !== "section" && kind === mode;
		}
	}

	get interactionMode(): InteractionMode {
		return this.interaction;
	}

	/** Enable/disable existing planes without deleting them; returns the state now active. */
	toggleClipping(): boolean {
		this.clippingEnabled = !this.clippingEnabled;
		for (const [, plane] of this.clipper.list) plane.enabled = this.clippingEnabled;
		return this.clippingEnabled;
	}

	clearSections(): void {
		this.clipper.deleteAll();
	}

	clearMeasurements(): void {
		for (const tool of Object.values(this.measurements)) tool.list.clear();
	}

	// ─── Appearance ────────────────────────────────────────────────────────────

	async hideSelection(): Promise<void> {
		await this.components.get(OBC.Hider).set(false, this.selection);
		await this.highlighter.clear();
		await this.fragments.core.update(true);
	}

	async isolateSelection(): Promise<void> {
		await this.components.get(OBC.Hider).isolate(this.selection);
		await this.fragments.core.update(true);
	}

	/**
	 * Restore everything: un-hide every element and leave any open storey view.
	 *
	 * Both halves are needed. `Hider.set(true)` alone leaves an open storey still filtering the model,
	 * so the user clicks "Show all" and still sees one floor; closing the view alone leaves anything
	 * hidden or isolated by hand still hidden.
	 */
	async showAll(): Promise<void> {
		await this.components.get(OBC.Hider).set(true);
		await this.fragments.core.update(true);
	}

	get ghost(): boolean {
		return this.originalMaterials.size > 0;
	}

	/**
	 * Fade the whole model to translucent glass so selections, sections and markers read through it —
	 * "ghost mode" in every BIM viewer. Two parts matter for it to look clean rather than a wall of
	 * white lines:
	 *
	 *  - The postproduction edge pass is turned off. It outlines every element, and over faded
	 *    geometry those crisp edges stack into the bright white grid you would otherwise see.
	 *  - Faces fade to a cool grey, not pure white, and don't write depth — so you see *through* the
	 *    building to a soft translucent shell, the way BIMCamel and the SDK's own ghost look.
	 */
	async setGhost(enabled: boolean): Promise<void> {
		if (enabled === this.ghost) return;
		const post = this.world.renderer?.postproduction;
		if (enabled) {
			// Drop to the COLOR aspect: no pen/edge pass, no shadows. That removes the crisp outlines
			// which, over faded geometry, stack into a wall of white lines. Toggling postproduction
			// off entirely instead throws "Base pass not initialized", so switch the style, not enabled.
			this.ghostStyle = post?.style ?? null;
			if (post) post.style = OBF.PostproductionAspect.COLOR;
			for (const material of this.fragments.core.models.materials.list.values()) {
				if (material.userData.customId) continue;
				const isLod = !("color" in material);
				const color = isLod ? material.lodColor.getHex() : material.color.getHex();
				this.originalMaterials.set(material, {
					color,
					transparent: material.transparent,
					opacity: material.opacity,
					depthWrite: material.depthWrite,
				});
				material.transparent = true;
				material.opacity = isLod ? 0.06 : 0.12;
				// A translucent material still writes depth by default, so the ghosted building keeps
				// hiding everything behind it — including the markers ghost mode exists to reveal.
				material.depthWrite = false;
				if (isLod) material.lodColor.setHex(GHOST_LINE_COLOR);
				else material.color.setHex(GHOST_FACE_COLOR);
				material.needsUpdate = true;
			}
		} else {
			if (post && this.ghostStyle !== null) post.style = this.ghostStyle;
			for (const [material, original] of this.originalMaterials) {
				material.transparent = original.transparent;
				material.opacity = original.opacity;
				material.depthWrite = original.depthWrite;
				if ("color" in material) material.color.setHex(original.color);
				else material.lodColor.setHex(original.color);
				material.needsUpdate = true;
			}
			this.originalMaterials.clear();
		}
		await this.fragments.core.update(true);
	}

	setPostproduction(enabled: boolean): void {
		if (this.world.renderer) this.world.renderer.postproduction.enabled = enabled;
	}

	// ─── Markers ───────────────────────────────────────────────────────────────

	/**
	 * Draw point markers in the model. One InstancedMesh for the whole set: thousands of separate
	 * meshes would be thousands of draw calls and would stall the frame, while instancing draws them
	 * all in one and scales to tens of thousands.
	 *
	 * Radius defaults to a fraction of the model's diagonal, so markers read at a sensible size
	 * whether the model is a villa or a city block, and regardless of the file's units.
	 */
	setMarkers(markers: FragmentMarker[], options: {radius?: number; color?: string; occluded?: boolean} = {}): void {
		const radius = options.radius ?? this.defaultMarkerRadius();
		const occluded = options.occluded === true;

		// Reuse the existing InstancedMesh when we can — only the drawn instance count and their
		// transforms/colours change. Tearing it down and rebuilding it every floor switch is what made
		// the markers flicker; a persistent mesh just re-writes its instances in place.
		const reusable =
			this.markers !== null &&
			markers.length <= this.markerCapacity &&
			radius === this.markerRadius &&
			occluded === this.markerOccluded;

		if (!reusable) {
			this.clearMarkers();
			if (markers.length === 0) return;
			const geometry = createHelmetGeometry(radius);
			const material = new THREE.MeshLambertMaterial();
			// The helmet is a revolved (single-sided) surface — draw both faces so it reads from any angle.
			material.side = THREE.DoubleSide;
			// Markers must be cut by section planes too, or they float in front of a sectioned model.
			material.clippingPlanes = this.world.renderer?.three.clippingPlanes ?? null;
			// By default markers read through the building, like pins on a map.
			if (!occluded) {
				material.depthTest = false;
				material.transparent = false;
			}
			const capacity = Math.max(1, markers.length);
			const mesh = new THREE.InstancedMesh(geometry, material, capacity);
			mesh.renderOrder = occluded ? 0 : 999;
			mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
			// Excluded from raycasts the SDK runs over world meshes, so markers never block model picking.
			mesh.raycast = () => {};
			this.world.scene.three.add(mesh);
			this.markers = mesh;
			this.markerCapacity = capacity;
			this.markerRadius = radius;
			this.markerOccluded = occluded;
		}

		const mesh = this.markers;
		if (!mesh) return;
		if (markers.length === 0) {
			mesh.count = 0;
			mesh.instanceMatrix.needsUpdate = true;
			this.markerIds = [];
			return;
		}

		const matrix = new THREE.Matrix4();
		const color = new THREE.Color();
		const fallback = options.color ?? "#f59e0b";
		markers.forEach((marker, index) => {
			matrix.setPosition(marker.position[0], marker.position[1], marker.position[2]);
			mesh.setMatrixAt(index, matrix);
			mesh.setColorAt(index, color.set(marker.color ?? fallback));
		});
		mesh.count = markers.length;
		mesh.instanceMatrix.needsUpdate = true;
		if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		this.markerIds = markers.map((marker) => marker.id);
	}

	clearMarkers(): void {
		if (!this.markers) return;
		this.world.scene.three.remove(this.markers);
		this.markers.geometry.dispose();
		(this.markers.material as THREE.Material).dispose();
		this.markers.dispose();
		this.markers = null;
		this.markerCapacity = 0;
		this.markerRadius = 0;
		this.markerOccluded = false;
		this.markerIds = [];
	}

	get markerCount(): number {
		return this.markerIds.length;
	}

	/** ~1/300th of the model diagonal: about 0.5 m on a 150 m building, which reads as a person. */
	private defaultMarkerRadius(): number {
		const boxer = this.components.get(OBC.BoundingBoxer);
		boxer.list.clear();
		boxer.addFromModels();
		const box = boxer.get();
		boxer.list.clear();
		if (box.isEmpty()) return 0.5;
		const size = box.getSize(new THREE.Vector3());
		return Math.max(0.15, size.length() / 300);
	}

	// ─── Levels ────────────────────────────────────────────────────────────────

	/**
	 * Storeys from the IFC spatial structure. We don\'t use the SDK\'s storey plan-views: they cut a thin
	 * horizontal slab that, on a multi-storey tower, lands between floors and shows nothing. Instead a
	 * level is shown by ghosting every element not tagged to that storey (see `ensureElementStoreys`),
	 * which keeps the 3D view. The elevation bands built here are kept only for the known-storey guard in
	 * `openStorey` and the storey elevation metadata returned below.
	 */
	async storeys(): Promise<FragmentStorey[]> {
		this.elementStoreys = null; // bands are about to be recomputed; drop the stale assignment
		const views = this.components.get(OBC.Views);
		views.world = this.world;
		const created = await views.createFromIfcStoreys();

		const elevationOf = (view: (typeof created)[number]) => {
			const {normal, constant} = view.plane;
			return Math.abs(normal.y) > 1e-6 ? -constant / normal.y : 0;
		};
		const sorted = created
			.map((view) => ({id: view.id, elevation: elevationOf(view)}))
			.sort((a, b) => a.elevation - b.elevation);

		// Each storey spans from its floor up to the next floor. Give the top storey the median height.
		const gaps = sorted
			.slice(1)
			.map((s, i) => s.elevation - sorted[i].elevation)
			.filter((g) => g > 0.5);
		const medianGap = gaps.length ? [...gaps].sort((a, b) => a - b)[gaps.length >> 1] : 4;
		this.storeyBands = new Map(
			sorted.map((storey, index) => {
				const top = index + 1 < sorted.length ? sorted[index + 1].elevation : storey.elevation + medianGap;
				// A small skirt below the floor catches slabs and skirtings modelled just under it.
				return [storey.id, {min: storey.elevation - 0.5, max: top - 0.1}];
			}),
		);

		return sorted.map((storey) => ({id: storey.id, name: storey.id, elevation: storey.elevation}));
	}

	/** The whole model's world-space bounding box, as plain arrays (null if nothing is loaded). */
	bounds(): {min: [number, number, number]; max: [number, number, number]} | null {
		if (this.fragments.list.size === 0) return null;
		const boxer = this.components.get(OBC.BoundingBoxer);
		boxer.list.clear();
		boxer.addFromModels();
		const box = boxer.get();
		boxer.list.clear();
		if (box.isEmpty()) return null;
		return {
			min: [box.min.x, box.min.y, box.min.z],
			max: [box.max.x, box.max.y, box.max.z],
		};
	}

	/**
	 * Emphasise one storey: keep its elements in their real materials and fade every other storey to
	 * translucent grey, so the level reads in context rather than floating alone. Done with a
	 * per-element highlight on the *other* storeys — a material swap wouldn't work, because Fragments
	 * materials are shared across storeys, so fading one fades all.
	 */
	async openStorey(id: string): Promise<void> {
		if (!this.storeyBands.has(id)) return;
		const assign = await this.ensureElementStoreys();

		// The elements to ghost for this floor = everything not on it; the in-band set frames the camera.
		const nextGhost: OBC.ModelIdMap = {};
		const inBand: OBC.ModelIdMap = {};
		for (const [modelId, perId] of assign) {
			const g = new Set<number>();
			const within = new Set<number>();
			for (const [localId, sid] of perId) {
				if (sid === id) within.add(localId);
				else g.add(localId);
			}
			if (g.size) nextGhost[modelId] = g;
			if (within.size) inBand[modelId] = within;
		}

		// Freeze the frame while we swap highlights so no half-applied state is ever drawn. Disabling the
		// renderer (not Components) keeps the main loop alive, so it resumes cleanly afterwards.
		const renderer = this.world.renderer;
		const wasRendering = renderer ? renderer.enabled : true;
		if (renderer) renderer.enabled = false;
		try {
			// Apply only the DELTA so the building never flashes fully solid on a floor→floor switch: add
			// the newly-ghosted elements, then un-ghost the ones now on the selected floor.
			for (const [modelId, model] of this.fragments.list) {
				const cur = this.ghostedStorey[modelId] ?? new Set<number>();
				const nxt = nextGhost[modelId] ?? new Set<number>();
				const toAdd: number[] = [];
				for (const localId of nxt) if (!cur.has(localId)) toAdd.push(localId);
				const toClear: number[] = [];
				for (const localId of cur) if (!nxt.has(localId)) toClear.push(localId);
				if (toAdd.length) await model.highlight(toAdd, STOREY_GHOST_MATERIAL);
				if (toClear.length) await model.resetHighlight(toClear);
			}
			this.ghostedStorey = nextGhost;
			await this.fragments.core.update(true);
		} finally {
			if (renderer) renderer.enabled = wasRendering;
		}

		// Frame the selected level (world-space box; getBoxes is model-local).
		if (Object.keys(inBand).length) {
			const boxer = this.components.get(OBC.BoundingBoxer);
			boxer.list.clear();
			await boxer.addFromModelIdMap(inBand);
			const box = boxer.get();
			boxer.list.clear();
			if (!box.isEmpty()) {
				const sphere = box.getBoundingSphere(new THREE.Sphere());
				await this.world.camera.controls.fitToSphere(sphere, true);
			}
		}
	}

	async closeStorey(): Promise<void> {
		await this.resetStoreyGhost();
		await this.fragments.core.update(true);
		// Re-frame the whole model so leaving a level returns to a sensible view.
		await this.fit();
	}

	/**
	 * Assign every element to a storey from the model's real IFC spatial structure — the
	 * `IfcRelContainedInSpatialStructure` tags surfaced by the Classifier's `byIfcBuildingStorey`,
	 * grouped by storey name (the same key `openStorey`/`storeyBands` use). Cached once; reused by the
	 * ghosting delta and the per-storey footprints.
	 *
	 * We read the authored floor tags rather than guessing each element's storey from its centre
	 * elevation: band-guessing breaks when the model's origin is offset from world Y=0 (this villa hangs
	 * ~12.8 m below it), so the element boxes and the storey planes land in different frames, nothing
	 * falls in a band, and every floor click ended up un-ghosted.
	 */
	private async ensureElementStoreys(): Promise<Map<string, Map<number, string>>> {
		if (this.elementStoreys) return this.elementStoreys;
		// Prefer the authored IFC floor tags. Fall back to geometric elevation bands only when the model
		// carries no storey-containment relation (older/near-origin models), so those don't regress.
		const tagged = await this.storeysFromIfcTags();
		this.elementStoreys = tagged.size ? tagged : await this.storeysFromElevationBands();
		return this.elementStoreys;
	}

	/** Group every element by its containing IFCBUILDINGSTOREY (the `ContainsElements` relation),
	 *  keyed by the storey's Name — the same key `openStorey`/`storeyBands` use. Empty when the model has
	 *  no such relation. */
	private async storeysFromIfcTags(): Promise<Map<string, Map<number, string>>> {
		const classifier = this.components.get(OBC.Classifier);
		await classifier.byIfcBuildingStorey();
		const cache = new Map<string, Map<number, string>>();
		const groups = classifier.list.get("Storeys");
		if (!groups) return cache;
		for (const [storeyName, group] of groups) {
			for (const [modelId, localIds] of Object.entries(group.map)) {
				let perId = cache.get(modelId);
				if (!perId) {
					perId = new Map<number, string>();
					cache.set(modelId, perId);
				}
				for (const localId of localIds) perId.set(localId, storeyName);
			}
		}
		return cache;
	}

	/** Fallback assignment: bucket each element into a storey by its centre elevation. Only correct when
	 *  the model geometry shares the frame of the storey planes (origin near world Y=0). */
	private async storeysFromElevationBands(): Promise<Map<string, Map<number, string>>> {
		const cache = new Map<string, Map<number, string>>();
		for (const [modelId, model] of this.fragments.list) {
			const ids = await model.getLocalIds();
			if (!ids?.length) continue;
			const boxes = await model.getBoxes(ids);
			const perId = new Map<number, string>();
			ids.forEach((localId, index) => {
				const box = boxes[index];
				if (!box) return;
				const centreY = (box.min.y + box.max.y) / 2;
				for (const [sid, band] of this.storeyBands) {
					if (centreY >= band.min && centreY < band.max) {
						perId.set(localId, sid);
						break;
					}
				}
			});
			cache.set(modelId, perId);
		}
		return cache;
	}

	/**
	 * The world-space bounding box of each storey's own elements — the real footprint and height of
	 * every floor. Lets callers place things *inside* a level (e.g. worker markers) rather than across
	 * the whole building.
	 */
	async storeyFootprints(): Promise<Record<string, {min: [number, number, number]; max: [number, number, number]}>> {
		const assign = await this.ensureElementStoreys();
		const byStorey = new Map<string, OBC.ModelIdMap>();
		for (const [modelId, perId] of assign) {
			for (const [localId, sid] of perId) {
				let map = byStorey.get(sid);
				if (!map) {
					map = {};
					byStorey.set(sid, map);
				}
				(map[modelId] ??= new Set<number>()).add(localId);
			}
		}

		const result: Record<string, {min: [number, number, number]; max: [number, number, number]}> = {};
		const boxer = this.components.get(OBC.BoundingBoxer);
		for (const [sid, map] of byStorey) {
			boxer.list.clear();
			await boxer.addFromModelIdMap(map);
			const box = boxer.get();
			boxer.list.clear();
			if (!box.isEmpty()) {
				result[sid] = {
					min: [box.min.x, box.min.y, box.min.z],
					max: [box.max.x, box.max.y, box.max.z],
				};
			}
		}
		return result;
	}

	/** Clear the fade applied to non-selected storeys. */
	private async resetStoreyGhost(): Promise<void> {
		for (const [modelId, ids] of Object.entries(this.ghostedStorey)) {
			const model = this.fragments.list.get(modelId);
			if (model && ids.size) await model.resetHighlight([...ids]);
		}
		this.ghostedStorey = {};
	}

	// ─── Internals ─────────────────────────────────────────────────────────────

	/**
	 * Floor-only picking: GPU-pick the element under the pointer, resolve its storey, and report it so the
	 * host isolates that floor. Runs off the highlighter entirely, so element selection never fights the
	 * storey ghosting (which is what made floor→floor switching invert).
	 */
	private async pickFloorAtPointer(): Promise<void> {
		if (!this.picker) return;
		const hit = await this.picker.getItemAt();
		if (this.disposed || !hit) return;
		const assign = await this.ensureElementStoreys();
		const storeyId = assign.get(hit.modelId)?.get(hit.localId);
		if (storeyId) this.options.onStoreyPick?.(storeyId);
	}

	private async publishSelection(map: OBC.ModelIdMap): Promise<void> {
		this.selection = map;
		const itemCount = Object.values(map).reduce((sum, ids) => sum + ids.size, 0);
		const batches = await Promise.all(
			Object.entries(map).map(async ([modelId, localIds]) => {
				const model = this.fragments.list.get(modelId);
				return model ? model.getItemsData([...localIds]) : [];
			}),
		);
		if (this.disposed) return;
		const data = batches.flat();
		const first = data[0] as {_category?: {value?: string}; _guid?: {value?: string}} | undefined;
		this.options.onSelectionChange?.({
			itemCount,
			category: first?._category?.value ?? null,
			guid: first?._guid?.value ?? null,
			data,
		});
	}

	private readonly resize = (): void => {
		if (this.disposed) return;
		this.world.renderer?.resize();
		this.world.camera.updateAspect();
		this.cinematic?.resize();
	};

	private pointerDownAt: {x: number; y: number} | null = null;

	private readonly onPointerDown = (event: PointerEvent): void => {
		this.pointerDownAt = {x: event.clientX, y: event.clientY};
	};

	private readonly onPointerUp = (event: PointerEvent): void => {
		const start = this.pointerDownAt;
		this.pointerDownAt = null;
		if (!start) return;
		// Anything past a few pixels was a camera drag, not a click.
		if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_TOLERANCE_PX) return;
		if (this.options.selectFloorsOnly) {
			void this.pickFloorAtPointer();
			return;
		}
		if (this.interaction) this.useArmedTool();
	};

	private readonly onDoubleClick = (): void => {
		// Measurements chain points, so a double-click legitimately adds one more; sections would
		// otherwise place a second coincident plane, so only measurements act here.
		if (this.interaction && this.interaction !== "section") this.useArmedTool();
	};

	private useArmedTool(): void {
		if (this.disposed) return;
		if (this.interaction === "section") {
			void this.clipper.create(this.world);
			// A newly placed plane doesn't move the camera, so nothing triggers the Fragments update
			// that pushes the clip into the shader — force one. Without this the plane helper appears
			// but the geometry stays whole, which is exactly how "sections isn't working" looked.
			void this.fragments.core.update(true);
		} else if (this.interaction) void this.measurements[this.interaction].create();
	}

	private readonly onKeyDown = (event: KeyboardEvent): void => {
		if (event.code !== "Delete" && event.code !== "Backspace") return;
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
		if (this.interaction && this.interaction !== "section") void this.measurements[this.interaction].delete();
		else void this.clipper.delete(this.world);
	};

	private ensureActive(): void {
		if (this.disposed) throw new Error("FragmentViewport has been disposed");
	}

	/** Release the WebGL context and every listener. Must run on unmount or contexts leak. */
	async dispose(): Promise<void> {
		if (this.disposed) return;
		this.disposed = true;
		this.resizeObserver.disconnect();
		this.clearMarkers();
		this.cinematic?.dispose();
		this.container.removeEventListener("pointerdown", this.onPointerDown);
		this.container.removeEventListener("pointerup", this.onPointerUp);
		this.container.removeEventListener("dblclick", this.onDoubleClick);
		window.removeEventListener("keydown", this.onKeyDown);
		this.components.dispose();
	}
}
