import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid ambiguous filter labels.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";

export function LabelsDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Filter>
				<FilterTrigger asChild>
					<Button variant="outline">Filter</Button>
				</FilterTrigger>
				<FilterContent>
					<FilterOption value="1">Option 1</FilterOption>
					<FilterOption value="2">Option 2</FilterOption>
				</FilterContent>
			</Filter>
		</div>
	);
}
