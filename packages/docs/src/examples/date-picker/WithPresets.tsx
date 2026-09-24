/**
 * Date picker with preset date options.
 */
import * as React from "react";
import {addDays, format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function WithPresets() {
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
			<PopoverContent className="wwc:flex wwc:w-auto wwc:flex-col wwc:space-y-2 wwc:p-2">
				<Select
					onValueChange={(value) =>
						setDate(addDays(new Date(), parseInt(value)))
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select preset" />
					</SelectTrigger>
					<SelectContent position="popper">
						<SelectItem value="0">Today</SelectItem>
						<SelectItem value="1">Tomorrow</SelectItem>
						<SelectItem value="3">In 3 days</SelectItem>
						<SelectItem value="7">In a week</SelectItem>
					</SelectContent>
				</Select>
				<div className="wwc:rounded-md wwc:border">
					<Calendar
						mode="single"
						selected={date}
						onSelect={setDate}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}
