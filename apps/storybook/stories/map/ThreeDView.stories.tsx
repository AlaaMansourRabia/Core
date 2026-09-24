import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Map} from "@corensystem/coren-ui/map";
import {MapControls} from "@corensystem/coren-ui/map-controls";
import {MAPBOX_TOKEN} from "@corensystem/coren-ui/mapbox-token";
import {RotateCw} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

function ThreeDViewStory() {
	const mapContainerRef = React.useRef<HTMLDivElement>(null);
	const mapRef = React.useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = React.useState("mapbox://styles/mapbox/dark-v11");
	const [isRotating, setIsRotating] = React.useState(false);
	const animationRef = React.useRef<number | null>(null);

	const add3DBuildings = React.useCallback(() => {
		if (!mapRef.current) return;
		const layers = mapRef.current.getStyle().layers;
		const labelLayerId = layers?.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"])?.id;

		if (!mapRef.current.getLayer("3d-buildings")) {
			mapRef.current.addLayer(
				{
					id: "3d-buildings",
					source: "composite",
					"source-layer": "building",
					filter: ["==", "extrude", "true"],
					type: "fill-extrusion",
					minzoom: 12,
					paint: {
						"fill-extrusion-color": [
							"interpolate",
							["linear"],
							["get", "height"],
							0,
							"#e5e5e5",
							50,
							"#d4d4d4",
							100,
							"#a3a3a3",
							200,
							"#737373",
						],
						"fill-extrusion-height": ["get", "height"],
						"fill-extrusion-base": ["get", "min_height"],
						"fill-extrusion-opacity": 0.8,
					},
				},
				labelLayerId,
			);
		}
	}, []);

	React.useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;
		mapboxgl.accessToken = MAPBOX_TOKEN;
		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [46.6753, 24.7136],
			zoom: 15,
			pitch: 60,
			bearing: 0,
			antialias: true,
		});
		mapRef.current.on("load", add3DBuildings);
		return () => {
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	React.useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", add3DBuildings);
		}
	}, [mapStyle]);

	const rotateCamera = React.useCallback(() => {
		if (!mapRef.current) return;
		mapRef.current.rotateTo((mapRef.current.getBearing() + 0.3) % 360, {duration: 0});
		animationRef.current = requestAnimationFrame(rotateCamera);
	}, []);

	const toggleRotation = () => {
		if (isRotating) {
			setIsRotating(false);
			if (animationRef.current) cancelAnimationFrame(animationRef.current);
		} else {
			setIsRotating(true);
			rotateCamera();
		}
	};

	return (
		<div className="wwc:relative">
			<div ref={mapContainerRef} className="wwc:h-[500px] wwc:w-full wwc:rounded-lg wwc:overflow-hidden" />
			<MapControls
				mapRef={mapRef}
				mapStyle={mapStyle}
				onMapStyleChange={setMapStyle}
				additionalControls={
					<Button
						variant="outline"
						icon
						className={`wwc:h-8 wwc:w-8 wwc:bg-background ${isRotating ? "wwc:text-primary wwc:border-primary" : ""}`}
						onClick={toggleRotation}
					>
						<RotateCw className={`wwc:h-4 wwc:w-4 ${isRotating ? "wwc:animate-spin" : ""}`} />
					</Button>
				}
			/>

			{/* Building Height Legend */}
			<div className="wwc:absolute wwc:bottom-8 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:p-2 wwc:text-xs wwc:space-y-1.5 wwc:border wwc:shadow-sm">
				<div className="wwc:font-medium wwc:text-muted-foreground wwc:mb-1">Building Height</div>
				{[
					{color: "#e5e5e5", label: "0-50m"},
					{color: "#d4d4d4", label: "50-100m"},
					{color: "#a3a3a3", label: "100-200m"},
					{color: "#737373", label: "200m+"},
				].map((item) => (
					<div key={item.label} className="wwc:flex wwc:items-center wwc:gap-2">
						<span className="wwc:w-4 wwc:h-4 wwc:rounded wwc:border" style={{backgroundColor: item.color}} />
						<span className="wwc:text-muted-foreground">{item.label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

const meta = {
	title: "Widgets/Map/3D View",
	component: Map,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Map with 3D building extrusions, height-based color gradient, auto-rotate toggle, and building height legend.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <ThreeDViewStory />,
};
