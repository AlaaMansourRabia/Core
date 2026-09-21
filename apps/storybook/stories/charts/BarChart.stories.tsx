import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@core/core-ui/chart";

const meta = {
	title: "Widgets/Charts/Bar Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {
			description: {component: "Bar charts display categorical data with rectangular bars."},
		},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Basic Bar"
				option={{
					tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
					grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
					xAxis: {
						type: "category",
						data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
					},
					yAxis: {type: "value"},
					series: [
						{
							name: "Sales",
							type: "bar",
							data: [120, 200, 150, 80, 70, 110, 130],
							itemStyle: {color: "#3b82f6"},
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Stacked Bar"
				option={{
					tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
					legend: {
						data: ["Direct", "Email", "Affiliate"],
						bottom: 0,
						left: "center",
					},
					grid: {left: "3%", right: "4%", bottom: "15%", containLabel: true},
					xAxis: {
						type: "category",
						data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
					},
					yAxis: {type: "value"},
					series: [
						{
							name: "Direct",
							type: "bar",
							stack: "total",
							data: [320, 302, 301, 334, 390, 330, 320],
							itemStyle: {color: "#3b82f6"},
						},
						{
							name: "Email",
							type: "bar",
							stack: "total",
							data: [120, 132, 101, 134, 90, 230, 210],
							itemStyle: {color: "#ef4444"},
						},
						{
							name: "Affiliate",
							type: "bar",
							stack: "total",
							data: [220, 182, 191, 234, 290, 330, 310],
							itemStyle: {color: "#22c55e"},
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Horizontal Bar"
				option={{
					tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
					grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
					xAxis: {type: "value"},
					yAxis: {
						type: "category",
						data: ["Brazil", "Indonesia", "USA", "India", "China"],
					},
					series: [
						{
							name: "Population",
							type: "bar",
							data: [
								{value: 210, itemStyle: {color: "#3b82f6"}},
								{value: 270, itemStyle: {color: "#ef4444"}},
								{value: 330, itemStyle: {color: "#22c55e"}},
								{value: 1380, itemStyle: {color: "#f59e0b"}},
								{value: 1440, itemStyle: {color: "#a855f7"}},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Grouped Bar"
				option={{
					tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
					legend: {
						data: ["2023", "2024"],
						bottom: 0,
						left: "center",
					},
					grid: {left: "3%", right: "4%", bottom: "15%", containLabel: true},
					xAxis: {
						type: "category",
						data: ["Q1", "Q2", "Q3", "Q4"],
					},
					yAxis: {type: "value"},
					series: [
						{
							name: "2023",
							type: "bar",
							data: [420, 380, 450, 520],
							itemStyle: {color: "#3b82f6"},
						},
						{
							name: "2024",
							type: "bar",
							data: [480, 420, 510, 580],
							itemStyle: {color: "#22c55e"},
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
