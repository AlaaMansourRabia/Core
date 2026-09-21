import {type ColumnDef} from "@tanstack/react-table";
import {
	ArrowUp,
	ArrowDown,
	Minus,
	Users,
	Clock,
	AlertTriangle,
	CheckCircle2,
	MoreHorizontal,
	Maximize2,
	SlidersHorizontal,
} from "lucide-react";
import {useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {CopyButton} from "@/components/ui/copy-button";
import {DataTable, DataTableColumnHeader} from "@/components/ui/data-table";
import {FullscreenExitButton} from "@/components/ui/fullscreen-exit-button";
import {CoreFilterStrip} from "@/components/ui/navigation/core-filter-strip";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";

// ── KPICard (same as in CardPage) ──

function KPICard({
	title,
	value,
	unit,
	subtitle,
	trend,
	trendLabel,
	icon: Icon,
	status,
}: {
	title: string;
	value: string | number;
	unit?: string;
	subtitle?: string;
	trend?: "up" | "down" | "stable";
	trendLabel?: string;
	icon?: React.ElementType;
	status?: "success" | "warning" | "danger";
}) {
	const statusColors = {
		success: "wwc:text-green-600",
		warning: "wwc:text-amber-600",
		danger: "wwc:text-red-600",
	};

	return (
		<Card>
			<CardContent className="wwc:p-4">
				<div className="wwc:flex wwc:items-start wwc:justify-between">
					<div className="wwc:space-y-1">
						<p className="wwc:text-xs wwc:text-muted-foreground">{title}</p>
						<div className="wwc:flex wwc:items-baseline wwc:gap-1">
							<span className={`wwc:text-2xl wwc:font-bold ${status ? statusColors[status] : "wwc:text-foreground"}`}>
								{value}
							</span>
							{unit && <span className="wwc:text-sm wwc:text-muted-foreground">{unit}</span>}
						</div>
						{subtitle && <p className="wwc:text-xs wwc:text-muted-foreground">{subtitle}</p>}
						{(trend || trendLabel) && (
							<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:pt-1">
								{trend === "up" && <ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />}
								{trend === "down" && <ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />}
								{trend === "stable" && <Minus className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />}
								{trendLabel && (
									<span
										className={`wwc:text-xs ${
											trend === "up"
												? "wwc:text-green-600"
												: trend === "down"
													? "wwc:text-red-600"
													: "wwc:text-muted-foreground"
										}`}
									>
										{trendLabel}
									</span>
								)}
							</div>
						)}
					</div>
					{Icon && (
						<div className="wwc:rounded-lg wwc:bg-muted wwc:p-2">
							<Icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Table Data ──

type Worker = {
	id: string;
	name: string;
	role: string;
	zone: string;
	hoursToday: number;
	status: "active" | "idle" | "offsite";
	lastSeen: string;
	compliance: number;
};

const WORKERS: Worker[] = [
	{
		id: "W-001",
		name: "Mohammed Al-Qahtani",
		role: "Electrician",
		zone: "Zone A",
		hoursToday: 7.5,
		status: "active",
		lastSeen: "2 min ago",
		compliance: 98,
	},
	{
		id: "W-002",
		name: "Ahmed Hassan",
		role: "Welder",
		zone: "Zone B",
		hoursToday: 6.2,
		status: "active",
		lastSeen: "5 min ago",
		compliance: 95,
	},
	{
		id: "W-003",
		name: "Ali Al-Rashid",
		role: "Safety Officer",
		zone: "Zone A",
		hoursToday: 8.0,
		status: "active",
		lastSeen: "1 min ago",
		compliance: 100,
	},
	{
		id: "W-004",
		name: "Omar Farouk",
		role: "Pipe Fitter",
		zone: "Zone C",
		hoursToday: 4.1,
		status: "idle",
		lastSeen: "32 min ago",
		compliance: 87,
	},
	{
		id: "W-005",
		name: "Khalid Ibrahim",
		role: "Crane Operator",
		zone: "Zone B",
		hoursToday: 7.8,
		status: "active",
		lastSeen: "1 min ago",
		compliance: 92,
	},
	{
		id: "W-006",
		name: "Saeed Al-Dosari",
		role: "Electrician",
		zone: "Zone A",
		hoursToday: 0,
		status: "offsite",
		lastSeen: "Yesterday",
		compliance: 91,
	},
	{
		id: "W-007",
		name: "Faisal Nasser",
		role: "Scaffolder",
		zone: "Zone D",
		hoursToday: 5.9,
		status: "active",
		lastSeen: "8 min ago",
		compliance: 88,
	},
	{
		id: "W-008",
		name: "Youssef Tarek",
		role: "Welder",
		zone: "Zone C",
		hoursToday: 7.2,
		status: "active",
		lastSeen: "3 min ago",
		compliance: 96,
	},
	{
		id: "W-009",
		name: "Nabil Mansour",
		role: "Safety Officer",
		zone: "Zone B",
		hoursToday: 8.0,
		status: "active",
		lastSeen: "Just now",
		compliance: 100,
	},
	{
		id: "W-010",
		name: "Hassan Adel",
		role: "Pipe Fitter",
		zone: "Zone A",
		hoursToday: 3.5,
		status: "idle",
		lastSeen: "45 min ago",
		compliance: 82,
	},
	{
		id: "W-011",
		name: "Tariq Al-Malki",
		role: "Crane Operator",
		zone: "Zone D",
		hoursToday: 6.8,
		status: "active",
		lastSeen: "4 min ago",
		compliance: 94,
	},
	{
		id: "W-012",
		name: "Majed Al-Shehri",
		role: "Scaffolder",
		zone: "Zone C",
		hoursToday: 0,
		status: "offsite",
		lastSeen: "2 days ago",
		compliance: 79,
	},
];

const statusConfig = {
	active: {label: "Active", variant: "default" as const},
	idle: {label: "Idle", variant: "secondary" as const},
	offsite: {label: "Offsite", variant: "outline" as const},
};

const columns: ColumnDef<Worker>[] = [
	{
		id: "select",
		header: ({table}) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({row}) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: ({column}) => <DataTableColumnHeader column={column} title="ID" />,
		cell: ({row}) => <span className="wwc:font-mono wwc:text-muted-foreground">{row.getValue("id")}</span>,
	},
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({row}) => <span className="wwc:font-medium">{row.getValue("name")}</span>,
	},
	{
		accessorKey: "role",
		header: ({column}) => <DataTableColumnHeader column={column} title="Role" />,
	},
	{
		accessorKey: "zone",
		header: ({column}) => <DataTableColumnHeader column={column} title="Zone" />,
	},
	{
		accessorKey: "hoursToday",
		header: ({column}) => <DataTableColumnHeader column={column} title="Hours" />,
		cell: ({row}) => {
			const hours = row.getValue("hoursToday") as number;
			return <span className={hours === 0 ? "wwc:text-muted-foreground" : ""}>{hours}h</span>;
		},
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({row}) => {
			const status = row.getValue("status") as keyof typeof statusConfig;
			const config = statusConfig[status];
			return <Badge variant={config.variant}>{config.label}</Badge>;
		},
	},
	{
		accessorKey: "compliance",
		header: ({column}) => <DataTableColumnHeader column={column} title="Compliance" />,
		cell: ({row}) => {
			const value = row.getValue("compliance") as number;
			return (
				<span className={value >= 95 ? "wwc:text-green-600" : value >= 85 ? "wwc:text-amber-600" : "wwc:text-red-600"}>
					{value}%
				</span>
			);
		},
	},
	{
		accessorKey: "lastSeen",
		header: "Last Seen",
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.getValue("lastSeen")}</span>,
	},
	{
		id: "actions",
		cell: () => (
			<Button variant="ghost" icon>
				<MoreHorizontal />
			</Button>
		),
	},
];

// ── Component ──

export function ContentDashboardPage() {
	const [, setFilters] = useState<Record<string, unknown>>({});
	const [fullscreen, setFullscreen] = useState(false);
	const [filtersOpen, setFiltersOpen] = useState(false);

	return (
		<div
			className={fullscreen ? "wwc:fixed wwc:inset-0 wwc:z-50 wwc:bg-background wwc:overflow-y-auto" : "wwc:space-y-8"}
		>
			{!fullscreen && (
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<div>
						<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
							<h1 className="wwc:text-3xl wwc:font-bold">Content Dashboard</h1>
							<CopyButton
								value="Content Dashboard"
								className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
							/>
						</div>
						<p className="wwc:text-muted-foreground wwc:mt-2">
							Example content page with tab navigation, KPI cards, filter strip, and a data table.
						</p>
					</div>
					<Button variant="outline" size="sm" onClick={() => setFullscreen(true)}>
						<Maximize2 /> Fullscreen
					</Button>
				</div>
			)}

			<div
				className={
					fullscreen ? "" : "wwc:border wwc:border-border wwc:rounded-xl wwc:overflow-hidden wwc:bg-background"
				}
			>
				{/* ── Tabs Strip (rounded) ── */}
				<Tabs defaultValue="workforce" className="wwc:w-full">
					<div className="wwc:border-b wwc:border-border wwc:px-6 wwc:py-3">
						<TabsList>
							<TabsTrigger value="workforce">Workforce</TabsTrigger>
							<TabsTrigger value="observations">Observations</TabsTrigger>
							<TabsTrigger value="compliance">Compliance</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="workforce" className="wwc:m-0">
						{/* ── KPI Row ── */}
						<div className="wwc:p-6 wwc:pb-0">
							<div className="wwc:grid wwc:grid-cols-4 wwc:gap-4">
								<KPICard title="Total Workforce" value="4,287" trend="up" trendLabel="+142 today" icon={Users} />
								<KPICard title="Avg. Hours/Day" value="8.4" unit="h" trend="up" trendLabel="+0.3h" icon={Clock} />
								<KPICard
									title="Open Observations"
									value={23}
									trend="down"
									trendLabel="-8%"
									icon={AlertTriangle}
									status="warning"
								/>
								<KPICard
									title="Compliance Rate"
									value="94.2"
									unit="%"
									trend="up"
									trendLabel="+2.1%"
									icon={CheckCircle2}
									status="success"
								/>
							</div>
						</div>

						{/* ── Data Table with filter toggle ── */}
						<div className="wwc:px-6 wwc:pb-6">
							<DataTable
								columns={columns}
								data={WORKERS}
								searchKey="name"
								searchPlaceholder="Search workers..."
								showPagination
								pageSize={8}
								showColumnToggle
								toolbarExtra={
									<Button
										variant={filtersOpen ? "secondary" : "outline"}
										size="sm"
										onClick={() => setFiltersOpen((v) => !v)}
										className="wwc:gap-1.5"
									>
										<SlidersHorizontal className="wwc:h-3.5 wwc:w-3.5" />
										Filters
									</Button>
								}
								filterStrip={
									filtersOpen ? <CoreFilterStrip variant="workforce" size="sm" onFiltersChange={setFilters} /> : null
								}
								bulkActions={[
									{label: "Export", onClick: () => {}},
									{label: "Assign Zone", onClick: () => {}},
									{label: "Remove", variant: "destructive", onClick: () => {}},
								]}
							/>
						</div>
					</TabsContent>

					<TabsContent value="observations" className="wwc:m-0">
						<div className="wwc:p-6 wwc:flex wwc:items-center wwc:justify-center wwc:h-[400px]">
							<p className="wwc:text-muted-foreground wwc:text-[13px]">Observations content goes here</p>
						</div>
					</TabsContent>

					<TabsContent value="compliance" className="wwc:m-0">
						<div className="wwc:p-6 wwc:flex wwc:items-center wwc:justify-center wwc:h-[400px]">
							<p className="wwc:text-muted-foreground wwc:text-[13px]">Compliance content goes here</p>
						</div>
					</TabsContent>
				</Tabs>
			</div>
			{fullscreen && <FullscreenExitButton onExit={() => setFullscreen(false)} />}
		</div>
	);
}
