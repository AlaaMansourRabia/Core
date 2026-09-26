import {Calendar} from "@corensystem/coren-ui/calendar";
/**
 * Basic calendar with single date selection.
 */
import * as React from "react";

export function Default() {
	const [date, setDate] = React.useState<Date | undefined>(new Date());

	return <Calendar mode="single" selected={date} onSelect={setDate} className="wwc:rounded-md wwc:border" />;
}
