import {Label} from "@corensystem/coren-ui/label";
/**
 * Default switch with label.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function Default() {
	return (
		<div className="wwc:flex wwc:items-center wwc:gap-2">
			<Switch id="switch-default" />
			<Label htmlFor="switch-default">Airplane mode</Label>
		</div>
	);
}
