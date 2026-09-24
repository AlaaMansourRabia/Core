import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@corensystem/coren-ui/chart";

const meta = {
	title: "Widgets/Charts/Gauge Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {
			description: {
				component: "Gauge charts display a single value within a range, like a speedometer.",
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
				title="Basic Gauge"
				option={{
					tooltip: {formatter: "{b}: {c}%"},
					series: [
						{
							name: "Performance",
							type: "gauge",
							progress: {show: true, width: 18},
							axisLine: {
								lineStyle: {
									width: 18,
									color: [
										[0.3, "#3b82f6"],
										[0.7, "#22c55e"],
										[1, "#a855f7"],
									],
								},
							},
							axisTick: {show: false},
							splitLine: {length: 15, lineStyle: {width: 2, color: "#64748b"}},
							axisLabel: {distance: 25, fontSize: 12},
							anchor: {show: true, size: 20, itemStyle: {borderWidth: 2, color: "#22c55e"}},
							pointer: {width: 5, itemStyle: {color: "#f59e0b"}},
							title: {show: false},
							detail: {
								valueAnimation: true,
								fontSize: 28,
								offsetCenter: [0, "70%"],
								formatter: "{value}%",
							},
							data: [{value: 72, name: "Score"}],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Multi-Gauge"
				option={{
					tooltip: {trigger: "item", formatter: "{b}: {c}%"},
					series: [
						{
							type: "gauge",
							startAngle: 90,
							endAngle: -270,
							pointer: {show: false},
							progress: {
								show: true,
								overlap: false,
								roundCap: true,
								clip: false,
								itemStyle: {borderWidth: 1, borderColor: "#e2e8f0"},
							},
							axisLine: {lineStyle: {width: 40, color: [[1, "#e2e8f0"]]}},
							splitLine: {show: false},
							axisTick: {show: false},
							axisLabel: {show: false},
							data: [
								{
									value: 80,
									name: "CPU",
									title: {offsetCenter: ["0%", "-40%"]},
									detail: {offsetCenter: ["0%", "-20%"]},
									itemStyle: {color: "#3b82f6"},
								},
								{
									value: 65,
									name: "Memory",
									title: {offsetCenter: ["0%", "0%"]},
									detail: {offsetCenter: ["0%", "20%"]},
									itemStyle: {color: "#22c55e"},
								},
								{
									value: 45,
									name: "Disk",
									title: {offsetCenter: ["0%", "40%"]},
									detail: {offsetCenter: ["0%", "60%"]},
									itemStyle: {color: "#a855f7"},
								},
							],
							title: {fontSize: 12},
							detail: {
								width: 50,
								height: 14,
								fontSize: 14,
								formatter: "{value}%",
							},
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Gradient Gauge"
				option={{
					series: [
						{
							type: "gauge",
							center: ["50%", "60%"],
							startAngle: 200,
							endAngle: -20,
							min: 0,
							max: 100,
							splitNumber: 10,
							itemStyle: {
								color: {
									type: "linear",
									x: 0,
									y: 0,
									x2: 1,
									y2: 0,
									colorStops: [
										{offset: 0, color: "#3b82f6"},
										{offset: 0.5, color: "#22c55e"},
										{offset: 1, color: "#a855f7"},
									],
								},
							},
							progress: {show: true, width: 30},
							pointer: {show: false},
							axisLine: {lineStyle: {width: 30, color: [[1, "#e2e8f0"]]}},
							axisTick: {show: false},
							splitLine: {show: false},
							axisLabel: {show: false},
							anchor: {show: false},
							title: {show: false},
							detail: {
								valueAnimation: true,
								width: "60%",
								lineHeight: 40,
								borderRadius: 8,
								offsetCenter: [0, "-10%"],
								fontSize: 36,
								fontWeight: "bold",
								formatter: "{value}%",
							},
							data: [{value: 78}],
						},
					],
				}}
				height={300}
			/>

			<ChartContainer
				title="Speed Gauge"
				option={{
					series: [
						{
							type: "gauge",
							axisLine: {
								lineStyle: {
									width: 20,
									color: [
										[0.3, "#3b82f6"],
										[0.7, "#22c55e"],
										[1, "#a855f7"],
									],
								},
							},
							pointer: {
								itemStyle: {color: "#f59e0b"},
								width: 6,
								length: "60%",
							},
							axisTick: {
								distance: -20,
								length: 8,
								lineStyle: {color: "#fff", width: 2},
							},
							splitLine: {
								distance: -25,
								length: 20,
								lineStyle: {color: "#fff", width: 4},
							},
							axisLabel: {
								distance: 35,
								fontSize: 14,
							},
							detail: {
								valueAnimation: true,
								formatter: "{value} km/h",
								fontSize: 20,
								offsetCenter: [0, "70%"],
							},
							data: [{value: 68}],
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
