import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

/* -----------------------------------------------------------------------------
 * Isometric projection helpers
 * -------------------------------------------------------------------------- */

type Point = readonly [number, number];

/** Projects a grid point (optionally lifted by `h`) into screen space. */
function iso(gx: number, gy: number, h = 0): Point {
	return [(gx - gy) * 0.8660254, (gx + gy) * 0.5 - h];
}

function polyStr(...points: Point[]): string {
	return points.map(([x, y]) => `${x},${y}`).join(" ");
}

/* -----------------------------------------------------------------------------
 * Variants
 * -------------------------------------------------------------------------- */

// The palette is driven by the root `text-*` colour; each face uses `fill-current`
// with an SVG `fillOpacity` to express depth (lit wall → shaded side → roof → shaded
// roof), so a house re-themes with the rest of Core instead of using raw hex.
const houseShapeVariants = cva("wwc:overflow-visible", {
	variants: {
		variant: {
			primary: "wwc:text-primary",
			secondary: "wwc:text-secondary",
			accent: "wwc:text-accent",
			muted: "wwc:text-muted-foreground",
			destructive: "wwc:text-destructive",
		},
		state: {
			idle: "wwc:stroke-foreground/35 wwc:[stroke-width:0.5]",
			hovered: "wwc:stroke-sky-400 wwc:[stroke-width:1.6]",
			selected: "wwc:stroke-amber-500 wwc:[stroke-width:1.6]",
		},
	},
	defaultVariants: {
		variant: "primary",
		state: "idle",
	},
});

const FACE_OPACITY = {wall: 1, side: 0.65, roof: 0.9, roofDark: 0.5} as const;

export interface HouseShapeProps
	extends Omit<React.SVGProps<SVGSVGElement>, "state">, VariantProps<typeof houseShapeVariants> {
	/** Accessible label for the house (rendered as `<title>` and `aria-label`). */
	name?: string;
	/** Half-footprint size of the house on the grid. */
	size?: number;
	/** Wall height. */
	wall?: number;
	/** Roof height above the wall top. */
	roof?: number;
}

/** An isometric SVG house tile whose palette, hover, and selected states are driven by design tokens. */
const HouseShape = React.forwardRef<SVGSVGElement, HouseShapeProps>(
	({className, variant, state, name = "House", size = 14, wall = 22, roof = 16, ...props}, ref) => {
		const s = size;
		const b = iso(s, -s),
			c = iso(s, s),
			d = iso(-s, s);
		const aT = iso(-s, -s, wall),
			bT = iso(s, -s, wall),
			cT = iso(s, s, wall),
			dT = iso(-s, s, wall);
		const apex = iso(0, 0, wall + roof);
		const span = s * 2;

		return (
			<svg
				ref={ref}
				viewBox={`${-span} ${-(wall + roof) - 8} ${span * 2} ${wall + roof + span + 8}`}
				role="img"
				aria-label={name}
				className={cn(houseShapeVariants({variant, state}), className)}
				strokeLinejoin="round"
				{...props}
			>
				<title>{name}</title>
				{/* Two visible walls. */}
				<polygon points={polyStr(b, c, cT, bT)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.wall} />
				<polygon points={polyStr(d, c, cT, dT)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.side} />
				{/* Hip roof: the two back faces first, then the two facing the viewer. */}
				<polygon points={polyStr(aT, bT, apex)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.roofDark} />
				<polygon points={polyStr(aT, dT, apex)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.roofDark} />
				<polygon points={polyStr(bT, cT, apex)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.roof} />
				<polygon points={polyStr(dT, cT, apex)} className="wwc:fill-current" fillOpacity={FACE_OPACITY.roofDark} />
				{state === "selected" && (
					<circle
						cx={apex[0]}
						cy={apex[1] - 7}
						r={3.6}
						className="wwc:fill-amber-500 wwc:stroke-background"
						strokeWidth={1.3}
					/>
				)}
			</svg>
		);
	},
);
HouseShape.displayName = "HouseShape";

export {HouseShape, houseShapeVariants};
