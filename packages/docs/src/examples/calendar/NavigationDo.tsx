/**
 * Provide clear month/year navigation.
 */
import * as React from "react";
import {Calendar} from "@corensystem/coren-ui/calendar";

export function NavigationDo() {
	const [date, setDate] = React.useState<Date | undefined>(new Date());

	return (
		<Calendar
			mode="single"
			selected={date}
			onSelect={setDate}
			showOutsideDays
			className="wwc:rounded-md wwc:border"
			captionLayout="dropdown-buttons"
			fromYear={2020}
			toYear={2030}
		/>
	);
}
