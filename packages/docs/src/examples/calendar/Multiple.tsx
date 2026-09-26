import {Calendar} from "@corensystem/coren-ui/calendar";
/**
 * Calendar with multiple date selection.
 */
import * as React from "react";

export function Multiple() {
	const [dates, setDates] = React.useState<Date[] | undefined>([
		new Date(),
		new Date(new Date().setDate(new Date().getDate() + 2)),
		new Date(new Date().setDate(new Date().getDate() + 5)),
	]);

	return (
		<div className="wwc:space-y-4">
			<Calendar mode="multiple" selected={dates} onSelect={setDates} className="wwc:rounded-md wwc:border" />
			<p className="wwc:text-sm wwc:text-muted-foreground">{dates?.length || 0} date(s) selected</p>
		</div>
	);
}
