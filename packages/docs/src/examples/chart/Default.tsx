/**
 * Basic bar chart with sample data.
 */
import {Chart, ChartContainer, ChartBar} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Jan", value: 400},
	{name: "Feb", value: 300},
	{name: "Mar", value: 600},
	{name: "Apr", value: 800},
	{name: "May", value: 500},
];

export function Default() {
	return (
		<ChartContainer className="wwc:h-64 wwc:w-full">
			<Chart data={data}>
				<ChartBar dataKey="value" />
			</Chart>
		</ChartContainer>
	);
}
