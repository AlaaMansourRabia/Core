/**
 * Basic search and filter bar.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function Default() {
	return (
		<SearchFilterBar>
			<SearchInput placeholder="Search..." />
			<FilterGroup>
				<Filter>
					<FilterTrigger asChild>
						<Button variant="outline" size="sm">Status</Button>
					</FilterTrigger>
					<FilterContent>
						<FilterOption value="active">Active</FilterOption>
						<FilterOption value="pending">Pending</FilterOption>
					</FilterContent>
				</Filter>
			</FilterGroup>
		</SearchFilterBar>
	);
}
