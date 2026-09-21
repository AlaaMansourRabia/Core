import {
	AlertTriangle,
	Anchor,
	Award,
	Bell,
	Bookmark,
	Camera,
	ChevronLeft,
	ChevronRight,
	Circle,
	Coffee,
	Compass,
	Crown,
	Diamond,
	Flag,
	Flame,
	Gift,
	Heart,
	Hexagon,
	Home,
	Info,
	Key,
	Layers,
	MapPin,
	Pencil,
	Plus,
	Shield,
	Square,
	Star,
	Target,
	Trash2,
	Triangle,
	Zap,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {MAPBOX_TOKEN, MapControls} from "@/components/ui/map-controls";
import {Separator} from "@/components/ui/separator";
import {Switch} from "@/components/ui/switch";

type MarkerType = string;

interface MarkerTypeConfig {
	type: MarkerType;
	label: string;
	icon: React.ReactNode;
	svgPath: string;
}

const defaultMarkerTypes: MarkerTypeConfig[] = [
	{
		type: "pin",
		label: "Pin",
		icon: <MapPin className="wwc:h-4 wwc:w-4" />,
		svgPath: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z",
	},
	{
		type: "circle",
		label: "Circle",
		icon: <Circle className="wwc:h-4 wwc:w-4" />,
		svgPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
	},
	{type: "square", label: "Square", icon: <Square className="wwc:h-4 wwc:w-4" />, svgPath: "M3 3h18v18H3z"},
	{
		type: "triangle",
		label: "Triangle",
		icon: <Triangle className="wwc:h-4 wwc:w-4" />,
		svgPath: "M12 2 L22 20 L2 20 Z",
	},
	{
		type: "warning",
		label: "Warning",
		icon: <AlertTriangle className="wwc:h-4 wwc:w-4" />,
		svgPath: "M12 2 L22 20 L2 20 Z",
	},
	{
		type: "info",
		label: "Info",
		icon: <Info className="wwc:h-4 wwc:w-4" />,
		svgPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
	},
];

// Available shapes for custom markers
const availableShapes: {id: string; label: string; icon: React.ReactNode; svgPath: string}[] = [
	{
		id: "star",
		label: "Star",
		icon: <Star className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
	},
	{
		id: "heart",
		label: "Heart",
		icon: <Heart className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
	},
	{
		id: "home",
		label: "Home",
		icon: <Home className="wwc:h-5 wwc:w-5" />,
		svgPath: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
	},
	{
		id: "flag",
		label: "Flag",
		icon: <Flag className="wwc:h-5 wwc:w-5" />,
		svgPath: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
	},
	{
		id: "bookmark",
		label: "Bookmark",
		icon: <Bookmark className="wwc:h-5 wwc:w-5" />,
		svgPath: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
	},
	{
		id: "target",
		label: "Target",
		icon: <Target className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
	},
	{id: "zap", label: "Zap", icon: <Zap className="wwc:h-5 wwc:w-5" />, svgPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z"},
	{
		id: "shield",
		label: "Shield",
		icon: <Shield className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
	},
	{
		id: "bell",
		label: "Bell",
		icon: <Bell className="wwc:h-5 wwc:w-5" />,
		svgPath: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
	},
	{
		id: "camera",
		label: "Camera",
		icon: <Camera className="wwc:h-5 wwc:w-5" />,
		svgPath: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z",
	},
	{
		id: "coffee",
		label: "Coffee",
		icon: <Coffee className="wwc:h-5 wwc:w-5" />,
		svgPath: "M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z",
	},
	{
		id: "gift",
		label: "Gift",
		icon: <Gift className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
	},
	{
		id: "key",
		label: "Key",
		icon: <Key className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
	},
	{
		id: "anchor",
		label: "Anchor",
		icon: <Anchor className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 8v14M5 12H2a10 10 0 0 0 20 0h-3",
	},
	{
		id: "award",
		label: "Award",
		icon: <Award className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
	},
	{
		id: "compass",
		label: "Compass",
		icon: <Compass className="wwc:h-5 wwc:w-5" />,
		svgPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
	},
	{
		id: "crown",
		label: "Crown",
		icon: <Crown className="wwc:h-5 wwc:w-5" />,
		svgPath: "M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14",
	},
	{
		id: "diamond",
		label: "Diamond",
		icon: <Diamond className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z",
	},
	{
		id: "flame",
		label: "Flame",
		icon: <Flame className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
	},
	{
		id: "hexagon",
		label: "Hexagon",
		icon: <Hexagon className="wwc:h-5 wwc:w-5" />,
		svgPath:
			"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
	},
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

// Helper to adjust color brightness
const adjustColorBrightness = (hex: string, percent: number): string => {
	const num = Number.parseInt(hex.replace("#", ""), 16);
	const amt = Math.round(2.55 * percent);
	const R = Math.min(255, Math.max(0, (num >> 16) + amt));
	const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
	const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
	return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

const getClusterColors = (baseColor: string) => ({
	light: adjustColorBrightness(baseColor, 40), // < 10 locations
	medium: baseColor, // 10-30 locations
	dark: adjustColorBrightness(baseColor, -30), // > 30 locations
});

const createMarkerElement = (type: MarkerType, color: string, allMarkerTypes: MarkerTypeConfig[]): HTMLElement => {
	const el = document.createElement("div");
	el.style.width = "24px";
	el.style.height = "24px";
	el.style.cursor = "pointer";

	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("width", "24");
	svg.setAttribute("height", "24");
	svg.setAttribute("fill", color);
	svg.setAttribute("stroke", "#ffffff");
	svg.setAttribute("wwc:stroke-width", "2");

	// Find the marker type config
	const markerConfig = allMarkerTypes.find((m) => m.type === type);

	if (markerConfig) {
		// Special cases with additional elements
		if (type === "warning") {
			svg.innerHTML = `<path d="${markerConfig.svgPath}"/><line x1="12" y1="9" x2="12" y2="13" stroke="#ffffff" wwc:stroke-width="2"/><circle cx="12" cy="16" r="1" fill="#ffffff"/>`;
		} else if (type === "info") {
			svg.innerHTML = `<path d="${markerConfig.svgPath}"/><line x1="12" y1="11" x2="12" y2="16" stroke="#ffffff" wwc:stroke-width="2"/><circle cx="12" cy="8" r="1" fill="#ffffff"/>`;
		} else if (type === "pin") {
			svg.innerHTML = `<path d="${markerConfig.svgPath}"/><circle cx="12" cy="10" r="3" fill="#ffffff"/>`;
		} else {
			svg.innerHTML = `<path d="${markerConfig.svgPath}"/>`;
		}
	} else {
		// Fallback to circle
		svg.innerHTML = `<circle cx="12" cy="12" r="8"/>`;
	}

	el.appendChild(svg);
	return el;
};

// Generate locations across Saudi Arabia regions
const generateLocations = () => {
	const regions = [
		{name: "Riyadh", center: [46.6753, 24.7136], count: 15},
		{name: "Jeddah", center: [39.1925, 21.4858], count: 12},
		{name: "Mecca", center: [39.8579, 21.3891], count: 10},
		{name: "Medina", center: [39.6142, 24.5247], count: 8},
		{name: "Dammam", center: [50.1033, 26.4207], count: 10},
		{name: "Tabuk", center: [36.5998, 28.3835], count: 6},
		{name: "Abha", center: [42.5053, 18.2164], count: 5},
		{name: "Taif", center: [40.4168, 21.2703], count: 6},
		{name: "Buraidah", center: [43.975, 26.326], count: 5},
		{name: "Khobar", center: [50.2083, 26.2794], count: 8},
		{name: "Jubail", center: [49.6225, 27.0046], count: 5},
		{name: "Yanbu", center: [38.0618, 24.0895], count: 4},
		{name: "Najran", center: [44.1277, 17.4933], count: 4},
		{name: "Jazan", center: [42.5511, 16.8892], count: 4},
		{name: "Hail", center: [41.6908, 27.5114], count: 4},
	];

	const locations: {name: string; coordinates: [number, number]; description: string}[] = [];
	const placeTypes = ["Store", "Office", "Branch", "Center", "Hub"];

	regions.forEach((region) => {
		for (let i = 0; i < region.count; i++) {
			const lng = region.center[0] + (Math.random() - 0.5) * 0.5;
			const lat = region.center[1] + (Math.random() - 0.5) * 0.5;
			const type = placeTypes[Math.floor(Math.random() * placeTypes.length)];
			locations.push({
				name: `${region.name} ${type} #${i + 1}`,
				coordinates: [lng, lat] as [number, number],
				description: `${type} location in ${region.name} area`,
			});
		}
	});

	return locations;
};

const sampleLocations = generateLocations();

export function MapPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
	const [markerType, setMarkerType] = useState<MarkerType>("pin");
	const [markerColor, setMarkerColor] = useState("#f97316");
	const [showMarkerSelector, setShowMarkerSelector] = useState(true);
	const [clusterEnabled, setClusterEnabled] = useState(false);

	// Custom marker state
	const [customMarkers, setCustomMarkers] = useState<MarkerTypeConfig[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [newShapeName, setNewShapeName] = useState("");
	const [selectedShape, setSelectedShape] = useState<string | null>(null);
	const [editingMarker, setEditingMarker] = useState<MarkerTypeConfig | null>(null);
	const [markerMenuOpen, setMarkerMenuOpen] = useState(false);
	const shapeScrollRef = useRef<HTMLDivElement>(null);

	// Combined marker types (default + custom)
	const allMarkerTypes = [...defaultMarkerTypes, ...customMarkers];

	const scrollShapes = (direction: "left" | "right") => {
		if (shapeScrollRef.current) {
			const scrollAmount = 120;
			shapeScrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const removeClusterLayers = () => {
		if (!mapRef.current) return;
		if (mapRef.current.getLayer("clusters")) mapRef.current.removeLayer("clusters");
		if (mapRef.current.getLayer("cluster-count")) mapRef.current.removeLayer("cluster-count");
		if (mapRef.current.getLayer("unclustered-point")) mapRef.current.removeLayer("unclustered-point");
		if (mapRef.current.getSource("locations-cluster")) mapRef.current.removeSource("locations-cluster");
	};

	const addClusterLayers = (color: string = markerColor) => {
		if (!mapRef.current) return;

		removeClusterLayers();

		const geojsonData: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: sampleLocations.map((loc) => ({
				type: "Feature",
				properties: {name: loc.name, description: loc.description},
				geometry: {type: "Point", coordinates: loc.coordinates},
			})),
		};

		mapRef.current.addSource("locations-cluster", {
			type: "geojson",
			data: geojsonData,
			cluster: true,
			clusterMaxZoom: 14,
			clusterRadius: 50,
		});

		const clusterColors = getClusterColors(color);

		mapRef.current.addLayer({
			id: "clusters",
			type: "circle",
			source: "locations-cluster",
			filter: ["has", "point_count"],
			paint: {
				"circle-color": [
					"step",
					["get", "point_count"],
					clusterColors.light,
					10,
					clusterColors.medium,
					30,
					clusterColors.dark,
				],
				"circle-radius": 24,
				"circle-opacity": 0.9,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#ffffff",
			},
		});

		mapRef.current.addLayer({
			id: "cluster-count",
			type: "symbol",
			source: "locations-cluster",
			filter: ["has", "point_count"],
			layout: {
				"text-field": ["get", "point_count_abbreviated"],
				"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
				"text-size": 12,
			},
			paint: {
				"text-color": "#ffffff",
			},
		});

		mapRef.current.addLayer({
			id: "unclustered-point",
			type: "circle",
			source: "locations-cluster",
			filter: ["!", ["has", "point_count"]],
			paint: {
				"circle-color": color,
				"circle-radius": 8,
				"circle-stroke-width": 2,
				"circle-stroke-color": "#fff",
			},
		});

		// Click on cluster to zoom
		mapRef.current.on("click", "clusters", (e) => {
			const features = mapRef.current?.queryRenderedFeatures(e.point, {layers: ["clusters"]});
			if (!features?.length) return;
			const clusterId = features[0].properties?.cluster_id;
			const source = mapRef.current?.getSource("locations-cluster") as mapboxgl.GeoJSONSource;
			source.getClusterExpansionZoom(clusterId, (err, zoom) => {
				if (err || zoom === null || zoom === undefined) return;
				mapRef.current?.easeTo({
					center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
					zoom: zoom,
				});
			});
		});

		// Click on unclustered point for popup
		mapRef.current.on("click", "unclustered-point", (e) => {
			const coordinates = (e.features?.[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
			const {name, description} = e.features?.[0].properties as {name: string; description: string};

			new mapboxgl.Popup()
				.setLngLat(coordinates)
				.setHTML(
					`<div style="padding: 4px;"><strong style="font-size: 14px;">${name}</strong><p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${description}</p></div>`,
				)
				.addTo(mapRef.current!);
		});

		mapRef.current.on("mouseenter", "clusters", () => {
			if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
		});
		mapRef.current.on("mouseleave", "clusters", () => {
			if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
		});
		mapRef.current.on("mouseenter", "unclustered-point", () => {
			if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer";
		});
		mapRef.current.on("mouseleave", "unclustered-point", () => {
			if (mapRef.current) mapRef.current.getCanvas().style.cursor = "";
		});
	};

	const addMarkers = (
		type: MarkerType = markerType,
		color: string = markerColor,
		markers: MarkerTypeConfig[] = allMarkerTypes,
	) => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		sampleLocations.forEach((location) => {
			const popup = new mapboxgl.Popup({offset: 25}).setHTML(
				`<div style="padding: 4px;">
          <strong style="font-size: 14px;">${location.name}</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${location.description}</p>
        </div>`,
			);

			const markerOptions: mapboxgl.MarkerOptions =
				type === "pin" ? {color: color} : {element: createMarkerElement(type, color, markers)};

			const marker = new mapboxgl.Marker(markerOptions)
				.setLngLat(location.coordinates)
				.setPopup(popup)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});
	};

	const handleSaveCustomShape = () => {
		if (!newShapeName.trim() || !selectedShape) return;

		const shapeConfig = availableShapes.find((s) => s.id === selectedShape);
		if (!shapeConfig) return;

		if (editingMarker) {
			// Update existing marker
			setCustomMarkers((prev) =>
				prev.map((m) =>
					m.type === editingMarker.type
						? {...m, label: newShapeName.trim(), icon: shapeConfig.icon, svgPath: shapeConfig.svgPath}
						: m,
				),
			);
			setEditingMarker(null);
		} else {
			// Add new marker
			const newMarker: MarkerTypeConfig = {
				type: `custom-${Date.now()}`,
				label: newShapeName.trim(),
				icon: shapeConfig.icon,
				svgPath: shapeConfig.svgPath,
			};
			setCustomMarkers((prev) => [...prev, newMarker]);
		}

		setNewShapeName("");
		setSelectedShape(null);
		setIsDialogOpen(false);
	};

	const handleEditMarker = (marker: MarkerTypeConfig) => {
		setEditingMarker(marker);
		setNewShapeName(marker.label);
		// Find matching shape
		const matchingShape = availableShapes.find((s) => s.svgPath === marker.svgPath);
		setSelectedShape(matchingShape?.id || null);
		setIsDialogOpen(true);
	};

	const handleDeleteMarker = (deletedType: string) => {
		setCustomMarkers((prev) => prev.filter((m) => m.type !== deletedType));
		// If deleted marker was selected, switch to pin
		if (markerType === deletedType) {
			setMarkerType("pin");
		}
	};

	const closeDialog = () => {
		setIsDialogOpen(false);
		setNewShapeName("");
		setSelectedShape(null);
		setEditingMarker(null);
	};

	const updateDisplay = (cluster: boolean, type: MarkerType, color: string) => {
		if (!mapRef.current?.loaded()) return;

		if (cluster) {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			addClusterLayers(color);
		} else {
			removeClusterLayers();
			addMarkers(type, color);
		}
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

		mapRef.current.on("load", () => updateDisplay(false, "pin", "#f97316"));

		return () => {
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => updateDisplay(clusterEnabled, markerType, markerColor));
		}
	}, [mapStyle]);

	useEffect(() => {
		updateDisplay(clusterEnabled, markerType, markerColor);
	}, [markerType, markerColor, clusterEnabled]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Default</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Interactive map with markers, search, and customizable controls.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Interactive Map with Markers</CardTitle>
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
									id: "show-markers",
									label: "Markers",
									checked: showMarkerSelector,
									onCheckedChange: setShowMarkerSelector,
								},
							]}
							additionalControls={
								showMarkerSelector && (
									<DropdownMenu open={markerMenuOpen} onOpenChange={setMarkerMenuOpen}>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" icon className="wwc:h-8 wwc:w-8 wwc:bg-background">
												<div className="wwc:relative">
													{clusterEnabled ? (
														<Layers className="wwc:h-4 wwc:w-4" />
													) : (
														allMarkerTypes.find((m) => m.type === markerType)?.icon
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
											<div className={`${clusterEnabled ? "wwc:opacity-50 wwc:pointer-events-none" : ""}`}>
												<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-2">
													<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Shape</span>
													<Button
														variant="ghost"
														icon
														className="wwc:h-5 wwc:w-5"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															setMarkerMenuOpen(false);
															setIsDialogOpen(true);
														}}
														disabled={clusterEnabled}
													>
														<Plus className="wwc:h-3 wwc:w-3" />
													</Button>
												</div>
												<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:mb-3">
													{/* Left Arrow */}
													{allMarkerTypes.length > 3 && (
														<button
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																scrollShapes("left");
															}}
															className="wwc:shrink-0 wwc:h-6 wwc:w-6 wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted wwc:hover:bg-accent wwc:rounded-full"
														>
															<ChevronLeft className="wwc:h-3 wwc:w-3" />
														</button>
													)}

													<div
														ref={shapeScrollRef}
														className="wwc:flex wwc:gap-1 wwc:overflow-x-auto scrollbar-none wwc:flex-1"
														style={{scrollbarWidth: "none", msOverflowStyle: "none"}}
													>
														{allMarkerTypes.map((marker) => {
															const isCustom = marker.type.startsWith("custom-");
															return (
																<div key={marker.type} className="wwc:relative wwc:group wwc:shrink-0">
																	<button
																		onClick={() => setMarkerType(marker.type)}
																		disabled={clusterEnabled}
																		className={`wwc:flex wwc:flex-col wwc:items-center wwc:gap-1 wwc:p-2 wwc:rounded-md wwc:hover:bg-accent wwc:transition-colors wwc:min-w-[52px] ${
																			markerType === marker.type ? "wwc:bg-accent" : ""
																		}`}
																	>
																		{marker.icon}
																		<span className="wwc:text-[10px] wwc:truncate wwc:w-full wwc:text-center">
																			{marker.label}
																		</span>
																	</button>
																	{isCustom && (
																		<div className="wwc:absolute wwc:-top-1 wwc:-right-1 wwc:hidden wwc:group-hover:flex wwc:gap-0.5">
																			<button
																				onClick={(e) => {
																					e.preventDefault();
																					e.stopPropagation();
																					setMarkerMenuOpen(false);
																					handleEditMarker(marker);
																				}}
																				className="wwc:h-4 wwc:w-4 wwc:flex wwc:items-center wwc:justify-center wwc:bg-background wwc:border wwc:rounded-full wwc:shadow-sm wwc:hover:bg-accent"
																			>
																				<Pencil className="wwc:h-2 wwc:w-2" />
																			</button>
																			<button
																				onClick={(e) => {
																					e.preventDefault();
																					e.stopPropagation();
																					setMarkerMenuOpen(false);
																					handleDeleteMarker(marker.type);
																				}}
																				className="wwc:h-4 wwc:w-4 wwc:flex wwc:items-center wwc:justify-center wwc:bg-background wwc:border wwc:rounded-full wwc:shadow-sm wwc:hover:bg-destructive wwc:hover:text-destructive-foreground"
																			>
																				<Trash2 className="wwc:h-2 wwc:w-2" />
																			</button>
																		</div>
																	)}
																</div>
															);
														})}
													</div>

													{/* Right Arrow */}
													{allMarkerTypes.length > 3 && (
														<button
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																scrollShapes("right");
															}}
															className="wwc:shrink-0 wwc:h-6 wwc:w-6 wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted wwc:hover:bg-accent wwc:rounded-full"
														>
															<ChevronRight className="wwc:h-3 wwc:w-3" />
														</button>
													)}
												</div>
											</div>

											{/* Marker Colors */}
											<div className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Color</div>
											<div className="wwc:grid wwc:grid-cols-10 wwc:gap-1">
												{markerColors.map((color) => (
													<button
														key={color.value}
														onClick={() => setMarkerColor(color.value)}
														className="wwc:h-4 wwc:w-4 wwc:rounded-full wwc:border wwc:hover:scale-110 wwc:transition-transform"
														style={{
															backgroundColor: color.value,
															borderColor: markerColor === color.value ? "white" : "transparent",
															boxShadow: markerColor === color.value ? "0 0 0 1.5px hsl(var(--primary))" : "none",
														}}
														title={color.label}
													/>
												))}
											</div>
										</DropdownMenuContent>
									</DropdownMenu>
								)
							}
						/>

						{/* Add/Edit Custom Shape Panel */}
						{isDialogOpen && (
							<div className="wwc:absolute wwc:inset-0 wwc:bg-black/20 wwc:backdrop-blur-[2px] wwc:z-20 wwc:flex wwc:items-center wwc:justify-center wwc:rounded-lg">
								<div className="wwc:bg-background wwc:border wwc:rounded-lg wwc:shadow-lg wwc:w-[320px] wwc:p-4">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mb-4">
										<h3 className="wwc:font-semibold wwc:text-sm">
											{editingMarker ? "Edit Marker Shape" : "Add Custom Marker Shape"}
										</h3>
										<Button variant="ghost" icon className="wwc:h-6 wwc:w-6" onClick={closeDialog}>
											<span className="wwc:sr-only">Close</span>
											<svg className="wwc:h-4 wwc:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</Button>
									</div>
									<div className="wwc:space-y-4">
										<div className="wwc:space-y-2">
											<Label htmlFor="shape-name" className="wwc:text-xs">
												Shape Name
											</Label>
											<Input
												id="shape-name"
												placeholder="Enter shape name..."
												value={newShapeName}
												onChange={(e) => setNewShapeName(e.target.value)}
												className="wwc:h-8 wwc:text-sm"
											/>
										</div>
										<div className="wwc:space-y-2">
											<Label className="wwc:text-xs">Select Shape</Label>
											<div className="wwc:border wwc:rounded-md wwc:p-2 wwc:h-[160px] wwc:overflow-y-auto">
												<div className="wwc:grid wwc:grid-cols-5 wwc:gap-1.5">
													{availableShapes.map((shape) => (
														<button
															key={shape.id}
															onClick={() => setSelectedShape(shape.id)}
															className={`wwc:flex wwc:items-center wwc:justify-center wwc:p-2 wwc:rounded-md wwc:hover:bg-accent wwc:transition-colors ${
																selectedShape === shape.id ? "wwc:bg-accent wwc:ring-2 wwc:ring-primary" : ""
															}`}
															title={shape.label}
														>
															{shape.icon}
														</button>
													))}
												</div>
											</div>
											{selectedShape && (
												<p className="wwc:text-[10px] wwc:text-muted-foreground">
													Selected: {availableShapes.find((s) => s.id === selectedShape)?.label}
												</p>
											)}
										</div>
										<div className="wwc:flex wwc:gap-2 wwc:pt-2">
											<Button variant="outline" size="sm" className="wwc:flex-1" onClick={closeDialog}>
												Cancel
											</Button>
											<Button
												size="sm"
												className="wwc:flex-1"
												onClick={handleSaveCustomShape}
												disabled={!newShapeName.trim() || !selectedShape}
											>
												{editingMarker ? "Update" : "Save"}
											</Button>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Cluster Legend */}
						{clusterEnabled &&
							(() => {
								const colors = getClusterColors(markerColor);
								return (
									<div className="wwc:absolute wwc:top-14 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:p-2 wwc:text-xs wwc:space-y-1.5 wwc:border wwc:shadow-sm">
										<div className="wwc:font-medium wwc:text-muted-foreground wwc:mb-1">Clusters</div>
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<span
												className="wwc:w-4 wwc:h-4 wwc:rounded-full wwc:border wwc:border-white/50"
												style={{backgroundColor: colors.light}}
											/>
											<span className="wwc:text-muted-foreground">&lt; 10 locations</span>
										</div>
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<span
												className="wwc:w-4 wwc:h-4 wwc:rounded-full wwc:border wwc:border-white/50"
												style={{backgroundColor: colors.medium}}
											/>
											<span className="wwc:text-muted-foreground">10-30 locations</span>
										</div>
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<span
												className="wwc:w-4 wwc:h-4 wwc:rounded-full wwc:border wwc:border-white/50"
												style={{backgroundColor: colors.dark}}
											/>
											<span className="wwc:text-muted-foreground">&gt; 30 locations</span>
										</div>
										<div className="wwc:text-[10px] wwc:text-muted-foreground wwc:pt-1 wwc:border-t">
											{sampleLocations.length} total locations
										</div>
									</div>
								);
							})()}
					</div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-4">
						Click on markers to see location details. Use the controls to customize the map.
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Usage</CardTitle>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import mapboxgl from "mapbox-gl"

// Initialize map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [45.0792, 23.8859],
  zoom: 5,
})

// Add marker with popup
const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML("<strong>Location</strong><p>Description</p>")

new mapboxgl.Marker({ color: "#f97316" })
  .setLngLat([longitude, latitude])
  .setPopup(popup)
  .addTo(map)`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
