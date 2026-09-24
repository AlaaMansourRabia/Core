/**
 * Avoid charts without context or labels.
 */
import {Chart, ChartContainer, ChartLine} from "@corensystem/coren-ui/chart";

const data = [
	{x: 1, y: 4000},
	{x: 2, y: 3000},
	{x: 3, y: 5000},
];

export function LabelsDont() {
	return (
		<ChartContainer className="wwc:h-48 wwc:w-full">
			<Chart data={data}>
				<ChartLine dataKey="y" />
			</Chart>
		</ChartContainer>
	);
}
