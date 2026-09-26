import {Label} from "@corensystem/coren-ui/label";
/**
 * Pre-select a sensible default when appropriate.
 */
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@corensystem/coren-ui/select";

export function DefaultDo() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-1.5">
			<Label>Language</Label>
			<Select defaultValue="en">
				<SelectTrigger className="wwc:w-[200px]">
					<SelectValue />
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
