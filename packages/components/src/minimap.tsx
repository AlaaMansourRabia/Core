import {cn} from "@wakecap/core-utils";
import {type VariantProps, cva} from "class-variance-authority";
import {MapPin} from "lucide-react";
import * as React from "react";

/** Builds an ArcGIS World Imagery export URL centred on a lon/lat, covering a small bbox. */
function arcgisTile(lon: number, lat: number): string {
	const dLon = 0.0042;
	const dLat = 0.0029;
	const bbox = `${lon - dLon},${lat - dLat},${lon + dLon},${lat + dLat}`;
	return (
		"https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export" +
		`?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=400,280&format=png32&transparent=false&f=image`
	);
}

// Card drop-shadow lifting the minimap off the scene it floats over.
const MINIMAP_CARD_SHADOW = "0 8px 24px rgba(0,0,0,0.35)";

const minimapVariants = cva("wwc:relative wwc:overflow-hidden wwc:rounded-lg wwc:border-2 wwc:border-white/30", {
	variants: {
		size: {
			sm: "wwc:size-[140px]",
			md: "wwc:size-[185px]",
			lg: "wwc:size-[240px]",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

export interface MinimapProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof minimapVariants> {
	/** Longitude of the site the minimap is centred on. */
	lon: number;
	/** Latitude of the site the minimap is centred on. */
	lat: number;
	/** Compass heading, in degrees, the viewer is currently facing. The map rotates opposite to it. */
	heading?: number;
	/** Label rendered in the top-left corner chip. */
	label?: string;
	/** Override the map tile image source. Defaults to an ArcGIS World Imagery export for `lon`/`lat`. */
	src?: string;
}

/** A compact, north-rotating satellite minimap with a centre pin and heading view-cone. */
const Minimap = React.forwardRef<HTMLDivElement, MinimapProps>(
	({className, size, lon, lat, heading = 0, label = "Site", src, ...props}, ref) => {
		const imageSrc = src ?? arcgisTile(lon, lat);
		return (
			<div
				ref={ref}
				className={cn(minimapVariants({size}), className)}
				style={{boxShadow: MINIMAP_CARD_SHADOW}}
				{...props}
			>
				{/* Rotating map layer, scaled up so the corners never expose the container edge while spinning. */}
				<div
					className="wwc:absolute wwc:inset-0 wwc:origin-center wwc:transition-transform wwc:duration-150 wwc:ease-out"
					style={{transform: `rotate(${-heading}deg) scale(1.5)`}}
				>
					<img src={imageSrc} alt={`${label} location`} className="wwc:h-full wwc:w-full wwc:object-cover" />
				</div>

				{/* Sandy inner vignette (Figma spec). */}
				<span
					aria-hidden="true"
					className="wwc:pointer-events-none wwc:absolute wwc:inset-0 wwc:rounded-[inherit]"
					style={{boxShadow: "inset 0 0 18px 12px #b6a798"}}
				/>

				{/* Fixed chrome (never rotates): view cone pointing up = the direction you're facing in 3D. */}
				<span
					aria-hidden="true"
					className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:size-0 wwc:-translate-x-1/2 wwc:-translate-y-[130%] wwc:border-x-[7px] wwc:border-b-[12px] wwc:border-solid wwc:border-x-transparent wwc:border-b-white/85"
				/>

				{/* Green pin at centre = where the building sits (the rotation pivot); its tip marks the spot. */}
				<MapPin
					aria-hidden="true"
					className="wwc:pointer-events-none wwc:absolute wwc:left-1/2 wwc:top-1/2 wwc:size-5 wwc:-translate-x-1/2 wwc:-translate-y-full wwc:fill-[#22c55e] wwc:text-white wwc:drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]"
				/>

				<span className="wwc:absolute wwc:left-2 wwc:top-1.5 wwc:rounded wwc:bg-black/45 wwc:px-1.5 wwc:py-0.5 wwc:text-[10px] wwc:font-medium wwc:text-white wwc:backdrop-blur-sm">
					{label}
				</span>
			</div>
		);
	},
);
Minimap.displayName = "Minimap";

export {Minimap, minimapVariants};
