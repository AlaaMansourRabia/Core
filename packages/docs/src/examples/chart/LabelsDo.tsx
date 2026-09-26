/**
 * Provide clear axis labels and titles.
 */
import {Chart, ChartContainer, ChartLine, ChartXAxis, ChartYAxis} from "@corensystem/coren-ui/chart";

const data = [
	{month: "Jan", revenue: 4000},
	{month: "Feb", revenue: 3000},
	{month: "Mar", revenue: 5000},
];

export function LabelsDo() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-full">
			<Chart data={data}>
				<ChartXAxis dataKey="month" label="Month" />
				<ChartYAxis label="Revenue ($)" />
				<ChartLine dataKey="revenue" />
			</Chart>
		</ChartContainer>
	);
}
