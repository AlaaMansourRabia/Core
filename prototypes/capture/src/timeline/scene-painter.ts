// BIM scene painting for the 4D timeline. Drives the ThatOpen Fragments model directly:
// resolves each schedule object's IFC GUIDs to per-model localIds, then per day reveals /
// highlights / hides exactly those elements so the building assembles itself as days advance.
//
// Element addressing (from the viewer architecture): model.getLocalIdsByGuids(guids) →
// localIds; paint via model.highlight(ids, material) / model.resetHighlight(ids) and
// OBC.Hider.set(visible, {[modelId]: Set<localId>}); always fragments.core.update(true) to repaint.

import type {MaterialDefinition} from "@thatopen/fragments";
import type {ObjectState, ScheduleObject} from "./types";

import * as OBC from "@thatopen/components";
import * as THREE from "three";

import {tradeColor} from "./trades";
import {objectStateAt} from "./types";

/** Objects being worked glow in their trade colour. Materials are cached per colour so playback
 *  doesn't churn THREE.Color allocations each frame. */
const MATERIAL_CACHE = new Map<string, MaterialDefinition>();
function materialFor(color: string): MaterialDefinition {
	let mat = MATERIAL_CACHE.get(color);
	if (!mat) {
		mat = {
			color: new THREE.Color(color),
			renderedFaces: 0,
			opacity: 1,
			transparent: false,
			preserveOriginalMaterial: false,
		} as unknown as MaterialDefinition;
		MATERIAL_CACHE.set(color, mat);
	}
	return mat;
}

/** Resolved geometry: schedule object id → the model localIds of its IFC elements. */
export interface ResolvedScene {
	modelId: string;
	model: {
		modelId: string;
		highlight(localIds: number[] | undefined, material: MaterialDefinition): Promise<void>;
		resetHighlight(localIds?: number[]): Promise<void>;
	};
	byObject: Map<string, number[]>;
	allWorked: number[];
}

function firstModel(components: OBC.Components) {
	const fragments = components.get(OBC.FragmentsManager);
	const model = [...fragments.list.values()][0];
	return {fragments, model};
}

/** The model methods we need for heuristic (storey × category) linkage. */
type LinkModel = {
	modelId: string;
	getItemsOfCategories(patterns: RegExp[]): Promise<Record<string, (number | null)[]>>;
};

/** Every element's localId grouped by the IfcBuildingStorey Name that contains it (via the Classifier's
 *  ContainsElements relation) — the same authored tags the storey isolation uses. */
async function storeyMemberSets(components: OBC.Components): Promise<Map<string, Set<number>>> {
	const classifier = components.get(OBC.Classifier);
	await classifier.byIfcBuildingStorey();
	const out = new Map<string, Set<number>>();
	const groups = classifier.list.get("Storeys");
	if (!groups) return out;
	for (const [storeyName, group] of groups) {
		const set = new Set<number>();
		for (const ids of Object.values(group.map)) for (const id of ids) set.add(id);
		out.set(storeyName, set);
	}
	return out;
}

/** localIds of every element whose IFC category matches one of the patterns. */
async function categoryIds(model: LinkModel, patterns: RegExp[]): Promise<number[]> {
	if (patterns.length === 0) return [];
	const items = await model.getItemsOfCategories(patterns);
	return Object.values(items)
		.flat()
		.filter((x): x is number => typeof x === "number");
}

/**
 * Resolve each object's model elements heuristically: the intersection of its storey's elements (from
 * the IFC spatial tags) and its discipline's IFC categories. P6 carries no GUIDs, so this stands in for
 * a shared id. Objects with no storey or no categories (sitework/structural — not in this federation)
 * resolve to nothing, as expected. Category lookups are cached per discipline.
 */
export async function resolveScene(components: OBC.Components, objects: ScheduleObject[]): Promise<ResolvedScene | null> {
	const {model} = firstModel(components);
	if (!model) return null;
	const link = model as unknown as LinkModel;
	const storeyMembers = await storeyMemberSets(components);
	const catCache = new Map<string, number[]>(); // discipline (ifcType) → category localIds
	const byObject = new Map<string, number[]>();
	const allWorked: number[] = [];
	for (const obj of objects) {
		if (!obj.storeyName || obj.categories.length === 0) continue;
		const members = storeyMembers.get(obj.storeyName);
		if (!members || members.size === 0) continue;
		let catIds = catCache.get(obj.ifcType);
		if (!catIds) {
			catIds = await categoryIds(link, obj.categories);
			catCache.set(obj.ifcType, catIds);
		}
		const ids = catIds.filter((id) => members.has(id));
		if (ids.length) {
			byObject.set(obj.id, ids);
			allWorked.push(...ids);
		}
	}
	return {modelId: model.modelId, model: model as unknown as ResolvedScene["model"], byObject, allWorked};
}

/** Diff-based paint of a single day. Returns the new per-object state map; only elements whose
 *  object changed state since `prev` are touched, so scrubbing/playback stays cheap. */
export async function paintDay(
	components: OBC.Components,
	scene: ResolvedScene,
	objects: ScheduleObject[],
	day: number,
	prev: Map<string, ObjectState>,
): Promise<Map<string, ObjectState>> {
	const next = new Map<string, ObjectState>();
	const hideIds: number[] = [];
	const showIds: number[] = [];
	const resetIds: number[] = [];
	const activeByColor = new Map<string, number[]>(); // trade colour → localIds under construction

	for (const obj of objects) {
		const ids = scene.byObject.get(obj.id);
		if (!ids || ids.length === 0) continue; // non-geometry (SITE / SYSTEM) objects
		const st = objectStateAt(obj, day);
		next.set(obj.id, st);
		if (prev.get(obj.id) === st) continue; // unchanged — skip
		if (st === "pending") {
			hideIds.push(...ids);
			resetIds.push(...ids); // drop any lingering highlight so it comes back clean
		} else if (st === "active") {
			showIds.push(...ids);
			const color = tradeColor(obj.activity);
			const bucket = activeByColor.get(color) ?? [];
			bucket.push(...ids);
			activeByColor.set(color, bucket);
		} else {
			showIds.push(...ids); // built → solid (reverts to the model's real material)
			resetIds.push(...ids);
		}
	}

	const hider = components.get(OBC.Hider);
	const {fragments} = firstModel(components);
	if (resetIds.length) await scene.model.resetHighlight(resetIds);
	for (const [color, ids] of activeByColor) await scene.model.highlight(ids, materialFor(color));
	if (hideIds.length) await hider.set(false, {[scene.modelId]: new Set(hideIds)});
	if (showIds.length) await hider.set(true, {[scene.modelId]: new Set(showIds)});
	if (hideIds.length || showIds.length || activeByColor.size || resetIds.length) {
		await fragments.core.update(true);
	}
	return next;
}

/** Restore the model to its normal, fully-visible, un-highlighted state (on exit/teardown). */
export async function restoreScene(components: OBC.Components, scene: ResolvedScene | null): Promise<void> {
	const hider = components.get(OBC.Hider);
	const {fragments} = firstModel(components);
	if (scene) await scene.model.resetHighlight(scene.allWorked);
	await hider.set(true); // reveal everything
	await fragments.core.update(true);
}

// ── One-off element highlight (clicking a schedule item) ─────────────────────────────────────────────
// Independent of the day-by-day painter: paint exactly one object's IFC elements a highlight colour,
// clearing whatever was highlighted before. Used when a schedule row is clicked, so that item lights up
// on the model.

type HighlightModel = {
	highlight(localIds: number[], material: MaterialDefinition): Promise<void>;
	resetHighlight(localIds?: number[]): Promise<void>;
};

/** Highlight one task's elements — the intersection of its storey and its discipline categories (the same
 *  heuristic linkage resolveScene uses), clearing any previously-highlighted ids. Returns the localIds now
 *  highlighted (pass back as `prev` next time to clear them). */
export async function highlightElements(
	components: OBC.Components,
	storeyName: string | null,
	categories: RegExp[],
	color: string,
	prev: number[] | null,
): Promise<number[]> {
	const {fragments, model} = firstModel(components);
	if (!model) return prev ?? [];
	const m = model as unknown as HighlightModel & LinkModel;
	if (prev && prev.length) await m.resetHighlight(prev);
	if (!storeyName || categories.length === 0) {
		await fragments.core.update(true);
		return [];
	}
	const storeyMembers = await storeyMemberSets(components);
	const members = storeyMembers.get(storeyName);
	const catIds = await categoryIds(m, categories);
	const ids = members ? catIds.filter((id) => members.has(id)) : [];
	if (ids.length) await m.highlight(ids, materialFor(color));
	await fragments.core.update(true);
	return ids;
}

/** Clear a one-off highlight (on teardown / deselect). */
export async function clearHighlightedElements(components: OBC.Components, prev: number[] | null): Promise<void> {
	if (!prev || !prev.length) return;
	const {fragments, model} = firstModel(components);
	if (!model) return;
	await (model as unknown as HighlightModel).resetHighlight(prev);
	await fragments.core.update(true);
}
