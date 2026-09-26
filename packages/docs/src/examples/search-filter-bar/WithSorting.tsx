import {Button} from "@corensystem/coren-ui/button";
/**
 * Search bar with sort options.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from "@corensystem/coren-ui/select";

export function WithSorting() {
	return (
		<SearchFilterBar>
			<SearchInput placeholder="Search products..." />
			<FilterGroup>
				<Button variant="outline" size="sm">
					Category
				</Button>
				<Select defaultValue="newest">
					<SelectTrigger className="wwc:w-[140px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest</SelectItem>
						<SelectItem value="oldest">Oldest</SelectItem>
						<SelectItem value="name">Name A-Z</SelectItem>
						<SelectItem value="price">Price</SelectItem>
					</SelectContent>
				</Select>
			</FilterGroup>
		</SearchFilterBar>
	);
}
