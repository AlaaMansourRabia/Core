import {Button} from "@corensystem/coren-ui/button";
/**
 * Filter with search input.
 */
import {Filter, FilterTrigger, FilterContent, FilterSearch, FilterOption} from "@corensystem/coren-ui/filter";

export function WithSearch() {
	return (
		<Filter>
			<FilterTrigger asChild>
				<Button variant="outline">Country</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterSearch placeholder="Search countries..." />
				<FilterOption value="us">United States</FilterOption>
				<FilterOption value="uk">United Kingdom</FilterOption>
				<FilterOption value="ca">Canada</FilterOption>
				<FilterOption value="au">Australia</FilterOption>
				<FilterOption value="de">Germany</FilterOption>
			</FilterContent>
		</Filter>
	);
}
