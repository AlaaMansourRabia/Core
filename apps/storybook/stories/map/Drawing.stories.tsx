import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@corensystem/coren-ui/card";
import {Input} from "@corensystem/coren-ui/input";
import "mapbox-gl/dist/mapbox-gl.css";
import {Label} from "@corensystem/coren-ui/label";
import {Map} from "@corensystem/coren-ui/map";
import {MapControls} from "@corensystem/coren-ui/map-controls";
import {MAPBOX_TOKEN} from "@corensystem/coren-ui/mapbox-token";
import {
	PushPanel,
	PushPanelContainer,
	PushPanelContent,
	PushPanelFooter,
	PushPanelHeader,
	PushPanelHeaderActions,
	PushPanelHeaderTitle,
	PushPanelMain,
	PushPanelProvider,
	PushPanelTitle,
} from "@corensystem/coren-ui/push-panel";
import {Textarea} from "@corensystem/coren-ui/textarea";
import {ChevronLeft, ChevronRight, Edit2, Minus, PenTool, Pencil, Plus, Square, Trash2, X} from "lucide-react";
import mapboxgl from "mapbox-gl";
import {useEffect, useRef, useState} from "react";

type DrawMode = "none" | "polygon" | "rectangle";

interface BlueprintImage {
	base64Data: string;
	opacity: number;
}

interface Zone {
	id: string;
	type: string;
	coordinates: number[][];
	name: string;
	color: string;
	description: string;
	// Circle-specific properties
	center?: [number, number];
	radius?: number;
}

interface Space {
	id: string;
	type: string;
	coordinates: number[][];
	name: string;
	color: string;
	description: string;
	// Circle-specific properties
	center?: [number, number];
	radius?: number;
	// Blueprint image properties
	blueprintImage?: BlueprintImage;
	imageCorners?: [number, number][]; // [topLeft, topRight, bottomRight, bottomLeft]
	// Child zones
	zones: Zone[];
}

const spaceColors = [
	{value: "#f97316", label: "Orange"},
	{value: "#ef4444", label: "Red"},
	{value: "#22c55e", label: "Green"},
	{value: "#3b82f6", label: "Blue"},
	{value: "#8b5cf6", label: "Purple"},
	{value: "#ec4899", label: "Pink"},
	{value: "#eab308", label: "Yellow"},
	{value: "#06b6d4", label: "Cyan"},
];

const zoneColors = [
	{value: "#fb923c", label: "Light Orange"},
	{value: "#f87171", label: "Light Red"},
	{value: "#4ade80", label: "Light Green"},
	{value: "#60a5fa", label: "Light Blue"},
	{value: "#a78bfa", label: "Light Purple"},
	{value: "#f472b6", label: "Light Pink"},
	{value: "#facc15", label: "Light Yellow"},
	{value: "#22d3ee", label: "Light Cyan"},
];

// Snap distance in pixels
const SNAP_DISTANCE = 15;

function DrawingPageComponent() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
	const [isDrawingMode, setIsDrawingMode] = useState(false);
	const [drawMode, setDrawMode] = useState<DrawMode>("none");
	const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
	const [spaces, setSpaces] = useState<Space[]>([]);
	const [isNearFirstPoint, setIsNearFirstPoint] = useState(false);
	const spaceCountRef = useRef(0);

	// Space details panel state
	const [selectedSpace, setSelectedSpace] = useState<Space | null>(null); // For viewing
	const [editingSpace, setEditingSpace] = useState<Space | null>(null); // For editing
	const [isSpaceEditMode, setIsSpaceEditMode] = useState(false);
	const [spaceName, setSpaceName] = useState("");
	const [spaceColor, setSpaceColor] = useState("#f97316");
	const [spaceDescription, setSpaceDescription] = useState("");
	const [spaceCoordinates, setSpaceCoordinates] = useState<number[][]>([]);
	const [showSpacePanel, setShowSpacePanel] = useState(false);

	// Blueprint image state
	const [blueprintImage, setBlueprintImage] = useState<BlueprintImage | null>(null);
	const [imageCorners, setImageCorners] = useState<[number, number][] | null>(null);
	const [draggingCornerIndex, setDraggingCornerIndex] = useState<number | null>(null);
	const [draggingPointIndex, setDraggingPointIndex] = useState<number | null>(null);
	const [draggingZonePointIndex, setDraggingZonePointIndex] = useState<number | null>(null);
	const [isDraggingSpace, setIsDraggingSpace] = useState(false);
	const [isDraggingZone, setIsDraggingZone] = useState(false);
	const [dragStartCoord, setDragStartCoord] = useState<[number, number] | null>(null);

	// New space drawing drag state
	const [draggingNewPointIndex, setDraggingNewPointIndex] = useState<number | null>(null);
	const [isDraggingNewShape, setIsDraggingNewShape] = useState(false);
	const [newDragStart, setNewDragStart] = useState<[number, number] | null>(null);

	// Circle-specific state
	const [circleCenter, setCircleCenter] = useState<[number, number] | null>(null);
	const [circleRadius, setCircleRadius] = useState<number>(2);

	// Zone state
	const [isDrawingZone, setIsDrawingZone] = useState(false);
	const [selectedZone, setSelectedZone] = useState<Zone | null>(null); // For viewing
	const [editingZone, setEditingZone] = useState<Zone | null>(null); // For editing
	const [isZoneEditMode, setIsZoneEditMode] = useState(false);
	const [isNewZone, setIsNewZone] = useState(false); // Track if editing a new (unsaved) zone
	const [zoneName, setZoneName] = useState("");
	const [zoneColor, setZoneColor] = useState("#60a5fa");
	const [zoneDescription, setZoneDescription] = useState("");
	const [zoneCoordinates, setZoneCoordinates] = useState<number[][]>([]);
	const [zoneCircleCenter, setZoneCircleCenter] = useState<[number, number] | null>(null);
	const [zoneCircleRadius, setZoneCircleRadius] = useState<number>(0.5);
	const zoneCountRef = useRef(0);

	const initDrawingLayers = () => {
		if (!mapRef.current) return;

		if (!mapRef.current.getSource("drawing")) {
			mapRef.current.addSource("drawing", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "drawing-fill",
				type: "fill",
				source: "drawing",
				paint: {
					"fill-color": ["get", "color"],
					"fill-opacity": 0.3,
				},
			});

			mapRef.current.addLayer({
				id: "drawing-line",
				type: "line",
				source: "drawing",
				paint: {
					"line-color": ["get", "color"],
					"line-width": 2,
				},
			});
		}

		// Zones layer (child zones within spaces)
		if (!mapRef.current.getSource("zones")) {
			mapRef.current.addSource("zones", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "zones-fill",
				type: "fill",
				source: "zones",
				paint: {
					"fill-color": ["get", "color"],
					"fill-opacity": 0.4,
				},
			});

			mapRef.current.addLayer({
				id: "zones-line",
				type: "line",
				source: "zones",
				paint: {
					"line-color": ["get", "color"],
					"line-width": 2,
					"line-dasharray": [4, 2],
				},
			});
		}

		if (!mapRef.current.getSource("current-drawing")) {
			mapRef.current.addSource("current-drawing", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "current-drawing-fill",
				type: "fill",
				source: "current-drawing",
				paint: {
					"fill-color": "#3b82f6",
					"fill-opacity": 0.3,
				},
			});

			mapRef.current.addLayer({
				id: "current-drawing-line",
				type: "line",
				source: "current-drawing",
				paint: {
					"line-color": "#3b82f6",
					"line-width": 2,
					"line-dasharray": [2, 2],
				},
			});
		}

		if (!mapRef.current.getSource("drawing-points")) {
			mapRef.current.addSource("drawing-points", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "drawing-points",
				type: "circle",
				source: "drawing-points",
				paint: {
					"circle-radius": ["case", ["get", "isFirst"], 8, 5],
					"circle-color": ["case", ["get", "isSnap"], "#22c55e", "#3b82f6"],
					"circle-stroke-width": 2,
					"circle-stroke-color": "#fff",
				},
			});
		}

		// Drawing midpoints layer for adding new points
		if (!mapRef.current.getSource("drawing-midpoints")) {
			mapRef.current.addSource("drawing-midpoints", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "drawing-midpoints",
				type: "circle",
				source: "drawing-midpoints",
				paint: {
					"circle-radius": 4,
					"circle-color": "#3b82f6",
					"circle-opacity": 0.6,
					"circle-stroke-width": 1,
					"circle-stroke-color": "#fff",
				},
			});
		}

		// Coordinate labels layer for shape vertices
		if (!mapRef.current.getSource("coordinate-labels")) {
			mapRef.current.addSource("coordinate-labels", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			// Point markers for vertices
			mapRef.current.addLayer({
				id: "coordinate-points",
				type: "circle",
				source: "coordinate-labels",
				paint: {
					"circle-radius": 5,
					"circle-color": "#fff",
					"circle-stroke-width": 2,
					"circle-stroke-color": ["get", "color"],
				},
			});

			// Labels for coordinate points
			mapRef.current.addLayer({
				id: "coordinate-labels-text",
				type: "symbol",
				source: "coordinate-labels",
				layout: {
					"text-field": ["get", "label"],
					"text-size": 10,
					"text-offset": [0, -1.5],
					"text-anchor": "bottom",
					"text-allow-overlap": true,
				},
				paint: {
					"text-color": "#fff",
					"text-halo-color": "rgba(0,0,0,0.8)",
					"text-halo-width": 1,
				},
			});
		}

		// Edge midpoints layer for adding new points
		if (!mapRef.current.getSource("edge-midpoints")) {
			mapRef.current.addSource("edge-midpoints", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "edge-midpoints",
				type: "circle",
				source: "edge-midpoints",
				paint: {
					"circle-radius": 3,
					"circle-color": ["get", "color"],
					"circle-opacity": 0.6,
					"circle-stroke-width": 1,
					"circle-stroke-color": "#fff",
				},
			});
		}

		// Image corner markers for blueprint positioning
		if (!mapRef.current.getSource("image-corners")) {
			mapRef.current.addSource("image-corners", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			// Corner point markers (larger, yellow)
			mapRef.current.addLayer({
				id: "image-corner-points",
				type: "circle",
				source: "image-corners",
				paint: {
					"circle-radius": 6,
					"circle-color": "#fbbf24",
					"circle-stroke-width": 2,
					"circle-stroke-color": "#fff",
				},
			});

			// Corner labels
			mapRef.current.addLayer({
				id: "image-corner-labels",
				type: "symbol",
				source: "image-corners",
				layout: {
					"text-field": ["get", "label"],
					"text-size": 10,
					"text-offset": [0, -1.5],
					"text-anchor": "bottom",
					"text-allow-overlap": true,
				},
				paint: {
					"text-color": "#fff",
					"text-halo-color": "rgba(0,0,0,0.8)",
					"text-halo-width": 1,
				},
			});
		}

		// Zone coordinate labels layer (above space coordinate points)
		if (!mapRef.current.getSource("zone-coordinate-labels")) {
			mapRef.current.addSource("zone-coordinate-labels", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			// Zone point markers
			mapRef.current.addLayer({
				id: "zone-coordinate-points",
				type: "circle",
				source: "zone-coordinate-labels",
				paint: {
					"circle-radius": 5,
					"circle-color": "#fff",
					"circle-stroke-width": 2,
					"circle-stroke-color": ["get", "color"],
				},
			});

			// Zone coordinate labels text
			mapRef.current.addLayer({
				id: "zone-coordinate-labels-text",
				type: "symbol",
				source: "zone-coordinate-labels",
				layout: {
					"text-field": ["get", "label"],
					"text-size": 10,
					"text-offset": [0, -1.5],
					"text-anchor": "bottom",
					"text-allow-overlap": true,
				},
				paint: {
					"text-color": "#fff",
					"text-halo-color": "rgba(0,0,0,0.8)",
					"text-halo-width": 1,
				},
			});
		}

		// Zone editing outline layer (shows lines connecting zone points)
		if (!mapRef.current.getSource("zone-editing-outline")) {
			mapRef.current.addSource("zone-editing-outline", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "zone-editing-outline",
				type: "line",
				source: "zone-editing-outline",
				paint: {
					"line-color": ["get", "color"],
					"line-width": 3,
					"line-dasharray": [2, 1],
				},
			});
		}

		// Zone edge midpoints layer for adding new points
		if (!mapRef.current.getSource("zone-edge-midpoints")) {
			mapRef.current.addSource("zone-edge-midpoints", {
				type: "geojson",
				data: {type: "FeatureCollection", features: []},
			});

			mapRef.current.addLayer({
				id: "zone-edge-midpoints",
				type: "circle",
				source: "zone-edge-midpoints",
				paint: {
					"circle-radius": 3,
					"circle-color": ["get", "color"],
					"circle-opacity": 0.6,
					"circle-stroke-width": 1,
					"circle-stroke-color": "#fff",
				},
			});
		}
	};

	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [46.6753, 24.7136],
			zoom: 10,
		});

		mapRef.current.on("load", initDrawingLayers);

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", () => {
				initDrawingLayers();
				// Restore existing spaces and zones after style change
				updateMapSpaces(spaces);
				updateMapZones(spaces);
			});
		}
	}, [mapStyle]);

	// Click handlers for selecting spaces and zones on map
	useEffect(() => {
		if (!mapRef.current) return;
		const map = mapRef.current;

		const handleSpaceClick = (e: mapboxgl.MapLayerMouseEvent) => {
			// Don't select if we're in drawing mode or zone edit mode
			if (isDrawingMode || isDrawingZone || isZoneEditMode) return;

			const feature = e.features?.[0];
			if (feature?.properties?.id) {
				const spaceId = feature.properties.id;
				const space = spaces.find((s) => s.id === spaceId);
				if (space) {
					e.originalEvent.stopPropagation();
					selectSpace(space);
				}
			}
		};

		const handleZoneClick = (e: mapboxgl.MapLayerMouseEvent) => {
			// Don't select if we're in drawing mode or zone edit mode
			if (isDrawingMode || isDrawingZone || isZoneEditMode) return;

			const feature = e.features?.[0];
			if (feature?.properties?.id && feature.properties?.spaceId) {
				const zoneId = feature.properties.id;
				const spaceId = feature.properties.spaceId;
				const space = spaces.find((s) => s.id === spaceId);
				const zone = space?.zones.find((z) => z.id === zoneId);
				if (space && zone) {
					e.originalEvent.stopPropagation();
					selectZone(zone, space);
				}
			}
		};

		// Add cursor change on hover
		const handleMouseEnter = () => {
			if (!isDrawingMode && !isDrawingZone && !isZoneEditMode) {
				map.getCanvas().style.cursor = "pointer";
			}
		};
		const handleMouseLeave = () => {
			if (!isDrawingMode && !isDrawingZone && !isZoneEditMode) {
				map.getCanvas().style.cursor = "";
			}
		};

		// Set up event listeners
		map.on("click", "zones-fill", handleZoneClick);
		map.on("click", "drawing-fill", handleSpaceClick);
		map.on("mouseenter", "drawing-fill", handleMouseEnter);
		map.on("mouseleave", "drawing-fill", handleMouseLeave);
		map.on("mouseenter", "zones-fill", handleMouseEnter);
		map.on("mouseleave", "zones-fill", handleMouseLeave);

		return () => {
			map.off("click", "zones-fill", handleZoneClick);
			map.off("click", "drawing-fill", handleSpaceClick);
			map.off("mouseenter", "drawing-fill", handleMouseEnter);
			map.off("mouseleave", "drawing-fill", handleMouseLeave);
			map.off("mouseenter", "zones-fill", handleMouseEnter);
			map.off("mouseleave", "zones-fill", handleMouseLeave);
		};
	}, [spaces, isDrawingMode, isDrawingZone, isZoneEditMode]);

	// Check if cursor is near the first point
	const checkSnapToFirst = (cursorCoords: [number, number]): boolean => {
		if (!mapRef.current || polygonPoints.length < 3) return false;

		const firstPoint = mapRef.current.project(polygonPoints[0]);
		const cursorPoint = mapRef.current.project(cursorCoords);

		const distance = Math.sqrt((firstPoint.x - cursorPoint.x) ** 2 + (firstPoint.y - cursorPoint.y) ** 2);

		return distance <= SNAP_DISTANCE;
	};

	useEffect(() => {
		if (!mapRef.current) return;

		const handleClick = (e: mapboxgl.MapMouseEvent) => {
			// Handle zone drawing mode
			if (isDrawingZone && drawMode !== "none") {
				const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

				if (drawMode === "polygon") {
					if (isNearFirstPoint && polygonPoints.length >= 3) {
						const closedPolygon = [...polygonPoints, polygonPoints[0]];
						finishZone("polygon", closedPolygon);
						setPolygonPoints([]);
						setIsNearFirstPoint(false);
						return;
					}

					const newPoints: [number, number][] = [...polygonPoints, coords];
					setPolygonPoints(newPoints);
					updateCurrentDrawing(newPoints, false);
				} else if (drawMode === "rectangle") {
					if (polygonPoints.length === 0) {
						setPolygonPoints([coords]);
						updateCurrentDrawing([coords], false);
					} else {
						const [start] = polygonPoints;
						const rectCoords: [number, number][] = [start, [coords[0], start[1]], coords, [start[0], coords[1]], start];
						finishZone("rectangle", rectCoords);
						setPolygonPoints([]);
					}
				}
				return;
			}

			// Handle space drawing mode
			if (!isDrawingMode || drawMode === "none") return;

			// If shape is already closed (spaceCoordinates has data), don't start a new shape
			// This allows dragging/editing the existing shape without accidentally creating a new one
			if (spaceCoordinates.length >= 3) return;

			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

			if (drawMode === "polygon") {
				// Check if snapping to first point to close polygon
				if (isNearFirstPoint && polygonPoints.length >= 3) {
					const closedPolygon = [...polygonPoints, polygonPoints[0]];
					// Store coordinates for saving later, don't auto-save
					setSpaceCoordinates(closedPolygon);
					updateCurrentDrawing(closedPolygon, true);
					setPolygonPoints([]);
					setIsNearFirstPoint(false);
					return;
				}

				const newPoints: [number, number][] = [...polygonPoints, coords];
				setPolygonPoints(newPoints);
				updateCurrentDrawing(newPoints, false);
			} else if (drawMode === "rectangle") {
				if (polygonPoints.length === 0) {
					setPolygonPoints([coords]);
					updateCurrentDrawing([coords], false);
				} else {
					const [start] = polygonPoints;
					const rectCoords: [number, number][] = [start, [coords[0], start[1]], coords, [start[0], coords[1]], start];
					// Store coordinates for saving later, don't auto-save
					setSpaceCoordinates(rectCoords);
					updateCurrentDrawing(rectCoords, true);
					setPolygonPoints([]);
				}
			}
		};

		const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
			if (drawMode === "polygon" && polygonPoints.length >= 3) {
				e.preventDefault();
				const closedPolygon = [...polygonPoints, polygonPoints[0]];
				if (isDrawingZone) {
					finishZone("polygon", closedPolygon);
				} else if (isDrawingMode) {
					// Store coordinates for saving later, don't auto-save
					setSpaceCoordinates(closedPolygon);
					updateCurrentDrawing(closedPolygon, true);
				}
				setPolygonPoints([]);
				setIsNearFirstPoint(false);
			}
		};

		const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
			if (!isDrawingMode && !isDrawingZone) return;

			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

			if (drawMode === "polygon" && polygonPoints.length > 0) {
				const nearFirst = checkSnapToFirst(coords);
				setIsNearFirstPoint(nearFirst);
				updateCurrentDrawing([...polygonPoints, coords], nearFirst);
			} else if (drawMode === "rectangle" && polygonPoints.length === 1) {
				const [start] = polygonPoints;
				const rectCoords: [number, number][] = [start, [coords[0], start[1]], coords, [start[0], coords[1]], start];
				updateCurrentDrawing(rectCoords, false);
			}
		};

		mapRef.current.on("click", handleClick);
		mapRef.current.on("dblclick", handleDblClick);
		mapRef.current.on("mousemove", handleMouseMove);

		if (mapRef.current) {
			mapRef.current.getCanvas().style.cursor =
				(isDrawingMode || isDrawingZone) && drawMode !== "none" ? "crosshair" : "";
		}

		return () => {
			if (mapRef.current) {
				mapRef.current.off("click", handleClick);
				mapRef.current.off("dblclick", handleDblClick);
				mapRef.current.off("mousemove", handleMouseMove);
			}
		};
	}, [isDrawingMode, isDrawingZone, drawMode, polygonPoints, isNearFirstPoint, spaceCoordinates]);

	const updateCurrentDrawing = (points: [number, number][], snapHighlight: boolean) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("current-drawing") as mapboxgl.GeoJSONSource;
		const pointsSource = mapRef.current.getSource("drawing-points") as mapboxgl.GeoJSONSource;

		if (points.length >= 2) {
			source.setData({
				type: "Feature",
				properties: {},
				geometry: {
					type: "Polygon",
					coordinates: [points.length >= 3 ? [...points, points[0]] : [...points, points[0]]],
				},
			});
		}

		pointsSource.setData({
			type: "FeatureCollection",
			features: points.slice(0, -1).map((p, i) => ({
				type: "Feature",
				properties: {
					index: i,
					isFirst: i === 0,
					isSnap: i === 0 && snapHighlight && points.length > 3,
				},
				geometry: {type: "Point", coordinates: p},
			})),
		});
	};

	const updateDrawingMidpoints = (coords: [number, number][]) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("drawing-midpoints") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (coords.length < 3) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		// Create midpoint features for each edge (excluding the closing point)
		const points = coords.slice(0, -1);
		const features = points.map((coord, i) => {
			const nextIndex = (i + 1) % points.length;
			const nextCoord = points[nextIndex];
			const midpoint = [(coord[0] + nextCoord[0]) / 2, (coord[1] + nextCoord[1]) / 2];
			return {
				type: "Feature" as const,
				properties: {afterIndex: i},
				geometry: {
					type: "Point" as const,
					coordinates: midpoint,
				},
			};
		});

		source.setData({type: "FeatureCollection", features});
	};

	const addDrawingPointAfter = (afterIndex: number) => {
		const coords = [...spaceCoordinates] as [number, number][];
		const points = coords.slice(0, -1);
		const nextIndex = (afterIndex + 1) % points.length;
		const currentPoint = points[afterIndex];
		const nextPoint = points[nextIndex];

		// Calculate midpoint
		const midPoint: [number, number] = [(currentPoint[0] + nextPoint[0]) / 2, (currentPoint[1] + nextPoint[1]) / 2];

		// Insert after the current index
		const newCoords = [...coords.slice(0, afterIndex + 1), midPoint, ...coords.slice(afterIndex + 1)] as [
			number,
			number,
		][];

		// Update closing point
		newCoords[newCoords.length - 1] = newCoords[0];

		setSpaceCoordinates(newCoords);
		updateCurrentDrawing(newCoords, false);
		updateDrawingMidpoints(newCoords);
	};

	const removeDrawingPoint = (pointIndex: number) => {
		// Need at least 3 points for a polygon (plus closing point = 4 total)
		if (spaceCoordinates.length <= 4) return;

		const newCoords = spaceCoordinates.filter((_, i) => i !== pointIndex) as [number, number][];
		// If removing first point, update closing point to new first point
		if (pointIndex === 0 && newCoords.length > 0) {
			newCoords[newCoords.length - 1] = [...newCoords[0]] as [number, number];
		}
		setSpaceCoordinates(newCoords);
		updateCurrentDrawing(newCoords, false);
		updateDrawingMidpoints(newCoords);
	};

	function updateMapSpaces(spacesToRender: Space[]) {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("drawing") as mapboxgl.GeoJSONSource;
		source.setData({
			type: "FeatureCollection",
			features: spacesToRender.map((s) => ({
				type: "Feature" as const,
				properties: {id: s.id, color: s.color, name: s.name},
				geometry: {type: "Polygon" as const, coordinates: [s.coordinates]},
			})),
		});

		// Update zones layer
		updateMapZones(spacesToRender);

		// Update blueprint layers for spaces with images
		updateBlueprintLayers(spacesToRender);
	}

	function updateMapZones(spacesToRender: Space[]) {
		if (!mapRef.current) return;

		const zonesSource = mapRef.current.getSource("zones") as mapboxgl.GeoJSONSource;
		if (!zonesSource) return;

		// Collect all zones from all spaces
		const allZones: {zone: Zone; spaceId: string}[] = [];
		spacesToRender.forEach((space) => {
			space.zones.forEach((zone) => {
				allZones.push({zone, spaceId: space.id});
			});
		});

		zonesSource.setData({
			type: "FeatureCollection",
			features: allZones.map(({zone, spaceId}) => ({
				type: "Feature" as const,
				properties: {id: zone.id, spaceId, color: zone.color, name: zone.name},
				geometry: {type: "Polygon" as const, coordinates: [zone.coordinates]},
			})),
		});
	}

	const updateBlueprintLayers = (spacesToRender: Space[]) => {
		if (!mapRef.current) return;
		const map = mapRef.current;

		// Remove existing blueprint layers and sources
		spacesToRender.forEach((space) => {
			const layerId = `blueprint-layer-${space.id}`;
			const sourceId = `blueprint-${space.id}`;
			if (map.getLayer(layerId)) map.removeLayer(layerId);
			if (map.getSource(sourceId)) map.removeSource(sourceId);
		});

		// Add layers for spaces with blueprint images
		spacesToRender.forEach((space) => {
			if (space.blueprintImage && space.imageCorners && space.imageCorners.length === 4) {
				const sourceId = `blueprint-${space.id}`;
				const layerId = `blueprint-layer-${space.id}`;

				map.addSource(sourceId, {
					type: "image",
					url: space.blueprintImage.base64Data,
					coordinates: space.imageCorners as [[number, number], [number, number], [number, number], [number, number]],
				});

				map.addLayer(
					{
						id: layerId,
						type: "raster",
						source: sourceId,
						paint: {
							"raster-opacity": space.blueprintImage.opacity,
						},
					},
					"drawing-fill",
				);
			}
		});
	};

	const updateCoordinateLabels = (space: Space | null) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("coordinate-labels") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!space) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		// Create point features for each vertex (excluding the closing point)
		const features = space.coordinates.slice(0, -1).map((coord, i) => ({
			type: "Feature" as const,
			properties: {
				label: `P${i + 1}`,
				color: space.color,
				index: i,
			},
			geometry: {
				type: "Point" as const,
				coordinates: coord,
			},
		}));

		source.setData({
			type: "FeatureCollection",
			features,
		});
	};

	const updateZoneCoordinateLabels = (zone: Zone | null, color: string) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("zone-coordinate-labels") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!zone) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		// Create point features for each vertex (excluding the closing point)
		const features = zone.coordinates.slice(0, -1).map((coord, i) => ({
			type: "Feature" as const,
			properties: {
				label: `Z${i + 1}`,
				color: color,
				index: i,
			},
			geometry: {
				type: "Point" as const,
				coordinates: coord,
			},
		}));

		source.setData({
			type: "FeatureCollection",
			features,
		});
	};

	const updateZoneEditingOutline = (zone: Zone | null, color: string) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("zone-editing-outline") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!zone || zone.coordinates.length === 0) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		source.setData({
			type: "FeatureCollection",
			features: [
				{
					type: "Feature" as const,
					properties: {color},
					geometry: {
						type: "Polygon" as const,
						coordinates: [zone.coordinates],
					},
				},
			],
		});
	};

	const updateZoneEdgeMidpoints = (zone: Zone | null, color: string) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("zone-edge-midpoints") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!zone || zone.coordinates.length === 0) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		// Create midpoint features for each edge
		const coords = zone.coordinates.slice(0, -1);
		const features = coords.map((coord, i) => {
			const nextIndex = (i + 1) % coords.length;
			const nextCoord = coords[nextIndex];
			const midpoint = [(coord[0] + nextCoord[0]) / 2, (coord[1] + nextCoord[1]) / 2];
			return {
				type: "Feature" as const,
				properties: {
					color: color,
					afterIndex: i,
				},
				geometry: {
					type: "Point" as const,
					coordinates: midpoint,
				},
			};
		});

		source.setData({
			type: "FeatureCollection",
			features,
		});
	};

	const updateEdgeMidpoints = (space: Space | null) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("edge-midpoints") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!space) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		// Create midpoint features for each edge
		const coords = space.coordinates.slice(0, -1);
		const features = coords.map((coord, i) => {
			const nextIndex = (i + 1) % coords.length;
			const nextCoord = coords[nextIndex];
			const midpoint = [(coord[0] + nextCoord[0]) / 2, (coord[1] + nextCoord[1]) / 2];
			return {
				type: "Feature" as const,
				properties: {
					color: space.color,
					afterIndex: i,
				},
				geometry: {
					type: "Point" as const,
					coordinates: midpoint,
				},
			};
		});

		source.setData({
			type: "FeatureCollection",
			features,
		});
	};

	// Update image corner markers on map
	const updateImageCornerMarkers = (corners: [number, number][] | null, color: string) => {
		if (!mapRef.current) return;

		const source = mapRef.current.getSource("image-corners") as mapboxgl.GeoJSONSource;
		if (!source) return;

		if (!corners || corners.length !== 4) {
			source.setData({type: "FeatureCollection", features: []});
			return;
		}

		const cornerLabels = ["TL", "TR", "BR", "BL"];
		const features = corners.map((coord, i) => ({
			type: "Feature" as const,
			properties: {
				label: cornerLabels[i],
				color: color,
				index: i,
			},
			geometry: {
				type: "Point" as const,
				coordinates: coord,
			},
		}));

		source.setData({
			type: "FeatureCollection",
			features,
		});
	};

	// Update coordinate labels when editing space changes
	useEffect(() => {
		// Hide space points when editing zone or drawing zone
		if (isZoneEditMode || isDrawingZone) {
			updateCoordinateLabels(null);
			updateEdgeMidpoints(null);
			updateImageCornerMarkers(null, "#fff");
			return;
		}

		if (editingSpace) {
			let previewCoords: number[][];

			// For circles, regenerate coordinates from center/radius
			if (editingSpace.type === "circle" && circleCenter && circleRadius) {
				previewCoords = createCircle(circleCenter, circleRadius);
			} else {
				previewCoords = spaceCoordinates;
			}

			if (previewCoords.length > 0) {
				// Use current spaceColor and coordinates for live preview
				const spacePreview = {...editingSpace, color: spaceColor, coordinates: previewCoords};

				// Only show coordinate labels for non-circles (or show center point for circles)
				if (editingSpace.type === "circle" && circleCenter) {
					// Show only center point for circles
					updateCoordinateLabels({
						...editingSpace,
						color: spaceColor,
						coordinates: [[...circleCenter], [...circleCenter]],
					});
					updateEdgeMidpoints(null); // No edge midpoints for circles
				} else {
					updateCoordinateLabels(spacePreview);
					updateEdgeMidpoints(spacePreview);
				}

				// Update image corner markers if blueprint exists
				updateImageCornerMarkers(imageCorners, spaceColor);

				// Update the space on the map for live preview
				updateMapSpaces(
					spaces.map((s) =>
						s.id === editingSpace.id
							? {
									...s,
									color: spaceColor,
									coordinates: previewCoords,
									blueprintImage: blueprintImage || undefined,
									imageCorners: imageCorners || undefined,
								}
							: s,
					),
				);
			}
		} else {
			updateCoordinateLabels(null);
			updateEdgeMidpoints(null);
			updateImageCornerMarkers(null, "#fff");
		}
	}, [
		editingSpace,
		spaceColor,
		spaceCoordinates,
		circleCenter?.[0],
		circleCenter?.[1],
		circleRadius,
		imageCorners,
		blueprintImage,
		isZoneEditMode,
		isDrawingZone,
	]);

	// Keep drawing visible when in drawing mode with completed coordinates
	useEffect(() => {
		if (isDrawingMode && spaceCoordinates.length >= 3 && polygonPoints.length === 0) {
			updateCurrentDrawing(spaceCoordinates as [number, number][], false);
			updateDrawingMidpoints(spaceCoordinates as [number, number][]);
		} else if (!isDrawingMode || spaceCoordinates.length < 3) {
			updateDrawingMidpoints([]);
		}
	}, [isDrawingMode, spaceCoordinates, polygonPoints.length, spaceColor]);

	// Preview blueprint image during new space creation
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		const previewSourceId = "blueprint-preview";
		const previewLayerId = "blueprint-preview-layer";

		// Clean up existing preview layer
		try {
			if (map.getLayer(previewLayerId)) map.removeLayer(previewLayerId);
			if (map.getSource(previewSourceId)) map.removeSource(previewSourceId);
		} catch {
			// Map might not be fully loaded yet
		}

		// Only show preview during drawing mode (not when editing existing space)
		if (isDrawingMode && !editingSpace && blueprintImage && imageCorners && imageCorners.length === 4) {
			try {
				// Add preview source and layer
				map.addSource(previewSourceId, {
					type: "image",
					url: blueprintImage.base64Data,
					coordinates: imageCorners as [[number, number], [number, number], [number, number], [number, number]],
				});

				map.addLayer(
					{
						id: previewLayerId,
						type: "raster",
						source: previewSourceId,
						paint: {
							"raster-opacity": blueprintImage.opacity,
						},
					},
					"current-drawing-fill",
				);

				// Show corner markers
				updateImageCornerMarkers(imageCorners, spaceColor);
			} catch {
				// Map might not be fully loaded yet
			}
		} else if (isDrawingMode && !editingSpace) {
			// Clear corner markers when no blueprint
			updateImageCornerMarkers(null, "#fff");
		}

		return () => {
			// Clean up on unmount or when dependencies change
			const currentMap = mapRef.current;
			if (!currentMap) return;
			try {
				if (currentMap.getLayer(previewLayerId)) currentMap.removeLayer(previewLayerId);
				if (currentMap.getSource(previewSourceId)) currentMap.removeSource(previewSourceId);
			} catch {
				// Map might be destroyed
			}
		};
	}, [isDrawingMode, editingSpace, blueprintImage, imageCorners, spaceColor]);

	// Update zone coordinate labels when editing zone changes
	useEffect(() => {
		if (editingZone && isZoneEditMode && selectedSpace) {
			let previewCoords: number[][];

			// For circles, regenerate coordinates from center/radius
			if (editingZone.type === "circle" && zoneCircleCenter && zoneCircleRadius) {
				previewCoords = createCircle(zoneCircleCenter, zoneCircleRadius);
			} else {
				previewCoords = zoneCoordinates;
			}

			if (previewCoords.length > 0) {
				const zonePreview = {...editingZone, color: zoneColor, coordinates: previewCoords};
				updateZoneCoordinateLabels(zonePreview, zoneColor);
				updateZoneEditingOutline(zonePreview, zoneColor);
				// Only show edge midpoints for polygons, not circles
				if (editingZone.type !== "circle") {
					updateZoneEdgeMidpoints(zonePreview, zoneColor);
				} else {
					updateZoneEdgeMidpoints(null, "#fff");
				}

				// Update the zone on the map for live preview
				let updatedZones: Zone[];
				if (isNewZone) {
					// For new zone, add it to the preview (it's not in spaces yet)
					updatedZones = [...selectedSpace.zones, {...editingZone, color: zoneColor, coordinates: previewCoords}];
				} else {
					// For existing zone, update it in place
					updatedZones = selectedSpace.zones.map((z) =>
						z.id === editingZone.id ? {...z, color: zoneColor, coordinates: previewCoords} : z,
					);
				}
				const updatedSpace = {...selectedSpace, zones: updatedZones};
				const previewSpaces = spaces.map((s) => (s.id === selectedSpace.id ? updatedSpace : s));
				updateMapZones(previewSpaces);
			}
		} else {
			updateZoneCoordinateLabels(null, "#fff");
			updateZoneEditingOutline(null, "#fff");
			updateZoneEdgeMidpoints(null, "#fff");
		}
	}, [
		editingZone,
		isZoneEditMode,
		isNewZone,
		zoneColor,
		zoneCoordinates,
		zoneCircleCenter?.[0],
		zoneCircleCenter?.[1],
		zoneCircleRadius,
		selectedSpace,
		spaces,
	]);

	// Drag functionality for editing points, image corners, and entire space (only in edit mode)
	useEffect(() => {
		if (!mapRef.current || !editingSpace || !isSpaceEditMode) return;

		const map = mapRef.current;

		const onMouseDown = (e: mapboxgl.MapMouseEvent) => {
			// Check if clicking on an image corner point
			const cornerFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["image-corner-points"],
			});

			if (cornerFeatures.length > 0) {
				const cornerIndex = cornerFeatures[0].properties?.index;
				if (typeof cornerIndex === "number") {
					e.preventDefault();
					setDraggingCornerIndex(cornerIndex);
					map.getCanvas().style.cursor = "grabbing";
					return;
				}
			}

			// Check if clicking on a coordinate point
			const pointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["coordinate-points"],
			});

			if (pointFeatures.length > 0) {
				const pointIndex = pointFeatures[0].properties?.index;
				if (typeof pointIndex === "number") {
					e.preventDefault();
					setDraggingPointIndex(pointIndex);
					map.getCanvas().style.cursor = "grabbing";
					return;
				}
			}

			// Check if clicking on the space fill to drag entire shape
			const fillFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["drawing-fill"],
			});

			if (fillFeatures.length > 0 && fillFeatures[0].properties?.id === editingSpace.id) {
				e.preventDefault();
				setIsDraggingSpace(true);
				setDragStartCoord([e.lngLat.lng, e.lngLat.lat]);
				map.getCanvas().style.cursor = "move";
			}
		};

		const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

			// Handle corner dragging
			if (draggingCornerIndex !== null && imageCorners) {
				const newCorners = [...imageCorners] as [number, number][];
				newCorners[draggingCornerIndex] = coords;
				setImageCorners(newCorners);
				return;
			}

			// Handle point dragging
			if (draggingPointIndex !== null) {
				setSpaceCoordinates((prev) => {
					const newCoords = [...prev];
					newCoords[draggingPointIndex] = coords;
					if (draggingPointIndex === 0) {
						newCoords[newCoords.length - 1] = coords;
					}
					return newCoords;
				});
				return;
			}

			// Handle entire space dragging
			if (isDraggingSpace && dragStartCoord) {
				const deltaLng = coords[0] - dragStartCoord[0];
				const deltaLat = coords[1] - dragStartCoord[1];

				setSpaceCoordinates((prev) => prev.map((coord) => [coord[0] + deltaLng, coord[1] + deltaLat]));

				// Also move image corners if they exist
				if (imageCorners) {
					setImageCorners((prev) =>
						prev ? prev.map((corner) => [corner[0] + deltaLng, corner[1] + deltaLat] as [number, number]) : null,
					);
				}

				// Also move circle center if it's a circle
				if (circleCenter) {
					setCircleCenter([circleCenter[0] + deltaLng, circleCenter[1] + deltaLat]);
				}

				setDragStartCoord(coords);
				return;
			}

			// Change cursor on hover for points, midpoints, corners, and shape fill
			const cornerFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["image-corner-points"],
			});
			const pointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["coordinate-points"],
			});
			const midpointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["edge-midpoints"],
			});
			const fillFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["drawing-fill"],
			});

			if (cornerFeatures.length > 0) {
				map.getCanvas().style.cursor = "grab";
			} else if (pointFeatures.length > 0) {
				map.getCanvas().style.cursor = "grab";
			} else if (midpointFeatures.length > 0) {
				map.getCanvas().style.cursor = "copy";
			} else if (fillFeatures.length > 0 && fillFeatures[0].properties?.id === editingSpace.id) {
				map.getCanvas().style.cursor = "move";
			} else {
				map.getCanvas().style.cursor = "";
			}
		};

		const onMouseUp = () => {
			if (draggingPointIndex !== null) {
				setDraggingPointIndex(null);
				map.getCanvas().style.cursor = "";
			}
			if (draggingCornerIndex !== null) {
				setDraggingCornerIndex(null);
				map.getCanvas().style.cursor = "";
			}
			if (isDraggingSpace) {
				setIsDraggingSpace(false);
				setDragStartCoord(null);
				map.getCanvas().style.cursor = "";
			}
		};

		// Click on edge midpoints to add new point
		const onMidpointClick = (e: mapboxgl.MapMouseEvent) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ["edge-midpoints"],
			});

			if (features.length > 0) {
				const afterIndex = features[0].properties?.afterIndex;
				if (typeof afterIndex === "number") {
					e.preventDefault();
					addPointAfter(afterIndex);
				}
			}
		};

		map.on("mousedown", "image-corner-points", onMouseDown);
		map.on("mousedown", "coordinate-points", onMouseDown);
		map.on("mousedown", "drawing-fill", onMouseDown);
		map.on("click", "edge-midpoints", onMidpointClick);
		map.on("mousemove", onMouseMove);
		map.on("mouseup", onMouseUp);
		map.on("mouseleave", onMouseUp);

		return () => {
			map.off("mousedown", "image-corner-points", onMouseDown);
			map.off("mousedown", "coordinate-points", onMouseDown);
			map.off("mousedown", "drawing-fill", onMouseDown);
			map.off("click", "edge-midpoints", onMidpointClick);
			map.off("mousemove", onMouseMove);
			map.off("mouseup", onMouseUp);
			map.off("mouseleave", onMouseUp);
		};
	}, [
		editingSpace,
		isSpaceEditMode,
		spaceCoordinates,
		draggingPointIndex,
		draggingCornerIndex,
		imageCorners,
		isDraggingSpace,
		dragStartCoord,
		circleCenter,
	]);

	// Drag functionality for new space drawing mode (before saving)
	useEffect(() => {
		if (!mapRef.current || !isDrawingMode || spaceCoordinates.length < 3) return;

		const map = mapRef.current;

		const onNewSpaceMouseDown = (e: mapboxgl.MapMouseEvent) => {
			// Check if clicking on image corner points
			const cornerFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["image-corner-points"],
			});

			if (cornerFeatures.length > 0) {
				const cornerIndex = cornerFeatures[0].properties?.index;
				if (typeof cornerIndex === "number") {
					e.preventDefault();
					setDraggingCornerIndex(cornerIndex);
					map.getCanvas().style.cursor = "grabbing";
					return;
				}
			}

			// Check if clicking on drawing points
			const pointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["drawing-points"],
			});

			if (pointFeatures.length > 0) {
				const pointIndex = pointFeatures[0].properties?.index;
				if (typeof pointIndex === "number") {
					e.preventDefault();
					setDraggingNewPointIndex(pointIndex);
					map.getCanvas().style.cursor = "grabbing";
					return;
				}
			}

			// Check if clicking on current-drawing fill to drag entire shape
			const fillFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["current-drawing-fill"],
			});

			if (fillFeatures.length > 0) {
				e.preventDefault();
				setIsDraggingNewShape(true);
				setNewDragStart([e.lngLat.lng, e.lngLat.lat]);
				map.getCanvas().style.cursor = "move";
			}
		};

		const onNewSpaceMouseMove = (e: mapboxgl.MapMouseEvent) => {
			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

			// Handle corner dragging for blueprint image
			if (draggingCornerIndex !== null && imageCorners) {
				const newCorners = [...imageCorners] as [number, number][];
				newCorners[draggingCornerIndex] = coords;
				setImageCorners(newCorners);
				return;
			}

			// Handle point dragging
			if (draggingNewPointIndex !== null) {
				const newCoords = [...spaceCoordinates] as [number, number][];
				newCoords[draggingNewPointIndex] = coords;
				if (draggingNewPointIndex === 0) {
					newCoords[newCoords.length - 1] = coords;
				}
				setSpaceCoordinates(newCoords);
				updateCurrentDrawing(newCoords, false);
				updateDrawingMidpoints(newCoords);
				return;
			}

			// Handle entire shape dragging
			if (isDraggingNewShape && newDragStart) {
				const deltaLng = coords[0] - newDragStart[0];
				const deltaLat = coords[1] - newDragStart[1];

				const newCoords = spaceCoordinates.map(
					(coord) => [coord[0] + deltaLng, coord[1] + deltaLat] as [number, number],
				);
				setSpaceCoordinates(newCoords);
				updateCurrentDrawing(newCoords, false);
				updateDrawingMidpoints(newCoords);

				// Also move circle center if it's a circle
				if (circleCenter) {
					setCircleCenter([circleCenter[0] + deltaLng, circleCenter[1] + deltaLat]);
				}

				// Also move image corners if they exist
				if (imageCorners) {
					setImageCorners(
						imageCorners.map((corner) => [corner[0] + deltaLng, corner[1] + deltaLat] as [number, number]),
					);
				}

				setNewDragStart(coords);
				return;
			}

			// Change cursor on hover (only when not dragging)
			if (draggingNewPointIndex === null && !isDraggingNewShape && draggingCornerIndex === null) {
				const cornerFeatures = map.queryRenderedFeatures(e.point, {
					layers: ["image-corner-points"],
				});
				const pointFeatures = map.queryRenderedFeatures(e.point, {
					layers: ["drawing-points"],
				});
				const midpointFeatures = map.queryRenderedFeatures(e.point, {
					layers: ["drawing-midpoints"],
				});
				const fillFeatures = map.queryRenderedFeatures(e.point, {
					layers: ["current-drawing-fill"],
				});

				if (cornerFeatures.length > 0) {
					map.getCanvas().style.cursor = "grab";
				} else if (pointFeatures.length > 0) {
					map.getCanvas().style.cursor = "grab";
				} else if (midpointFeatures.length > 0) {
					map.getCanvas().style.cursor = "copy";
				} else if (fillFeatures.length > 0) {
					map.getCanvas().style.cursor = "move";
				} else {
					map.getCanvas().style.cursor = "";
				}
			}
		};

		const onNewSpaceMouseUp = () => {
			if (draggingNewPointIndex !== null) {
				setDraggingNewPointIndex(null);
				map.getCanvas().style.cursor = "";
			}
			if (draggingCornerIndex !== null) {
				setDraggingCornerIndex(null);
				map.getCanvas().style.cursor = "";
			}
			if (isDraggingNewShape) {
				setIsDraggingNewShape(false);
				setNewDragStart(null);
				map.getCanvas().style.cursor = "";
			}
		};

		// Click on midpoints to add new point
		const onMidpointClick = (e: mapboxgl.MapMouseEvent) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ["drawing-midpoints"],
			});

			if (features.length > 0) {
				const afterIndex = features[0].properties?.afterIndex;
				if (typeof afterIndex === "number") {
					e.preventDefault();
					addDrawingPointAfter(afterIndex);
				}
			}
		};

		map.on("mousedown", "drawing-points", onNewSpaceMouseDown);
		map.on("mousedown", "current-drawing-fill", onNewSpaceMouseDown);
		map.on("mousedown", "image-corner-points", onNewSpaceMouseDown);
		map.on("click", "drawing-midpoints", onMidpointClick);
		map.on("mousemove", onNewSpaceMouseMove);
		map.on("mouseup", onNewSpaceMouseUp);
		map.on("mouseleave", onNewSpaceMouseUp);

		return () => {
			map.off("mousedown", "drawing-points", onNewSpaceMouseDown);
			map.off("mousedown", "current-drawing-fill", onNewSpaceMouseDown);
			map.off("mousedown", "image-corner-points", onNewSpaceMouseDown);
			map.off("click", "drawing-midpoints", onMidpointClick);
			map.off("mousemove", onNewSpaceMouseMove);
			map.off("mouseup", onNewSpaceMouseUp);
			map.off("mouseleave", onNewSpaceMouseUp);
		};
	}, [
		isDrawingMode,
		spaceCoordinates,
		circleCenter,
		draggingNewPointIndex,
		isDraggingNewShape,
		newDragStart,
		draggingCornerIndex,
		imageCorners,
	]);

	// Drag functionality for zone points and entire zone
	useEffect(() => {
		if (!mapRef.current || !editingZone || !isZoneEditMode) return;

		const map = mapRef.current;

		const onZoneMouseDown = (e: mapboxgl.MapMouseEvent) => {
			// Check if clicking on a zone coordinate point
			const pointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["zone-coordinate-points"],
			});

			if (pointFeatures.length > 0) {
				const pointIndex = pointFeatures[0].properties?.index;
				if (typeof pointIndex === "number") {
					e.preventDefault();
					setDraggingZonePointIndex(pointIndex);
					map.getCanvas().style.cursor = "grabbing";
					return;
				}
			}

			// Check if clicking on the zone fill to drag entire zone
			const fillFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["zones-fill"],
			});

			if (fillFeatures.length > 0 && fillFeatures[0].properties?.id === editingZone.id) {
				e.preventDefault();
				setIsDraggingZone(true);
				setDragStartCoord([e.lngLat.lng, e.lngLat.lat]);
				map.getCanvas().style.cursor = "move";
			}
		};

		const onZoneMouseMove = (e: mapboxgl.MapMouseEvent) => {
			const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

			// Handle point dragging
			if (draggingZonePointIndex !== null) {
				setZoneCoordinates((prev) => {
					const newCoords = [...prev];
					newCoords[draggingZonePointIndex] = coords;
					if (draggingZonePointIndex === 0) {
						newCoords[newCoords.length - 1] = coords;
					}
					return newCoords;
				});
				return;
			}

			// Handle entire zone dragging
			if (isDraggingZone && dragStartCoord) {
				const deltaLng = coords[0] - dragStartCoord[0];
				const deltaLat = coords[1] - dragStartCoord[1];

				setZoneCoordinates((prev) => prev.map((coord) => [coord[0] + deltaLng, coord[1] + deltaLat]));

				// Also move circle center if it's a circle
				if (zoneCircleCenter) {
					setZoneCircleCenter([zoneCircleCenter[0] + deltaLng, zoneCircleCenter[1] + deltaLat]);
				}

				setDragStartCoord(coords);
				return;
			}

			// Change cursor on hover
			const pointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["zone-coordinate-points"],
			});
			const midpointFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["zone-edge-midpoints"],
			});
			const fillFeatures = map.queryRenderedFeatures(e.point, {
				layers: ["zones-fill"],
			});

			if (pointFeatures.length > 0) {
				map.getCanvas().style.cursor = "grab";
			} else if (midpointFeatures.length > 0) {
				map.getCanvas().style.cursor = "copy";
			} else if (fillFeatures.length > 0 && fillFeatures[0].properties?.id === editingZone.id) {
				map.getCanvas().style.cursor = "move";
			} else if (draggingZonePointIndex === null && !isDraggingZone) {
				map.getCanvas().style.cursor = "";
			}
		};

		const onZoneMouseUp = () => {
			if (draggingZonePointIndex !== null) {
				setDraggingZonePointIndex(null);
				map.getCanvas().style.cursor = "";
			}
			if (isDraggingZone) {
				setIsDraggingZone(false);
				setDragStartCoord(null);
				map.getCanvas().style.cursor = "";
			}
		};

		// Click on zone edge midpoints to add new point
		const onZoneMidpointClick = (e: mapboxgl.MapMouseEvent) => {
			const features = map.queryRenderedFeatures(e.point, {
				layers: ["zone-edge-midpoints"],
			});

			if (features.length > 0) {
				const afterIndex = features[0].properties?.afterIndex;
				if (typeof afterIndex === "number") {
					e.preventDefault();
					addZonePointAfter(afterIndex);
				}
			}
		};

		map.on("mousedown", "zone-coordinate-points", onZoneMouseDown);
		map.on("mousedown", "zones-fill", onZoneMouseDown);
		map.on("click", "zone-edge-midpoints", onZoneMidpointClick);
		map.on("mousemove", onZoneMouseMove);
		map.on("mouseup", onZoneMouseUp);
		map.on("mouseleave", onZoneMouseUp);

		return () => {
			map.off("mousedown", "zone-coordinate-points", onZoneMouseDown);
			map.off("mousedown", "zones-fill", onZoneMouseDown);
			map.off("click", "zone-edge-midpoints", onZoneMidpointClick);
			map.off("mousemove", onZoneMouseMove);
			map.off("mouseup", onZoneMouseUp);
			map.off("mouseleave", onZoneMouseUp);
		};
	}, [
		editingZone,
		isZoneEditMode,
		zoneCoordinates,
		draggingZonePointIndex,
		isDraggingZone,
		dragStartCoord,
		zoneCircleCenter,
	]);

	// Function to update a single coordinate
	const updateCoordinate = (pointIndex: number, coordType: "lat" | "lng", value: string) => {
		const numValue = Number.parseFloat(value);
		if (Number.isNaN(numValue)) return;

		const newCoords = spaceCoordinates.map((coord, i) => {
			if (i === pointIndex) {
				if (coordType === "lat") {
					return [coord[0], numValue];
				}
				return [numValue, coord[1]];
			}
			// Also update the closing point if we're editing the first point
			if (pointIndex === 0 && i === spaceCoordinates.length - 1) {
				if (coordType === "lat") {
					return [coord[0], numValue];
				}
				return [numValue, coord[1]];
			}
			return coord;
		});
		setSpaceCoordinates(newCoords);
	};

	// Function to remove a point
	const removePoint = (pointIndex: number) => {
		// Need at least 3 points for a polygon (plus closing point = 4 total)
		if (spaceCoordinates.length <= 4) return;

		const newCoords = spaceCoordinates.filter((_, i) => i !== pointIndex);
		// If removing first point, update closing point to new first point
		if (pointIndex === 0 && newCoords.length > 0) {
			newCoords[newCoords.length - 1] = [...newCoords[0]];
		}
		setSpaceCoordinates(newCoords);
	};

	// Function to add a point after the given index
	const addPointAfter = (pointIndex: number) => {
		const newCoords = [...spaceCoordinates];
		const currentPoint = spaceCoordinates[pointIndex];
		const nextIndex = pointIndex + 1 >= spaceCoordinates.length - 1 ? 0 : pointIndex + 1;
		const nextPoint = spaceCoordinates[nextIndex];

		// Calculate midpoint between current and next point
		const midPoint: number[] = [(currentPoint[0] + nextPoint[0]) / 2, (currentPoint[1] + nextPoint[1]) / 2];

		// Insert the new point after the current index
		newCoords.splice(pointIndex + 1, 0, midPoint);
		setSpaceCoordinates(newCoords);
	};

	// Zone coordinate manipulation functions
	const updateZoneCoordinate = (pointIndex: number, coordType: "lat" | "lng", value: string) => {
		const numValue = Number.parseFloat(value);
		if (Number.isNaN(numValue)) return;

		const newCoords = zoneCoordinates.map((coord, i) => {
			if (i === pointIndex) {
				if (coordType === "lat") {
					return [coord[0], numValue];
				}
				return [numValue, coord[1]];
			}
			// Also update the closing point if we're editing the first point
			if (pointIndex === 0 && i === zoneCoordinates.length - 1) {
				if (coordType === "lat") {
					return [coord[0], numValue];
				}
				return [numValue, coord[1]];
			}
			return coord;
		});
		setZoneCoordinates(newCoords);
	};

	const removeZonePoint = (pointIndex: number) => {
		if (zoneCoordinates.length <= 4) return;

		const newCoords = zoneCoordinates.filter((_, i) => i !== pointIndex);
		if (pointIndex === 0 && newCoords.length > 0) {
			newCoords[newCoords.length - 1] = [...newCoords[0]];
		}
		setZoneCoordinates(newCoords);
	};

	const addZonePointAfter = (pointIndex: number) => {
		const newCoords = [...zoneCoordinates];
		const currentPoint = zoneCoordinates[pointIndex];
		const nextIndex = pointIndex + 1 >= zoneCoordinates.length - 1 ? 0 : pointIndex + 1;
		const nextPoint = zoneCoordinates[nextIndex];

		const midPoint: number[] = [(currentPoint[0] + nextPoint[0]) / 2, (currentPoint[1] + nextPoint[1]) / 2];

		newCoords.splice(pointIndex + 1, 0, midPoint);
		setZoneCoordinates(newCoords);
	};

	// Initialize image corners from space bounding box
	const initializeImageCorners = (coordinates: number[][]): [number, number][] => {
		const lngs = coordinates.map((c) => c[0]);
		const lats = coordinates.map((c) => c[1]);
		const minLng = Math.min(...lngs);
		const maxLng = Math.max(...lngs);
		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);

		return [
			[minLng, maxLat], // topLeft
			[maxLng, maxLat], // topRight
			[maxLng, minLat], // bottomRight
			[minLng, minLat], // bottomLeft
		];
	};

	// Handle blueprint image upload
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			alert("Image must be less than 2MB");
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const base64Data = event.target?.result as string;
			setBlueprintImage({
				base64Data,
				opacity: 0.8,
			});
			// Initialize corners to space bounding box
			if (spaceCoordinates.length > 0) {
				setImageCorners(initializeImageCorners(spaceCoordinates));
			}
		};
		reader.readAsDataURL(file);
	};

	// Remove blueprint image
	const removeBlueprint = () => {
		setBlueprintImage(null);
		setImageCorners(null);
	};

	const saveSpaceDetails = () => {
		if (!editingSpace) return;

		let finalCoords: number[][];
		let updatedSpace: Partial<Space>;

		if (editingSpace.type === "circle" && circleCenter && circleRadius) {
			// Regenerate circle coordinates from center and radius
			finalCoords = createCircle(circleCenter, circleRadius);
			updatedSpace = {
				name: spaceName,
				color: spaceColor,
				description: spaceDescription,
				coordinates: finalCoords,
				center: circleCenter,
				radius: circleRadius,
				blueprintImage: blueprintImage || undefined,
				imageCorners: imageCorners || undefined,
			};
		} else {
			// Ensure the polygon is closed (last coord equals first)
			finalCoords = [...spaceCoordinates];
			if (finalCoords.length > 0) {
				finalCoords[finalCoords.length - 1] = [...finalCoords[0]];
			}
			updatedSpace = {
				name: spaceName,
				color: spaceColor,
				description: spaceDescription,
				coordinates: finalCoords,
				blueprintImage: blueprintImage || undefined,
				imageCorners: imageCorners || undefined,
			};
		}

		setSpaces((prev) => prev.map((s) => (s.id === editingSpace.id ? {...s, ...updatedSpace} : s)));

		// Update map with new colors and coordinates
		const updatedSpaces = spaces.map((s) => (s.id === editingSpace.id ? {...s, ...updatedSpace} : s));
		updateMapSpaces(updatedSpaces);

		setShowSpacePanel(false);
		setEditingSpace(null);
		setCircleCenter(null);
		setBlueprintImage(null);
		setImageCorners(null);
	};

	// Select space for viewing (read-only)
	function selectSpace(space: Space) {
		setSelectedSpace(space);
		setSelectedZone(null);
		setEditingSpace(null);
		setEditingZone(null);
		setIsSpaceEditMode(false);
		setIsZoneEditMode(false);
		setShowSpacePanel(true);
	}

	// Enter edit mode for space
	const enterSpaceEditMode = () => {
		if (!selectedSpace) return;
		setEditingSpace(selectedSpace);
		setSpaceName(selectedSpace.name);
		setSpaceColor(selectedSpace.color);
		setSpaceDescription(selectedSpace.description);
		setSpaceCoordinates([...selectedSpace.coordinates]);
		setBlueprintImage(selectedSpace.blueprintImage || null);
		setImageCorners(selectedSpace.imageCorners || null);
		if (selectedSpace.type === "circle" && selectedSpace.center && selectedSpace.radius) {
			setCircleCenter(selectedSpace.center);
			setCircleRadius(selectedSpace.radius);
		} else {
			setCircleCenter(null);
		}
		setIsSpaceEditMode(true);
	};

	const deleteSpace = (spaceId: string) => {
		const newSpaces = spaces.filter((s) => s.id !== spaceId);
		setSpaces(newSpaces);
		updateMapSpaces(newSpaces);
		if (editingSpace?.id === spaceId) {
			setShowSpacePanel(false);
			setEditingSpace(null);
		}
	};

	// Zone functions
	const startDrawingZone = () => {
		setIsDrawingZone(true);
		setDrawMode("polygon");
		setPolygonPoints([]);
	};

	function finishZone(type: string, coordinates: [number, number][], center?: [number, number], radius?: number) {
		if (!mapRef.current || !editingSpace) return;

		const id = `zone-${editingSpace.id}-${++zoneCountRef.current}`;
		const newZone: Zone = {
			id,
			type,
			coordinates,
			name: `Zone ${zoneCountRef.current}`,
			color: "#60a5fa",
			description: "",
			center,
			radius,
		};

		// Set zone editing state - DON'T add to spaces yet, wait for Save
		setSelectedZone(newZone);
		setEditingZone(newZone);
		setIsZoneEditMode(true);
		setIsNewZone(true); // Mark as new zone (not yet saved)
		setZoneName(newZone.name);
		setZoneColor(newZone.color);
		setZoneDescription(newZone.description);
		setZoneCoordinates([...newZone.coordinates]);
		if (type === "circle" && center && radius) {
			setZoneCircleCenter(center);
			setZoneCircleRadius(radius);
		} else {
			setZoneCircleCenter(null);
		}

		// Clear drawing layers
		const currentSource = mapRef.current.getSource("current-drawing") as mapboxgl.GeoJSONSource;
		const pointsSource = mapRef.current.getSource("drawing-points") as mapboxgl.GeoJSONSource;
		currentSource.setData({type: "FeatureCollection", features: []});
		pointsSource.setData({type: "FeatureCollection", features: []});

		setIsDrawingZone(false);
		setDrawMode("none");
		setPolygonPoints([]);
	}

	const saveZoneDetails = () => {
		if (!editingZone || !editingSpace) return;

		let finalCoords: number[][];
		let updatedZone: Zone;

		if (editingZone.type === "circle" && zoneCircleCenter && zoneCircleRadius) {
			finalCoords = createCircle(zoneCircleCenter, zoneCircleRadius);
			updatedZone = {
				...editingZone,
				name: zoneName,
				color: zoneColor,
				description: zoneDescription,
				coordinates: finalCoords,
				center: zoneCircleCenter,
				radius: zoneCircleRadius,
			};
		} else {
			finalCoords = [...zoneCoordinates];
			if (finalCoords.length > 0) {
				finalCoords[finalCoords.length - 1] = [...finalCoords[0]];
			}
			updatedZone = {
				...editingZone,
				name: zoneName,
				color: zoneColor,
				description: zoneDescription,
				coordinates: finalCoords,
			};
		}

		// If new zone, add it; otherwise update existing
		let updatedZones: Zone[];
		if (isNewZone) {
			updatedZones = [...editingSpace.zones, updatedZone];
		} else {
			updatedZones = editingSpace.zones.map((z) => (z.id === editingZone.id ? updatedZone : z));
		}
		const updatedSpace = {...editingSpace, zones: updatedZones};

		// Update spaces array
		const newSpaces = spaces.map((s) => (s.id === editingSpace.id ? updatedSpace : s));
		setSpaces(newSpaces);
		updateMapSpaces(newSpaces);

		// Go back to parent space view after saving
		setSelectedZone(null);
		setSelectedSpace(updatedSpace);
		setEditingSpace(null);
		setEditingZone(null);
		setIsZoneEditMode(false);
		setIsSpaceEditMode(false);
		setIsDrawingZone(false); // Ensure drawing zone mode is off
		setIsNewZone(false); // Reset new zone flag
		setZoneCircleCenter(null);
		setDraggingZonePointIndex(null);
		setShowSpacePanel(true);

		// Clear zone editing overlays from map
		updateZoneCoordinateLabels(null, "#fff");
		updateZoneEditingOutline(null, "#fff");
		updateZoneEdgeMidpoints(null, "#fff");
	};

	// Select zone for viewing (read-only)
	function selectZone(zone: Zone, parentSpace: Space) {
		setSelectedZone(zone);
		setSelectedSpace(parentSpace);
		setEditingZone(null);
		setIsZoneEditMode(false);
		setShowSpacePanel(true);
	}

	// Enter edit mode for zone
	const enterZoneEditMode = () => {
		if (!selectedZone || !selectedSpace) return;
		setEditingZone(selectedZone);
		setEditingSpace(selectedSpace); // Required for saveZoneDetails to work
		setIsNewZone(false); // Editing existing zone, not a new one
		setZoneName(selectedZone.name);
		setZoneColor(selectedZone.color);
		setZoneDescription(selectedZone.description);
		setZoneCoordinates([...selectedZone.coordinates]);
		if (selectedZone.type === "circle" && selectedZone.center && selectedZone.radius) {
			setZoneCircleCenter(selectedZone.center);
			setZoneCircleRadius(selectedZone.radius);
		} else {
			setZoneCircleCenter(null);
		}
		setIsZoneEditMode(true);
	};

	// Cancel zone editing and restore original state
	const cancelZoneEdit = () => {
		// Restore zones layer to original state (before preview modifications)
		updateMapZones(spaces);

		// Clear editing overlays
		updateZoneCoordinateLabels(null, "#fff");
		updateZoneEditingOutline(null, "#fff");
		updateZoneEdgeMidpoints(null, "#fff");

		// If canceling a new zone, go back to parent space (zone was never saved)
		if (isNewZone) {
			setSelectedZone(null);
			// Keep selectedSpace as is to show parent space
		}

		// Clear editing state
		setIsZoneEditMode(false);
		setEditingZone(null);
		setEditingSpace(null);
		setIsNewZone(false);
		setDraggingZonePointIndex(null);
		setZoneCircleCenter(null);
	};

	const deleteZone = (zoneId: string) => {
		if (!editingSpace) return;

		const updatedZones = editingSpace.zones.filter((z) => z.id !== zoneId);
		const updatedSpace = {...editingSpace, zones: updatedZones};
		setEditingSpace(updatedSpace);

		const newSpaces = spaces.map((s) => (s.id === editingSpace.id ? updatedSpace : s));
		setSpaces(newSpaces);
		updateMapSpaces(newSpaces);

		if (editingZone?.id === zoneId) {
			setEditingZone(null);
		}
	};

	const exitZoneDrawing = () => {
		setIsDrawingZone(false);
		setDrawMode("none");
		setPolygonPoints([]);
		if (mapRef.current) {
			const currentSource = mapRef.current.getSource("current-drawing") as mapboxgl.GeoJSONSource;
			const pointsSource = mapRef.current.getSource("drawing-points") as mapboxgl.GeoJSONSource;
			currentSource?.setData({type: "FeatureCollection", features: []});
			pointsSource?.setData({type: "FeatureCollection", features: []});
		}
	};

	const createCircle = (center: [number, number], radiusKm: number): [number, number][] => {
		const points = 64;
		const coords: [number, number][] = [];
		const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
		const distanceY = radiusKm / 110.574;

		for (let i = 0; i < points; i++) {
			const theta = (i / points) * (2 * Math.PI);
			coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
		}
		coords.push(coords[0]);
		return coords;
	};

	const clearAll = () => {
		if (!mapRef.current) return;

		setSpaces([]);
		setPolygonPoints([]);
		setIsNearFirstPoint(false);
		spaceCountRef.current = 0;
		zoneCountRef.current = 0;
		setShowSpacePanel(false);
		setEditingSpace(null);
		setEditingZone(null);
		setBlueprintImage(null);
		setImageCorners(null);
		setIsDrawingZone(false);

		const sources = [
			"drawing",
			"zones",
			"current-drawing",
			"drawing-points",
			"coordinate-labels",
			"edge-midpoints",
			"image-corners",
			"zone-coordinate-labels",
			"zone-editing-outline",
		];
		sources.forEach((sourceId) => {
			const source = mapRef.current?.getSource(sourceId) as mapboxgl.GeoJSONSource;
			source?.setData({type: "FeatureCollection", features: []});
		});
	};

	const enterDrawingMode = () => {
		setIsDrawingMode(true);
		setDrawMode("polygon");
		setShowSpacePanel(true);
		// Set default values for new space
		setSpaceName(`Space ${spaces.length + 1}`);
		setSpaceColor(spaceColors[spaces.length % spaceColors.length].value);
		setSpaceDescription("");
		setBlueprintImage(null);
		setImageCorners(null);
	};

	const exitDrawingMode = () => {
		setIsDrawingMode(false);
		setDrawMode("none");
		setPolygonPoints([]);
		setIsNearFirstPoint(false);
		setCircleCenter(null);
		setSpaceCoordinates([]);
		// Clear blueprint state
		setBlueprintImage(null);
		setImageCorners(null);
		// Clear drag state
		setDraggingNewPointIndex(null);
		setIsDraggingNewShape(false);
		setNewDragStart(null);
		setDraggingCornerIndex(null);
		// Clear any editing state
		setSelectedSpace(null);
		setEditingSpace(null);
		if (mapRef.current) {
			const currentSource = mapRef.current.getSource("current-drawing") as mapboxgl.GeoJSONSource;
			const pointsSource = mapRef.current.getSource("drawing-points") as mapboxgl.GeoJSONSource;
			const midpointsSource = mapRef.current.getSource("drawing-midpoints") as mapboxgl.GeoJSONSource;
			currentSource?.setData({type: "FeatureCollection", features: []});
			pointsSource?.setData({type: "FeatureCollection", features: []});
			midpointsSource?.setData({type: "FeatureCollection", features: []});
		}
	};

	const saveAndExit = () => {
		// If we're in drawing mode and have coordinates, create a new space
		if (isDrawingMode && spaceCoordinates.length >= 3) {
			const id = `space-${++spaceCountRef.current}`;
			const type = circleCenter ? "circle" : drawMode === "rectangle" ? "rectangle" : "polygon";

			const newSpace: Space = {
				id,
				type,
				coordinates: spaceCoordinates,
				name: spaceName,
				color: spaceColor,
				description: spaceDescription,
				center: circleCenter || undefined,
				radius: circleCenter ? circleRadius : undefined,
				blueprintImage: blueprintImage || undefined,
				imageCorners: imageCorners || undefined,
				zones: [],
			};

			const newSpaces = [...spaces, newSpace];
			setSpaces(newSpaces);
			updateMapSpaces(newSpaces);

			// Clear the current drawing layer
			if (mapRef.current) {
				const currentSource = mapRef.current.getSource("current-drawing") as mapboxgl.GeoJSONSource;
				const pointsSource = mapRef.current.getSource("drawing-points") as mapboxgl.GeoJSONSource;
				const midpointsSource = mapRef.current.getSource("drawing-midpoints") as mapboxgl.GeoJSONSource;
				currentSource?.setData({type: "FeatureCollection", features: []});
				pointsSource?.setData({type: "FeatureCollection", features: []});
				midpointsSource?.setData({type: "FeatureCollection", features: []});
			}
		}

		// Exit drawing mode and close panel
		setIsDrawingMode(false);
		setDrawMode("none");
		setPolygonPoints([]);
		setIsNearFirstPoint(false);
		setCircleCenter(null);
		setSpaceCoordinates([]);
		// Clear blueprint state
		setBlueprintImage(null);
		setImageCorners(null);
		// Clear drag state
		setDraggingNewPointIndex(null);
		setIsDraggingNewShape(false);
		setNewDragStart(null);
		setShowSpacePanel(false);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Spaces</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Draw spaces on the map and add blueprint images for positioning.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Draw Spaces</CardTitle>
				</CardHeader>
				<CardContent>
					<PushPanelProvider open={showSpacePanel} onOpenChange={setShowSpacePanel} side="right">
						<PushPanelContainer className="wwc:rounded-lg wwc:border wwc:overflow-hidden wwc:h-[500px]">
							<PushPanelMain className="wwc:relative wwc:bg-muted/30">
								<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />

								{/* Normal Mode - Show MapControls with Draw button */}
								{!isDrawingMode && (
									<MapControls
										mapRef={mapRef}
										mapStyle={mapStyle}
										onMapStyleChange={setMapStyle}
										additionalControls={
											<Button
												variant="outline"
												icon
												className="wwc:h-8 wwc:w-8 wwc:bg-background"
												onClick={enterDrawingMode}
											>
												<PenTool className="wwc:h-4 wwc:w-4" />
											</Button>
										}
									/>
								)}

								{/* Drawing Mode - Show Instructions on Map */}
								{isDrawingMode && (
									<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-xs wwc:border wwc:shadow-sm wwc:z-10">
										{drawMode === "polygon" &&
											(isNearFirstPoint ? (
												<span className="wwc:text-green-500 wwc:font-medium">Click to close polygon</span>
											) : (
												"Click to add points. Click first point to complete."
											))}
										{drawMode === "rectangle" && "Click first corner, then opposite corner."}
										{drawMode === "none" && "Select a shape in the panel to start drawing."}
									</div>
								)}

								{/* Space Count Badge */}
								{spaces.length > 0 && !isDrawingMode && !showSpacePanel && (
									<div
										className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:px-3 wwc:py-2 wwc:text-xs wwc:border wwc:shadow-sm wwc:z-10 wwc:cursor-pointer wwc:hover:bg-background"
										onClick={() => setShowSpacePanel(true)}
									>
										{spaces.length} space{spaces.length > 1 ? "s" : ""}{" "}
										<ChevronRight className="wwc:h-3 wwc:w-3 wwc:inline" />
									</div>
								)}
							</PushPanelMain>

							{/* Space Details Panel */}
							<PushPanel width={320}>
								{/* ZONE VIEW/EDIT PANEL */}
								{selectedZone && selectedSpace ? (
									<>
										<PushPanelHeader>
											<Button
												variant="ghost"
												icon
												className="wwc:h-6 wwc:w-6"
												onClick={() => {
													setSelectedZone(null);
													setEditingZone(null);
													setIsZoneEditMode(false);
												}}
											>
												<ChevronLeft className="wwc:h-4 wwc:w-4" />
											</Button>
											<PushPanelHeaderTitle>
												<span
													className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:shrink-0"
													style={{backgroundColor: selectedZone.color}}
												/>
												<PushPanelTitle>{selectedZone.name}</PushPanelTitle>
											</PushPanelHeaderTitle>
											<PushPanelHeaderActions>
												{!isZoneEditMode && (
													<>
														<Button
															variant="ghost"
															icon
															className="wwc:h-6 wwc:w-6"
															onClick={enterZoneEditMode}
															title="Edit"
														>
															<Edit2 className="wwc:h-3.5 wwc:w-3.5" />
														</Button>
														<Button
															variant="ghost"
															icon
															className="wwc:h-6 wwc:w-6 wwc:text-destructive wwc:hover:text-destructive"
															onClick={() => deleteZone(selectedZone.id)}
															title="Delete"
														>
															<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
														</Button>
													</>
												)}
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														setShowSpacePanel(false);
														setSelectedSpace(null);
														setSelectedZone(null);
														setEditingZone(null);
													}}
												>
													<X className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelHeaderActions>
										</PushPanelHeader>

										<PushPanelContent>
											{/* Zone View Mode */}
											{!isZoneEditMode ? (
												<div className="wwc:space-y-3">
													<div>
														<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
															Type
														</p>
														<p className="wwc:text-sm wwc:capitalize">{selectedZone.type}</p>
													</div>
													{selectedZone.description && (
														<div>
															<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																Description
															</p>
															<p className="wwc:text-sm">{selectedZone.description}</p>
														</div>
													)}
													<div>
														<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
															Parent Space
														</p>
														<p className="wwc:text-sm">{selectedSpace.name}</p>
													</div>
													<div>
														<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
															Coordinates
														</p>
														<p className="wwc:text-xs wwc:text-muted-foreground">
															{selectedZone.coordinates.length - 1} points
														</p>
													</div>
												</div>
											) : (
												/* Zone Edit Mode */
												<div className="wwc:space-y-4">
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Name</Label>
														<Input
															value={zoneName}
															onChange={(e) => setZoneName(e.target.value)}
															className="wwc:h-8 wwc:text-sm"
														/>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Color</Label>
														<div className="wwc:grid wwc:grid-cols-8 wwc:gap-1">
															{zoneColors.map((color) => (
																<button
																	key={color.value}
																	onClick={() => setZoneColor(color.value)}
																	className="wwc:h-6 wwc:w-6 wwc:rounded-full wwc:border wwc:hover:scale-110 wwc:transition-transform"
																	style={{
																		backgroundColor: color.value,
																		borderColor: zoneColor === color.value ? "white" : "transparent",
																		boxShadow: zoneColor === color.value ? "0 0 0 2px hsl(var(--primary))" : "none",
																	}}
																/>
															))}
														</div>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Description</Label>
														<Textarea
															value={zoneDescription}
															onChange={(e) => setZoneDescription(e.target.value)}
															className="wwc:text-sm wwc:min-h-[60px] wwc:resize-none"
														/>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Coordinates</Label>
														<div className="wwc:max-h-[120px] wwc:overflow-y-auto wwc:border wwc:rounded-md">
															<div className="wwc:p-2 wwc:space-y-1.5">
																{zoneCoordinates.slice(0, -1).map((coord, i) => (
																	<div key={i} className="wwc:flex wwc:items-center wwc:gap-1">
																		<span
																			className="wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:rounded wwc:text-[10px] wwc:font-semibold wwc:min-w-[24px] wwc:text-center wwc:shrink-0"
																			style={{borderLeft: `3px solid ${zoneColor}`}}
																		>
																			P{i + 1}
																		</span>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[1]}
																			onChange={(e) => updateZoneCoordinate(i, "lat", e.target.value)}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[0]}
																			onChange={(e) => updateZoneCoordinate(i, "lng", e.target.value)}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5"
																			onClick={() => addZonePointAfter(i)}
																		>
																			<Plus className="wwc:h-3 wwc:w-3" />
																		</Button>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5 wwc:text-destructive"
																			onClick={() => removeZonePoint(i)}
																			disabled={zoneCoordinates.length <= 4}
																		>
																			<Minus className="wwc:h-3 wwc:w-3" />
																		</Button>
																	</div>
																))}
															</div>
														</div>
													</div>
												</div>
											)}
										</PushPanelContent>
										{isZoneEditMode && (
											<PushPanelFooter className="wwc:justify-end">
												<Button variant="outline" size="sm" onClick={cancelZoneEdit}>
													Cancel
												</Button>
												<Button size="sm" onClick={saveZoneDetails}>
													Save
												</Button>
											</PushPanelFooter>
										)}
									</>
								) : selectedSpace && !isDrawingZone ? (
									/* SPACE VIEW/EDIT PANEL */
									<>
										<PushPanelHeader>
											{/* Back button - show when viewing (not editing) and have multiple spaces */}
											{!isSpaceEditMode && spaces.length > 1 && (
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														setSelectedSpace(null);
														setEditingSpace(null);
													}}
												>
													<ChevronLeft className="wwc:h-4 wwc:w-4" />
												</Button>
											)}
											{/* Back button in edit mode */}
											{isSpaceEditMode && (
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														setIsSpaceEditMode(false);
														setEditingSpace(null);
													}}
												>
													<ChevronLeft className="wwc:h-4 wwc:w-4" />
												</Button>
											)}
											<PushPanelHeaderTitle>
												<span
													className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:shrink-0"
													style={{backgroundColor: selectedSpace.color}}
												/>
												<PushPanelTitle>{selectedSpace.name}</PushPanelTitle>
											</PushPanelHeaderTitle>
											<PushPanelHeaderActions>
												{!isSpaceEditMode && (
													<>
														<Button
															variant="ghost"
															icon
															className="wwc:h-6 wwc:w-6"
															onClick={enterSpaceEditMode}
															title="Edit"
														>
															<Edit2 className="wwc:h-3.5 wwc:w-3.5" />
														</Button>
														<Button
															variant="ghost"
															icon
															className="wwc:h-6 wwc:w-6 wwc:text-destructive wwc:hover:text-destructive"
															onClick={() => deleteSpace(selectedSpace.id)}
															title="Delete"
														>
															<Trash2 className="wwc:h-3.5 wwc:w-3.5" />
														</Button>
													</>
												)}
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														setShowSpacePanel(false);
														setSelectedSpace(null);
														setEditingSpace(null);
														setIsSpaceEditMode(false);
													}}
												>
													<X className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelHeaderActions>
										</PushPanelHeader>

										<PushPanelContent>
											{/* Space View Mode */}
											{!isSpaceEditMode ? (
												<div className="wwc:space-y-4">
													<div className="wwc:space-y-3">
														<div>
															<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																Type
															</p>
															<p className="wwc:text-sm wwc:capitalize">{selectedSpace.type}</p>
														</div>
														{selectedSpace.description && (
															<div>
																<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																	Description
																</p>
																<p className="wwc:text-sm">{selectedSpace.description}</p>
															</div>
														)}
														{selectedSpace.blueprintImage && (
															<div>
																<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																	Blueprint
																</p>
																<img
																	src={selectedSpace.blueprintImage.base64Data}
																	alt="Blueprint"
																	className="wwc:w-full wwc:h-20 wwc:object-cover wwc:rounded-md wwc:border wwc:mt-1"
																/>
															</div>
														)}
														<div>
															<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																Coordinates
															</p>
															<p className="wwc:text-xs wwc:text-muted-foreground">
																{selectedSpace.coordinates.length - 1} points
															</p>
														</div>
													</div>

													{/* Zones List in View Mode */}
													<div className="wwc:space-y-2 wwc:pt-2 wwc:border-t">
														<div className="wwc:flex wwc:items-center wwc:justify-between">
															<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
																Zones ({selectedSpace.zones.length})
															</p>
															<Button
																variant="outline"
																size="sm"
																className="wwc:h-6 wwc:text-xs"
																onClick={() => {
																	setEditingSpace(selectedSpace);
																	startDrawingZone();
																}}
															>
																<Plus className="wwc:h-3 wwc:w-3 wwc:mr-1" />
																Add
															</Button>
														</div>
														{selectedSpace.zones.length > 0 ? (
															<div className="wwc:space-y-1">
																{selectedSpace.zones.map((zone) => (
																	<div
																		key={zone.id}
																		className="wwc:flex wwc:items-center wwc:gap-2 wwc:p-1.5 wwc:rounded-md wwc:border wwc:hover:bg-accent/50 wwc:cursor-pointer"
																		onClick={() => selectZone(zone, selectedSpace)}
																	>
																		<span
																			className="wwc:w-2.5 wwc:h-2.5 wwc:rounded-full"
																			style={{backgroundColor: zone.color}}
																		/>
																		<p className="wwc:text-xs wwc:flex-1 wwc:truncate">{zone.name}</p>
																		<ChevronRight className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
																	</div>
																))}
															</div>
														) : (
															<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:text-center wwc:py-2">
																No zones
															</p>
														)}
													</div>
												</div>
											) : (
												/* Space Edit Mode */
												<div className="wwc:space-y-4">
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Name</Label>
														<Input
															value={spaceName}
															onChange={(e) => setSpaceName(e.target.value)}
															className="wwc:h-8 wwc:text-sm"
														/>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Color</Label>
														<div className="wwc:grid wwc:grid-cols-8 wwc:gap-1">
															{spaceColors.map((color) => (
																<button
																	key={color.value}
																	onClick={() => setSpaceColor(color.value)}
																	className="wwc:h-6 wwc:w-6 wwc:rounded-full wwc:border wwc:hover:scale-110 wwc:transition-transform"
																	style={{
																		backgroundColor: color.value,
																		borderColor: spaceColor === color.value ? "white" : "transparent",
																		boxShadow: spaceColor === color.value ? "0 0 0 2px hsl(var(--primary))" : "none",
																	}}
																/>
															))}
														</div>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Description</Label>
														<Textarea
															value={spaceDescription}
															onChange={(e) => setSpaceDescription(e.target.value)}
															className="wwc:text-sm wwc:min-h-[60px] wwc:resize-none"
														/>
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Blueprint Image</Label>
														{blueprintImage ? (
															<div className="wwc:space-y-2">
																<div className="wwc:relative wwc:border wwc:rounded-md wwc:overflow-hidden">
																	<img
																		src={blueprintImage.base64Data}
																		alt="Blueprint"
																		className="wwc:w-full wwc:h-20 wwc:object-cover"
																	/>
																	<Button
																		variant="destructive"
																		icon
																		className="wwc:absolute wwc:top-1 wwc:right-1 wwc:h-5 wwc:w-5"
																		onClick={removeBlueprint}
																	>
																		<X className="wwc:h-3 wwc:w-3" />
																	</Button>
																</div>
																<div className="wwc:space-y-1">
																	<label className="wwc:text-[10px] wwc:text-muted-foreground">
																		Opacity: {Math.round(blueprintImage.opacity * 100)}%
																	</label>
																	<input
																		type="range"
																		min="0"
																		max="100"
																		value={blueprintImage.opacity * 100}
																		onChange={(e) =>
																			setBlueprintImage({
																				...blueprintImage,
																				opacity: Number.parseInt(e.target.value) / 100,
																			})
																		}
																		className="wwc:w-full wwc:h-2 wwc:bg-muted wwc:rounded-lg wwc:cursor-pointer"
																	/>
																</div>
															</div>
														) : (
															<div>
																<input
																	type="file"
																	accept="image/*"
																	onChange={handleImageUpload}
																	className="wwc:hidden"
																	id="blueprint-upload"
																/>
																<label
																	htmlFor="blueprint-upload"
																	className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:border-2 wwc:border-dashed wwc:rounded-md wwc:p-2 wwc:cursor-pointer wwc:hover:bg-accent/50"
																>
																	<Plus className="wwc:h-4 wwc:w-4" />
																	<span className="wwc:text-xs">Upload</span>
																</label>
															</div>
														)}
													</div>
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Coordinates</Label>
														<div className="wwc:border wwc:rounded-md">
															<div className="wwc:p-2 wwc:space-y-1.5">
																{spaceCoordinates.slice(0, -1).map((coord, i) => (
																	<div key={i} className="wwc:flex wwc:items-center wwc:gap-1">
																		<span
																			className="wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:rounded wwc:text-[10px] wwc:font-semibold wwc:min-w-[24px] wwc:text-center wwc:shrink-0"
																			style={{borderLeft: `3px solid ${spaceColor}`}}
																		>
																			P{i + 1}
																		</span>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[1]}
																			onChange={(e) => updateCoordinate(i, "lat", e.target.value)}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[0]}
																			onChange={(e) => updateCoordinate(i, "lng", e.target.value)}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5"
																			onClick={() => addPointAfter(i)}
																		>
																			<Plus className="wwc:h-3 wwc:w-3" />
																		</Button>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5 wwc:text-destructive"
																			onClick={() => removePoint(i)}
																			disabled={spaceCoordinates.length <= 4}
																		>
																			<Minus className="wwc:h-3 wwc:w-3" />
																		</Button>
																	</div>
																))}
															</div>
														</div>
													</div>
												</div>
											)}
										</PushPanelContent>
										{isSpaceEditMode && (
											<PushPanelFooter className="wwc:justify-end">
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														setIsSpaceEditMode(false);
														setEditingSpace(null);
													}}
												>
													Cancel
												</Button>
												<Button size="sm" onClick={saveSpaceDetails}>
													Save
												</Button>
											</PushPanelFooter>
										)}
									</>
								) : isDrawingMode ? (
									/* NEW SPACE DRAWING PANEL */
									<>
										<PushPanelHeader>
											<PushPanelHeaderTitle>
												<PushPanelTitle>New Space</PushPanelTitle>
											</PushPanelHeaderTitle>
											<PushPanelHeaderActions>
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														exitDrawingMode();
														setShowSpacePanel(false);
													}}
												>
													<X className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelHeaderActions>
										</PushPanelHeader>
										<PushPanelContent>
											<div className="wwc:space-y-4">
												<div className="wwc:space-y-2">
													<Label className="wwc:text-xs">Name</Label>
													<Input
														value={spaceName}
														onChange={(e) => setSpaceName(e.target.value)}
														className="wwc:h-8 wwc:text-sm"
														placeholder="Space name..."
													/>
												</div>
												<div className="wwc:space-y-2">
													<Label className="wwc:text-xs">Color</Label>
													<div className="wwc:grid wwc:grid-cols-8 wwc:gap-1">
														{spaceColors.map((color) => (
															<button
																key={color.value}
																onClick={() => setSpaceColor(color.value)}
																className="wwc:h-6 wwc:w-6 wwc:rounded-full wwc:border wwc:hover:scale-110 wwc:transition-transform"
																style={{
																	backgroundColor: color.value,
																	borderColor: spaceColor === color.value ? "white" : "transparent",
																	boxShadow: spaceColor === color.value ? "0 0 0 2px hsl(var(--primary))" : "none",
																}}
															/>
														))}
													</div>
												</div>
												<div className="wwc:space-y-2">
													<Label className="wwc:text-xs">Description</Label>
													<Textarea
														value={spaceDescription}
														onChange={(e) => setSpaceDescription(e.target.value)}
														className="wwc:text-sm wwc:min-h-[60px] wwc:resize-none"
														placeholder="Optional description..."
													/>
												</div>
												<div className="wwc:space-y-2">
													<Label className="wwc:text-xs">Blueprint Image</Label>
													{blueprintImage ? (
														<div className="wwc:space-y-2">
															<div className="wwc:relative wwc:border wwc:rounded-md wwc:overflow-hidden">
																<img
																	src={blueprintImage.base64Data}
																	alt="Blueprint"
																	className="wwc:w-full wwc:h-20 wwc:object-cover"
																/>
																<Button
																	variant="destructive"
																	icon
																	className="wwc:absolute wwc:top-1 wwc:right-1 wwc:h-5 wwc:w-5"
																	onClick={removeBlueprint}
																>
																	<X className="wwc:h-3 wwc:w-3" />
																</Button>
															</div>
															<div className="wwc:space-y-1">
																<label className="wwc:text-[10px] wwc:text-muted-foreground">
																	Opacity: {Math.round(blueprintImage.opacity * 100)}%
																</label>
																<input
																	type="range"
																	min="0"
																	max="100"
																	value={blueprintImage.opacity * 100}
																	onChange={(e) =>
																		setBlueprintImage({
																			...blueprintImage,
																			opacity: Number.parseInt(e.target.value) / 100,
																		})
																	}
																	className="wwc:w-full wwc:h-2 wwc:bg-muted wwc:rounded-lg wwc:cursor-pointer"
																/>
															</div>
															{spaceCoordinates.length >= 3 && (
																<p className="wwc:text-[10px] wwc:text-muted-foreground">
																	Drag corners on map to position image
																</p>
															)}
														</div>
													) : (
														<div>
															<input
																type="file"
																accept="image/*"
																onChange={handleImageUpload}
																className="wwc:hidden"
																id="blueprint-upload-new"
															/>
															<label
																htmlFor="blueprint-upload-new"
																className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-2 wwc:border-2 wwc:border-dashed wwc:rounded-md wwc:p-2 wwc:cursor-pointer wwc:hover:bg-accent/50"
															>
																<Plus className="wwc:h-4 wwc:w-4" />
																<span className="wwc:text-xs">Upload</span>
															</label>
														</div>
													)}
												</div>
												<div className="wwc:space-y-2">
													<Label className="wwc:text-xs">Shape</Label>
													<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
														<Button
															variant={drawMode === "polygon" ? "default" : "outline"}
															size="sm"
															onClick={() => {
																setDrawMode("polygon");
																setPolygonPoints([]);
															}}
														>
															<Pencil className="wwc:h-3 wwc:w-3 wwc:mr-1 wwc:shrink-0" />
															Polygon
														</Button>
														<Button
															variant={drawMode === "rectangle" ? "default" : "outline"}
															size="sm"
															onClick={() => {
																setDrawMode("rectangle");
																setPolygonPoints([]);
															}}
														>
															<Square className="wwc:h-3 wwc:w-3 wwc:mr-1 wwc:shrink-0" />
															Rectangle
														</Button>
													</div>
												</div>
												{spaceCoordinates.length === 0 && (
													<div className="wwc:bg-muted/50 wwc:rounded-md wwc:p-3 wwc:text-xs wwc:text-muted-foreground">
														{drawMode === "polygon" && "Click to add points. Click near first point to close."}
														{drawMode === "rectangle" && "Click first corner, then opposite corner."}
														{drawMode === "none" && "Select a shape type above to start drawing."}
													</div>
												)}
												{spaceCoordinates.length > 0 && (
													<div className="wwc:space-y-2">
														<Label className="wwc:text-xs">Coordinates ({spaceCoordinates.length - 1} points)</Label>
														<div className="wwc:border wwc:rounded-md">
															<div className="wwc:p-2 wwc:space-y-1.5">
																{spaceCoordinates.slice(0, -1).map((coord, i) => (
																	<div key={i} className="wwc:flex wwc:items-center wwc:gap-1">
																		<span
																			className="wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:rounded wwc:text-[10px] wwc:font-semibold wwc:min-w-[24px] wwc:text-center wwc:shrink-0"
																			style={{borderLeft: `3px solid ${spaceColor}`}}
																		>
																			P{i + 1}
																		</span>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[1]}
																			onChange={(e) => {
																				const newCoords = [...spaceCoordinates] as [number, number][];
																				newCoords[i] = [coord[0], Number.parseFloat(e.target.value) || 0];
																				if (i === 0) newCoords[newCoords.length - 1] = newCoords[0];
																				setSpaceCoordinates(newCoords);
																				updateCurrentDrawing(newCoords, true);
																			}}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Input
																			type="number"
																			step="0.000001"
																			value={coord[0]}
																			onChange={(e) => {
																				const newCoords = [...spaceCoordinates] as [number, number][];
																				newCoords[i] = [Number.parseFloat(e.target.value) || 0, coord[1]];
																				if (i === 0) newCoords[newCoords.length - 1] = newCoords[0];
																				setSpaceCoordinates(newCoords);
																				updateCurrentDrawing(newCoords, true);
																			}}
																			className="wwc:h-6 wwc:text-[10px] wwc:font-mono wwc:px-1 wwc:flex-1"
																		/>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5"
																			onClick={() => addDrawingPointAfter(i)}
																		>
																			<Plus className="wwc:h-3 wwc:w-3" />
																		</Button>
																		<Button
																			variant="ghost"
																			icon
																			className="wwc:h-5 wwc:w-5 wwc:text-destructive"
																			onClick={() => removeDrawingPoint(i)}
																			disabled={spaceCoordinates.length <= 4}
																		>
																			<Minus className="wwc:h-3 wwc:w-3" />
																		</Button>
																	</div>
																))}
															</div>
														</div>
														<p className="wwc:text-[10px] wwc:text-muted-foreground">
															Drag points on map to adjust position
														</p>
													</div>
												)}
											</div>
										</PushPanelContent>
										<PushPanelFooter className="wwc:justify-end">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													exitDrawingMode();
													setShowSpacePanel(false);
												}}
											>
												Cancel
											</Button>
											<Button size="sm" onClick={saveAndExit} disabled={spaceCoordinates.length < 3}>
												Save
											</Button>
										</PushPanelFooter>
									</>
								) : isDrawingZone && editingSpace ? (
									/* ZONE DRAWING PANEL */
									<>
										<PushPanelHeader>
											<Button
												variant="ghost"
												icon
												className="wwc:h-6 wwc:w-6"
												onClick={() => {
													exitZoneDrawing();
													setEditingSpace(null);
												}}
											>
												<ChevronLeft className="wwc:h-4 wwc:w-4" />
											</Button>
											<PushPanelHeaderTitle>
												<PushPanelTitle>New Zone</PushPanelTitle>
											</PushPanelHeaderTitle>
											<PushPanelHeaderActions>
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => {
														setShowSpacePanel(false);
														exitZoneDrawing();
														setEditingSpace(null);
													}}
												>
													<X className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelHeaderActions>
										</PushPanelHeader>
										<PushPanelContent className="wwc:space-y-4">
											<p className="wwc:text-sm wwc:text-muted-foreground">Draw zone within {editingSpace.name}</p>
											<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
												<Button
													variant={drawMode === "polygon" ? "default" : "outline"}
													size="sm"
													onClick={() => {
														setDrawMode("polygon");
														setPolygonPoints([]);
													}}
												>
													<Pencil className="wwc:h-3 wwc:w-3 wwc:mr-1 wwc:shrink-0" />
													Polygon
												</Button>
												<Button
													variant={drawMode === "rectangle" ? "default" : "outline"}
													size="sm"
													onClick={() => {
														setDrawMode("rectangle");
														setPolygonPoints([]);
													}}
												>
													<Square className="wwc:h-3 wwc:w-3 wwc:mr-1 wwc:shrink-0" />
													Rectangle
												</Button>
											</div>
											<div className="wwc:bg-muted/50 wwc:rounded-md wwc:p-3 wwc:text-xs wwc:text-muted-foreground">
												{drawMode === "polygon" && "Click to add points. Double-click to close."}
												{drawMode === "rectangle" && "Click first corner, then opposite corner."}
											</div>
										</PushPanelContent>
									</>
								) : (
									/* SPACES LIST PANEL */
									<>
										<PushPanelHeader>
											<PushPanelHeaderTitle>
												<PushPanelTitle>Spaces</PushPanelTitle>
											</PushPanelHeaderTitle>
											<PushPanelHeaderActions>
												<Button
													variant="ghost"
													icon
													className="wwc:h-6 wwc:w-6"
													onClick={() => setShowSpacePanel(false)}
												>
													<X className="wwc:h-4 wwc:w-4" />
												</Button>
											</PushPanelHeaderActions>
										</PushPanelHeader>
										{spaces.length > 0 && (
											<div className="wwc:flex wwc:justify-end wwc:px-4 wwc:pb-2 wwc:border-b">
												<Button
													variant="ghost"
													size="sm"
													className="wwc:h-6 wwc:text-xs wwc:text-muted-foreground wwc:hover:text-destructive"
													onClick={clearAll}
												>
													<Trash2 className="wwc:h-3 wwc:w-3 wwc:mr-1" />
													Clear All
												</Button>
											</div>
										)}
										<PushPanelContent>
											<div className="wwc:space-y-2">
												{spaces.map((space) => (
													<div
														key={space.id}
														className="wwc:flex wwc:items-center wwc:gap-2 wwc:p-2 wwc:rounded-md wwc:border wwc:hover:bg-accent/50 wwc:cursor-pointer"
														onClick={() => selectSpace(space)}
													>
														<span
															className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:shrink-0"
															style={{backgroundColor: space.color}}
														/>
														<div className="wwc:flex-1 wwc:min-w-0">
															<p className="wwc:text-sm wwc:font-medium wwc:truncate">{space.name}</p>
															<p className="wwc:text-xs wwc:text-muted-foreground wwc:capitalize">
																{space.type} • {space.zones.length} zone{space.zones.length !== 1 ? "s" : ""}
															</p>
														</div>
														<ChevronRight className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
													</div>
												))}
												{spaces.length === 0 && (
													<p className="wwc:text-sm wwc:text-muted-foreground wwc:text-center wwc:py-8">
														No spaces drawn yet
													</p>
												)}
											</div>
										</PushPanelContent>
									</>
								)}
							</PushPanel>
						</PushPanelContainer>
					</PushPanelProvider>
				</CardContent>
			</Card>
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Drawing",
	component: Map,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Full-featured map drawing tool with spaces, zones, blueprint images, coordinate editing, drag handles, and midpoint insertion. Matches web app DrawingPage exactly.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <DrawingPageComponent />,
};
