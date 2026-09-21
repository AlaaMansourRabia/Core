import {
	Box,
	Calendar,
	Camera,
	ChevronLeft,
	ChevronRight,
	Download,
	Eye,
	Layers,
	Maximize2,
	Plane,
	Play,
	Video,
} from "lucide-react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Project} from "../types";

interface ProjectRealityCaptureProps {
	project: Project;
}

// Camera thumbnail images
const cameraThumbnails = [
	"/images/camera-01.jpeg",
	"/images/camera-02.jpg",
	"/images/camera-03.jpg",
	"/images/camera-04.png",
	"/images/camera-05.webp",
	"/images/camera-06.jpg",
	"/images/camera-07.gif",
];

// Mock camera data for a single project
const projectCameras = [
	{
		id: "cam-1",
		name: "Main Entrance",
		zone: "Zone A",
		status: "online" as const,
		lastFrame: "2 mins ago",
		thumbnail: cameraThumbnails[0],
	},
	{
		id: "cam-2",
		name: "Tower Crane View",
		zone: "Zone B",
		status: "online" as const,
		lastFrame: "1 min ago",
		thumbnail: cameraThumbnails[1],
	},
	{
		id: "cam-3",
		name: "Foundation Area",
		zone: "Zone A",
		status: "online" as const,
		lastFrame: "3 mins ago",
		thumbnail: cameraThumbnails[2],
	},
	{
		id: "cam-4",
		name: "Material Yard",
		zone: "Zone D",
		status: "offline" as const,
		lastFrame: "2 hours ago",
		thumbnail: cameraThumbnails[3],
	},
	{
		id: "cam-5",
		name: "Steel Staging",
		zone: "Zone B",
		status: "online" as const,
		lastFrame: "1 min ago",
		thumbnail: cameraThumbnails[4],
	},
	{
		id: "cam-6",
		name: "MEP Corridor",
		zone: "Zone C",
		status: "online" as const,
		lastFrame: "4 mins ago",
		thumbnail: cameraThumbnails[5],
	},
];

// Drone capture thumbnail images
const droneThumbnails = [
	"/images/drone-01.webp",
	"/images/drone-02.avif",
	"/images/drone-03.jpg",
	"/images/drone-04.jpg",
	"/images/drone-05.jpg",
	"/images/drone-06.jpg",
	"/images/drone-07.jpg",
];

// Mock drone captures with comparison
const droneCaptures = [
	{
		id: "dc-1",
		date: "Jan 15, 2026",
		captureCount: 245,
		coverage: 98,
		hasComparison: true,
		thumbnail: droneThumbnails[0],
	},
	{
		id: "dc-2",
		date: "Jan 8, 2026",
		captureCount: 238,
		coverage: 96,
		hasComparison: true,
		thumbnail: droneThumbnails[1],
	},
	{
		id: "dc-3",
		date: "Jan 1, 2026",
		captureCount: 232,
		coverage: 95,
		hasComparison: true,
		thumbnail: droneThumbnails[2],
	},
	{
		id: "dc-4",
		date: "Dec 25, 2025",
		captureCount: 228,
		coverage: 94,
		hasComparison: false,
		thumbnail: droneThumbnails[3],
	},
];

// Mock 3D scans
const scans3D = [
	{id: "scan-1", name: "Level 1 Interior", date: "Jan 14, 2026", points: "2.4M", status: "complete"},
	{id: "scan-2", name: "Foundation As-Built", date: "Jan 10, 2026", points: "1.8M", status: "complete"},
	{id: "scan-3", name: "MEP Corridor Scan", date: "Jan 12, 2026", points: "890K", status: "processing"},
	{id: "scan-4", name: "Facade Progress", date: "Jan 13, 2026", points: "1.2M", status: "complete"},
];

function CameraCard({camera}: {camera: (typeof projectCameras)[0]}) {
	return (
		<div className="wwc:group wwc:rounded-lg wwc:border wwc:bg-card wwc:overflow-hidden">
			<div className="wwc:aspect-video wwc:relative wwc:bg-muted/50">
				{camera.status === "online" ? (
					<img
						src={camera.thumbnail}
						alt={camera.name}
						className="wwc:absolute wwc:inset-0 wwc:w-full wwc:h-full wwc:object-cover"
					/>
				) : (
					<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:text-muted-foreground wwc:bg-muted">
						<Camera className="wwc:h-8 wwc:w-8 wwc:mb-2 wwc:text-muted-foreground/30" />
						<span className="wwc:text-xs">No Signal</span>
					</div>
				)}
				{camera.status === "online" && (
					<Badge
						variant="outline"
						className="wwc:absolute wwc:top-2 wwc:left-2 wwc:bg-red-500/90 wwc:text-white wwc:border-red-500 wwc:text-xs"
					>
						<span className="wwc:w-1.5 wwc:h-1.5 wwc:rounded-full wwc:bg-white wwc:animate-pulse" />
						LIVE
					</Badge>
				)}
				<div className="wwc:absolute wwc:top-2 wwc:right-2 wwc:opacity-0 wwc:group-hover:opacity-100 wwc:transition-opacity">
					<Button icon variant="secondary" className="wwc:h-7 wwc:w-7">
						<Maximize2 className="wwc:h-3.5 wwc:w-3.5" />
					</Button>
				</div>
			</div>
			<div className="wwc:p-3">
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<span className="wwc:text-sm wwc:font-medium wwc:truncate">{camera.name}</span>
					<Badge
						variant="outline"
						className={`wwc:text-xs ${
							camera.status === "online"
								? "wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20"
								: "wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20"
						}`}
					>
						{camera.status}
					</Badge>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
					<span>{camera.zone}</span>
					<span>•</span>
					<span>{camera.lastFrame}</span>
				</div>
			</div>
		</div>
	);
}

function DroneComparisonCard({capture}: {capture: (typeof droneCaptures)[0]}) {
	return (
		<div className="wwc:rounded-lg wwc:border wwc:bg-card wwc:overflow-hidden">
			<div className="wwc:aspect-video wwc:relative wwc:bg-muted/50">
				{/* Drone capture thumbnail */}
				<img
					src={capture.thumbnail}
					alt={`Drone capture - ${capture.date}`}
					className="wwc:absolute wwc:inset-0 wwc:w-full wwc:h-full wwc:object-cover"
				/>
				{/* Comparison overlay */}
				{capture.hasComparison && (
					<>
						{/* Slider handle */}
						<div className="wwc:absolute wwc:top-1/2 wwc:left-1/2 wwc:-translate-x-1/2 wwc:-translate-y-1/2 wwc:w-8 wwc:h-8 wwc:rounded-full wwc:bg-white wwc:shadow-lg wwc:flex wwc:items-center wwc:justify-center wwc:cursor-ew-resize wwc:z-10">
							<div className="wwc:flex wwc:gap-0.5">
								<ChevronLeft className="wwc:h-3 wwc:w-3" />
								<ChevronRight className="wwc:h-3 wwc:w-3" />
							</div>
						</div>
					</>
				)}
				<Badge variant="outline" className="wwc:absolute wwc:top-2 wwc:left-2 wwc:bg-background/90 wwc:text-xs">
					<Calendar className="wwc:h-3 wwc:w-3" />
					{capture.date}
				</Badge>
			</div>
			<div className="wwc:p-3">
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div className="wwc:text-sm wwc:font-medium">{capture.captureCount} images</div>
					<Badge variant="outline" className="wwc:text-xs">
						{capture.coverage}% coverage
					</Badge>
				</div>
				<div className="wwc:flex wwc:gap-2 wwc:mt-2">
					<Button size="sm" variant="outline" className="wwc:flex-1 wwc:h-7 wwc:text-xs">
						<Eye className="wwc:h-3 wwc:w-3" />
						View
					</Button>
					<Button size="sm" variant="outline" className="wwc:flex-1 wwc:h-7 wwc:text-xs">
						<Download className="wwc:h-3 wwc:w-3" />
						Export
					</Button>
				</div>
			</div>
		</div>
	);
}

function Scan3DCard({scan}: {scan: (typeof scans3D)[0]}) {
	return (
		<div className="wwc:rounded-lg wwc:border wwc:bg-card wwc:overflow-hidden">
			<div className="wwc:aspect-video wwc:relative wwc:bg-muted/50">
				<div className="wwc:absolute wwc:inset-0 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:text-muted-foreground">
					<Box className="wwc:h-8 wwc:w-8 wwc:mb-2 wwc:opacity-50" />
					<span className="wwc:text-xs">{scan.points} points</span>
				</div>
				<Badge
					variant="outline"
					className={`wwc:absolute wwc:top-2 wwc:left-2 wwc:text-xs ${
						scan.status === "complete"
							? "wwc:bg-emerald-500/10 wwc:text-emerald-600 wwc:border-emerald-500/20"
							: "wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20"
					}`}
				>
					{scan.status === "processing" && (
						<span className="wwc:w-1.5 wwc:h-1.5 wwc:rounded-full wwc:bg-amber-500 wwc:animate-pulse" />
					)}
					{scan.status}
				</Badge>
			</div>
			<div className="wwc:p-3">
				<div className="wwc:text-sm wwc:font-medium wwc:truncate">{scan.name}</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
					<Calendar className="wwc:h-3 wwc:w-3" />
					<span>{scan.date}</span>
				</div>
				<div className="wwc:flex wwc:gap-2 wwc:mt-2">
					<Button
						size="sm"
						variant="outline"
						className="wwc:flex-1 wwc:h-7 wwc:text-xs"
						disabled={scan.status === "processing"}
					>
						<Layers className="wwc:h-3 wwc:w-3" />
						Open 3D
					</Button>
				</div>
			</div>
		</div>
	);
}

/** Project-level CCTV feeds, drone comparison, 3D scans, and time-lapse playback. */
export function ProjectRealityCapture({project}: ProjectRealityCaptureProps) {
	const camerasOnline = projectCameras.filter((c) => c.status === "online").length;
	const totalCameras = projectCameras.length;

	return (
		<div className="wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:p-6 wwc:space-y-6">
				{/* Header */}
				<div>
					<h1 className="wwc:text-2xl wwc:font-semibold">Reality Capture</h1>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mt-1">
						Live site monitoring, drone captures, and 3D scanning for {project.name}
					</p>
				</div>

				{/* KPI Strip */}
				<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-4">
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Camera className="wwc:h-4 wwc:w-4" />
								Cameras Online
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:text-2xl wwc:font-bold">
								{camerasOnline} / {totalCameras}
							</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">
								{Math.round((camerasOnline / totalCameras) * 100)}% operational
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Plane className="wwc:h-4 wwc:w-4" />
								Latest Drone Capture
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:text-2xl wwc:font-bold">Jan 15</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">245 images, 98% coverage</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Box className="wwc:h-4 wwc:w-4" />
								3D Scans
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:text-2xl wwc:font-bold">4</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">1 processing, 3 complete</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
								<Video className="wwc:h-4 wwc:w-4" />
								Time-lapse Ready
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:text-2xl wwc:font-bold">12</div>
							<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">Last updated: 2 hours ago</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Content */}
				<Tabs defaultValue="live" className="wwc:space-y-4">
					<TabsList>
						<TabsTrigger value="live">Live CCTV</TabsTrigger>
						<TabsTrigger value="drone">Drone Comparison</TabsTrigger>
						<TabsTrigger value="3d">3D Scans</TabsTrigger>
						<TabsTrigger value="timelapse">Time-lapse</TabsTrigger>
					</TabsList>

					{/* Live CCTV Tab */}
					<TabsContent value="live" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-3">
							{projectCameras.map((camera) => (
								<CameraCard key={camera.id} camera={camera} />
							))}
						</div>
					</TabsContent>

					{/* Drone Comparison Tab */}
					<TabsContent value="drone" className="wwc:space-y-4">
						<Card className="wwc:mb-4">
							<CardHeader>
								<CardTitle className="wwc:text-base">Progress Comparison</CardTitle>
								<CardDescription>Compare drone captures over time using the slider</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:aspect-[21/9] wwc:rounded-lg wwc:bg-muted/50 wwc:flex wwc:items-center wwc:justify-center wwc:text-muted-foreground">
									<div className="wwc:text-center">
										<Plane className="wwc:h-12 wwc:w-12 wwc:mx-auto wwc:mb-2 wwc:opacity-50" />
										<p className="wwc:text-sm">Select two captures below to compare</p>
									</div>
								</div>
							</CardContent>
						</Card>
						<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-4">
							{droneCaptures.map((capture) => (
								<DroneComparisonCard key={capture.id} capture={capture} />
							))}
						</div>
					</TabsContent>

					{/* 3D Scans Tab */}
					<TabsContent value="3d" className="wwc:space-y-4">
						<div className="wwc:grid wwc:gap-4 wwc:md:grid-cols-2 wwc:lg:grid-cols-4">
							{scans3D.map((scan) => (
								<Scan3DCard key={scan.id} scan={scan} />
							))}
						</div>
					</TabsContent>

					{/* Time-lapse Tab */}
					<TabsContent value="timelapse" className="wwc:space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="wwc:text-base">Project Time-lapse</CardTitle>
								<CardDescription>Visual progress from project start to current date</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="wwc:aspect-video wwc:rounded-lg wwc:bg-muted/50 wwc:flex wwc:flex-col wwc:items-center wwc:justify-center wwc:text-muted-foreground">
									<Video className="wwc:h-12 wwc:w-12 wwc:mb-2 wwc:opacity-50" />
									<p className="wwc:text-sm wwc:mb-4">Main Construction Time-lapse</p>
									<div className="wwc:flex wwc:items-center wwc:gap-2">
										<Button size="sm" variant="outline">
											<ChevronLeft className="wwc:h-4 wwc:w-4" />
										</Button>
										<Button size="sm" variant="default">
											<Play className="wwc:h-4 wwc:w-4" />
											Play
										</Button>
										<Button size="sm" variant="outline">
											<ChevronRight className="wwc:h-4 wwc:w-4" />
										</Button>
									</div>
								</div>
								<div className="wwc:flex wwc:items-center wwc:justify-between wwc:mt-4 wwc:text-sm wwc:text-muted-foreground">
									<span>Nov 1, 2025</span>
									<div className="wwc:flex-1 wwc:mx-4 wwc:h-1 wwc:bg-muted wwc:rounded-full wwc:overflow-hidden">
										<div className="wwc:h-full wwc:w-1/3 wwc:bg-primary wwc:rounded-full" />
									</div>
									<span>Jan 15, 2026</span>
								</div>
								<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-4 wwc:mt-4 wwc:text-xs wwc:text-muted-foreground">
									<span>Duration: 76 days</span>
									<span>•</span>
									<span>Frames: 2,432</span>
									<span>•</span>
									<span>Camera: Main Entrance</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
