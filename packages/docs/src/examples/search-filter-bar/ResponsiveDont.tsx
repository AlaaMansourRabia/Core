import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid cramming all filters on mobile.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";

export function ResponsiveDont() {
	return (
		<SearchFilterBar>
			<SearchInput placeholder="Search..." className="wwc:w-20" />
			<FilterGroup>
				<Button variant="outline" size="sm" className="wwc:text-xs">
					Status
				</Button>
				<Button variant="outline" size="sm" className="wwc:text-xs">
					Cat
				</Button>
				<Button variant="outline" size="sm" className="wwc:text-xs">
					Date
				</Button>
				<Button variant="outline" size="sm" className="wwc:text-xs">
					Type
				</Button>
			</FilterGroup>
		</SearchFilterBar>
	);
}
