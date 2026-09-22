import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/core-ui/badge";
import {Button} from "@corensystem/core-ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@corensystem/core-ui/card";
import {Input} from "@corensystem/core-ui/input";
import {Label} from "@corensystem/core-ui/label";
import {Progress} from "@corensystem/core-ui/progress";
import {cn} from "@corensystem/core-utils";
import {
	Activity,
	AlertTriangle,
	ArrowDown,
	ArrowUp,
	Calendar,
	CheckCircle2,
	ChevronRight,
	Clock,
	HardHat,
	MapPin,
	Minus,
	ShieldAlert,
	Target,
	Users,
	X,
} from "lucide-react";
import {useState, type ReactNode} from "react";

const meta = {
	title: "Components/Layout/Card",
	component: Card,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "stat", "floor", "floating", "object", "tv"],
		},
	},
	parameters: {
		docs: {
			description: {
				component:
					"A versatile card container with composable sub-components: CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.",
			},
		},
	},
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Shared size scale (mirrors the Row List sm/md/lg) for the block-card stories ──
type CardSize = "sm" | "md" | "lg";

const CARD_SIZE_STYLES: Record<
	CardSize,
	{
		rounded: string;
		px: string;
		py: string;
		pb: string;
		headerGap: string;
		title: string;
		desc: string;
		body: string;
		button: "sm" | "default" | "lg";
		pad: string;
		stat: string;
		iconBox: string;
		iconSvg: string;
		label: string;
	}
> = {
	sm: {
		rounded: "wwc:rounded-lg",
		px: "wwc:px-3",
		py: "wwc:py-2",
		pb: "wwc:pb-2",
		headerGap: "wwc:gap-0.5",
		title: "wwc:text-xs",
		desc: "wwc:text-xs",
		body: "wwc:text-xs",
		button: "sm",
		pad: "wwc:p-3",
		stat: "wwc:text-xl",
		iconBox: "wwc:p-1.5",
		iconSvg: "wwc:h-3.5 wwc:w-3.5",
		label: "wwc:text-[11px]",
	},
	md: {
		rounded: "wwc:rounded-2xl",
		px: "wwc:px-5",
		py: "wwc:py-4",
		pb: "wwc:pb-4",
		headerGap: "wwc:gap-1",
		title: "wwc:text-sm",
		desc: "wwc:text-sm",
		body: "wwc:text-sm",
		button: "default",
		pad: "wwc:p-4",
		stat: "wwc:text-2xl",
		iconBox: "wwc:p-2",
		iconSvg: "wwc:h-4 wwc:w-4",
		label: "wwc:text-xs",
	},
	lg: {
		rounded: "wwc:rounded-2xl",
		px: "wwc:px-6",
		py: "wwc:py-5",
		pb: "wwc:pb-5",
		headerGap: "wwc:gap-1.5",
		title: "wwc:text-base",
		desc: "wwc:text-sm",
		body: "wwc:text-sm",
		button: "lg",
		pad: "wwc:p-5",
		stat: "wwc:text-3xl",
		iconBox: "wwc:p-2.5",
		iconSvg: "wwc:h-5 wwc:w-5",
		label: "wwc:text-sm",
	},
};

const CARD_SIZES: CardSize[] = ["sm", "md", "lg"];
const CARD_SIZE_LABELS: Record<CardSize, string> = {sm: "Small", md: "Medium (default)", lg: "Large"};

// shadcn-style hover: subtle surface tint + accent border, animated via transition-colors.
const CARD_HOVER = "wwc:transition-colors wwc:hover:bg-accent wwc:hover:border-accent-foreground/20";

function SizedDefaultCard({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<Card className={cn("wwc:w-[350px]", s.rounded, CARD_HOVER)}>
			<CardHeader className={cn(s.px, s.py, s.headerGap, "wwc:space-y-0")}>
				<CardTitle className={s.title}>Card Title</CardTitle>
				<CardDescription className={s.desc}>Card description goes here.</CardDescription>
			</CardHeader>
			<CardContent className={cn(s.px, s.pb, "wwc:pt-0")}>
				<p className={s.body}>Card content goes here. This is the main body of the card.</p>
			</CardContent>
			<CardFooter className={cn(s.px, s.pb, "wwc:pt-0")}>
				<Button size={s.button}>Action</Button>
			</CardFooter>
		</Card>
	);
}

function SizedHeaderOnlyCard({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<Card className={cn("wwc:w-[350px]", s.rounded, CARD_HOVER)}>
			<CardHeader className={cn(s.px, s.py, s.headerGap, "wwc:space-y-0")}>
				<CardTitle className={s.title}>Notifications</CardTitle>
				<CardDescription className={s.desc}>You have 3 unread messages.</CardDescription>
			</CardHeader>
		</Card>
	);
}

function SizedContentOnlyCard({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<Card className={cn("wwc:w-[350px]", s.rounded, CARD_HOVER)}>
			<CardContent className={cn(s.px, s.py)}>
				<p className={s.body}>A minimal card with content only and no header or footer.</p>
			</CardContent>
		</Card>
	);
}

const SIZE_NOTE =
	"Shown in three sizes — `sm` (compact), `md` (default), and `lg` (spacious) — using the same scale as the Row List variants.";

export const Default: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-8">
			{CARD_SIZES.map((size) => (
				<div key={size} className="wwc:flex wwc:flex-col wwc:gap-3">
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{CARD_SIZE_LABELS[size]}</span>
					<SizedDefaultCard size={size} />
				</div>
			))}
		</div>
	),
};

export const HeaderOnly: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-8">
			{CARD_SIZES.map((size) => (
				<div key={size} className="wwc:flex wwc:flex-col wwc:gap-3">
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{CARD_SIZE_LABELS[size]}</span>
					<SizedHeaderOnlyCard size={size} />
				</div>
			))}
		</div>
	),
};

export const ContentOnly: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-8">
			{CARD_SIZES.map((size) => (
				<div key={size} className="wwc:flex wwc:flex-col wwc:gap-3">
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{CARD_SIZE_LABELS[size]}</span>
					<SizedContentOnlyCard size={size} />
				</div>
			))}
		</div>
	),
};

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

export const RowList: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Stacked cards with just a title and description per row. Useful for read-only lists like settings sections, assets, or summaries. Click a row to toggle its active state — the border thickens to a 2px foreground line and the background tints. Click again to deactivate. Three sizes are available: `sm` (compact, for menus and dense lists), `md` (default), and `lg` (spacious).",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-8 wwc:w-[640px]">
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
	),
};

export const RowListWithArrow: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Row-list cards with a trailing chevron on the right. Click a row to activate it — the chevron swaps to an `X` icon and the border thickens to a 2px foreground line. Click again to deactivate. Three sizes mirror the Row List variants.",
			},
		},
	},
	render: () => (
		<div className="wwc:flex wwc:flex-col wwc:gap-8 wwc:w-[640px]">
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
	),
};

function ThreeSizes({children}: {children: (size: CardSize) => ReactNode}) {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-8">
			{CARD_SIZES.map((size) => (
				<div key={size} className="wwc:flex wwc:flex-col wwc:gap-3">
					<span className="wwc:text-xs wwc:font-medium wwc:text-muted-foreground">{CARD_SIZE_LABELS[size]}</span>
					{children(size)}
				</div>
			))}
		</div>
	);
}

function SizedFormCard({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<Card className={cn("wwc:w-[350px]", s.rounded, CARD_HOVER)}>
			<CardHeader className={cn(s.px, s.py, s.headerGap, "wwc:space-y-0")}>
				<CardTitle className={s.title}>Card with Form</CardTitle>
				<CardDescription className={s.desc}>Create a new project</CardDescription>
			</CardHeader>
			<CardContent className={cn(s.px, s.pb, "wwc:pt-0")}>
				<div className="wwc:space-y-3">
					<div className="wwc:space-y-1.5">
						<Label htmlFor={`name-${size}`} className={s.desc}>
							Name
						</Label>
						<Input id={`name-${size}`} placeholder="Project name" />
					</div>
					<div className="wwc:space-y-1.5">
						<Label htmlFor={`description-${size}`} className={s.desc}>
							Description
						</Label>
						<Input id={`description-${size}`} placeholder="Project description" />
					</div>
				</div>
			</CardContent>
			<CardFooter className={cn(s.px, s.pb, "wwc:pt-0 wwc:flex wwc:justify-between")}>
				<Button variant="outline" size={s.button}>
					Cancel
				</Button>
				<Button size={s.button}>Create</Button>
			</CardFooter>
		</Card>
	);
}

function SizedFooterActionsCard({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<Card className={cn("wwc:w-[350px]", s.rounded, CARD_HOVER)}>
			<CardHeader className={cn(s.px, s.py, s.headerGap, "wwc:space-y-0")}>
				<CardTitle className={s.title}>Confirm Action</CardTitle>
				<CardDescription className={s.desc}>Are you sure you want to proceed?</CardDescription>
			</CardHeader>
			<CardContent className={cn(s.px, s.pb, "wwc:pt-0")}>
				<p className={s.body}>This action cannot be undone. Please review carefully before confirming.</p>
			</CardContent>
			<CardFooter className={cn(s.px, s.pb, "wwc:pt-0 wwc:flex wwc:justify-between")}>
				<Button variant="outline" size={s.button}>
					Cancel
				</Button>
				<Button size={s.button}>Confirm</Button>
			</CardFooter>
		</Card>
	);
}

export const WithForm: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedFormCard size={size} />}</ThreeSizes>,
};

export const WithFooterActions: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedFooterActionsCard size={size} />}</ThreeSizes>,
};

const KPI_ITEMS: {
	label: string;
	value: string;
	suffix?: string;
	denom?: string;
	valueColor?: string;
	delta?: string;
	icon?: typeof Users;
}[] = [
	{label: "Total Workforce", value: "4,287", delta: "+142 today", icon: Users},
	{label: "Active Zones", value: "24", denom: "/ 30", icon: Target},
	{label: "Tasks Completed", value: "1,234", delta: "+12.3% vs target", icon: CheckCircle2},
	{label: "Safety Score", value: "98.5", suffix: "%", valueColor: "wwc:text-green-600", delta: "+2.1%"},
];

function SizedKpiGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:gap-4">
			{KPI_ITEMS.map((k) => {
				const Icon = k.icon;
				return (
					<Card key={k.label} className={cn(s.rounded, CARD_HOVER)}>
						<CardContent className={s.pad}>
							<div className="wwc:flex wwc:items-start wwc:justify-between">
								<div className="wwc:space-y-1">
									<p className={cn(s.label, "wwc:text-muted-foreground")}>{k.label}</p>
									<div className="wwc:flex wwc:items-baseline wwc:gap-1">
										<span className={cn(s.stat, "wwc:font-bold", k.valueColor)}>{k.value}</span>
										{(k.suffix || k.denom) && (
											<span className={cn(s.desc, "wwc:text-muted-foreground")}>{k.suffix ?? k.denom}</span>
										)}
									</div>
									{k.delta && (
										<div className="wwc:flex wwc:items-center wwc:gap-1 wwc:pt-1">
											<ArrowUp className={cn(s.iconSvg, "wwc:text-green-600")} />
											<span className={cn(s.label, "wwc:text-green-600")}>{k.delta}</span>
										</div>
									)}
								</div>
								{Icon && (
									<div className={cn("wwc:rounded-lg wwc:bg-muted", s.iconBox)}>
										<Icon className={cn(s.iconSvg, "wwc:text-muted-foreground")} />
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export const KPICards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedKpiGrid size={size} />}</ThreeSizes>,
};

const STAT_ITEMS: {value: string; color: string; label: string; icon: typeof Users}[] = [
	{value: "4,287", color: "wwc:text-orange-600", label: "Total Workforce", icon: Users},
	{value: "4,156", color: "wwc:text-green-600", label: "Checked In", icon: HardHat},
	{value: "89", color: "wwc:text-amber-600", label: "On Break", icon: Clock},
	{value: "2", color: "wwc:text-red-600", label: "Critical Alerts", icon: ShieldAlert},
];

function SizedStatGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-2 wwc:md:grid-cols-4 wwc:gap-4">
			{STAT_ITEMS.map((st) => {
				const Icon = st.icon;
				return (
					<Card key={st.label} className={cn(s.rounded, CARD_HOVER)}>
						<CardContent className={s.pad}>
							<div className="wwc:flex wwc:items-center wwc:gap-2">
								<div className={cn("wwc:rounded-lg wwc:bg-muted", s.iconBox)}>
									<Icon className={cn(s.iconSvg, "wwc:text-muted-foreground")} />
								</div>
								<div>
									<p className={cn(s.stat, "wwc:font-bold", st.color)}>{st.value}</p>
									<p className={cn(s.label, "wwc:text-muted-foreground")}>{st.label}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export const StatCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedStatGrid size={size} />}</ThreeSizes>,
};

const INFO_ITEMS: {label: string; sub: string; icon: typeof Users}[] = [
	{label: "Location", sub: "25.2048°N, 55.2708°E", icon: MapPin},
	{label: "Timeline", sub: "Q1 2024 - Q4 2026", icon: Calendar},
	{label: "Project Team", sub: "12 members assigned", icon: Users},
];

function SizedInfoGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-3 wwc:gap-4">
			{INFO_ITEMS.map((it) => {
				const Icon = it.icon;
				return (
					<Card key={it.label} className={cn(s.rounded, s.pad, CARD_HOVER)}>
						<div className="wwc:flex wwc:items-start wwc:gap-3">
							<Icon className={cn("wwc:mt-0.5", s.iconSvg, "wwc:text-muted-foreground")} />
							<div>
								<p className={cn(s.body, "wwc:font-medium")}>{it.label}</p>
								<p className={cn(s.label, "wwc:text-muted-foreground")}>{it.sub}</p>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}

export const InfoCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedInfoGrid size={size} />}</ThreeSizes>,
};

const PROGRESS_ITEMS: {title: string; pct: number; pctColor?: string; left: string; right: string}[] = [
	{title: "Project Readiness", pct: 67, left: "Phase 2 of 4", right: "Est. completion: Q4 2026"},
	{
		title: "Budget Utilization",
		pct: 89,
		pctColor: "wwc:text-amber-600",
		left: "$78.5M / $89M",
		right: "$10.5M remaining",
	},
];

function SizedProgressGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-2 wwc:gap-4">
			{PROGRESS_ITEMS.map((pr) => (
				<Card key={pr.title} className={cn(s.rounded, CARD_HOVER)}>
					<CardHeader className={cn(s.px, s.py, "wwc:space-y-0 wwc:pb-2")}>
						<div className="wwc:flex wwc:items-center wwc:justify-between">
							<CardTitle className={s.title}>{pr.title}</CardTitle>
							<span className={cn(s.desc, "wwc:font-bold", pr.pctColor)}>{pr.pct}%</span>
						</div>
					</CardHeader>
					<CardContent className={cn(s.px, s.pb, "wwc:pt-0")}>
						<Progress value={pr.pct} className="wwc:h-2" />
						<div className={cn("wwc:flex wwc:justify-between wwc:mt-2", s.label, "wwc:text-muted-foreground")}>
							<span>{pr.left}</span>
							<span>{pr.right}</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export const ProgressCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedProgressGrid size={size} />}</ThreeSizes>,
};

const ALERT_ITEMS: {
	icon: typeof Users;
	iconColor: string;
	bg: string;
	title: string;
	time: string;
	badge: {variant: "destructive" | "outline" | "secondary"; text: string; className?: string};
}[] = [
	{
		icon: AlertTriangle,
		iconColor: "wwc:text-red-600",
		bg: "wwc:bg-red-100 wwc:dark:bg-red-900/30",
		title: "PPE violation detected in Heavy Equipment zone",
		time: "12 min ago",
		badge: {variant: "destructive", text: "Critical"},
	},
	{
		icon: AlertTriangle,
		iconColor: "wwc:text-amber-600",
		bg: "wwc:bg-amber-100 wwc:dark:bg-amber-900/30",
		title: "Zone A approaching capacity limit",
		time: "5 min ago",
		badge: {variant: "outline", text: "Warning", className: "wwc:text-amber-600 wwc:border-amber-600"},
	},
	{
		icon: Activity,
		iconColor: "wwc:text-blue-600",
		bg: "wwc:bg-blue-100 wwc:dark:bg-blue-900/30",
		title: "Shift change in progress - Zone B",
		time: "18 min ago",
		badge: {variant: "secondary", text: "Info"},
	},
];

function SizedAlertList({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:space-y-3 wwc:max-w-[600px]">
			{ALERT_ITEMS.map((al) => {
				const Icon = al.icon;
				return (
					<Card key={al.title} className={cn(s.rounded, CARD_HOVER)}>
						<CardContent className={s.pad}>
							<div className="wwc:flex wwc:items-start wwc:gap-3">
								<div className={cn("wwc:rounded-full", al.bg, s.iconBox)}>
									<Icon className={cn(s.iconSvg, al.iconColor)} />
								</div>
								<div className="wwc:flex-1">
									<p className={cn(s.body, "wwc:font-medium")}>{al.title}</p>
									<p className={cn(s.label, "wwc:text-muted-foreground wwc:mt-1")}>{al.time}</p>
								</div>
								<Badge variant={al.badge.variant} className={cn(s.label, al.badge.className)}>
									{al.badge.text}
								</Badge>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export const AlertCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedAlertList size={size} />}</ThreeSizes>,
};

type ProjectMetric = {v: string; l: string; c: string; trend?: typeof ArrowUp};
const PROJECT_ITEMS: {
	initials: string;
	grad: string;
	initialColor: string;
	title: string;
	desc: string;
	metrics: ProjectMetric[];
}[] = [
	{
		initials: "DT",
		grad: "wwc:from-orange-100 wwc:to-orange-200 wwc:dark:from-orange-900/30 wwc:dark:to-orange-800/30",
		initialColor: "wwc:text-orange-600",
		title: "Downtown Tower",
		desc: "42-story mixed-use development in the city center",
		metrics: [
			{v: "72%", l: "Schedule", c: "wwc:text-green-600", trend: ArrowUp},
			{v: "1.02", l: "CPI", c: "wwc:text-green-600", trend: ArrowUp},
			{v: "145", l: "LTI-Free", c: "wwc:text-green-600", trend: ArrowUp},
			{v: "342", l: "Workers", c: "wwc:text-foreground"},
		],
	},
	{
		initials: "HB",
		grad: "wwc:from-blue-100 wwc:to-blue-200 wwc:dark:from-blue-900/30 wwc:dark:to-blue-800/30",
		initialColor: "wwc:text-blue-600",
		title: "Harbor Bridge",
		desc: "Infrastructure project connecting mainland to new port",
		metrics: [
			{v: "38%", l: "Schedule", c: "wwc:text-amber-600", trend: Minus},
			{v: "0.89", l: "CPI", c: "wwc:text-amber-600", trend: Minus},
			{v: "67", l: "LTI-Free", c: "wwc:text-amber-600", trend: Minus},
			{v: "128", l: "Workers", c: "wwc:text-foreground"},
		],
	},
	{
		initials: "RC",
		grad: "wwc:from-red-100 wwc:to-red-200 wwc:dark:from-red-900/30 wwc:dark:to-red-800/30",
		initialColor: "wwc:text-red-600",
		title: "Residential Complex A",
		desc: "Luxury apartments with community amenities",
		metrics: [
			{v: "15%", l: "Schedule", c: "wwc:text-red-600", trend: ArrowDown},
			{v: "0.72", l: "CPI", c: "wwc:text-red-600", trend: ArrowDown},
			{v: "12", l: "LTI-Free", c: "wwc:text-red-600", trend: ArrowDown},
			{v: "45", l: "Workers", c: "wwc:text-foreground"},
		],
	},
];

function SizedProjectGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-1 wwc:md:grid-cols-3 wwc:gap-4">
			{PROJECT_ITEMS.map((pj) => (
				<Card
					key={pj.title}
					className={cn(s.rounded, "wwc:cursor-pointer wwc:overflow-hidden wwc:transition-all wwc:hover:shadow-md")}
				>
					<div className={cn(s.pad, "wwc:space-y-3")}>
						<div className="wwc:flex wwc:gap-3">
							<div className="wwc:h-16 wwc:w-24 wwc:shrink-0 wwc:overflow-hidden wwc:rounded-md wwc:bg-muted">
								<div
									className={cn(
										"wwc:flex wwc:h-full wwc:w-full wwc:items-center wwc:justify-center wwc:bg-gradient-to-br",
										pj.grad,
									)}
								>
									<span className={cn("wwc:text-lg wwc:font-bold", pj.initialColor)}>{pj.initials}</span>
								</div>
							</div>
							<div className="wwc:min-w-0 wwc:flex-1">
								<h3 className={cn(s.body, "wwc:font-semibold wwc:text-foreground wwc:line-clamp-1")}>{pj.title}</h3>
								<p className={cn("wwc:mt-1", s.label, "wwc:text-muted-foreground wwc:line-clamp-2")}>{pj.desc}</p>
							</div>
						</div>
						<div className="wwc:grid wwc:grid-cols-4 wwc:gap-1 wwc:pt-2 wwc:border-t">
							{pj.metrics.map((m) => {
								const Trend = m.trend;
								return (
									<div key={m.l} className="wwc:text-center">
										<div className="wwc:flex wwc:items-center wwc:justify-center wwc:gap-0.5">
											<span className={cn(s.body, "wwc:font-bold", m.c)}>{m.v}</span>
											{Trend && <Trend className={cn("wwc:h-3 wwc:w-3", m.c)} />}
										</div>
										<p className="wwc:text-[10px] wwc:text-muted-foreground">{m.l}</p>
									</div>
								);
							})}
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

export const ProjectCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedProjectGrid size={size} />}</ThreeSizes>,
};

function SizedMultipleGrid({size}: {size: CardSize}) {
	const s = CARD_SIZE_STYLES[size];
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-4">
			{["Workers", "Zones", "Alerts"].map((title) => (
				<Card key={title} className={cn(s.rounded, CARD_HOVER)}>
					<CardHeader className={cn(s.px, s.py, s.headerGap, "wwc:space-y-0")}>
						<CardTitle className={s.title}>{title}</CardTitle>
						<CardDescription className={s.desc}>Manage your {title.toLowerCase()}.</CardDescription>
					</CardHeader>
					<CardContent className={cn(s.px, s.pb, "wwc:pt-0")}>
						<p className={cn(s.stat, "wwc:font-bold")}>128</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

export const MultipleCards: Story = {
	parameters: {docs: {description: {story: SIZE_NOTE}}},
	render: () => <ThreeSizes>{(size) => <SizedMultipleGrid size={size} />}</ThreeSizes>,
};

// ── Template / example card (thumbnail + title + description) ──

const TEMPLATE_ITEMS: {title: string; description: string; gradient: string; tag?: string}[] = [
	{
		title: "Build a common operating picture",
		description: "A shared, real-time view of a situation that improves coordination across teams.",
		gradient: "wwc:from-slate-700 wwc:to-slate-900",
		tag: "Geospatial",
	},
	{
		title: "Build Vega charts in Workshop",
		description: "A reference module for building your own Vega chart visualizations.",
		gradient: "wwc:from-sky-100 wwc:to-indigo-200",
		tag: "Charts",
	},
	{
		title: "Building a data-rich custom object view",
		description: "Leverage the Object View Editor to create data-rich content for full and panel views.",
		gradient: "wwc:from-violet-200 wwc:to-indigo-300",
		tag: "Object View",
	},
];

function TemplateCard({tpl}: {tpl: (typeof TEMPLATE_ITEMS)[number]}) {
	return (
		<Card
			role="button"
			tabIndex={0}
			className="wwc:flex wwc:flex-col wwc:overflow-hidden wwc:cursor-pointer wwc:transition-colors wwc:hover:border-foreground/30 wwc:hover:bg-accent/30 wwc:focus-visible:outline-none wwc:focus-visible:ring-2 wwc:focus-visible:ring-ring"
		>
			<div className={cn("wwc:relative wwc:aspect-[16/10] wwc:w-full wwc:bg-gradient-to-br", tpl.gradient)}>
				{tpl.tag && (
					<Badge variant="secondary" className="wwc:absolute wwc:left-2 wwc:top-2 wwc:text-[10px]">
						{tpl.tag}
					</Badge>
				)}
			</div>
			<div className="wwc:flex wwc:flex-col wwc:gap-1.5 wwc:p-4">
				<h3 className="wwc:text-[15px] wwc:font-semibold wwc:leading-snug wwc:line-clamp-2">{tpl.title}</h3>
				<p className="wwc:text-[13px] wwc:text-muted-foreground wwc:line-clamp-2">{tpl.description}</p>
			</div>
		</Card>
	);
}

export const TemplateCards: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"A template/example card: a thumbnail (16:10), a title, and a short description. Clickable with a subtle border + tint hover. Used by the `Examples → Template Gallery Dialog` to build a searchable gallery.",
			},
		},
	},
	render: () => (
		<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3 wwc:max-w-[960px]">
			{TEMPLATE_ITEMS.map((tpl) => (
				<TemplateCard key={tpl.title} tpl={tpl} />
			))}
		</div>
	),
};

// ── Surface variants ──────────────────────────────────────────────────────────
// The `variant` prop swaps the Card's surface treatment (radius / fill / shadow / blur)
// without changing its slots. `default` is the standard opaque surface; `stat` is a flat
// dense metric tile; `floor`, `floating`, `object`, and `tv` are frosted panels migrated
// from the Capture app that float over 3D / map content.

const SURFACE_VARIANTS = [
	{variant: "default", label: "Default", blurb: "Standard opaque surface with a drop shadow."},
	{variant: "stat", label: "Stat", blurb: "Flat, dense metric tile — no shadow."},
	{variant: "floor", label: "Floor", blurb: "Frosted muted list surface."},
	{variant: "floating", label: "Floating", blurb: "Translucent glass inspector panel."},
	{variant: "object", label: "Object", blurb: "Glass surface for an object inspector."},
	{variant: "tv", label: "TV", blurb: "Near-opaque frosted kiosk surface."},
] as const;

export const Variant: Story = {
	args: {variant: "floating", children: "Card surface"},
	parameters: {
		docs: {
			description: {story: "A single Card rendered with the selected surface variant (use the `variant` control)."},
		},
	},
	render: (args) => (
		<div className="wwc:max-w-[280px] wwc:p-4">
			<Card {...args} className="wwc:p-4">
				<CardTitle>{String(args.variant ?? "default")} surface</CardTitle>
				<CardDescription>Interior content sits on the selected surface treatment.</CardDescription>
			</Card>
		</div>
	),
};

export const AllVariants: Story = {
	parameters: {
		controls: {disable: true},
		docs: {
			description: {
				story:
					"Every Card surface variant side by side. `default`/`stat` are opaque; `floor`/`floating`/`object`/`tv` are frosted panels that read best over imagery.",
			},
		},
	},
	render: () => (
		<div className="wwc:grid wwc:grid-cols-1 wwc:gap-4 wwc:sm:grid-cols-2 wwc:lg:grid-cols-3 wwc:max-w-[960px] wwc:bg-muted wwc:p-6">
			{SURFACE_VARIANTS.map((s) => (
				<Card key={s.variant} variant={s.variant} className="wwc:p-4">
					<CardTitle className="wwc:text-sm">{s.label}</CardTitle>
					<CardDescription className="wwc:text-xs">{s.blurb}</CardDescription>
				</Card>
			))}
		</div>
	),
};
