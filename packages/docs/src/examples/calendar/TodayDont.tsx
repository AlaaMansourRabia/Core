/**
 * Avoid calendars without today indicator.
 */
import * as React from "react";

export function TodayDont() {
	const [selected, setSelected] = React.useState<number | null>(null);
	const days = Array.from({length: 31}, (_, i) => i + 1);

	return (
		<div className="wwc:w-64 wwc:rounded-md wwc:border wwc:p-4">
			<div className="wwc:mb-2 wwc:text-center wwc:font-medium">January 2024</div>
			<div className="wwc:grid wwc:grid-cols-7 wwc:gap-1 wwc:text-center wwc:text-sm">
				{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
					<div key={i} className="wwc:p-1 wwc:text-muted-foreground">
						{d}
					</div>
				))}
				{/* No way to tell which day is today */}
				{days.map((day) => (
					<div
						key={day}
						onClick={() => setSelected(day)}
						className={`wwc:cursor-pointer wwc:rounded wwc:p-1 wwc:hover:bg-accent ${
							selected === day ? "wwc:bg-primary wwc:text-primary-foreground" : ""
						}`}
					>
						{day}
					</div>
				))}
			</div>
		</div>
	);
}
