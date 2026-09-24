/**
 * Pie chart for proportional data.
 */
import {Chart, ChartContainer, ChartPie} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Desktop", value: 60},
	{name: "Mobile", value: 30},
	{name: "Tablet", value: 10},
];

export function PieChart() {
	return (
		<ChartContainer className="wwc:h-64 wwc:w-64">
			<Chart data={data}>
				<ChartPie dataKey="value" nameKey="name" />
			</Chart>
		</ChartContainer>
	);
}
