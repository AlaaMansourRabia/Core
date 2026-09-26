/**
 * Provide clear way to reset filters.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption, FilterClear} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function ClearDo() {
	return (
		<Filter defaultValue={["active", "pending"]}>
			<FilterTrigger asChild>
				<Button variant="outline">Status (2)</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterClear>Clear all</FilterClear>
				<FilterOption value="active">Active</FilterOption>
				<FilterOption value="pending">Pending</FilterOption>
				<FilterOption value="completed">Completed</FilterOption>
			</FilterContent>
		</Filter>
	);
}
