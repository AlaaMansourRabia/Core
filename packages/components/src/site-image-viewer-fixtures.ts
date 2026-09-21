// Demo fixtures for the SiteImageViewer — the real ROSHN Almanar site ("Zone 1 - A", 4096×4096) with
// 602 villa footprint polygons and their live approved/planned progress. Bundled separately from the
// widget so only demo surfaces (stories, templates) pull this ~payload; the widget takes `villas` as a
// prop. The matching background image is served by the app (see apps/storybook/public/site-background.webp).

import batchesRaw from "./site-image-viewer/batches.json";
import blocksZone1aRaw from "./site-image-viewer/blocks-zone-1a.json";
import blocksZone1bRaw from "./site-image-viewer/blocks-zone-1b.json";
import phasesRaw from "./site-image-viewer/phases.json";
import type {SiteMeta, Villa} from "./site-image-viewer/types";
import villasRaw from "./site-image-viewer/villas.json";
import zone1bVillasRaw from "./site-image-viewer/zone1b-villas.json";
import zonesMarketingRaw from "./site-image-viewer/zones-marketing.json";
import zonesRaw from "./site-image-viewer/zones.json";

const data = villasRaw as unknown as {villas: Villa[]; meta: SiteMeta};

/**
 * The pulled bundle merges the Zone's two villa-overlay blueprints (bp 6371 + bp 6363), so every villa
 * footprint appears twice — same name and geometry, different id (602 rows for 301 real villas). Dedupe by
 * name + position so the map draws each footprint once and the list shows each villa once.
 */
function dedupeVillas(villas: Villa[]): Villa[] {
	const seen = new Set<string>();
	return villas.filter((v) => {
		const key = `${v.name}@${Math.round(v.x)},${Math.round(v.y)}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/** The real ROSHN Almanar villa footprints (image-pixel space), deduped to the 301 unique villas. */
export const ALMANAR_VILLAS: Villa[] = dedupeVillas(data.villas);

/** The site-plan metadata — `imageWidth`/`imageHeight` drive the viewer's `viewBox` (4096×4096). */
export const ALMANAR_SITE_META: SiteMeta = {...data.meta, count: ALMANAR_VILLAS.length};

/** One Capture canvas-object polygon (any LBS level), as assembled in the *_polygons_bundle.json files. */
interface RawPolygon {
	canvasObjectId: number;
	linkedLbsItemId: number | null;
	name: string;
	geometry: {x: number; y: number; width: number; height: number; points: {x: number; y: number}[]};
	progress: {approvedProgressPercent: number; plannedProgressPercent: number; progressVariancePercent: number};
}

/** Map a bundle's polygons to the viewer's `Villa` shape. `plotNumber` carries a "(N UNITS)" count if present. */
function toVillas(polys: RawPolygon[]): Villa[] {
	return polys.map((p) => ({
		id: p.linkedLbsItemId ?? p.canvasObjectId,
		linkedLbsItemId: p.linkedLbsItemId,
		name: p.name.replace(/\s*\(.*\)\s*$/, ""),
		plotNumber: p.name.match(/\((\d+)/)?.[1] ?? "",
		type: "Polygon",
		points: p.geometry.points,
		x: p.geometry.x,
		y: p.geometry.y,
		width: p.geometry.width,
		height: p.geometry.height,
		approvedProgressPercent: p.progress.approvedProgressPercent,
		plannedProgressPercent: p.progress.plannedProgressPercent,
	}));
}

/**
 * The parent LBS levels for the same drill-down (Project → Phase → Zone → Batch → Villa). Each level's
 * polygons live on their own Capture blueprint's pixel space, coloured by the linked child's rollup
 * progress. Batch shares the villa aerial (4096×4096); Zone and Phase have their own blueprint images.
 */
export const ALMANAR_BATCHES: Villa[] = toVillas(
	(batchesRaw as unknown as {batchPolygons: RawPolygon[]}).batchPolygons,
);
export const ALMANAR_ZONES: Villa[] = toVillas((zonesRaw as unknown as {polygons: RawPolygon[]}).polygons);
export const ALMANAR_PHASES: Villa[] = toVillas((phasesRaw as unknown as {polygons: RawPolygon[]}).polygons);

/**
 * Zone 1-B's villa overlay — 432 footprints over its own villa blueprint (`zone1b-villa-blueprint.webp`,
 * 4096×4096), a different physical area from Zone 1-A. Colour + shape resolve exactly like Zone 1-A.
 */
export const ALMANAR_ZONE_B_VILLAS: Villa[] = toVillas(
	(zone1bVillasRaw as unknown as {polygons: RawPolygon[]}).polygons,
);
export const ALMANAR_ZONE_B_META: SiteMeta = {imageWidth: 4096, imageHeight: 4096, count: ALMANAR_ZONE_B_VILLAS.length};

/**
 * The Zone level has two blueprint assignments over the same physical area — a **satellite** background
 * (`ALMANAR_ZONES`, 1192×1039) and a **marketing** render (`zone_marketing`, 4096×4096). They carry the
 * same two zones with identical progress; only the background image and the polygon pixel space differ.
 */
export const ALMANAR_ZONES_MARKETING: Villa[] = toVillas(
	(zonesMarketingRaw as unknown as {polygons: RawPolygon[]}).polygons,
);

/**
 * Block-level polygons — the ROSHN Batch → BLOCK grouping, one hull polygon per block. The hulls are authored
 * in the SAME 4096×4096 pixel space as that zone's villa footprints (marketing render bp 6363 for Zone 1-A =
 * `site-background.webp`; bp 6364 for Zone 1-B = `zone1b-villa-blueprint.webp`), so the block level reuses the
 * zone's villa background image verbatim — switching villa/batch ↔ block swaps only the polygons, no reload.
 * The hull is derived from the block's exact villa polygons (docs/block-polygons); progress is each block's
 * mean approved/planned across its villas.
 */
export const ALMANAR_ZONE_A_BLOCKS: Villa[] = toVillas(
	(blocksZone1aRaw as unknown as {polygons: RawPolygon[]}).polygons,
);
export const ALMANAR_ZONE_B_BLOCKS: Villa[] = toVillas(
	(blocksZone1bRaw as unknown as {polygons: RawPolygon[]}).polygons,
);
export const ALMANAR_ZONE_A_BLOCKS_META: SiteMeta = {
	imageWidth: 4096,
	imageHeight: 4096,
	count: ALMANAR_ZONE_A_BLOCKS.length,
};
export const ALMANAR_ZONE_B_BLOCKS_META: SiteMeta = {
	imageWidth: 4096,
	imageHeight: 4096,
	count: ALMANAR_ZONE_B_BLOCKS.length,
};

/** Blueprint pixel sizes for the levels whose image differs from the 4096×4096 aerial. */
export const ALMANAR_ZONE_META: SiteMeta = {imageWidth: 1192, imageHeight: 1039, count: ALMANAR_ZONES.length};
export const ALMANAR_ZONE_MARKETING_META: SiteMeta = {
	imageWidth: 4096,
	imageHeight: 4096,
	count: ALMANAR_ZONES_MARKETING.length,
};
export const ALMANAR_PHASE_META: SiteMeta = {imageWidth: 4096, imageHeight: 4096, count: ALMANAR_PHASES.length};
