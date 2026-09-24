import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@corensystem/coren-ui/badge";
import {Card, CardContent, CardDescription, CardHeader} from "@corensystem/coren-ui/card";
import {KPISummary} from "@corensystem/coren-ui/kpi-summary";
import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {AlertTriangle, HardHat, Shield, Users} from "lucide-react";

import kpiSummaryManifest from "../../../../manifests/kpi-summary.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function KPISummaryDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={kpiSummaryManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// A grid of MetricCards (see manifests/kpi-summary.widget.json). Composes @corensystem/coren-ui/metric-card.
	title: "Widgets/Analytics/KPISummary",
	component: KPISummary,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: KPISummaryDocsPage,
			description: {
				component:
					"A responsive grid of MetricCard tiles driven by a single metrics[] array — the reusable KPI summary band above a dashboard or list.",
			},
		},
		layout: "padded",
	},
	argTypes: {
		columns: {control: "select", options: [2, 3, 4]},
	},
	args: {
		columns: 4,
		metrics: [
			{title: "Live Headcount", value: "1,240", trend: "up", trendLabel: "+12", icon: Users},
			{title: "Safety Score", value: "98%", status: "success", subtitle: "0 incidents this week", icon: Shield},
			{title: "PPE Compliance", value: "98.2%", trend: "up", trendLabel: "+0.5%", icon: HardHat},
			{title: "Open Alerts", value: 3, status: "warning", subtitle: "2 critical", icon: AlertTriangle},
		],
	},
} satisfies Meta<typeof KPISummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThreeColumns: Story = {
	args: {
		columns: 3,
		metrics: [
			{title: "Total Workforce", value: "1,240", trend: "up", trendLabel: "+142 today", icon: Users},
			{title: "Safety Score", value: "98%", unit: "", status: "success", icon: Shield},
			{title: "Open Alerts", value: 3, status: "warning", subtitle: "2 critical", icon: AlertTriangle},
		],
	},
};

export const TwoColumns: Story = {
	args: {
		columns: 2,
		metrics: [
			{title: "Live Headcount", value: "1,240", trend: "up", trendLabel: "+12", icon: Users},
			{title: "PPE Compliance", value: "98.2%", trend: "up", trendLabel: "+0.5%", icon: HardHat},
		],
	},
};

/**
 * A bespoke tile (here a multi-badge severity breakdown that exceeds MetricCard's single-trend
 * contract) passed via the `children` trailing slot — it sits as the last cell in the same grid.
 */
export const WithCustomTile: Story = {
	args: {
		columns: 4,
		metrics: [
			{title: "Live Headcount", value: "1,240", trend: "up", trendLabel: "+12", icon: Users},
			{title: "Safety Score", value: "98%", status: "success", subtitle: "0 incidents this week", icon: Shield},
			{title: "PPE Compliance", value: "98.2%", trend: "up", trendLabel: "+0.5%", icon: HardHat},
		],
		children: (
			<Card>
				<CardHeader className="wwc:pb-2">
					<CardDescription className="wwc:flex wwc:items-center wwc:gap-2">
						<AlertTriangle className="wwc:h-4 wwc:w-4" />
						Active Alerts
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:justify-between">
						<div className="wwc:text-2xl wwc:font-bold">4</div>
						<div className="wwc:flex wwc:gap-1">
							<Badge
								variant="outline"
								className="wwc:bg-red-500/10 wwc:text-red-600 wwc:border-red-500/20 wwc:text-xs wwc:px-1.5"
							>
								1
							</Badge>
							<Badge
								variant="outline"
								className="wwc:bg-amber-500/10 wwc:text-amber-600 wwc:border-amber-500/20 wwc:text-xs wwc:px-1.5"
							>
								2
							</Badge>
							<Badge
								variant="outline"
								className="wwc:bg-blue-500/10 wwc:text-blue-600 wwc:border-blue-500/20 wwc:text-xs wwc:px-1.5"
							>
								1
							</Badge>
						</div>
					</div>
					<p className="wwc:text-xs wwc:text-muted-foreground wwc:mt-3">Last alert 2 mins ago</p>
				</CardContent>
			</Card>
		),
	},
};
