import {
	AlertTriangle,
	Building2,
	HardHat,
	Layers,
	MapPin,
	Maximize2,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	Search,
	TrendingUp,
	Users,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {useEffect, useRef, useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {Input} from "@/components/ui/input";
import {MAPBOX_TOKEN} from "@/components/ui/map-controls";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";

// ─── KPI Data ────────────────────────────────────────────────────────────────

const KPI_CARDS = [
	{label: "Total Workers", value: "1,247", change: "+12%", icon: Users, color: "wwc:text-blue-600"},
	{label: "Active Sites", value: "18", change: "+2", icon: Building2, color: "wwc:text-emerald-600"},
	{label: "Safety Score", value: "94.2%", change: "+1.8%", icon: HardHat, color: "wwc:text-amber-600"},
	{label: "Open Incidents", value: "7", change: "-3", icon: AlertTriangle, color: "wwc:text-red-500"},
];

// ─── Site List Data ──────────────────────────────────────────────────────────

const SITES = [
	{
		id: "s1",
		name: "Riyadh HQ Tower",
		status: "active",
		workers: 342,
		coordinates: [46.6753, 24.7136] as [number, number],
	},
	{
		id: "s2",
		name: "Jeddah Waterfront",
		status: "active",
		workers: 198,
		coordinates: [39.1925, 21.4858] as [number, number],
	},
	{id: "s3", name: "NEOM Bay Phase 1", status: "active", workers: 267, coordinates: [35.0, 27.95] as [number, number]},
	{
		id: "s4",
		name: "Dammam Industrial",
		status: "warning",
		workers: 156,
		coordinates: [50.1033, 26.4207] as [number, number],
	},
	{
		id: "s5",
		name: "Jubail Refinery Exp.",
		status: "active",
		workers: 89,
		coordinates: [49.6225, 27.0046] as [number, number],
	},
	{
		id: "s6",
		name: "Yanbu Cement Plant",
		status: "inactive",
		workers: 0,
		coordinates: [38.0618, 24.0895] as [number, number],
	},
	{
		id: "s7",
		name: "Abha Mountain Resort",
		status: "active",
		workers: 74,
		coordinates: [42.5053, 18.2164] as [number, number],
	},
	{
		id: "s8",
		name: "Tabuk Solar Farm",
		status: "active",
		workers: 45,
		coordinates: [36.5998, 28.3835] as [number, number],
	},
	{
		id: "s9",
		name: "Mecca Ring Road",
		status: "warning",
		workers: 112,
		coordinates: [39.8579, 21.3891] as [number, number],
	},
	{
		id: "s10",
		name: "Medina Metro Line",
		status: "active",
		workers: 203,
		coordinates: [39.6142, 24.5247] as [number, number],
	},
];

// ─── Legend Data ─────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
	{color: "#22c55e", label: "Active", count: 8},
	{color: "#f59e0b", label: "Warning", count: 2},
	{color: "#94a3b8", label: "Inactive", count: 1},
];

// ─── Right Panel Details ─────────────────────────────────────────────────────

const DETAIL_SECTIONS = [
	{label: "Zone A — Foundation", progress: 85, workers: 42},
	{label: "Zone B — Structural", progress: 62, workers: 38},
	{label: "Zone C — MEP", progress: 34, workers: 27},
	{label: "Zone D — Finishing", progress: 12, workers: 15},
];

// ─── Component ───────────────────────────────────────────────────────────────

export function MapDashboardPage() {
	const [fullscreen, setFullscreen] = useState(false);
	const [leftOpen, setLeftOpen] = useState(true);
	const [rightOpen, setRightOpen] = useState(true);
	const [selectedSite, setSelectedSite] = useState(SITES[0]);
	const [siteSearch, setSiteSearch] = useState("");
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const markersRef = useRef<mapboxgl.Marker[]>([]);

	const filteredSites = SITES.filter((s) => s.name.toLowerCase().includes(siteSearch.toLowerCase()));

	const statusColor = (status: string) =>
		status === "active"
			? "wwc:bg-emerald-500"
			: status === "warning"
				? "wwc:bg-amber-500"
				: "wwc:bg-muted-foreground/40";

	// ── Map init ──
	useEffect(() => {
		if (!mapContainerRef.current || mapRef.current) return;

		mapboxgl.accessToken = MAPBOX_TOKEN;

		mapRef.current = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: "mapbox://styles/mapbox/dark-v11",
			center: [45.0792, 23.8859],
			zoom: 5,
		});

		mapRef.current.on("load", () => {
			addMarkers();
		});

		return () => {
			markersRef.current.forEach((m) => m.remove());
			markersRef.current = [];
			mapRef.current?.remove();
			mapRef.current = null;
		};
	}, []);

	function addMarkers() {
		markersRef.current.forEach((m) => m.remove());
		markersRef.current = [];

		SITES.forEach((site) => {
			const el = document.createElement("div");
			el.style.width = "14px";
			el.style.height = "14px";
			el.style.borderRadius = "50%";
			el.style.border = "2px solid #fff";
			el.style.cursor = "pointer";
			el.style.background = site.status === "active" ? "#22c55e" : site.status === "warning" ? "#f59e0b" : "#94a3b8";

			const popup = new mapboxgl.Popup({offset: 15}).setHTML(
				`<div style="padding:4px"><strong style="font-size:13px">${site.name}</strong><p style="margin:4px 0 0;font-size:12px;color:#888">${site.workers} workers</p></div>`,
			);

			const marker = new mapboxgl.Marker({element: el})
				.setLngLat(site.coordinates)
				.setPopup(popup)
				.addTo(mapRef.current!);

			el.addEventListener("click", () => {
				setSelectedSite(site);
				if (!rightOpen) setRightOpen(true);
			});

			markersRef.current.push(marker);
		});
	}

	// Fly to selected site
	useEffect(() => {
		if (mapRef.current && selectedSite) {
			mapRef.current.flyTo({center: selectedSite.coordinates, zoom: 8, duration: 1200});
		}
	}, [selectedSite]);

	// Resize map when panels toggle or fullscreen changes
	useEffect(() => {
		const timer = setTimeout(() => mapRef.current?.resize(), 250);
		return () => clearTimeout(timer);
	}, [leftOpen, rightOpen, fullscreen]);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<h1 className="wwc:text-3xl wwc:font-bold">Map Dashboard</h1>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Fixed Content #4 layout with KPI cards (top), interactive map (middle), and legend/details (bottom).
							Collapsible site list and detail inspector panels on left and right.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={`wwc:overflow-hidden wwc:flex ${fullscreen ? "wwc:h-screen" : "wwc:border wwc:rounded-xl wwc:h-[700px]"}`}
			>
				{/* ── Left Panel: Site List ── */}
				<div
					className={`wwc:border-r wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden ${leftOpen ? "wwc:w-[280px]" : "wwc:w-0 wwc:border-r-0"}`}
				>
					<div className="wwc:h-full wwc:flex wwc:flex-col wwc:min-w-[280px]">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:pt-4 wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<Layers className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
								<h3 className="wwc:text-sm wwc:font-semibold">Sites</h3>
							</div>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={() => setLeftOpen(false)}>
								<PanelLeftClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
						<div className="wwc:px-4 wwc:pb-3">
							<div className="wwc:relative">
								<Search className="wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:-translate-y-1/2 wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground" />
								<Input
									placeholder="Search sites..."
									value={siteSearch}
									onChange={(e) => setSiteSearch(e.target.value)}
									className="wwc:pl-8 wwc:h-8 wwc:text-[13px]"
								/>
							</div>
						</div>
						<Separator />
						<ScrollArea className="wwc:flex-1">
							<div className="wwc:p-2 wwc:space-y-0.5">
								{filteredSites.map((site) => (
									<button
										key={site.id}
										type="button"
										onClick={() => setSelectedSite(site)}
										className={`wwc:w-full wwc:flex wwc:items-center wwc:gap-3 wwc:px-3 wwc:py-2.5 wwc:rounded-lg wwc:text-left wwc:transition-colors ${
											selectedSite.id === site.id ? "wwc:bg-accent wwc:text-accent-foreground" : "wwc:hover:bg-muted/50"
										}`}
									>
										<span
											className={`wwc:h-2 wwc:w-2 wwc:rounded-full wwc:flex-shrink-0 ${statusColor(site.status)}`}
										/>
										<div className="wwc:flex-1 wwc:min-w-0">
											<p className="wwc:text-[13px] wwc:font-medium wwc:truncate">{site.name}</p>
											<p className="wwc:text-[11px] wwc:text-muted-foreground">{site.workers} workers</p>
										</div>
										<MapPin className="wwc:h-3.5 wwc:w-3.5 wwc:text-muted-foreground/50 wwc:flex-shrink-0" />
									</button>
								))}
							</div>
						</ScrollArea>
					</div>
				</div>

				{/* ── Middle Panel (B): Top / Middle / Bottom ── */}
				<div className="wwc:flex-1 wwc:flex wwc:flex-col wwc:bg-background wwc:min-w-0">
					{/* Panel B header with toggle buttons */}
					<div className="wwc:flex wwc:items-center wwc:gap-2 wwc:px-4 wwc:py-2 wwc:border-b">
						{!leftOpen && (
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
								onClick={() => setLeftOpen(true)}
							>
								<PanelLeftOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
						<div className="wwc:flex wwc:items-center wwc:gap-2">
							<MapPin className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
							<span className="wwc:text-sm wwc:font-semibold">Map Dashboard</span>
						</div>
						<div className="wwc:flex-1" />
						{!rightOpen && (
							<Button
								variant="ghost"
								icon
								className="wwc:h-7 wwc:w-7 wwc:flex-shrink-0"
								onClick={() => setRightOpen(true)}
							>
								<PanelRightOpen className="wwc:h-4 wwc:w-4" />
							</Button>
						)}
					</div>

					{/* Panel B — Top: KPI Cards */}
					<div className="wwc:border-b wwc:px-4 wwc:py-3 wwc:flex-shrink-0">
						<div className="wwc:grid wwc:grid-cols-4 wwc:gap-3">
							{KPI_CARDS.map((kpi) => (
								<div key={kpi.label} className="wwc:rounded-lg wwc:border wwc:p-3">
									<div className="wwc:flex wwc:items-center wwc:justify-between">
										<div>
											<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
												{kpi.label}
											</p>
											<p className="wwc:text-xl wwc:font-bold wwc:mt-0.5">{kpi.value}</p>
										</div>
										<div className={`wwc:rounded-md wwc:bg-muted wwc:p-2 ${kpi.color}`}>
											<kpi.icon className="wwc:h-4 wwc:w-4" />
										</div>
									</div>
									<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:mt-1.5">
										<TrendingUp className="wwc:h-3 wwc:w-3 wwc:text-emerald-500" />
										<span className="wwc:text-[11px] wwc:font-medium wwc:text-emerald-600">{kpi.change}</span>
										<span className="wwc:text-[10px] wwc:text-muted-foreground">vs last month</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Panel B — Middle: Map */}
					<div className="wwc:flex-[8] wwc:border-b wwc:relative wwc:min-h-0">
						<div ref={mapContainerRef} className="wwc:absolute wwc:inset-0" />
					</div>

					{/* Panel B — Bottom: Legend & Details */}
					<div className="wwc:flex-shrink-0 wwc:px-4 wwc:py-3">
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<div className="wwc:flex wwc:items-center wwc:gap-5">
								<span className="wwc:text-[11px] wwc:font-semibold wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
									Legend
								</span>
								{LEGEND_ITEMS.map((item) => (
									<div key={item.label} className="wwc:flex wwc:items-center wwc:gap-1.5">
										<span
											className="wwc:h-2.5 wwc:w-2.5 wwc:rounded-full wwc:flex-shrink-0"
											style={{background: item.color}}
										/>
										<span className="wwc:text-[12px] wwc:text-foreground">{item.label}</span>
										<Badge variant="secondary" className="wwc:text-[10px] wwc:px-1.5 wwc:py-0 wwc:h-4">
											{item.count}
										</Badge>
									</div>
								))}
							</div>
							<div className="wwc:flex wwc:items-center wwc:gap-4 wwc:text-[11px] wwc:text-muted-foreground">
								<span>
									Showing <span className="wwc:font-medium wwc:text-foreground">{SITES.length}</span> sites
								</span>
								<span>
									Total workers:{" "}
									<span className="wwc:font-medium wwc:text-foreground">
										{SITES.reduce((sum, s) => sum + s.workers, 0).toLocaleString()}
									</span>
								</span>
								<span>
									Selected: <span className="wwc:font-medium wwc:text-foreground">{selectedSite.name}</span>
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ── Right Panel: Detail Inspector ── */}
				<div
					className={`wwc:border-l wwc:bg-background wwc:flex-shrink-0 wwc:transition-[width] wwc:duration-200 wwc:ease-in-out wwc:overflow-hidden ${rightOpen ? "wwc:w-[300px]" : "wwc:w-0 wwc:border-l-0"}`}
				>
					<div className="wwc:h-full wwc:flex wwc:flex-col wwc:min-w-[300px]">
						<div className="wwc:flex wwc:items-center wwc:justify-between wwc:px-4 wwc:pt-4 wwc:pb-2">
							<h3 className="wwc:text-sm wwc:font-semibold">Site Details</h3>
							<Button variant="ghost" icon className="wwc:h-7 wwc:w-7" onClick={() => setRightOpen(false)}>
								<PanelRightClose className="wwc:h-4 wwc:w-4" />
							</Button>
						</div>
						<Separator />
						<ScrollArea className="wwc:flex-1">
							<div className="wwc:p-4 wwc:space-y-5">
								{/* Site summary */}
								<div className="wwc:space-y-2">
									<h4 className="wwc:text-[13px] wwc:font-semibold">{selectedSite.name}</h4>
									<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3">
										<div className="wwc:rounded-lg wwc:border wwc:p-3">
											<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
												Workers
											</p>
											<p className="wwc:text-lg wwc:font-bold wwc:mt-0.5">{selectedSite.workers}</p>
										</div>
										<div className="wwc:rounded-lg wwc:border wwc:p-3">
											<p className="wwc:text-[10px] wwc:text-muted-foreground wwc:uppercase wwc:tracking-wider">
												Status
											</p>
											<div className="wwc:flex wwc:items-center wwc:gap-1.5 wwc:mt-1.5">
												<span className={`wwc:h-2 wwc:w-2 wwc:rounded-full ${statusColor(selectedSite.status)}`} />
												<span className="wwc:text-sm wwc:font-medium wwc:capitalize">{selectedSite.status}</span>
											</div>
										</div>
									</div>
								</div>

								<Separator />

								{/* Zone Progress */}
								<div className="wwc:space-y-3">
									<h4 className="wwc:text-[13px] wwc:font-semibold">Zone Progress</h4>
									{DETAIL_SECTIONS.map((section) => (
										<div key={section.label} className="wwc:space-y-1.5">
											<div className="wwc:flex wwc:items-center wwc:justify-between">
												<span className="wwc:text-[12px] wwc:font-medium">{section.label}</span>
												<span className="wwc:text-[11px] wwc:text-muted-foreground">{section.progress}%</span>
											</div>
											<div className="wwc:h-1.5 wwc:rounded-full wwc:bg-muted wwc:overflow-hidden">
												<div
													className="wwc:h-full wwc:rounded-full wwc:bg-blue-500 wwc:transition-all"
													style={{width: `${section.progress}%`}}
												/>
											</div>
											<p className="wwc:text-[11px] wwc:text-muted-foreground">{section.workers} workers assigned</p>
										</div>
									))}
								</div>

								<Separator />

								{/* Recent Activity */}
								<div className="wwc:space-y-3">
									<h4 className="wwc:text-[13px] wwc:font-semibold">Recent Activity</h4>
									<div className="wwc:space-y-2.5">
										{[
											{text: "Safety inspection completed", time: "2h ago", type: "success"},
											{text: "New permit issued for Zone C", time: "4h ago", type: "info"},
											{text: "Worker shift change logged", time: "6h ago", type: "info"},
											{text: "Equipment maintenance alert", time: "1d ago", type: "warning"},
										].map((activity) => (
											<div key={activity.text} className="wwc:flex wwc:gap-2.5">
												<span
													className={`wwc:mt-1.5 wwc:h-1.5 wwc:w-1.5 wwc:rounded-full wwc:flex-shrink-0 ${
														activity.type === "success"
															? "wwc:bg-emerald-500"
															: activity.type === "warning"
																? "wwc:bg-amber-500"
																: "wwc:bg-blue-500"
													}`}
												/>
												<div>
													<p className="wwc:text-[12px]">{activity.text}</p>
													<p className="wwc:text-[11px] wwc:text-muted-foreground">{activity.time}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</ScrollArea>
					</div>
				</div>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
