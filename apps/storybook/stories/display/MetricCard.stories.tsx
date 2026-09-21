import type {Meta, StoryObj} from "storybook/internal/types";

import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";
import {MetricCard} from "@wakecap/core-ui/metric-card";
import {Activity, CheckCircle2, Shield, Users} from "lucide-react";

import metricCardManifest from "../../../../manifests/metric-card.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

// Custom autodocs page: standard blocks + the Catalog knowledge panel (decision knowledge from
// library-index.json) + the Widget contract panel (build knowledge from the manifest).
function MetricCardDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={metricCardManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const meta = {
	// Promoted from the inline KPICard in core-org-performance (see manifests/metric-card.widget.json).
	title: "Widgets/Analytics/MetricCard",
	component: MetricCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: MetricCardDocsPage,
			description: {
				component:
					"A single key-metric tile: label, value (+ unit), optional subtitle, trend arrow, and leading icon. The reusable KPI tile dashboards lay out in rows/grids (the unit a future KPISummary composes).",
			},
		},
	},
	decorators: [
		(Story) => (
			<div style={{width: 260}}>
				<Story />
			</div>
		),
	],
	argTypes: {
		trend: {control: "select", options: [undefined, "up", "down", "stable"]},
		status: {control: "select", options: [undefined, "success", "warning", "danger"]},
		title: {control: "text"},
		value: {control: "text"},
		unit: {control: "text"},
		subtitle: {control: "text"},
		trendLabel: {control: "text"},
	},
	args: {title: "Total Workforce", value: "1,240"},
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrend: Story = {
	args: {
		title: "Tasks Completed",
		value: "4,820",
		trend: "up",
		trendLabel: "+12.3% vs target",
		icon: CheckCircle2,
		status: "success",
	},
};

export const WithUnitAndSubtitle: Story = {
	args: {title: "Equipment Online", value: "312", unit: "/ 318", subtitle: "98.2% availability", icon: Activity},
};

export const Minimal: Story = {
	args: {title: "Active Zones", value: 24},
};

export const Grid: Story = {
	decorators: [(Story) => <Story />],
	render: () => (
		<div style={{display: "grid", gridTemplateColumns: "repeat(3, 200px)", gap: 16}}>
			<MetricCard title="Total Workforce" value="1,240" trend="up" trendLabel="+142 today" icon={Users} />
			<MetricCard
				title="Safety Score"
				value="98"
				unit="%"
				trend="up"
				trendLabel="+0.4%"
				icon={Shield}
				status="success"
			/>
			<MetricCard
				title="Open Issues"
				value={7}
				subtitle="3 critical"
				trend="down"
				trendLabel="-2 this week"
				status="warning"
			/>
		</div>
	),
};
