import ReactECharts from "echarts-for-react";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Flame,
	HardHat,
	Layers,
	MapPin,
	Minus,
	Plus,
	ShieldAlert,
	TrendingUp,
	Users,
} from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import {useEffect, useMemo, useRef, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardHeader, CardTitle} from "../card";
import {ChartRenderer} from "../chat/core-chart-renderer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "../dropdown-menu";
import {Label} from "../label";
import {MAPBOX_TOKEN} from "../mapbox-token";
import {CoreFilterStrip} from "../navigation/core-filter-strip";
import {Slider} from "../slider";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import type {Organization} from "../types";
import type {DashboardWidget} from "../types/chat";

// Core Chart Colors (orange/amber palette from theme)
const CHART_COLORS = {
	chart1: "#f5d4a8", // lightest amber
	chart2: "#e8b573", // light amber
	chart3: "#d99447", // medium amber/orange
	chart4: "#c97a24", // dark amber/orange
	chart5: "#b86010", // darkest burnt orange
	muted: "#e5e7eb", // for background/secondary elements
};

interface OrgWorkforceIntelligenceProps {
	selectedOrg: Organization;
	addedWidgets?: DashboardWidget[];
}

// Mock data for live workforce
const liveWorkforceData = {
	total: 4287,
	checkedIn: 4156,
	onBreak: 89,
	inTransit: 42,
	lastUpdate: new Date().toISOString(),
};

// Mock data for zone distribution
const zoneDistributionData = [
	{zone: "Construction Zone A", workers: 892, capacity: 1000, project: "Six Flags"},
	{zone: "Heavy Equipment", workers: 456, capacity: 500, project: "Aquarabia"},
	{zone: "Foundation Works", workers: 678, capacity: 800, project: "Gaming District"},
	{zone: "Steel Structure", workers: 534, capacity: 600, project: "Speed Park"},
	{zone: "Electrical Works", workers: 312, capacity: 400, project: "Stadium"},
	{zone: "Finishing Zone", workers: 445, capacity: 500, project: "Golf Course"},
	{zone: "Excavation Site", workers: 389, capacity: 450, project: "Mercedes-AMG"},
	{zone: "Assembly Area", workers: 450, capacity: 500, project: "Arts Centre"},
];

// Mock data for compliance & alerts
const complianceData = {
	ppeCompliance: 94.2,
	safetyTraining: 98.5,
	certifications: 96.8,
	workPermits: 99.1,
};

const activeAlerts = [
	{
		id: 1,
		type: "warning",
		message: "Zone A approaching capacity limit",
		time: "5 min ago",
		zone: "Construction Zone A",
	},
	{
		id: 2,
		type: "critical",
		message: "PPE violation detected in Heavy Equipment",
		time: "12 min ago",
		zone: "Heavy Equipment",
	},
	{id: 3, type: "info", message: "Shift change in progress - Zone B", time: "18 min ago", zone: "Foundation Works"},
	{
		id: 4,
		type: "warning",
		message: "3 workers missing check-in - Steel Structure",
		time: "25 min ago",
		zone: "Steel Structure",
	},
	{id: 5, type: "critical", message: "Unauthorized zone access attempt", time: "32 min ago", zone: "Restricted Area"},
];

// Mock data for productivity trends
const productivityTrendsData = [
	{date: "Mon", planned: 4200, actual: 4150, efficiency: 98.8},
	{date: "Tue", planned: 4300, actual: 4280, efficiency: 99.5},
	{date: "Wed", planned: 4250, actual: 4320, efficiency: 101.6},
	{date: "Thu", planned: 4400, actual: 4350, efficiency: 98.9},
	{date: "Fri", planned: 4350, actual: 4287, efficiency: 98.5},
	{date: "Sat", planned: 3800, actual: 3750, efficiency: 98.7},
	{date: "Sun", planned: 2500, actual: 2480, efficiency: 99.2},
];

// Mock data for workforce by trade - using Core orange/amber palette
const workforceByTradeData = [
	{name: "Civil", value: 1245, color: CHART_COLORS.chart1},
	{name: "Electrical", value: 856, color: CHART_COLORS.chart2},
	{name: "Mechanical", value: 723, color: CHART_COLORS.chart3},
	{name: "Steel", value: 612, color: CHART_COLORS.chart4},
	{name: "Finishing", value: 534, color: CHART_COLORS.chart5},
	{name: "Others", value: 317, color: "#a3a3a3"},
];

// Project locations with worker counts (based on actual project coordinates)
const projectWorkerData = [
	{name: "Six Flags", lng: 46.3318815, lat: 24.587486, workers: 892},
	{name: "Aquarabia", lng: 46.3228162, lat: 24.5865379, workers: 456},
	{name: "Gaming District", lng: 46.3384489, lat: 24.5883882, workers: 678},
	{name: "Speed Park", lng: 46.3175447, lat: 24.5859655, workers: 534},
	{name: "Stadium", lng: 46.3270384, lat: 24.5783619, workers: 312},
	{name: "Golf Course", lng: 46.2968464, lat: 24.5832348, workers: 445},
	{name: "Mercedes-AMG", lng: 46.3248418, lat: 24.5814216, workers: 389},
	{name: "Arts Centre", lng: 46.3068169, lat: 24.581464, workers: 450},
	{name: "Studios", lng: 46.3201172, lat: 24.5826725, workers: 331},
];

// Generate heatmap points around each project location
// More workers = more points with higher weights
function generateWorkerPoints() {
	const points: {lng: number; lat: number; weight: number}[] = [];
	const maxWorkers = Math.max(...projectWorkerData.map((p) => p.workers));

	projectWorkerData.forEach((project) => {
		// Normalize weight based on worker count (0.3 to 1.0)
		const baseWeight = 0.3 + (project.workers / maxWorkers) * 0.7;
		// Number of points proportional to workers (scaled down for performance)
		const numPoints = Math.ceil(project.workers / 50);

		for (let i = 0; i < numPoints; i++) {
			// Spread workers around the project location (within ~500m radius)
			const spread = 0.004; // roughly 400-500m in degrees
			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * spread;

			points.push({
				lng: project.lng + Math.cos(angle) * distance,
				lat: project.lat + Math.sin(angle) * distance,
				weight: baseWeight * (0.7 + Math.random() * 0.3), // slight variation
			});
		}

		// Add central high-density point for each project
		points.push({
			lng: project.lng,
			lat: project.lat,
			weight: baseWeight,
		});
	});

	return points;
}

const workerLocationData = generateWorkerPoints();

function getAlertBadgeVariant(type: string): "default" | "secondary" | "destructive" {
	switch (type) {
		case "critical":
			return "destructive";
		case "warning":
			return "secondary";
		default:
			return "default";
	}
}

function WorkforceHeatmap() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/outdoors-v12");
	const [intensity, setIntensity] = useState(1.5);
	const [radius, setRadius] = useState(25);
	const [mapLoaded, setMapLoaded] = useState(false);

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: [46.318, 24.584], // Centered on Qiddiya project area
			zoom: 13,
		});

		mapRef.current.on("load", () => {
			if (!mapRef.current) return;

			// Add heatmap source
			mapRef.current.addSource("workers", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: workerLocationData.map((point) => ({
						type: "Feature" as const,
						properties: {weight: point.weight},
						geometry: {
							type: "Point" as const,
							coordinates: [point.lng, point.lat],
						},
					})),
				},
			});

			// Add heatmap layer
			mapRef.current.addLayer({
				id: "workers-heat",
				type: "heatmap",
				source: "workers",
				maxzoom: 17,
				paint: {
					"heatmap-weight": ["get", "weight"],
					"heatmap-intensity": intensity,
					"heatmap-color": [
						"interpolate",
						["linear"],
						["heatmap-density"],
						0,
						"rgba(0,0,0,0)",
						0.2,
						"rgba(103,169,207,0.6)",
						0.4,
						"rgba(209,229,240,0.7)",
						0.6,
						"rgba(253,219,199,0.8)",
						0.8,
						"rgba(239,138,98,0.9)",
						1,
						"rgba(178,24,43,1)",
					],
					"heatmap-radius": radius,
					"heatmap-opacity": 0.8,
				},
			});

			// Add circle layer for zoom in
			mapRef.current.addLayer({
				id: "workers-point",
				type: "circle",
				source: "workers",
				minzoom: 14,
				paint: {
					"circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 4, 16, 8],
					"circle-color": "#f97316",
					"circle-stroke-color": "white",
					"circle-stroke-width": 1,
					"circle-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 1],
				},
			});

			setMapLoaded(true);
		});

		return () => {
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Update heatmap intensity
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;
		if (mapRef.current.getLayer("workers-heat")) {
			mapRef.current.setPaintProperty("workers-heat", "heatmap-intensity", intensity);
		}
	}, [intensity, mapLoaded]);

	// Update heatmap radius
	useEffect(() => {
		if (!mapRef.current || !mapLoaded) return;
		if (mapRef.current.getLayer("workers-heat")) {
			mapRef.current.setPaintProperty("workers-heat", "heatmap-radius", radius);
		}
	}, [radius, mapLoaded]);

	// Update map style
	const handleMapStyleChange = (newStyle: string) => {
		setMapStyle(newStyle);
		if (mapRef.current) {
			mapRef.current.setStyle(newStyle);
			// Re-add layers after style change
			mapRef.current.once("style.load", () => {
				if (!mapRef.current) return;

				// Re-add source
				if (!mapRef.current.getSource("workers")) {
					mapRef.current.addSource("workers", {
						type: "geojson",
						data: {
							type: "FeatureCollection",
							features: workerLocationData.map((point) => ({
								type: "Feature" as const,
								properties: {weight: point.weight},
								geometry: {
									type: "Point" as const,
									coordinates: [point.lng, point.lat],
								},
							})),
						},
					});
				}

				// Re-add heatmap layer
				if (!mapRef.current.getLayer("workers-heat")) {
					mapRef.current.addLayer({
						id: "workers-heat",
						type: "heatmap",
						source: "workers",
						maxzoom: 17,
						paint: {
							"heatmap-weight": ["get", "weight"],
							"heatmap-intensity": intensity,
							"heatmap-color": [
								"interpolate",
								["linear"],
								["heatmap-density"],
								0,
								"rgba(0,0,0,0)",
								0.2,
								"rgba(103,169,207,0.6)",
								0.4,
								"rgba(209,229,240,0.7)",
								0.6,
								"rgba(253,219,199,0.8)",
								0.8,
								"rgba(239,138,98,0.9)",
								1,
								"rgba(178,24,43,1)",
							],
							"heatmap-radius": radius,
							"heatmap-opacity": 0.8,
						},
					});
				}

				// Re-add circle layer
				if (!mapRef.current.getLayer("workers-point")) {
					mapRef.current.addLayer({
						id: "workers-point",
						type: "circle",
						source: "workers",
						minzoom: 14,
						paint: {
							"circle-radius": ["interpolate", ["linear"], ["zoom"], 14, 4, 16, 8],
							"circle-color": "#f97316",
							"circle-stroke-color": "white",
							"circle-stroke-width": 1,
							"circle-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, 1],
						},
					});
				}
			});
		}
	};

	return (
		<div className="wwc:relative wwc:h-full wwc:w-full wwc:rounded-lg wwc:overflow-hidden">
			<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />

			{/* Map Controls */}
			<div className="wwc:absolute wwc:top-3 wwc:left-3 wwc:flex wwc:gap-1 wwc:z-10">
				{/* Map Style Selector */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" icon className="wwc:bg-background/90 wwc:backdrop-blur-sm">
							<Layers className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="wwc:w-44">
						<DropdownMenuRadioGroup value={mapStyle} onValueChange={handleMapStyleChange}>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/outdoors-v12" className="wwc:text-xs">
								Outdoors
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/dark-v11" className="wwc:text-xs">
								Dark
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/light-v11" className="wwc:text-xs">
								Light
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/satellite-v9" className="wwc:text-xs">
								Satellite
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/satellite-streets-v12" className="wwc:text-xs">
								Satellite Streets
							</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="mapbox://styles/mapbox/streets-v12" className="wwc:text-xs">
								Streets
							</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Heatmap Settings */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" icon className="wwc:bg-background/90 wwc:backdrop-blur-sm">
							<Flame className="wwc:h-4 wwc:w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="wwc:w-56 wwc:p-3">
						<div className="wwc:space-y-4">
							<div className="wwc:space-y-2">
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<Label className="wwc:text-xs wwc:font-medium">Intensity</Label>
									<span className="wwc:text-xs wwc:text-muted-foreground">{intensity.toFixed(1)}</span>
								</div>
								<Slider
									value={[intensity]}
									onValueChange={([val]) => setIntensity(val)}
									min={0.5}
									max={3}
									step={0.1}
									className="wwc:w-full"
								/>
							</div>
							<div className="wwc:space-y-2">
								<div className="wwc:flex wwc:items-center wwc:justify-between">
									<Label className="wwc:text-xs wwc:font-medium">Radius</Label>
									<span className="wwc:text-xs wwc:text-muted-foreground">{radius}px</span>
								</div>
								<Slider
									value={[radius]}
									onValueChange={([val]) => setRadius(val)}
									min={10}
									max={50}
									step={1}
									className="wwc:w-full"
								/>
							</div>
						</div>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Zoom Controls */}
			<div className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:flex wwc:flex-col wwc:gap-1 wwc:z-10">
				<Button
					variant="outline"
					icon
					className="wwc:bg-background/90 wwc:backdrop-blur-sm"
					onClick={() => mapRef.current?.zoomIn()}
				>
					<Plus className="wwc:h-4 wwc:w-4" />
				</Button>
				<Button
					variant="outline"
					icon
					className="wwc:bg-background/90 wwc:backdrop-blur-sm"
					onClick={() => mapRef.current?.zoomOut()}
				>
					<Minus className="wwc:h-4 wwc:w-4" />
				</Button>
			</div>
		</div>
	);
}

/** Live workforce tracking with zone allocation, headcount analytics, and safety alerts. */
export function OrgWorkforceIntelligence({selectedOrg, addedWidgets = []}: OrgWorkforceIntelligenceProps) {
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update time every minute
	useEffect(() => {
		const interval = setInterval(() => setCurrentTime(new Date()), 60000);
		return () => clearInterval(interval);
	}, []);

	// Calculate summary stats
	const summaryStats = useMemo(() => {
		const totalWorkers = zoneDistributionData.reduce((acc, z) => acc + z.workers, 0);
		const totalCapacity = zoneDistributionData.reduce((acc, z) => acc + z.capacity, 0);
		const avgEfficiency =
			productivityTrendsData.reduce((acc, d) => acc + d.efficiency, 0) / productivityTrendsData.length;
		const criticalAlerts = activeAlerts.filter((a) => a.type === "critical").length;

		return {totalWorkers, totalCapacity, avgEfficiency, criticalAlerts};
	}, []);

	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			{/* Smart Filter Strip */}
			<CoreFilterStrip variant="workforce" />

			<div className="wwc:p-6 wwc:space-y-6">
				{/* Top KPI Cards - Live Workforce Stats */}
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:lg:grid-cols-6 wwc:gap-4">
					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<Users className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<div>
									<p className="wwc:text-2xl wwc:font-bold" style={{color: CHART_COLORS.chart4}}>
										{liveWorkforceData.total.toLocaleString()}
									</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">Total Workforce</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<HardHat className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<div>
									<p className="wwc:text-2xl wwc:font-bold wwc:text-green-600">
										{liveWorkforceData.checkedIn.toLocaleString()}
									</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">Checked In</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<Clock className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<div>
									<p className="wwc:text-2xl wwc:font-bold" style={{color: CHART_COLORS.chart3}}>
										{liveWorkforceData.onBreak}
									</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">On Break</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<MapPin className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<div>
									<p className="wwc:text-2xl wwc:font-bold" style={{color: CHART_COLORS.chart5}}>
										{liveWorkforceData.inTransit}
									</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">In Transit</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<CheckCircle2 className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								</div>
								<div>
									<p className="wwc:text-2xl wwc:font-bold wwc:text-green-600">{complianceData.ppeCompliance}%</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">PPE Compliance</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-4">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
									<ShieldAlert
										className={`wwc:h-4 wwc:w-4 ${summaryStats.criticalAlerts > 0 ? "wwc:text-red-600" : "wwc:text-muted-foreground"}`}
									/>
								</div>
								<div>
									<p
										className={`wwc:text-2xl wwc:font-bold ${summaryStats.criticalAlerts > 0 ? "wwc:text-red-600" : "wwc:text-green-600"}`}
									>
										{summaryStats.criticalAlerts}
									</p>
									<p className="wwc:text-xs wwc:text-muted-foreground">Critical Alerts</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Row 1: Heatmap & Zone Distribution */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-6">
					{/* Worker Distribution Heatmap */}
					<Card className="wwc:lg:col-span-1">
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<MapPin className="wwc:h-4 wwc:w-4" />
								Worker Distribution Heatmap
								<Badge variant="secondary" className="wwc:ml-auto wwc:text-xs">
									<Activity className="wwc:h-3 wwc:w-3" />
									Live
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="wwc:p-0">
							<div className="wwc:h-[320px] wwc:m-4 wwc:mt-0">
								<WorkforceHeatmap />
							</div>
						</CardContent>
					</Card>

					{/* Zone-wise Distribution */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<Users className="wwc:h-4 wwc:w-4" />
								Zone-wise Distribution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={{
									tooltip: {
										trigger: "axis",
										axisPointer: {type: "shadow"},
									},
									legend: {bottom: 0, textStyle: {fontSize: 11}},
									grid: {top: 10, right: 20, bottom: 35, left: 110},
									xAxis: {type: "value", axisLabel: {fontSize: 10}},
									yAxis: {
										type: "category",
										data: zoneDistributionData.map((d) => d.zone),
										axisLabel: {fontSize: 10},
									},
									series: [
										{
											name: "Capacity",
											type: "bar",
											data: zoneDistributionData.map((d) => d.capacity),
											itemStyle: {color: CHART_COLORS.muted, borderRadius: [0, 2, 2, 0]},
										},
										{
											name: "Workers",
											type: "bar",
											data: zoneDistributionData.map((d) => d.workers),
											itemStyle: {color: CHART_COLORS.chart3, borderRadius: [0, 2, 2, 0]},
										},
									],
								}}
								style={{height: 320}}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Row 2: Compliance & Productivity */}
				<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-3 wwc:gap-6">
					{/* Compliance Metrics */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<CheckCircle2 className="wwc:h-4 wwc:w-4" />
								Compliance Overview
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="wwc:space-y-4">
								<div className="wwc:space-y-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
										<span className="wwc:text-muted-foreground">PPE Compliance</span>
										<span
											className={`wwc:font-semibold ${complianceData.ppeCompliance >= 95 ? "wwc:text-green-600" : complianceData.ppeCompliance >= 90 ? "wwc:text-amber-600" : "wwc:text-red-600"}`}
										>
											{complianceData.ppeCompliance}%
										</span>
									</div>
									<div className="wwc:h-2 wwc:bg-muted wwc:rounded-full wwc:overflow-hidden">
										<div
											className={`wwc:h-full wwc:rounded-full ${complianceData.ppeCompliance >= 95 ? "wwc:bg-green-500" : complianceData.ppeCompliance >= 90 ? "wwc:bg-amber-500" : "wwc:bg-red-500"}`}
											style={{width: `${complianceData.ppeCompliance}%`}}
										/>
									</div>
								</div>

								<div className="wwc:space-y-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
										<span className="wwc:text-muted-foreground">Safety Training</span>
										<span className="wwc:font-semibold wwc:text-green-600">{complianceData.safetyTraining}%</span>
									</div>
									<div className="wwc:h-2 wwc:bg-muted wwc:rounded-full wwc:overflow-hidden">
										<div
											className="wwc:h-full wwc:bg-green-500 wwc:rounded-full"
											style={{width: `${complianceData.safetyTraining}%`}}
										/>
									</div>
								</div>

								<div className="wwc:space-y-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
										<span className="wwc:text-muted-foreground">Certifications</span>
										<span className="wwc:font-semibold wwc:text-green-600">{complianceData.certifications}%</span>
									</div>
									<div className="wwc:h-2 wwc:bg-muted wwc:rounded-full wwc:overflow-hidden">
										<div
											className="wwc:h-full wwc:bg-green-500 wwc:rounded-full"
											style={{width: `${complianceData.certifications}%`}}
										/>
									</div>
								</div>

								<div className="wwc:space-y-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:text-sm">
										<span className="wwc:text-muted-foreground">Work Permits</span>
										<span className="wwc:font-semibold wwc:text-green-600">{complianceData.workPermits}%</span>
									</div>
									<div className="wwc:h-2 wwc:bg-muted wwc:rounded-full wwc:overflow-hidden">
										<div
											className="wwc:h-full wwc:bg-green-500 wwc:rounded-full"
											style={{width: `${complianceData.workPermits}%`}}
										/>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Workforce by Trade */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<HardHat className="wwc:h-4 wwc:w-4" />
								Workforce by Trade
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={{
									tooltip: {trigger: "item", formatter: "{b}: {c} Workers"},
									series: [
										{
											type: "pie",
											radius: ["40%", "60%"],
											padAngle: 2,
											data: workforceByTradeData.map((d) => ({
												value: d.value,
												name: d.name,
												itemStyle: {color: d.color},
											})),
											label: {show: false},
										},
									],
								}}
								style={{height: 200}}
							/>
							<div className="wwc:grid wwc:grid-cols-3 wwc:gap-2 wwc:mt-2">
								{workforceByTradeData.map((trade) => (
									<div key={trade.name} className="wwc:flex wwc:items-center wwc:gap-1 wwc:text-xs">
										<div className="wwc:w-2 wwc:h-2 wwc:rounded-full" style={{backgroundColor: trade.color}} />
										<span className="wwc:text-muted-foreground">{trade.name}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Active Alerts */}
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<AlertTriangle className="wwc:h-4 wwc:w-4" />
								Active Alerts
								<Badge variant="secondary" className="wwc:ml-auto">
									{activeAlerts.length}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="wwc:p-0">
							<div className="wwc:max-h-[280px] wwc:overflow-auto">
								{activeAlerts.map((alert) => (
									<div
										key={alert.id}
										className="wwc:flex wwc:items-start wwc:gap-3 wwc:p-3 wwc:border-b wwc:last:border-b-0 wwc:hover:bg-muted/50"
									>
										<Badge variant={getAlertBadgeVariant(alert.type)} className="wwc:mt-0.5 wwc:text-xs wwc:shrink-0">
											{alert.type}
										</Badge>
										<div className="wwc:flex-1 wwc:min-w-0">
											<p className="wwc:text-sm">{alert.message}</p>
											<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">
												{alert.zone} • {alert.time}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Row 3: Productivity Trends */}
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
							<TrendingUp className="wwc:h-4 wwc:w-4" />
							Weekly Productivity Trends
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
								legend: {bottom: 0, textStyle: {fontSize: 11}},
								grid: {top: 10, right: 50, bottom: 40, left: 50},
								xAxis: {
									type: "category",
									data: productivityTrendsData.map((d) => d.date),
									axisLabel: {fontSize: 11},
									axisLine: {show: false},
									axisTick: {show: false},
								},
								yAxis: [
									{
										type: "value",
										axisLabel: {fontSize: 11},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {lineStyle: {type: "dashed"}},
									},
									{
										type: "value",
										min: 95,
										max: 105,
										axisLabel: {fontSize: 11},
										axisLine: {show: false},
										axisTick: {show: false},
										splitLine: {show: false},
									},
								],
								series: [
									{
										name: "Planned Workforce",
										type: "bar",
										yAxisIndex: 0,
										data: productivityTrendsData.map((d) => d.planned),
										itemStyle: {color: CHART_COLORS.chart1, borderRadius: [4, 4, 0, 0]},
										barWidth: 30,
									},
									{
										name: "Actual Workforce",
										type: "bar",
										yAxisIndex: 0,
										data: productivityTrendsData.map((d) => d.actual),
										itemStyle: {color: CHART_COLORS.chart3, borderRadius: [4, 4, 0, 0]},
										barWidth: 30,
									},
									{
										name: "Efficiency %",
										type: "line",
										yAxisIndex: 1,
										data: productivityTrendsData.map((d) => d.efficiency),
										smooth: true,
										lineStyle: {width: 2, color: CHART_COLORS.chart5},
										itemStyle: {color: CHART_COLORS.chart5},
										symbol: "circle",
										symbolSize: 8,
									},
								],
							}}
							style={{height: 280}}
						/>
						<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:justify-center wwc:gap-6 wwc:text-xs">
							<div className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:text-muted-foreground">Avg Efficiency:</span>
								<span className="wwc:font-semibold wwc:text-green-600">{summaryStats.avgEfficiency.toFixed(1)}%</span>
							</div>
							<div className="wwc:flex wwc:items-center wwc:gap-1">
								<span className="wwc:text-muted-foreground">Capacity Utilization:</span>
								<span className="wwc:font-semibold">
									{((summaryStats.totalWorkers / summaryStats.totalCapacity) * 100).toFixed(1)}%
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Zone Capacity Table */}
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle className="wwc:text-base">Zone Capacity Summary</CardTitle>
					</CardHeader>
					<CardContent className="wwc:p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="wwc:w-[180px]">Zone</TableHead>
									<TableHead>Project</TableHead>
									<TableHead className="wwc:text-center">Workers</TableHead>
									<TableHead className="wwc:text-center">Capacity</TableHead>
									<TableHead className="wwc:text-center">Utilization</TableHead>
									<TableHead className="wwc:text-center">Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{zoneDistributionData.map((zone) => {
									const utilization = (zone.workers / zone.capacity) * 100;
									return (
										<TableRow key={zone.zone}>
											<TableCell className="wwc:font-medium">{zone.zone}</TableCell>
											<TableCell className="wwc:text-muted-foreground">{zone.project}</TableCell>
											<TableCell className="wwc:text-center">{zone.workers}</TableCell>
											<TableCell className="wwc:text-center">{zone.capacity}</TableCell>
											<TableCell className="wwc:text-center">
												<span
													className={`wwc:font-semibold ${utilization >= 90 ? "wwc:text-red-600" : utilization >= 75 ? "wwc:text-amber-600" : "wwc:text-green-600"}`}
												>
													{utilization.toFixed(0)}%
												</span>
											</TableCell>
											<TableCell className="wwc:text-center">
												{utilization >= 90 ? (
													<Badge variant="destructive" className="wwc:text-xs">
														Near Capacity
													</Badge>
												) : utilization >= 75 ? (
													<Badge variant="secondary" className="wwc:text-xs">
														High
													</Badge>
												) : (
													<Badge variant="default" className="wwc:text-xs wwc:bg-green-600">
														Normal
													</Badge>
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

				{/* AI-Generated Charts - added at the tail */}
				{addedWidgets.length > 0 && (
					<div className="wwc:grid wwc:grid-cols-1 wwc:lg:grid-cols-2 wwc:gap-6">
						{addedWidgets.map((widget) => (
							<Card key={widget.id}>
								<CardHeader className="wwc:pb-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between">
										<CardTitle className="wwc:text-sm wwc:font-medium">{widget.title}</CardTitle>
										<Badge variant="secondary" className="wwc:text-xs">
											AI Generated
										</Badge>
									</div>
								</CardHeader>
								<CardContent>
									<ChartRenderer chartData={widget.chartData!} height={280} />
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* Data Sources Footer */}
				<div className="wwc:text-xs wwc:text-muted-foreground wwc:text-center wwc:pb-4">
					{selectedOrg.name} • Last updated: {currentTime.toLocaleTimeString()} • Data sources: Core IoT Sensors •
					Refresh: Real-time
				</div>
			</div>
		</div>
	);
}
