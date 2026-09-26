/**
 * Search bar showing active filter tags.
 */
import {SearchFilterBar, SearchInput, FilterGroup, ActiveFilters, ActiveFilterTag} from "@corensystem/coren-ui/search-filter-bar";
import {Button} from "@corensystem/coren-ui/button";

export function WithActiveFilters() {
	return (
		<div className="wwc:space-y-2">
			<SearchFilterBar>
				<SearchInput placeholder="Search..." defaultValue="report" />
				<FilterGroup>
					<Button variant="outline" size="sm">Filters</Button>
				</FilterGroup>
			</SearchFilterBar>
			<ActiveFilters>
				<ActiveFilterTag onRemove={() => {}}>Status: Active</ActiveFilterTag>
				<ActiveFilterTag onRemove={() => {}}>Type: Document</ActiveFilterTag>
				<Button variant="ghost" size="sm">Clear all</Button>
			</ActiveFilters>
		</div>
	);
}
