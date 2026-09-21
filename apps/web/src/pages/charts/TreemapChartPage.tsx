import ReactECharts from "echarts-for-react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

export function TreemapChartPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Treemap Charts</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Treemap charts for visualizing hierarchical data using nested rectangles.
				</p>
			</div>
			<div className="wwc:grid wwc:gap-6 wwc:md:grid-cols-2">
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Basic Treemap</CardTitle>
						<CardDescription>Department budget allocation</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 350}}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="wwc:pb-2">
						<CardTitle>Flat Treemap</CardTitle>
						<CardDescription>Project time allocation by category</CardDescription>
					</CardHeader>
					<CardContent>
						<ReactECharts
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
							style={{height: 300}}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
