/**
 * Avoid using pie charts for time-series data.
 */
import {Chart, ChartContainer, ChartPie} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Jan", value: 100},
	{name: "Feb", value: 120},
	{name: "Mar", value: 115},
	{name: "Apr", value: 140},
];

export function TypeDont() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-48">
			<Chart data={data}>
				{/* Pie chart is wrong for time-series */}
				<ChartPie dataKey="value" nameKey="name" />
			</Chart>
		</ChartContainer>
	);
}
