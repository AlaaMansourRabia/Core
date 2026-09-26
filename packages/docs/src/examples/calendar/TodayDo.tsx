import {Calendar} from "@corensystem/coren-ui/calendar";
/**
 * Clearly indicate today's date.
 */
import * as React from "react";

export function TodayDo() {
	const [date, setDate] = React.useState<Date | undefined>();

	return (
		<div className="wwc:space-y-2">
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				className="wwc:rounded-md wwc:border"
				// Today is visually distinguished by default
			/>
			<p className="wwc:text-xs wwc:text-muted-foreground">Today's date is highlighted</p>
		</div>
	);
}
