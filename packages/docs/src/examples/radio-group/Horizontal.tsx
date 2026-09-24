/**
 * Horizontal layout for compact option sets.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function Horizontal() {
	return (
		<RadioGroup defaultValue="sm" className="wwc:flex wwc:gap-4">
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="sm" id="radio-h-sm" />
				<Label htmlFor="radio-h-sm">Small</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="md" id="radio-h-md" />
				<Label htmlFor="radio-h-md">Medium</Label>
			</div>
			<div className="wwc:flex wwc:items-center wwc:gap-2">
				<RadioGroupItem value="lg" id="radio-h-lg" />
				<Label htmlFor="radio-h-lg">Large</Label>
			</div>
		</RadioGroup>
	);
}
