/**
 * Make clearing filters easy.
 */
import {SearchFilterBar, SearchInput, FilterGroup, ActiveFilters, ActiveFilterTag} from "@corensystem/coren-ui/search-filter-bar";
import {Button} from "@corensystem/coren-ui/button";
import {X} from "lucide-react";

export function ClearDo() {
	return (
		<div className="wwc:space-y-2">
			<SearchFilterBar>
				<SearchInput placeholder="Search..." />
				<FilterGroup>
					<Button variant="outline" size="sm">
						Filters (3)
						<X className="wwc:ml-1 wwc:h-3 wwc:w-3" />
					</Button>
				</FilterGroup>
			</SearchFilterBar>
			<ActiveFilters>
				<ActiveFilterTag onRemove={() => {}}>Category: Tech</ActiveFilterTag>
				<Button variant="link" size="sm">Clear all filters</Button>
			</ActiveFilters>
		</div>
	);
}
