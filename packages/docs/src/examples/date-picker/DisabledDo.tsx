import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format, addDays} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Disable invalid date ranges appropriately.
 */
import * as React from "react";

export function DisabledDo() {
	const [date, setDate] = React.useState<Date>();
	const today = new Date();

	return (
		<div className="wwc:space-y-2">
			<p className="wwc:text-sm wwc:text-muted-foreground">Select appointment (next 30 days only)</p>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={`wwc:w-64 wwc:justify-start wwc:text-left wwc:font-normal ${
							!date ? "wwc:text-muted-foreground" : ""
						}`}
					>
						<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						{date ? format(date, "PPP") : <span>Pick a date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-auto wwc:p-0">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
						disabled={(d) => d < today || d > addDays(today, 30)}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
