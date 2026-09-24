import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@corensystem/coren-ui/chart";

const meta = {
	title: "Widgets/Charts/Radar Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component: "Radar charts display multivariate data on a two-dimensional chart with multiple axes.",
			},
		},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Basic Radar"
				option={{
					tooltip: {trigger: "item"},
					radar: {
						indicator: [
							{name: "Sales", max: 6500},
							{name: "Admin", max: 16000},
							{name: "Tech", max: 30000},
							{name: "Support", max: 38000},
							{name: "Dev", max: 52000},
							{name: "Marketing", max: 25000},
						],
					},
					series: [
						{
							name: "Budget",
							type: "radar",
							data: [
								{
									value: [4200, 3000, 20000, 35000, 50000, 18000],
									name: "Allocated Budget",
								},
							],
							areaStyle: {opacity: 0.3, color: "#3b82f6"},
							lineStyle: {color: "#3b82f6"},
							itemStyle: {color: "#3b82f6"},
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Comparison"
				option={{
					tooltip: {trigger: "item"},
					legend: {
						data: ["Team A", "Team B"],
						bottom: 0,
						left: "center",
					},
					radar: {
						radius: "60%",
						center: ["50%", "45%"],
						indicator: [
							{name: "Speed", max: 100},
							{name: "Accuracy", max: 100},
							{name: "Quality", max: 100},
							{name: "Efficiency", max: 100},
							{name: "Creativity", max: 100},
						],
					},
					series: [
						{
							name: "Comparison",
							type: "radar",
							symbol: "circle",
							symbolSize: 6,
							data: [
								{
									value: [85, 90, 88, 75, 92],
									name: "Team A",
									areaStyle: {opacity: 0.2, color: "#3b82f6"},
									lineStyle: {width: 2, color: "#3b82f6"},
									itemStyle: {color: "#3b82f6"},
								},
								{
									value: [72, 85, 95, 88, 78],
									name: "Team B",
									areaStyle: {opacity: 0.2, color: "#22c55e"},
									lineStyle: {width: 2, color: "#22c55e"},
									itemStyle: {color: "#22c55e"},
								},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Multi-Series"
				option={{
					tooltip: {trigger: "item"},
					legend: {
						data: ["Q1", "Q2", "Q3", "Q4"],
						bottom: 0,
						left: "center",
					},
					radar: {
						radius: "55%",
						center: ["50%", "45%"],
						indicator: [
							{name: "Revenue", max: 100},
							{name: "Users", max: 100},
							{name: "Retention", max: 100},
							{name: "Growth", max: 100},
							{name: "NPS", max: 100},
							{name: "Engagement", max: 100},
						],
					},
					series: [
						{
							name: "Quarterly",
							type: "radar",
							symbol: "circle",
							symbolSize: 5,
							data: [
								{
									value: [70, 65, 80, 60, 75, 70],
									name: "Q1",
									lineStyle: {color: "#3b82f6"},
									itemStyle: {color: "#3b82f6"},
									areaStyle: {opacity: 0.1, color: "#3b82f6"},
								},
								{
									value: [75, 72, 82, 70, 78, 75],
									name: "Q2",
									lineStyle: {color: "#ef4444"},
									itemStyle: {color: "#ef4444"},
									areaStyle: {opacity: 0.1, color: "#ef4444"},
								},
								{
									value: [82, 80, 85, 78, 82, 80],
									name: "Q3",
									lineStyle: {color: "#22c55e"},
									itemStyle: {color: "#22c55e"},
									areaStyle: {opacity: 0.1, color: "#22c55e"},
								},
								{
									value: [88, 85, 90, 85, 88, 86],
									name: "Q4",
									lineStyle: {color: "#f59e0b"},
									itemStyle: {color: "#f59e0b"},
									areaStyle: {opacity: 0.1, color: "#f59e0b"},
								},
							],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Circle Shape"
				option={{
					tooltip: {trigger: "item"},
					radar: {
						shape: "circle",
						indicator: [
							{name: "HTML", max: 100},
							{name: "CSS", max: 100},
							{name: "JavaScript", max: 100},
							{name: "React", max: 100},
							{name: "Node.js", max: 100},
							{name: "TypeScript", max: 100},
						],
					},
					series: [
						{
							name: "Skills",
							type: "radar",
							symbol: "circle",
							symbolSize: 6,
							data: [
								{
									value: [95, 92, 88, 85, 75, 82],
									name: "Developer Profile",
								},
							],
							areaStyle: {opacity: 0.4, color: "#22c55e"},
							lineStyle: {color: "#22c55e", width: 2},
							itemStyle: {color: "#22c55e"},
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
