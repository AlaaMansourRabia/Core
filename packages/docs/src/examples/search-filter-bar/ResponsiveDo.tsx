import {Button} from "@corensystem/coren-ui/button";
/**
 * Collapse filters on mobile.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";
import {SlidersHorizontal} from "lucide-react";

export function ResponsiveDo() {
	return (
		<SearchFilterBar responsive>
			<SearchInput placeholder="Search..." />
			<FilterGroup collapsible>
				<Button variant="outline" size="icon" className="wwc:md:hidden">
					<SlidersHorizontal className="wwc:h-4 wwc:w-4" />
				</Button>
				<div className="wwc:hidden wwc:md:flex wwc:gap-2">
					<Button variant="outline" size="sm">
						Status
					</Button>
					<Button variant="outline" size="sm">
						Category
					</Button>
				</div>
			</FilterGroup>
		</SearchFilterBar>
	);
}
