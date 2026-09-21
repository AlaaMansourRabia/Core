// Headless projected-footprints-on-reality-mesh viewer (no built-in UI). Streams the DroneDeploy reality
// mesh (Cesium 3D Tiles) and paints every villa's ground footprint straight DOWN onto the mesh surface,
// coloured by construction progress — a "progress light from above". There is NO IFC fragment: 684 villa
// outline polygons (~180 KB `footprints.json`) are rasterised into one canvas texture and projected onto the
// tiles in world space via an onBeforeCompile shader; recolouring is a single texture redraw.
//
// Identity is the villa code `${model}-${roshnPlotNumber}` (e.g. "VL6-1901"); every hover/select callback
// returns it, and `getVillaRecord(code)` returns its zone/batch/progress. Adapted from the
// embed-projected-footprints handoff reference; the DOM panel/tooltip are removed and hover/select are routed
// through callbacks. A few parity helpers (setMeshVisible / setModelVisible / setModelOpacity /
// setColourMode / setLabelsVisible / fitVilla) are added so the existing host UI can drive it unchanged.
import {TilesRenderer} from "3d-tiles-renderer";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export type ColorMode = "progress" | "off";

export interface VillaRecord {
	code: string;
	zone?: string; // "1A" | "1B" — from progress JSON (neighbourhood)
	batch?: string; // "10"        — from progress JSON (batchNumber)
	block?: string;
	actual?: number;
	planned?: number;
	variance?: number;
	color: string; // milestone hex, or the grey UNASSIGNED fallback
	contractor?: string;
	model?: string;
	plot?: string;
	unitType?: string;
	typology?: string;
}

export interface FootprintViewerOptions {
	tilesetUrl?: string; // default "/reality-mesh/capture2/mesh_3d/tileset.json"
	dracoPath?: string; // default "/reality-mesh/draco/gltf/"
	workerUrl?: string; // default "/worker.mjs"
	footprintsUrl?: string; // default "/footprints.json"
	progressUrls?: string[]; // default ["/house-progress.json", "/house-progress-IMA.json"]
	meshOpacity?: number; // default 0.85
	projectionStrength?: number; // default 0.85
	colorMode?: ColorMode; // default "progress"
	transparent?: boolean; // clear with alpha 0 so the host can place its own image/backdrop behind the canvas
	onReady?: (v: FootprintViewer) => void;
	onHover?: (code: string | null) => void; // villa code under the cursor
	onSelect?: (code: string | null) => void; // villa code clicked / selected
	// Called each frame with how the host's backdrop image should render for the current camera: opacity 1→0
	// and blur growing as you zoom in (and fading on tilt/rotate), scale tracking the zoom.
	onBackdrop?: (s: {opacity: number; blurPx: number; scale: number}) => void;
}

export interface FootprintViewer {
	setMeshOpacity(op: number): void; // 0..1
	setProjectionStrength(s: number): void; // 0..1 — footprint colour blend on the mesh
	setColorMode(mode: ColorMode): void; // "progress" paints footprints, "off" hides them
	setVillaColours(map: Record<string, string>): void; // villa code -> hex; live recolour
	setVisibleVillas(codes: string[] | null): void; // only these codes paint their footprint; null = all (no filter)
	getVillaCodes(): string[];
	getVillaRecord(code: string): VillaRecord | null; // zone/batch/actual/… by code
	selectVilla(code: string | null): void; // programmatic select
	getSelectedVilla(): string | null;
	fitAll(): Promise<void>;
	fitVilla(code: string): Promise<void>; // frame a single villa (6× its footprint box)
	resetView(animate?: boolean): Promise<void>; // return to the canonical open pose (call on opening Reality)
	setView(
		pose: {elevationDeg?: number; azimuthDeg?: number; zoom?: number; panX?: number; panZ?: number},
		animate?: boolean,
	): Promise<void>;
	getZoomFactor(): number; // 1 ≈ whole-site fit; higher = more zoomed in (a single villa framing is ≈8–10)
	isZoomedIn(): boolean; // true once the camera is meaningfully closer than the default open distance
	zoomIn(): void; // dolly the camera closer (toolbar +)
	zoomOut(): void; // dolly the camera further (toolbar −)
	setInteractionMode(mode: "orbit" | "pan"): void; // left-drag = rotate vs pan
	topDownView(): Promise<void>; // straight-down satellite view, fitted to the site
	getCameraPose(): {
		position: [number, number, number];
		target: [number, number, number];
		elevationDeg: number; // above the horizontal (90 = straight down)
		azimuthDeg: number;
		distance: number;
	};
	// Parity helpers so a host UI written against the old reality-mesh viewer drives this one unchanged:
	setMeshVisible(v: boolean): void;
	setModelVisible(v: boolean): void; // maps to colour mode (the footprint projection is the "model")
	setModelOpacity(op: number): void; // maps to projection strength
	setColourMode(mode: ColorMode | "material"): void; // "material" is treated as "off"
	setLabelsVisible(v: boolean): void; // master toggle for all LOD labels (Zone → Block → Villa by zoom)
	onHover?: (code: string | null) => void;
	onSelect?: (code: string | null) => void;
	dispose(): void;
}

// --- Fixed alignment (see handoff; do not change unless re-fitting the mesh) ---
const SEED = {offX: 512, offY: -560, scale: 3.29, rot: -170, zoff: 26.9};
const CENTER = {x: -452.29, z: 1069.75};
const FLOOR_Y = 0;
const UNASSIGNED = "#9ca3af";

// Canonical "open" camera pose — the 3/4 oblique the Reality view lands on every time it's opened.
// elevationDeg = degrees above the horizontal (90 = straight down), azimuthDeg = rotation around +Y,
// zoom = distance multiplier (1 ≈ frame the whole site). Tune with the dev sliders, then bake final values here.
export const OPEN_POSE = {elevationDeg: 42, azimuthDeg: 78, zoom: 0.95, panX: 0.14, panZ: 0.66};
// Level-of-detail labels keyed on `frac` = camera distance ÷ full-site fit distance (1 ≈ fully zoomed out to
// the site fit; smaller = more zoomed in). As you zoom IN the labels get finer: Zone → Block → Villa numbers.
// Zoom% ≈ 100×(1 − frac), so the bands below map to the requested ~20/50/80% hand-offs:
//   • BLOCK..ZONE (0.50 < frac ≤ 0.80)  → Zone labels  (~20–50% zoom) — one per zone, centred on its villas
//   • VILLA..BLOCK (0.20 < frac ≤ 0.50) → Block labels (~50–80% zoom) — one per block, centred on its villas
//   • frac ≤ LABEL_ZOOM_FRAC (0.20)     → per-villa number chips (~80%+ zoom)
// Lower a threshold to require MORE zoom before that tier appears.
const LABEL_ZOOM_FRAC = 0.2;
const BLOCK_LABEL_FRAC = 0.5;
const ZONE_LABEL_FRAC = 0.8;
// Plan-image backdrop behaviour as the camera moves (the host applies these to the <img>):
const BACKDROP_ZOOM_FADE = 0.3; // fully faded once zoomed in 30% closer than the open distance
const BACKDROP_ZOOMOUT_FADE = 0.1; // fully faded once zoomed out 10% further than the open distance
const BACKDROP_BASE_BLUR = 4; // px blur at the open pose
const BACKDROP_MAX_BLUR = 22; // px blur as the fade completes
const BACKDROP_TILT_FADE = 0.05; // fade to 0 once tilt/rotation deviates >5% of its range from the open pose

type Footprint = {z: string; p: [number, number][]};
type ProgressRec = {
	color?: string;
	actual?: number;
	planned?: number;
	variance?: number;
	label?: string;
	zone?: string;
	batch?: string;
	block?: string;
	contractor?: string;
	model?: string;
	plot?: string;
	unitType?: string;
	typology?: string;
};

export async function createFootprintViewer(
	container: HTMLElement,
	options: FootprintViewerOptions = {},
): Promise<FootprintViewer> {
	const o = {
		tilesetUrl: "/reality-mesh/capture2/mesh_3d/tileset.json",
		dracoPath: "/reality-mesh/draco/gltf/",
		workerUrl: "/worker.mjs",
		footprintsUrl: "/footprints.json",
		progressUrls: ["/house-progress.json", "/house-progress-IMA.json"],
		meshOpacity: 0.85,
		projectionStrength: 0.85,
		colorMode: "progress" as ColorMode,
		...options,
	};

	let meshOp = o.meshOpacity;
	let strength = o.projectionStrength;
	let colorMode: ColorMode = o.colorMode;

	// --- World (ThatOpen scene/camera/renderer; drives the render loop) --------
	const components = new OBC.Components();
	const world = components.get(OBC.Worlds).create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>();
	world.scene = new OBC.SimpleScene(components);
	world.scene.setup();
	// Transparent clear lets the host place an image (e.g. the plan backdrop) behind the canvas so it renders
	// exactly like the 2D plan image; otherwise a flat dark grey.
	world.scene.three.background = o.transparent ? null : new THREE.Color("#1a1d21");
	world.renderer = new OBC.SimpleRenderer(components, container);
	// Hide the ThatOpen logo the renderer injects into the container (a `data-thatopen-*` overlay div).
	world.renderer.showLogo = false;
	world.camera = new OBC.OrthoPerspectiveCamera(components);
	await world.camera.controls.setLookAt(12, 10, 12, 0, 0, 0);
	components.init();

	const gl = (world.renderer as OBC.SimpleRenderer).three;
	gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	if (o.transparent) gl.setClearColor(0x000000, 0); // see-through where nothing renders (host draws the backdrop)

	// Zoom out over the ~1.8 km site without clipping.
	const FAR = 5_000_000;
	const MAX_DOLLY = 2_000_000;
	const raiseClip = () => {
		const cam = world.camera.three as THREE.PerspectiveCamera;
		if (cam.far !== FAR) {
			cam.far = FAR;
			cam.updateProjectionMatrix();
		}
		if (world.camera.controls.maxDistance !== MAX_DOLLY) world.camera.controls.maxDistance = MAX_DOLLY;
	};
	raiseClip();
	world.camera.controls.addEventListener("update", raiseClip);

	// Fragments worker only drives the render loop (no model is loaded).
	const workerResponse = await fetch(o.workerUrl);
	if (!workerResponse.ok) throw new Error("Fragments worker (/worker.mjs) not found.");
	const workerBlob = await workerResponse.blob();
	const workerUrl = URL.createObjectURL(new File([workerBlob], "worker.mjs", {type: "text/javascript"}));
	const fragments = components.get(OBC.FragmentsManager);
	fragments.init(workerUrl);
	world.camera.controls.addEventListener("update", () => fragments.core.update());

	// --- Footprints + progress (merge Zone A + Zone B into one code->record) ---
	const footRes = await fetch(o.footprintsUrl);
	if (!footRes.ok) throw new Error("Could not load footprints.json");
	const footprints = (await footRes.json()) as Record<string, Footprint>;
	const entries = Object.entries(footprints);

	const progress = new Map<string, ProgressRec>();
	await Promise.all(
		o.progressUrls.map(async (url) => {
			try {
				const res = await fetch(url);
				if (!res.ok) return;
				const doc = (await res.json()) as {houses: Record<string, ProgressRec>};
				for (const [code, rec] of Object.entries(doc.houses)) progress.set(code, rec);
			} catch {
				/* those villas fall back to UNASSIGNED grey */
			}
		}),
	);

	const overrideColours = new Map<string, string>();
	const colourFor = (code: string) => overrideColours.get(code) ?? progress.get(code)?.color ?? UNASSIGNED;

	// --- World XZ bbox of ALL footprints (+ margin) ----------------------------
	const MARGIN = 40;
	let minX = Infinity;
	let minZ = Infinity;
	let maxX = -Infinity;
	let maxZ = -Infinity;
	for (const [, fp] of entries)
		for (const [x, z] of fp.p) {
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (z < minZ) minZ = z;
			if (z > maxZ) maxZ = z;
		}
	minX -= MARGIN;
	minZ -= MARGIN;
	maxX += MARGIN;
	maxZ += MARGIN;
	const bw = maxX - minX;
	const bh = maxZ - minZ;

	// --- Rasterise footprints into an offscreen canvas texture -----------------
	// world XZ -> UV: u = (x-minX)/bw, v = (z-minZ)/bh; flipY=false so v=0 is the top canvas row (z=minZ),
	// matching the shader's uv.y = (worldZ-minZ)/bh.
	const MAXPX = 2048;
	const cw = bw >= bh ? MAXPX : Math.max(1, Math.round((MAXPX * bw) / bh));
	const ch = bw >= bh ? Math.max(1, Math.round((MAXPX * bh) / bw)) : MAXPX;
	const canvas = document.createElement("canvas");
	canvas.width = cw;
	canvas.height = ch;
	const ctx2d = canvas.getContext("2d");
	if (!ctx2d) throw new Error("Could not create 2D canvas context.");

	const brighten = (hex: string, amount = 0.45) =>
		`#${new THREE.Color(hex).lerp(new THREE.Color(1, 1, 1), amount).getHexString()}`;

	let hoverCode: string | null = null;
	let selectedCode: string | null = null;
	// Search/filter whitelist: when set, only these codes paint their footprint (the rest show bare mesh), so the
	// 3D view narrows to the same subset the 2D map + rail show. `null` = no filter (every footprint paints).
	let visibleCodes: Set<string> | null = null;
	function drawTexture() {
		ctx2d!.clearRect(0, 0, cw, ch);
		for (const [code, fp] of entries) {
			if (fp.p.length < 3) continue;
			if (visibleCodes && !visibleCodes.has(code)) continue;
			ctx2d!.beginPath();
			for (let i = 0; i < fp.p.length; i++) {
				const [x, z] = fp.p[i];
				const px = ((x - minX) / bw) * cw;
				const py = ((z - minZ) / bh) * ch;
				if (i === 0) ctx2d!.moveTo(px, py);
				else ctx2d!.lineTo(px, py);
			}
			ctx2d!.closePath();
			const base = colourFor(code);
			ctx2d!.fillStyle = code === hoverCode || code === selectedCode ? brighten(base) : base;
			ctx2d!.fill();
		}
	}
	drawTexture();

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.flipY = false;
	texture.needsUpdate = true;

	const projUniforms = {
		uMin: {value: new THREE.Vector2(minX, minZ)},
		uSize: {value: new THREE.Vector2(bw, bh)},
		uTex: {value: texture},
		uStrength: {value: colorMode === "off" ? 0 : strength},
	};
	const effectiveStrength = () => (colorMode === "off" ? 0 : strength);

	// Patch a streamed tile material to sample the projection texture from above.
	function patchMaterial(m: THREE.Material) {
		const mm = m as THREE.Material & {userData: {__fpPatched?: boolean}};
		if (mm.userData.__fpPatched) return;
		mm.userData.__fpPatched = true;
		m.onBeforeCompile = (shader) => {
			shader.uniforms.uMin = projUniforms.uMin;
			shader.uniforms.uSize = projUniforms.uSize;
			shader.uniforms.uTex = projUniforms.uTex;
			shader.uniforms.uStrength = projUniforms.uStrength;
			shader.vertexShader = "varying vec3 vWorldPos;\n" + shader.vertexShader;
			shader.vertexShader = shader.vertexShader.replace(
				"#include <begin_vertex>",
				"#include <begin_vertex>\n\tvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;",
			);
			shader.fragmentShader =
				"uniform vec2 uMin;\nuniform vec2 uSize;\nuniform sampler2D uTex;\nuniform float uStrength;\nvarying vec3 vWorldPos;\n" +
				shader.fragmentShader;
			shader.fragmentShader = shader.fragmentShader.replace(
				"#include <dithering_fragment>",
				"#include <dithering_fragment>\n" +
					"\tvec2 fpUv = (vWorldPos.xz - uMin) / uSize;\n" +
					"\tif (fpUv.x >= 0.0 && fpUv.x <= 1.0 && fpUv.y >= 0.0 && fpUv.y <= 1.0) {\n" +
					"\t\tvec4 fpCol = texture2D(uTex, fpUv);\n" +
					"\t\tgl_FragColor.rgb = mix(gl_FragColor.rgb, fpCol.rgb, fpCol.a * uStrength);\n" +
					"\t}",
			);
		};
		m.needsUpdate = true;
	}

	// --- Point-in-polygon index for hover/click picking ------------------------
	type Indexed = {code: string; poly: [number, number][]; minx: number; maxx: number; minz: number; maxz: number};
	const index: Indexed[] = [];
	for (const [code, fp] of entries) {
		if (fp.p.length < 3) continue;
		let ix = Infinity;
		let ax = -Infinity;
		let iz = Infinity;
		let az = -Infinity;
		for (const [x, z] of fp.p) {
			if (x < ix) ix = x;
			if (x > ax) ax = x;
			if (z < iz) iz = z;
			if (z > az) az = z;
		}
		index.push({code, poly: fp.p, minx: ix, maxx: ax, minz: iz, maxz: az});
	}
	function pointInPoly(x: number, z: number, poly: [number, number][]): boolean {
		let inside = false;
		for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			const xi = poly[i][0];
			const zi = poly[i][1];
			const xj = poly[j][0];
			const zj = poly[j][1];
			const hit = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
			if (hit) inside = !inside;
		}
		return inside;
	}
	function villaAt(x: number, z: number): string | null {
		for (const it of index) {
			if (x < it.minx || x > it.maxx || z < it.minz || z > it.maxz) continue;
			if (pointInPoly(x, z, it.poly)) return it.code;
		}
		return null;
	}

	// --- Camera frame on the footprint bbox ------------------------------------
	const fpBox = new THREE.Box3(new THREE.Vector3(minX, FLOOR_Y - 5, minZ), new THREE.Vector3(maxX, FLOOR_Y + 40, maxZ));
	async function fitAll() {
		await resetView(true);
	}
	// Distance that frames the whole site at a given zoom (1 ≈ fit). Derived from the footprint radius + fov;
	// NOT from fitToBox — fitToBox reorients a flat, wide box to straight-down, which is the top-down bug.
	function poseDistance(zoom: number) {
		const size = fpBox.getSize(new THREE.Vector3());
		const radius = Math.hypot(size.x, size.z) / 2 || 100;
		const vfov = (((world.camera.three as THREE.PerspectiveCamera).fov ?? 60) * Math.PI) / 180;
		return (radius / Math.tan(vfov / 2)) * zoom;
	}
	// Place the camera at (elevation, azimuth, distance) around a target and look at it — a pure setLookAt, so
	// the angle is exactly what we ask for and stays put (no fitToBox reorientation).
	async function applyPose(target: THREE.Vector3, elevDeg: number, azimDeg: number, dist: number, animate: boolean) {
		const elev = (elevDeg * Math.PI) / 180;
		const azim = (azimDeg * Math.PI) / 180;
		const dir = new THREE.Vector3(Math.cos(elev) * Math.sin(azim), Math.sin(elev), Math.cos(elev) * Math.cos(azim));
		await world.camera.controls.setLookAt(
			target.x + dir.x * dist,
			target.y + dir.y * dist,
			target.z + dir.z * dist,
			target.x,
			target.y,
			target.z,
			animate,
		);
	}
	// Current open pose (dev sliders drive this live via setView; resetView returns it to OPEN_POSE).
	let curElev = OPEN_POSE.elevationDeg;
	let curAzim = OPEN_POSE.azimuthDeg;
	let curZoom = OPEN_POSE.zoom;
	let curPanX = OPEN_POSE.panX ?? 0; // -1..1 fraction of the site half-width the target is offset by (X axis)
	let curPanZ = OPEN_POSE.panZ ?? 0; // -1..1 fraction of the site half-depth the target is offset by (Z axis)
	// The look-at target = site centre + the pan offset (so the sliders slide the framed point across the site).
	function poseTarget() {
		const c = fpBox.getCenter(new THREE.Vector3());
		const s = fpBox.getSize(new THREE.Vector3());
		c.x += curPanX * (s.x / 2);
		c.z += curPanZ * (s.z / 2);
		return c;
	}
	async function resetView(animate = true) {
		curElev = OPEN_POSE.elevationDeg;
		curAzim = OPEN_POSE.azimuthDeg;
		curZoom = OPEN_POSE.zoom;
		curPanX = OPEN_POSE.panX ?? 0;
		curPanZ = OPEN_POSE.panZ ?? 0;
		await applyPose(poseTarget(), curElev, curAzim, poseDistance(curZoom), animate);
	}
	async function setView(
		pose: {elevationDeg?: number; azimuthDeg?: number; zoom?: number; panX?: number; panZ?: number},
		animate = false,
	) {
		if (pose.elevationDeg != null) curElev = pose.elevationDeg;
		if (pose.azimuthDeg != null) curAzim = pose.azimuthDeg;
		if (pose.zoom != null) curZoom = pose.zoom;
		if (pose.panX != null) curPanX = pose.panX;
		if (pose.panZ != null) curPanZ = pose.panZ;
		await applyPose(poseTarget(), curElev, curAzim, poseDistance(curZoom), animate);
	}
	await resetView(false);

	// --- Reality mesh (DroneDeploy 3D Tiles, ECEF) -----------------------------
	const satGroup = new THREE.Group();
	const enuGroup = new THREE.Group();
	satGroup.add(enuGroup);
	world.scene.three.add(satGroup);

	const tiles = new TilesRenderer(o.tilesetUrl);
	tiles.errorTarget = 16;
	tiles.maxDepth = 7;
	tiles.lruCache.maxSize = 200;
	tiles.lruCache.minSize = 100;
	tiles.lruCache.maxBytesSize = 0.2 * 2 ** 30;
	tiles.lruCache.unloadPercent = 0.25;
	const draco = new DRACOLoader(tiles.manager);
	draco.setDecoderPath(o.dracoPath);
	const gltfLoader = new GLTFLoader(tiles.manager);
	gltfLoader.setDRACOLoader(draco);
	tiles.manager.addHandler(/\.(gltf|glb)$/i, gltfLoader);
	tiles.setCamera(world.camera.three);
	tiles.setResolutionFromRenderer(world.camera.three, gl);
	enuGroup.add(tiles.group);

	function styleTile(root: THREE.Object3D) {
		root.traverse((n) => {
			const mesh = n as THREE.Mesh;
			if (!mesh.isMesh) return;
			const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
			for (const m of mats) {
				if (!m) continue;
				m.transparent = meshOp < 1;
				(m as THREE.Material & {opacity: number}).opacity = meshOp;
				m.depthWrite = meshOp >= 1;
				patchMaterial(m);
				m.needsUpdate = true;
			}
		});
	}
	tiles.addEventListener("load-model", (e: {scene?: THREE.Object3D}) => {
		if (e.scene) styleTile(e.scene);
		fragments.core.update();
	});

	function applyMeshPlacement() {
		satGroup.position.set(CENTER.x + SEED.offX, FLOOR_Y - 0.05 + SEED.zoff, CENTER.z - SEED.offY);
		satGroup.scale.setScalar(SEED.scale);
		satGroup.rotation.y = (SEED.rot * Math.PI) / 180;
		tiles.group.traverse((n) => styleTile(n));
		projUniforms.uStrength.value = effectiveStrength();
		fragments.core.update();
	}

	let framed = false;
	tiles.addEventListener("load-tile-set", () => {
		const sphere = new THREE.Sphere();
		if (framed || !tiles.getBoundingSphere(sphere)) return;
		framed = true;
		tiles.group.position.copy(sphere.center).multiplyScalar(-1); // ECEF -> origin
		enuGroup.quaternion.setFromUnitVectors(sphere.center.clone().normalize(), new THREE.Vector3(0, 1, 0));
		applyMeshPlacement();
		// Frame the selected villa if one was carried in (e.g. Plan → Reality); otherwise the canonical open pose.
		// (Without this, a villa selected before the mesh finished streaming would get yanked back to the overview.)
		if (selectedCode) void api.fitVilla(selectedCode);
		else void resetView();
		api.onReady_?.();
	});
	world.renderer.onBeforeUpdate.add(() => {
		tiles.setResolutionFromRenderer(world.camera.three, gl);
		tiles.update();
	});

	// --- Pointer: raycast the mesh -> point-in-polygon -> villa code -----------
	const raycaster = new THREE.Raycaster();
	raycaster.far = FAR;
	const ndc = new THREE.Vector2();

	function codeAtClient(clientX: number, clientY: number): string | null {
		const rect = gl.domElement.getBoundingClientRect();
		ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
		ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(ndc, world.camera.three);
		const hits = raycaster.intersectObject(tiles.group, true);
		const pt = hits.length ? hits[0].point : null;
		return pt ? villaAt(pt.x, pt.z) : null;
	}

	function setHover(code: string | null) {
		if (code === hoverCode) return;
		hoverCode = code;
		drawTexture();
		texture.needsUpdate = true;
		fragments.core.update();
		api.onHover?.(code);
	}

	let hoverClient: {x: number; y: number} | null = null;
	let hoverRAF = 0;
	const onMove = (ev: MouseEvent) => {
		hoverClient = {x: ev.clientX, y: ev.clientY};
		if (!hoverRAF)
			hoverRAF = requestAnimationFrame(() => {
				hoverRAF = 0;
				if (!hoverClient) return;
				setHover(codeAtClient(hoverClient.x, hoverClient.y));
			});
	};
	const onLeave = () => {
		hoverClient = null;
		setHover(null);
	};
	const onClick = (ev: MouseEvent) => {
		api.selectVilla(codeAtClient(ev.clientX, ev.clientY));
	};
	container.addEventListener("mousemove", onMove);
	container.addEventListener("mouseleave", onLeave);
	container.addEventListener("click", onClick);

	// --- Villa-number labels (HTML chips over each footprint, matching the 2D chips) -----------------------
	// pointer-events:none so they never block orbit/hover/click. Each chip sits over its footprint centroid,
	// black by default and white when its villa is selected. These are the FINEST LOD tier — shown only once
	// zoomed in past LABEL_ZOOM_FRAC (coarser Zone/Block group labels take over further out; see below).
	let labelsVisible = true;
	const LABEL_Y = FLOOR_Y - 0.05 + SEED.zoff; // ≈ the mesh surface level, so chips sit on the villas
	const styleLabel = (el: HTMLDivElement, light: boolean) => {
		el.style.background = light ? "#ffffff" : "#000000";
		el.style.color = light ? "#111827" : "#ffffff";
	};
	// The one chip look — reused by villa numbers AND the Zone/Block group labels so every tier is identical.
	const CHIP_CSS =
		"padding:2px 6px;border-radius:5px;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,sans-serif;" +
		"white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.35)";
	const makeChip = (text: string) => {
		const el = document.createElement("div");
		el.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;will-change:transform";
		const inner = document.createElement("div");
		inner.textContent = text;
		inner.style.cssText = CHIP_CSS;
		styleLabel(inner, false);
		el.appendChild(inner);
		return {el, inner};
	};
	const labelEls = index.map((it) => {
		const {el, inner} = makeChip(it.code.split("-").pop() ?? it.code); // plot number only, like the 2D chips
		return {
			code: it.code,
			el,
			inner,
			center: new THREE.Vector3((it.minx + it.maxx) / 2, LABEL_Y, (it.minz + it.maxz) / 2),
		};
	});
	const labelLayer = document.createElement("div");
	labelLayer.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2";
	for (const L of labelEls) labelLayer.appendChild(L.el);
	container.appendChild(labelLayer);
	const restyleLabels = () => {
		for (const L of labelEls) styleLabel(L.inner, L.code === selectedCode);
	};

	// --- Grouping labels (Zone / Block) — one centred chip per group, shown at coarser zooms (see LABEL_FRACs).
	// Each chip sits at the centroid (mean footprint centre) of every villa in that group, resolved from the
	// progress records' zone/block fields (block numbering is global: Zone 1-A 01–28, Zone 1-B 29–68).
	type GroupLabel = {el: HTMLDivElement; center: THREE.Vector3};
	const makeGroupLabels = (keyOf: (rec: ProgressRec) => {key: string; text: string} | null): GroupLabel[] => {
		const groups = new Map<string, {text: string; sx: number; sz: number; n: number}>();
		for (const it of index) {
			const rec = progress.get(it.code);
			const info = rec ? keyOf(rec) : null;
			if (!info) continue;
			const cx = (it.minx + it.maxx) / 2;
			const cz = (it.minz + it.maxz) / 2;
			const g = groups.get(info.key) ?? {text: info.text, sx: 0, sz: 0, n: 0};
			g.sx += cx;
			g.sz += cz;
			g.n += 1;
			groups.set(info.key, g);
		}
		return [...groups.values()].map((g) => {
			const {el} = makeChip(g.text); // identical style to the villa number chips
			labelLayer.appendChild(el);
			return {el, center: new THREE.Vector3(g.sx / g.n, LABEL_Y, g.sz / g.n)};
		});
	};
	const zoneLabels = makeGroupLabels((rec) =>
		rec.zone ? {key: rec.zone, text: `Zone 1 - ${rec.zone.slice(1)}`} : null,
	);
	const blockLabels = makeGroupLabels((rec) =>
		rec.block ? {key: `${rec.zone}-${rec.block}`, text: `Block-${String(rec.block).padStart(2, "0")}`} : null,
	);

	const _labelTarget = new THREE.Vector3();
	const _proj = new THREE.Vector3();
	const placeLabel = (L: GroupLabel, show: boolean, cam: THREE.Camera, wpx: number, hpx: number) => {
		if (show) {
			_proj.copy(L.center).project(cam);
			show = _proj.z > -1 && _proj.z < 1 && Math.abs(_proj.x) < 1.15 && Math.abs(_proj.y) < 1.15;
		}
		if (!show) {
			if (L.el.style.visibility !== "hidden") L.el.style.visibility = "hidden";
			return;
		}
		L.el.style.visibility = "visible";
		L.el.style.transform = `translate(-50%,-50%) translate(${(_proj.x * 0.5 + 0.5) * wpx}px,${(-_proj.y * 0.5 + 0.5) * hpx}px)`;
	};
	function updateLabels() {
		const wpx = container.clientWidth;
		const hpx = container.clientHeight;
		const cam = world.camera.three;
		const target = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
			_labelTarget,
		);
		// frac = camera distance as a fraction of the full-site fit distance → picks the LOD tier.
		const frac = cam.position.distanceTo(target) / poseDistance(1);
		const showVilla = labelsVisible && frac <= LABEL_ZOOM_FRAC;
		const showBlock = labelsVisible && frac > LABEL_ZOOM_FRAC && frac <= BLOCK_LABEL_FRAC;
		const showZone = labelsVisible && frac > BLOCK_LABEL_FRAC && frac <= ZONE_LABEL_FRAC;
		for (const L of labelEls) placeLabel(L, showVilla, cam, wpx, hpx);
		for (const L of blockLabels) placeLabel(L, showBlock, cam, wpx, hpx);
		for (const L of zoneLabels) placeLabel(L, showZone, cam, wpx, hpx);
	}
	world.renderer.onBeforeUpdate.add(updateLabels);

	// --- Plan-image backdrop reaction (opacity / blur / scale from the camera each frame) ------------------
	// 0% zoom (the open distance) → opacity 1, base blur; by BACKDROP_ZOOM_FADE (30%) closer → opacity 0, max
	// blur; scale tracks the zoom (grows as you dolly in) so the backdrop moves with the model. Tilting or
	// rotating away from the open pose past BACKDROP_TILT_FADE (5% of range) fades it to 0 (a flat image only
	// reads right from the open angle). The host applies {opacity, blurPx, scale} to its <img>.
	const D0 = poseDistance(OPEN_POSE.zoom); // the "0% zoom" reference distance (open pose)
	const _bdTarget = new THREE.Vector3();
	function updateBackdrop() {
		if (!options.onBackdrop) return;
		const target = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
			_bdTarget,
		);
		const cam = world.camera.three;
		const dx = cam.position.x - target.x;
		const dy = cam.position.y - target.y;
		const dz = cam.position.z - target.z;
		const dist = Math.hypot(dx, dy, dz) || D0;
		// Fade progress (0 at the open distance → 1 fully faded): zoom IN over 30% closer, or zoom OUT over 10%
		// further. Blur grows and the backdrop scales with the zoom in both directions.
		const zoomInFrac = (D0 - dist) / D0; // + = zoomed in, − = zoomed out
		const p =
			zoomInFrac >= 0 ? Math.min(1, zoomInFrac / BACKDROP_ZOOM_FADE) : Math.min(1, -zoomInFrac / BACKDROP_ZOOMOUT_FADE);
		// orientation deviation from the open pose (as a fraction of each control's range)
		const elevationDeg = (Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI;
		const azimuthDeg = (Math.atan2(dx, dz) * 180) / Math.PI;
		let azDev = Math.abs(azimuthDeg - OPEN_POSE.azimuthDeg) % 360;
		if (azDev > 180) azDev = 360 - azDev;
		const dev = Math.max(azDev / 360, Math.abs(elevationDeg - OPEN_POSE.elevationDeg) / 84);
		const orientOpacity = 1 - Math.min(1, Math.max(0, (dev - BACKDROP_TILT_FADE) / BACKDROP_TILT_FADE));
		options.onBackdrop({
			opacity: (1 - p) * orientOpacity,
			blurPx: BACKDROP_BASE_BLUR + p * (BACKDROP_MAX_BLUR - BACKDROP_BASE_BLUR),
			scale: Math.min(3, Math.max(0.3, D0 / dist)), // zoom the backdrop with the model (in AND out)
		});
	}
	world.renderer.onBeforeUpdate.add(updateBackdrop);

	// --- Public API ------------------------------------------------------------
	const api: FootprintViewer & {onReady_?: () => void} = {
		setMeshOpacity(op) {
			meshOp = op;
			tiles.group.traverse((n) => styleTile(n));
			fragments.core.update();
		},
		setProjectionStrength(s) {
			strength = s;
			projUniforms.uStrength.value = effectiveStrength();
			fragments.core.update();
		},
		setColorMode(mode) {
			colorMode = mode;
			projUniforms.uStrength.value = effectiveStrength();
			fragments.core.update();
		},
		setVillaColours(map) {
			for (const [code, hex] of Object.entries(map)) overrideColours.set(code, hex);
			drawTexture();
			texture.needsUpdate = true;
			fragments.core.update();
		},
		setVisibleVillas(codes) {
			visibleCodes = codes ? new Set(codes) : null;
			drawTexture();
			texture.needsUpdate = true;
			fragments.core.update();
		},
		getVillaCodes() {
			return entries.map(([code]) => code);
		},
		getVillaRecord(code) {
			if (!footprints[code]) return null;
			const rec = progress.get(code);
			return {
				code,
				zone: rec?.zone,
				batch: rec?.batch,
				block: rec?.block,
				actual: rec?.actual,
				planned: rec?.planned,
				variance: rec?.variance,
				color: colourFor(code),
				contractor: rec?.contractor,
				model: rec?.model,
				plot: rec?.plot,
				unitType: rec?.unitType,
				typology: rec?.typology,
			};
		},
		selectVilla(code) {
			selectedCode = code;
			drawTexture();
			texture.needsUpdate = true;
			restyleLabels(); // selected villa's chip turns white
			fragments.core.update();
			api.onSelect?.(code);
		},
		getSelectedVilla() {
			return selectedCode;
		},
		fitAll,
		resetView,
		setView,
		getZoomFactor() {
			const t = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
				new THREE.Vector3(),
			);
			const dist = world.camera.three.position.distanceTo(t);
			const siteFit = poseDistance(1); // distance that frames the whole site
			return dist > 1e-3 ? siteFit / dist : 1;
		},
		isZoomedIn() {
			const t = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
				new THREE.Vector3(),
			);
			// >2% closer than the default open distance counts as zoomed in (small margin avoids rest-jitter).
			return world.camera.three.position.distanceTo(t) < poseDistance(OPEN_POSE.zoom) * 0.98;
		},
		zoomIn() {
			const t = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
				new THREE.Vector3(),
			);
			void world.camera.controls.dolly(world.camera.three.position.distanceTo(t) * 0.3, true);
		},
		zoomOut() {
			const t = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
				new THREE.Vector3(),
			);
			void world.camera.controls.dolly(-world.camera.three.position.distanceTo(t) * 0.3, true);
		},
		setInteractionMode(mode) {
			const controls = world.camera.controls as unknown as {
				mouseButtons: {left: number};
				constructor: {ACTION?: Record<string, number>};
			};
			const ACTION = controls.constructor.ACTION ?? {ROTATE: 1, TRUCK: 2};
			controls.mouseButtons.left = mode === "pan" ? ACTION.TRUCK : ACTION.ROTATE;
		},
		async topDownView() {
			// Straight-down (satellite) view, then fitToBox tightens it to the site — fitToBox naturally frames a
			// flat, wide footprint box from directly above, which is exactly the fitted top-down we want.
			const c = fpBox.getCenter(new THREE.Vector3());
			const up = poseDistance(1);
			await world.camera.controls.setLookAt(c.x, c.y + up, c.z + up * 0.001, c.x, c.y, c.z, false);
			await world.camera.controls.fitToBox(fpBox, true);
		},
		getCameraPose() {
			const p = world.camera.three.position;
			const t = (world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(
				new THREE.Vector3(),
			);
			const dx = p.x - t.x;
			const dy = p.y - t.y;
			const dz = p.z - t.z;
			const horiz = Math.hypot(dx, dz);
			return {
				position: [p.x, p.y, p.z],
				target: [t.x, t.y, t.z],
				elevationDeg: (Math.atan2(dy, horiz) * 180) / Math.PI,
				azimuthDeg: (Math.atan2(dx, dz) * 180) / Math.PI,
				distance: Math.hypot(dx, dy, dz),
			};
		},
		async fitVilla(code) {
			const it = index.find((i) => i.code === code);
			if (!it) return;
			const cx = (it.minx + it.maxx) / 2;
			const cz = (it.minz + it.maxz) / 2;
			// Fly to the villa keeping the CURRENT oblique angle (a direct pose, not fitToBox which would snap
			// top-down). Distance frames ~6× the villa footprint so it settles with surrounding context.
			const radius = (Math.max(it.maxx - it.minx, it.maxz - it.minz) * 6) / 2 || 20;
			const vfov = (((world.camera.three as THREE.PerspectiveCamera).fov ?? 60) * Math.PI) / 180;
			await applyPose(new THREE.Vector3(cx, FLOOR_Y, cz), curElev, curAzim, radius / Math.tan(vfov / 2), true);
		},
		// --- Parity helpers (host UI written against the old viewer) --------------
		setMeshVisible(v) {
			satGroup.visible = v;
			fragments.core.update();
		},
		setModelVisible(v) {
			colorMode = v ? "progress" : "off";
			projUniforms.uStrength.value = effectiveStrength();
			fragments.core.update();
		},
		setModelOpacity(op) {
			strength = op;
			projUniforms.uStrength.value = effectiveStrength();
			fragments.core.update();
		},
		setColourMode(mode) {
			colorMode = mode === "off" || mode === "material" ? "off" : "progress";
			projUniforms.uStrength.value = effectiveStrength();
			fragments.core.update();
		},
		setLabelsVisible(v) {
			labelsVisible = v;
			updateLabels();
		},
		onHover: options.onHover,
		onSelect: options.onSelect,
		dispose() {
			container.removeEventListener("mousemove", onMove);
			container.removeEventListener("mouseleave", onLeave);
			container.removeEventListener("click", onClick);
			try {
				tiles.dispose();
			} catch {
				/* ignore */
			}
			components.dispose();
			container.replaceChildren();
		},
	};
	api.onReady_ = () => options.onReady?.(api);

	return api;
}
