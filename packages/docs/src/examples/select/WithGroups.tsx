/**
 * Select with grouped options.
 */
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function WithGroups() {
	return (
		<Select>
			<SelectTrigger className="wwc:w-[200px]">
				<SelectValue placeholder="Select timezone" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>North America</SelectLabel>
					<SelectItem value="est">Eastern Time</SelectItem>
					<SelectItem value="cst">Central Time</SelectItem>
					<SelectItem value="pst">Pacific Time</SelectItem>
				</SelectGroup>
				<SelectGroup>
					<SelectLabel>Europe</SelectLabel>
					<SelectItem value="gmt">GMT</SelectItem>
					<SelectItem value="cet">Central European</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
