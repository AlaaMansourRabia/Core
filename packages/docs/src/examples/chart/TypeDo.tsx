/**
 * Choose chart types appropriate for data.
 */
import {Chart, ChartContainer, ChartLine} from "@corensystem/coren-ui/chart";

const data = [
	{date: "Jan", value: 100},
	{date: "Feb", value: 120},
	{date: "Mar", value: 115},
	{date: "Apr", value: 140},
];

export function TypeDo() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-full">
			<Chart data={data}>
				{/* Line chart for time-series data */}
				<ChartLine dataKey="value" />
			</Chart>
		</ChartContainer>
	);
}
