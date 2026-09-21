import {Flame} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Label} from "@/components/ui/label";
import {MAPBOX_TOKEN, MapControls} from "@/components/ui/map-controls";
import {Slider} from "@/components/ui/slider";

// Heatmap color gradient
const heatmapColors = [
	{value: 0, color: "rgba(0,0,0,0)", label: "None"},
	{value: 0.2, color: "#fef3c7", label: "Low"},
	{value: 0.4, color: "#fcd34d", label: "Medium-Low"},
	{value: 0.6, color: "#f97316", label: "Medium"},
	{value: 0.8, color: "#dc2626", label: "High"},
	{value: 1, color: "#7f1d1d", label: "Very High"},
];

// Generate random points around Saudi Arabia cities
const generateHeatmapData = () => {
	const cities = [
		{center: [46.6753, 24.7136], weight: 1, count: 200},
		{center: [39.1925, 21.4858], weight: 0.8, count: 150},
		{center: [39.8579, 21.3891], weight: 0.9, count: 180},
		{center: [39.6142, 24.5247], weight: 0.7, count: 120},
		{center: [50.1033, 26.4207], weight: 0.6, count: 100},
		{center: [36.5998, 28.3835], weight: 0.4, count: 60},
		{center: [46.7167, 17.49], weight: 0.3, count: 40},
	];

	const features: GeoJSON.Feature[] = [];

	cities.forEach((city) => {
		for (let i = 0; i < city.count; i++) {
			const lng = city.center[0] + (Math.random() - 0.5) * 1.5;
			const lat = city.center[1] + (Math.random() - 0.5) * 1.5;
			features.push({
				type: "Feature",
				properties: {mag: city.weight + Math.random() * 0.3},
				geometry: {type: "Point", coordinates: [lng, lat]},
			});
		}
	});

	return {
		type: "FeatureCollection" as const,
		features,
	};
};

export function HeatmapPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
	const [intensity, setIntensity] = useState([0.5]);
	const [radius, setRadius] = useState([20]);
	const [showHeatmapControls, setShowHeatmapControls] = useState(true);
	const [showLegend, setShowLegend] = useState(true);

	const addHeatmapLayer = () => {
		if (!mapRef.current) return;

		const heatmapData = generateHeatmapData();

		if (mapRef.current.getSource("heatmap-data")) {
			mapRef.current.removeLayer("heatmap-layer");
			mapRef.current.removeSource("heatmap-data");
		}

		mapRef.current.addSource("heatmap-data", {
			type: "geojson",
			data: heatmapData,
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
	};

	useEffect(() => {
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

	useEffect(() => {
		if (mapRef.current?.getLayer("heatmap-layer")) {
			mapRef.current.setPaintProperty("heatmap-layer", "heatmap-intensity", intensity[0]);
		}
	}, [intensity]);

	useEffect(() => {
		if (mapRef.current?.getLayer("heatmap-layer")) {
			mapRef.current.setPaintProperty("heatmap-layer", "heatmap-radius", radius[0]);
		}
	}, [radius]);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", addHeatmapLayer);
		}
	}, [mapStyle]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Heatmap</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">Visualize data density with customizable heatmap layers.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Population Density Heatmap</CardTitle>
				</CardHeader>
				<CardContent>
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
								{
									id: "show-legend",
									label: "Legend",
									checked: showLegend,
									onCheckedChange: setShowLegend,
								},
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
												<Slider
													value={radius}
													onValueChange={setRadius}
													min={5}
													max={50}
													step={5}
													className="wwc:w-full"
												/>
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
										style={{
											background: `linear-gradient(to right, ${heatmapColors.map((c) => c.color).join(", ")})`,
										}}
									/>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`// Add heatmap layer
map.addLayer({
  id: "heatmap-layer",
  type: "heatmap",
  source: "data-source",
  paint: {
    "heatmap-weight": ["get", "magnitude"],
    "heatmap-intensity": 0.5,
    "heatmap-radius": 20,
    "heatmap-color": [
      "interpolate", ["linear"], ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.5, "#f97316",
      1, "#7f1d1d",
    ],
  },
})`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
