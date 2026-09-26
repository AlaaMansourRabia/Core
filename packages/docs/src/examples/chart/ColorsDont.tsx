/**
 * Avoid using random or non-semantic colors.
 */
import {Chart, ChartContainer, ChartBar} from "@corensystem/coren-ui/chart";

const data = [
	{name: "Success", value: 80, fill: "#ff00ff"},
	{name: "Warning", value: 15, fill: "#00ffff"},
	{name: "Error", value: 5, fill: "#ffff00"},
];

export function ColorsDont() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-full">
			<Chart data={data}>
				<ChartBar dataKey="value" />
			</Chart>
		</ChartContainer>
	);
}
