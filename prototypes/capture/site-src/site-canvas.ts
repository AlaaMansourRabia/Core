// Site canvas — ThatOpen/web-ifc 3D site model (walls + slabs) over a DroneDeploy ortho ground plane,
// with per-house hover highlighting. Alignment of the ortho is baked in (no control panel).
//
// This is the editable SOURCE. It is bundled (three + @thatopen baked in) to public/site/site-canvas.js
// so the browser loads one self-contained file (no CDN / import map). To rebuild after editing, run
// esbuild against a node_modules that has three@0.185.1 + @thatopen/components@3.4.8 + fragments@3.4.7
// (the versions site-b.frag was built with):
//
//   esbuild site-src/site-canvas.ts --bundle --format=esm --platform=browser \
//     --outfile=public/site/site-canvas.js
//
// (resolve deps from capture-admin-next-v3/kolkata/villa-compare-vl4/node_modules).

import * as THREE from "three";
import * as OBC from "@thatopen/components";

// Pre-confirmed ortho placement (relative to the model centre, in metres). Fixed — not UI.
const ALIGN = {offX: -170.4, offY: 796.6, scale: 3.33, rotDeg: 0, opacity: 0.85};

// First-view camera: look-down pitch and how much closer than a full fit to start.
// PITCH_DEG = downward angle from horizontal (45 = looking down at 45°, 90 = straight top-down).
// START_ZOOM = fraction of the fit distance to start at (0.75 = 25% closer than fitting the whole site).
const PITCH_DEG = 45;
const START_ZOOM = 0.75;

type OrthoMeta = {widthM: number; heightM: number; resM: number};
const ORTHO_META: OrthoMeta = (window as unknown as {ORTHO_META?: OrthoMeta}).ORTHO_META ?? {
	widthM: 1423.54,
	heightM: 1555.4,
	resM: 0.5561,
};

const container = document.getElementById("container") as HTMLDivElement;
const statusEl = document.getElementById("status");
const setStatus = (m: string) => {
	if (statusEl) statusEl.textContent = m;
};

// Representation mode: "?rep=blocks" hides the detailed site assets (walls + slabs) and draws each villa
// as a single massing block instead — the "No Assets" site view. Anything else keeps the real model.
const REP = new URLSearchParams(location.search).get("rep");

// A house code looks like "DP4-2050": 2–3 letters, digits, a dash, digits. Shared by both representations.
const HOUSE_RE = /[A-Z]{2,3}\d+-\d+/i;

/** The site model's per-house index: every wall/slab localId ↔ its house code (from the element Name),
 *  plus the flat id list. Returns null until the model exposes at least a few houses (it may be mid-load),
 *  so callers can retry. Shared by the assets hover path and the block representation. */
type SiteModelLike = {
	getItemsOfCategories(categories: RegExp[]): Promise<Record<string, (number | null)[]>>;
	getItemsData(ids: number[], config: {attributesDefault: boolean}): Promise<Array<Record<string, {value?: unknown} | undefined>>>;
};
async function indexHouses(
	m: SiteModelLike,
): Promise<{id2home: Map<number, string>; home2ids: Map<string, number[]>; allIds: number[]} | null> {
	const cats = await m.getItemsOfCategories([/IFCWALL/, /IFCSLAB/]);
	const ids = ([] as (number | null)[]).concat(...Object.values(cats)).filter((x): x is number => x != null);
	if (!ids.length) return null;
	const data = await m.getItemsData(ids, {attributesDefault: true});
	const id2home = new Map<number, string>();
	const home2ids = new Map<string, number[]>();
	for (const it of data) {
		const lid = it?._localId?.value;
		const nm = it?.Name?.value;
		if (typeof lid !== "number" || typeof nm !== "string" || !HOUSE_RE.test(nm)) continue;
		id2home.set(lid, nm);
		let bucket = home2ids.get(nm);
		if (!bucket) {
			bucket = [];
			home2ids.set(nm, bucket);
		}
		bucket.push(lid);
	}
	if (home2ids.size < 3) return null;
	return {id2home, home2ids, allIds: ids};
}

/** Build the rich hover card (Figma "Villa Preview Overlay") in the container and return the element plus
 *  its title node (set to the hovered house code). Shared by both representations. */
function createVillaCard(): {card: HTMLDivElement; titleEl: HTMLDivElement} {
	// Progress/milestones are mock (no live per-house feed); the title becomes the hovered house code.
	// Image is served from the /public root (/card.png).
	const CARD_IMAGE = "/card.png";
	const card = document.createElement("div");
	Object.assign(card.style, {
		position: "absolute",
		left: "0",
		top: "0",
		// Anchor the card's bottom-centre to the point we place it at (the roof top), so it floats
		// centred ABOVE the house (like the site overlay), not beside the cursor.
		transform: "translate(-50%, -100%)",
		pointerEvents: "none",
		opacity: "0",
		transition: "opacity 150ms ease-out",
		zIndex: "30",
		width: "300px",
		boxSizing: "border-box",
		padding: "12px",
		borderRadius: "4px",
		overflow: "hidden",
		background: "rgba(255,255,255,0.95)",
		backdropFilter: "blur(8px)",
		WebkitBackdropFilter: "blur(8px)",
		border: "1px solid rgba(255,255,255,0.5)",
		boxShadow: "0 12px 40px rgba(0,0,0,0.05), inset 0 0 24px 4px rgba(0,0,0,0.05)",
		fontFamily: "'Figtree', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
	});
	const milestone = (label: string, date: string, s: "current" | "done" | "future") => {
		const icon =
			s === "current"
				? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#22c55e"/><path d="M7.5 12.2l3 3 6-6.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
				: s === "done"
					? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="#d1d5db"/><path d="M7.5 12.2l3 3 6-6.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
					: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#d1d5db" stroke-width="2"/></svg>';
		return (
			'<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1 0 0;min-width:0">' +
			icon +
			'<div style="font-size:12px;line-height:1;color:#9ca3af;white-space:nowrap">' +
			date +
			"</div>" +
			'<div style="font-size:12px;line-height:1;font-weight:600;color:' +
			(s === "current" ? "#111827" : "#9ca3af") +
			'">' +
			label +
			"</div></div>"
		);
	};
	card.innerHTML =
		'<div style="display:flex;flex-direction:column;gap:14px;width:100%">' +
		'<div style="display:flex;gap:8px;align-items:center;width:100%">' +
		'<div style="flex:1 0 0;min-width:0;display:flex;align-items:center;font-weight:400;font-size:12px;line-height:1.5;color:#6b7280;white-space:nowrap;overflow:hidden">' +
		'<span style="min-width:0;overflow:hidden;text-overflow:ellipsis">ALMANAR - PHASE1 - ZONE1</span>' +
		'<span style="flex-shrink:0">&nbsp;| Phase 1 | Zone 1-A</span></div>' +
		'<div style="display:flex;align-items:center;gap:4px;padding:2px 8px;border-radius:16px;background:#f9fafb;border:1px solid #e5e7eb;flex-shrink:0">' +
		'<span style="width:6px;height:6px;border-radius:100px;background:#22c55e"></span>' +
		'<span style="font-weight:600;font-size:13px;line-height:1.5;color:#1f2937">M35</span></div></div>' +
		'<div data-title style="font-weight:600;font-size:22px;line-height:1.2;color:#111827">Villa</div>' +
		'<div style="height:130px;width:100%;display:flex;align-items:center;justify-content:center;overflow:hidden">' +
		'<img src="' +
		CARD_IMAGE +
		'" alt="" style="max-width:100%;height:130px;object-fit:contain;mix-blend-mode:luminosity" /></div>' +
		'<div style="position:relative;display:flex;width:100%;background:#fff;border-radius:2px;overflow:hidden">' +
		'<div style="position:relative;flex:1 0 0;min-width:0;height:60px;padding:8px;box-sizing:border-box;overflow:hidden">' +
		'<div style="position:absolute;bottom:0;left:50%;right:0;height:23px;border-top:1px solid #4ade80;background:linear-gradient(to bottom,rgba(74,222,128,0.1),rgba(243,244,246,0))"></div>' +
		'<div style="position:relative;display:flex;flex-direction:column;align-items:flex-start">' +
		'<div style="font-size:16px;line-height:1.5;color:#111827">43%</div>' +
		'<div style="font-size:10px;line-height:1.5;color:#6b7280;opacity:0.9">Approved</div></div></div>' +
		'<div style="position:relative;flex:1 0 0;min-width:0;height:60px;padding:8px;box-sizing:border-box;overflow:hidden">' +
		'<div style="position:absolute;bottom:0;left:0;right:50%;height:18px;border-top:1px solid #d1d5db;background:linear-gradient(to bottom,#e5e7eb,rgba(243,244,246,0))"></div>' +
		'<div style="position:relative;display:flex;flex-direction:column;align-items:flex-end">' +
		'<div style="font-size:16px;line-height:1.5;color:#111827">32%</div>' +
		'<div style="font-size:10px;line-height:1.5;color:#6b7280;opacity:0.9">Planned</div></div></div>' +
		'<div style="position:absolute;left:50%;top:6px;transform:translateX(-50%);font-size:12px;line-height:1.5;color:#166534;white-space:nowrap">-11% variance</div></div>' +
		'<div style="display:flex;gap:4px;width:100%">' +
		milestone("M35", "Jun-26", "done") +
		milestone("M50", "Jun-26", "current") +
		milestone("M65", "Aug-26", "future") +
		milestone("M80", "Nov-26", "future") +
		milestone("M95", "Jun-27", "future") +
		milestone("M100", "Jun-27", "future") +
		"</div></div>";
	const titleEl = card.querySelector("[data-title]") as HTMLDivElement;
	container.appendChild(card);
	return {card, titleEl};
}

async function main() {
	const components = new OBC.Components();
	const worlds = components.get(OBC.Worlds);
	const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>();
	world.scene = new OBC.SimpleScene(components);
	world.scene.setup();
	world.scene.three.background = new THREE.Color("#1a1d21");
	world.renderer = new OBC.SimpleRenderer(components, container);
	world.camera = new OBC.OrthoPerspectiveCamera(components);
	await world.camera.controls.setLookAt(12, 10, 12, 0, 0, 0);
	components.init();
	components.get(OBC.Grids).create(world);

	// Zoom out over the ~1.8 km site without the model clipping: ThatOpen's orbit caps dolly at 300 and
	// far at 1000. Raise both, re-asserting on camera update.
	const FAR = 5_000_000,
		MAX_DOLLY = 2_000_000;
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

	// Fragments worker (served as a same-origin blob).
	const workerBlob = await (await fetch("/worker.mjs")).blob();
	const workerUrl = URL.createObjectURL(new File([workerBlob], "worker.mjs", {type: "text/javascript"}));
	const fragments = components.get(OBC.FragmentsManager);
	fragments.init(workerUrl);
	world.camera.controls.addEventListener("update", () => fragments.core.update());
	fragments.list.onItemSet.add(({value: m}) => {
		m.useCamera(world.camera.three);
		world.scene.three.add(m.object);
		fragments.core.update(true);
	});

	setStatus("Loading site…");
	const bytes = new Uint8Array(await (await fetch("/site-b.frag")).arrayBuffer());
	await fragments.core.load(bytes, {modelId: "site-b"});
	const model = fragments.list.get("site-b");
	if (!model) {
		setStatus("Failed to load site-b.frag");
		return;
	}

	// "Sit on grid": web-ifc centres the model on its centroid; lift so base y = 0.
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
	const c = box.getCenter(new THREE.Vector3());

	// First view: look down at PITCH_DEG from a diagonal (+X,+Z) azimuth. The vertical offset is the
	// horizontal magnitude × tan(pitch), so pitch 45° ⇒ vertical = horizontal (√2·H). fitToBox then
	// dollies along that direction to frame the whole site; START_ZOOM starts closer than that fit.
	const H = 100; // arbitrary horizontal offset — fitToBox re-dollies along this direction
	const horiz = Math.SQRT2 * H; // magnitude of the (H, _, H) horizontal offset
	const vert = horiz * Math.tan((PITCH_DEG * Math.PI) / 180);
	await world.camera.controls.setLookAt(c.x + H, c.y + vert, c.z + H, c.x, c.y, c.z, false);
	await world.camera.controls.fitToBox(box, false);
	await world.camera.controls.dollyTo(world.camera.controls.distance * START_ZOOM, false);

	addSatellite(box);
	// "No Assets" view: draw each villa as a massing block over the ortho instead of the detailed model.
	// Both representations expose the same hover/focus/progress API, so TV mode drives either unchanged.
	const site = REP === "blocks" ? await setupBlocks(model, c) : setupHover(model);
	setupTvMode(site);
	setStatus("");

	// --- Satellite ground plane (fixed placement) ---------------------------
	function addSatellite(mbox: THREE.Box3) {
		const center = mbox.getCenter(new THREE.Vector3());
		const geo = new THREE.PlaneGeometry(ORTHO_META.widthM, ORTHO_META.heightM);
		const mat = new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			opacity: ALIGN.opacity,
			depthWrite: false,
		});
		const mesh = new THREE.Mesh(geo, mat);
		mesh.rotation.x = -Math.PI / 2; // lay flat: local +Y → world -Z, +X → world +X
		mesh.renderOrder = -1;
		const group = new THREE.Group(); // carries the align rotation about world Y
		group.add(mesh);
		// raw ground XY offset → world (X, -Z); model base is world Y.
		group.position.set(center.x + ALIGN.offX, mbox.min.y - 0.05, center.z - ALIGN.offY);
		group.scale.setScalar(ALIGN.scale);
		group.rotation.y = (ALIGN.rotDeg * Math.PI) / 180;
		world.scene.three.add(group);
		new THREE.TextureLoader().load("/ortho.png", (tex) => {
			tex.colorSpace = THREE.SRGBColorSpace;
			tex.minFilter = THREE.LinearFilter;
			tex.magFilter = THREE.LinearFilter;
			tex.generateMipmaps = false;
			tex.wrapS = THREE.ClampToEdgeWrapping;
			tex.wrapT = THREE.ClampToEdgeWrapping;
			mat.map = tex;
			mat.needsUpdate = true;
			fragments.core.update();
		});
	}

	// The interaction API both site representations expose, so the TV-mode bridge (and the progress /
	// hover / focus behaviour) drives either the detailed assets or the massing blocks unchanged.
	type SiteApi = {
		hasData: () => boolean;
		boxFor: (home: string) => Promise<THREE.Box3 | null>;
		pickCentralHouse: () => Promise<string | null>;
		houseList: () => string[];
		setInteractive: (enabled: boolean) => void;
		focusHighlight: (home: string) => Promise<void>;
		clearFocusHighlight: () => Promise<void>;
		setProgressColors: (colors: Record<string, string>) => Promise<void>;
		clearProgress: () => Promise<void>;
		isProgressActive: () => boolean;
	};

	// --- Hover a house: whole-house blue highlight + code tooltip ------------
	// Returns a small API the TV-mode bridge uses to fly the camera onto a single house.
	function setupHover(m: NonNullable<typeof model>): SiteApi {
		const HL = {color: new THREE.Color(0.13, 0.5, 1), renderedFaces: 1, opacity: 1, transparent: false};
		let id2home: Map<number, string> | null = null;
		let home2ids: Map<string, number[]> | null = null;
		let allIds: number[] | null = null; // every wall/slab id — the whitelist dims all of these
		let curHouse: string | null = null;
		let raf = 0,
			client: {x: number; y: number} | null = null,
			busy = false;
		// TV mode suppresses hover recolour (so it can't clobber the spotlight), and remembers which house
		// ids were greyed out so they can be reset on exit (every house EXCEPT the focused one).
		let interactive = true;
		let greyedIds: number[] = [];
		const {card, titleEl} = createVillaCard();

		// Index the houses once the model's element data is available (async; the model is already loaded).
		void indexHouses(m).then((idx) => {
			if (idx) {
				id2home = idx.id2home;
				home2ids = idx.home2ids;
				allIds = idx.allIds;
			}
		});

		async function set(home: string | null) {
			if (home === curHouse) return;
			if (curHouse && home2ids) {
				const p = home2ids.get(curHouse);
				if (p) await m.resetHighlight(p);
			}
			curHouse = home;
			if (home && home2ids) {
				const ids = home2ids.get(home);
				if (ids) await m.highlight(ids, HL);
			}
			await fragments.core.update(true);
		}

		// Position the card centred ABOVE the hovered house: project the top-centre of its world bounding
		// box to screen. Boxes are cached (geometry is static); re-projected on hover and on camera move.
		const houseBox = new Map<string, THREE.Box3>();
		async function boxFor(home: string): Promise<THREE.Box3 | null> {
			const cached = houseBox.get(home);
			if (cached) return cached;
			const ids = home2ids?.get(home);
			if (!ids?.length) return null;
			const boxer = components.get(OBC.BoundingBoxer);
			boxer.list.clear();
			await boxer.addFromModelIdMap({"site-b": new Set(ids)});
			const box = boxer.get().clone();
			boxer.list.clear();
			if (box.isEmpty()) return null;
			houseBox.set(home, box);
			return box;
		}
		async function repositionCard() {
			if (!curHouse) return;
			const box = await boxFor(curHouse);
			if (!box) return;
			const top = new THREE.Vector3(
				(box.min.x + box.max.x) / 2,
				box.max.y,
				(box.min.z + box.max.z) / 2,
			).project(world.camera.three);
			const r = container.getBoundingClientRect();
			card.style.left = `${(top.x * 0.5 + 0.5) * r.width}px`;
			card.style.top = `${(-top.y * 0.5 + 0.5) * r.height - 12}px`; // 12px gap above the roof
			card.style.opacity = top.z < 1 ? "1" : "0"; // hide when the point is behind the camera
		}
		world.camera.controls.addEventListener("update", () => void repositionCard());

		async function tick() {
			raf = 0;
			if (busy || !id2home || !client || !interactive) return;
			busy = true;
			try {
				const hit = (await m.raycast({
					camera: world.camera.three,
					mouse: new THREE.Vector2(client.x, client.y),
					dom: (world.renderer as OBC.SimpleRenderer).three.domElement,
				})) as {localId?: number} | null;
				const home = hit && typeof hit.localId === "number" ? (id2home.get(hit.localId) ?? null) : null;
				await set(home);
				if (home) {
					titleEl.textContent = home; // hovered house code (e.g. DP4-2050)
					await repositionCard();
				} else card.style.opacity = "0";
			} finally {
				busy = false;
			}
		}
		container.addEventListener("mousemove", (e) => {
			if (!id2home) return;
			client = {x: e.clientX, y: e.clientY};
			if (!raf) raf = requestAnimationFrame(() => void tick());
		});
		container.addEventListener("mouseleave", () => {
			client = null;
			card.style.opacity = "0";
			void set(null);
		});

		// Click a house → tell the parent app to zoom into the villa. Same message shape SiteView already
		// listens for. A drag is an orbit, not a click, so ignore it.
		let downX = 0,
			downY = 0;
		container.addEventListener("mousedown", (e) => {
			downX = e.clientX;
			downY = e.clientY;
		});
		container.addEventListener("mouseup", (e) => {
			if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // dragged → orbit, not a click
			if (!curHouse) return; // clicked empty ground, not a house
			const r = container.getBoundingClientRect();
			window.parent.postMessage(
				{type: "ue22-part-click", house: curHouse, level: null, point: {x: e.clientX - r.left, y: e.clientY - r.top}},
				"*",
			);
		});

		// Pick the house nearest the site centre — a central hero for TV mode to frame by default.
		async function pickCentralHouse(): Promise<string | null> {
			if (!home2ids) return null;
			let best: string | null = null;
			let bestDist = Infinity;
			for (const home of home2ids.keys()) {
				const box = await boxFor(home);
				if (!box) continue;
				const hc = box.getCenter(new THREE.Vector3());
				const dist = Math.hypot(hc.x - c.x, hc.z - c.z);
				if (dist < bestDist) {
					bestDist = dist;
					best = home;
				}
			}
			return best;
		}

		// Spotlight the focused house (whitelist): darken the WHOLE site to a solid dark grey, then clear
		// the focused house back to its real material so only it reads lit. Covers ungrouped walls/slabs too.
		const DIM = new THREE.Color(0.28, 0.28, 0.3);
		async function focusHighlight(home: string) {
			if (!allIds || !home2ids) return;
			await clearFocusHighlight();
			await m.highlight(allIds, {color: DIM, renderedFaces: 1, opacity: 1, transparent: false});
			const focusIds = home2ids.get(home);
			if (focusIds?.length) await m.resetHighlight(focusIds);
			greyedIds = allIds;
			await fragments.core.update(true);
		}
		async function clearFocusHighlight() {
			if (greyedIds.length) await m.resetHighlight(greyedIds);
			greyedIds = [];
			await fragments.core.update(true);
		}

		// Progress overlay: grey the WHOLE site first (so any element without a categorised villa —
		// e.g. a house code the matcher misses, or ungrouped walls/slabs — reads neutral grey), then
		// paint only the categorised villas over it, grouped by colour (a handful of highlight calls).
		// Hover recolour is suppressed while active.
		const UNASSIGNED_GREY = "#9ca3af";
		let progressActive = false;
		async function setProgressColors(colors: Record<string, string>) {
			if (!home2ids || !allIds) return;
			interactive = false;
			card.style.opacity = "0";
			await set(null);
			// Match case-insensitively — the model's element names may not match the dataset key casing.
			const byUpper: Record<string, string> = {};
			for (const [code, hex] of Object.entries(colors)) byUpper[code.toUpperCase()] = hex;
			// 1) Everything grey (the "uncategorised" baseline).
			await m.highlight(allIds, {color: new THREE.Color(UNASSIGNED_GREY), renderedFaces: 1, opacity: 1, transparent: false});
			// 2) Categorised villas painted over the grey (villas with no colour stay grey).
			const byColor = new Map<string, number[]>();
			for (const [home, ids] of home2ids) {
				const hex = byUpper[home.toUpperCase()];
				if (!hex) continue;
				const bucket = byColor.get(hex) ?? [];
				bucket.push(...ids);
				byColor.set(hex, bucket);
			}
			for (const [hex, ids] of byColor) {
				await m.highlight(ids, {color: new THREE.Color(hex), renderedFaces: 1, opacity: 1, transparent: false});
			}
			progressActive = true;
			await fragments.core.update(true);
		}
		async function clearProgress() {
			const toReset = allIds ?? (home2ids ? [...home2ids.values()].flat() : []);
			if (toReset.length) await m.resetHighlight(toReset);
			progressActive = false;
			interactive = true;
			await fragments.core.update(true);
		}

		return {
			hasData: () => id2home != null && home2ids != null,
			boxFor,
			pickCentralHouse,
			houseList: () => (home2ids ? [...home2ids.keys()].sort() : []),
			setInteractive: (enabled: boolean) => {
				interactive = enabled;
			},
			focusHighlight,
			clearFocusHighlight,
			setProgressColors,
			clearProgress,
			isProgressActive: () => progressActive,
		};
	}

	// --- Block representation ("No Assets" view) -----------------------------
	// Hide the detailed walls/slabs and draw each villa as one massing block (its axis-aligned bounding
	// box) over the ortho. Hover, click-into-villa, progress colours and TV focus all operate on the
	// blocks, so SiteView and the drill-into-house transition are unchanged. Picking uses a plain
	// raycaster against the block meshes — independent of the (now hidden) fragments geometry.
	async function setupBlocks(m: NonNullable<typeof model>, siteCenter: THREE.Vector3): Promise<SiteApi> {
		const idx = await indexHouses(m);
		const home2ids = idx?.home2ids ?? new Map<string, number[]>();

		const DEFAULT_BLOCK = new THREE.Color("#e7ebf1"); // clean light massing over the satellite ortho
		const HOVER_BLOCK = new THREE.Color(0.13, 0.5, 1); // same blue the assets view uses on hover
		const DIM_BLOCK = new THREE.Color(0.28, 0.28, 0.3); // TV-mode / focus grey-out
		const UNASSIGNED = new THREE.Color("#9ca3af"); // a villa with no progress colour

		// MeshStandard blocks need light; the ortho is an unlit MeshBasic plane, so these only shade blocks.
		const sun = new THREE.DirectionalLight(0xffffff, 2.4);
		sun.position.set(0.5, 1, 0.35).multiplyScalar(1000);
		world.scene.three.add(sun);
		world.scene.three.add(new THREE.HemisphereLight(0xffffff, 0x9fb0c3, 1.1));

		// One massing block per house, from the union bbox of its wall/slab elements.
		const blocks = new THREE.Group();
		const blockFor = new Map<string, THREE.Mesh>();
		const homeBox = new Map<string, THREE.Box3>();
		const baseColor = new Map<string, THREE.Color>(); // the block's colour when not hovered/dimmed
		const boxer = components.get(OBC.BoundingBoxer);
		for (const [home, ids] of home2ids) {
			boxer.list.clear();
			await boxer.addFromModelIdMap({"site-b": new Set(ids)});
			const box = boxer.get().clone();
			boxer.list.clear();
			if (box.isEmpty()) continue;
			homeBox.set(home, box);
			const size = box.getSize(new THREE.Vector3());
			const centre = box.getCenter(new THREE.Vector3());
			const height = Math.max(size.y, 3); // floor the height so a slab-only footprint still reads solid
			// A hair of inset (0.4 m) so neighbouring blocks read as separate volumes.
			const geo = new THREE.BoxGeometry(Math.max(size.x - 0.4, 0.5), height, Math.max(size.z - 0.4, 0.5));
			const mat = new THREE.MeshStandardMaterial({color: DEFAULT_BLOCK.clone(), roughness: 0.9, metalness: 0});
			const mesh = new THREE.Mesh(geo, mat);
			mesh.position.set(centre.x, box.min.y + height / 2, centre.z);
			mesh.userData.home = home;
			// Crisp edges so the massing reads architecturally rather than as a flat cuboid.
			const edges = new THREE.LineSegments(
				new THREE.EdgesGeometry(geo),
				new THREE.LineBasicMaterial({color: 0x1f2937, transparent: true, opacity: 0.25}),
			);
			mesh.add(edges);
			blocks.add(mesh);
			blockFor.set(home, mesh);
			baseColor.set(home, DEFAULT_BLOCK.clone());
		}
		world.scene.three.add(blocks);
		m.object.visible = false; // hide the detailed geometry — this is the "no assets" representation
		fragments.core.update(true);

		const matOf = (home: string) => blockFor.get(home)?.material as THREE.MeshStandardMaterial | undefined;
		const paint = (home: string, color: THREE.Color) => {
			const mat = matOf(home);
			if (mat) mat.color.copy(color);
		};

		const {card, titleEl} = createVillaCard();
		let curHouse: string | null = null;
		let interactive = true;
		let progressActive = false;
		let focusedHouse: string | null = null;

		function boxFor(home: string): Promise<THREE.Box3 | null> {
			return Promise.resolve(homeBox.get(home) ?? null);
		}

		// Position the card centred above the current house — project its box top-centre to screen.
		function repositionCard() {
			if (!curHouse) return;
			const box = homeBox.get(curHouse);
			if (!box) return;
			const top = new THREE.Vector3((box.min.x + box.max.x) / 2, box.max.y, (box.min.z + box.max.z) / 2).project(
				world.camera.three,
			);
			const r = container.getBoundingClientRect();
			card.style.left = `${(top.x * 0.5 + 0.5) * r.width}px`;
			card.style.top = `${(-top.y * 0.5 + 0.5) * r.height - 12}px`;
			card.style.opacity = top.z < 1 ? "1" : "0";
		}
		world.camera.controls.addEventListener("update", () => repositionCard());

		// Recolour on hover: previous house back to base, new one to hover blue. Suppressed while a progress
		// overlay or a TV focus owns the colours.
		function setHover(home: string | null) {
			if (home === curHouse) return;
			if (curHouse && !progressActive && curHouse !== focusedHouse) paint(curHouse, baseColor.get(curHouse) ?? DEFAULT_BLOCK);
			curHouse = home;
			if (home) {
				if (!progressActive && home !== focusedHouse) paint(home, HOVER_BLOCK);
				titleEl.textContent = home;
				repositionCard();
			} else {
				card.style.opacity = "0";
			}
			fragments.core.update(true);
		}

		const raycaster = new THREE.Raycaster();
		function pick(clientX: number, clientY: number): string | null {
			const r = container.getBoundingClientRect();
			const ndc = new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
			raycaster.setFromCamera(ndc, world.camera.three);
			const hit = raycaster.intersectObjects(blocks.children, false)[0];
			return hit ? ((hit.object.userData.home as string) ?? null) : null;
		}

		container.addEventListener("mousemove", (e) => {
			if (!interactive) return;
			setHover(pick(e.clientX, e.clientY));
		});
		container.addEventListener("mouseleave", () => setHover(null));

		// Click a house → the same drill-into-villa message SiteView listens for. A drag is an orbit.
		let downX = 0,
			downY = 0;
		container.addEventListener("mousedown", (e) => {
			downX = e.clientX;
			downY = e.clientY;
		});
		container.addEventListener("mouseup", (e) => {
			if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
			if (!curHouse) return;
			const r = container.getBoundingClientRect();
			window.parent.postMessage(
				{type: "ue22-part-click", house: curHouse, level: null, point: {x: e.clientX - r.left, y: e.clientY - r.top}},
				"*",
			);
		});

		async function pickCentralHouse(): Promise<string | null> {
			let best: string | null = null;
			let bestDist = Infinity;
			for (const [home, box] of homeBox) {
				const hc = box.getCenter(new THREE.Vector3());
				const dist = Math.hypot(hc.x - siteCenter.x, hc.z - siteCenter.z);
				if (dist < bestDist) {
					bestDist = dist;
					best = home;
				}
			}
			return best;
		}

		// Spotlight one house for TV mode: dim every other block to grey, keep the focus at its base colour.
		async function focusHighlight(home: string) {
			focusedHouse = home;
			for (const h of blockFor.keys()) paint(h, h === home ? (baseColor.get(h) ?? DEFAULT_BLOCK) : DIM_BLOCK);
			fragments.core.update(true);
		}
		async function clearFocusHighlight() {
			focusedHouse = null;
			for (const h of blockFor.keys()) paint(h, baseColor.get(h) ?? DEFAULT_BLOCK);
			fragments.core.update(true);
		}

		// Progress overlay: colour each block by its villa's construction-progress colour (grey when none).
		async function setProgressColors(colors: Record<string, string>) {
			interactive = false;
			setHover(null);
			const byUpper: Record<string, string> = {};
			for (const [code, hex] of Object.entries(colors)) byUpper[code.toUpperCase()] = hex;
			for (const home of blockFor.keys()) {
				const hex = byUpper[home.toUpperCase()];
				const col = hex ? new THREE.Color(hex) : UNASSIGNED.clone();
				baseColor.set(home, col);
				if (home !== focusedHouse) paint(home, focusedHouse ? DIM_BLOCK : col);
			}
			progressActive = true;
			fragments.core.update(true);
		}
		async function clearProgress() {
			for (const home of blockFor.keys()) {
				baseColor.set(home, DEFAULT_BLOCK.clone());
				if (home !== focusedHouse) paint(home, focusedHouse ? DIM_BLOCK : DEFAULT_BLOCK);
			}
			progressActive = false;
			interactive = true;
			fragments.core.update(true);
		}

		return {
			hasData: () => blockFor.size > 0,
			boxFor,
			pickCentralHouse,
			houseList: () => [...blockFor.keys()].sort(),
			setInteractive: (enabled: boolean) => {
				interactive = enabled;
			},
			focusHighlight,
			clearFocusHighlight,
			setProgressColors,
			clearProgress,
			isProgressActive: () => progressActive,
		};
	}

	// --- Site TV mode: fly the camera onto a single house (or back to overview) ---
	// The parent app (SiteView) drives this over postMessage:
	//   { type: "site-tv-focus", house?: string }  → cinematic 3/4 fly onto one house
	//   { type: "site-tv-exit" }                    → glide back to the site overview
	// A focus that arrives while the house index is still loading is queued and runs once it's ready.
	function setupTvMode(hover: SiteApi) {
		const controls = world.camera.controls;
		// Remember the current overview framing so exit returns to exactly where we started.
		const homePos = controls.getPosition(new THREE.Vector3());
		const homeTgt = controls.getTarget(new THREE.Vector3());

		async function focusHouse(code?: string | null) {
			const home = code ?? (await hover.pickCentralHouse());
			if (!home) return;
			const box = await hover.boxFor(home);
			if (!box) return;
			// Suppress hover recolour and brighten the hero house by 10% while it's framed.
			hover.setInteractive(false);
			void hover.focusHighlight(home);
			const hc = box.getCenter(new THREE.Vector3());
			const radius = Math.max(box.getBoundingSphere(new THREE.Sphere()).radius, 1);
			// Cinematic 3/4 view: 45° azimuth, 32° downward pitch, distance sized to the house. The 4.0
			// multiplier sits 25% further out than the original 3.2 (a 25% zoom-out).
			const pitch = (32 * Math.PI) / 180;
			const az = (45 * Math.PI) / 180;
			const dir = new THREE.Vector3(
				Math.cos(pitch) * Math.cos(az),
				Math.sin(pitch),
				Math.cos(pitch) * Math.sin(az),
			);
			const cam = hc.clone().add(dir.multiplyScalar(radius * 4.0));
			await controls.setLookAt(cam.x, cam.y, cam.z, hc.x, hc.y, hc.z, true);
			// Shift the house to the LEFT so the kiosk panel on the right doesn't cover it: a positive x
			// focal offset moves the pivot right, sliding the framed house left of centre.
			void controls.setFocalOffset(radius * 0.85, 0, 0, true);
		}

		async function resetView() {
			// Drop the brightness highlight and re-enable hover, undo the left shift, glide back to overview.
			void hover.clearFocusHighlight();
			hover.setInteractive(true);
			void controls.setFocalOffset(0, 0, 0, true);
			await controls.setLookAt(homePos.x, homePos.y, homePos.z, homeTgt.x, homeTgt.y, homeTgt.z, true);
		}

		// `undefined` = nothing queued; `null`/string = a focus waiting for the house index to load.
		let pendingFocus: string | null | undefined = undefined;
		const runPending = () => {
			if (pendingFocus === undefined || !hover.hasData()) return;
			const home = pendingFocus;
			pendingFocus = undefined;
			void focusHouse(home);
		};
		// Progress overlay queued the same way: undefined = nothing, a map = apply, null = clear.
		let pendingProgress: Record<string, string> | null | undefined = undefined;
		const runPendingProgress = () => {
			if (pendingProgress === undefined || !hover.hasData()) return;
			const next = pendingProgress;
			pendingProgress = undefined;
			if (next === null) void hover.clearProgress();
			else void hover.setProgressColors(next);
		};
		const poll = window.setInterval(() => {
			if (!hover.hasData()) return;
			// Publish the house code list up to the parent so the kiosk can loop through them.
			window.parent.postMessage({type: "site-houses", houses: hover.houseList()}, "*");
			runPending();
			runPendingProgress();
			window.clearInterval(poll);
		}, 150);

		window.addEventListener("message", (e) => {
			const data = e.data as {type?: string; house?: string | null; colors?: Record<string, string>} | null;
			if (!data) return;
			if (data.type === "site-tv-focus") {
				pendingFocus = data.house ?? null;
				runPending();
			} else if (data.type === "site-tv-exit") {
				pendingFocus = undefined;
				void resetView();
			} else if (data.type === "site-progress-colors") {
				pendingProgress = data.colors ?? {};
				runPendingProgress();
			} else if (data.type === "site-progress-clear") {
				pendingProgress = null;
				runPendingProgress();
			}
		});
	}
}
void main();
