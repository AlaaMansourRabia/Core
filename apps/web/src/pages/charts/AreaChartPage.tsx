import ReactECharts from "echarts-for-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function AreaChartPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Area Chart</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Area charts display quantitative data with filled regions below the line.
				</p>
			</div>

			<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Basic Area</CardTitle>
						<CardDescription>Simple area chart with single series</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis", axisPointer: {type: "cross"}},
								grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Users",
										type: "line",
										areaStyle: {opacity: 0.4},
										data: [820, 932, 901, 934, 1290, 1330, 1320],
										itemStyle: {color: "#3b82f6"},
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Stacked Area</CardTitle>
						<CardDescription>Multiple series stacked together</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis", axisPointer: {type: "cross"}},
								legend: {
									data: ["Email", "Direct", "Search", "Video"],
									bottom: 0,
									left: "center",
								},
								grid: {left: "3%", right: "4%", bottom: "15%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Email",
										type: "line",
										stack: "Total",
										areaStyle: {opacity: 0.6},
										data: [120, 132, 101, 134, 90, 230, 210],
										itemStyle: {color: "#3b82f6"},
									},
									{
										name: "Direct",
										type: "line",
										stack: "Total",
										areaStyle: {opacity: 0.6},
										data: [220, 182, 191, 234, 290, 330, 310],
										itemStyle: {color: "#ef4444"},
									},
									{
										name: "Search",
										type: "line",
										stack: "Total",
										areaStyle: {opacity: 0.6},
										data: [150, 232, 201, 154, 190, 330, 410],
										itemStyle: {color: "#22c55e"},
									},
									{
										name: "Video",
										type: "line",
										stack: "Total",
										areaStyle: {opacity: 0.6},
										data: [320, 332, 301, 334, 390, 330, 320],
										itemStyle: {color: "#f59e0b"},
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Gradient Area</CardTitle>
						<CardDescription>Area with gradient fill effect</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis", axisPointer: {type: "cross"}},
								grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Traffic",
										type: "line",
										smooth: true,
										showSymbol: true,
										symbolSize: 6,
										lineStyle: {width: 2, color: "#22c55e"},
										itemStyle: {color: "#22c55e"},
										areaStyle: {
											color: {
												type: "linear",
												x: 0,
												y: 0,
												x2: 0,
												y2: 1,
												colorStops: [
													{offset: 0, color: "#22c55e"},
													{offset: 1, color: "transparent"},
												],
											},
										},
										data: [140, 232, 101, 264, 90, 340, 250],
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Smooth Stacked Area</CardTitle>
						<CardDescription>Stacked areas with smooth curves</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis", axisPointer: {type: "cross"}},
								legend: {
									data: ["Line 1", "Line 2", "Line 3"],
									bottom: 0,
									left: "center",
								},
								grid: {left: "3%", right: "4%", bottom: "15%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["Q1", "Q2", "Q3", "Q4"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Line 1",
										type: "line",
										stack: "Total",
										smooth: true,
										areaStyle: {opacity: 0.5},
										data: [140, 232, 101, 264],
										itemStyle: {color: "#3b82f6"},
									},
									{
										name: "Line 2",
										type: "line",
										stack: "Total",
										smooth: true,
										areaStyle: {opacity: 0.5},
										data: [120, 282, 111, 234],
										itemStyle: {color: "#ef4444"},
									},
									{
										name: "Line 3",
										type: "line",
										stack: "Total",
										smooth: true,
										areaStyle: {opacity: 0.5},
										data: [320, 132, 201, 334],
										itemStyle: {color: "#22c55e"},
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
