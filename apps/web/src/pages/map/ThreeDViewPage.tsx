import {RotateCw} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {MAPBOX_TOKEN, MapControls} from "@/components/ui/map-controls";

export function ThreeDViewPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
	const [isRotating, setIsRotating] = useState(false);
	const animationRef = useRef<number | null>(null);

	const add3DBuildings = () => {
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
	};

	useEffect(() => {
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
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
			mapRef.current.once("style.load", add3DBuildings);
		}
	}, [mapStyle]);

	const toggleRotation = () => {
		if (isRotating) {
			setIsRotating(false);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		} else {
			setIsRotating(true);
			rotateCamera();
		}
	};

	const rotateCamera = () => {
		if (!mapRef.current) return;

		const currentBearing = mapRef.current.getBearing();
		mapRef.current.setBearing(currentBearing + 0.1);

		animationRef.current = requestAnimationFrame(rotateCamera);
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">3D View</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Explore maps with 3D buildings, terrain, and custom camera angles.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>3D Buildings</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative">
						<div ref={mapContainerRef} className="wwc:h-[500px] wwc:w-full wwc:rounded-lg wwc:overflow-hidden" />
						<MapControls mapRef={mapRef} mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
						{/* Auto Rotate Button - Far Right */}
						<div className="wwc:absolute wwc:top-3 wwc:right-3 wwc:z-10">
							<Button
								variant={isRotating ? "default" : "outline"}
								icon
								className="wwc:h-8 wwc:w-8 wwc:bg-background"
								onClick={toggleRotation}
							>
								<RotateCw className={`wwc:h-4 wwc:w-4 ${isRotating ? "wwc:animate-spin" : ""}`} />
							</Button>
						</div>
					</div>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-4">
						Drag to rotate the view. Use scroll to zoom and tilt.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
