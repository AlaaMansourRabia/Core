/**
 * Use clear, concise labels.
 */
import {Legend, LegendItem} from "@corensystem/coren-ui/legend";

export function LabelDo() {
	return (
		<Legend>
			<LegendItem color="blue" label="Q1 2024" />
			<LegendItem color="green" label="Q2 2024" />
		</Legend>
	);
}
