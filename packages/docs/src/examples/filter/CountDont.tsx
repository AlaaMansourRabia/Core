import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid hiding active filter count.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";

export function CountDont() {
	return (
		<Filter>
			<FilterTrigger asChild>
				<Button variant="outline">Tags</Button>
			</FilterTrigger>
			<FilterContent>
				{/* User can't tell 3 filters are already active */}
				<FilterOption value="urgent">Urgent</FilterOption>
				<FilterOption value="bug">Bug</FilterOption>
				<FilterOption value="feature">Feature</FilterOption>
			</FilterContent>
		</Filter>
	);
}
