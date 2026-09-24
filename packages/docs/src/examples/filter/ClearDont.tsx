/**
 * Avoid filters with no way to clear.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function ClearDont() {
	return (
		<Filter defaultValue={["active", "pending"]}>
			<FilterTrigger asChild>
				<Button variant="outline">Status (2)</Button>
			</FilterTrigger>
			<FilterContent>
				{/* No clear option - must deselect one by one */}
				<FilterOption value="active">Active</FilterOption>
				<FilterOption value="pending">Pending</FilterOption>
				<FilterOption value="completed">Completed</FilterOption>
			</FilterContent>
		</Filter>
	);
}
