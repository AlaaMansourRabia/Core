/**
 * Default select with options.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function Default() {
	return (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Select a fruit" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="apple">Apple</SelectItem>
				<SelectItem value="banana">Banana</SelectItem>
				<SelectItem value="orange">Orange</SelectItem>
			</SelectContent>
		</Select>
	);
}
