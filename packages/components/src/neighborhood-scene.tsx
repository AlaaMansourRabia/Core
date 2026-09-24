import {cn} from "@corensystem/coren-utils";
import {type VariantProps, cva} from "class-variance-authority";
import * as React from "react";

/* ------------------------------------------------------------------ *
 * Inline types (self-contained — no local imports)
 * ------------------------------------------------------------------ */

type ScenePoint = {x: number; y: number};

type HouseState = "idle" | "hover" | "selected";

type House = {
	id: string;
	label: string;
	/** isometric grid coords */
	gx: number;
	gy: number;
	scale: number;
};

/* ------------------------------------------------------------------ *
 * Scene geometry (inline mock data)
 * ------------------------------------------------------------------ */

const VIEWBOX = "0 0 1200 800";
const SCENE_AR = "3 / 2";

const TILE_X = 110;
const TILE_Y = 55;
const ORIGIN_X = 600;
const ORIGIN_Y = 300;

const iso = (gx: number, gy: number): [number, number] => [
	ORIGIN_X + (gx - gy) * TILE_X,
	ORIGIN_Y + (gx + gy) * TILE_Y,
];

const pts = (points: Array<[number, number]>): string =>
	points.map(([x, y]) => `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`).join(" ");

const GROUND = pts([iso(-0.8, -0.8), iso(3.8, -0.8), iso(3.8, 3.8), iso(-0.8, 3.8)]);

const ROADS: string[] = [
	// north↔south avenue
	pts([iso(1.35, -0.8), iso(1.65, -0.8), iso(1.65, 3.8), iso(1.35, 3.8)]),
	// east↔west avenue
	pts([iso(-0.8, 1.35), iso(3.8, 1.35), iso(3.8, 1.65), iso(-0.8, 1.65)]),
];

const GRID_X = [0.2, 1.05, 1.95, 2.8];
const GRID_Y = [0.2, 1.05, 1.95, 2.8];

const HOUSES: House[] = GRID_Y.flatMap((gy, row) =>
	GRID_X.map((gx, col) => ({
		id: `house-${row + 1}-${col + 1}`,
		label: `Unit ${String.fromCharCode(65 + row)}${col + 1}`,
		gx,
		gy,
		scale: 0.9 + ((row * 4 + col) % 3) * 0.08,
	})),
).sort((a, b) => a.gx + a.gy - (b.gx + b.gy));

const BASE_HALF_WIDTH = 48;
const BASE_WALL_HEIGHT = 46;
const BASE_ROOF_RISE = 28;

type HouseGeometry = {
	cx: number;
	cy: number;
	hx: number;
	hy: number;
	footprint: string;
	wallLeft: string;
	wallRight: string;
	roofFront: string;
	roofBack: string;
	gable: string;
	door: string;
};

function houseGeometry(house: House): HouseGeometry {
	const [cx, cy] = iso(house.gx, house.gy);
	const hx = BASE_HALF_WIDTH * house.scale;
	const hy = hx / 2;
	const h = BASE_WALL_HEIGHT * house.scale;
	const rise = BASE_ROOF_RISE * house.scale;

	// footprint diamond (ground level)
	const F: [number, number] = [cx, cy + hy];
	const R: [number, number] = [cx + hx, cy];
	const B: [number, number] = [cx, cy - hy];
	const L: [number, number] = [cx - hx, cy];

	// top of the walls
	const Ft: [number, number] = [cx, cy + hy - h];
	const Rt: [number, number] = [cx + hx, cy - h];
	const Bt: [number, number] = [cx, cy - hy - h];
	const Lt: [number, number] = [cx - hx, cy - h];

	// gable ridge
	const P1: [number, number] = [cx - hx / 2, cy + hy / 2 - h - rise];
	const P2: [number, number] = [cx + hx / 2, cy - hy / 2 - h - rise];

	// door sits on the front-right wall face
	const wallPoint = (t: number, u: number): [number, number] => [
		F[0] + t * (R[0] - F[0]),
		F[1] + t * (R[1] - F[1]) - u * h,
	];

	return {
		cx,
		cy,
		hx,
		hy,
		footprint: pts([F, R, B, L]),
		wallLeft: pts([L, F, Ft, Lt]),
		wallRight: pts([F, R, Rt, Ft]),
		roofFront: pts([Ft, Rt, P2, P1]),
		roofBack: pts([Lt, Bt, P2, P1]),
		gable: pts([Ft, Lt, P1]),
		door: pts([wallPoint(0.36, 0), wallPoint(0.62, 0), wallPoint(0.62, 0.62), wallPoint(0.36, 0.62)]),
	};
}

/* ------------------------------------------------------------------ *
 * Tokenised tones per interaction state
 * ------------------------------------------------------------------ */

const HOUSE_TONES: Record<
	HouseState,
	{
		wallLight: string;
		wallDark: string;
		roofLight: string;
		roofDark: string;
		gable: string;
		detail: string;
		stroke: string;
		strokeWidth: number;
	}
> = {
	idle: {
		wallLight: "wwc:fill-card",
		wallDark: "wwc:fill-muted",
		roofLight: "wwc:fill-secondary",
		roofDark: "wwc:fill-secondary/70",
		gable: "wwc:fill-card",
		detail: "wwc:fill-muted-foreground/30",
		stroke: "wwc:stroke-border",
		strokeWidth: 1,
	},
	hover: {
		wallLight: "wwc:fill-accent",
		wallDark: "wwc:fill-accent/70",
		roofLight: "wwc:fill-accent-foreground/25",
		roofDark: "wwc:fill-accent-foreground/15",
		gable: "wwc:fill-accent",
		detail: "wwc:fill-accent-foreground/40",
		stroke: "wwc:stroke-ring",
		strokeWidth: 1.5,
	},
	selected: {
		wallLight: "wwc:fill-primary/85",
		wallDark: "wwc:fill-primary/60",
		roofLight: "wwc:fill-primary",
		roofDark: "wwc:fill-primary/75",
		gable: "wwc:fill-primary/85",
		detail: "wwc:fill-primary-foreground/50",
		stroke: "wwc:stroke-primary",
		strokeWidth: 1.75,
	},
};

/* ------------------------------------------------------------------ *
 * House
 * ------------------------------------------------------------------ */

function HouseShape({
	house,
	state,
	onEnter,
	onLeave,
	onSelect,
}: {
	house: House;
	state: HouseState;
	onEnter: () => void;
	onLeave: () => void;
	onSelect: (point: ScenePoint) => void;
}) {
	const g = houseGeometry(house);
	const tone = HOUSE_TONES[state];

	return (
		<g
			role="button"
			tabIndex={0}
			aria-pressed={state === "selected"}
			aria-label={house.label}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onFocus={onEnter}
			onBlur={onLeave}
			onClick={(event) => onSelect({x: event.clientX, y: event.clientY})}
			onKeyDown={(event) => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				const rect = event.currentTarget.getBoundingClientRect();
				onSelect({x: rect.left + rect.width / 2, y: rect.top + rect.height / 2});
			}}
			className={cn(
				"wwc:pointer-events-auto wwc:cursor-pointer wwc:outline-none",
				"wwc:transition-transform wwc:duration-150 wwc:ease-out",
				state !== "idle" && "wwc:-translate-y-0.5",
			)}
		>
			<title>{house.label}</title>

			{/* ground shadow */}
			<ellipse cx={g.cx} cy={g.cy + g.hy * 0.35} rx={g.hx * 1.02} ry={g.hy * 0.95} className="wwc:fill-foreground/10" />

			{/* selection halo */}
			{state === "selected" ? (
				<ellipse
					cx={g.cx}
					cy={g.cy}
					rx={g.hx * 1.22}
					ry={g.hy * 1.22}
					strokeWidth={2}
					strokeDasharray="6 5"
					className="wwc:fill-primary/10 wwc:stroke-primary"
				/>
			) : null}

			{/* footprint plinth */}
			<polygon points={g.footprint} strokeWidth={tone.strokeWidth} className={cn(tone.wallDark, tone.stroke)} />

			{/* walls */}
			<polygon
				points={g.wallLeft}
				strokeWidth={tone.strokeWidth}
				strokeLinejoin="round"
				className={cn(tone.wallDark, tone.stroke, "wwc:transition-colors wwc:duration-150")}
			/>
			<polygon
				points={g.wallRight}
				strokeWidth={tone.strokeWidth}
				strokeLinejoin="round"
				className={cn(tone.wallLight, tone.stroke, "wwc:transition-colors wwc:duration-150")}
			/>
			<polygon points={g.door} className={cn(tone.detail)} />

			{/* roof */}
			<polygon
				points={g.roofBack}
				strokeWidth={tone.strokeWidth}
				strokeLinejoin="round"
				className={cn(tone.roofDark, tone.stroke, "wwc:transition-colors wwc:duration-150")}
			/>
			<polygon
				points={g.gable}
				strokeWidth={tone.strokeWidth}
				strokeLinejoin="round"
				className={cn(tone.gable, tone.stroke, "wwc:transition-colors wwc:duration-150")}
			/>
			<polygon
				points={g.roofFront}
				strokeWidth={tone.strokeWidth}
				strokeLinejoin="round"
				className={cn(tone.roofLight, tone.stroke, "wwc:transition-colors wwc:duration-150")}
			/>
		</g>
	);
}

/* ------------------------------------------------------------------ *
 * Scene
 * ------------------------------------------------------------------ */

const neighborhoodSceneVariants = cva("wwc:pointer-events-none wwc:select-none", {
	variants: {
		// How the plan sizes itself inside its container. `contain` keeps the authored
		// centered plate; `full` lets it stretch to the available width (e.g. a pan surface).
		fit: {
			contain: "wwc:w-[82%] wwc:max-w-[64rem]",
			full: "wwc:w-full",
		},
	},
	defaultVariants: {
		fit: "contain",
	},
});

export interface NeighborhoodSceneProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">, VariantProps<typeof neighborhoodSceneVariants> {
	/** Id of the currently selected house, or `null` when nothing is selected. */
	selectedId?: string | null;
	/** Fires when a house is activated, with its id and the pointer/keyboard point. */
	onSelect?: (id: string, point: ScenePoint) => void;
}

/** An isometric SVG neighborhood plan with interactive house hit-shapes driven by hover and selected state. */
const NeighborhoodScene = React.forwardRef<HTMLDivElement, NeighborhoodSceneProps>(
	({className, fit, selectedId = null, onSelect, ...props}, ref) => {
		const [hovered, setHovered] = React.useState<string | null>(null);

		return (
			<div
				ref={ref}
				className={cn(neighborhoodSceneVariants({fit, className}))}
				style={{aspectRatio: SCENE_AR}}
				{...props}
			>
				{/* pointer-events are none on the scene (see the pan surface) — only houses opt back in. */}
				<svg
					viewBox={VIEWBOX}
					preserveAspectRatio="xMidYMid meet"
					role="img"
					aria-label="Neighborhood map"
					className="wwc:h-full wwc:w-full wwc:overflow-visible"
				>
					<polygon
						points={GROUND}
						strokeWidth={1}
						strokeLinejoin="round"
						className="wwc:fill-muted wwc:stroke-border"
					/>
					{ROADS.map((points, i) => (
						<polygon key={i} points={points} className="wwc:fill-muted-foreground/20" />
					))}
					{HOUSES.map((house) => (
						<HouseShape
							key={house.id}
							house={house}
							state={selectedId === house.id ? "selected" : hovered === house.id ? "hover" : "idle"}
							onEnter={() => setHovered(house.id)}
							onLeave={() => setHovered((h) => (h === house.id ? null : h))}
							onSelect={(point) => onSelect?.(house.id, point)}
						/>
					))}
				</svg>
			</div>
		);
	},
);
NeighborhoodScene.displayName = "NeighborhoodScene";

export {NeighborhoodScene, neighborhoodSceneVariants};
