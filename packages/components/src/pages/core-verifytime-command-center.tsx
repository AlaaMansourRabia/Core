import type {ColumnDef} from "@tanstack/react-table";

import {
	Activity,
	AlarmClock,
	AlertTriangle,
	ArrowRight,
	Building2,
	CalendarClock,
	CheckCircle2,
	FileX,
	Gauge,
	LogIn,
	LogOut,
	Radar,
	ShieldAlert,
	Sparkles,
	Users,
} from "lucide-react";
import {useRef, useState} from "react";

import {Badge} from "../badge";
import {Button} from "../button";
import {Checkbox} from "../checkbox";
import {DataTable, DataTableColumnHeader} from "../data-table";
import {DatePicker} from "../date-picker";
import {
	Filter,
	FilterCategory,
	FilterChips,
	FilterContent,
	FilterOption,
	FilterTrigger,
	type FilterValue,
} from "../filter";
import {FloatingAssistant} from "../floating-assistant";
import {Item, ItemContent, ItemDescription, ItemTitle} from "../item";
import {KPISummary} from "../kpi-summary";
import {SectionPanel, SectionPanelRow} from "../section-panel";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "../sheet";
import {toast} from "../sonner";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "../table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../tabs";
import type {Message} from "../types/chat";

// Timesheet — workforce time-verification operations.
// An agentic-first redesign of the workforce time-verification screen: instead of a 25,000-row table the
// user must inspect, the page opens with a briefing, organizes work into operational queues, proposes
// investigations, and keeps the detailed worker table as a secondary evidence layer. Hierarchy:
// Operational Summary → Priority Issues → AI Recommendations → Natural-Language Workspace →
// Investigations (cases) → Worker Records (evidence).

type Severity = "high" | "medium" | "low";

// ── Operational briefing ──

const SUMMARY = {
	workersPresent: 4946,
	workersTotal: 25604,
	attendanceRate: 19.3,
	attendanceAvg: 24.1,
	verifiedHours: 416,
	expectedHours: 2678,
	verifiedTimecards: 0,
	totalTimecards: 25604,
};

// ── Priority queues ──

type Queue = {
	id: string;
	name: string;
	icon: React.ElementType;
	workers: number;
	unit?: string;
	severity: Severity;
	impact: string;
	explanation: string;
	action: string;
};

const QUEUES: Queue[] = [
	{
		id: "missing-exit",
		name: "Missing Exit Detection",
		icon: LogOut,
		workers: 863,
		severity: "high",
		impact: "~1,180 undelivered hrs",
		explanation: "Workers detected on arrival but no exit scan — hours cannot close. Rising since 13:00.",
		action: "Review missing exits",
	},
	{
		id: "missing-arrival",
		name: "Missing Arrival Detection",
		icon: LogIn,
		workers: 1204,
		severity: "high",
		impact: "~9,600 expected hrs unverifiable",
		explanation: "Timecard exists but no arrival scan was captured at any gate or zone reader.",
		action: "Review missing arrivals",
	},
	{
		id: "timecard-no-detection",
		name: "Timecards Without Physical Detection",
		icon: Radar,
		workers: 574,
		severity: "high",
		impact: "Direct payroll exposure",
		explanation: "A timecard was submitted but no WakeCap detection supports it. Highest fraud risk.",
		action: "Investigate payroll risk",
	},
	{
		id: "no-timecard",
		name: "Workers Without Timecards",
		icon: FileX,
		workers: 2116,
		severity: "medium",
		impact: "Attendance under-reported",
		explanation: "Detected on site but no timecard was created, so their hours are not being counted.",
		action: "Generate timecards",
	},
	{
		id: "low-confidence",
		name: "Low Confidence Records",
		icon: Gauge,
		workers: 391,
		severity: "medium",
		impact: "Needs human confirmation",
		explanation: "Detection quality below threshold — weak signal, single reader, or partial shift.",
		action: "Confirm records",
	},
	{
		id: "long-hours",
		name: "Long Working Hours",
		icon: AlarmClock,
		workers: 148,
		severity: "medium",
		impact: "Overtime & safety review",
		explanation: "Shifts exceeding 14 hours of continuous on-site detection. Flag for supervisor review.",
		action: "Review long shifts",
	},
	{
		id: "suspicious",
		name: "Suspicious Attendance",
		icon: ShieldAlert,
		workers: 67,
		severity: "high",
		impact: "Integrity investigation",
		explanation: "Same badge detected in two zones at once, or impossible movement between readers.",
		action: "Open integrity case",
	},
	{
		id: "contractor",
		name: "Contractor Attendance Issues",
		icon: Building2,
		workers: 5,
		unit: "contractors",
		severity: "high",
		impact: "TR-DOUGLAS 41% below plan",
		explanation: "Contractors whose present-vs-planned gap is materially worse than the site average.",
		action: "Review contractors",
	},
	{
		id: "shift-exception",
		name: "Shift Exceptions",
		icon: CalendarClock,
		workers: 232,
		severity: "low",
		impact: "Roster mismatch",
		explanation: "Detected outside the assigned shift window — early, late, or on a non-scheduled day.",
		action: "Reconcile shifts",
	},
];

// ── AI recommendations ──

type Recommendation = {
	id: string;
	title: string;
	why: string;
	queueId: string;
	cta: string;
};

const RECOMMENDATIONS: Recommendation[] = [
	{
		id: "rec-1",
		title: "Review missing exits from TR-DOUGLAS",
		why: "61% of today's 863 missing exits come from this one contractor, all after 13:00 — a likely reader outage at their gate.",
		queueId: "missing-exit",
		cta: "Open investigation",
	},
	{
		id: "rec-2",
		title: "Approve 214 high-confidence corrections",
		why: "The system is ≥95% confident it can auto-fill these exits from gate logs. Approving clears ~470 undelivered hours instantly.",
		queueId: "low-confidence",
		cta: "Review & approve",
	},
	{
		id: "rec-3",
		title: "Investigate attendance drop in Zone 4",
		why: "Zone 4 is at 12% attendance versus 19% site-wide, and three crews have no scans at all this morning.",
		queueId: "missing-arrival",
		cta: "Open investigation",
	},
	{
		id: "rec-4",
		title: "Contact supervisors for 67 unresolved integrity records",
		why: "Same badge seen in two zones simultaneously. These cannot be auto-resolved and need a supervisor to confirm identity.",
		queueId: "suspicious",
		cta: "Open integrity case",
	},
];

// ── Investigation cases ──

type CaseData = {
	whatHappened: string;
	whyBelieved: string;
	evidence: string[];
	resolution: string;
	impact: string;
	actions: string[];
};

const CASES: Record<string, CaseData> = {
	"missing-exit": {
		whatHappened:
			"863 workers were detected arriving on site today but have no corresponding exit scan, so their timecards cannot be closed and their hours stay undelivered.",
		whyBelieved:
			"The volume spiked sharply after 13:00 and 61% of affected workers belong to TR-DOUGLAS at the same gate cluster (G3/G4). This pattern is consistent with a reader outage rather than workers still on site — most have not been detected anywhere for 3+ hours.",
		evidence: [
			"Gate readers G3 and G4 stopped reporting exits at 13:07",
			"527 of 863 affected workers are TR-DOUGLAS",
			"No zone detections for 78% of affected workers since 13:00",
			"Gate G3 arrival scans continued normally in the morning",
		],
		resolution:
			"Reconcile exits from the G3/G4 access-control turnstile logs (available), then close the timecards. Escalate the reader outage to site IT.",
		impact: "~1,180 undelivered hours · SAR 94,000 estimated payroll impact if unresolved",
		actions: ["Auto-fill exits from gate logs", "Assign to site IT", "Notify TR-DOUGLAS supervisor"],
	},
	"missing-arrival": {
		whatHappened:
			"1,204 workers have a timecard for today but no arrival was ever captured at any gate or zone reader, leaving their expected hours unverifiable.",
		whyBelieved:
			"A large share sits in Zone 4, where three crews show zero detections all morning — pointing to either a coverage gap or crews that never reported to their assigned zone.",
		evidence: [
			"412 affected workers are assigned to Zone 4",
			"Zone 4 attendance is 12% vs 19% site-wide",
			"3 crews (SFEC, WESCOSA, AIC) have no scans today",
			"Timecards were pre-generated from the roster",
		],
		resolution:
			"Confirm Zone 4 reader coverage, then contact the three crew supervisors to verify whether the crews are on site.",
		impact: "~9,600 expected hours unverifiable",
		actions: ["Check Zone 4 reader health", "Contact crew supervisors", "Flag crews as absent"],
	},
	"timecard-no-detection": {
		whatHappened:
			"574 timecards were submitted with billable hours but have no WakeCap detection of any kind to support them.",
		whyBelieved:
			"These records combine manual timecard entry with a complete absence of physical presence — the strongest indicator of over-reporting or ghost workers.",
		evidence: [
			"0 gate scans and 0 zone detections for all 574",
			"89% were entered manually, not from a device",
			"Concentrated in 4 subcontractors",
			"Average 9.8 billed hours each",
		],
		resolution:
			"Hold these timecards from payroll pending contractor evidence. Require a supervisor attestation before release.",
		impact: "Direct payroll exposure · SAR 61,000 held",
		actions: ["Hold from payroll", "Request contractor evidence", "Escalate to compliance"],
	},
	"no-timecard": {
		whatHappened:
			"2,116 workers were physically detected on site today but no timecard was created for them, so their hours are not being counted.",
		whyBelieved:
			"Their badges scanned normally at gates and zones, but the roster sync did not produce a matching timecard — usually a mapping gap between the badge and the HR record.",
		evidence: [
			"All 2,116 have valid gate + zone detections",
			"No timecard row exists in today's batch",
			"Most are recent joiners (< 14 days)",
			"Detected hours average 7.2 each",
		],
		resolution: "Auto-generate timecards from detections for confirmed badge-to-worker matches, then verify.",
		impact: "~15,200 hours currently uncounted",
		actions: ["Generate timecards from detections", "Fix badge mapping", "Verify new joiners"],
	},
	"low-confidence": {
		whatHappened:
			"391 records were detected with a confidence score below the verification threshold and need a human decision before their hours can be trusted.",
		whyBelieved:
			"Weak or single-reader signals, or partial-shift coverage, lowered the confidence — but 214 of them have strong corroborating gate logs the system can use.",
		evidence: [
			"214 have ≥95% corroboration from gate logs",
			"Median confidence 0.71 (threshold 0.85)",
			"Most are single-reader detections",
			"No conflicting signals present",
		],
		resolution: "Bulk-approve the 214 high-corroboration records; route the remaining 177 for spot review.",
		impact: "~470 undelivered hours recoverable immediately",
		actions: ["Approve 214 high-confidence", "Route 177 for spot review"],
	},
	"long-hours": {
		whatHappened: "148 workers show more than 14 hours of continuous on-site detection today.",
		whyBelieved:
			"Continuous detection across shift boundaries suggests genuine long shifts or a missed exit/re-entry that merged two shifts into one.",
		evidence: [
			"All exceed 14h continuous detection",
			"32 exceed 16h",
			"Clustered in night-to-day handover crews",
			"No exit scan between shifts",
		],
		resolution: "Confirm overtime with supervisors and split any merged shifts where a re-entry is evident.",
		impact: "Overtime cost & fatigue-safety review",
		actions: ["Confirm overtime with supervisor", "Split merged shifts"],
	},
	suspicious: {
		whatHappened:
			"67 records show the same badge detected in two different zones at the same time, or movement between readers that is physically impossible.",
		whyBelieved:
			"Simultaneous multi-zone detection almost always means a shared or cloned badge — it cannot be resolved automatically and requires identity confirmation.",
		evidence: [
			"67 badges detected in 2 zones within the same minute",
			"12 show sub-30-second cross-site jumps",
			"Recurring across the last 3 days for 19 badges",
			"All flagged by the anomaly model",
		],
		resolution: "Suspend the affected badges and have supervisors physically confirm each worker's identity.",
		impact: "Attendance integrity · possible badge sharing",
		actions: ["Suspend affected badges", "Request supervisor confirmation", "Escalate to security"],
	},
	contractor: {
		whatHappened:
			"5 contractors have a present-versus-planned attendance gap that is materially worse than the site average today.",
		whyBelieved:
			"TR-DOUGLAS is 41% below plan and also drives the missing-exit spike — a combination that points to an operational problem on their side rather than a detection issue.",
		evidence: [
			"TR-DOUGLAS present 59% of planned",
			"Sinohydro present 68% of planned",
			"Both together = 58% of all unresolved records",
			"Site average gap is 12%",
		],
		resolution: "Share the contractor scorecard with the two worst performers and request an attendance plan.",
		impact: "Schedule risk on critical-path activities",
		actions: ["Send contractor scorecard", "Request attendance plan", "Notify project controls"],
	},
	"shift-exception": {
		whatHappened:
			"232 workers were detected outside their assigned shift window — arriving early, leaving late, or present on a non-scheduled day.",
		whyBelieved:
			"Most are small roster mismatches where the assigned shift in HR does not match the shift the worker actually worked.",
		evidence: [
			"181 outside the assigned time window",
			"51 detected on a non-scheduled day",
			"Concentrated in Default-Shift assignments",
			"No overlap with integrity flags",
		],
		resolution: "Reconcile the roster to the detected shift and update the assignment for recurring cases.",
		impact: "Roster accuracy for future planning",
		actions: ["Reconcile to detected shift", "Update recurring assignments"],
	},
};

// ── Worker evidence pool ──

type Worker = {
	name: string;
	trade: string;
	company: string;
	arrival: string;
	leave: string;
	issue: string;
	confidence: number;
	why: string;
};

const WORKERS: Worker[] = [
	{
		name: "Aakash Mandal",
		trade: "Direct-Steel Fixer",
		company: "TR-DOUGLAS",
		arrival: "05:33",
		leave: "—",
		issue: "missing-exit",
		confidence: 0.62,
		why: "Arrival at gate G3, no exit after 13:00 reader outage",
	},
	{
		name: "Aaron Thorpe Hennessy",
		trade: "Managing Director",
		company: "TR-DOUGLAS",
		arrival: "06:12",
		leave: "—",
		issue: "missing-exit",
		confidence: 0.58,
		why: "No exit scan; last seen Zone 2 at 12:58",
	},
	{
		name: "Aakash Hussain",
		trade: "Indirect-Safety Officer",
		company: "Sinohydro",
		arrival: "06:01",
		leave: "—",
		issue: "missing-exit",
		confidence: 0.66,
		why: "Exit reader G4 offline since 13:07",
	},
	{
		name: "Aakash Kumar",
		trade: "Direct-Carpenter",
		company: "TR-SFEC",
		arrival: "—",
		leave: "—",
		issue: "missing-arrival",
		confidence: 0.4,
		why: "Timecard exists, no arrival detection in Zone 4",
	},
	{
		name: "Aamar Jamil",
		trade: "Indirect-Material Coordinator",
		company: "TR-AIC",
		arrival: "—",
		leave: "—",
		issue: "missing-arrival",
		confidence: 0.38,
		why: "Crew AIC has no scans today",
	},
	{
		name: "Aamir Abbas",
		trade: "Indirect-QC Manager",
		company: "Sinohydro",
		arrival: "—",
		leave: "—",
		issue: "timecard-no-detection",
		confidence: 0.15,
		why: "Manual timecard, zero detections anywhere",
	},
	{
		name: "Aamir Rafique",
		trade: "Indirect-Rigger I",
		company: "TR-SINOHYDRO",
		arrival: "—",
		leave: "—",
		issue: "timecard-no-detection",
		confidence: 0.12,
		why: "9.5h billed, no gate or zone signal",
	},
	{
		name: "Aashar Khan",
		trade: "Indirect-Store Keeper",
		company: "TR-SINOHYDRO",
		arrival: "06:44",
		leave: "15:10",
		issue: "no-timecard",
		confidence: 0.91,
		why: "Detected all day, no timecard row generated",
	},
	{
		name: "Aamir Nawaz",
		trade: "HSE Training Coordinator",
		company: "TR-AIC",
		arrival: "06:20",
		leave: "15:44",
		issue: "no-timecard",
		confidence: 0.88,
		why: "Recent joiner, badge not mapped to HR record",
	},
	{
		name: "Aakash Ramesh Kadam",
		trade: "Service Engineer",
		company: "TR-WESCOSA",
		arrival: "06:05",
		leave: "14:30",
		issue: "low-confidence",
		confidence: 0.71,
		why: "Single-reader detection, gate log corroborates 96%",
	},
	{
		name: "Aaron Jay Tongol",
		trade: "Direct-Crane Operator",
		company: "TR-ELECO",
		arrival: "04:50",
		leave: "20:10",
		issue: "long-hours",
		confidence: 0.94,
		why: "15.3h continuous — no exit between night/day shift",
	},
	{
		name: "Aamir Sohail",
		trade: "Direct-Rigger III",
		company: "TR-SINOPEC5",
		arrival: "06:00",
		leave: "06:02",
		issue: "suspicious",
		confidence: 0.99,
		why: "Same badge in Zone 1 and Zone 6 at 06:01",
	},
];

// ── Small building blocks ──

// Severity → canonical Badge variant. Soft variants read as status indicators (red / amber / blue).
const SEVERITY: Record<Severity, {label: string; variant: "dangerSoft" | "warningSoft" | "infoSoft"}> = {
	high: {label: "High", variant: "dangerSoft"},
	medium: {label: "Medium", variant: "warningSoft"},
	low: {label: "Low", variant: "infoSoft"},
};

function SeverityTag({sev}: {sev: Severity}) {
	return <Badge variant={SEVERITY[sev].variant}>{SEVERITY[sev].label}</Badge>;
}

function fmt(n: number): string {
	return n.toLocaleString("en-US");
}

// ── Natural-language workspace result ──

type WorkspaceView = {
	title: string;
	summary: string;
	queueId?: string;
	workers?: Worker[];
	suggestions: string[];
};

function buildWorkspaceView(q: string): WorkspaceView {
	const query = q.toLowerCase();
	if (query.includes("missing exit")) {
		return {
			title: "Workers missing exits",
			summary:
				"863 workers have an arrival but no exit today. 527 belong to TR-DOUGLAS at gates G3/G4, which went offline at 13:07. Recovering exits from gate logs would clear ~1,180 undelivered hours.",
			queueId: "missing-exit",
			workers: WORKERS.filter((w) => w.issue === "missing-exit"),
			suggestions: ["Auto-fill exits from gate logs", "Group by contractor", "Compare with yesterday"],
		};
	}
	if (query.includes("contractor") || query.includes("gap")) {
		return {
			title: "Biggest contractor attendance gap",
			summary:
				"TR-DOUGLAS has the largest gap — present at 59% of planned headcount, 41% below plan, and the source of 61% of missing exits. Sinohydro is second at 68% of plan.",
			queueId: "contractor",
			suggestions: ["Open TR-DOUGLAS investigation", "Send contractor scorecard", "Show planned vs present chart"],
		};
	}
	if (query.includes("payroll")) {
		return {
			title: "Workers that may affect payroll",
			summary:
				"574 timecards have billable hours with zero physical detection (SAR 61,000 exposure) and 214 low-confidence records can be auto-approved from gate logs. Holding the 574 pending evidence is recommended before the payroll cut-off.",
			queueId: "timecard-no-detection",
			workers: WORKERS.filter((w) => w.issue === "timecard-no-detection"),
			suggestions: ["Hold 574 from payroll", "Approve 214 high-confidence", "Explain undelivered hours"],
		};
	}
	if (query.includes("yesterday") || query.includes("compare")) {
		return {
			title: "Today vs yesterday",
			summary:
				"Attendance is down 4.8 points (19.3% vs 24.1%). Missing exits are up 34% and driven almost entirely by the TR-DOUGLAS gate outage, which did not occur yesterday. All other queues are within normal range.",
			suggestions: ["Show missing-exit trend", "Which contractor changed most?", "Open missing exits"],
		};
	}
	if (query.includes("undelivered")) {
		return {
			title: "Why undelivered hours increased",
			summary:
				"Undelivered hours rose because exit detections stopped at gates G3/G4 after 13:07, leaving 863 shifts unable to close. This single outage accounts for roughly 1,180 of today's undelivered hours; the remainder is normal low-confidence and no-timecard backlog.",
			queueId: "missing-exit",
			suggestions: ["Auto-fill exits from gate logs", "Assign outage to site IT", "Show hourly trend"],
		};
	}
	return {
		title: `Results for “${q}”`,
		summary:
			"I searched today's verification data across all queues. Try one of the suggestions below, or ask about missing exits, contractor gaps, payroll risk, or undelivered hours to build a focused view.",
		suggestions: [
			"Show workers missing exits",
			"Which contractor has the biggest attendance gap?",
			"Find workers that may affect payroll",
		],
	};
}

// ── Worker records columns (canonical DataTable) ──

const issueName = (id: string) => QUEUES.find((q) => q.id === id)?.name ?? id;
const workerSeverity = (id: string): Severity => QUEUES.find((q) => q.id === id)?.severity ?? "low";

// Filter categories for the Worker Records table, derived from the data.
const FILTER_ISSUES = [...new Set(WORKERS.map((w) => w.issue))].map((id) => ({value: id, label: issueName(id)}));
const FILTER_COMPANIES = [...new Set(WORKERS.map((w) => w.company))].sort();
const FILTER_SEVERITIES: {value: Severity; label: string}[] = [
	{value: "high", label: "High"},
	{value: "medium", label: "Medium"},
	{value: "low", label: "Low"},
];

const workerColumns: ColumnDef<Worker>[] = [
	{
		id: "select",
		header: ({table}) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
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
	},
	{
		accessorKey: "name",
		header: ({column}) => <DataTableColumnHeader column={column} title="Worker" />,
		cell: ({row}) => <span className="wwc:font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "trade",
		header: ({column}) => <DataTableColumnHeader column={column} title="Trade" />,
		cell: ({row}) => <span className="wwc:text-muted-foreground">{row.original.trade}</span>,
	},
	{
		accessorKey: "company",
		header: ({column}) => <DataTableColumnHeader column={column} title="Company" />,
	},
	{
		accessorKey: "issue",
		header: ({column}) => <DataTableColumnHeader column={column} title="Issue" />,
		cell: ({row}) => <Badge variant="secondary">{issueName(row.original.issue)}</Badge>,
	},
	{
		accessorKey: "arrival",
		header: ({column}) => <DataTableColumnHeader column={column} title="Arrival" />,
		cell: ({row}) => <span className="wwc:tabular-nums">{row.original.arrival}</span>,
	},
	{
		accessorKey: "leave",
		header: ({column}) => <DataTableColumnHeader column={column} title="Exit" />,
		cell: ({row}) => <span className="wwc:tabular-nums">{row.original.leave}</span>,
	},
	{
		accessorKey: "confidence",
		header: ({column}) => <DataTableColumnHeader column={column} title="Confidence" />,
		cell: ({row}) => {
			const c = row.original.confidence;
			return (
				<span className={c >= 0.85 ? "wwc:text-green-600" : c >= 0.6 ? "wwc:text-amber-600" : "wwc:text-red-600"}>
					{Math.round(c * 100)}%
				</span>
			);
		},
	},
	{
		accessorKey: "why",
		header: "Why flagged",
		cell: ({row}) => (
			<span className="wwc:block wwc:max-w-[240px] wwc:truncate wwc:text-xs wwc:text-muted-foreground">
				{row.original.why}
			</span>
		),
	},
];

// ── Main ──

export function VerifyTimeCommandCenter() {
	const [openCase, setOpenCase] = useState<Queue | null>(null);
	const [activeTab, setActiveTab] = useState("summary");
	// Shared date context — a single selection that BOTH tabs (Summary + Worker Records) read.
	const [date, setDate] = useState<Date>(() => new Date());

	// Floating operations-assistant chat.
	const [chatOpen, setChatOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [chatLoading, setChatLoading] = useState(false);
	const msgId = useRef(0);
	const nextId = () => `m${(msgId.current += 1)}`;

	const openInvestigation = (queueId: string) => {
		const queue = QUEUES.find((x) => x.id === queueId);
		if (queue) setOpenCase(queue);
	};

	// The assistant answers by building a focused view from the query, then narrating it as a reply.
	const handleAssistantSend = async (content: string) => {
		setMessages((prev) => [...prev, {id: nextId(), role: "user", type: "text", content, timestamp: new Date()}]);
		setChatLoading(true);
		await new Promise((r) => setTimeout(r, 550));
		const v = buildWorkspaceView(content);
		let reply = `${v.title}\n\n${v.summary}`;
		if (v.workers && v.workers.length > 0) {
			reply +=
				"\n\n" +
				v.workers
					.slice(0, 5)
					.map((w) => `• ${w.name} — ${w.company} (in ${w.arrival}, out ${w.leave})`)
					.join("\n");
		}
		const q = v.queueId ? QUEUES.find((x) => x.id === v.queueId) : undefined;
		if (q) reply += `\n\nOpen the “${q.name}” queue under Needs Attention to investigate ${fmt(q.workers)} workers.`;
		setMessages((prev) => [
			...prev,
			{id: nextId(), role: "assistant", type: "text", content: reply, timestamp: new Date()},
		]);
		setChatLoading(false);
	};

	// Worker Records filter (canonical Filter, beside the DataTable Columns dropdown).
	const [workerFilter, setWorkerFilter] = useState<FilterValue>({});
	const removeWorkerFilter = (categoryId: string, optionValue: string) =>
		setWorkerFilter((prev) => {
			const next = {...prev};
			const kept = (next[categoryId] ?? []).filter((v) => v !== optionValue);
			if (kept.length) next[categoryId] = kept;
			else delete next[categoryId];
			return next;
		});
	const workerFilterLabel = (categoryId: string, value: string) =>
		categoryId === "issue" ? issueName(value) : categoryId === "severity" ? SEVERITY[value as Severity].label : value;
	const filteredWorkers = WORKERS.filter((w) => {
		const issues = workerFilter.issue;
		const companies = workerFilter.company;
		const severities = workerFilter.severity;
		if (issues?.length && !issues.includes(w.issue)) return false;
		if (companies?.length && !companies.includes(w.company)) return false;
		if (severities?.length && !severities.includes(workerSeverity(w.issue))) return false;
		return true;
	});

	const caseData = openCase ? CASES[openCase.id] : null;
	const caseWorkers = openCase ? WORKERS.filter((w) => w.issue === openCase.id) : [];

	// Date-driven figures. Today is live/partial; a past day is fully reconciled. A deterministic per-date
	// factor varies the numbers so switching the date visibly updates both tabs.
	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();
	const dateLabel = date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
	const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
	const factor = isToday ? 1 : 0.82 + (seed % 40) / 100; // 0.82–1.21
	const present = isToday ? SUMMARY.workersPresent : Math.round(SUMMARY.workersPresent * factor);
	const attendanceRate = ((present / SUMMARY.workersTotal) * 100).toFixed(1);
	const belowAvg = Number(attendanceRate) < SUMMARY.attendanceAvg;
	const verifiedHours = isToday ? SUMMARY.verifiedHours : Math.round(SUMMARY.expectedHours * 0.98);
	const verifiedTimecards = isToday ? SUMMARY.verifiedTimecards : SUMMARY.totalTimecards;
	const verifiedPct = Math.round((verifiedTimecards / SUMMARY.totalTimecards) * 100);
	const dayQueues = isToday ? QUEUES : QUEUES.map((q) => ({...q, workers: Math.round(q.workers * factor)}));

	const pageBody = (
		<div className="wwc:w-full wwc:space-y-6 wwc:p-6">
			{/* ── Page header (shared date applies to both tabs) ── */}
			<div className="wwc:flex wwc:flex-wrap wwc:items-start wwc:justify-between wwc:gap-4">
				<div>
					<h1 className="wwc:text-3xl wwc:font-bold wwc:tracking-tight">
						{isToday ? "Today's Workforce Summary" : "Workforce Summary"}
					</h1>
					<p className="wwc:mt-1 wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5 wwc:text-sm wwc:text-muted-foreground">
						<span>Timesheet</span>
						<span aria-hidden>·</span>
						{isToday ? (
							<span className="wwc:inline-flex wwc:items-center wwc:gap-1.5">
								<span className="wwc:h-2 wwc:w-2 wwc:rounded-full wwc:bg-green-500" />
								Live
							</span>
						) : (
							<span className="wwc:font-medium wwc:text-foreground">as of {dateLabel}</span>
						)}
						<span aria-hidden>·</span>
						<span>{fmt(SUMMARY.workersTotal)} workers across the project</span>
					</p>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					{!isToday && (
						<Button variant="ghost" size="sm" onClick={() => setDate(new Date())}>
							Today
						</Button>
					)}
					<DatePicker
						date={date}
						onDateChange={(d) => d && setDate(d)}
						placeholder="Pick a date"
						className="wwc:w-[200px]"
					/>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="wwc:space-y-2">
				<TabsList>
					<TabsTrigger value="summary">Summary</TabsTrigger>
					<TabsTrigger value="workers">Worker Records</TabsTrigger>
				</TabsList>

				<TabsContent value="summary" className="wwc:space-y-10 wwc:pt-4">
					{/* ── Operational briefing ── */}
					<section className="wwc:space-y-5">
						<KPISummary
							columns={4}
							metrics={[
								{
									title: "Workers Present",
									value: fmt(present),
									subtitle: `of ${fmt(SUMMARY.workersTotal)} · ${fmt(SUMMARY.workersTotal - present)} ${isToday ? "not yet on site" : "absent"}`,
									icon: Users,
								},
								{
									title: "Attendance Rate",
									value: `${attendanceRate}%`,
									trend: belowAvg ? "down" : "up",
									trendLabel: `vs ${SUMMARY.attendanceAvg}% avg`,
									status: belowAvg ? "warning" : "success",
									icon: Activity,
								},
								{
									title: "Verified Hours",
									value: fmt(verifiedHours),
									unit: "hrs",
									subtitle: `${Math.round((verifiedHours / SUMMARY.expectedHours) * 100)}% of ${fmt(SUMMARY.expectedHours)} expected`,
									icon: Gauge,
								},
								{
									title: "Verification Progress",
									value: `${verifiedPct}%`,
									subtitle: `${fmt(verifiedTimecards)} of ${fmt(SUMMARY.totalTimecards)} timecards verified`,
									status: verifiedPct === 100 ? "success" : "danger",
									icon: CheckCircle2,
								},
							]}
						/>
					</section>

					{/* ── Needs Attention (compact, count-stable list) ── */}
					<SectionPanel
						icon={AlertTriangle}
						title="Needs Attention"
						count={`${QUEUES.length} queues`}
						height={380}
						bodyClassName="wwc:divide-y wwc:divide-border"
					>
						{dayQueues.map((q) => (
							<SectionPanelRow
								key={q.id}
								title={q.name}
								onClick={() => setOpenCase(q)}
								trailing={
									<>
										<span className="wwc:hidden wwc:text-xs wwc:text-muted-foreground wwc:lg:inline">{q.impact}</span>
										<span className="wwc:text-sm wwc:font-semibold wwc:tabular-nums">{fmt(q.workers)}</span>
										<SeverityTag sev={q.severity} />
									</>
								}
							/>
						))}
					</SectionPanel>

					{/* ── Recommended investigations (compact list) ── */}
					<SectionPanel
						icon={Sparkles}
						title="Recommended Investigations"
						count={isToday ? RECOMMENDATIONS.length : 0}
						height={300}
						bodyClassName="wwc:divide-y wwc:divide-border"
						empty={
							<div className="wwc:px-2 wwc:py-8 wwc:text-center wwc:text-sm wwc:text-muted-foreground">
								No live recommendations for a past date — {dateLabel} is fully reconciled.
							</div>
						}
					>
						{isToday
							? RECOMMENDATIONS.map((r) => (
									<Item key={r.id} className="wwc:flex wwc:items-start wwc:gap-3 wwc:px-2 wwc:py-3">
										<ItemContent className="wwc:min-w-0">
											<ItemTitle>{r.title}</ItemTitle>
											<ItemDescription className="wwc:text-xs wwc:leading-relaxed">
												<span className="wwc:font-medium wwc:text-foreground">Why: </span>
												{r.why}
											</ItemDescription>
										</ItemContent>
										<Button
											variant="outline"
											size="sm"
											className="wwc:shrink-0"
											onClick={() => openInvestigation(r.queueId)}
										>
											{r.cta}
										</Button>
									</Item>
								))
							: null}
					</SectionPanel>
				</TabsContent>

				<TabsContent value="workers" className="wwc:space-y-4 wwc:pt-4">
					{/* ── Worker records (evidence layer) ── */}
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<div>
							<h2 className="wwc:text-xl wwc:font-semibold">Worker Records</h2>
							<p className="wwc:text-sm wwc:text-muted-foreground">
								The evidence layer for {dateLabel} — validate a decision against individual records. Search, sort by
								issue, and bulk-review with the selection bar.
							</p>
						</div>
					</div>

					<DataTable
						columns={workerColumns}
						data={filteredWorkers}
						searchKey="name"
						searchPlaceholder="Search workers…"
						pageSize={10}
						filterStrip={
							Object.keys(workerFilter).length > 0 ? (
								<FilterChips
									value={workerFilter}
									onRemove={removeWorkerFilter}
									onClear={() => setWorkerFilter({})}
									renderLabel={workerFilterLabel}
								/>
							) : undefined
						}
						toolbarExtra={
							<Filter value={workerFilter} onChange={setWorkerFilter}>
								<FilterTrigger />
								<FilterContent>
									<FilterCategory value="issue" label="Issue">
										{FILTER_ISSUES.map((o) => (
											<FilterOption key={o.value} value={o.value}>
												{o.label}
											</FilterOption>
										))}
									</FilterCategory>
									<FilterCategory value="company" label="Company">
										{FILTER_COMPANIES.map((c) => (
											<FilterOption key={c} value={c}>
												{c}
											</FilterOption>
										))}
									</FilterCategory>
									<FilterCategory value="severity" label="Severity">
										{FILTER_SEVERITIES.map((s) => (
											<FilterOption key={s.value} value={s.value}>
												{s.label}
											</FilterOption>
										))}
									</FilterCategory>
								</FilterContent>
							</Filter>
						}
						bulkActions={[
							{
								label: "Bulk review",
								icon: <CheckCircle2 className="wwc:h-3.5 wwc:w-3.5" />,
								onClick: (ids) => toast.success(`${ids.length} records marked as reviewed`),
							},
						]}
					/>
				</TabsContent>
			</Tabs>

			{/* ── Investigation case ── */}
			<Sheet open={!!openCase} onOpenChange={(o) => !o && setOpenCase(null)}>
				<SheetContent className="wwc:w-full wwc:overflow-y-auto wwc:sm:max-w-xl">
					{openCase && caseData && (
						<>
							<SheetHeader>
								<div className="wwc:flex wwc:items-center wwc:gap-2">
									<SeverityTag sev={openCase.severity} />
									<Badge variant="secondary">Investigation</Badge>
								</div>
								<SheetTitle className="wwc:text-xl">{openCase.name}</SheetTitle>
								<SheetDescription>
									{fmt(openCase.workers)} {openCase.unit ?? "workers"} affected · {openCase.impact}
								</SheetDescription>
							</SheetHeader>

							<div className="wwc:space-y-6 wwc:px-4 wwc:py-2">
								<CaseSection title="Summary">
									<p>{openCase.explanation}</p>
								</CaseSection>

								<CaseSection title="What happened">
									<p>{caseData.whatHappened}</p>
								</CaseSection>

								<CaseSection title="Why the system believes this happened">
									<p>{caseData.whyBelieved}</p>
								</CaseSection>

								<CaseSection title="Supporting evidence">
									<ul className="wwc:space-y-1.5">
										{caseData.evidence.map((e) => (
											<li key={e} className="wwc:flex wwc:items-start wwc:gap-2">
												<CheckCircle2 className="wwc:mt-0.5 wwc:h-3.5 wwc:w-3.5 wwc:shrink-0 wwc:text-muted-foreground" />
												<span>{e}</span>
											</li>
										))}
									</ul>
								</CaseSection>

								<CaseSection title="Recommended resolution">
									<p>{caseData.resolution}</p>
								</CaseSection>

								<CaseSection title="Estimated impact">
									<p className="wwc:font-medium wwc:text-foreground">{caseData.impact}</p>
								</CaseSection>

								{caseWorkers.length > 0 && (
									<div className="wwc:space-y-2">
										<div className="wwc:flex wwc:items-center wwc:gap-2">
											<Users className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
											<h4 className="wwc:text-sm wwc:font-semibold">Affected workers (sample)</h4>
										</div>
										<div className="wwc:rounded-lg wwc:border wwc:border-border">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Worker</TableHead>
														<TableHead>Company</TableHead>
														<TableHead>Arrival</TableHead>
														<TableHead>Exit</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{caseWorkers.map((w) => (
														<TableRow key={w.name}>
															<TableCell className="wwc:font-medium">{w.name}</TableCell>
															<TableCell className="wwc:text-muted-foreground">{w.company}</TableCell>
															<TableCell className="wwc:tabular-nums">{w.arrival}</TableCell>
															<TableCell className="wwc:tabular-nums">{w.leave}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
										<Button
											variant="link"
											size="sm"
											className="wwc:px-0"
											onClick={() => {
												setOpenCase(null);
												setActiveTab("workers");
											}}
										>
											Open all in worker records
											<ArrowRight className="wwc:h-3.5 wwc:w-3.5" />
										</Button>
									</div>
								)}
							</div>

							<SheetFooter className="wwc:flex wwc:flex-col wwc:gap-2 wwc:sm:flex-col">
								<p className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Suggested actions</p>
								<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
									{caseData.actions.map((a, i) => (
										<Button
											key={a}
											variant={i === 0 ? "default" : "outline"}
											size="sm"
											onClick={() => toast.success(`${a} — started`)}
										>
											{a}
										</Button>
									))}
								</div>
							</SheetFooter>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);

	// The assistant docks to the right of the page, so it wraps the body rather than floating over it.
	return (
		<FloatingAssistant
			open={chatOpen}
			onOpenChange={setChatOpen}
			messages={messages}
			onMessagesChange={setMessages}
			onSendMessage={handleAssistantSend}
			isLoading={chatLoading}
			triggerLabel="Open operations assistant"
			title="Operations assistant"
			subtitle="Ask about today's verification — missing exits, contractor gaps, payroll risk, or undelivered hours."
			placeholder="Ask about today's workforce…"
			suggestedPrompts={[
				"Show workers missing exits",
				"Compare today with yesterday",
				"Which contractor has the biggest attendance gap?",
				"Explain why undelivered hours increased",
			]}
		>
			{pageBody}
		</FloatingAssistant>
	);
}

function CaseSection({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<div className="wwc:space-y-1.5">
			<h4 className="wwc:text-xs wwc:font-semibold wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
				{title}
			</h4>
			<div className="wwc:text-sm wwc:leading-relaxed wwc:text-muted-foreground">{children}</div>
		</div>
	);
}
