/**
 * Week selector with initial value.
 */
import {WeekSelector} from "@corensystem/coren-ui/week-selector";

export function WithValue() {
	return <WeekSelector value={new Date()} />;
}
