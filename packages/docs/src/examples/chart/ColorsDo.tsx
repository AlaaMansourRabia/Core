/**
 * Use semantic colors for chart data.
 */
import {Chart, ChartContainer, ChartBar} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Success", value: 80, fill: "var(--color-success)"},
	{name: "Warning", value: 15, fill: "var(--color-warning)"},
	{name: "Error", value: 5, fill: "var(--color-destructive)"},
];

export function ColorsDo() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-full">
			<Chart data={data}>
				<ChartBar dataKey="value" />
			</Chart>
		</ChartContainer>
	);
}
