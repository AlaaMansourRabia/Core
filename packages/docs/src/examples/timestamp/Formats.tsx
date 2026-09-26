/**
 * Different timestamp format options.
 */
import {Timestamp} from "@corensystem/coren-ui/timestamp";

export function Formats() {
	const date = new Date();
	return (
		<div className="wwc:space-y-2">
			<div className="wwc:text-sm">
				<span className="wwc:text-muted-foreground">Relative: </span>
				<Timestamp date={date} format="relative" />
			</div>
			<div className="wwc:text-sm">
				<span className="wwc:text-muted-foreground">Date: </span>
				<Timestamp date={date} format="date" />
			</div>
			<div className="wwc:text-sm">
				<span className="wwc:text-muted-foreground">Time: </span>
				<Timestamp date={date} format="time" />
			</div>
			<div className="wwc:text-sm">
				<span className="wwc:text-muted-foreground">DateTime: </span>
				<Timestamp date={date} format="datetime" />
			</div>
		</div>
	);
}
