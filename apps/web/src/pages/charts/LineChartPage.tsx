import ReactECharts from "echarts-for-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function LineChartPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Line Chart</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Line charts display data as a series of points connected by lines.
				</p>
			</div>

			<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Basic Line</CardTitle>
						<CardDescription>Simple line chart with single series</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis"},
								grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Revenue",
										type: "line",
										data: [820, 932, 901, 934, 1290, 1330],
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
						<CardTitle>Multi-Line</CardTitle>
						<CardDescription>Multiple series for comparison</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis"},
								legend: {
									data: ["Email", "Direct", "Search"],
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
										data: [120, 132, 101, 134, 90, 230, 210],
										itemStyle: {color: "#3b82f6"},
									},
									{
										name: "Direct",
										type: "line",
										data: [220, 182, 191, 234, 290, 330, 310],
										itemStyle: {color: "#ef4444"},
									},
									{
										name: "Search",
										type: "line",
										data: [150, 232, 201, 154, 190, 330, 410],
										itemStyle: {color: "#22c55e"},
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Smooth Line</CardTitle>
						<CardDescription>Curved lines for smoother visualization</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis"},
								grid: {left: "3%", right: "4%", bottom: "3%", containLabel: true},
								xAxis: {
									type: "category",
									boundaryGap: false,
									data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
								},
								yAxis: {type: "value"},
								series: [
									{
										name: "Visitors",
										type: "line",
										smooth: true,
										data: [820, 932, 901, 934, 1290, 1330, 1320],
										itemStyle: {color: "#22c55e"},
									},
								],
							}}
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Step Line</CardTitle>
						<CardDescription>Step-style lines for discrete changes</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
							option={{
								tooltip: {trigger: "axis"},
								legend: {
									data: ["Start", "Middle", "End"],
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
										name: "Start",
										type: "line",
										step: "start",
										data: [120, 132, 101, 134, 90, 230, 210],
										itemStyle: {color: "#3b82f6"},
									},
									{
										name: "Middle",
										type: "line",
										step: "middle",
										data: [220, 282, 201, 234, 290, 430, 410],
										itemStyle: {color: "#ef4444"},
									},
									{
										name: "End",
										type: "line",
										step: "end",
										data: [450, 432, 401, 454, 590, 530, 510],
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
