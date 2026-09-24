/**
 * Avoid date pickers without labels or keyboard support.
 */
import * as React from "react";
import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";

export function A11yDont() {
	const [date, setDate] = React.useState<Date>();
	const [open, setOpen] = React.useState(false);

	return (
		<div className="wwc:relative wwc:w-64">
			{/* No label, custom implementation without keyboard nav */}
			<div
				className="wwc:flex wwc:h-10 wwc:w-full wwc:cursor-pointer wwc:items-center wwc:rounded-md wwc:border wwc:px-3"
				onClick={() => setOpen(!open)}
			>
				<CalendarIcon className="wwc:mr-2 wwc:h-4 wwc:w-4" />
				<span className={!date ? "wwc:text-muted-foreground" : ""}>
					{date ? format(date, "PPP") : "Pick date"}
				</span>
			</div>
			{open && (
				<div className="wwc:absolute wwc:top-full wwc:mt-1 wwc:rounded-md wwc:border wwc:bg-popover wwc:p-2 wwc:shadow-md">
					{/* Custom calendar without keyboard navigation */}
					<div className="wwc:grid wwc:grid-cols-7 wwc:gap-1 wwc:text-center wwc:text-xs">
						{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
							<div key={i} className="wwc:p-1 wwc:text-muted-foreground">{d}</div>
						))}
						{Array.from({length: 31}, (_, i) => (
							<div
								key={i}
								className="wwc:cursor-pointer wwc:rounded wwc:p-1 wwc:hover:bg-accent"
								onClick={() => {
									setDate(new Date(2024, 0, i + 1));
									setOpen(false);
								}}
							>
								{i + 1}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
