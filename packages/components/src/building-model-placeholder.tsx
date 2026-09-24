import {cn} from "@corensystem/coren-utils";
import {Boxes} from "lucide-react";
import * as React from "react";

const FLOAT_SHADOW = "wwc:shadow-[0_4px_12px_rgba(0,0,0,0.06)]";

/** One floor of the building, bottom-to-top order preserved by the array (index 0 = top). */
export interface BuildingModelFloor {
	/** Stable id, matched against `activeId`. */
	id: string;
	/** Short floor label, e.g. "GF" / "RF". */
	label: string;
	/** Completion percentage shown on the plate label. Omit to hide it. */
	value?: number;
	/** When false, the plate is dashed / faded (no blueprint for that floor). Default true. */
	hasBlueprint?: boolean;
}

export interface BuildingModelPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Floors ordered top → bottom (roof first). One extruded box is stacked per floor. */
	floors: BuildingModelFloor[];
	/** Id of the highlighted floor. */
	activeId?: string;
	/** Fires when a floor box is clicked. */
	onFloorSelect?: (id: string) => void;
	/** Initial camera orientation (degrees). Default `{x: 62, y: -28}`. */
	defaultRotation?: {x: number; y: number};
	/** Show the "placeholder" badge (bottom-left). Default true. */
	showBadge?: boolean;
	/** Badge text. Default "No 3D model — showing floor placeholder". */
	badgeLabel?: React.ReactNode;
	/** Plate edge length (px). Default 176. */
	plateSize?: number;
	/** Vertical gap between floors (px). Default 34. */
	plateGap?: number;
	/** Wall height of each floor box (px). Default 30. */
	wallHeight?: number;
}

// The four vertical walls of a floor box, each centred on the box centre then rotated up to its edge.
function wallFaces(plateSize: number, wallH: number) {
	return [
		{
			key: "n",
			w: plateSize,
			h: wallH,
			transform: `translateY(-${plateSize / 2}px) translateZ(${wallH / 2}px) rotateX(90deg)`,
		},
		{
			key: "s",
			w: plateSize,
			h: wallH,
			transform: `translateY(${plateSize / 2}px) translateZ(${wallH / 2}px) rotateX(90deg)`,
		},
		{
			key: "e",
			w: wallH,
			h: plateSize,
			transform: `translateX(${plateSize / 2}px) translateZ(${wallH / 2}px) rotateY(90deg)`,
		},
		{
			key: "w",
			w: wallH,
			h: plateSize,
			transform: `translateX(-${plateSize / 2}px) translateZ(${wallH / 2}px) rotateY(90deg)`,
		},
	];
}

/**
 * A dependency-free 3D building placeholder: one extruded box (slab + four walls) per floor, stacked
 * along the up-axis and viewed isometrically via CSS 3D. Drag to orbit, click a floor to select it
 * (highlighted). Meant as the fallback when a real BIM / 3D model isn't available yet — swap it for the
 * model renderer when one exists; the surrounding chrome stays the same.
 */
const BuildingModelPlaceholder = React.forwardRef<HTMLDivElement, BuildingModelPlaceholderProps>(
	(
		{
			className,
			floors,
			activeId,
			onFloorSelect,
			defaultRotation,
			showBadge = true,
			badgeLabel = "No 3D model — showing floor placeholder",
			plateSize = 176,
			plateGap = 34,
			wallHeight = 30,
			...props
		},
		ref,
	) => {
		const n = floors.length;
		const walls = React.useMemo(() => wallFaces(plateSize, wallHeight), [plateSize, wallHeight]);
		const [rotation, setRotation] = React.useState(defaultRotation ?? {x: 62, y: -28});
		const [orbiting, setOrbiting] = React.useState(false);
		const orbitStart = React.useRef<{px: number; py: number; rx: number; ry: number} | null>(null);
		const draggedRef = React.useRef(false);

		const startOrbit = (e: React.PointerEvent) => {
			if (e.button !== 0) return;
			orbitStart.current = {px: e.clientX, py: e.clientY, rx: rotation.x, ry: rotation.y};
			draggedRef.current = false;
			setOrbiting(true);
			(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		};
		const moveOrbit = (e: React.PointerEvent) => {
			const s = orbitStart.current;
			if (!s) return;
			if (Math.abs(e.clientX - s.px) + Math.abs(e.clientY - s.py) > 4) draggedRef.current = true;
			setRotation({
				x: Math.max(12, Math.min(86, s.rx - (e.clientY - s.py) * 0.3)),
				y: s.ry + (e.clientX - s.px) * 0.4,
			});
		};
		const endOrbit = (e: React.PointerEvent) => {
			if (!orbitStart.current) return;
			orbitStart.current = null;
			setOrbiting(false);
			(e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
		};
		const clickFloor = (id: string) => {
			if (draggedRef.current) return;
			onFloorSelect?.(id);
		};

		return (
			<div
				ref={ref}
				className={cn(
					"wwc:relative wwc:h-full wwc:w-full wwc:overflow-hidden wwc:bg-zinc-100 dark:wwc:bg-zinc-900",
					className,
				)}
				{...props}
			>
				{/* Orbit surface: drag empty backdrop to rotate. Behind the floor boxes. */}
				<div
					className={cn("wwc:absolute wwc:inset-0 wwc:z-0", orbiting ? "wwc:cursor-grabbing" : "wwc:cursor-grab")}
					onPointerDown={startOrbit}
					onPointerMove={moveOrbit}
					onPointerUp={endOrbit}
					onPointerCancel={endOrbit}
				/>

				<div
					className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:flex wwc:items-center wwc:justify-center"
					style={{perspective: "1400px"}}
				>
					<div
						style={{
							width: plateSize,
							height: plateSize,
							transformStyle: "preserve-3d",
							transform: `rotateX(${rotation.x}deg) rotateZ(${rotation.y}deg)`,
						}}
					>
						{floors.map((floor, i) => {
							const level = n - 1 - i; // roof (i=0) sits highest
							const z = (level - (n - 1) / 2) * plateGap;
							const active = floor.id === activeId;
							const hasBlueprint = floor.hasBlueprint ?? true;
							const slab = active
								? "wwc:border-primary wwc:bg-primary/30"
								: hasBlueprint
									? "wwc:border-zinc-400/70 wwc:bg-white/80 dark:wwc:border-zinc-600 dark:wwc:bg-zinc-800/80"
									: "wwc:border-dashed wwc:border-zinc-400/60 wwc:bg-white/45 dark:wwc:bg-zinc-800/45";
							const wall = active
								? "wwc:border-primary wwc:bg-primary/15"
								: hasBlueprint
									? "wwc:border-zinc-400/60 wwc:bg-white/25 dark:wwc:border-zinc-600 dark:wwc:bg-zinc-700/30"
									: "wwc:border-dashed wwc:border-zinc-400/50 wwc:bg-white/10 dark:wwc:bg-zinc-700/15";
							return (
								<div
									key={floor.id}
									role="button"
									tabIndex={0}
									aria-pressed={active}
									aria-label={floor.value != null ? `${floor.label} — ${floor.value}%` : floor.label}
									className={cn("wwc:pointer-events-auto wwc:absolute wwc:inset-0", !active && "wwc:cursor-pointer")}
									style={{transformStyle: "preserve-3d", transform: `translateZ(${z}px)`}}
									onPointerDown={startOrbit}
									onPointerMove={moveOrbit}
									onPointerUp={endOrbit}
									onClick={() => clickFloor(floor.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											onFloorSelect?.(floor.id);
										}
									}}
								>
									<div
										className={cn(
											"wwc:absolute wwc:inset-0 wwc:rounded-sm wwc:border",
											slab,
											active && "wwc:ring-2 wwc:ring-primary",
										)}
										style={{boxShadow: "0 10px 18px rgba(0,0,0,0.10)"}}
									/>
									{walls.map((face) => (
										<div
											key={face.key}
											className={cn("wwc:absolute wwc:border", wall)}
											style={{
												width: face.w,
												height: face.h,
												left: `calc(50% - ${face.w / 2}px)`,
												top: `calc(50% - ${face.h / 2}px)`,
												transform: face.transform,
											}}
										/>
									))}
									<div
										className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:flex wwc:items-center wwc:gap-1 wwc:whitespace-nowrap wwc:rounded wwc:bg-background/90 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-semibold wwc:shadow-sm"
										style={{
											transform: `translate(-50%, -50%) translateZ(${wallHeight + 1}px) rotateZ(${-rotation.y}deg) rotateX(${-rotation.x}deg)`,
										}}
									>
										<span className="wwc:text-foreground">{floor.label}</span>
										{floor.value != null && (
											<>
												<span className="wwc:h-2.5 wwc:w-px wwc:bg-border" aria-hidden="true" />
												<span className={active ? "wwc:text-primary" : "wwc:text-muted-foreground"}>
													{floor.value}%
												</span>
											</>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{showBadge && (
					<div
						className={cn(
							"wwc:pointer-events-none wwc:absolute wwc:bottom-3 wwc:left-3 wwc:z-10 wwc:flex wwc:items-center wwc:gap-1.5 wwc:rounded-md wwc:bg-white/90 wwc:px-2 wwc:py-1 wwc:text-[11px] wwc:font-medium wwc:text-muted-foreground dark:wwc:bg-zinc-900/90",
							FLOAT_SHADOW,
						)}
					>
						<Boxes className="wwc:size-3.5" />
						{badgeLabel}
					</div>
				)}
			</div>
		);
	},
);
BuildingModelPlaceholder.displayName = "BuildingModelPlaceholder";

export {BuildingModelPlaceholder};
