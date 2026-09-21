import type {EChartsOption} from "echarts";

import {cn} from "@wakecap/core-utils";
import {
	Activity,
	ChevronRight,
	ClipboardCheck,
	FileText,
	HardHat,
	Layers,
	Network,
	ShieldCheck,
	UserCog,
	Users,
	UsersRound,
} from "lucide-react";

import {Avatar, AvatarFallback} from "../avatar";
import {Badge} from "../badge";
import {Button} from "../button";
import {ChartContainer, type ChartSemanticTone} from "../chart";
import {MetricCard, type MetricCardProps} from "../metric-card";
import {type ProgressTone} from "../progress";
import {ProgressStat} from "../progress-stat";
import {ScoreGauge} from "../score-gauge";
import {SectionPanel} from "../section-panel";

// Workforce Analytics — a summary dashboard that rolls up the tabs after it (Workers List, Crews, OBS,
// Map View, Submissions, Compliance). Every section links back to its source tab via a "View" action.
// Figures are placeholder fixtures kept consistent with what the individual surfaces show.

type WorkforceTab = "workers-list" | "crews" | "obs" | "map-view" | "submissions" | "compliance";

const TOTAL_WORKFORCE = 3590;
const ON_SITE_NOW = 3339;
const COMPLIANCE_RATE = 87;

// ── KPI tiles, one per source tab ────────────────────────────────────────────
const KPIS: {id: string; tab: WorkforceTab; metric: MetricCardProps}[] = [
	{
		id: "total",
		tab: "workers-list",
		metric: {
			title: "Total Workforce",
			value: TOTAL_WORKFORCE.toLocaleString(),
			icon: Users,
			trend: "up",
			trendLabel: "+2.4% vs last week",
		},
	},
	{
		id: "onsite",
		tab: "map-view",
		metric: {title: "On Site Now", value: ON_SITE_NOW.toLocaleString(), subtitle: "93% of workforce", icon: Activity},
	},
	{
		id: "compliance",
		tab: "compliance",
		metric: {
			title: "Compliance Rate",
			value: COMPLIANCE_RATE,
			unit: "%",
			icon: ShieldCheck,
			status: "success",
			trend: "up",
			trendLabel: "+1.2 pts",
		},
	},
	{
		id: "crews",
		tab: "crews",
		metric: {title: "Active Crews", value: 18, subtitle: "across 6 disciplines", icon: UsersRound},
	},
	{
		id: "supervisors",
		tab: "obs",
		metric: {title: "Supervisors", value: 42, subtitle: "avg span of control 8.5", icon: Network},
	},
	{
		id: "submissions",
		tab: "submissions",
		metric: {title: "Pending Submissions", value: 15, subtitle: "3 need review", icon: FileText, status: "warning"},
	},
];

// ── Intraday attendance (hourly headcount) ───────────────────────────────────
const HOURS = Array.from({length: 24}, (_, h) => `${String(h).padStart(2, "0")}`);
const ATTENDANCE = [
	110, 90, 85, 88, 95, 340, 1450, 2600, 3100, 3350, 3480, 3560, 3590, 3540, 3470, 3300, 2950, 2400, 1500, 720, 380, 210,
	150, 120,
];

// ── Breakdowns ───────────────────────────────────────────────────────────────
const BY_TRADE = [
	{label: "Direct-Helper", value: 980},
	{label: "Direct-Scaffolder", value: 620},
	{label: "Electrician", value: 520},
	{label: "Steel Fixer", value: 430},
	{label: "Mason", value: 390},
	{label: "Indirect-Driver", value: 360},
	{label: "Welder", value: 290},
];

const BY_CREW = [
	{label: "TR-TAMIMI", value: 512},
	{label: "TR-RED CAMEL", value: 448},
	{label: "TR-UNITED", value: 401},
	{label: "DSCO", value: 356},
	{label: "TR-FALCON", value: 318},
];

const BY_LEVEL = [
	{label: "02 tweede", value: 142},
	{label: "07 zevende", value: 137},
	{label: "12 twaalfde", value: 132},
	{label: "17 zeventiende", value: 127},
	{label: "04 vierde", value: 121},
	{label: "09 negende", value: 116},
];

const COMPLIANCE_ELEMENTS: {name: string; pct: number; tone: ProgressTone}[] = [
	{name: "Background Check", pct: 94, tone: "success"},
	{name: "SST Card", pct: 88, tone: "success"},
	{name: "Apex ID Badge", pct: 91, tone: "success"},
	{name: "WakeCap Asset", pct: 82, tone: "warning"},
];

const OBS_STATS = [
	{label: "Supervisors", value: "42"},
	{label: "Avg span of control", value: "8.5"},
	{label: "Hierarchy depth", value: "5"},
	{label: "Largest team", value: "34"},
];

const RECENT: {id: string; title: string; who: string; when: string; status: string; tone: ProgressTone}[] = [
	{
		id: "s1",
		title: "Mobilization request — 24 workers",
		who: "Ahmed R.",
		when: "12m ago",
		status: "Pending",
		tone: "warning",
	},
	{id: "s2", title: "New worker onboarding", who: "Maya K.", when: "1h ago", status: "Approved", tone: "success"},
	{id: "s3", title: "Crew reassignment — DSCO", who: "John D.", when: "3h ago", status: "Approved", tone: "success"},
	{id: "s4", title: "Demobilization — 6 workers", who: "Sara L.", when: "5h ago", status: "Rejected", tone: "danger"},
	{
		id: "s5",
		title: "Compliance document upload",
		who: "Omar F.",
		when: "yesterday",
		status: "Approved",
		tone: "success",
	},
];

// ── Small building blocks ────────────────────────────────────────────────────

const BADGE_TONE: Record<ProgressTone, string> = {
	primary: "wwc:bg-primary/10 wwc:text-primary",
	success: "wwc:bg-green-100 wwc:text-green-700",
	warning: "wwc:bg-amber-100 wwc:text-amber-700",
	danger: "wwc:bg-red-100 wwc:text-red-700",
};

/** A ranked breakdown as a themed Wakecore horizontal bar chart (ChartContainer / ECharts). */
function BarBreakdown({items, tone}: {items: {label: string; value: number}[]; tone: ChartSemanticTone}) {
	// ECharts category axis runs bottom→top, so reverse to keep the largest value on top.
	const labels = items.map((i) => i.label).reverse();
	const values = items.map((i) => i.value).reverse();
	const option: EChartsOption = {
		tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
		grid: {left: 4, right: 44, top: 4, bottom: 2, containLabel: true},
		xAxis: {
			type: "value",
			axisLabel: {show: false},
			splitLine: {show: false},
			axisLine: {show: false},
			axisTick: {show: false},
		},
		yAxis: {
			type: "category",
			data: labels,
			axisTick: {show: false},
			axisLine: {show: false},
			axisLabel: {fontSize: 11},
		},
		series: [
			{
				type: "bar",
				data: values,
				barWidth: "62%",
				itemStyle: {borderRadius: [0, 4, 4, 0]},
				label: {show: true, position: "right", fontSize: 11, formatter: "{c}"},
			},
		],
	};
	return <ChartContainer option={option} seriesThemes={[{tone}]} height={items.length * 30 + 12} />;
}

function initials(name: string) {
	return (
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((p) => p[0]?.toUpperCase() ?? "")
			.join("") || "?"
	);
}

/**
 * Workforce Analytics summary. Wire `onNavigate` to the template's tab setter so each section's "View"
 * action jumps to the tab it summarizes.
 */
export function AnalyticsView({onNavigate}: {onNavigate?: (tab: WorkforceTab) => void} = {}) {
	const viewAction = (tab: WorkforceTab) => (
		<Button
			variant="ghost"
			size="sm"
			className="wwc:h-7 wwc:gap-1 wwc:text-muted-foreground"
			onClick={() => onNavigate?.(tab)}
		>
			View
			<ChevronRight className="wwc:h-3.5 wwc:w-3.5" />
		</Button>
	);

	const attendanceOption: EChartsOption = {
		grid: {left: 6, right: 6, top: 12, bottom: 6, containLabel: true},
		tooltip: {trigger: "axis"},
		xAxis: {
			type: "category",
			data: HOURS,
			axisTick: {show: false},
			axisLabel: {interval: 2, fontSize: 10},
		},
		yAxis: {type: "value", splitNumber: 3, axisLabel: {fontSize: 10}},
		series: [{type: "bar", data: ATTENDANCE, barWidth: "55%", itemStyle: {borderRadius: [3, 3, 0, 0]}}],
	};

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto">
			<div className="wwc:w-full wwc:space-y-4 wwc:p-6">
				{/* 1. Headline KPIs — one row on wide screens; each links to its source tab. */}
				<div className="wwc:grid wwc:gap-3 wwc:grid-cols-2 wwc:sm:grid-cols-3 wwc:lg:grid-cols-6">
					{KPIS.map((k) => (
						<button
							key={k.id}
							type="button"
							onClick={() => onNavigate?.(k.tab)}
							className="wwc:rounded-xl wwc:text-left wwc:transition wwc:hover:ring-2 wwc:hover:ring-primary/20"
						>
							<MetricCard {...k.metric} />
						</button>
					))}
				</div>

				{/* 2. Attendance today */}
				<SectionPanel icon={Activity} title="Attendance today" action={viewAction("map-view")}>
					<div className="wwc:mb-1">
						<span className="wwc:text-2xl wwc:font-semibold wwc:tracking-tight">{ON_SITE_NOW.toLocaleString()}</span>{" "}
						<span className="wwc:text-sm wwc:text-muted-foreground">on site now</span>
						<p className="wwc:text-xs wwc:text-muted-foreground">Peak 3,590 at 13:00 · low 85 overnight</p>
					</div>
					<ChartContainer option={attendanceOption} seriesThemes={[{tone: "chart-4"}]} height={200} />
				</SectionPanel>

				{/* 3. Workforce mix */}
				<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
					<SectionPanel icon={HardHat} title="By Trade" action={viewAction("workers-list")}>
						<BarBreakdown items={BY_TRADE} tone="chart-4" />
					</SectionPanel>
					<SectionPanel icon={UsersRound} title="By Crew" count="Top 5" action={viewAction("crews")}>
						<BarBreakdown items={BY_CREW} tone="chart-5" />
					</SectionPanel>
				</div>

				{/* 4. Compliance summary + 5. Site occupancy */}
				<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-3">
					<SectionPanel
						icon={ShieldCheck}
						title="Compliance"
						action={viewAction("compliance")}
						className="wwc:lg:col-span-2"
					>
						<div className="wwc:flex wwc:flex-col wwc:gap-4 wwc:sm:flex-row wwc:sm:items-center">
							<div className="wwc:flex wwc:shrink-0 wwc:flex-col wwc:items-center">
								<ScoreGauge value={COMPLIANCE_RATE} tone="success" size={128} caption="compliant" />
								<div className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
									<span className="wwc:font-semibold wwc:text-green-600">3,412</span> mobilized ·{" "}
									<span className="wwc:font-semibold wwc:text-amber-600">178</span> demobilized
								</div>
							</div>
							<div className="wwc:grid wwc:flex-1 wwc:grid-cols-2 wwc:gap-2">
								{COMPLIANCE_ELEMENTS.map((el) => (
									<ProgressStat
										key={el.name}
										title={el.name}
										value={el.pct}
										unit="%"
										percent={el.pct}
										tone={el.tone}
										className="wwc:p-3"
									/>
								))}
							</div>
						</div>
					</SectionPanel>

					<SectionPanel icon={Layers} title="Occupancy by level" count="Top 6" action={viewAction("map-view")}>
						<BarBreakdown items={BY_LEVEL} tone="chart-3" />
					</SectionPanel>
				</div>

				{/* 6. OBS snapshot + 7. Recent submissions */}
				<div className="wwc:grid wwc:gap-4 wwc:lg:grid-cols-2">
					<SectionPanel icon={UserCog} title="Org structure (OBS)" action={viewAction("obs")}>
						<div className="wwc:grid wwc:grid-cols-2 wwc:gap-2">
							{OBS_STATS.map((s) => (
								<div key={s.label} className="wwc:rounded-lg wwc:border wwc:p-3">
									<div className="wwc:text-xl wwc:font-semibold wwc:tabular-nums">{s.value}</div>
									<div className="wwc:text-xs wwc:text-muted-foreground">{s.label}</div>
								</div>
							))}
						</div>
					</SectionPanel>

					<SectionPanel icon={ClipboardCheck} title="Recent submissions" action={viewAction("submissions")}>
						<div className="wwc:space-y-1">
							{RECENT.map((r) => (
								<div key={r.id} className="wwc:flex wwc:items-center wwc:gap-2.5 wwc:rounded wwc:px-1 wwc:py-1.5">
									<Avatar className="wwc:h-7 wwc:w-7">
										<AvatarFallback className="wwc:text-[10px]">{initials(r.who)}</AvatarFallback>
									</Avatar>
									<div className="wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col">
										<span className="wwc:truncate wwc:text-sm wwc:font-medium">{r.title}</span>
										<span className="wwc:truncate wwc:text-xs wwc:text-muted-foreground">
											{r.who} · {r.when}
										</span>
									</div>
									<Badge
										className={cn("wwc:h-5 wwc:shrink-0 wwc:border-transparent wwc:text-[10px]", BADGE_TONE[r.tone])}
									>
										{r.status}
									</Badge>
								</div>
							))}
						</div>
					</SectionPanel>
				</div>
			</div>
		</div>
	);
}
