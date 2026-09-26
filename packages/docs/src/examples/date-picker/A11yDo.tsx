import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Label} from "@corensystem/coren-ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Include proper labels and keyboard support.
 */
import * as React from "react";

export function A11yDo() {
	const [date, setDate] = React.useState<Date>();

	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:gap-1.5">
			<Label htmlFor="a11y-date-picker">Birth date</Label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="a11y-date-picker"
						variant="outline"
						aria-label={date ? `Selected date: ${format(date, "PPPP")}` : "Choose birth date"}
						className={`wwc:w-full wwc:justify-start wwc:text-left wwc:font-normal ${
							!date ? "wwc:text-muted-foreground" : ""
						}`}
					>
						<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" aria-hidden />
						{date ? format(date, "PPP") : <span>Select your birth date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-auto wwc:p-0">
					<Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
				</PopoverContent>
			</Popover>
			<p className="wwc:text-xs wwc:text-muted-foreground">Use arrow keys to navigate calendar</p>
		</div>
	);
}
