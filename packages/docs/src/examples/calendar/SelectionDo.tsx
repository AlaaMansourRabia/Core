/**
 * Make selected dates clearly visible.
 */
import * as React from "react";
import {addDays} from "date-fns";
import {DateRange} from "react-day-picker";
import {Calendar} from "@corensystem/coren-ui/calendar";

export function SelectionDo() {
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: new Date(),
		to: addDays(new Date(), 4),
	});

	return (
		<Calendar
			mode="range"
			selected={date}
			onSelect={setDate}
			className="wwc:rounded-md wwc:border"
			// Clear visual distinction for selected range
		/>
	);
}
