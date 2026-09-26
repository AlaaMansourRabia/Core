import {Button} from "@corensystem/coren-ui/button";
/**
 * Use clear, descriptive filter labels.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";

export function LabelsDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<Filter>
				<FilterTrigger asChild>
					<Button variant="outline">Status: All</Button>
				</FilterTrigger>
				<FilterContent>
					<FilterOption value="all">All Statuses</FilterOption>
					<FilterOption value="active">Active</FilterOption>
					<FilterOption value="archived">Archived</FilterOption>
				</FilterContent>
			</Filter>
		</div>
	);
}
