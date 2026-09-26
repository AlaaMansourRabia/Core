import {Badge} from "@corensystem/coren-ui/badge";
import {Button} from "@corensystem/coren-ui/button";
/**
 * Show active filter count.
 */
import {Filter, FilterTrigger, FilterContent, FilterOption} from "@corensystem/coren-ui/filter";

export function CountDo() {
	return (
		<Filter>
			<FilterTrigger asChild>
				<Button variant="outline" className="wwc:gap-2">
					Tags
					<Badge variant="secondary">3</Badge>
				</Button>
			</FilterTrigger>
			<FilterContent>
				<FilterOption value="urgent">Urgent</FilterOption>
				<FilterOption value="bug">Bug</FilterOption>
				<FilterOption value="feature">Feature</FilterOption>
			</FilterContent>
		</Filter>
	);
}
