/**
 * Avoid subtle or unclear selection indicators.
 */
import * as React from "react";

export function SelectionDont() {
	const [start, setStart] = React.useState<number | null>(15);
	const [end, setEnd] = React.useState<number | null>(20);
	const days = Array.from({length: 31}, (_, i) => i + 1);

	const isInRange = (day: number) => {
		if (start && end) return day >= start && day <= end;
		return false;
	};

	return (
		<div className="wwc:w-64 wwc:rounded-md wwc:border wwc:p-4">
			<div className="wwc:mb-2 wwc:text-center wwc:font-medium">January 2024</div>
			<div className="wwc:grid wwc:grid-cols-7 wwc:gap-1 wwc:text-center wwc:text-sm">
				{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
					<div key={i} className="wwc:p-1 wwc:text-muted-foreground">
						{d}
					</div>
				))}
				{days.map((day) => (
					<div
						key={day}
						className={`wwc:cursor-pointer wwc:rounded wwc:p-1 ${
							// Very subtle selection - hard to see range
							isInRange(day) ? "wwc:bg-muted/50" : ""
						} ${day === start || day === end ? "wwc:underline" : ""}`}
					>
						{day}
					</div>
				))}
			</div>
		</div>
	);
}
