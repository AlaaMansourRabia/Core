import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	Calendar,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	MapPin,
	Minus,
	Search,
	Users,
	X,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import {useEffect, useRef, useState} from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import {Badge} from "../badge";
import {Button} from "../button";
import {Card} from "../card";
import {getProjectsByOrg} from "../data/mock-data";
import {Input} from "../input";
import {KPIBar} from "../kpi-bar";
import {MapControls} from "../map-controls";
import {MAPBOX_TOKEN} from "../mapbox-token";
import {Progress} from "../progress";
import {
	PushPanel,
	PushPanelContainer,
	PushPanelContent,
	PushPanelHeader,
	PushPanelHeaderActions,
	PushPanelHeaderTitle,
	PushPanelMain,
	PushPanelProvider,
	PushPanelTitle,
	PushPanelTrigger,
	usePushPanel,
} from "../push-panel";
import {ScrollArea} from "../scroll-area";
import {Separator} from "../separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Organization, Project} from "../types";

// Floating expand button for LEFT panel (shows on left side when collapsed)
function FloatingExpandButtonLeft() {
	const {open} = usePushPanel();

	if (open) return null;

	return (
		<PushPanelTrigger asChild>
			<Button
				variant="outline"
				icon
				className="wwc:absolute wwc:left-3 wwc:top-1/2 wwc:-translate-y-1/2 wwc:z-10 wwc:h-10 wwc:w-10 wwc:rounded-full wwc:bg-background wwc:shadow-md"
			>
				<ChevronRight className="wwc:h-5 wwc:w-5" />
			</Button>
		</PushPanelTrigger>
	);
}

// Hook to resize map when panel state changes
function useMapResize(mapRef: React.MutableRefObject<mapboxgl.Map | null>) {
	const {open} = usePushPanel();

	useEffect(() => {
		const timer = setTimeout(() => {
			mapRef.current?.resize();
		}, 350);

		return () => clearTimeout(timer);
	}, [open, mapRef]);
}

// Map resize component (must be inside PushPanelProvider)
function MapResizeHandler({mapRef}: {mapRef: React.MutableRefObject<mapboxgl.Map | null>}) {
	useMapResize(mapRef);
	return null;
}

// Get status icon - using Wakecore chart colors
function StatusIcon({status}: {status?: string}) {
	switch (status) {
		case "on-track":
			return <CheckCircle2 className="wwc:h-4 wwc:w-4" style={{color: "var(--chart-1)"}} />;
		case "at-risk":
			return <AlertTriangle className="wwc:h-4 wwc:w-4" style={{color: "var(--chart-4)"}} />;
		case "delayed":
			return <Clock className="wwc:h-4 wwc:w-4 wwc:text-destructive" />;
		default:
			return null;
	}
}

// Get status badge variant
function getStatusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
	switch (status) {
		case "on-track":
			return "default";
		case "at-risk":
			return "secondary";
		case "delayed":
			return "destructive";
		default:
			return "outline";
	}
}

// Project Details Panel
interface ProjectDetailsPanelProps {
	project: Project;
	onClose: () => void;
	onOpenProject?: (project: Project) => void;
}

function ProjectDetailsPanel({project, onClose, onOpenProject}: ProjectDetailsPanelProps) {
	return (
		<>
			<div className="wwc:flex wwc:items-center wwc:justify-between wwc:gap-2 wwc:px-4 wwc:h-14 wwc:border-b wwc:shrink-0">
				<h3 className="wwc:text-base wwc:font-semibold wwc:text-foreground wwc:truncate">Project Details</h3>
				<Button variant="ghost" icon className="wwc:shrink-0" onClick={onClose}>
					<X className="wwc:h-4 wwc:w-4" />
				</Button>
			</div>
			<PushPanelContent className="wwc:p-0">
				<ScrollArea className="wwc:h-full">
					<div className="wwc:space-y-6 wwc:p-4">
						{/* Project Header */}
						<div className="wwc:space-y-4">
							{/* Thumbnail */}
							<div className="wwc:aspect-video wwc:w-full wwc:overflow-hidden wwc:rounded-lg wwc:bg-muted">
								{project.thumbnail ? (
									<img src={project.thumbnail} alt={project.name} className="wwc:h-full wwc:w-full wwc:object-cover" />
								) : (
									<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center">
										<span className="wwc:text-4xl wwc:font-bold wwc:text-muted-foreground">
											{project.name.charAt(0)}
										</span>
									</div>
								)}
							</div>

							{/* Title and Status */}
							<div>
								<h2 className="wwc:text-lg wwc:font-semibold">{project.name}</h2>
								<div className="wwc:mt-2 wwc:flex wwc:items-center wwc:gap-2">
									<Badge variant={getStatusBadgeVariant(project.status)}>
										<StatusIcon status={project.status} />
										<span className="wwc:ml-1 wwc:capitalize">{project.status?.replace("-", " ") || "Unknown"}</span>
									</Badge>
								</div>
							</div>

							{/* Description */}
							{project.description && <p className="wwc:text-sm wwc:text-muted-foreground">{project.description}</p>}

							{/* Open Project Button */}
							{onOpenProject && (
								<Button className="wwc:w-full" onClick={() => onOpenProject(project)}>
									Open Project
								</Button>
							)}
						</div>

						<Separator />

						{/* Readiness Progress */}
						<div className="wwc:space-y-3">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<span className="wwc:text-sm wwc:font-medium">Readiness</span>
								<span className="wwc:text-sm wwc:font-bold">{project.readiness || 0}%</span>
							</div>
							<Progress value={project.readiness || 0} className="wwc:h-2" />
						</div>

						<Separator />

						{/* Tabs for more details */}
						<Tabs defaultValue="overview" className="wwc:w-full">
							<TabsList className="wwc:w-full">
								<TabsTrigger value="overview" className="wwc:flex-1">
									Overview
								</TabsTrigger>
								<TabsTrigger value="team" className="wwc:flex-1">
									Team
								</TabsTrigger>
								<TabsTrigger value="timeline" className="wwc:flex-1">
									Timeline
								</TabsTrigger>
							</TabsList>

							<TabsContent value="overview" className="wwc:mt-4 wwc:space-y-4">
								{/* Location */}
								{project.coordinates && (
									<Card className="wwc:p-3">
										<div className="wwc:flex wwc:items-start wwc:gap-3">
											<MapPin className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
											<div>
												<p className="wwc:text-sm wwc:font-medium">Location</p>
												<p className="wwc:text-xs wwc:text-muted-foreground">
													{project.coordinates[1].toFixed(4)}°N, {project.coordinates[0].toFixed(4)}°E
												</p>
											</div>
										</div>
									</Card>
								)}

								{/* Quick Stats */}
								<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
									<Card className="wwc:p-3">
										<p className="wwc:text-xs wwc:text-muted-foreground">Phase</p>
										<p className="wwc:text-sm wwc:font-medium">Construction</p>
									</Card>
									<Card className="wwc:p-3">
										<p className="wwc:text-xs wwc:text-muted-foreground">Priority</p>
										<p className="wwc:text-sm wwc:font-medium">High</p>
									</Card>
								</div>
							</TabsContent>

							<TabsContent value="team" className="wwc:mt-4 wwc:space-y-4">
								<Card className="wwc:p-3">
									<div className="wwc:flex wwc:items-start wwc:gap-3">
										<Users className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
										<div>
											<p className="wwc:text-sm wwc:font-medium">Project Team</p>
											<p className="wwc:text-xs wwc:text-muted-foreground">12 members assigned</p>
										</div>
									</div>
								</Card>
								<div className="wwc:space-y-2">
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:rounded-md wwc:border wwc:p-2">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<div className="wwc:h-8 wwc:w-8 wwc:rounded-full wwc:bg-primary/10 wwc:flex wwc:items-center wwc:justify-center wwc:text-xs wwc:font-medium">
												PM
											</div>
											<div>
												<p className="wwc:text-sm wwc:font-medium">Project Manager</p>
												<p className="wwc:text-xs wwc:text-muted-foreground">Ahmed Al-Rashid</p>
											</div>
										</div>
									</div>
									<div className="wwc:flex wwc:items-center wwc:justify-between wwc:rounded-md wwc:border wwc:p-2">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<div className="wwc:h-8 wwc:w-8 wwc:rounded-full wwc:bg-primary/10 wwc:flex wwc:items-center wwc:justify-center wwc:text-xs wwc:font-medium">
												LE
											</div>
											<div>
												<p className="wwc:text-sm wwc:font-medium">Lead Engineer</p>
												<p className="wwc:text-xs wwc:text-muted-foreground">Sarah Johnson</p>
											</div>
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="timeline" className="wwc:mt-4 wwc:space-y-4">
								<Card className="wwc:p-3">
									<div className="wwc:flex wwc:items-start wwc:gap-3">
										<Calendar className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
										<div>
											<p className="wwc:text-sm wwc:font-medium">Timeline</p>
											<p className="wwc:text-xs wwc:text-muted-foreground">Q1 2024 - Q4 2026</p>
										</div>
									</div>
								</Card>
								<div className="wwc:space-y-3">
									<div className="wwc:flex wwc:gap-3">
										<div className="wwc:flex wwc:flex-col wwc:items-center">
											<div className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-chart-1" />
											<div className="wwc:h-full wwc:w-px wwc:bg-border" />
										</div>
										<div className="wwc:pb-4">
											<p className="wwc:text-sm wwc:font-medium">Design Phase</p>
											<p className="wwc:text-xs wwc:text-muted-foreground">Completed - Q1 2024</p>
										</div>
									</div>
									<div className="wwc:flex wwc:gap-3">
										<div className="wwc:flex wwc:flex-col wwc:items-center">
											<div className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-primary" />
											<div className="wwc:h-full wwc:w-px wwc:bg-border" />
										</div>
										<div className="wwc:pb-4">
											<p className="wwc:text-sm wwc:font-medium">Construction</p>
											<p className="wwc:text-xs wwc:text-muted-foreground">In Progress - Q2 2024</p>
										</div>
									</div>
									<div className="wwc:flex wwc:gap-3">
										<div className="wwc:flex wwc:flex-col wwc:items-center">
											<div className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-muted" />
										</div>
										<div>
											<p className="wwc:text-sm wwc:font-medium">Completion</p>
											<p className="wwc:text-xs wwc:text-muted-foreground">Target - Q4 2026</p>
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</ScrollArea>
			</PushPanelContent>
		</>
	);
}

// KPI Strip - Horizontal Portfolio Overview
// Right Panel Content - shows Project Details with animation
interface RightPanelContentProps {
	selectedProject: Project | null;
	onCloseDetails: () => void;
	onOpenProject?: (project: Project) => void;
}

function RightPanelContent({selectedProject, onCloseDetails, onOpenProject}: RightPanelContentProps) {
	const [displayedProject, setDisplayedProject] = useState<Project | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (selectedProject !== displayedProject) {
			// Start fade out
			setIsAnimating(true);

			// After fade out, switch content and fade in
			const timer = setTimeout(() => {
				setDisplayedProject(selectedProject);
				setIsAnimating(false);
			}, 150);

			return () => clearTimeout(timer);
		}
	}, [selectedProject, displayedProject]);

	if (!displayedProject) return null;

	return (
		<div
			className={`wwc:h-full wwc:flex wwc:flex-col wwc:transition-opacity wwc:duration-150 wwc:ease-in-out ${
				isAnimating ? "wwc:opacity-0" : "wwc:opacity-100"
			}`}
		>
			<ProjectDetailsPanel project={displayedProject} onClose={onCloseDetails} onOpenProject={onOpenProject} />
		</div>
	);
}

interface OrgOverviewProps {
	selectedOrg: Organization;
	onOpenProject?: (project: Project) => void;
}

/** Organization dashboard with project cards, interactive map, and KPI summary. */
export function OrgOverview({selectedOrg, onOpenProject}: OrgOverviewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/outdoors-v12");
	const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<Project | null>(null);
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);

	const projects = getProjectsByOrg(selectedOrg.id);

	// KPI bar aggregates (mapped into KPIBar groups below)
	const totalSafetyAlerts = projects.reduce((acc, p) => acc + (p.safetyAlerts || 0), 0);

	const filteredProjects = projects.filter(
		(project) =>
			project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Qiddiya City coordinates (from Google Maps)
	const mapCenter: [number, number] = [46.31, 24.585];
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	// Handle project selection - show details in right panel
	const handleProjectSelect = (project: Project) => {
		setSelectedProjectForDetails(project);

		// Fly to project location on map
		if (project.coordinates && mapRef.current) {
			mapRef.current.flyTo({
				center: project.coordinates,
				zoom: 15,
				duration: 1500,
			});
		}
	};

	// Close project details
	const handleCloseDetails = () => {
		setSelectedProjectForDetails(null);
	};

	// Get short name for marker label
	const getShortName = (name: string): string => {
		const shortcuts: Record<string, string> = {
			"Six Flags Qiddiya City": "Six Flags",
			"Aquarabia Qiddiya City": "Aquarabia",
			"Gaming & Esports District": "Gaming",
			"Speed Park Track": "Speed Park",
			"Prince Mohammed bin Salman Stadium": "Stadium",
			"Qiddiya City Golf Course": "Golf",
			"Mercedes-AMG World of Performance": "AMG",
			"Performing Arts Centre": "Arts Centre",
			"Playmaker Studios": "Studios",
		};
		return shortcuts[name] || name.split(" ")[0];
	};

	// Get computed CSS variable value
	const getCssVariable = (varName: string): string => {
		return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	};

	// Get marker color based on project schedule health status
	const getMarkerColor = (project: Project): string => {
		switch (project.scheduleHealth) {
			case "on-track":
				return getCssVariable("--chart-1") || "#22c55e"; // green fallback
			case "at-risk":
				return getCssVariable("--chart-4") || "#f97316"; // orange fallback
			case "critical":
				return getCssVariable("--destructive") || "#ef4444"; // red fallback
			default:
				return getCssVariable("--chart-1") || "#22c55e";
		}
	};

	// Initialize map
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapStyle,
			center: mapCenter,
			zoom: 6, // Start zoomed out
		});

		// Add markers after map loads, then animate to fit all projects
		mapRef.current.on("load", () => {
			addMarkers(true); // Pass flag to trigger animation
		});

		return () => {
			// Clean up markers
			markersRef.current.forEach((marker) => marker.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	// Add markers function
	const addMarkers = (animateToFit = false) => {
		if (!mapRef.current) return;

		// Clear existing markers
		markersRef.current.forEach((marker) => marker.remove());
		markersRef.current = [];

		// Collect bounds from all project coordinates
		const bounds = new mapboxgl.LngLatBounds();

		// Add marker for each project with coordinates
		projects.forEach((project) => {
			if (!project.coordinates || !mapRef.current) return;

			const shortName = getShortName(project.name);
			const color = getMarkerColor(project);

			// Extend bounds to include this marker
			bounds.extend(project.coordinates);

			// Create custom marker element
			const el = document.createElement("div");
			el.className = "custom-marker";
			el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${color};
          color: black;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          white-space: nowrap;
          transform: translate(-50%, -100%);
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: black;
            border-radius: 50%;
            flex-shrink: 0;
          "></div>
          ${shortName}
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid ${color};
          "></div>
        </div>
      `;

			// Add click handler to marker - show details instead of navigating
			el.addEventListener("click", () => {
				handleProjectSelect(project);
			});

			// Create and add marker
			const marker = new mapboxgl.Marker({element: el, anchor: "bottom"})
				.setLngLat(project.coordinates)
				.addTo(mapRef.current!);

			markersRef.current.push(marker);
		});

		// Fit map to show all markers with padding
		if (!bounds.isEmpty() && mapRef.current) {
			if (animateToFit) {
				// Delay the animation so user sees the zoomed-out view first
				setTimeout(() => {
					mapRef.current?.fitBounds(bounds, {
						padding: {top: 60, bottom: 40, left: 40, right: 40},
						maxZoom: 14,
						duration: 2000, // 2 second animation
					});
				}, 500); // Wait 500ms before starting animation
			} else {
				mapRef.current.fitBounds(bounds, {
					padding: {top: 60, bottom: 40, left: 40, right: 40},
					maxZoom: 14,
				});
			}
		}
	};

	// Update map style
	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.setStyle(mapStyle);
		}
	}, [mapStyle]);

	return (
		<PushPanelProvider defaultOpen={true} side="left">
			<MapResizeHandler mapRef={mapRef} />
			<PushPanelContainer className="wwc:h-[calc(100vh-8rem)]">
				{/* Main Content - KPI Strip + Map + Right Panel */}
				<PushPanelMain className="wwc:relative wwc:flex">
					{/* Floating Expand Button for Left panel */}
					<FloatingExpandButtonLeft />

					{/* Center content: KPI Strip + Map (both pushed by right panel) */}
					<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:min-w-0">
						{/* KPI Strip at the top */}
						<KPIBar
							groups={[
								[{value: projects.length, label: "Projects"}],
								[
									{
										value: projects.filter((p) => p.scheduleHealth === "on-track").length,
										label: "On Track",
										dot: "success",
										hideLabelBelow: "sm",
									},
									{
										value: projects.filter((p) => p.scheduleHealth === "at-risk").length,
										label: "At Risk",
										dot: "warning",
										hideLabelBelow: "sm",
									},
									{
										value: projects.filter((p) => p.scheduleHealth === "critical").length,
										label: "Critical",
										dot: "danger",
										hideLabelBelow: "sm",
									},
								],
								[
									{
										value: projects.reduce((acc, p) => acc + (p.workforceDensity || 0), 0).toLocaleString(),
										label: "on-site today",
										icon: Users,
										hideLabelBelow: "md",
									},
								],
								[
									{
										value: totalSafetyAlerts,
										label: "alerts (24h)",
										icon: AlertTriangle,
										tone: totalSafetyAlerts > 0 ? "danger" : "default",
										hideLabelBelow: "md",
									},
								],
							]}
						/>

						{/* Map Container */}
						<div className="wwc:relative wwc:flex-1 wwc:min-h-0">
							<div ref={mapContainerRef} className="wwc:h-full wwc:w-full" />
							{/* Map Controls */}
							<MapControls mapRef={mapRef} mapStyle={mapStyle} onMapStyleChange={setMapStyle} />
						</div>
					</div>

					{/* Right Panel - Project Details (only when project selected) */}
					{selectedProjectForDetails && (
						<div className="wwc:w-[320px] wwc:border-l wwc:bg-background wwc:flex wwc:flex-col wwc:shrink-0">
							<RightPanelContent
								selectedProject={selectedProjectForDetails}
								onCloseDetails={handleCloseDetails}
								onOpenProject={onOpenProject}
							/>
						</div>
					)}
				</PushPanelMain>

				{/* Left Panel - Projects (collapsible) */}
				<PushPanel width={340} className="wwc:border-r">
					<div className="wwc:border-b">
						<PushPanelHeader className="wwc:border-b-0">
							<PushPanelHeaderTitle>
								<PushPanelTitle>Projects</PushPanelTitle>
								<Badge variant="secondary" className="wwc:ml-2">
									{filteredProjects.length}
								</Badge>
							</PushPanelHeaderTitle>
							<PushPanelHeaderActions>
								<PushPanelTrigger asChild>
									<Button variant="ghost" icon>
										<ChevronLeft className="wwc:h-4 wwc:w-4" />
									</Button>
								</PushPanelTrigger>
							</PushPanelHeaderActions>
						</PushPanelHeader>
						<div className="wwc:px-4 wwc:pb-3">
							<div className="wwc:relative">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
								<Input
									placeholder="Search projects..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="wwc:h-9 wwc:pl-9"
								/>
							</div>
						</div>
					</div>
					<PushPanelContent className="wwc:p-0">
						<ScrollArea className="wwc:h-full">
							<div className="wwc:space-y-3 wwc:p-4">
								{filteredProjects.map((project) => (
									<Card
										key={project.id}
										className={`wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md ${
											selectedProjectForDetails?.id === project.id ? "wwc:ring-2 wwc:ring-primary" : ""
										}`}
										onClick={() => handleProjectSelect(project)}
									>
										<div className="wwc:p-3 wwc:space-y-3">
											{/* Top section: Photo + Title + Description */}
											<div className="wwc:flex wwc:gap-3">
												{/* Thumbnail */}
												<div className="wwc:h-16 wwc:w-24 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
													{project.thumbnail ? (
														<img
															src={project.thumbnail}
															alt={project.name}
															className="wwc:h-full wwc:w-full wwc:object-cover"
														/>
													) : (
														<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-muted">
															<span className="wwc:text-lg wwc:font-bold wwc:text-muted-foreground">
																{project.name.charAt(0)}
															</span>
														</div>
													)}
												</div>
												{/* Title + Description */}
												<div className="wwc:min-w-0 wwc:flex-1">
													<h3 className="wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:line-clamp-1">
														{project.name}
													</h3>
													{project.description && (
														<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground wwc:line-clamp-2">
															{project.description}
														</p>
													)}
												</div>
											</div>

											{/* KPIs Row */}
											<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-2 wwc:border-t">
												{/* Schedule */}
												<div className="wwc:text-center">
													<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
														<span
															className={`wwc:text-sm wwc:font-bold ${
																project.scheduleHealth === "on-track"
																	? "wwc:text-green-600"
																	: project.scheduleHealth === "at-risk"
																		? "wwc:text-amber-600"
																		: "wwc:text-red-600"
															}`}
														>
															{project.schedulePercent}%
														</span>
														{project.scheduleHealth === "on-track" ? (
															<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
														) : project.scheduleHealth === "at-risk" ? (
															<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
														) : (
															<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
														)}
													</div>
													<p className="wwc:text-[10px] wwc:text-muted-foreground">Schedule</p>
												</div>
												{/* Cost - CPI */}
												<div className="wwc:text-center">
													<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
														<span
															className={`wwc:text-sm wwc:font-bold ${
																project.costHealth === "on-track"
																	? "wwc:text-green-600"
																	: project.costHealth === "at-risk"
																		? "wwc:text-amber-600"
																		: "wwc:text-red-600"
															}`}
														>
															{project.cpi?.toFixed(2) || "1.00"}
														</span>
														{project.costHealth === "on-track" ? (
															<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
														) : project.costHealth === "at-risk" ? (
															<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
														) : (
															<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
														)}
													</div>
													<p className="wwc:text-[10px] wwc:text-muted-foreground">CPI</p>
												</div>
												{/* Safety - LTI Free Days */}
												<div className="wwc:text-center">
													<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
														<span
															className={`wwc:text-sm wwc:font-bold ${
																project.safetyStatus === "safe"
																	? "wwc:text-green-600"
																	: project.safetyStatus === "warning"
																		? "wwc:text-amber-600"
																		: "wwc:text-red-600"
															}`}
														>
															{project.ltiFreeDay || 0}
														</span>
														{project.safetyStatus === "safe" ? (
															<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
														) : project.safetyStatus === "warning" ? (
															<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
														) : (
															<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
														)}
													</div>
													<p className="wwc:text-[10px] wwc:text-muted-foreground">LTI-Free</p>
												</div>
												{/* Workers */}
												<div className="wwc:text-center">
													<div className="wwc:flex wwc:items-center wwc:justify-center">
														<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">
															{project.workforceDensity?.toLocaleString() || 0}
														</span>
													</div>
													<p className="wwc:text-[10px] wwc:text-muted-foreground">Workers</p>
												</div>
											</div>
										</div>
									</Card>
								))}
							</div>
						</ScrollArea>
					</PushPanelContent>
				</PushPanel>
			</PushPanelContainer>
		</PushPanelProvider>
	);
}
