import ReactECharts from "echarts-for-react";
import {
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	CheckCircle2,
	Clock,
	Loader2,
	Minus,
	UserX,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@wakecap/core-ui/badge";
import { Banner } from "@wakecap/core-ui/banner";
import { Button } from "@wakecap/core-ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@wakecap/core-ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@wakecap/core-ui/table";

// ── KPICard ──

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
		success: "text-green-600",
		warning: "text-amber-600",
		danger: "text-red-600",
	};

	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<p className="text-xs text-muted-foreground">{title}</p>
						<div className="flex items-baseline gap-1">
							<span className={`text-2xl font-bold ${status ? statusColors[status] : "text-foreground"}`}>
								{value}
							</span>
							{unit && <span className="text-sm text-muted-foreground">{unit}</span>}
						</div>
						{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
						{(trend || trendLabel) && (
							<div className="flex items-center gap-1 pt-1">
								{trend === "up" && <ArrowUp className="h-3 w-3 text-green-600" />}
								{trend === "down" && <ArrowDown className="h-3 w-3 text-red-600" />}
								{trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
								{trendLabel && (
									<span
										className={`text-xs ${
											trend === "up"
												? "text-green-600"
												: trend === "down"
													? "text-red-600"
													: "text-muted-foreground"
										}`}
									>
										{trendLabel}
									</span>
								)}
							</div>
						)}
					</div>
					{Icon && (
						<div className="rounded-lg bg-muted p-2">
							<Icon className="h-4 w-4 text-muted-foreground" />
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Contractor Data ──

type Contractor = {
	name: string;
	resolutionRate: number;
	open: number;
	overdue: number;
	total: number;
	avgResolutionHours: number;
	breakdown: { category: string; count: number }[];
};

const CONTRACTORS: Contractor[] = [
	{
		name: "Sinohydro",
		resolutionRate: 12,
		open: 12,
		overdue: 5,
		total: 14,
		avgResolutionHours: 96,
		breakdown: [
			{ category: "Salary", count: 9 },
			{ category: "Safety", count: 2 },
			{ category: "Living Conditions", count: 2 },
			{ category: "Other", count: 1 },
		],
	},
	{
		name: "Samsung C&T",
		resolutionRate: 45,
		open: 6,
		overdue: 2,
		total: 11,
		avgResolutionHours: 48,
		breakdown: [
			{ category: "Safety", count: 4 },
			{ category: "Salary", count: 3 },
			{ category: "Transport", count: 2 },
			{ category: "Other", count: 2 },
		],
	},
	{
		name: "Al-Rashid",
		resolutionRate: 78,
		open: 3,
		overdue: 1,
		total: 14,
		avgResolutionHours: 24,
		breakdown: [
			{ category: "Living Conditions", count: 5 },
			{ category: "Salary", count: 4 },
			{ category: "Safety", count: 3 },
			{ category: "Other", count: 2 },
		],
	},
	{
		name: "Nesma",
		resolutionRate: 85,
		open: 2,
		overdue: 0,
		total: 13,
		avgResolutionHours: 18,
		breakdown: [
			{ category: "Salary", count: 5 },
			{ category: "Transport", count: 4 },
			{ category: "Living Conditions", count: 3 },
			{ category: "Other", count: 1 },
		],
	},
	{
		name: "Consolidated",
		resolutionRate: 92,
		open: 1,
		overdue: 0,
		total: 12,
		avgResolutionHours: 12,
		breakdown: [
			{ category: "Safety", count: 4 },
			{ category: "Salary", count: 3 },
			{ category: "Living Conditions", count: 3 },
			{ category: "Other", count: 2 },
		],
	},
	{
		name: "El Seif",
		resolutionRate: 95,
		open: 1,
		overdue: 0,
		total: 18,
		avgResolutionHours: 8,
		breakdown: [
			{ category: "Living Conditions", count: 6 },
			{ category: "Safety", count: 5 },
			{ category: "Salary", count: 4 },
			{ category: "Other", count: 3 },
		],
	},
];

const SORTED_CONTRACTORS = [...CONTRACTORS].sort((a, b) => a.resolutionRate - b.resolutionRate);

const CATEGORY_TOTALS = CONTRACTORS.reduce<Record<string, number>>((acc, c) => {
	for (const b of c.breakdown) {
		acc[b.category] = (acc[b.category] || 0) + b.count;
	}
	return acc;
}, {});
const CATEGORY_DATA = Object.entries(CATEGORY_TOTALS).sort((a, b) => b[1] - a[1]);

// ── Recent & Important Complaints ──

type RecentComplaint = {
	id: string;
	worker: string;
	category: string;
	severity: "high" | "medium" | "low";
	status: "New" | "Assigned" | "Investigating" | "Waiting" | "Resolved";
	sla: "overdue" | "due-soon" | "on-track";
	owner: string;
	priority: number;
};

const RECENT_COMPLAINTS: RecentComplaint[] = [
	{ id: "WC-000041", worker: "Md. Fazlul", category: "Salary", severity: "high", status: "New", sla: "overdue", owner: "Unassigned", priority: 1 },
	{ id: "WC-000038", worker: "Ahmed Raza", category: "Safety", severity: "high", status: "Assigned", sla: "overdue", owner: "Sinohydro", priority: 2 },
	{ id: "WC-000045", worker: "Ali Hussain", category: "Accommodation", severity: "high", status: "New", sla: "due-soon", owner: "Unassigned", priority: 3 },
	{ id: "WC-000032", worker: "Kamal Hossain", category: "Salary", severity: "medium", status: "New", sla: "due-soon", owner: "Unassigned", priority: 4 },
	{ id: "WC-000044", worker: "Raju Miah", category: "Food", severity: "medium", status: "Investigating", sla: "on-track", owner: "Samsung C&T", priority: 5 },
	{ id: "WC-000039", worker: "Noor Islam", category: "Transport", severity: "low", status: "Assigned", sla: "on-track", owner: "Nesma", priority: 6 },
	{ id: "WC-000047", worker: "Jamal Uddin", category: "Salary", severity: "high", status: "Waiting", sla: "due-soon", owner: "Al-Rashid", priority: 7 },
];

function getResolutionColor(rate: number) {
	if (rate >= 80) return "#22c55e";
	if (rate >= 40) return "#eab308";
	return "#ef4444";
}

// ── Component ──

export default function App() {
	const [bannerDismissed, setBannerDismissed] = useState(false);
	const [selectedName, setSelectedName] = useState<string | null>(null);

	const toggleFilter = (name: string) => {
		setSelectedName((prev) => (prev === name ? null : name));
	};

	const selectedContractor = selectedName ? (CONTRACTORS.find((c) => c.name === selectedName) ?? null) : null;

	const dim = (name: string) => (selectedName && selectedName !== name ? 0.15 : 1);

	const performanceOption = useMemo(
		() => ({
			tooltip: {
				trigger: "axis",
				axisPointer: { type: "shadow" },
				formatter: (params: unknown) => {
					const items = params as { dataIndex: number }[];
					const c = CONTRACTORS[items[0].dataIndex];
					return `<b>${c.name}</b><br/>Resolution: ${c.resolutionRate}%<br/>Open: ${c.open}<br/>Overdue: ${c.overdue}`;
				},
			},
			legend: {
				data: [
					{ name: "Low (<40%)", itemStyle: { color: "#ef4444" } },
					{ name: "Medium (40-80%)", itemStyle: { color: "#eab308" } },
					{ name: "High (>80%)", itemStyle: { color: "#22c55e" } },
				],
				bottom: 0,
				left: "center",
				itemWidth: 10,
				itemHeight: 10,
				textStyle: { fontSize: 11 },
			},
			grid: { left: "3%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
			xAxis: {
				type: "category",
				data: CONTRACTORS.map((c) => c.name),
				axisLabel: { rotate: 45, interval: 0 },
			},
			yAxis: {
				type: "value",
				max: 100,
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: "Low (<40%)",
					type: "bar",
					stack: "rate",
					data: CONTRACTORS.map((c) => ({
						value: c.resolutionRate < 40 ? c.resolutionRate : 0,
						itemStyle: { color: "#ef4444", opacity: dim(c.name) },
					})),
					barMaxWidth: 48,
					label: {
						show: true,
						position: "inside",
						formatter: (params: { value: number }) => (params.value > 0 ? `${params.value}%` : ""),
						fontSize: 11,
						fontWeight: "bold",
						color: "#fff",
					},
				},
				{
					name: "Medium (40-80%)",
					type: "bar",
					stack: "rate",
					data: CONTRACTORS.map((c) => ({
						value: c.resolutionRate >= 40 && c.resolutionRate < 80 ? c.resolutionRate : 0,
						itemStyle: { color: "#eab308", opacity: dim(c.name) },
					})),
					barMaxWidth: 48,
					label: {
						show: true,
						position: "inside",
						formatter: (params: { value: number }) => (params.value > 0 ? `${params.value}%` : ""),
						fontSize: 11,
						fontWeight: "bold",
						color: "#fff",
					},
				},
				{
					name: "High (>80%)",
					type: "bar",
					stack: "rate",
					data: CONTRACTORS.map((c) => ({
						value: c.resolutionRate >= 80 ? c.resolutionRate : 0,
						itemStyle: { color: "#22c55e", opacity: dim(c.name) },
					})),
					barMaxWidth: 48,
					label: {
						show: true,
						position: "inside",
						formatter: (params: { value: number }) => (params.value > 0 ? `${params.value}%` : ""),
						fontSize: 11,
						fontWeight: "bold",
						color: "#fff",
					},
				},
			],
		}),
		[selectedName],
	);

	const workloadOption = useMemo(
		() => ({
			tooltip: {
				trigger: "axis",
				axisPointer: { type: "shadow" },
			},
			legend: {
				data: ["Open", "Overdue"],
				bottom: 0,
				left: "center",
				itemWidth: 10,
				itemHeight: 10,
				textStyle: { fontSize: 11 },
			},
			grid: { left: "3%", right: "4%", bottom: "14%", top: "4%", containLabel: true },
			xAxis: {
				type: "category",
				data: CONTRACTORS.map((c) => c.name),
				axisLabel: { rotate: 45, interval: 0 },
			},
			yAxis: {
				type: "value",
				splitLine: { lineStyle: { type: "dashed" } },
			},
			series: [
				{
					name: "Open",
					type: "bar",
					stack: "total",
					data: CONTRACTORS.map((c) => ({
						value: c.open - c.overdue,
						itemStyle: { color: "#3b82f6", opacity: dim(c.name) },
					})),
					barMaxWidth: 48,
				},
				{
					name: "Overdue",
					type: "bar",
					stack: "total",
					data: CONTRACTORS.map((c) => ({ value: c.overdue, itemStyle: { color: "#ef4444", opacity: dim(c.name) } })),
					barMaxWidth: 48,
				},
			],
		}),
		[selectedName],
	);

	const filterBadge = selectedName ? (
		<div className="flex items-center gap-2">
			<span className="text-[13px] text-muted-foreground">Filtered by:</span>
			<Badge variant="secondary" className="gap-1">
				{selectedName}
				<button type="button" onClick={() => setSelectedName(null)} className="ml-0.5 hover:text-foreground">
					×
				</button>
			</Badge>
		</div>
	) : null;

	return (
		<div className="min-h-screen bg-background">
			<div className="border-b border-border px-6 py-3">
				<h1 className="text-lg font-bold">Overview</h1>
			</div>

			<div className="p-6 space-y-4">
				{!bannerDismissed && (
					<Banner
						variant="danger"
						title="System is at risk"
						items={["12 complaints need action", "5 have breached SLA", "8 complaints are unassigned"]}
						action={{ label: "Take Action", onClick: () => {} }}
						onDismiss={() => setBannerDismissed(true)}
					/>
				)}

				<div className="grid grid-cols-6 gap-4">
					<KPICard title="Needs Action" value={12} trend="down" trendLabel="+3 weekly" icon={AlertTriangle} status="warning" />
					<KPICard title="Overdue" value={5} trend="down" trendLabel="+2 daily" icon={Clock} status="danger" />
					<KPICard title="High Severity" value={3} trend="up" trendLabel="-1 weekly" icon={AlertTriangle} status="danger" />
					<KPICard title="Unassigned" value={8} trend="down" trendLabel="+4 weekly" icon={UserX} status="danger" />
					<KPICard title="In Progress" value={24} trend="up" trendLabel="-3 weekly" icon={Loader2} />
					<KPICard title="Resolved" value={18} trend="up" trendLabel="+5 weekly" icon={CheckCircle2} status="success" />
				</div>

				{filterBadge}

				<div className="grid grid-cols-2 gap-4">
					<Card className="shadow-none">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Contractor Performance</CardTitle>
							<CardDescription>Resolution rate by contractor. Click a bar to see breakdown.</CardDescription>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={performanceOption}
								style={{ height: 320 }}
								onEvents={{
									click: (params: { dataIndex?: number }) => {
										if (params.dataIndex !== undefined) {
											toggleFilter(CONTRACTORS[params.dataIndex].name);
										}
									},
								}}
							/>
						</CardContent>
					</Card>

					<Card className="shadow-none">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Contractor Workload</CardTitle>
							<CardDescription>Open complaints with overdue portion highlighted.</CardDescription>
						</CardHeader>
						<CardContent>
							<ReactECharts
								option={workloadOption}
								style={{ height: 320 }}
								onEvents={{
									click: (params: { dataIndex?: number }) => {
										if (params.dataIndex !== undefined) {
											toggleFilter(CONTRACTORS[params.dataIndex].name);
										}
									},
								}}
							/>
						</CardContent>
					</Card>
				</div>

				{/* ── Contractor Details + Complaint Types ── */}
				<div className="grid grid-cols-2 gap-4">
					<Card className="shadow-none">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">Contractor Details</CardTitle>
							<CardDescription>Sorted by worst performance. Click a row to expand.</CardDescription>
						</CardHeader>
						<CardContent>
							<table className="w-full text-[13px]">
								<thead>
									<tr className="border-b border-border">
										<th className="text-left py-2 pr-3 font-semibold text-foreground">Contractor</th>
										<th className="text-center py-2 px-2 font-semibold text-foreground">Total</th>
										<th className="text-center py-2 px-2 font-semibold text-foreground">Open</th>
										<th className="text-center py-2 px-2 font-semibold text-foreground">Overdue</th>
										<th className="text-center py-2 px-2 font-semibold text-foreground">Rate</th>
										<th className="text-center py-2 px-2 font-semibold text-foreground">Avg Time</th>
									</tr>
								</thead>
								<tbody>
									{SORTED_CONTRACTORS.map((c) => {
										const isExpanded = selectedName === c.name;
										const topCat = c.breakdown.reduce((a, b) => (a.count > b.count ? a : b));
										const overduePercent = Math.round((c.overdue / c.total) * 100);
										return (
											<>
												<tr
													key={c.name}
													className={`border-b border-border cursor-pointer hover:bg-muted transition-colors ${selectedName && selectedName !== c.name ? "opacity-30" : ""}`}
													onClick={() => toggleFilter(c.name)}
												>
													<td className="py-2.5 pr-3">
														<div className="flex items-center gap-2">
															<span
																className={`h-2 w-2 rounded-full ${c.resolutionRate < 40 ? "bg-red-500" : c.resolutionRate < 80 ? "bg-yellow-500" : "bg-green-500"}`}
															/>
															<span className="font-medium">{c.name}</span>
														</div>
													</td>
													<td className="text-center py-2.5 px-2">{c.total}</td>
													<td className="text-center py-2.5 px-2">
														<span className={c.open > 5 ? "text-red-600 font-semibold" : ""}>{c.open}</span>
													</td>
													<td className="text-center py-2.5 px-2">
														<span className={c.overdue > 0 ? "text-red-600 font-semibold" : "text-muted-foreground"}>
															{c.overdue}
														</span>
													</td>
													<td className="text-center py-2.5 px-2">
														<span
															className={`font-semibold ${c.resolutionRate < 40 ? "text-red-600" : c.resolutionRate < 80 ? "text-amber-600" : "text-green-600"}`}
														>
															{c.resolutionRate}%
														</span>
													</td>
													<td className="text-center py-2.5 px-2 text-muted-foreground">
														{c.avgResolutionHours}h
													</td>
												</tr>
												{isExpanded && (
													<tr key={`${c.name}-detail`}>
														<td colSpan={6} className="p-3 bg-muted/30">
															<div className="space-y-2">
																<Banner
																	variant={c.resolutionRate < 40 ? "danger" : "warning"}
																	title={`${topCat.category} accounts for ${Math.round((topCat.count / c.total) * 100)}% of complaints`}
																	description={`${c.open} open, ${c.overdue} overdue (${overduePercent}%). Avg resolution: ${c.avgResolutionHours}h.`}
																/>
																<div className="grid grid-cols-2 gap-3">
																	{c.breakdown.map((b) => (
																		<div key={b.category} className="flex items-center justify-between text-xs">
																			<span className="text-muted-foreground">{b.category}</span>
																			<div className="flex items-center gap-2">
																				<div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
																					<div
																						className="h-full rounded-full"
																						style={{
																							width: `${(b.count / c.total) * 100}%`,
																							backgroundColor: getResolutionColor(c.resolutionRate),
																						}}
																					/>
																				</div>
																				<span className="font-medium w-4 text-right">{b.count}</span>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														</td>
													</tr>
												)}
											</>
										);
									})}
								</tbody>
							</table>
						</CardContent>
					</Card>

					{/* Complaint Types Distribution */}
					<Card className="shadow-none">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								{selectedContractor ? `${selectedContractor.name} — Complaint Types` : "Complaint Types"}
							</CardTitle>
							<CardDescription>
								{selectedContractor
									? `Category breakdown for ${selectedContractor.name}.`
									: "Distribution across all contractors."}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{(() => {
								const pieData = selectedContractor
									? selectedContractor.breakdown.sort((a, b) => b.count - a.count)
									: CATEGORY_DATA.map(([name, value]) => ({ category: name, count: value as number }));
								const topCat = pieData[0];
								const totalForPie = pieData.reduce((s, d) => s + d.count, 0);
								const colors = ["#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e", "#64748b"];
								return (
									<>
										<Banner
											variant="warning"
											title={`${topCat.category} is the #1 complaint type`}
											description={`${topCat.count} of ${totalForPie} complaints (${Math.round((topCat.count / totalForPie) * 100)}%).`}
											className="mb-4"
										/>
										<ReactECharts
											option={{
												tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
												legend: {
													bottom: 0,
													left: "center",
													itemWidth: 10,
													itemHeight: 10,
													textStyle: { fontSize: 11 },
												},
												series: [
													{
														type: "pie",
														radius: ["40%", "70%"],
														center: ["50%", "42%"],
														avoidLabelOverlap: true,
														itemStyle: { borderRadius: 4, borderColor: "#fff", borderWidth: 2 },
														label: { show: true, formatter: "{b}\n{c}", fontSize: 11 },
														data: pieData.map((d, i) => ({
															name: d.category,
															value: d.count,
															itemStyle: { color: colors[i % colors.length] },
														})),
													},
												],
											}}
											style={{ height: 320 }}
										/>
									</>
								);
							})()}
						</CardContent>
					</Card>
				</div>

				{/* ── Recent & Important ── */}
				<Card className="shadow-none">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base">Recent & Important</CardTitle>
								<CardDescription>Top complaints prioritized by urgency.</CardDescription>
							</div>
							<Button variant="secondary" size="sm">
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">ID</TableHead>
									<TableHead>Worker</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Severity</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>SLA</TableHead>
									<TableHead>Owner</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{RECENT_COMPLAINTS.map((c) => (
									<TableRow key={c.id} className="cursor-pointer hover:bg-muted">
										<TableCell className="font-mono text-xs text-muted-foreground">#{c.id}</TableCell>
										<TableCell className="font-medium">{c.worker}</TableCell>
										<TableCell>{c.category}</TableCell>
										<TableCell>
											{c.severity === "high" && (
												<span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
													<span className="h-2 w-2 rounded-full bg-red-500" />
													High
												</span>
											)}
											{c.severity === "medium" && (
												<span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
													<span className="h-2 w-2 rounded-full bg-amber-500" />
													Medium
												</span>
											)}
											{c.severity === "low" && (
												<span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
													<span className="h-2 w-2 rounded-full bg-zinc-400" />
													Low
												</span>
											)}
										</TableCell>
										<TableCell>
											<Badge variant={c.status === "New" ? "default" : c.status === "Resolved" ? "outline" : "secondary"}>
												{c.status}
											</Badge>
										</TableCell>
										<TableCell>
											{c.sla === "overdue" && (
												<span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
													⏰ Overdue
												</span>
											)}
											{c.sla === "due-soon" && (
												<span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
													⚠️ Due Soon
												</span>
											)}
											{c.sla === "on-track" && (
												<span className="inline-flex items-center gap-1 text-xs text-green-600">
													✅ On Track
												</span>
											)}
										</TableCell>
										<TableCell>
											{c.owner === "Unassigned" ? (
												<span className="text-xs font-medium text-red-500">Unassigned</span>
											) : (
												<span className="text-xs">{c.owner}</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
