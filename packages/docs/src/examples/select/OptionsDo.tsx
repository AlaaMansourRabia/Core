import {Label} from "@corensystem/coren-ui/label";
/**
 * Use select for 5+ options to keep the UI clean.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function OptionsDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>Department</Label>
			<Select>
				<SelectTrigger className="wwc:w-[200px]">
					<SelectValue placeholder="Select department" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="eng">Engineering</SelectItem>
					<SelectItem value="design">Design</SelectItem>
					<SelectItem value="product">Product</SelectItem>
					<SelectItem value="sales">Sales</SelectItem>
					<SelectItem value="marketing">Marketing</SelectItem>
					<SelectItem value="hr">Human Resources</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
