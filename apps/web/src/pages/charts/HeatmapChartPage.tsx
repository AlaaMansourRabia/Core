import ReactECharts from "echarts-for-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

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

function generateHeatmapData() {
	const data: [number, number, number][] = [];
	for (let i = 0; i < 7; i++) {
		for (let j = 0; j < 24; j++) {
			// Deterministic data based on position
			data.push([j, i, ((i * 24 + j) * 7 + 3) % 11]);
		}
	}
	return data;
}

const heatmapData = generateHeatmapData();

export function HeatmapChartPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Heatmap Charts</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Heatmap charts for visualizing density and distribution data across two dimensions.
				</p>
			</div>
			<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Weekly Activity Heatmap</CardTitle>
						<CardDescription>Activity levels by hour and day of week</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 350}}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Calendar Heatmap</CardTitle>
						<CardDescription>Contribution-style heatmap with calendar layout</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
										data: Array.from({length: 30}, (_, i) => [
											`2025-06-${String(i + 1).padStart(2, "0")}`,
											(i * 7 + 3) % 16,
										]),
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
