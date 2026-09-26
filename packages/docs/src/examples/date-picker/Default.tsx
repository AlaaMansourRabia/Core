/**
 * Basic date picker with calendar popup.
 */
import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";

export function Default() {
	const [date, setDate] = React.useState<Date>();

	return (
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
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
