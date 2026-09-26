/**
 * Avoid using radio buttons for non-exclusive options (use Checkbox).
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function MutualDont() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">Interests</legend>
			<RadioGroup>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="music" id="radio-nomut-music" />
					<Label htmlFor="radio-nomut-music">Music</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="sports" id="radio-nomut-sports" />
					<Label htmlFor="radio-nomut-sports">Sports</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="reading" id="radio-nomut-reading" />
					<Label htmlFor="radio-nomut-reading">Reading</Label>
				</div>
			</RadioGroup>
		</fieldset>
	);
}
