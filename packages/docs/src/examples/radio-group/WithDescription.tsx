/**
 * Radio group with descriptive labels.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function WithDescription() {
	return (
		<RadioGroup defaultValue="standard" className="wwc:gap-4">
			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<RadioGroupItem value="standard" id="radio-standard" className="wwc:mt-1" />
				<div>
					<Label htmlFor="radio-standard" className="wwc:font-medium">Standard shipping</Label>
					<p className="wwc:text-sm wwc:text-muted-foreground">5-7 business days</p>
				</div>
			</div>
			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<RadioGroupItem value="express" id="radio-express" className="wwc:mt-1" />
				<div>
					<Label htmlFor="radio-express" className="wwc:font-medium">Express shipping</Label>
					<p className="wwc:text-sm wwc:text-muted-foreground">2-3 business days</p>
				</div>
			</div>
			<div className="wwc:flex wwc:items-start wwc:gap-3">
				<RadioGroupItem value="overnight" id="radio-overnight" className="wwc:mt-1" />
				<div>
					<Label htmlFor="radio-overnight" className="wwc:font-medium">Overnight shipping</Label>
					<p className="wwc:text-sm wwc:text-muted-foreground">Next business day</p>
				</div>
			</div>
		</RadioGroup>
	);
}
