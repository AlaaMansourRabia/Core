/**
 * Avoid using select for 2-3 options (use RadioGroup instead).
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Label} from "@corensystem/coren-ui/label";

export function OptionsDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>Theme</Label>
			<Select>
				<SelectTrigger className="wwc:w-[200px]">
					<SelectValue placeholder="Select theme" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="light">Light</SelectItem>
					<SelectItem value="dark">Dark</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
