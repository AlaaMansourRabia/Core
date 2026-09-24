/**
 * Avoid long radio lists (use Select for 6+ options).
 */
import {RadioGroup, RadioGroupItem} from "@corensystem/coren-ui/radio-group";
import {Label} from "@corensystem/coren-ui/label";

export function CountDont() {
	const months = ["January", "February", "March", "April", "May", "June"];

	return (
		<fieldset className="wwc:space-y-2">
			<legend className="wwc:text-sm wwc:font-medium">Month</legend>
			<RadioGroup>
				{months.map((month) => (
					<div key={month} className="wwc:flex wwc:items-center wwc:gap-2">
						<RadioGroupItem value={month.toLowerCase()} id={`radio-month-${month}`} />
						<Label htmlFor={`radio-month-${month}`}>{month}</Label>
					</div>
				))}
			</RadioGroup>
		</fieldset>
	);
}
