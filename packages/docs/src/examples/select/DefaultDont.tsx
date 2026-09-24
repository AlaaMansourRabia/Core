/**
 * Avoid forcing users to select when a sensible default exists.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";
import {Label} from "@corensystem/coren-ui/label";

export function DefaultDont() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>Language</Label>
			<Select>
				<SelectTrigger className="wwc:w-[200px]">
					<SelectValue placeholder="You must select a language" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="en">English</SelectItem>
					<SelectItem value="es">Spanish</SelectItem>
					<SelectItem value="fr">French</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
