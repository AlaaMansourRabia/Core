// Headless reality-mesh + progress-model viewer (no built-in UI). Renders the DroneDeploy reality-capture
// mesh (Cesium 3D Tiles) with the IFC "progress model" composited on top at a uniform opacity, and exposes
// a programmatic API keyed by villa number. Adapted from the embed-reality-mesh-viewer handoff prompt.
import {TilesRenderer} from "3d-tiles-renderer";
import * as OBC from "@thatopen/components";
import * as THREE from "three";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

export type ColourMode = "material" | "progress" | "hover";
export interface AlignState {
	offX: number;
	offY: number;
	scale: number;
	rot: number;
	zoff: number;
}
export interface SiteViewerOptions {
	fragUrl?: string;
	workerUrl?: string;
	tilesetUrl?: string;
	dracoPath?: string;
	progressUrl?: string;
	align?: Partial<AlignState>;
	meshOpacity?: number;
	modelOpacity?: number;
	colourMode?: ColourMode;
	/** Show the villa-number chips floating over each villa. Default true. */
	labels?: boolean;
	onReady?: (v: SiteViewer) => void;
	onHover?: (code: string | null) => void;
	onSelect?: (code: string | null) => void;
}
export interface SiteViewer {
	setModelOpacity(op: number): void;
	setMeshOpacity(op: number): void;
	setModelVisible(v: boolean): void;
	setMeshVisible(v: boolean): void;
	setLabelsVisible(v: boolean): void;
	setColourMode(mode: ColourMode): void;
	setVillaColours(map: Record<string, string>): void;
	selectVilla(code: string | null): void;
	getSelectedVilla(): string | null;
	getVillaCodes(): string[];
	getVillaColour(code: string): string | null;
	fitVilla(code: string): Promise<void>;
	fitAll(): Promise<void>;
	onHover?: (code: string | null) => void;
	onSelect?: (code: string | null) => void;
	dispose(): void;
}

/** Confirmed alignment of the mesh under the IFC (metric, both centred). */
const DEFAULT_ALIGN: AlignState = {offX: -283, offY: 879, scale: 3.29, rot: -170, zoff: 26.9};
const HOUSE_NAME_RE = /[A-Z]{2,3}\d+-\d+/i; // villa numbers: DP4-2050, VL4-2275, TH1-2234…
const UNASSIGNED = new THREE.Color("#9ca3af");
const HOVER_ACCENT = new THREE.Color(0.13, 0.5, 1);
const SELECT_ACCENT = new THREE.Color("#22d3ee");

export async function createSiteViewer(container: HTMLElement, options: SiteViewerOptions = {}): Promise<SiteViewer> {
	const o = {
		fragUrl: "/site-b.frag",
		workerUrl: "/worker.mjs",
		tilesetUrl: "/reality-mesh/capture2/mesh_3d/tileset.json",
		dracoPath: "/reality-mesh/draco/gltf/",
		progressUrl: "/house-progress.json",
		meshOpacity: 0.85,
		modelOpacity: 1,
		colourMode: "progress" as ColourMode,
		labels: true,
		...options,
	};
	const align: AlignState = {...DEFAULT_ALIGN, ...(options.align ?? {})};

	// --- World ---------------------------------------------------------------
	const components = new OBC.Components();
	const world = components.get(OBC.Worlds).create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>();
	world.scene = new OBC.SimpleScene(components);
	world.scene.setup();
	world.scene.three.background = new THREE.Color("#1a1d21");
	world.renderer = new OBC.SimpleRenderer(components, container);
	world.camera = new OBC.OrthoPerspectiveCamera(components);
	await world.camera.controls.setLookAt(12, 10, 12, 0, 0, 0);
	components.init();

	const gl = (world.renderer as OBC.SimpleRenderer).three;
	gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

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

	// --- Fragments (progress model) -----------------------------------------
	const workerBlob = await (await fetch(o.workerUrl)).blob();
	const workerUrl = URL.createObjectURL(new File([workerBlob], "worker.mjs", {type: "text/javascript"}));
	const fragments = components.get(OBC.FragmentsManager);
	fragments.init(workerUrl);
	world.camera.controls.addEventListener("update", () => fragments.core.update());
	fragments.list.onItemSet.add(({value: m}) => {
		m.useCamera(world.camera.three);
		world.scene.three.add(m.object);
		fragments.core.update(true);
	});

	const bytes = new Uint8Array(await (await fetch(o.fragUrl)).arrayBuffer());
	await fragments.core.load(bytes, {modelId: "site-b"});
	const model = fragments.list.get("site-b");
	if (!model) throw new Error("site-b.frag failed to load");

	// Sit the model base on y = 0.
	const box0 = model.box ?? new THREE.Box3().setFromObject(model.object);
	const yOffset = Number.isFinite(box0.min.y) ? -box0.min.y : 0;
	if (Math.abs(yOffset) > 1e-6) {
		model.object.position.y += yOffset;
		model.object.updateMatrixWorld(true);
		fragments.core.update(true);
	}
	const box = box0.clone();
	box.min.y += yOffset;
	box.max.y += yOffset;
	const center = box.getCenter(new THREE.Vector3());

	// --- Progress model as its own composited layer -------------------------
	const modelScene = new THREE.Scene();
	modelScene.add(new THREE.AmbientLight(0xffffff, 2));
	const dir = new THREE.DirectionalLight(0xffffff, 2);
	dir.position.set(1, 2, 1);
	modelScene.add(dir);
	world.scene.three.remove(model.object);
	modelScene.add(model.object);

	const dbs = gl.getDrawingBufferSize(new THREE.Vector2());
	const layerRT = new THREE.WebGLRenderTarget(dbs.x, dbs.y, {depthBuffer: true, samples: 4});
	layerRT.texture.colorSpace = THREE.SRGBColorSpace;
	const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const quadMat = new THREE.MeshBasicMaterial({
		map: layerRT.texture,
		transparent: true,
		opacity: o.modelOpacity,
		depthTest: false,
		depthWrite: false,
		toneMapped: false,
	});
	const quadScene = new THREE.Scene();
	quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), quadMat));
	let modelVisible = o.modelOpacity > 0.001;
	world.renderer.onResize.add(() => {
		const s = gl.getDrawingBufferSize(new THREE.Vector2());
		layerRT.setSize(s.x, s.y);
	});
	world.renderer.onAfterUpdate.add(() => {
		if (!modelVisible) return;
		const prevAlpha = gl.getClearAlpha();
		gl.setRenderTarget(layerRT);
		gl.setClearColor(0x000000, 0);
		gl.clear(true, true, false);
		gl.render(modelScene, world.camera.three);
		gl.setRenderTarget(null);
		gl.setClearAlpha(prevAlpha);
		const prevAuto = gl.autoClear;
		gl.autoClear = false;
		gl.render(quadScene, quadCam);
		gl.autoClear = prevAuto;
	});

	// --- Reality mesh (Cesium 3D Tiles, ECEF) --------------------------------
	const satGroup = new THREE.Group(); // alignment to the IFC
	const enuGroup = new THREE.Group(); // ECEF-up -> world +Y
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
	const gltf = new GLTFLoader(tiles.manager);
	gltf.setDRACOLoader(draco);
	tiles.manager.addHandler(/\.(gltf|glb)$/i, gltf);
	tiles.setCamera(world.camera.three);
	tiles.setResolutionFromRenderer(world.camera.three, gl);
	enuGroup.add(tiles.group);

	let meshOpacity = o.meshOpacity;
	const styleTile = (root: THREE.Object3D) =>
		root.traverse((n) => {
			const mesh = n as THREE.Mesh;
			if (!mesh.isMesh) return;
			for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
				if (!m) continue;
				m.transparent = meshOpacity < 1;
				(m as THREE.Material & {opacity: number}).opacity = meshOpacity;
				m.depthWrite = meshOpacity >= 1;
				m.needsUpdate = true;
			}
		});
	tiles.addEventListener("load-model", (e: {scene?: THREE.Object3D}) => {
		if (e.scene) styleTile(e.scene);
		fragments.core.update();
	});
	let framed = false;
	tiles.addEventListener("load-tile-set", () => {
		const sphere = new THREE.Sphere();
		if (framed || !tiles.getBoundingSphere(sphere)) return;
		framed = true;
		tiles.group.position.copy(sphere.center).multiplyScalar(-1);
		enuGroup.quaternion.setFromUnitVectors(sphere.center.clone().normalize(), new THREE.Vector3(0, 1, 0));
		applyAlign();
		void fitAll();
		o.onReady?.(api);
	});
	world.renderer.onBeforeUpdate.add(() => {
		tiles.setResolutionFromRenderer(world.camera.three, gl);
		tiles.update();
	});
	function applyAlign() {
		satGroup.position.set(center.x + align.offX, box.min.y - 0.05 + align.zoff, center.z - align.offY);
		satGroup.scale.setScalar(align.scale);
		satGroup.rotation.y = (align.rot * Math.PI) / 180;
		fragments.core.update();
	}

	// --- Villa identity + colouring -----------------------------------------
	const villaColours = new Map<string, THREE.Color>();
	const idToVilla = new Map<number, string>();
	const villaToIds = new Map<string, number[]>();
	let allIds: number[] = [];
	let colourMode: ColourMode = o.colourMode;
	let hovered: string | null = null;
	let selected: string | null = null;

	async function loadColours() {
		try {
			const res = await fetch(o.progressUrl);
			if (res.ok) {
				const doc = (await res.json()) as {houses: Record<string, {color: string}>};
				for (const [code, h] of Object.entries(doc.houses)) villaColours.set(code, new THREE.Color(h.color));
			}
		} catch {
			/* villas fall back to grey */
		}
	}
	const colourFor = (code: string) => villaColours.get(code) ?? UNASSIGNED;

	async function indexVillas() {
		const cats = await model!.getItemsOfCategories([/IFCWALL/, /IFCSLAB/]);
		allIds = ([] as number[]).concat(...Object.values(cats)).filter((x) => x != null);
		if (!allIds.length) return;
		const data = (await model!.getItemsData(allIds, {attributesDefault: true})) as Array<
			Record<string, {value?: unknown} | undefined>
		>;
		for (const it of data) {
			const lid = (it?._localId as {value?: unknown} | undefined)?.value;
			const nm = (it?.Name as {value?: unknown} | undefined)?.value;
			if (typeof lid !== "number" || typeof nm !== "string" || !HOUSE_NAME_RE.test(nm)) continue;
			idToVilla.set(lid, nm);
			const arr = villaToIds.get(nm);
			if (arr) arr.push(lid);
			else villaToIds.set(nm, [lid]);
		}
	}

	// Paint one villa according to (mode, selected, hovered).
	async function paint(code: string) {
		const ids = villaToIds.get(code);
		if (!ids) return;
		if (selected === code) return model!.setColor(ids, SELECT_ACCENT);
		if (hovered === code) {
			if (colourMode === "material") return model!.setColor(ids, HOVER_ACCENT);
			return model!.setColor(
				ids,
				colourFor(code)
					.clone()
					.lerp(new THREE.Color(1, 1, 1), 0.4),
			);
		}
		if (colourMode === "progress") return model!.setColor(ids, colourFor(code));
		if (colourMode === "hover") return model!.resetColor(ids);
		return model!.resetColor(ids); // material
	}
	async function repaintAll() {
		if (colourMode === "progress") {
			await Promise.all([...villaToIds.keys()].map((c) => paint(c)));
		} else {
			await model!.resetColor(allIds);
			if (selected) await paint(selected);
		}
		await fragments.core.update(true);
	}

	// --- Villa-number labels (HTML chips over each villa, matching the 2D site-plan labels) -----------------
	// A DOM overlay ABOVE the canvas but `pointer-events:none`, so it never blocks orbit / hover / click. One
	// chip per villa carrying the same theme as the 2D `VillaLabel`: a black pill with white text by default,
	// flipped to a white pill with dark text when its villa is selected. Each frame the villa's world centre is
	// projected to screen space and the chip is moved there; chips that fall off-screen hide.
	let labelsVisible = options.labels ?? true;
	const labelEls: {code: string; el: HTMLDivElement; inner: HTMLDivElement; center: THREE.Vector3}[] = [];
	const labelLayer = document.createElement("div");
	labelLayer.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2";
	const styleLabel = (el: HTMLDivElement, light: boolean) => {
		// Matches the 2D VillaLabel: dark chip / white text by default; white chip / dark text when selected.
		el.style.background = light ? "#ffffff" : "#000000";
		el.style.color = light ? "#111827" : "#ffffff";
	};
	function restyleLabels() {
		for (const L of labelEls) styleLabel(L.inner, L.code === selected);
	}
	// Labels only appear once the camera has zoomed in past 50% — at the full-site framing hundreds of chips
	// overlap into noise. `labelZoomDist` is the distance that frames the whole model, halved; chips show only
	// while the camera sits closer to its target than that (i.e. zoomed in more than 50%).
	const _labelSphere = box.getBoundingSphere(new THREE.Sphere());
	const _labelFov = (((world.camera.three as THREE.PerspectiveCamera).fov ?? 50) * Math.PI) / 180;
	const labelZoomDist = (_labelSphere.radius / Math.tan(_labelFov / 2)) * 0.5;
	const _labelTarget = new THREE.Vector3();
	const cameraFramingDistance = () => {
		(world.camera.controls as unknown as {getTarget(v: THREE.Vector3): THREE.Vector3}).getTarget(_labelTarget);
		return world.camera.three.position.distanceTo(_labelTarget);
	};
	const _proj = new THREE.Vector3();
	function updateLabels() {
		const W = container.clientWidth;
		const H = container.clientHeight;
		const cam = world.camera.three;
		const zoomedIn = cameraFramingDistance() <= labelZoomDist;
		for (const L of labelEls) {
			_proj.copy(L.center).project(cam);
			const onScreen =
				labelsVisible &&
				zoomedIn &&
				_proj.z > -1 &&
				_proj.z < 1 &&
				Math.abs(_proj.x) < 1.15 &&
				Math.abs(_proj.y) < 1.15;
			if (!onScreen) {
				if (L.el.style.visibility !== "hidden") L.el.style.visibility = "hidden";
				continue;
			}
			L.el.style.visibility = "visible";
			L.el.style.transform = `translate(-50%,-50%) translate(${(_proj.x * 0.5 + 0.5) * W}px,${(-_proj.y * 0.5 + 0.5) * H}px)`;
		}
	}
	async function buildLabels() {
		container.appendChild(labelLayer);
		await Promise.all(
			[...villaToIds.keys()].map(async (code) => {
				const ids = villaToIds.get(code);
				if (!ids?.length) return;
				const b = await model!.getMergedBox(ids);
				if (!b) return;
				const center = b.getCenter(new THREE.Vector3());
				// Outer positioner — moved to the villa's projected screen point every frame.
				const el = document.createElement("div");
				el.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;will-change:transform";
				// Inner pill — the visible chip (plot number only, like the 2D chips).
				const inner = document.createElement("div");
				inner.textContent = code.split("-").pop() ?? code;
				inner.style.cssText =
					"padding:2px 6px;border-radius:5px;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,sans-serif;" +
					"white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,.35)";
				styleLabel(inner, code === selected);
				el.appendChild(inner);
				labelLayer.appendChild(el);
				labelEls.push({code, el, inner, center});
			}),
		);
		updateLabels();
	}
	world.renderer.onBeforeUpdate.add(updateLabels);

	// --- Pointer: hover + click -> villa number ------------------------------
	let raf = 0;
	let lastXY: {x: number; y: number} | null = null;
	let busy = false;
	async function hitVilla(x: number, y: number): Promise<string | null> {
		const hit = (await model!.raycast({
			camera: world.camera.three,
			mouse: new THREE.Vector2(x, y),
			dom: gl.domElement,
		})) as {localId?: number} | null;
		return hit && typeof hit.localId === "number" ? (idToVilla.get(hit.localId) ?? null) : null;
	}
	async function onHoverTick() {
		raf = 0;
		if (busy || !lastXY) return;
		busy = true;
		try {
			const code = await hitVilla(lastXY.x, lastXY.y);
			if (code !== hovered) {
				const prev = hovered;
				hovered = code;
				if (prev && prev !== selected) await paint(prev);
				if (code && code !== selected) await paint(code);
				await fragments.core.update(true);
				api.onHover?.(code);
			}
		} finally {
			busy = false;
		}
	}
	const onMove = (e: MouseEvent) => {
		lastXY = {x: e.clientX, y: e.clientY};
		if (!raf) raf = requestAnimationFrame(() => void onHoverTick());
	};
	const onLeave = () => {
		lastXY = null;
		if (hovered && hovered !== selected) {
			const h = hovered;
			hovered = null;
			void paint(h).then(() => fragments.core.update(true));
		}
		hovered = null;
		api.onHover?.(null);
	};
	const onClick = (e: MouseEvent) => {
		void hitVilla(e.clientX, e.clientY).then((c) => api.selectVilla(c));
	};
	container.addEventListener("mousemove", onMove);
	container.addEventListener("mouseleave", onLeave);
	container.addEventListener("click", onClick);

	// --- Public API ----------------------------------------------------------
	const api: SiteViewer = {
		setModelOpacity(op) {
			quadMat.opacity = op;
			modelVisible = op > 0.001;
			fragments.core.update();
		},
		setMeshOpacity(op) {
			meshOpacity = op;
			tiles.group.traverse((n) => styleTile(n));
			fragments.core.update();
		},
		setModelVisible(v) {
			modelVisible = v;
			fragments.core.update();
		},
		setMeshVisible(v) {
			satGroup.visible = v;
			fragments.core.update();
		},
		setLabelsVisible(v) {
			labelsVisible = v;
			updateLabels();
		},
		async setColourMode(mode) {
			colourMode = mode;
			hovered = null;
			await repaintAll();
		},
		setVillaColours(map) {
			for (const [code, hex] of Object.entries(map)) villaColours.set(code, new THREE.Color(hex));
			void repaintAll();
		},
		async selectVilla(code) {
			const prev = selected;
			selected = code;
			if (prev) await paint(prev);
			if (code) await paint(code);
			await fragments.core.update(true);
			// Flip the selected villa's label to the white (light) chip; every other chip stays black.
			restyleLabels();
			api.onSelect?.(code);
		},
		getSelectedVilla() {
			return selected;
		},
		getVillaCodes() {
			return [...villaToIds.keys()];
		},
		getVillaColour(code) {
			const c = villaColours.get(code);
			return c ? "#" + c.getHexString() : null;
		},
		async fitVilla(code) {
			const ids = villaToIds.get(code);
			if (!ids?.length) return;
			const b = await model!.getMergedBox(ids);
			if (!b) return;
			// Frame a box 4× the villa's size so the selected villa settles with plenty of surrounding context
			// (a tight 1× fit-to-box zoomed in far too close).
			const c = b.getCenter(new THREE.Vector3());
			b.setFromCenterAndSize(c, b.getSize(new THREE.Vector3()).multiplyScalar(4));
			await world.camera.controls.fitToBox(b, true);
		},
		async fitAll() {
			await world.camera.controls.fitToBox(box, true);
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

	async function fitAll() {
		await world.camera.controls.fitToBox(box, true);
	}

	await loadColours();
	await indexVillas();
	await repaintAll();
	void buildLabels();
	return api;
}
