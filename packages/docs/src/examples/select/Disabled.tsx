/**
 * Disabled select state.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function Disabled() {
	return (
		<Select disabled>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Cannot select" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="a">Option A</SelectItem>
				<SelectItem value="b">Option B</SelectItem>
			</SelectContent>
		</Select>
	);
}
