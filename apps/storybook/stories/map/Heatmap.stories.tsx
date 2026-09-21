import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@wakecap/core-ui/dropdown-menu";
import {Label} from "@wakecap/core-ui/label";
import {Map} from "@wakecap/core-ui/map";
import {MapControls} from "@wakecap/core-ui/map-controls";
import {MAPBOX_TOKEN} from "@wakecap/core-ui/mapbox-token";
import {Slider} from "@wakecap/core-ui/slider";
import {Flame} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

const heatmapColors = [
	{value: 0, color: "rgba(0,0,0,0)", label: "None"},
	{value: 0.2, color: "#fef3c7", label: "Low"},
	{value: 0.4, color: "#fcd34d", label: "Medium-Low"},
	{value: 0.6, color: "#f97316", label: "Medium"},
	{value: 0.8, color: "#dc2626", label: "High"},
	{value: 1, color: "#7f1d1d", label: "Very High"},
];

// Seeded random for deterministic points
function seededRandom(seed: number) {
	let s = seed | 0;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const random = seededRandom(42);

const cities = [
	{center: [46.6753, 24.7136], count: 200},
	{center: [39.1925, 21.4858], count: 150},
	{center: [39.8579, 21.3891], count: 180},
	{center: [39.6142, 24.5247], count: 120},
	{center: [50.1033, 26.4207], count: 100},
	{center: [36.5998, 28.3835], count: 60},
	{center: [46.7167, 17.49], count: 40},
];

const heatmapFeatures: GeoJSON.Feature[] = cities.flatMap((city) =>
	Array.from({length: city.count}, () => ({
		type: "Feature" as const,
		properties: {mag: 0.5 + random() * 0.5},
		geometry: {
			type: "Point" as const,
			coordinates: [city.center[0] + (random() - 0.5) * 1.5, city.center[1] + (random() - 0.5) * 1.5],
		},
	})),
);

function HeatmapStory() {
	const mapContainerRef = React.useRef<HTMLDivElement>(null);
	const mapRef = React.useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = React.useState("mapbox://styles/mapbox/dark-v11");
	const [intensity, setIntensity] = React.useState([0.5]);
	const [radius, setRadius] = React.useState([20]);
	const [showHeatmapControls, setShowHeatmapControls] = React.useState(true);
	const [showLegend, setShowLegend] = React.useState(true);

	const addHeatmapLayer = React.useCallback(() => {
		if (!mapRef.current) return;
		if (mapRef.current.getLayer("heatmap-layer")) mapRef.current.removeLayer("heatmap-layer");
		if (mapRef.current.getSource("heatmap-data")) mapRef.current.removeSource("heatmap-data");

		mapRef.current.addSource("heatmap-data", {
			type: "geojson",
			data: {type: "FeatureCollection", features: heatmapFeatures},
		});
		mapRef.current.addLayer({
			id: "heatmap-layer",
			type: "heatmap",
			source: "heatmap-data",
			paint: {
				"heatmap-weight": ["get", "mag"],
				"heatmap-intensity": intensity[0],
				"heatmap-color": [
					"interpolate",
					["linear"],
					["heatmap-density"],
					0,
					"rgba(0,0,0,0)",
					0.2,
					"#fef3c7",
					0.4,
					"#fcd34d",
					0.6,
					"#f97316",
					0.8,
					"#dc2626",
					1,
					"#7f1d1d",
				],
				"heatmap-radius": radius[0],
				"heatmap-opacity": 0.8,
			},
		});
	}, [intensity, radius]);

	React.useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;
		mapboxgl.accessToken = MAPBOX_TOKEN;
		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [45.0792, 23.8859],
			zoom: 5,
		});
		mapRef.current.on("load", addHeatmapLayer);
		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	React.useEffect(() => {
		if (mapRef.current?.getLayer("heatmap-layer")) {
			mapRef.current.setPaintProperty("heatmap-layer", "heatmap-intensity", intensity[0]);
		}
	}, [intensity]);

	React.useEffect(() => {
		if (mapRef.current?.getLayer("heatmap-layer")) {
			mapRef.current.setPaintProperty("heatmap-layer", "heatmap-radius", radius[0]);
		}
	}, [radius]);

	React.useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", addHeatmapLayer);
		}
	}, [mapStyle]);

	return (
		<div className="wwc:relative">
			<div ref={mapContainerRef} className="wwc:h-[500px] wwc:w-full wwc:rounded-lg wwc:overflow-hidden" />
			<MapControls
				mapRef={mapRef}
				mapStyle={mapStyle}
				onMapStyleChange={setMapStyle}
				additionalSettings={[
					{
						id: "show-heatmap-controls",
						label: "Heatmap",
						checked: showHeatmapControls,
						onCheckedChange: setShowHeatmapControls,
					},
					{id: "show-legend", label: "Legend", checked: showLegend, onCheckedChange: setShowLegend},
				]}
				additionalControls={
					showHeatmapControls && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" icon className="wwc:h-8 wwc:w-8 wwc:bg-background">
									<Flame className="wwc:h-4 wwc:w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="wwc:w-[200px] wwc:p-3 wwc:space-y-4">
								<div className="wwc:space-y-2">
									<Label className="wwc:text-xs wwc:font-medium">Intensity: {intensity[0].toFixed(1)}</Label>
									<Slider
										value={intensity}
										onValueChange={setIntensity}
										min={0.1}
										max={1}
										step={0.1}
										className="wwc:w-full"
									/>
								</div>
								<div className="wwc:space-y-2">
									<Label className="wwc:text-xs wwc:font-medium">Radius: {radius[0]}px</Label>
									<Slider value={radius} onValueChange={setRadius} min={5} max={50} step={5} className="wwc:w-full" />
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				}
			/>

			{/* Heatmap Legend */}
			{showLegend && (
				<div className="wwc:absolute wwc:top-14 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:p-2 wwc:text-xs wwc:space-y-1.5 wwc:border wwc:shadow-sm">
					<div className="wwc:font-medium wwc:text-muted-foreground wwc:mb-1">Density</div>
					{heatmapColors.slice(1).map((item) => (
						<div key={item.value} className="wwc:flex wwc:items-center wwc:gap-2">
							<span
								className="wwc:w-4 wwc:h-4 wwc:rounded wwc:border wwc:border-white/50"
								style={{backgroundColor: item.color}}
							/>
							<span className="wwc:text-muted-foreground">{item.label}</span>
						</div>
					))}
					<div className="wwc:pt-1 wwc:border-t wwc:mt-1">
						<div
							className="wwc:h-2 wwc:w-full wwc:rounded"
							style={{background: `linear-gradient(to right, ${heatmapColors.map((c) => c.color).join(", ")})`}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Heatmap",
	component: Map,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Map with heatmap layer, interactive intensity/radius controls, and density legend. Uses Saudi Arabia city data.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <HeatmapStory />,
};
