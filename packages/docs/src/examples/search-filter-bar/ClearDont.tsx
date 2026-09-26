import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid filters that are hard to clear.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";

export function ClearDont() {
	return (
		<SearchFilterBar>
			<SearchInput placeholder="Search..." defaultValue="query" />
			<FilterGroup>
				{/* No way to see or clear active filters */}
				<Button variant="outline" size="sm">
					Filters
				</Button>
			</FilterGroup>
		</SearchFilterBar>
	);
}
