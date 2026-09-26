/**
 * Avoid hiding search in sidebars.
 */
import {SearchFilterBar, SearchInput} from "@corensystem/coren-ui/search-filter-bar";

export function PlacementDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<div className="wwc:w-48 wwc:border wwc:rounded wwc:p-2">
				<SearchFilterBar orientation="vertical">
					<SearchInput placeholder="Search..." className="wwc:text-xs" />
				</SearchFilterBar>
			</div>
			<div className="wwc:flex-1 wwc:border wwc:rounded wwc:p-4 wwc:text-muted-foreground">Content area</div>
		</div>
	);
}
