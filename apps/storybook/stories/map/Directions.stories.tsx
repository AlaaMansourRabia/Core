import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@wakecap/core-ui/dropdown-menu";
import {Map} from "@wakecap/core-ui/map";
import {MapControls} from "@wakecap/core-ui/map-controls";
import {MAPBOX_TOKEN} from "@wakecap/core-ui/mapbox-token";
import {Separator} from "@wakecap/core-ui/separator";
import {Clock, MapPin, Navigation, RotateCcw, Route} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as React from "react";

const presetRoutes = [
	{
		name: "Riyadh to Jeddah",
		origin: [46.6753, 24.7136] as [number, number],
		destination: [39.1925, 21.4858] as [number, number],
	},
	{
		name: "Riyadh to Dammam",
		origin: [46.6753, 24.7136] as [number, number],
		destination: [50.1033, 26.4207] as [number, number],
	},
	{
		name: "Jeddah to Mecca",
		origin: [39.1925, 21.4858] as [number, number],
		destination: [39.8579, 21.3891] as [number, number],
	},
];

function DirectionsStory() {
	const mapContainerRef = React.useRef<HTMLDivElement>(null);
	const mapRef = React.useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = React.useState("mapbox://styles/mapbox/dark-v11");
	const [routeInfo, setRouteInfo] = React.useState<{distance: string; duration: string; name: string} | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const [showDirectionsControls, setShowDirectionsControls] = React.useState(true);
	const [showRouteInfo, setShowRouteInfo] = React.useState(true);

	React.useEffect(() => {
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

	React.useEffect(() => {
		if (mapRef.current) mapRef.current.setStyle(mapStyle);
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
			if (data.routes?.[0]) {
				const route = data.routes[0];
				const distanceKm = (route.distance / 1000).toFixed(1);
				const durationH = Math.floor(route.duration / 3600);
				const durationM = Math.floor((route.duration % 3600) / 60);
				setRouteInfo({distance: `${distanceKm} km`, duration: `${durationH}h ${durationM}m`, name: routeName});

				if (mapRef.current.getLayer("route")) mapRef.current.removeLayer("route");
				if (mapRef.current.getSource("route")) mapRef.current.removeSource("route");
				document.querySelectorAll(".mapboxgl-marker").forEach((m) => m.remove());

				mapRef.current.addSource("route", {
					type: "geojson",
					data: {
						type: "Feature",
						properties: {},
						geometry: {type: "LineString", coordinates: route.geometry.coordinates},
					},
				});
				mapRef.current.addLayer({
					id: "route",
					type: "line",
					source: "route",
					layout: {"line-join": "round", "line-cap": "round"},
					paint: {"line-color": "#f97316", "line-width": 4},
				});
				new mapboxgl.Marker({color: "#22c55e"}).setLngLat(origin as [number, number]).addTo(mapRef.current);
				new mapboxgl.Marker({color: "#ef4444"}).setLngLat(destination as [number, number]).addTo(mapRef.current);

				const bounds = new mapboxgl.LngLatBounds();
				route.geometry.coordinates.forEach((c: [number, number]) => bounds.extend(c));
				mapRef.current.fitBounds(bounds, {padding: 50});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const clearRoute = () => {
		if (!mapRef.current) return;
		if (mapRef.current.getLayer("route")) mapRef.current.removeLayer("route");
		if (mapRef.current.getSource("route")) mapRef.current.removeSource("route");
		document.querySelectorAll(".mapboxgl-marker").forEach((m) => m.remove());
		setRouteInfo(null);
	};

	return (
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
					{id: "show-route-info", label: "Route Info", checked: showRouteInfo, onCheckedChange: setShowRouteInfo},
				]}
				additionalControls={
					showDirectionsControls && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" icon className="wwc:h-8 wwc:w-8 wwc:bg-background">
									<Route className="wwc:h-4 wwc:w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="wwc:w-[220px] wwc:p-2 wwc:space-y-1">
								{presetRoutes.map((route) => (
									<Button
										key={route.name}
										variant="ghost"
										size="sm"
										className="wwc:w-full wwc:justify-start wwc:text-xs wwc:h-8"
										disabled={isLoading}
										onClick={() => getRoute(route.origin, route.destination, route.name)}
									>
										<Navigation className="wwc:h-3 wwc:w-3 wwc:mr-2" />
										{route.name}
									</Button>
								))}
								{routeInfo && (
									<>
										<Separator />
										<Button
											variant="ghost"
											size="sm"
											className="wwc:w-full wwc:justify-start wwc:text-xs wwc:h-8 wwc:text-destructive"
											onClick={clearRoute}
										>
											<RotateCcw className="wwc:h-3 wwc:w-3 wwc:mr-2" />
											Clear Route
										</Button>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)
				}
			/>

			{/* Route Info Legend */}
			{showRouteInfo && routeInfo && (
				<div className="wwc:absolute wwc:top-14 wwc:left-3 wwc:bg-background/90 wwc:backdrop-blur-sm wwc:rounded-md wwc:p-3 wwc:text-xs wwc:space-y-2 wwc:border wwc:shadow-sm wwc:w-[180px]">
					<div className="wwc:font-medium wwc:text-foreground">{routeInfo.name}</div>
					<Separator />
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<MapPin className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
						<span className="wwc:text-muted-foreground">Distance:</span>
						<span className="wwc:font-medium wwc:ml-auto">{routeInfo.distance}</span>
					</div>
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						<Clock className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />
						<span className="wwc:text-muted-foreground">Duration:</span>
						<span className="wwc:font-medium wwc:ml-auto">{routeInfo.duration}</span>
					</div>
					<Separator />
					<div className="wwc:space-y-1.5">
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-green-500" />
							<span className="wwc:text-muted-foreground">Origin</span>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:w-3 wwc:h-3 wwc:rounded-full wwc:bg-red-500" />
							<span className="wwc:text-muted-foreground">Destination</span>
						</div>
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<span className="wwc:w-3 wwc:h-1 wwc:rounded wwc:bg-orange-500" />
							<span className="wwc:text-muted-foreground">Route</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

const meta = {
	title: "Widgets/Map/Directions",
	component: Map,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Map with preset route directions, Mapbox Directions API integration, route info legend with distance/duration, and origin/destination markers.",
			},
		},
		chromatic: {disableSnapshot: true},
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => <DirectionsStory />,
};
