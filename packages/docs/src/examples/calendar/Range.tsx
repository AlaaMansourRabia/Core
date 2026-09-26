/**
 * Calendar with date range selection.
 */
import * as React from "react";
import {addDays} from "date-fns";
import {DateRange} from "react-day-picker";
import {Calendar} from "@corensystem/coren-ui/calendar";

export function Range() {
	const [date, setDate] = React.useState<DateRange | undefined>({
		from: new Date(),
		to: addDays(new Date(), 7),
	});

	return (
		<Calendar
			mode="range"
			selected={date}
			onSelect={setDate}
			numberOfMonths={2}
			className="wwc:rounded-md wwc:border"
		/>
	);
}
