import {Calendar} from "@corensystem/coren-ui/calendar";
import {addDays} from "date-fns";
/**
 * Calendar with date range selection.
 */
import * as React from "react";
import {DateRange} from "react-day-picker";

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
