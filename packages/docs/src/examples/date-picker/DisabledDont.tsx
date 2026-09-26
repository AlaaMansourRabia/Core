import {Button} from "@corensystem/coren-ui/button";
import {Calendar} from "@corensystem/coren-ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@corensystem/coren-ui/popover";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
/**
 * Avoid allowing selection of invalid dates then showing error.
 */
import * as React from "react";

export function DisabledDont() {
	const [date, setDate] = React.useState<Date>(new Date(2020, 0, 15));
	const today = new Date();
	const isInvalid = date < today;

	return (
		<div className="wwc:space-y-2">
			<p className="wwc:text-sm wwc:text-muted-foreground">Select appointment date</p>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={`wwc:w-64 wwc:justify-start wwc:text-left wwc:font-normal ${
							isInvalid ? "wwc:border-destructive" : ""
						}`}
					>
						<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
						{format(date, "PPP")}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="wwc:w-auto wwc:p-0">
					{/* All dates selectable - validation happens after */}
					<Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
				</PopoverContent>
			</Popover>
			{isInvalid && <p className="wwc:text-sm wwc:text-destructive">Date must be in the future</p>}
		</div>
	);
}
