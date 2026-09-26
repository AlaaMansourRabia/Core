/**
 * Use radio buttons for mutually exclusive options.
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function MutualDo() {
	return (
		<fieldset className="wwc:space-y-3">
			<legend className="wwc:text-sm wwc:font-medium">Payment method</legend>
			<RadioGroup defaultValue="card">
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="card" id="radio-mut-card" />
					<Label htmlFor="radio-mut-card">Credit card</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="paypal" id="radio-mut-paypal" />
					<Label htmlFor="radio-mut-paypal">PayPal</Label>
				</div>
				<div className="wwc:flex wwc:items-center wwc:gap-2">
					<RadioGroupItem value="bank" id="radio-mut-bank" />
					<Label htmlFor="radio-mut-bank">Bank transfer</Label>
				</div>
			</RadioGroup>
		</fieldset>
	);
}
