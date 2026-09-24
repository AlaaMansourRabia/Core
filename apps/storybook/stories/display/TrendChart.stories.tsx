import type {Meta, StoryObj} from "storybook/internal/types";

import {TrendChart} from "@corensystem/coren-ui/trend-chart";
import {Controls, Description, Primary, Stories, Subtitle, Title} from "@storybook/addon-docs/blocks";

import trendChartManifest from "../../../../manifests/trend-chart.widget.json";
import {ComponentKnowledge} from "../_docs/ComponentKnowledge";
import {WidgetManifestPanel} from "../_docs/WidgetManifestPanel";

function TrendChartDocsPage() {
	return (
		<>
			<Title />
			<Subtitle />
			<Description />
			<ComponentKnowledge />
			<WidgetManifestPanel manifest={trendChartManifest} />
			<Primary />
			<Controls />
			<Stories />
		</>
	);
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const meta = {
	// Promoted from the raw ReactECharts chart cards in core-org-performance (manifests/trend-chart.widget.json).
	title: "Widgets/Charts/Trend Chart",
	component: TrendChart,
	tags: ["autodocs"],
	parameters: {
		docs: {
			page: TrendChartDocsPage,
			description: {
				component:
					"A titled card wrapping a themed ECharts trend/analysis chart (line / bar) — the reusable chart tile in an analytics report. Composes the Chart (ChartContainer) primitive.",
			},
		},
	},
	decorators: [
		(Story) => (
			<div style={{maxWidth: 520}}>
				<Story />
			</div>
		),
	],
	argTypes: {
		title: {control: "text"},
		height: {control: {type: "number"}},
	},
} satisfies Meta<typeof TrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "Headcount",
		height: 240,
		seriesThemes: [{tone: "primary"}, {colorIndex: 2}, {tone: "success"}],
		option: {
			tooltip: {trigger: "axis"},
			grid: {top: 20, right: 20, bottom: 40, left: 40},
			xAxis: {type: "category", data: months},
			yAxis: {type: "value"},
			series: [
				{name: "Expected", type: "bar", data: [120, 132, 140, 138, 150, 160], barWidth: 16},
				{name: "Actual", type: "bar", data: [110, 128, 135, 140, 146, 158], barWidth: 16},
				{name: "Trend", type: "line", data: [110, 128, 135, 140, 146, 158], smooth: true},
			],
		},
	},
};

export const LineOnly: Story = {
	args: {
		title: "Cost Burn vs Baseline",
		height: 240,
		seriesThemes: [{tone: "destructive"}, {tone: "warning"}],
		option: {
			tooltip: {trigger: "axis"},
			grid: {top: 20, right: 20, bottom: 40, left: 50},
			xAxis: {type: "category", data: months},
			yAxis: {type: "value"},
			series: [
				{name: "Actual", type: "line", data: [10, 22, 35, 50, 68, 90], smooth: true},
				{name: "Baseline", type: "line", data: [12, 24, 36, 48, 60, 72], smooth: true},
			],
		},
	},
};
