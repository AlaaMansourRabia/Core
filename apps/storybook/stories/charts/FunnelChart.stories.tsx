import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@corensystem/core-ui/chart";

const meta = {
	title: "Widgets/Charts/Funnel Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {description: {component: "Funnel charts for visualizing progressive reduction of data through stages."}},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Basic Funnel"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c}"},
					legend: {data: ["Visits", "Inquiries", "Orders", "Clicks", "Shows"], bottom: 0},
					series: [
						{
							type: "funnel",
							left: "10%",
							top: 20,
							bottom: 40,
							width: "80%",
							min: 0,
							max: 100,
							sort: "descending",
							gap: 2,
							label: {show: true, position: "inside", formatter: "{b}: {c}"},
							itemStyle: {borderColor: "#fff", borderWidth: 1},
							data: [
								{value: 100, name: "Visits", itemStyle: {color: "#3b82f6"}},
								{value: 80, name: "Inquiries", itemStyle: {color: "#22c55e"}},
								{value: 60, name: "Orders", itemStyle: {color: "#f59e0b"}},
								{value: 40, name: "Clicks", itemStyle: {color: "#a855f7"}},
								{value: 20, name: "Shows", itemStyle: {color: "#ef4444"}},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Comparison Funnel"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c}%"},
					series: [
						{
							type: "funnel",
							left: "10%",
							top: 20,
							bottom: 20,
							width: "80%",
							sort: "ascending",
							gap: 2,
							label: {show: true, position: "inside", formatter: "{b}\n{c}%", fontSize: 12},
							itemStyle: {borderColor: "#fff", borderWidth: 1},
							data: [
								{value: 15, name: "Awareness", itemStyle: {color: "#64748b"}},
								{value: 30, name: "Interest", itemStyle: {color: "#06b6d4"}},
								{value: 50, name: "Consideration", itemStyle: {color: "#3b82f6"}},
								{value: 70, name: "Intent", itemStyle: {color: "#22c55e"}},
								{value: 90, name: "Purchase", itemStyle: {color: "#f59e0b"}},
								{value: 100, name: "Loyalty", itemStyle: {color: "#ef4444"}},
							],
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
