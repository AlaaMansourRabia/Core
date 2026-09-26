/**
 * Line chart for trend visualization.
 */
import {Chart, ChartContainer, ChartLine} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Week 1", users: 100},
	{name: "Week 2", users: 150},
	{name: "Week 3", users: 120},
	{name: "Week 4", users: 200},
	{name: "Week 5", users: 180},
];

export function LineChart() {
	return (
		<ChartContainer className="wwc:h-64 wwc:w-full">
			<Chart data={data}>
				<ChartLine dataKey="users" stroke="var(--color-primary)" />
			</Chart>
		</ChartContainer>
	);
}
