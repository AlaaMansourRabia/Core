import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@core/core-ui/chart";

const meta = {
	title: "Widgets/Charts/Treemap Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {description: {component: "Treemap charts for visualizing hierarchical data using nested rectangles."}},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Basic Treemap"
				option={{
					tooltip: {formatter: (p: {name: string; value: number}) => `${p.name}: $${p.value}M`},
					series: [
						{
							type: "treemap",
							data: [
								{
									name: "Engineering",
									value: 45,
									itemStyle: {color: "#3b82f6"},
									children: [
										{name: "Frontend", value: 18},
										{name: "Backend", value: 15},
										{name: "DevOps", value: 12},
									],
								},
								{
									name: "Product",
									value: 25,
									itemStyle: {color: "#22c55e"},
									children: [
										{name: "Design", value: 12},
										{name: "Research", value: 8},
										{name: "PM", value: 5},
									],
								},
								{
									name: "Marketing",
									value: 20,
									itemStyle: {color: "#f59e0b"},
									children: [
										{name: "Digital", value: 10},
										{name: "Content", value: 6},
										{name: "Events", value: 4},
									],
								},
								{
									name: "Operations",
									value: 15,
									itemStyle: {color: "#a855f7"},
									children: [
										{name: "HR", value: 6},
										{name: "Finance", value: 5},
										{name: "Legal", value: 4},
									],
								},
							],
							breadcrumb: {show: true},
							label: {show: true, formatter: "{b}\n${c}M"},
							upperLabel: {show: true, height: 30},
						},
					],
				}}
				height={350}
			/>

			<ChartContainer
				title="Flat Treemap"
				option={{
					tooltip: {formatter: (p: {name: string; value: number}) => `${p.name}: ${p.value} hours`},
					series: [
						{
							type: "treemap",
							roam: false,
							data: [
								{name: "Development", value: 120, itemStyle: {color: "#3b82f6"}},
								{name: "Testing", value: 60, itemStyle: {color: "#ef4444"}},
								{name: "Design", value: 45, itemStyle: {color: "#22c55e"}},
								{name: "Planning", value: 35, itemStyle: {color: "#f59e0b"}},
								{name: "Documentation", value: 25, itemStyle: {color: "#a855f7"}},
								{name: "Deployment", value: 20, itemStyle: {color: "#06b6d4"}},
								{name: "Meetings", value: 40, itemStyle: {color: "#64748b"}},
								{name: "Code Review", value: 30, itemStyle: {color: "#ec4899"}},
							],
							breadcrumb: {show: false},
							label: {show: true, formatter: "{b}\n{c}h", fontSize: 12},
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
