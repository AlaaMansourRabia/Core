import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Avoid ambiguous date formats.
 */
import * as React from "react";

export function FormatDont() {
	const [date, setDate] = React.useState<Date>(new Date(2024, 11, 5));

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="wwc:w-64 wwc:justify-start wwc:text-left wwc:font-normal">
					<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					{/* Ambiguous: Is this Dec 5 or May 12? */}
					{format(date, "MM/dd/yy")}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-auto wwc:p-0">
				<Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
			</PopoverContent>
		</Popover>
	);
}
