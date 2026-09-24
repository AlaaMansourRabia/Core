/**
 * Place search prominently above content.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";
import {Button} from "@corensystem/coren-ui/button";

export function PlacementDo() {
	return (
		<div className="wwc:space-y-4">
			<SearchFilterBar>
				<SearchInput placeholder="Search..." className="wwc:max-w-md" />
				<FilterGroup>
					<Button variant="outline" size="sm">Filters</Button>
				</FilterGroup>
			</SearchFilterBar>
			<div className="wwc:border wwc:rounded wwc:p-4 wwc:text-muted-foreground">
				Content area
			</div>
		</div>
	);
}
