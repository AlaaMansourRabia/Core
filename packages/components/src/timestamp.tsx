import {cn} from "@corensystem/core-utils";
import * as React from "react";

export interface TimestampProps extends React.TimeHTMLAttributes<HTMLTimeElement> {
	/** The date/time value */
	date: Date | string | number;
	/** Display format: 'relative' shows "2 hours ago", 'date' shows formatted date, 'datetime' shows both */
	format?: "relative" | "date" | "datetime" | "time";
	/** Custom formatter function. Receives the Date object and returns formatted string. */
	formatter?: (date: Date) => string;
}

const formatRelativeTime = (date: Date): string => {
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "just now";
	if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	}
	if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	}
	if (diffInSeconds < 604800) {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	}
	if (diffInSeconds < 2592000) {
		const weeks = Math.floor(diffInSeconds / 604800);
		return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
	}
	if (diffInSeconds < 31536000) {
		const months = Math.floor(diffInSeconds / 2592000);
		return `${months} ${months === 1 ? "month" : "months"} ago`;
	}
	const years = Math.floor(diffInSeconds / 31536000);
	return `${years} ${years === 1 ? "year" : "years"} ago`;
};

/** Displays a formatted timestamp with optional relative time formatting. */
const Timestamp = React.forwardRef<HTMLTimeElement, TimestampProps>(
	({className, date, format = "relative", formatter, ...props}, ref) => {
		const dateObj = date instanceof Date ? date : new Date(date);
		const isoString = dateObj.toISOString();

		const formattedText = React.useMemo(() => {
			if (formatter) return formatter(dateObj);

			switch (format) {
				case "relative":
					return formatRelativeTime(dateObj);
				case "date":
					return dateObj.toLocaleDateString();
				case "datetime":
					return dateObj.toLocaleString();
				case "time":
					return dateObj.toLocaleTimeString();
				default:
					return formatRelativeTime(dateObj);
			}
		}, [dateObj, format, formatter]);

		return (
			<time
				ref={ref}
				dateTime={isoString}
				className={cn("wwc:text-sm wwc:text-muted-foreground", className)}
				{...props}
			>
				{formattedText}
			</time>
		);
	},
);
Timestamp.displayName = "Timestamp";

export {Timestamp};
