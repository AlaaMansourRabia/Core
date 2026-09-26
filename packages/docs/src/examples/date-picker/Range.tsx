import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Date range picker for selecting start and end dates.
 */
import * as React from "react";
import {DateRange} from "react-day-picker";

export function Range() {
	const [date, setDate] = React.useState<DateRange | undefined>();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={`wwc:w-72 wwc:justify-start wwc:text-left wwc:font-normal ${
						!date ? "wwc:text-muted-foreground" : ""
					}`}
				>
					<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
					{date?.from ? (
						date.to ? (
							<>
								{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
							</>
						) : (
							format(date.from, "LLL dd, y")
						)
					) : (
						<span>Select date range</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="wwc:w-auto wwc:p-0" align="start">
				<Calendar
					initialFocus
					mode="range"
					defaultMonth={date?.from}
					selected={date}
					onSelect={setDate}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}
