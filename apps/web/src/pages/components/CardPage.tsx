import {
	Activity,
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	Calendar,
	CheckCircle2,
	ChevronRight,
	CircleCheck,
	Clock,
	HardHat,
	MapPin,
	Minus,
	Radio,
	ShieldAlert,
	Target,
	TrendingUp,
	Users,
	Wifi,
	X,
	Zap,
} from "lucide-react";
import {useState} from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";

// KPI Card Component - Used in Performance dashboards
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

// Stat Card - Simple icon + value card
function StatCard({
	icon: Icon,
	value,
	label,
	color = "wwc:text-foreground",
}: {
	icon: React.ElementType;
	value: string | number;
	label: string;
	color?: string;
}) {
	return (
		<Card>
			<CardContent className="wwc:p-4">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<div className="wwc:p-2 wwc:rounded-lg wwc:bg-muted">
						<Icon className="wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
					</div>
					<div>
						<p className={`wwc:text-2xl wwc:font-bold ${color}`}>{value}</p>
						<p className="wwc:text-xs wwc:text-muted-foreground">{label}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Info Card - Icon + title + description
function InfoCard({icon: Icon, title, description}: {icon: React.ElementType; title: string; description: string}) {
	return (
		<Card className="wwc:p-3">
			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<Icon className="wwc:mt-0.5 wwc:h-4 wwc:w-4 wwc:text-muted-foreground" />
				<div>
					<p className="wwc:text-sm wwc:font-medium">{title}</p>
					<p className="wwc:text-xs wwc:text-muted-foreground">{description}</p>
				</div>
			</div>
		</Card>
	);
}

// KPI Progress Card - KPI card with progress bar, status icon, and structured secondary metric
function KPIProgressCard({
	title,
	value,
	unit,
	secondaryMetric,
	progress,
	trend,
	trendLabel,
	icon: Icon,
	status,
}: {
	title: string;
	value: string | number;
	unit?: string;
	secondaryMetric?: {label: string; value: string | number};
	progress?: number;
	trend?: "up" | "down" | "stable";
	trendLabel?: string;
	icon?: React.ElementType;
	status?: "success" | "warning" | "danger";
}) {
	const statusColors = {
		success: "wwc:text-emerald-600",
		warning: "wwc:text-amber-600",
		danger: "wwc:text-destructive",
	};

	const progressBarColors = {
		success: "wwc:bg-emerald-500",
		warning: "wwc:bg-amber-500",
		danger: "wwc:bg-destructive",
	};

	const statusIcons = {
		success: <CircleCheck className="wwc:h-5 wwc:w-5 wwc:text-emerald-600" />,
		warning: <AlertTriangle className="wwc:h-5 wwc:w-5 wwc:text-amber-500" />,
		danger: <AlertTriangle className="wwc:h-5 wwc:w-5 wwc:text-destructive" />,
	};

	return (
		<Card>
			<CardContent className="wwc:p-4">
				<div className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-start wwc:justify-between">
						<div className="wwc:space-y-1">
							<p className="wwc:text-xs wwc:text-muted-foreground">{title}</p>
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className="wwc:flex wwc:items-baseline wwc:gap-1">
									<span
										className={`wwc:text-2xl wwc:font-bold ${status ? statusColors[status] : "wwc:text-foreground"}`}
									>
										{value}
									</span>
									{unit && <span className="wwc:text-sm wwc:text-muted-foreground">{unit}</span>}
								</div>
								{status && statusIcons[status]}
							</div>
							{secondaryMetric && (
								<p className="wwc:text-xs wwc:text-muted-foreground">
									{secondaryMetric.label}: {secondaryMetric.value}
								</p>
							)}
							{(trend || trendLabel) && (
								<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:pt-1">
									{trend === "up" && <ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-emerald-600" />}
									{trend === "down" && <ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-destructive" />}
									{trend === "stable" && <Minus className="wwc:h-3 wwc:w-3 wwc:text-muted-foreground" />}
									{trendLabel && (
										<span
											className={`wwc:text-xs ${
												trend === "up"
													? "wwc:text-emerald-600"
													: trend === "down"
														? "wwc:text-destructive"
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
					{progress != null && (
						<div className="wwc:h-2 wwc:w-full wwc:overflow-hidden wwc:rounded-full wwc:bg-muted">
							<div
								className={`wwc:h-full wwc:rounded-full wwc:transition-all ${status ? progressBarColors[status] : "wwc:bg-primary"}`}
								style={{width: `${Math.min(Math.max(progress, 0), 100)}%`}}
							/>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

const ROW_LIST_ITEMS = [
	{title: "Activities", description: "MR-SF-PH1-Z1-RBL-OO1-v2.xer · 10,726 tasks"},
	{title: "LBS Objects", description: "3,136 objects"},
	{title: "Blueprints", description: "51 blueprints uploaded"},
	{title: "BOQ", description: "449 items"},
	{title: "Operations", description: "Optional operation templates"},
	{title: "Activity to LBS Mapping", description: "Upload activity-to-LBS mapping file"},
];

type RowSize = "sm" | "md" | "lg";
type RowItem = {title: string; description: string};

const ROW_SIZE_STYLES: Record<
	RowSize,
	{
		rounded: string;
		spacing: string;
		header: string;
		headerArrow: string;
		contentGap: string;
		titleSize: string;
		descSize: string;
		iconBox: string;
		iconSvg: string;
	}
> = {
	sm: {
		rounded: "wwc:rounded-lg",
		spacing: "wwc:space-y-2",
		header: "wwc:flex wwc:flex-col wwc:gap-0.5 wwc:space-y-0 wwc:px-3 wwc:py-2",
		headerArrow: "wwc:flex wwc:flex-row wwc:items-center wwc:gap-3 wwc:space-y-0 wwc:px-3 wwc:py-2",
		contentGap: "wwc:gap-0.5",
		titleSize: "wwc:text-xs",
		descSize: "wwc:text-xs",
		iconBox: "wwc:h-6 wwc:w-6",
		iconSvg: "wwc:h-3 wwc:w-3",
	},
	md: {
		rounded: "wwc:rounded-2xl",
		spacing: "wwc:space-y-3",
		header: "wwc:flex wwc:flex-col wwc:gap-1 wwc:space-y-0 wwc:px-5 wwc:py-4",
		headerArrow: "wwc:flex wwc:flex-row wwc:items-center wwc:gap-4 wwc:space-y-0 wwc:px-5 wwc:py-4",
		contentGap: "wwc:gap-1",
		titleSize: "wwc:text-sm",
		descSize: "wwc:text-sm",
		iconBox: "wwc:h-8 wwc:w-8",
		iconSvg: "wwc:h-4 wwc:w-4",
	},
	lg: {
		rounded: "wwc:rounded-2xl",
		spacing: "wwc:space-y-4",
		header: "wwc:flex wwc:flex-col wwc:gap-1.5 wwc:space-y-0 wwc:px-6 wwc:py-5",
		headerArrow: "wwc:flex wwc:flex-row wwc:items-center wwc:gap-5 wwc:space-y-0 wwc:px-6 wwc:py-5",
		contentGap: "wwc:gap-1.5",
		titleSize: "wwc:text-base",
		descSize: "wwc:text-sm",
		iconBox: "wwc:h-10 wwc:w-10",
		iconSvg: "wwc:h-5 wwc:w-5",
	},
};

const INTERACTIVE_ROW_BASE =
	"wwc:shadow-none wwc:cursor-pointer wwc:transition-colors wwc:hover:bg-accent wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring";
const INTERACTIVE_ROW_ACTIVE = "wwc:bg-accent/70 wwc:border-2 wwc:border-foreground";

function ToggleRowList({size, items}: {size: RowSize; items: RowItem[]}) {
	const [active, setActive] = useState<string | null>(null);
	const s = ROW_SIZE_STYLES[size];
	return (
		<div className={s.spacing}>
			{items.map((row) => {
				const isActive = active === row.title;
				return (
					<Card
						key={row.title}
						role="button"
						tabIndex={0}
						onClick={() => setActive(isActive ? null : row.title)}
						className={cn(s.rounded, INTERACTIVE_ROW_BASE, isActive && INTERACTIVE_ROW_ACTIVE)}
					>
						<CardHeader className={s.header}>
							<CardTitle className={cn(s.titleSize, "wwc:font-semibold")}>{row.title}</CardTitle>
							<CardDescription className={s.descSize}>{row.description}</CardDescription>
						</CardHeader>
					</Card>
				);
			})}
		</div>
	);
}

function ToggleArrowRowList({size, items}: {size: RowSize; items: RowItem[]}) {
	const [active, setActive] = useState<string | null>(null);
	const s = ROW_SIZE_STYLES[size];
	return (
		<div className={s.spacing}>
			{items.map((row) => {
				const isActive = active === row.title;
				const Icon = isActive ? X : ChevronRight;
				return (
					<Card
						key={row.title}
						role="button"
						tabIndex={0}
						onClick={() => setActive(isActive ? null : row.title)}
						className={cn(s.rounded, INTERACTIVE_ROW_BASE, isActive && INTERACTIVE_ROW_ACTIVE)}
					>
						<CardHeader className={s.headerArrow}>
							<div className={cn("wwc:flex wwc:min-w-0 wwc:flex-1 wwc:flex-col", s.contentGap)}>
								<CardTitle className={cn(s.titleSize, "wwc:font-semibold")}>{row.title}</CardTitle>
								<CardDescription className={s.descSize}>{row.description}</CardDescription>
							</div>
							<span
								aria-hidden
								className={cn(
									s.iconBox,
									"wwc:flex wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-full wwc:border wwc:bg-background wwc:text-muted-foreground",
								)}
							>
								<Icon className={s.iconSvg} />
							</span>
						</CardHeader>
					</Card>
				);
			})}
		</div>
	);
}

export function CardPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Card</h1>
					<CopyButton
						value="Card"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Displays a card with header, content, and footer.</p>
			</div>

			{/* Basic Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Basic Cards</h2>
					<CopyButton
						value="Card - Basic Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<div className="wwc:space-y-4">
					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Basic Card</CardTitle>
								<CopyButton
									value="Card - Basic Card"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>A simple card with title and description.</CardDescription>
						</CardHeader>
						<CardContent>
							<p>Card content goes here. You can put any content inside a card.</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
								<CardTitle>Card with Form</CardTitle>
								<CopyButton
									value="Card - Card with Form"
									className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
								/>
							</div>
							<CardDescription>Create a new project</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:space-y-4">
								<div className="wwc:space-y-2">
									<Label htmlFor="name">Name</Label>
									<Input id="name" placeholder="Project name" />
								</div>
								<div className="wwc:space-y-2">
									<Label htmlFor="description">Description</Label>
									<Input id="description" placeholder="Project description" />
								</div>
							</div>
						</CardContent>
						<CardFooter className="wwc:flex wwc:justify-between">
							<Button variant="outline">Cancel</Button>
							<Button>Create</Button>
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Row List */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Row List</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Stacked cards with a title and description per row. Click a row to toggle its active state — the border
					thickens to a 2px foreground line. Click again to deactivate. Three sizes are available — <code>sm</code> for
					compact menus and dense lists, <code>md</code> as the default, and <code>lg</code> for more spacious sections.
				</p>
				<div className="wwc:flex wwc:flex-col wwc:gap-8 wwc:max-w-3xl">
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Small</span>
						<ToggleRowList size="sm" items={ROW_LIST_ITEMS} />
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Medium (default)</span>
						<ToggleRowList size="md" items={ROW_LIST_ITEMS} />
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Large</span>
						<ToggleRowList size="lg" items={ROW_LIST_ITEMS} />
					</div>
				</div>
			</div>

			{/* Row List with Arrow */}
			<div>
				<h2 className="wwc:text-xl wwc:font-semibold wwc:mb-4">Row List with Arrow</h2>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Each row carries a trailing chevron on the right. Click a row to activate it — the chevron swaps to an{" "}
					<code>X</code> and the border thickens to a 2px foreground line. Click again to deactivate. Three sizes mirror
					the Row List variants.
				</p>
				<div className="wwc:flex wwc:flex-col wwc:gap-8 wwc:max-w-3xl">
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Small</span>
						<ToggleArrowRowList size="sm" items={ROW_LIST_ITEMS} />
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Medium (default)</span>
						<ToggleArrowRowList size="md" items={ROW_LIST_ITEMS} />
					</div>
					<div className="wwc:flex wwc:flex-col wwc:gap-3">
						<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">Large</span>
						<ToggleArrowRowList size="lg" items={ROW_LIST_ITEMS} />
					</div>
				</div>
			</div>

			{/* KPI Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">KPI Cards</h2>
					<CopyButton
						value="Card - KPI Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Cards with metrics, trends, and status indicators for dashboards.
				</p>
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-3 wwc:lg:grid-cols-4 wwc:gap-4">
					<KPICard title="Total Workforce" value="4,287" trend="up" trendLabel="+142 today" icon={Users} />
					<KPICard title="Active Zones" value={24} unit="/ 30" icon={Target} />
					<KPICard title="Equipment Online" value={156} unit="/ 168" subtitle="92.8% availability" icon={Zap} />
					<KPICard title="Tasks Completed" value="1,234" trend="up" trendLabel="+12.3% vs target" icon={CheckCircle2} />
					<KPICard title="Safety Score" value={98.5} unit="%" status="success" trend="up" trendLabel="+2.1%" />
					<KPICard title="CPI" value={0.89} status="warning" trend="down" trendLabel="-0.05" />
					<KPICard title="LTI-Free Days" value={145} status="success" icon={ShieldAlert} />
					<KPICard
						title="Open Issues"
						value={23}
						status="danger"
						trend="up"
						trendLabel="+5 this week"
						icon={AlertTriangle}
					/>
				</div>
			</div>

			{/* KPI Progress Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">KPI Progress Cards</h2>
					<CopyButton
						value="Card - KPI Progress Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					KPI cards with progress bars, status alert icons, and structured secondary metrics.
				</p>
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-3 wwc:lg:grid-cols-4 wwc:gap-4">
					<KPIProgressCard
						title="Anchors Online"
						value="42%"
						secondaryMetric={{label: "IQ", value: "42%"}}
						progress={42}
						status="warning"
						icon={Wifi}
					/>
					<KPIProgressCard
						title="Equipment Uptime"
						value="96.2%"
						secondaryMetric={{label: "Target", value: "95%"}}
						progress={96}
						status="success"
						trend="up"
						trendLabel="+1.2%"
						icon={Zap}
					/>
					<KPIProgressCard
						title="Zone Coverage"
						value="78%"
						unit="/ 100%"
						secondaryMetric={{label: "Active zones", value: "24 / 30"}}
						progress={78}
						status="warning"
						icon={Radio}
					/>
					<KPIProgressCard
						title="Safety Compliance"
						value="23%"
						secondaryMetric={{label: "Violations", value: 8}}
						progress={23}
						status="danger"
						trend="down"
						trendLabel="-12% this week"
						icon={ShieldAlert}
					/>
					<KPIProgressCard
						title="Task Completion"
						value="1,234"
						unit="/ 1,500"
						secondaryMetric={{label: "Completion rate", value: "82%"}}
						progress={82}
						status="success"
						trend="up"
						trendLabel="+45 today"
						icon={CheckCircle2}
					/>
					<KPIProgressCard
						title="Worker Check-in"
						value="4,156"
						unit="/ 4,287"
						secondaryMetric={{label: "Rate", value: "96.9%"}}
						progress={97}
						status="success"
						icon={Users}
					/>
					<KPIProgressCard
						title="Budget Burn"
						value="89%"
						secondaryMetric={{label: "Remaining", value: "$10.5M"}}
						progress={89}
						status="warning"
						trend="stable"
						trendLabel="On pace"
						icon={Target}
					/>
					<KPIProgressCard
						title="Schedule Progress"
						value="15%"
						secondaryMetric={{label: "Days behind", value: 12}}
						progress={15}
						status="danger"
						trend="down"
						trendLabel="-3% vs plan"
						icon={Clock}
					/>
				</div>
			</div>

			{/* Stat Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Stat Cards</h2>
					<CopyButton
						value="Card - Stat Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">Simple cards with icon and value for quick metrics.</p>
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:gap-4">
					<StatCard icon={Users} value="4,287" label="Total Workforce" color="wwc:text-orange-600" />
					<StatCard icon={HardHat} value="4,156" label="Checked In" color="wwc:text-green-600" />
					<StatCard icon={Clock} value={89} label="On Break" color="wwc:text-amber-600" />
					<StatCard icon={ShieldAlert} value={2} label="Critical Alerts" color="wwc:text-red-600" />
				</div>
			</div>

			{/* Stat Variant */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Stat Variant</h2>
					<CopyButton
						value="Card - Stat Variant"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					<code>variant="stat"</code> renders a compact, flat tile — medium radius, a border, and no shadow — meant for
					dense metric bars (the same look as <code>ToolbarStats</code>). The default variant keeps the large radius and
					drop shadow.
				</p>
				<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:gap-3">
					<Card variant="stat" className="wwc:flex wwc:flex-col wwc:gap-1 wwc:px-4 wwc:py-3">
						<span className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Approved
						</span>
						<span className="wwc:text-lg wwc:font-bold wwc:leading-tight wwc:text-foreground">0%</span>
					</Card>
					<Card variant="stat" className="wwc:flex wwc:flex-col wwc:gap-1 wwc:px-4 wwc:py-3">
						<span className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Planned
						</span>
						<span className="wwc:text-lg wwc:font-bold wwc:leading-tight wwc:text-foreground">26.48%</span>
					</Card>
					<Card variant="stat" className="wwc:flex wwc:flex-col wwc:gap-1 wwc:px-4 wwc:py-3">
						<span className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							Variance
						</span>
						<span className="wwc:text-lg wwc:font-bold wwc:leading-tight wwc:text-destructive">-26.48%</span>
					</Card>
					<Card variant="stat" className="wwc:flex wwc:flex-col wwc:gap-1 wwc:px-4 wwc:py-3">
						<span className="wwc:text-[11px] wwc:font-medium wwc:uppercase wwc:tracking-wide wwc:text-muted-foreground">
							BAC
						</span>
						<span className="wwc:text-lg wwc:font-bold wwc:leading-tight wwc:text-foreground">$551,117,394</span>
					</Card>
				</div>
			</div>

			{/* Info Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Info Cards</h2>
					<CopyButton
						value="Card - Info Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">Compact cards for displaying information with icons.</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:lg:grid-cols-3 wwc:gap-4">
					<InfoCard icon={MapPin} title="Location" description="25.2048°N, 55.2708°E" />
					<InfoCard icon={Calendar} title="Timeline" description="Q1 2024 - Q4 2026" />
					<InfoCard icon={Users} title="Project Team" description="12 members assigned" />
				</div>

				{/* Quick Stats Grid */}
				<div className="wwc:grid wwc:grid-cols-2 wwc:gap-3 wwc:mt-4">
					<Card className="wwc:p-3">
						<p className="wwc:text-xs wwc:text-muted-foreground">Phase</p>
						<p className="wwc:text-sm wwc:font-medium">Construction</p>
					</Card>
					<Card className="wwc:p-3">
						<p className="wwc:text-xs wwc:text-muted-foreground">Priority</p>
						<p className="wwc:text-sm wwc:font-medium">High</p>
					</Card>
				</div>
			</div>

			{/* Chart Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Chart Cards</h2>
					<CopyButton
						value="Card - Chart Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">Cards with headers, badges, and content area for charts.</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:gap-4">
					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<MapPin className="wwc:h-4 wwc:w-4" />
								Worker Distribution
								<Badge variant="secondary" className="wwc:ml-auto wwc:text-xs">
									<Activity className="wwc:h-3 wwc:w-3" />
									Live
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="wwc:h-[200px] wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted/50 wwc:rounded-lg">
								<span className="wwc:text-muted-foreground wwc:text-sm">Chart content area</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<CardTitle className="wwc:text-base wwc:flex wwc:items-center wwc:gap-2">
								<TrendingUp className="wwc:h-4 wwc:w-4" />
								Productivity Trends
							</CardTitle>
							<CardDescription>Weekly performance metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="wwc:h-[200px] wwc:flex wwc:items-center wwc:justify-center wwc:bg-muted/50 wwc:rounded-lg">
								<span className="wwc:text-muted-foreground wwc:text-sm">Chart content area</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Progress Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Progress Cards</h2>
					<CopyButton
						value="Card - Progress Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">Cards showing progress indicators and completion status.</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:gap-4">
					<Card>
						<CardHeader className="wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<CardTitle className="wwc:text-base">Project Readiness</CardTitle>
								<span className="wwc:text-sm wwc:font-bold">67%</span>
							</div>
						</CardHeader>
						<CardContent>
							<Progress value={67} className="wwc:h-2" />
							<div className="wwc:flex wwc:justify-between wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
								<span>Phase 2 of 4</span>
								<span>Est. completion: Q4 2026</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="wwc:pb-2">
							<div className="wwc:flex wwc:items-center wwc:justify-between">
								<CardTitle className="wwc:text-base">Budget Utilization</CardTitle>
								<span className="wwc:text-sm wwc:font-bold wwc:text-amber-600">89%</span>
							</div>
						</CardHeader>
						<CardContent>
							<Progress value={89} className="wwc:h-2" />
							<div className="wwc:flex wwc:justify-between wwc:mt-2 wwc:text-xs wwc:text-muted-foreground">
								<span>$78.5M / $89M</span>
								<span>$10.5M remaining</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Alert Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Alert Cards</h2>
					<CopyButton
						value="Card - Alert Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">Cards for displaying alerts and notifications.</p>
				<div className="wwc:space-y-3">
					<Card>
						<CardContent className="wwc:p-3">
							<div className="wwc:flex wwc:items-start wwc:gap-3">
								<div className="wwc:p-1.5 wwc:rounded-full wwc:bg-red-100 wwc:dark:bg-red-900/30">
									<AlertTriangle className="wwc:h-4 wwc:w-4 wwc:text-red-600" />
								</div>
								<div className="wwc:flex-1">
									<p className="wwc:text-sm wwc:font-medium">PPE violation detected in Heavy Equipment zone</p>
									<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">12 min ago</p>
								</div>
								<Badge variant="destructive" className="wwc:text-xs">
									Critical
								</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-3">
							<div className="wwc:flex wwc:items-start wwc:gap-3">
								<div className="wwc:p-1.5 wwc:rounded-full wwc:bg-amber-100 wwc:dark:bg-amber-900/30">
									<AlertTriangle className="wwc:h-4 wwc:w-4 wwc:text-amber-600" />
								</div>
								<div className="wwc:flex-1">
									<p className="wwc:text-sm wwc:font-medium">Zone A approaching capacity limit</p>
									<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">5 min ago</p>
								</div>
								<Badge variant="outline" className="wwc:text-xs wwc:text-amber-600 wwc:border-amber-600">
									Warning
								</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="wwc:p-3">
							<div className="wwc:flex wwc:items-start wwc:gap-3">
								<div className="wwc:p-1.5 wwc:rounded-full wwc:bg-blue-100 wwc:dark:bg-blue-900/30">
									<Activity className="wwc:h-4 wwc:w-4 wwc:text-blue-600" />
								</div>
								<div className="wwc:flex-1">
									<p className="wwc:text-sm wwc:font-medium">Shift change in progress - Zone B</p>
									<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-1">18 min ago</p>
								</div>
								<Badge variant="secondary" className="wwc:text-xs">
									Info
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Project Cards */}
			<div>
				<div className="wwc:group wwc:mb-4 wwc:flex wwc:items-center wwc:gap-3">
					<h2 className="wwc:text-xl wwc:font-semibold">Project Cards</h2>
					<CopyButton
						value="Card - Project Cards"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mb-4">
					Cards for displaying project summaries with thumbnail and KPIs.
				</p>
				<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:lg:grid-cols-3 wwc:gap-4">
					{/* Project Card - On Track */}
					<Card className="wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md">
						<div className="wwc:p-3 wwc:space-y-3">
							{/* Top section: Photo + Title + Description */}
							<div className="wwc:flex wwc:gap-3">
								{/* Thumbnail */}
								<div className="wwc:h-16 wwc:w-24 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
									<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br wwc:from-orange-100 wwc:to-orange-200 wwc:dark:from-orange-900/30 wwc:dark:to-orange-800/30">
										<span className="wwc:text-lg wwc:font-bold wwc:text-orange-600">DT</span>
									</div>
								</div>
								{/* Title + Description */}
								<div className="wwc:min-w-0 wwc:flex-1">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:line-clamp-1">Downtown Tower</h3>
									<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground wwc:line-clamp-2">
										42-story mixed-use development in the city center
									</p>
								</div>
							</div>

							{/* KPIs Row */}
							<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-2 wwc:border-t">
								{/* Schedule */}
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-green-600">72%</span>
										<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Schedule</p>
								</div>
								{/* Cost - CPI */}
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-green-600">1.02</span>
										<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">CPI</p>
								</div>
								{/* Safety - LTI Free Days */}
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-green-600">145</span>
										<ArrowUp className="wwc:h-3 wwc:w-3 wwc:text-green-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">LTI-Free</p>
								</div>
								{/* Workers */}
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center">
										<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">342</span>
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Workers</p>
								</div>
							</div>
						</div>
					</Card>

					{/* Project Card - At Risk */}
					<Card className="wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md">
						<div className="wwc:p-3 wwc:space-y-3">
							<div className="wwc:flex wwc:gap-3">
								<div className="wwc:h-16 wwc:w-24 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
									<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br wwc:from-blue-100 wwc:to-blue-200 wwc:dark:from-blue-900/30 wwc:dark:to-blue-800/30">
										<span className="wwc:text-lg wwc:font-bold wwc:text-blue-600">HB</span>
									</div>
								</div>
								<div className="wwc:min-w-0 wwc:flex-1">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:line-clamp-1">Harbor Bridge</h3>
									<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground wwc:line-clamp-2">
										Infrastructure project connecting mainland to new port
									</p>
								</div>
							</div>

							<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-2 wwc:border-t">
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-amber-600">38%</span>
										<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Schedule</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-amber-600">0.89</span>
										<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">CPI</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-amber-600">67</span>
										<Minus className="wwc:h-3 wwc:w-3 wwc:text-amber-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">LTI-Free</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center">
										<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">128</span>
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Workers</p>
								</div>
							</div>
						</div>
					</Card>

					{/* Project Card - Critical */}
					<Card className="wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md">
						<div className="wwc:p-3 wwc:space-y-3">
							<div className="wwc:flex wwc:gap-3">
								<div className="wwc:h-16 wwc:w-24 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
									<div className="wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br wwc:from-red-100 wwc:to-red-200 wwc:dark:from-red-900/30 wwc:dark:to-red-800/30">
										<span className="wwc:text-lg wwc:font-bold wwc:text-red-600">RC</span>
									</div>
								</div>
								<div className="wwc:min-w-0 wwc:flex-1">
									<h3 className="wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:line-clamp-1">
										Residential Complex A
									</h3>
									<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground wwc:line-clamp-2">
										Luxury apartments with community amenities
									</p>
								</div>
							</div>

							<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-2 wwc:border-t">
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-red-600">15%</span>
										<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Schedule</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-red-600">0.72</span>
										<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">CPI</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
										<span className="wwc:text-sm wwc:font-bold wwc:text-red-600">12</span>
										<ArrowDown className="wwc:h-3 wwc:w-3 wwc:text-red-600" />
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">LTI-Free</p>
								</div>
								<div className="wwc:text-center">
									<div className="wwc:flex wwc:items-center wwc:justify-center">
										<span className="wwc:text-sm wwc:font-bold wwc:text-foreground">45</span>
									</div>
									<p className="wwc:text-[10px] wwc:text-muted-foreground">Workers</p>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* ── API Reference ── */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Card - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Extends native{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<div>"}</code> HTML
						attributes. All sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter) accept
						standard div props.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "className",
										type: "string",
										def: "—",
										desc: "Additional CSS classes for the Card root container.",
									},
									{
										prop: "children",
										type: "ReactNode",
										def: "—",
										desc: "Card content. Typically CardHeader, CardContent, and CardFooter.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Usage */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Usage</CardTitle>
						<CopyButton
							value="Card - Usage"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<pre className="wwc:bg-muted wwc:p-4 wwc:rounded-lg wwc:text-sm wwc:overflow-x-auto">
						{`import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <div className="wwc:group wwc:flex wwc:items-center wwc:gap-3"><CardTitle>Card Title</CardTitle><CopyButton value="Card - Card Title" className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100" /></div>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>`}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
