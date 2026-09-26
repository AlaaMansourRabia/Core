/**
 * Use clear rule expressions.
 */
import {RuleRow, RuleRowCondition, RuleRowAction} from "@corensystem/coren-ui/rule-row";

export function ClarityDo() {
	return (
		<RuleRow>
			<RuleRowCondition>When status is "complete"</RuleRowCondition>
			<RuleRowAction>Send notification</RuleRowAction>
		</RuleRow>
	);
}
