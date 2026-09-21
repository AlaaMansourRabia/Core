import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@wakecap/core-ui/dropdown-menu";
import {Label} from "@wakecap/core-ui/label";
import {Map} from "@wakecap/core-ui/map";
import {MapControls} from "@wakecap/core-ui/map-controls";
import {MAPBOX_TOKEN} from "@wakecap/core-ui/mapbox-token";
import {Separator} from "@wakecap/core-ui/separator";
import {Switch} from "@wakecap/core-ui/switch";
import {AlertTriangle, Circle, Info, Layers, MapPin, Square, Triangle} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

// Seeded random for deterministic markers
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

const regions = [
	{name: "Riyadh", center: [46.6753, 24.7136], count: 15},
	{name: "Jeddah", center: [39.1925, 21.4858], count: 12},
	{name: "Mecca", center: [39.8579, 21.3891], count: 10},
	{name: "Medina", center: [39.6142, 24.5247], count: 8},
	{name: "Dammam", center: [50.1033, 26.4207], count: 10},
	{name: "Tabuk", center: [36.5998, 28.3835], count: 6},
	{name: "Abha", center: [42.5053, 18.2164], count: 5},
	{name: "Khobar", center: [50.2083, 26.2794], count: 8},
];

const placeTypes = ["Store", "Office", "Branch", "Center", "Hub"];

const sampleLocations = regions.flatMap((region, ri) =>
	Array.from({length: region.count}, (_, i) => ({
		name: `${region.name} ${placeTypes[(ri + i) % placeTypes.length]} #${i + 1}`,
		coordinates: [region.center[0] + (random() - 0.5) * 0.5, region.center[1] + (random() - 0.5) * 0.5] as [
			number,
			number,
		],
		description: `${placeTypes[(ri + i) % placeTypes.length]} location in ${region.name} area`,
	})),
);

const markerTypes = [
	{type: "pin", label: "Pin", icon: <MapPin className="wwc:h-4 wwc:w-4" />},
	{type: "circle", label: "Circle", icon: <Circle className="wwc:h-4 wwc:w-4" />},
	{type: "square", label: "Square", icon: <Square className="wwc:h-4 wwc:w-4" />},
	{type: "triangle", label: "Triangle", icon: <Triangle className="wwc:h-4 wwc:w-4" />},
	{type: "warning", label: "Warning", icon: <AlertTriangle className="wwc:h-4 wwc:w-4" />},
	{type: "info", label: "Info", icon: <Info className="wwc:h-4 wwc:w-4" />},
];

const markerColors = [
	{value: "#f97316", label: "Orange"},
	{value: "#ef4444", label: "Red"},
	{value: "#22c55e", label: "Green"},
	{value: "#3b82f6", label: "Blue"},
	{value: "#8b5cf6", label: "Purple"},
	{value: "#ec4899", label: "Pink"},
	{value: "#eab308", label: "Yellow"},
	{value: "#06b6d4", label: "Cyan"},
	{value: "#64748b", label: "Slate"},
	{value: "#171717", label: "Black"},
];

function DefaultMapStory() {
	const mapContainerRef = React.useRef<HTMLDivElement>(null);
	const mapRef = React.useRef<mapboxgl.Map | null>(null);
	const markersRef = React.useRef<mapboxgl.Marker[]>([]);
	const [mapStyle, setMapStyle] = React.useState("mapbox://styles/mapbox/dark-v11");
	const [markerType, setMarkerType] = React.useState("pin");
	const [markerColor, setMarkerColor] = React.useState("#f97316");
	const [showMarkerSelector, setShowMarkerSelector] = React.useState(true);
	const [clusterEnabled, setClusterEnabled] = React.useState(false);

	const addMarkers = React.useCallback((color: string) => {
		if (!mapRef.current) return;
		markersRef.current.forEach((m) => m.remove());
		markersRef.current = [];
		sampleLocations.forEach((loc) => {
			const marker = new mapboxgl.Marker({color})
				.setLngLat(loc.coordinates)
				.setPopup(
					new mapboxgl.Popup({offset: 25}).setHTML(
						`<div style="padding:4px"><strong style="font-size:14px">${loc.name}</strong><p style="margin:4px 0 0;font-size:12px;color:#666">${loc.description}</p></div>`,
					),
				)
				.addTo(mapRef.current!);
			markersRef.current.push(marker);
		});
	}, []);

	const removeClusterLayers = React.useCallback(() => {
		if (!mapRef.current) return;
		if (mapRef.current.getLayer("clusters")) mapRef.current.removeLayer("clusters");
		if (mapRef.current.getLayer("cluster-count")) mapRef.current.removeLayer("cluster-count");
		if (mapRef.current.getLayer("unclustered-point")) mapRef.current.removeLayer("unclustered-point");
		if (mapRef.current.getSource("locations-cluster")) mapRef.current.removeSource("locations-cluster");
	}, []);

	const addClusterLayers = React.useCallback(
		(color: string) => {
			if (!mapRef.current) return;
			removeClusterLayers();
			mapRef.current.addSource("locations-cluster", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: sampleLocations.map((loc) => ({
						type: "Feature" as const,
						properties: {name: loc.name},
						geometry: {type: "Point" as const, coordinates: loc.coordinates},
					})),
				},
				cluster: true,
				clusterMaxZoom: 14,
				clusterRadius: 50,
			});
			mapRef.current.addLayer({
				id: "clusters",
				type: "circle",
				source: "locations-cluster",
				filter: ["has", "point_count"],
				paint: {
					"circle-color": color,
					"circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 32],
					"circle-opacity": 0.7,
				},
			});
			mapRef.current.addLayer({
				id: "cluster-count",
				type: "symbol",
				source: "locations-cluster",
				filter: ["has", "point_count"],
				layout: {"text-field": ["get", "point_count_abbreviated"], "text-size": 12},
				paint: {"text-color": "#ffffff"},
			});
			mapRef.current.addLayer({
				id: "unclustered-point",
				type: "circle",
				source: "locations-cluster",
				filter: ["!", ["has", "point_count"]],
				paint: {"circle-color": color, "circle-radius": 6, "circle-stroke-width": 2, "circle-stroke-color": "#fff"},
			});
		},
		[removeClusterLayers],
	);

	const updateDisplay = React.useCallback(
		(cluster: boolean, color: string) => {
			if (!mapRef.current?.loaded()) return;
			if (cluster) {
				markersRef.current.forEach((m) => m.remove());
				markersRef.current = [];
				addClusterLayers(color);
			} else {
				removeClusterLayers();
				addMarkers(color);
			}
		},
		[addMarkers, addClusterLayers, removeClusterLayers],
	);

	React.useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;
		mapboxgl.accessToken = MAPBOX_TOKEN;
		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [45.0792, 23.8859],
			zoom: 5,
		});
		mapRef.current.on("load", () => updateDisplay(false, "#f97316"));
		return () => {
			markersRef.current.forEach((m) => m.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	React.useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => updateDisplay(clusterEnabled, markerColor));
		}
	}, [mapStyle]);

	React.useEffect(() => {
		updateDisplay(clusterEnabled, markerColor);
	}, [markerColor, clusterEnabled]);

	return (
		<div className="wwc:relative">
			<div ref={mapContainerRef} className="wwc:h-[500px] wwc:w-full wwc:rounded-lg wwc:overflow-hidden" />
			<MapControls
				mapRef={mapRef}
				mapStyle={mapStyle}
				onMapStyleChange={setMapStyle}
				additionalSettings={[
					{id: "show-markers", label: "Markers", checked: showMarkerSelector, onCheckedChange: setShowMarkerSelector},
				]}
				additionalControls={
					showMarkerSelector && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" icon className="wwc:h-8 wwc:w-8 wwc:bg-background">
									<div className="wwc:relative">
										{clusterEnabled ? (
											<Layers className="wwc:h-4 wwc:w-4" />
										) : (
											markerTypes.find((m) => m.type === markerType)?.icon
										)}
										<div
											className="wwc:absolute wwc:-bottom-0.5 wwc:-right-0.5 wwc:h-2 wwc:w-2 wwc:rounded-full wwc:border wwc:border-background"
											style={{backgroundColor: markerColor}}
										/>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="wwc:w-[240px] wwc:p-2">
								{/* Cluster Toggle */}
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-2">
									<Label htmlFor="cluster-toggle" className="wwc:text-xs wwc:font-medium">
										Cluster
									</Label>
									<Switch id="cluster-toggle" checked={clusterEnabled} onCheckedChange={setClusterEnabled} />
								</div>
								<Separator className="wwc:my-2" />

								{/* Marker Types */}
								<div className={clusterEnabled ? "wwc:opacity-50 wwc:pointer-events-none" : ""}>
									<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Shape</span>
									<div className="wwc:flex wwc:flex-wrap wwc:gap-1 wwc:mt-1.5 wwc:mb-3">
										{markerTypes.map((mt) => (
											<button
												key={mt.type}
												type="button"
												onClick={() => setMarkerType(mt.type)}
												className={`wwc:h-8 wwc:w-8 wwc:rounded-md wwc:flex wwc:items-center wwc:justify-center wwc:transition-colors ${
													markerType === mt.type
														? "wwc:bg-primary wwc:text-primary-foreground"
														: "wwc:bg-muted wwc:hover:bg-accent"
												}`}
												title={mt.label}
											>
												{mt.icon}
											</button>
										))}
									</div>
								</div>
								<Separator className="wwc:my-2" />

								{/* Color Picker */}
								<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Color</span>
								<div className="wwc:flex wwc:flex-wrap wwc:gap-1.5 wwc:mt-1.5">
									{markerColors.map((c) => (
										<button
											key={c.value}
											type="button"
											onClick={() => setMarkerColor(c.value)}
											className={`wwc:h-6 wwc:w-6 wwc:rounded-full wwc:border-2 wwc:transition-colors ${
												markerColor === c.value
													? "wwc:border-foreground wwc:scale-110"
													: "wwc:border-transparent wwc:hover:border-muted-foreground"
											}`}
											style={{backgroundColor: c.value}}
											title={c.label}
										/>
									))}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					)
				}
			/>
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Default",
	component: Map,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Interactive map with markers, clustering, marker type selector, color picker, and MapControls. Uses Saudi Arabia regional locations.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta<typeof Map>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <DefaultMapStory />,
};
