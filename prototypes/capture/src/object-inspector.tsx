import * as OBC from "@thatopen/components";
import {useFragmentViewer} from "@corensystem/core-ui/fragment-viewer";
import {X} from "lucide-react";
import {type CSSProperties, useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";

import {VILLA_SCHEDULE} from "./timeline/villa-schedule";

// ── Object inspector (Figma "Capture Admin Redesign", node 1858:6191) ────────────────────────────────
// Shown in place of the floor header/progress/stats when an object is selected — on the model or via the
// schedule. It resolves the picked object from public/schedule.json (by objectId, or by an IFC GUID from
// a model pick) and shows its category, storey, a measurement, an outline glyph, and its active +
// upcoming tasks. The construction schedule stays below it (owned by the inspector).

/** How an object was selected: by its schedule object id (schedule click) or an IFC GUID (model pick).
 *  A model pick also carries the picked element's IFC category, used when the guid isn't in the schedule. */
export type ObjectSelection = {objectId: string} | {guid: string; category?: string | null};

// Minimal shapes from schedule.json — only what this panel needs.
interface SchedObject {
	id: string;
	label: string;
	ifcType: string;
	storey: string;
	count: number;
	guids: string[];
}
interface SchedTask {
	id: string;
	name: string;
	objectId: string;
	startDay: number;
	duration: number;
	tradeColor: string;
}
interface SchedData {
	meta: {projectStart: string; totalDays: number};
	objects: SchedObject[];
	tasks: SchedTask[];
}

/** The resolved, presentational object info. */
export interface ResolvedObject {
	/** The schedule object id (null for an off-schedule model pick) — used to filter the schedule to it. */
	id: string | null;
	category: string;
	storey: string;
	measurement: string;
	/** IFC GUIDs of the object's elements — used to pull its real geometry for the mini 3D render. */
	guids: string[];
	/** Schedule id of the active task — used to highlight it in the construction schedule. */
	activeTaskId: string | null;
	activeTask: {name: string; color: string} | null;
	upcomingTask: {name: string; color: string} | null;
}

const DAY_MS = 86400000;
// The real villa schedule, adapted from the P6 export (single source; no fetch).
const scheduleData = VILLA_SCHEDULE as unknown as SchedData;

// Stable pseudo-dimensions for the object — the prototype has no per-element geometry to measure, so
// this keeps the Figma's "Measurement" field meaningful and consistent per object.
function pseudoMeasurement(obj: SchedObject): string {
	let h = 0;
	for (const ch of obj.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return `${3 + (h % 22)}m x ${1 + ((h >>> 5) % 6)}m`;
}

/** Resolve the selected object (and its active/upcoming tasks) from the schedule. */
export function useResolvedObject(sel: ObjectSelection | null): ResolvedObject | null {
	const data = scheduleData;

	return useMemo(() => {
		if (!sel) return null;
		const obj = !data
			? undefined
			: "objectId" in sel
				? data.objects.find((o) => o.id === sel.objectId)
				: data.objects.find((o) => o.guids.includes(sel.guid));
		if (!data || !obj) {
			// Not in the schedule (most model picks) or still loading — return a minimal card so there's
			// always a back arrow and never a headerless / stuck panel.
			return {
				id: null,
				category: ("guid" in sel && sel.category) || "Element",
				storey: "—",
				measurement: "—",
				guids: "guid" in sel ? [sel.guid] : [],
				activeTaskId: null,
				activeTask: null,
				upcomingTask: null,
			};
		}
		const todayDay = Math.floor((Date.parse(new Date().toISOString().slice(0, 10)) - Date.parse(data.meta.projectStart)) / DAY_MS);
		const tasks = data.tasks.filter((t) => t.objectId === obj.id).sort((a, b) => a.startDay - b.startDay);
		// Active = the task in progress today, else the most recently finished, else the first task.
		const inProgress = tasks.find((t) => t.startDay <= todayDay && todayDay < t.startDay + t.duration);
		const done = tasks.filter((t) => t.startDay + t.duration <= todayDay);
		const active = inProgress ?? done[done.length - 1] ?? tasks[0] ?? null;
		const upcoming = tasks.find((t) => t.startDay > todayDay) ?? null;
		return {
			id: obj.id,
			category: obj.ifcType || obj.label || "Element",
			storey: obj.storey,
			measurement: pseudoMeasurement(obj),
			guids: obj.guids,
			activeTaskId: active?.id ?? null,
			activeTask: active ? {name: active.name, color: active.tradeColor} : null,
			upcomingTask: upcoming ? {name: upcoming.name, color: upcoming.tradeColor} : null,
		};
	}, [sel, data]);
}

// Rough box dimensions (px) from the object's measurement string, normalised so the longest edge reads
// well and no edge is so thin the box looks flat. Falls back to a chunky cuboid when there's no measure.
function boxDims(measurement: string): {w: number; h: number; d: number} {
	const nums = (measurement.match(/\d+(?:\.\d+)?/g) ?? []).map(Number);
	const a = nums[0] || 6;
	const b = nums[1] || a;
	const raw = {w: a, h: b, d: Math.max(1, Math.min(a, b) * 0.6)};
	const scale = 60 / Math.max(raw.w, raw.h, raw.d);
	const floor = 22; // keep thin dims readable so it always reads as a 3D box
	return {w: Math.max(floor, raw.w * scale), h: Math.max(floor, raw.h * scale), d: Math.max(floor, raw.d * scale)};
}

// The object's "mini 3D render": a rotating wireframe cuboid (outline only), built with CSS 3D so it
// renders anywhere (no WebGL). Sized to the object's rough proportions.
function OutlineModel3D({measurement, className}: {measurement: string; className?: string}) {
	const {w, h, d} = boxDims(measurement);
	const skin: CSSProperties = {
		position: "absolute",
		left: "50%",
		top: "50%",
		boxSizing: "border-box",
		border: "1px solid rgba(107,114,128,0.75)",
		background: "rgba(156,163,175,0.05)",
	};
	const faces: CSSProperties[] = [
		{...skin, width: w, height: h, transform: `translate(-50%,-50%) translateZ(${d / 2}px)`},
		{...skin, width: w, height: h, transform: `translate(-50%,-50%) rotateY(180deg) translateZ(${d / 2}px)`},
		{...skin, width: d, height: h, transform: `translate(-50%,-50%) rotateY(90deg) translateZ(${w / 2}px)`},
		{...skin, width: d, height: h, transform: `translate(-50%,-50%) rotateY(-90deg) translateZ(${w / 2}px)`},
		{...skin, width: w, height: d, transform: `translate(-50%,-50%) rotateX(90deg) translateZ(${h / 2}px)`},
		{...skin, width: w, height: d, transform: `translate(-50%,-50%) rotateX(-90deg) translateZ(${h / 2}px)`},
	];
	return (
		<div className={className} style={{position: "relative", perspective: "460px"}} aria-hidden="true">
			{/* Fixed isometric tilt; the inner box spins on Y. */}
			<div style={{position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: "rotateX(-18deg)"}}>
				<div
					style={{
						position: "absolute",
						left: "50%",
						top: "50%",
						width: w,
						height: h,
						marginLeft: -w / 2,
						marginTop: -h / 2,
						transformStyle: "preserve-3d",
						animation: "outline-spin 14s linear infinite",
					}}
				>
					{faces.map((face, i) => (
						<div key={i} style={face} />
					))}
				</div>
			</div>
		</div>
	);
}

// The FragmentViewer context when the card is rendered inside one; null otherwise (so the real 3D
// render is attempted only when a live model is available, else the outline fallback shows).
function useOptionalFragmentViewer(): ReturnType<typeof useFragmentViewer> | null {
	try {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useFragmentViewer();
	} catch {
		return null;
	}
}

// Just enough of the fragments model for pulling one object's geometry.
type FragModel = {
	getLocalIdsByGuids(guids: string[]): Promise<(number | null)[]>;
	getItemsGeometry(localIds: number[]): Promise<
		Array<
			Array<{
				positions?: Float32Array | Float64Array;
				indices?: Uint8Array | Uint16Array | Uint32Array;
				transform?: THREE.Matrix4;
			}>
		>
	>;
};

/**
 * The object's real 3D geometry, pulled from the fragments model (`getItemsGeometry`) and rendered as a
 * small rotating SOLID in its own mini three.js scene — solid reads best for real BIM geometry (a
 * wireframe of dense IFC meshes is just noise). Falls back to the CSS outline box when there's no live
 * model / WebGL, or the object has no resolvable geometry (e.g. an off-schedule pick). 3D-only, so the
 * fallback is what renders in a headless browser.
 */
function ObjectModelPreview({guids, measurement, className}: {guids: string[]; measurement: string; className?: string}) {
	const viewer = useOptionalFragmentViewer();
	const viewerRef = useRef(viewer);
	viewerRef.current = viewer;
	const status = viewer?.state.status;
	const guidsKey = guids.join(",");
	const rootRef = useRef<HTMLDivElement>(null);
	const hostRef = useRef<HTMLDivElement>(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(false);
		const host = hostRef.current;
		const root = rootRef.current;
		const components = viewerRef.current?.api.viewport()?.components;
		if (!host || !root || !components || status !== "ready" || guids.length === 0) return;

		let disposed = false;
		let raf = 0;
		let renderer: THREE.WebGLRenderer | null = null;
		const disposables: Array<{dispose(): void}> = [];

		void (async () => {
			const model = [...components.get(OBC.FragmentsManager).list.values()][0] as unknown as FragModel | undefined;
			if (!model || disposed) return;
			const localIds = (await model.getLocalIdsByGuids(guids)).filter((x): x is number => typeof x === "number");
			if (!localIds.length || disposed) return;
			const meshDatas = await model.getItemsGeometry(localIds);
			if (disposed) return;

			const material = new THREE.MeshStandardMaterial({color: 0xcbd2da, metalness: 0.05, roughness: 0.85, flatShading: true});
			disposables.push(material);
			const group = new THREE.Group();
			for (const arr of meshDatas) {
				for (const md of arr) {
					if (!md?.positions || !md?.indices) continue;
					const geometry = new THREE.BufferGeometry();
					geometry.setAttribute("position", new THREE.Float32BufferAttribute(md.positions, 3));
					geometry.setIndex(new THREE.BufferAttribute(md.indices, 1));
					geometry.computeVertexNormals();
					if (md.transform) geometry.applyMatrix4(md.transform);
					disposables.push(geometry);
					group.add(new THREE.Mesh(geometry, material));
				}
			}
			if (!group.children.length || disposed) return;

			// Centre on the OBJECT's own centre by baking the offset into the geometry vertices (not the
			// group transform). The source vertices sit at real-world BIM coordinates, so a huge group
			// offset would wreck float precision and scatter the mesh — translating the vertices to the
			// origin keeps them small and centres on the object itself, not the whole model.
			const box = new THREE.Box3().setFromObject(group);
			const center = box.getCenter(new THREE.Vector3());
			const size = box.getSize(new THREE.Vector3());
			for (const child of group.children) {
				(child as THREE.Mesh).geometry.translate(-center.x, -center.y, -center.z);
			}
			const maxDim = Math.max(size.x, size.y, size.z) || 1;

			// Measure the always-visible container (the host is display:none until ready, so it'd measure 0).
			const rect = root.getBoundingClientRect();
			const w = Math.max(1, Math.round(rect.width)) || 220;
			const h = Math.max(1, Math.round(rect.height)) || 92;
			renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
			renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
			// Buffer at the measured size, but let the canvas CSS-fill the slot so the render is always
			// centred in (and fills) the container — regardless of the measured size or its alignment.
			renderer.setSize(w, h, false);
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "100%";
			renderer.domElement.style.display = "block";
			host.appendChild(renderer.domElement);

			const scene = new THREE.Scene();
			scene.add(new THREE.AmbientLight(0xffffff, 0.75));
			const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
			keyLight.position.set(1, 2, 1.5);
			scene.add(keyLight);
			scene.add(group);

			// Frame the object (centred at the origin), a touch closer than an exact fit so it fills the slot.
			const fov = 32;
			const camera = new THREE.PerspectiveCamera(fov, w / h, maxDim * 0.01, maxDim * 100);
			const fitDist = (maxDim / 2 / Math.tan((fov * Math.PI) / 360)) * 1.05; // a touch larger than an exact fit
			camera.position.copy(new THREE.Vector3(0.7, 0.5, 1).normalize().multiplyScalar(fitDist));
			camera.lookAt(0, 0, 0);

			setReady(true);
			const tick = () => {
				group.rotation.y += 0.006; // half the previous rate
				renderer?.render(scene, camera);
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		})();

		return () => {
			disposed = true;
			cancelAnimationFrame(raf);
			for (const d of disposables) d.dispose();
			if (renderer) {
				renderer.dispose();
				renderer.domElement.remove();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [guidsKey, status]);

	return (
		<div ref={rootRef} className={className} style={{position: "relative"}}>
			<div ref={hostRef} className="wwc:absolute wwc:inset-0" style={{display: ready ? "block" : "none"}} />
			{!ready && <OutlineModel3D measurement={measurement} className="wwc:h-full wwc:w-full" />}
		</div>
	);
}

function ObjTask({label, task}: {label: string; task: {name: string; color: string} | null}) {
	return (
		<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col wwc:gap-0.5">
			<span className="wwc:text-[12px] wwc:text-[#6b7280]">{label}</span>
			<div className="wwc:flex wwc:min-w-0 wwc:items-center wwc:gap-[3px]">
				{task ? (
					<>
						<span className="wwc:size-3 wwc:shrink-0 wwc:rounded-[2px]" style={{backgroundColor: task.color}} />
						<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-[13px] wwc:font-semibold wwc:text-[#6b7280]">
							{task.name}
						</span>
					</>
				) : (
					<span className="wwc:text-[13px] wwc:font-semibold wwc:text-[#9ca3af]">—</span>
				)}
			</div>
		</div>
	);
}

/** The object info card: category + storey + close, measurement, outline glyph, active + upcoming tasks. */
export function ObjectInspectorCard({info, onClose}: {info: ResolvedObject; onClose: () => void}) {
	return (
		<div className="wwc:relative wwc:flex wwc:shrink-0 wwc:flex-col wwc:gap-3 wwc:overflow-hidden wwc:rounded wwc:border wwc:border-[rgba(255,255,255,0.5)] wwc:bg-[rgba(255,255,255,0.8)] wwc:p-3 wwc:shadow-[0_12px_40px_rgba(0,0,0,0.05)] wwc:backdrop-blur-lg">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<span className="wwc:truncate wwc:text-[16px] wwc:font-semibold wwc:leading-tight wwc:text-[#374151]">
					{info.category}
				</span>
				<span className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-right wwc:text-[12px] wwc:text-[#6b7280]">
					{info.storey}
				</span>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="wwc:shrink-0 wwc:text-[#111827] wwc:opacity-50 wwc:transition-opacity wwc:hover:opacity-100 wwc:focus-visible:outline-none"
				>
					<X className="wwc:size-4" />
				</button>
			</div>

			<div className="wwc:flex wwc:flex-col wwc:text-[#6b7280]">
				<span className="wwc:text-[12px]">Measurement</span>
				<span className="wwc:text-[13px] wwc:font-semibold">{info.measurement}</span>
			</div>

			<ObjectModelPreview
				guids={info.guids}
				measurement={info.measurement}
				className="wwc:mx-auto wwc:my-1 wwc:h-[112px] wwc:w-full"
			/>

			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<ObjTask label="Active Task" task={info.activeTask} />
				<ObjTask label="Upcoming" task={info.upcomingTask} />
			</div>
		</div>
	);
}

/** The object card shown floating near a clicked object — resolves the selection and renders the card. */
export function FloatingObjectCard({sel, onClose}: {sel: ObjectSelection; onClose: () => void}) {
	const info = useResolvedObject(sel);
	if (!info) return null;
	return <ObjectInspectorCard info={info} onClose={onClose} />;
}
