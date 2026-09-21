/** SPA (progress ramp) vs Construction (variance ±plan) colour mode. */
export type MapMode = "progress" | "variance";

/** One villa footprint on the site plan, in image-pixel space. */
export type Villa = {
	id: number;
	/** LBS link; `null` renders the footprint grey (unlinked, non-interactive). */
	linkedLbsItemId: number | null;
	name: string;
	plotNumber: string;
	type: "Polygon";
	/** Polygon vertices in image-pixel space (0..imageWidth × 0..imageHeight). */
	points: {x: number; y: number}[];
	/** Bounding box, image-pixel space — used to place the hover label. */
	x: number;
	y: number;
	width: number;
	height: number;
	approvedProgressPercent: number | null;
	plannedProgressPercent: number | null;
};

/** Site-plan metadata — the image's natural pixel size drives the SVG `viewBox`. */
export type SiteMeta = {imageWidth: number; imageHeight: number; count: number};
