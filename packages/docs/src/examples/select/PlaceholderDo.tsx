/**
 * Use descriptive placeholders that indicate what to select.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Label} from "@corensystem/coren-ui/label";

export function PlaceholderDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>Priority</Label>
			<Select>
				<SelectTrigger className="wwc:w-[200px]">
					<SelectValue placeholder="Select priority level" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="low">Low</SelectItem>
					<SelectItem value="medium">Medium</SelectItem>
					<SelectItem value="high">High</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
