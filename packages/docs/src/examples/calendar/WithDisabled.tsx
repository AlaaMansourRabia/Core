import {Calendar} from "@corensystem/coren-ui/calendar";
/**
 * Calendar with disabled dates.
 */
import * as React from "react";

export function WithDisabled() {
	const [date, setDate] = React.useState<Date | undefined>();

	// Disable weekends and past dates
	const disabledDays = [
		{dayOfWeek: [0, 6]}, // Sunday and Saturday
		{before: new Date()}, // Past dates
	];

	return (
		<div className="wwc:space-y-4">
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				disabled={disabledDays}
				className="wwc:rounded-md wwc:border"
			/>
			<p className="wwc:text-sm wwc:text-muted-foreground">Weekends and past dates are disabled</p>
		</div>
	);
}
