import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@core/core-ui/chart";

const meta = {
	title: "Widgets/Charts/Pie Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {
			description: {component: "Pie charts display data as proportional slices of a circle."},
		},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Basic Pie"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c} ({d}%)"},
					legend: {bottom: 0, left: "center"},
					series: [
						{
							name: "Traffic Source",
							type: "pie",
							radius: "55%",
							center: ["50%", "45%"],
							data: [
								{value: 1048, name: "Search", itemStyle: {color: "#3b82f6"}},
								{value: 735, name: "Direct", itemStyle: {color: "#ef4444"}},
								{value: 580, name: "Email", itemStyle: {color: "#22c55e"}},
								{value: 484, name: "Social", itemStyle: {color: "#f59e0b"}},
								{value: 300, name: "Other", itemStyle: {color: "#a855f7"}},
							],
							emphasis: {scale: true, scaleSize: 10},
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Doughnut"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c} ({d}%)"},
					legend: {bottom: 0, left: "center"},
					series: [
						{
							name: "Revenue",
							type: "pie",
							radius: ["35%", "55%"],
							center: ["50%", "45%"],
							avoidLabelOverlap: false,
							label: {show: false, position: "center"},
							emphasis: {
								scale: true,
								scaleSize: 10,
								label: {show: true, fontSize: 20, fontWeight: "bold"},
							},
							labelLine: {show: false},
							data: [
								{value: 1048, name: "Product A", itemStyle: {color: "#3b82f6"}},
								{value: 735, name: "Product B", itemStyle: {color: "#ef4444"}},
								{value: 580, name: "Product C", itemStyle: {color: "#22c55e"}},
								{value: 484, name: "Product D", itemStyle: {color: "#f59e0b"}},
								{value: 300, name: "Product E", itemStyle: {color: "#a855f7"}},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Rose Chart"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c} ({d}%)"},
					legend: {bottom: 0, left: "center"},
					series: [
						{
							name: "Area Mode",
							type: "pie",
							radius: [20, 100],
							center: ["50%", "45%"],
							roseType: "area",
							itemStyle: {borderRadius: 5},
							emphasis: {scale: true, scaleSize: 8},
							data: [
								{value: 40, name: "rose 1", itemStyle: {color: "#3b82f6"}},
								{value: 33, name: "rose 2", itemStyle: {color: "#ef4444"}},
								{value: 28, name: "rose 3", itemStyle: {color: "#22c55e"}},
								{value: 22, name: "rose 4", itemStyle: {color: "#f59e0b"}},
								{value: 20, name: "rose 5", itemStyle: {color: "#a855f7"}},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Half Doughnut"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c} ({d}%)"},
					legend: {bottom: 0, left: "center"},
					series: [
						{
							name: "Progress",
							type: "pie",
							radius: ["40%", "60%"],
							center: ["50%", "60%"],
							startAngle: 180,
							endAngle: 360,
							emphasis: {scale: true, scaleSize: 10},
							data: [
								{value: 1048, name: "Completed", itemStyle: {color: "#3b82f6"}},
								{value: 735, name: "In Progress", itemStyle: {color: "#22c55e"}},
								{value: 580, name: "Pending", itemStyle: {color: "#a855f7"}},
							],
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
