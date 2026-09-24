/**
 * Filter with grouped options.
 */
import {Filter, FilterTrigger, FilterContent, FilterGroup, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function WithGroups() {
	return (
		<Filter>
			<FilterTrigger asChild>
				<Button variant="outline">Assignee</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterGroup label="Engineering">
					<FilterOption value="alice">Alice Chen</FilterOption>
					<FilterOption value="bob">Bob Smith</FilterOption>
				</FilterGroup>
				<FilterGroup label="Design">
					<FilterOption value="carol">Carol White</FilterOption>
					<FilterOption value="dan">Dan Brown</FilterOption>
				</FilterGroup>
			</FilterContent>
		</Filter>
	);
}
