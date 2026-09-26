/**
 * Search bar with multiple filter options.
 */
import {SearchFilterBar, SearchInput, FilterGroup} from "@corensystem/coren-ui/search-filter-bar";
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function WithMultipleFilters() {
	return (
		<SearchFilterBar>
			<SearchInput placeholder="Search users..." />
			<FilterGroup>
				<Filter>
					<FilterTrigger asChild>
						<Button variant="outline" size="sm">Role</Button>
					</FilterTrigger>
					<FilterContent>
						<FilterOption value="admin">Admin</FilterOption>
						<FilterOption value="user">User</FilterOption>
						<FilterOption value="guest">Guest</FilterOption>
					</FilterContent>
				</Filter>
				<Filter>
					<FilterTrigger asChild>
						<Button variant="outline" size="sm">Status</Button>
					</FilterTrigger>
					<FilterContent>
						<FilterOption value="active">Active</FilterOption>
						<FilterOption value="inactive">Inactive</FilterOption>
					</FilterContent>
				</Filter>
				<Filter>
					<FilterTrigger asChild>
						<Button variant="outline" size="sm">Department</Button>
					</FilterTrigger>
					<FilterContent>
						<FilterOption value="eng">Engineering</FilterOption>
						<FilterOption value="design">Design</FilterOption>
						<FilterOption value="sales">Sales</FilterOption>
					</FilterContent>
				</Filter>
			</FilterGroup>
		</SearchFilterBar>
	);
}
