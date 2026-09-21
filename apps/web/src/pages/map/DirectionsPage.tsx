import {Clock, MapPin, Navigation, RotateCcw, Route} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {MAPBOX_TOKEN, MapControls} from "@/components/ui/map-controls";
import {Separator} from "@/components/ui/separator";

const presetRoutes = [
	{name: "Riyadh to Jeddah", origin: [46.6753, 24.7136], destination: [39.1925, 21.4858]},
	{name: "Riyadh to Dammam", origin: [46.6753, 24.7136], destination: [50.1033, 26.4207]},
	{name: "Jeddah to Mecca", origin: [39.1925, 21.4858], destination: [39.8579, 21.3891]},
];

export function DirectionsPage() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
	const [routeInfo, setRouteInfo] = useState<{distance: string; duration: string; name: string} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showDirectionsControls, setShowDirectionsControls] = useState(true);
	const [showRouteInfo, setShowRouteInfo] = useState(true);

	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [45.0792, 23.8859],
			zoom: 5,
		});

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
		}
	}, [mapStyle]);

	const getRoute = async (origin: number[], destination: number[], routeName: string) => {
		if (!mapRef.current) return;

		setIsLoading(true);
		setRouteInfo(null);

		try {
			const response = await fetch(
				`https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`,
			);
			const data = await response.json();

			if (data.routes && data.routes.length > 0) {
				const route = data.routes[0];
				const coordinates = route.geometry.coordinates;

				const distanceKm = (route.distance / 1000).toFixed(1);
				const durationHours = Math.floor(route.duration / 3600);
				const durationMinutes = Math.floor((route.duration % 3600) / 60);

				setRouteInfo({
					distance: `${distanceKm} km`,
					duration: `${durationHours}h ${durationMinutes}m`,
					name: routeName,
				});

				if (mapRef.current.getLayer("route")) {
					mapRef.current.removeLayer("route");
				}
				if (mapRef.current.getSource("route")) {
					mapRef.current.removeSource("route");
				}

				const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
				existingMarkers.forEach((marker) => marker.remove());

				mapRef.current.addSource("route", {
					type: "geojson",
					data: {
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: coordinates,
						},
					},
				});

				mapRef.current.addLayer({
					id: "route",
					type: "line",
					source: "route",
					layout: {
						"line-join": "round",
						"line-cap": "round",
					},
					paint: {
						"line-color": "#f97316",
						"line-width": 4,
					},
				});

				new mapboxgl.Marker({color: "#22c55e"}).setLngLat(origin as [number, number]).addTo(mapRef.current);

				new mapboxgl.Marker({color: "#ef4444"}).setLngLat(destination as [number, number]).addTo(mapRef.current);

				const bounds = new mapboxgl.LngLatBounds();
				coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
				mapRef.current.fitBounds(bounds, {padding: 50});
			}
		} catch (error) {
			console.error("Error fetching route:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const clearRoute = () => {
		if (!mapRef.current) return;

		if (mapRef.current.getLayer("route")) {
			mapRef.current.removeLayer("route");
		}
		if (mapRef.current.getSource("route")) {
			mapRef.current.removeSource("route");
		}

		const existingMarkers = document.querySelectorAll(".mapboxgl-marker");
		existingMarkers.forEach((marker) => marker.remove());

		setRouteInfo(null);

		mapRef.current.flyTo({
			center: [45.0792, 23.8859],
			zoom: 5,
		});
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Directions</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Display driving routes between locations using Mapbox Directions API.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Route Navigation</CardTitle>
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
									id: "show-directions",
									label: "Directions",
									checked: showDirectionsControls,
									onCheckedChange: setShowDirectionsControls,
								},
								{
									id: "show-route-info",
									label: "Route Info",
									checked: showRouteInfo,
									onCheckedChange: setShowRouteInfo,
								},
							]}
							additionalControls={
								showDirectionsControls && (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" icon className="wwc:h-8 wwc:w-8 wwc:bg-background">
												<Route className="wwc:h-4 wwc:w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="wwc:w-[180px] wwc:p-2">
											<div className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Routes</div>
											<div className="wwc:space-y-1">
												{presetRoutes.map((route) => (
													<button
														key={route.name}
														onClick={() => getRoute(route.origin, route.destination, route.name)}
														disabled={isLoading}
														className="wwc:w-full wwc:flex wwc:items-center wwc:gap-2 wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:rounded-md wwc:hover:bg-accent wwc:transition-colors wwc:text-left wwc:disabled:opacity-50"
													>
														<Navigation className="wwc:h-3 wwc:w-3 wwc:shrink-0" />
														<span>{route.name}</span>
													</button>
												))}
											</div>
											{routeInfo && (
												<>
													<Separator className="wwc:my-2" />
													<button
														onClick={clearRoute}
														className="wwc:w-full wwc:flex wwc:items-center wwc:gap-2 wwc:px-2 wwc:py-1.5 wwc:text-xs wwc:rounded-md wwc:hover:bg-accent wwc:transition-colors wwc:text-left wwc:text-muted-foreground"
													>
														<RotateCcw className="wwc:h-3 wwc:w-3" />
														<span>Clear Route</span>
													</button>
												</>
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								)
							}
						/>

						{/* Route Info Legend */}
						{showRouteInfo && routeInfo && (
							<div className="wwc:absolute wwc:top-14 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:p-2 wwc:text-xs wwc:space-y-1.5 wwc:border wwc:shadow-sm wwc:min-w-[140px]">
								<div className="wwc:font-medium wwc:text-muted-foreground wwc:mb-1">Route Info</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Navigation className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
									<span className="wwc:text-muted-foreground">{routeInfo.name}</span>
								</div>
								<Separator className="wwc:my-1" />
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<MapPin className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
									<span className="wwc:text-muted-foreground">{routeInfo.distance}</span>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<Clock className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
									<span className="wwc:text-muted-foreground">{routeInfo.duration}</span>
								</div>
								<Separator className="wwc:my-1" />
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-green-500 wwc:border wwc:border-white/50" />
									<span className="wwc:text-muted-foreground">Origin</span>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-red-500 wwc:border wwc:border-white/50" />
									<span className="wwc:text-muted-foreground">Destination</span>
								</div>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<span className="wwc:w-3 wwc:h-0.5 wwc:bg-orange-500 wwc:rounded" />
									<span className="wwc:text-muted-foreground">Route</span>
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
						{`// Fetch route from Directions API
const response = await fetch(
  \`https://api.mapbox.com/directions/v5/mapbox/driving/\${origin};\${destination}?geometries=geojson&access_token=\${token}\`
)
const data = await response.json()

// Add route line to map
map.addLayer({
  id: "route",
  type: "line",
  source: { type: "geojson", data: route.geometry },
  paint: { "line-color": "#f97316", "line-width": 4 },
})`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
