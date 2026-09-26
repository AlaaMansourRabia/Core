import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Use clear, localized date formats.
 */
import * as React from "react";

export function FormatDo() {
	const [date, setDate] = React.useState<Date>(new Date(2024, 11, 25));

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="wwc:w-64 wwc:justify-start wwc:text-left wwc:font-normal">
					<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					{/* Clear, human-readable format */}
					{format(date, "MMMM d, yyyy")}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-auto wwc:p-0">
				<Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
			</PopoverContent>
		</Popover>
	);
}
