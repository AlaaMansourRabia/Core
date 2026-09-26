/**
 * Basic filter component.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<Filter>
			<FilterTrigger asChild>
				<Button variant="outline">Status</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterOption value="active">Active</FilterOption>
				<FilterOption value="pending">Pending</FilterOption>
				<FilterOption value="completed">Completed</FilterOption>
			</FilterContent>
		</Filter>
	);
}
