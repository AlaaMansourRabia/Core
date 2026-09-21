import ReactECharts from "echarts-for-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function BarChartPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Bar Chart</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">Bar charts display categorical data with rectangular bars.</p>
			</div>

			<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Basic Bar</CardTitle>
						<CardDescription>Simple vertical bar chart</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Stacked Bar</CardTitle>
						<CardDescription>Bars stacked on top of each other</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Horizontal Bar</CardTitle>
						<CardDescription>Bars displayed horizontally</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 300}}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Grouped Bar</CardTitle>
						<CardDescription>Compare multiple series side by side</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 300}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
