/**
 * Select with accessible label.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Label} from "@corensystem/coren-ui/label";

export function WithLabel() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label htmlFor="select-country">Country</Label>
			<Select>
				<SelectTrigger id="select-country" className="wwc:w-[200px]">
					<SelectValue placeholder="Select country" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="us">United States</SelectItem>
					<SelectItem value="uk">United Kingdom</SelectItem>
					<SelectItem value="ca">Canada</SelectItem>
					<SelectItem value="au">Australia</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
