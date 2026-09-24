/**
 * Filter with multiple selections.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";
import {Button} from "@corensystem/coren-ui/button";

export function MultiSelect() {
	return (
		<Filter multiple>
			<FilterTrigger asChild>
				<Button variant="outline">Categories</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterOption value="electronics">Electronics</FilterOption>
				<FilterOption value="clothing">Clothing</FilterOption>
				<FilterOption value="books">Books</FilterOption>
				<FilterOption value="home">Home & Garden</FilterOption>
			</FilterContent>
		</Filter>
	);
}
