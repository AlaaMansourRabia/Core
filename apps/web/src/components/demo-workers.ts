import type {FragmentMarker} from "@wakecap/core-ui/fragment-viewer";
import type * as THREE from "three";

import * as OBC from "@thatopen/components";

// Demo worker positions for the Site Reality stage.
//
// There is no worker-location dataset for this model — the WC3 dataset carries one OpenSpace walk
// capture for the villa site, in UTM, and nothing for this building. So positions are sampled from
// the model's own slab geometry: pick random floor slabs and stand a worker on top of one. That
// keeps every marker on a real floor at a real level, which random points in the bounding box
// would not, and it exercises the same code path real data will use.
//
// Replacing this with live data means supplying the same shape — see WORKER_DATA_CONTRACT below.

export interface DemoWorkerOptions {
	count: number;
	/** Share of workers drawn as active. The rest read as idle. */
	activeShare?: number;
}

/** Integer hash in [0,1). Seeded per axis so x, z, slab and status draw independently. */
function hash(index: number, seed: number): number {
	let value = (index + seed * 0x9e3779b9) >>> 0;
	value = Math.imul(value ^ (value >>> 15), value | 1);
	value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
	return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

/** Slab tops within this vertical distance are treated as the same storey. */
const LEVEL_TOLERANCE_M = 1.5;

/** Shortest element accepted as a wall or floor plate, metres. Below this it is trim. */
const MIN_ELEMENT_LENGTH_M = 1.5;

/** Elements shorter than this are parapets and copings, not storey-height walls. */
const MIN_ELEMENT_HEIGHT_M = 2;

/** Keep placements away from element ends, as a fraction of its length. */
const EDGE_MARGIN = 0.15;

/** How far inward from an element a worker stands, metres. */
const INWARD_OFFSET_M = 0.8;

/** Total slab area below which a cluster is a sliver, not a floor. */
const MIN_LEVEL_AREA_M2 = 40;

const ACTIVE_COLOR = "#22c55e";
const IDLE_COLOR = "#f59e0b";

/**
 * What real worker data has to provide to replace this:
 *
 * - `position`: [x, y, z] in the MODEL's coordinate frame, metres, Y-up. Tracking systems usually
 *   emit site or UTM coordinates, so something has to apply the same artifact→runtime transform the
 *   dataset catalog documents (`coordinateFrames`). Getting this wrong puts everyone in the car park.
 * - `id`: stable per worker, so a click can look them up.
 * - a status to colour by, and ideally the storey, so the Levels view can filter to one floor.
 */
export const WORKER_DATA_CONTRACT = "position (model frame, metres) + stable id + status";

/** The category whose geometry spans the most storeys, with where its floor sits in each box. */
async function bestFloorSource(
	model: {
		getItemsOfCategories(patterns: RegExp[]): Promise<Record<string, number[]>>;
		getBoxes(ids: number[]): Promise<THREE.Box3[]>;
	},
	candidates: {pattern: RegExp; anchor: "top" | "bottom"}[],
) {
	let best: {boxes: THREE.Box3[]; anchor: "top" | "bottom"; levels: number} | null = null;
	for (const candidate of candidates) {
		const found = await model.getItemsOfCategories([candidate.pattern]);
		const ids = Object.values(found).flat();
		if (ids.length === 0) continue;
		const boxes = await model.getBoxes(ids);
		if (boxes.length === 0) continue;
		const levels = new Set(
			boxes.map((box) => {
				const floorY = candidate.anchor === "bottom" ? box.min.y : box.max.y;
				return Math.round(floorY / LEVEL_TOLERANCE_M);
			}),
		).size;
		if (!best || levels > best.levels) best = {boxes, anchor: candidate.anchor, levels};
	}
	return best;
}

/** Sample positions on the floors of the loaded model. */
export async function sampleDemoWorkers(
	components: OBC.Components,
	{count, activeShare = 0.77}: DemoWorkerOptions,
): Promise<FragmentMarker[]> {
	const fragments = components.get(OBC.FragmentsManager);
	const markers: FragmentMarker[] = [];

	for (const [, model] of fragments.list) {
		// Which category describes the floors varies by model, so pick whichever spans the most
		// storeys rather than trusting one. Measured on this file: 24 slabs at 3 elevations and 187
		// spaces also at 3, while wall bases and floor finishes reach every storey — picking the
		// "obvious" category left most of the building empty.
		const source = await bestFloorSource(model, [
			{pattern: /IFCSPACE/, anchor: "bottom"},
			{pattern: /COVERING/, anchor: "top"},
			{pattern: /WALLSTANDARDCASE/, anchor: "bottom"},
			{pattern: /SLAB/, anchor: "top"},
		]);
		if (!source) continue;
		const {anchor} = source;

		// Reject slivers, but apply the height test only to wall-like sources. Floor finishes are
		// ~50 mm thick, so a blanket "must be 2 m tall" rule throws every floor away — which is exactly
		// how this ended up drawing nothing at all.
		const boxes = source.boxes.filter((box) => {
			if (Math.max(box.max.x - box.min.x, box.max.z - box.min.z) < MIN_ELEMENT_LENGTH_M) return false;
			if (anchor !== "bottom") return true;
			// Walls only: excludes parapets and copings, which put "workers" on roof ledges.
			return box.max.y - box.min.y >= MIN_ELEMENT_HEIGHT_M;
		});
		if (boxes.length === 0) continue;

		// Centre of the whole model, used to push each worker inward off its element.
		const footprint = boxes.reduce(
			(acc, box) => ({
				minX: Math.min(acc.minX, box.min.x),
				maxX: Math.max(acc.maxX, box.max.x),
				minZ: Math.min(acc.minZ, box.min.z),
				maxZ: Math.max(acc.maxZ, box.max.z),
			}),
			{minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity},
		);
		const centreX = (footprint.minX + footprint.maxX) / 2;
		const centreZ = (footprint.minZ + footprint.maxZ) / 2;

		// Group slabs into levels by their top elevation. Weighting slabs by area alone put almost
		// everyone on the two or three biggest plates, so whole floors came out empty — allocating
		// per level first is what guarantees people on every storey.
		const levels = new Map<number, {boxes: typeof boxes; area: number}>();
		for (const box of boxes) {
			const floorY = anchor === "bottom" ? box.min.y : box.max.y;
			const elevation = Math.round(floorY / LEVEL_TOLERANCE_M) * LEVEL_TOLERANCE_M;
			const level = levels.get(elevation) ?? {boxes: [] as typeof boxes, area: 0};
			level.boxes.push(box);
			level.area += (box.max.x - box.min.x) * (box.max.z - box.min.z);
			levels.set(elevation, level);
		}
		// Ignore slivers: a handful of tiny slabs at an odd height are not a storey.
		const floors = [...levels.entries()]
			.filter(([, level]) => level.area >= MIN_LEVEL_AREA_M2)
			.sort((a, b) => a[0] - b[0]);
		if (floors.length === 0) continue;

		const perFloor = Math.max(1, Math.floor(count / floors.length));
		let index = 0;
		for (const [, floor] of floors) {
			// Within a level, bigger plates still take proportionally more people.
			const cumulative: number[] = [];
			let running = 0;
			for (const box of floor.boxes) {
				running += (box.max.x - box.min.x) * (box.max.z - box.min.z);
				cumulative.push(running);
			}
			for (let n = 0; n < perFloor; n += 1, index += 1) {
				const pick = hash(index, 1) * running;
				let slab = cumulative.findIndex((edge) => edge >= pick);
				if (slab < 0) slab = floor.boxes.length - 1;
				const box = floor.boxes[slab];

				// Floor plates are walkable across their whole area; walls are not — for those, walk
				// *along* the element and step inward, or people end up off the wall and through the
				// façade.
				const spanX = box.max.x - box.min.x;
				const spanZ = box.max.z - box.min.z;
				let x: number;
				let z: number;
				if (anchor === "top") {
					x = box.min.x + spanX * (EDGE_MARGIN + hash(index, 2) * (1 - 2 * EDGE_MARGIN));
					z = box.min.z + spanZ * (EDGE_MARGIN + hash(index, 3) * (1 - 2 * EDGE_MARGIN));
				} else {
					const alongX = spanX >= spanZ;
					const t = EDGE_MARGIN + hash(index, 2) * (1 - 2 * EDGE_MARGIN);
					x = alongX ? box.min.x + spanX * t : (box.min.x + box.max.x) / 2;
					z = alongX ? (box.min.z + box.max.z) / 2 : box.min.z + spanZ * t;
					if (alongX) z += Math.sign(centreZ - z) * INWARD_OFFSET_M;
					else x += Math.sign(centreX - x) * INWARD_OFFSET_M;
				}

				markers.push({
					id: `w-${index}`,
					position: [x, (anchor === "bottom" ? box.min.y : box.max.y) + 0.9, z],
					color: hash(index, 4) < activeShare ? ACTIVE_COLOR : IDLE_COLOR,
				});
			}
		}
		break; // one model is enough for the demo
	}

	return markers;
}
