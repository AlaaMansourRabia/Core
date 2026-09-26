import {Calendar} from "@corensystem/coren-ui/calendar";
/**
 * Avoid forcing users to click through many months.
 */
import * as React from "react";

export function NavigationDont() {
	const [date, setDate] = React.useState<Date | undefined>(new Date());

	return (
		<div className="wwc:space-y-2">
			<p className="wwc:text-sm wwc:text-muted-foreground">Select your birth date (arrow-only navigation)</p>
			<Calendar
				mode="single"
				selected={date}
				onSelect={setDate}
				className="wwc:rounded-md wwc:border"
				// Default navigation only - must click through every month
			/>
		</div>
	);
}
