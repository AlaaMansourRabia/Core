/**
 * Chart with legend for multiple data series.
 */
import {Chart, ChartContainer, ChartBar, ChartLegend} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Q1", revenue: 4000, expenses: 2400},
	{name: "Q2", revenue: 3000, expenses: 1398},
	{name: "Q3", revenue: 5000, expenses: 3800},
	{name: "Q4", revenue: 4500, expenses: 2800},
];

export function WithLegend() {
	return (
		<ChartContainer className="wwc:h-64 wwc:w-full">
			<Chart data={data}>
				<ChartBar dataKey="revenue" fill="var(--color-primary)" />
				<ChartBar dataKey="expenses" fill="var(--color-muted)" />
				<ChartLegend />
			</Chart>
		</ChartContainer>
	);
}
