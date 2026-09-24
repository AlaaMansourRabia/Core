import {cn} from "@corensystem/coren-utils";
import {Badge} from "@corensystem/coren-ui/badge";
import {Card} from "@corensystem/coren-ui/card";
import {Input} from "@corensystem/coren-ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@corensystem/coren-ui/table";
import {ChevronDown, Search} from "lucide-react";
import {useState} from "react";

const fmt = (value: number) => value.toLocaleString("en-US");

// ─── Mock BOQ data ───────────────────────────────────────────────────────────

type Status = "Unmapped" | "Draft" | "Partial" | "Ready" | "Active" | "Locked" | "Superseded";

interface BoqRow {
	code: string;
	description: string;
	uom: string;
	qty: number;
	rate: number;
	amount: number;
	status: Status;
	allocation: number; // 0–100
}

interface Division {
	id: string;
	name: string;
	count: number;
	total: number;
	rows: BoqRow[];
}

const DIVISIONS: Division[] = [
	{
		id: "d03",
		name: "Division 03 - Concrete",
		count: 84,
		total: 708_808_836,
		rows: [
			{code: "D03-001", description: "Edge of raft slab; 350 mm high including drop beam 650mm", uom: "m2", qty: 19_891, rate: 30, amount: 596_730, status: "Unmapped", allocation: 0},
			{code: "D03-001", description: "Edge of raft slab; 350 mm high including drop beam 650mm", uom: "m2", qty: 19_891, rate: 30, amount: 596_730, status: "Active", allocation: 100},
			{code: "D03-001", description: "Edge of raft slab; 350 mm high including drop beam 650mm", uom: "m2", qty: 19_891, rate: 30, amount: 596_730, status: "Active", allocation: 100},
			{code: "D03-002", description: "Columns", uom: "m2", qty: 68_566, rate: 50, amount: 3_428_300, status: "Unmapped", allocation: 0},
			{code: "D03-002", description: "Columns", uom: "m2", qty: 68_566, rate: 50, amount: 3_428_300, status: "Active", allocation: 100},
			{code: "D03-003", description: "Suspended slab; 250mm thick", uom: "m3", qty: 12_430, rate: 420, amount: 5_220_600, status: "Ready", allocation: 100},
			{code: "D03-004", description: "Shear walls; 400mm thick", uom: "m2", qty: 8_904, rate: 65, amount: 578_760, status: "Partial", allocation: 60},
		],
	},
	{
		id: "d04",
		name: "Division 04 - Masonry",
		count: 46,
		total: 142_305_120,
		rows: [
			{code: "D04-001", description: "Blockwork; 200mm thick", uom: "m2", qty: 34_210, rate: 45, amount: 1_539_450, status: "Unmapped", allocation: 0},
			{code: "D04-002", description: "Blockwork; 150mm thick", uom: "m2", qty: 22_880, rate: 38, amount: 869_440, status: "Ready", allocation: 100},
			{code: "D04-003", description: "Plaster; internal walls two coats", uom: "m2", qty: 51_300, rate: 22, amount: 1_128_600, status: "Draft", allocation: 0},
		],
	},
];

const COUNT_STATS = [
	{label: "Total Items", value: "1,828"},
	{label: "Unmapped", value: "798"},
	{label: "Draft", value: "0"},
	{label: "Partial", value: "0"},
	{label: "Ready", value: "606"},
	{label: "Active", value: "424"},
];

const STATUS_FILTERS = ["All", "Unmapped", "Draft", "Partial", "Ready", "Active", "Locked", "Superseded"];

const STATUS_VARIANT: Record<Status, "neutralSoft" | "infoSoft" | "successSoft" | "warningSoft"> = {
	Unmapped: "neutralSoft",
	Draft: "neutralSoft",
	Partial: "warningSoft",
	Ready: "successSoft",
	Active: "infoSoft",
	Locked: "neutralSoft",
	Superseded: "neutralSoft",
};

function AllocationBadge({pct}: {pct: number}) {
	const variant = pct >= 100 ? "successSoft" : pct <= 0 ? "dangerSoft" : "warningSoft";
	return <Badge variant={variant}>{pct}%</Badge>;
}

// ─── Cards / sections ────────────────────────────────────────────────────────

function StatCard({label, value, big}: {label: string; value: string; big?: boolean}) {
	return (
		<Card className="wwc:p-4 wwc:shadow-none">
			<p className="wwc:text-xs wwc:text-muted-foreground">{label}</p>
			<p
				className={cn(
					"wwc:mt-1 wwc:font-bold wwc:tabular-nums wwc:text-foreground",
					big ? "wwc:text-lg" : "wwc:text-2xl",
				)}
			>
				{value}
			</p>
		</Card>
	);
}

function DivisionSection({division}: {division: Division}) {
	const [open, setOpen] = useState(true);
	return (
		<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="wwc:flex wwc:w-full wwc:items-center wwc:justify-between wwc:gap-2 wwc:bg-muted/40 wwc:px-4 wwc:py-2.5 wwc:text-left wwc:transition-colors wwc:hover:bg-muted/60"
			>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<ChevronDown className={cn("wwc:h-4 wwc:w-4 wwc:transition-transform", !open && "wwc:-rotate-90")} />
					<span className="wwc:text-sm wwc:font-semibold wwc:uppercase wwc:tracking-wide">{division.name}</span>
					<span className="wwc:text-xs wwc:text-muted-foreground wwc:tabular-nums">{division.count}</span>
				</div>
				<span className="wwc:text-sm wwc:text-muted-foreground wwc:tabular-nums">SAR {fmt(division.total)}</span>
			</button>

			{open && (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>BOQ Code</TableHead>
							<TableHead>Item Description</TableHead>
							<TableHead>UOM</TableHead>
							<TableHead className="wwc:text-right">Qty</TableHead>
							<TableHead className="wwc:text-right">Unit Rate</TableHead>
							<TableHead className="wwc:text-right">Total Amount</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="wwc:text-right">BOQ Allocation %</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{division.rows.map((row, index) => (
							<TableRow key={`${row.code}-${index}`}>
								<TableCell className="wwc:font-medium">{row.code}</TableCell>
								<TableCell className="wwc:max-w-[24rem] wwc:truncate">{row.description}</TableCell>
								<TableCell className="wwc:text-muted-foreground">{row.uom}</TableCell>
								<TableCell className="wwc:text-right wwc:tabular-nums">{fmt(row.qty)}</TableCell>
								<TableCell className="wwc:text-right wwc:tabular-nums wwc:text-muted-foreground">
									SAR {fmt(row.rate)}
								</TableCell>
								<TableCell className="wwc:text-right wwc:tabular-nums">SAR {fmt(row.amount)}</TableCell>
								<TableCell>
									<Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
								</TableCell>
								<TableCell className="wwc:text-right">
									<AllocationBadge pct={row.allocation} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}

// ─── BOQ Dictionary ──────────────────────────────────────────────────────────

/** BOQ Dictionary mockup: contract selector, KPI cards, search + status filters, and a
 * division-grouped BOQ table. Data is mock. Composed from Core Card/Input/Select/Table/Badge. */
export function BoqViewer() {
	const [status, setStatus] = useState("All");

	return (
		<div className="wwc:min-h-0 wwc:flex-1 wwc:overflow-auto wwc:bg-background">
			<div className="wwc:mx-auto wwc:w-full wwc:max-w-[1400px] wwc:space-y-5 wwc:p-6">
				<h1 className="wwc:text-2xl wwc:font-bold wwc:tracking-tight">BOQ Dictionary</h1>

				<Select defaultValue="all">
					<SelectTrigger className="wwc:w-64">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Contracts</SelectItem>
						<SelectItem value="c1">Main Works Contract</SelectItem>
						<SelectItem value="c2">Enabling Works</SelectItem>
					</SelectContent>
				</Select>

				{/* KPI cards */}
				<div className="wwc:space-y-3">
					<div className="wwc:grid wwc:grid-cols-2 wwc:sm:grid-cols-3 wwc:lg:grid-cols-6 wwc:gap-3">
						{COUNT_STATS.map((stat) => (
							<StatCard key={stat.label} label={stat.label} value={stat.value} />
						))}
					</div>
					<div className="wwc:grid wwc:grid-cols-1 wwc:sm:grid-cols-3 wwc:gap-3">
						<StatCard label="Locked" value="0" />
						<StatCard label="BOQ Items Total" value="SAR 1,956,721,738" big />
						<StatCard label="Contract Value" value="SAR 2,233,178,260" big />
					</div>
				</div>

				{/* Search + filters */}
				<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-2">
					<div className="wwc:relative wwc:w-full wwc:max-w-xs">
						<Search className="wwc:pointer-events-none wwc:absolute wwc:left-2.5 wwc:top-1/2 wwc:h-4 wwc:w-4 wwc:-translate-y-1/2 wwc:text-muted-foreground" />
						<Input placeholder="Search by BOQ code or description" className="wwc:pl-8" />
					</div>
					<Select defaultValue="all">
						<SelectTrigger className="wwc:w-44">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Categories</SelectItem>
							<SelectItem value="concrete">Concrete</SelectItem>
							<SelectItem value="masonry">Masonry</SelectItem>
						</SelectContent>
					</Select>
					<div className="wwc:flex wwc:flex-wrap wwc:items-center wwc:gap-1.5">
						{STATUS_FILTERS.map((filter) => (
							<button
								key={filter}
								type="button"
								onClick={() => setStatus(filter)}
								className={cn(
									"wwc:rounded-full wwc:border wwc:px-3 wwc:py-1 wwc:text-xs wwc:font-medium wwc:transition-colors",
									status === filter
										? "wwc:border-foreground wwc:bg-foreground wwc:text-background"
										: "wwc:border-border wwc:text-muted-foreground wwc:hover:bg-muted",
								)}
							>
								{filter}
							</button>
						))}
					</div>
				</div>

				{/* Division-grouped table */}
				<div className="wwc:space-y-3">
					{DIVISIONS.map((division) => (
						<DivisionSection key={division.id} division={division} />
					))}
				</div>
			</div>
		</div>
	);
}
