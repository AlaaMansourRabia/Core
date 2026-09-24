import type {Meta, StoryObj} from "storybook/internal/types";

import {ChartContainer} from "@corensystem/coren-ui/chart";

const hours = [
	"12a",
	"1a",
	"2a",
	"3a",
	"4a",
	"5a",
	"6a",
	"7a",
	"8a",
	"9a",
	"10a",
	"11a",
	"12p",
	"1p",
	"2p",
	"3p",
	"4p",
	"5p",
	"6p",
	"7p",
	"8p",
	"9p",
	"10p",
	"11p",
];
const days = ["Saturday", "Friday", "Thursday", "Wednesday", "Tuesday", "Monday", "Sunday"];

// Seeded data for deterministic snapshots
const heatmapData: [number, number, number][] = [];
for (let i = 0; i < 7; i++) {
	for (let j = 0; j < 24; j++) {
		heatmapData.push([j, i, ((i * 24 + j) * 7 + 3) % 11]);
	}
}

// Seeded calendar data for deterministic snapshots
const calendarData = Array.from({length: 30}, (_, i) => [
	`2025-06-${String(i + 1).padStart(2, "0")}`,
	(i * 7 + 3) % 16,
]);

const meta = {
	title: "Widgets/Charts/Heatmap Chart",
	component: ChartContainer,
	tags: ["autodocs"],
	parameters: {
		chromatic: {disableSnapshot: true},
		docs: {
			description: {component: "Heatmap charts for visualizing density and distribution data across two dimensions."},
		},
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof ChartContainer>;

export const Default: Story = {
	render: () => (
		<div className="wwc:grid wwc:gap-6 wwc:grid-cols-2">
			<ChartContainer
				title="Weekly Activity Heatmap"
				option={{
					tooltip: {
						position: "top",
						formatter: (p: {value: [number, number, number]}) =>
							`${days[p.value[1]]} ${hours[p.value[0]]}: ${p.value[2]}`,
					},
					grid: {left: "15%", right: "4%", bottom: "15%", top: "4%"},
					xAxis: {type: "category", data: hours, splitArea: {show: true}},
					yAxis: {type: "category", data: days, splitArea: {show: true}},
					visualMap: {
						min: 0,
						max: 10,
						calculable: true,
						orient: "horizontal",
						left: "center",
						bottom: 0,
						inRange: {color: ["#e0f2fe", "#3b82f6", "#1e3a5f"]},
					},
					series: [
						{
							type: "heatmap",
							data: heatmapData,
							label: {show: true},
							emphasis: {itemStyle: {shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)"}},
						},
					],
				}}
				height={350}
			/>

			<ChartContainer
				title="Calendar Heatmap"
				option={{
					tooltip: {formatter: (p: {value: [string, number]}) => `${p.value[0]}: ${p.value[1]} contributions`},
					visualMap: {
						min: 0,
						max: 15,
						show: false,
						inRange: {color: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]},
					},
					calendar: {
						range: "2025-06",
						cellSize: ["auto", 20],
						left: "10%",
						right: "10%",
						top: 40,
						itemStyle: {borderWidth: 3, borderColor: "#fff"},
						yearLabel: {show: false},
						dayLabel: {firstDay: 1},
					},
					series: [
						{
							type: "heatmap",
							coordinateSystem: "calendar",
							data: calendarData,
						},
					],
				}}
				height={300}
			/>
		</div>
	),
};
