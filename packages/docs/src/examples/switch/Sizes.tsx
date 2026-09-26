import {Label} from "@corensystem/coren-ui/label";
/**
 * Available switch sizes.
 */
import {Switch} from "@corensystem/coren-ui/switch";

export function Sizes() {
	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-size-sm" size="sm" />
				<Label htmlFor="switch-size-sm">Small</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<Switch id="switch-size-default" />
				<Label htmlFor="switch-size-default">Default</Label>
			</div>
		</div>
	);
}
