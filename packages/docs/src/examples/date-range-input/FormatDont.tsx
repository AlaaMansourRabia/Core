/**
 * Avoid ambiguous date formats.
 */
import {DateRangeInput} from "@corensystem/coren-ui/date-range-input";

export function FormatDont() {
	return <DateRangeInput format="M/d/yy" placeholder="1/5/24 - 1/31/24" />;
}
