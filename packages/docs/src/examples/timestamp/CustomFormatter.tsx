/**
 * Timestamp with custom formatter function.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function CustomFormatter() {
	const date = new Date();
	return (
		<Timestamp
			date={date}
			formatter={(d) => d.toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
			})}
		/>
	);
}
