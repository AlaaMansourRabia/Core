/**
 * Week selector with date range.
 */
import {WeekSelector} from "@corensystem/coren-ui/week-selector";

export function WithRange() {
	return <WeekSelector minDate={new Date(2024, 0, 1)} maxDate={new Date(2024, 11, 31)} />;
}
