/**
 * Date picker integrated with form validation.
 */
import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {Label} from "@corensystem/coren-ui/label";

export function WithForm() {
	const [date, setDate] = React.useState<Date>();
	const [error, setError] = React.useState<string>();

	const handleSelect = (selectedDate: Date | undefined) => {
		setDate(selectedDate);
		if (selectedDate && selectedDate < new Date()) {
			setError("Date must be in the future");
		} else {
			setError(undefined);
		}
	};

	return (
		<div className="wwc:grid wwc:w-full wwc:max-w-sm wwc:gap-1.5">
			<Label htmlFor="date-picker-form">Event date</Label>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						id="date-picker-form"
						variant="outline"
						className={`wwc:w-full wwc:justify-start wwc:text-left wwc:font-normal ${
							!date ? "wwc:text-muted-foreground" : ""
						} ${error ? "wwc:border-destructive" : ""}`}
					>
						<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						{date ? format(date, "PPP") : <span>Select event date</span>}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-auto wwc:p-0">
					<Calendar
						mode="single"
						selected={date}
						onSelect={handleSelect}
						initialFocus
					/>
				</PopoverContent>
			</Popover>
			{error && (
				<p className="wwc:text-sm wwc:text-destructive">{error}</p>
			)}
		</div>
	);
}
